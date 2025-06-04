import { create } from 'zustand';
import axios from 'axios';
import { BookOpen, Briefcase, Heart, Zap, User } from 'lucide-react-native';
import { API_BASE_URL } from '@env'; // API_BASE_URL should be configured to point to Firebase Cloud Functions

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
// import 'firebase/compat/firestore'; // Uncomment if you use Firestore directly from client

// IMPORTANT: Initialize Firebase with your project config. This is the central Firebase initialization for the app.
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app(); // if already initialized, use that one
}

// Helper to map icon names to components
const iconMap = {
  BookOpen,
  Briefcase,
  Heart,
  Zap,
  User
};

// Categories can remain static as they are more like app configuration
const categories = {
  personnel: { icon: User },
  études: { icon: BookOpen },
  travail: { icon: Briefcase },
  famille: { icon: Heart },
  santé: { icon: Zap }
};

const useStore = create((set, get) => ({
  // --- State variables ---
  // Firebase managed auth state
  isAuthenticated: false,
  user: null, // Firebase auth user object { email, name (displayName), id (uid) } - primarily Firebase Auth info
  detailedUserProfile: null, // Will store { name, email, bio, avatarUrl, uid, createdAt } from Firestore

  // Original app state variables
  currentView: 'dashboard',
  userProfile: 'student', 
  reminders: [],
  appointments: [],
  friends: [],
  challenges: [],
  communityTemplates: [],
  aiSuggestions: [],
  notifications: 5, // Example, keep as is
  streak: 12,       // Example, keep as is
  activeTab: 'reminders',
  profileTemplates: {}, 
  categories: categories,

  // --- Authentication Actions (Firebase) ---
  register: async (email, password, name = 'New User') => {
    try {
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
      const firebaseUser = userCredential.user;
      if (firebaseUser) {
        await firebaseUser.updateProfile({ displayName: name });
        // Optionally, create a user profile document in Firestore here
        // Example: await axios.post(`${API_BASE_URL}/users`, { uid: firebaseUser.uid, email: firebaseUser.email, name: name });
        set({
          isAuthenticated: true,
          // user object from firebaseUser will be set by checkAuthState listener or login
          // No need to set user here directly if checkAuthState handles it comprehensively
        });
        // Call initializeProfileData which will fetch the detailed profile
        // The backend registerUser function is already creating the Firestore profile.
        await get().initializeProfileData();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Firebase registration error:", error.code, error.message);
      return false;
    }
  },

  login: async (email, password) => {
    try {
      const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
      const firebaseUser = userCredential.user;
      if (firebaseUser) {
        set({
          isAuthenticated: true,
          user: { email: firebaseUser.email, name: firebaseUser.displayName || 'User', id: firebaseUser.uid }
        });
        await get().initializeProfileData(); // This will call fetchDetailedUserProfile
        return true;
      }
      return false;
    } catch (error) {
      console.error("Firebase login error:", error.code, error.message);
      return false;
    }
  },

  logout: async () => {
    try {
      await firebase.auth().signOut();
      set({ 
        isAuthenticated: false,
        user: null,
        detailedUserProfile: null, // Clear detailed profile on logout
        // currentView: 'login', // Decide if view should change, or rely on app logic
        // Clear user-specific data, keep general data if any
        reminders: [],
        appointments: [],
        friends: [],
        challenges: [],
        // communityTemplates: [], // These might be public, decide
        // aiSuggestions: [], // These might be public, decide
      });
      await get().initializeProfileData(); // Re-initialize, will load public data or clear
    } catch (error) {
      console.error("Firebase logout error:", error);
    }
  },

  checkAuthState: () => { // To be called from App.js or similar entry point
    return firebase.auth().onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        set({
          isAuthenticated: true,
          user: { email: firebaseUser.email, name: firebaseUser.displayName || 'User', id: firebaseUser.uid }
        });
      } else {
        set({ isAuthenticated: false, user: null });
      }
      // Always initialize profile data after auth state is known
      // This ensures data is loaded/cleared appropriately.
      await get().initializeProfileData();
    });
  },

  // --- Original App Actions (Adapted for Firebase Auth) ---
  setCurrentView: (view) => set({ currentView: view }),

  setUserProfile: async (profileId) => {
    set({ userProfile: profileId });
    // Only initialize if authenticated, otherwise initializeProfileData will handle public/empty state
    if (get().isAuthenticated) {
      await get().initializeProfileData(); 
    }
  },

  setReminders: (reminders) => set({ reminders }),

  toggleReminderCompleted: async (reminderId) => {
    const { user, reminders } = get();
    if (!user) return console.error("User not authenticated for toggleReminderCompleted");

    const reminder = reminders.find(r => r.id === reminderId);
    if (!reminder) return console.error("Reminder not found for toggle");

    const updatedCompletedStatus = !reminder.completed;

    try {
      const idToken = await firebase.auth().currentUser.getIdToken();
      const headers = { Authorization: `Bearer ${idToken}` };

      // Backend updateReminder expects ID in path.
      const response = await axios.patch(`${API_BASE_URL}/updateReminder/${reminderId}`,
        { completed: updatedCompletedStatus },
        { headers }
      );

      if (response.status === 200) {
        set((state) => ({
          reminders: state.reminders.map(r =>
            r.id === reminderId ? { ...r, ...response.data } : r
          )
        }));
      } else {
        console.error("Failed to update reminder on server:", response);
      }
    } catch (error) {
      console.error("Error updating reminder:", error.response ? error.response.data : error.message);
    }
  },
  
  initializeProfileData: async () => {
    const { isAuthenticated, user, userProfile, categories } = get(); // Added categories for iconMap fallback

    // Ensure iconMap is available, falling back to categories if direct icons aren't mapped
    // This assumes iconMap is defined in the same scope or passed appropriately.
    // For this refactor, we'll rely on the global iconMap if present, or use category icons.
    const currentIconMap = typeof iconMap !== 'undefined' ? iconMap :
      Object.entries(categories).reduce((acc, [key, cat]) => {
        acc[cat.iconName || key] = cat.icon; // Assuming category might have iconName or key maps to icon component
        return acc;
      }, {});

    // Fetch detailed user profile first if authenticated
    if (isAuthenticated && user) {
      await get().fetchDetailedUserProfile();
    }


    // Always fetch profileTemplates as they might be needed for login screen or public parts.
    try {
      const profileTemplatesRes = await axios.get(`${API_BASE_URL}/getProfileTemplates`);
      const fetchedProfileTemplates = profileTemplatesRes.data;
      const processedProfileTemplates = Object.entries(fetchedProfileTemplates).reduce((acc, [key, profile]) => {
        acc[key] = { ...profile, icon: currentIconMap[profile.iconName] || User }; // User is a fallback
        return acc;
      }, {});
      set({ profileTemplates: processedProfileTemplates });
    } catch (error) {
      console.error("Failed to fetch profile templates:", error);
      set({ profileTemplates: {} });
    }

    if (!isAuthenticated || !user) {
      set({
        reminders: [], appointments: [], friends: [],
        challenges: get().challenges || [], // Preserve public challenges if already fetched
        communityTemplates: get().communityTemplates || [], // Preserve public
        aiSuggestions: get().aiSuggestions || [], // Preserve public
      });
      try {
        // Fetch public data only if not already present or needs refresh
        if (!get().challenges.length || !get().communityTemplates.length || !get().aiSuggestions.length) {
          const [challengesRes, communityTemplatesRes, aiSuggestionsRes] = await Promise.all([
            axios.get(`${API_BASE_URL}/getChallenges`),
            axios.get(`${API_BASE_URL}/getCommunityTemplates`),
            axios.get(`${API_BASE_URL}/getAISuggestions`),
          ]);
          set({
            challenges: challengesRes.data,
            communityTemplates: communityTemplatesRes.data,
            aiSuggestions: aiSuggestionsRes.data,
          });
        }
      } catch (publicError) {
        console.error("Failed to fetch one or more public data endpoints (challenges, community templates, AI suggestions):", publicError.message);
        // Decide if we should clear them or keep stale if error. Clearing for now.
         set({ challenges: [], communityTemplates: [], aiSuggestions: [] });
      }
      return;
    }

    // User is authenticated, fetch all user-specific and public data
    try {
      const firebaseCurrentUser = firebase.auth().currentUser;
      if (!firebaseCurrentUser) {
        console.error("initializeProfileData: Firebase currentUser not available for authenticated fetch.");
        // Potentially clear all user data here as well or trigger logout
        return;
      }
      const idToken = await firebaseCurrentUser.getIdToken();
      const headers = { Authorization: `Bearer ${idToken}` };
      const db = firebase.firestore(); // For client-side Firestore calls if any remain

      const [
        remindersRes,
        appointmentsRes,
        friendsRes,
        challengesRes, // Public challenges list
        communityTemplatesRes,
        aiSuggestionsRes,
        userJoinedChallengesSnap // Firestore direct call for user's joined challenges
      ] = await Promise.all([
        axios.get(`${API_BASE_URL}/getReminders?profileId=${userProfile}`, { headers }),
        axios.get(`${API_BASE_URL}/getAppointments`, { headers }),
        axios.get(`${API_BASE_URL}/getFriends`, { headers }),
        axios.get(`${API_BASE_URL}/getChallenges`),
        axios.get(`${API_BASE_URL}/getCommunityTemplates`),
        axios.get(`${API_BASE_URL}/getAISuggestions`),
        db.collection('users').doc(user.id).collection('joinedChallenges').get() // Direct Firestore SDK call
      ]);

      const processedReminders = remindersRes.data.map(r => ({
        ...r,
        streak: r.streak !== undefined ? r.streak : (r.isTemplate ? 0 : Math.floor(Math.random() * 10) + 1),
        completed: r.completed !== undefined ? r.completed : (r.isTemplate ? false : Math.random() > 0.7),
      }));

      const userJoinedChallengeIds = {};
      userJoinedChallengesSnap.forEach(doc => { userJoinedChallengeIds[doc.id] = doc.data(); });

      const processedChallenges = challengesRes.data.map(challenge => ({
          ...challenge,
          joined: !!userJoinedChallengeIds[challenge.id],
          progress: userJoinedChallengeIds[challenge.id]?.progress || 0,
          joinedAt: userJoinedChallengeIds[challenge.id]?.joinedAt || null,
      }));

      set({
        reminders: processedReminders,
        appointments: appointmentsRes.data,
        friends: friendsRes.data,
        challenges: processedChallenges,
        communityTemplates: communityTemplatesRes.data,
        aiSuggestions: aiSuggestionsRes.data,
      });

    } catch (error) {
      console.error("Failed to fetch data for authenticated user:", error.message, error.response ? error.response.data : '');
      set({ 
        reminders: [], appointments: [], friends: [],
        challenges: get().challenges.map(c => ({...c, joined: false, progress: 0})) || [], // Reset user specific parts
        communityTemplates: get().communityTemplates || [],
        aiSuggestions: get().aiSuggestions || [],
        profileTemplates: get().profileTemplates || {} 
      });
    }
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  // --- User Profile Actions ---
  fetchDetailedUserProfile: async () => {
    const { user } = get();
    if (!user || !user.id) {
      // console.log("fetchDetailedUserProfile: User not available or user ID missing."); // Already logged by caller or auth state
      return set({ detailedUserProfile: null });
    }

    const firebaseCurrentUser = firebase.auth().currentUser;
    if (!firebaseCurrentUser) {
      console.error("fetchDetailedUserProfile: Firebase currentUser not available even though user object exists in state.");
      // This case might indicate an inconsistent state, potentially clear user or trigger logout
      return set({ detailedUserProfile: null, isAuthenticated: false, user: null });
    }

    try {
      const idToken = await firebaseCurrentUser.getIdToken();
      const response = await axios.get(`${API_BASE_URL}/getUserProfile`, { headers: { Authorization: `Bearer ${idToken}` } });

      if (response.data) {
        set({ detailedUserProfile: response.data });
        // Optionally update Firebase Auth displayName if Firestore name is canonical and different
        // This is commented out as per original logic to avoid potential loops.
        // if (response.data.name && firebaseCurrentUser.displayName !== response.data.name) {
        //   await firebaseCurrentUser.updateProfile({ displayName: response.data.name });
        //   set(state => ({ user: { ...state.user, name: response.data.name } }));
        // }
      } else {
        // This case might not be hit if server returns 404 for not found, which is caught by catch block.
        // If server returns 200 with empty data, this will set profile to null.
        set({ detailedUserProfile: null });
      }
    } catch (error) {
      console.error("Error fetching detailed user profile:", error.message, error.response ? error.response.data : '');
      if (error.response && error.response.status === 404) {
         console.log("Detailed user profile not found (404). Setting detailedUserProfile to null.");
      }
      set({ detailedUserProfile: null });
    }
  },

  updateUserProfile: async (profileData) => {
    const { user } = get();
    if (!user || !user.id) {
      console.error("User not authenticated or user ID missing for updateUserProfile.");
      throw new Error("User not authenticated. Cannot update profile.");
    }

    const firebaseCurrentUser = firebase.auth().currentUser;
    if (!firebaseCurrentUser) {
      console.error("Firebase currentUser not available for updateUserProfile. This may indicate a session issue.");
      throw new Error("User session error. Cannot update profile.");
    }

    try {
      const idToken = await firebaseCurrentUser.getIdToken();
      const response = await axios.patch(`${API_BASE_URL}/updateUserProfile`, profileData, { headers: { Authorization: `Bearer ${idToken}` } });

      if (response.data) {
        set({ detailedUserProfile: response.data });
        // If name was updated, also update Firebase Auth displayName for consistency
        if (profileData.name && firebaseCurrentUser.displayName !== profileData.name) {
          await firebaseCurrentUser.updateProfile({ displayName: profileData.name });
          // Update the 'user' state in Zustand to reflect this change immediately
          set(state => ({
            user: { ...state.user, name: profileData.name, displayName: profileData.name }
          }));
        }
        return response.data; // Return updated profile
      } else {
        throw new Error("No data returned from server on profile update.");
      }
    } catch (error) {
      console.error("Error updating user profile:", error.response ? error.response.data : error.message);
      throw error; // Re-throw to be caught by UI
    }
  },

  // --- Reminder Actions ---
  addReminderStore: async (reminderData) => { // Renamed to avoid conflict if an old addReminder exists
    const { user } = get();
    const firebaseCurrentUser = firebase.auth().currentUser; // Re-check currentUser before sensitive operations
    if (!user || !firebaseCurrentUser) {
      console.error("User not authenticated for addReminder. Firebase user:", firebaseCurrentUser, "Zustand user:", user);
      return null;
    }
    try {
      const idToken = await firebaseCurrentUser.getIdToken();
      const headers = { Authorization: `Bearer ${idToken}` };
      const response = await axios.post(`${API_BASE_URL}/addReminder`, reminderData, { headers });
      if (response.status === 201 && response.data) {
        set(state => ({ reminders: [...state.reminders, response.data] }));
        return response.data;
      }
      console.error("Error adding reminder: Invalid response from server", response.status, response.data);
      return null;
    } catch (error) {
      console.error("Error adding reminder:", error.message, error.response ? error.response.data : '');
      return null;
    }
  },
  deleteReminderStore: async (reminderId) => {
    const firebaseCurrentUser = firebase.auth().currentUser;
    if (!get().user || !firebaseCurrentUser) {
      console.error("User not authenticated for deleteReminder.");
      return;
    }
    try {
      const idToken = await firebaseCurrentUser.getIdToken();
      const headers = { Authorization: `Bearer ${idToken}` };
      await axios.delete(`${API_BASE_URL}/deleteReminder/${reminderId}`, { headers });
      set(state => ({ reminders: state.reminders.filter(r => r.id !== reminderId) }));
    } catch (error) {
      console.error("Error deleting reminder:", error.message, error.response ? error.response.data : '');
    }
  },

  // --- Appointment Actions ---
  addAppointmentStore: async (appointmentData) => {
    const firebaseCurrentUser = firebase.auth().currentUser;
    if (!get().user || !firebaseCurrentUser) {
      console.error("User not authenticated for addAppointment.");
      return null;
    }
    try {
      const idToken = await firebaseCurrentUser.getIdToken();
      const headers = { Authorization: `Bearer ${idToken}` };
      const response = await axios.post(`${API_BASE_URL}/addAppointment`, appointmentData, { headers });
      if (response.status === 201 && response.data) {
        set(state => ({ appointments: [...state.appointments, response.data] }));
        return response.data;
      }
      console.error("Error adding appointment: Invalid response from server", response.status, response.data);
      return null;
    } catch (error) {
      console.error("Error adding appointment:", error.message, error.response ? error.response.data : '');
      return null;
    }
  },
  updateAppointmentStore: async (appointmentId, dataToUpdate) => {
    const firebaseCurrentUser = firebase.auth().currentUser;
    if (!get().user || !firebaseCurrentUser) {
      console.error("User not authenticated for updateAppointment.");
      return null;
    }
    try {
      const idToken = await firebaseCurrentUser.getIdToken();
      const headers = { Authorization: `Bearer ${idToken}` };
      const response = await axios.patch(`${API_BASE_URL}/updateAppointment/${appointmentId}`, dataToUpdate, { headers });
      if (response.status === 200 && response.data) {
        set(state => ({
          appointments: state.appointments.map(a => a.id === appointmentId ? response.data : a)
        }));
        return response.data;
      }
      console.error("Error updating appointment: Invalid response from server", response.status, response.data);
      return null;
    } catch (error) {
      console.error("Error updating appointment:", error.message, error.response ? error.response.data : '');
      return null;
    }
  },
  deleteAppointmentStore: async (appointmentId) => {
    const firebaseCurrentUser = firebase.auth().currentUser;
    if (!get().user || !firebaseCurrentUser) {
      console.error("User not authenticated for deleteAppointment.");
      return;
    }
    try {
      const idToken = await firebaseCurrentUser.getIdToken();
      const headers = { Authorization: `Bearer ${idToken}` };
      await axios.delete(`${API_BASE_URL}/deleteAppointment/${appointmentId}`, { headers });
      set(state => ({ appointments: state.appointments.filter(a => a.id !== appointmentId) }));
    } catch (error) {
      console.error("Error deleting appointment:", error.message, error.response ? error.response.data : '');
    }
  },

  // --- Friend Actions ---
  addFriendStore: async (friendUid) => {
    const firebaseCurrentUser = firebase.auth().currentUser;
    if (!get().user || !firebaseCurrentUser) {
      console.error("User not authenticated for addFriend.");
      return;
    }
    try {
      const idToken = await firebaseCurrentUser.getIdToken();
      const headers = { Authorization: `Bearer ${idToken}` };
      await axios.post(`${API_BASE_URL}/addFriend`, { friendUid }, { headers });
      get().initializeProfileData(); // Refresh data after adding friend
    } catch (error) {
      console.error("Error adding friend:", error.message, error.response ? error.response.data : '');
    }
  },
  removeFriendStore: async (friendUid) => {
    const firebaseCurrentUser = firebase.auth().currentUser;
    if (!get().user || !firebaseCurrentUser) {
      console.error("User not authenticated for removeFriend.");
      return;
    }
    try {
      const idToken = await firebaseCurrentUser.getIdToken();
      const headers = { Authorization: `Bearer ${idToken}` };
      await axios.delete(`${API_BASE_URL}/removeFriend/${friendUid}`, { headers });
      get().initializeProfileData(); // Refresh data after removing friend
    } catch (error) {
      console.error("Error removing friend:", error.message, error.response ? error.response.data : '');
    }
  },

  // --- Challenge Actions ---
  joinChallengeStore: async (challengeId) => {
    const firebaseCurrentUser = firebase.auth().currentUser;
    if (!get().user || !firebaseCurrentUser) {
      console.error("User not authenticated for joinChallenge.");
      return;
    }
    try {
      const idToken = await firebaseCurrentUser.getIdToken();
      const headers = { Authorization: `Bearer ${idToken}` };
      // Assuming backend returns the updated challenge or confirms success
      const response = await axios.post(`${API_BASE_URL}/joinChallenge`, { challengeId }, { headers });
      if (response.status === 200) { // Or 201, depending on backend
        // Optimistically update UI, or call initializeProfileData to refetch all challenge states
        set(state => ({
          challenges: state.challenges.map(c => c.id === challengeId ? { ...c, joined: true, progress: response.data?.progress || 0 } : c)
        }));
      } else {
        console.error("Failed to join challenge, server responded with status:", response.status);
      }
    } catch (error) {
      console.error("Error joining challenge:", error.message, error.response ? error.response.data : '');
    }
  },
  leaveChallengeStore: async (challengeId) => {
    const firebaseCurrentUser = firebase.auth().currentUser;
    if (!get().user || !firebaseCurrentUser) {
      console.error("User not authenticated for leaveChallenge.");
      return;
    }
    try {
      const idToken = await firebaseCurrentUser.getIdToken();
      const headers = { Authorization: `Bearer ${idToken}` };
      const response = await axios.post(`${API_BASE_URL}/leaveChallenge`, { challengeId }, { headers });
       if (response.status === 200) {
        // Optimistically update UI or refetch
        set(state => ({
          challenges: state.challenges.map(c => c.id === challengeId ? { ...c, joined: false, progress: 0 } : c)
        }));
      } else {
        console.error("Failed to leave challenge, server responded with status:", response.status);
      }
    } catch (error) {
      console.error("Error leaving challenge:", error.message, error.response ? error.response.data : '');
    }
  },
}));

export default useStore;
