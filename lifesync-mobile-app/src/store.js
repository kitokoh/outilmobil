import { create } from 'zustand';
import axios from 'axios';
import { BookOpen, Briefcase, Heart, Zap, User } from 'lucide-react-native';
import { API_BASE_URL } from '@env'; // Import API_BASE_URL from react-native-dotenv

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
// import 'firebase/compat/firestore'; // Uncomment if you use Firestore directly from client

// IMPORTANT: Initialize Firebase with your project config
// const firebaseConfig = {
//   apiKey: "YOUR_API_KEY",
//   authDomain: "YOUR_AUTH_DOMAIN",
//   projectId: "YOUR_PROJECT_ID",
//   storageBucket: "YOUR_STORAGE_BUCKET",
//   messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
//   appId: "YOUR_APP_ID"
// };
// if (!firebase.apps.length) {
//   firebase.initializeApp(firebaseConfig);
// } else {
//   firebase.app(); // if already initialized, use that one
// }

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
  tasks: [], // Renamed from reminders
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
        // The backend registerUser (Auth onCreate trigger) now handles Firestore profile creation.
        // No need for a separate API call here.
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
        tasks: [], // Renamed from reminders
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

  setTasks: (tasks) => set({ tasks }), // Renamed from setReminders

  toggleTaskCompleted: async (taskId) => { // Renamed from toggleReminderCompleted, param reminderId to taskId
    const { user, tasks } = get(); // Renamed from reminders
    if (!user) return console.error("User not authenticated for toggleTaskCompleted");

    const task = tasks.find(t => t.id === taskId); // Renamed from reminder
    if (!task) return console.error("Task not found for toggle"); // Renamed from reminder

    const updatedCompletedStatus = !task.completed; // Renamed from reminder

    try {
      const idToken = await firebase.auth().currentUser.getIdToken();
      const headers = { Authorization: `Bearer ${idToken}` };

      // Backend updateTask expects ID in path.
      const response = await axios.patch(`${API_BASE_URL}/updateTask/${taskId}`, // Renamed endpoint, param taskId
        { isCompleted: updatedCompletedStatus }, // Field name based on backend `updateTask`
        { headers }
      );

      if (response.status === 200) {
        set((state) => ({
          tasks: state.tasks.map(t => // Renamed from reminders
            t.id === taskId ? { ...t, ...response.data } : t // Renamed from reminderId, r to t
          )
        }));
      } else {
        console.error("Failed to update task on server:", response); // Renamed from reminder
      }
    } catch (error) {
      console.error("Error updating task:", error.response ? error.response.data : error.message); // Renamed from reminder
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
        tasks: [], appointments: [], friends: [], // Renamed from reminders
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
        console.error("Failed to fetch public data:", publicError);
        // Decide if we should clear them or keep stale if error
         set({ challenges: [], communityTemplates: [], aiSuggestions: [] });
      }
      return;
    }

    // User is authenticated, fetch all data
    try {
      const idToken = await firebase.auth().currentUser.getIdToken();
      const headers = { Authorization: `Bearer ${idToken}` };
      const db = firebase.firestore(); // For client-side Firestore calls if any remain

      const [
        tasksRes, // Renamed from remindersRes
        appointmentsRes,
        friendsRes,
        challengesRes, // Public challenges list
        communityTemplatesRes,
        aiSuggestionsRes,
        userJoinedChallengesSnap // Firestore direct call for user's joined challenges
      ] = await Promise.all([
        axios.get(`${API_BASE_URL}/getTasks`, { headers }), // Renamed endpoint, removed profileId
        axios.get(`${API_BASE_URL}/getAppointments`, { headers }),
        axios.get(`${API_BASE_URL}/getFriends`, { headers }),
        axios.get(`${API_BASE_URL}/getChallenges`),
        axios.get(`${API_BASE_URL}/getCommunityTemplates`),
        axios.get(`${API_BASE_URL}/getAISuggestions`),
        db.collection('users').doc(user.id).collection('joinedChallenges').get() // Direct Firestore SDK call
      ]);

      // Backend now returns tasks with fields like isCompleted, dueDate.
      // Remove random generation of streak and completed.
      // Assume backend provides necessary fields as per schema.
      const processedTasks = tasksRes.data.map(t => ({ // Renamed from processedReminders, r to t
        ...t,
        // If backend does not send these, and they are purely for UI, initialize them.
        // For Phase 1, tasks schema has isCompleted, completedAt, dueDate.
        // Streak is not part of Phase 1 task model.
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
        tasks: processedTasks, // Renamed from reminders: processedReminders
        appointments: appointmentsRes.data,
        friends: friendsRes.data,
        challenges: processedChallenges,
        communityTemplates: communityTemplatesRes.data,
        aiSuggestions: aiSuggestionsRes.data,
      });

    } catch (error) {
      console.error("Failed to fetch data for authenticated user:", error);
      set({ 
        tasks: [], appointments: [], friends: [], // Renamed from reminders
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
    if (!user || !user.id) { // Check user.id as uid is stored there
      console.log("fetchDetailedUserProfile: User not available or user ID missing.");
      return set({ detailedUserProfile: null });
    }
    try {
      const firebaseCurrentUser = firebase.auth().currentUser;
      if (!firebaseCurrentUser) {
        console.log("fetchDetailedUserProfile: Firebase currentUser not available.");
        return set({ detailedUserProfile: null });
      }
      const idToken = await firebaseCurrentUser.getIdToken();
      const response = await axios.get(`${API_BASE_URL}/getUserProfile`, { headers: { Authorization: `Bearer ${idToken}` } });
      if (response.data) {
        set({ detailedUserProfile: response.data });
        // Optionally update Firebase Auth displayName if Firestore name is canonical and different
        if (response.data.name && firebaseCurrentUser.displayName !== response.data.name) {
          // await firebaseCurrentUser.updateProfile({ displayName: response.data.name });
          // set(state => ({ user: { ...state.user, name: response.data.name } }));
          // This part is commented out to avoid potential loops or if backend is source of truth for display name
        }
      } else {
        set({ detailedUserProfile: null });
      }
    } catch (error) {
      console.error("Error fetching detailed user profile:", error.response ? error.response.data : error.message);
      if (error.response && error.response.status === 404) {
         console.log("User profile not found in Firestore, setting detailedUserProfile to a default structure or null.");
        // Optionally set a default structure if user document doesn't exist
        // For now, setting to null as per current logic
      }
      set({ detailedUserProfile: null });
    }
  },

  updateUserProfile: async (profileData) => {
    const { user } = get();
    if (!user || !user.id) {
      console.error("User not authenticated or user ID missing for updateUserProfile");
      throw new Error("User not authenticated");
    }
    try {
      const firebaseCurrentUser = firebase.auth().currentUser;
       if (!firebaseCurrentUser) {
        console.error("Firebase currentUser not available for updateUserProfile");
        throw new Error("User session error");
      }
      const idToken = await firebaseCurrentUser.getIdToken();
      const response = await axios.patch(`${API_BASE_URL}/updateUserProfile`, profileData, { headers: { Authorization: `Bearer ${idToken}` } });

      if (response.data) {
        set({ detailedUserProfile: response.data });
        // If displayName was updated, also update Firebase Auth displayName for consistency
        if (profileData.displayName && firebaseCurrentUser.displayName !== profileData.displayName) {
          await firebaseCurrentUser.updateProfile({ displayName: profileData.displayName });
          // Update the 'user' state in Zustand to reflect this change immediately
          set(state => ({
            user: { ...state.user, name: profileData.displayName, displayName: profileData.displayName } // 'name' in user state obj is used as displayName
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

  // --- Task Actions --- // Renamed from Reminder Actions
  addTaskStore: async (taskData) => { // Renamed from addReminderStore, param reminderData to taskData
    const { user } = get();
    if (!user) { console.error("User not authenticated for addTask"); return null; } // Renamed from addReminder
    try {
      const idToken = await firebase.auth().currentUser.getIdToken();
      const headers = { Authorization: `Bearer ${idToken}` };
      // Ensure taskData matches the backend 'addTask' function's expected payload
      // e.g., { title, description, dueDate, category, priority }
      const response = await axios.post(`${API_BASE_URL}/addTask`, taskData, { headers }); // Renamed endpoint
      if (response.status === 201) {
        set(state => ({ tasks: [...state.tasks, response.data] })); // Renamed from reminders
        return response.data;
      }
      return null;
    } catch (error) {
      console.error("Error adding task:", error.response ? error.response.data : error.message); // Renamed
      return null;
    }
  },
  deleteTaskStore: async (taskId) => { // Renamed from deleteReminderStore, param reminderId to taskId
    const { user } = get();
    if (!user) { console.error("User not authenticated for deleteTask"); return; } // Renamed
    try {
      const idToken = await firebase.auth().currentUser.getIdToken();
      const headers = { Authorization: `Bearer ${idToken}` };
      await axios.delete(`${API_BASE_URL}/deleteTask/${taskId}`, { headers }); // Renamed endpoint and param
      set(state => ({ tasks: state.tasks.filter(t => t.id !== taskId) })); // Renamed from reminders, r to t
    } catch (error) {
      console.error("Error deleting task:", error.response ? error.response.data : error.message); // Renamed
    }
  },

  // --- Appointment Actions ---
  addAppointmentStore: async (appointmentData) => {
    const { user } = get();
    if (!user) { console.error("User not authenticated for addAppointment"); return null; }
    try {
      const idToken = await firebase.auth().currentUser.getIdToken();
      const headers = { Authorization: `Bearer ${idToken}` };
      // Ensure appointmentData matches backend schema:
      // { title, description, startTime, endTime, location, category }
      const response = await axios.post(`${API_BASE_URL}/addAppointment`, appointmentData, { headers });
      if (response.status === 201) {
        set(state => ({ appointments: [...state.appointments, response.data] }));
        return response.data;
      }
      return null;
    } catch (error) {
      console.error("Error adding appointment:", error.response ? error.response.data : error.message);
      return null;
    }
  },
  updateAppointmentStore: async (appointmentId, dataToUpdate) => { // Renamed
    const { user } = get();
    if (!user) { console.error("User not authenticated for updateAppointment"); return null; }
    try {
      const idToken = await firebase.auth().currentUser.getIdToken();
      const headers = { Authorization: `Bearer ${idToken}` };
      const response = await axios.patch(`${API_BASE_URL}/updateAppointment/${appointmentId}`, dataToUpdate, { headers });
      if (response.status === 200) {
        set(state => ({
          appointments: state.appointments.map(a => a.id === appointmentId ? response.data : a)
        }));
        return response.data;
      }
      return null;
    } catch (error) {
      console.error("Error updating appointment:", error.response ? error.response.data : error.message);
      return null;
    }
  },
  deleteAppointmentStore: async (appointmentId) => { // Renamed
    const { user } = get();
    if (!user) { console.error("User not authenticated for deleteAppointment"); return; }
    try {
      const idToken = await firebase.auth().currentUser.getIdToken();
      const headers = { Authorization: `Bearer ${idToken}` };
      await axios.delete(`${API_BASE_URL}/deleteAppointment/${appointmentId}`, { headers });
      set(state => ({ appointments: state.appointments.filter(a => a.id !== appointmentId) }));
    } catch (error) {
      console.error("Error deleting appointment:", error.response ? error.response.data : error.message);
    }
  },

  // --- Friend Actions ---
  addFriendStore: async (friendUid) => { // Renamed
    const { user } = get();
    if (!user) { console.error("User not authenticated for addFriend"); return; }
    try {
      const idToken = await firebase.auth().currentUser.getIdToken();
      const headers = { Authorization: `Bearer ${idToken}` };
      await axios.post(`${API_BASE_URL}/addFriend`, { friendUid }, { headers });
      get().initializeProfileData();
    } catch (error) {
      console.error("Error adding friend:", error.response ? error.response.data : error.message);
    }
  },
  removeFriendStore: async (friendUid) => { // Renamed
    const { user } = get();
    if (!user) { console.error("User not authenticated for removeFriend"); return; }
    try {
      const idToken = await firebase.auth().currentUser.getIdToken();
      const headers = { Authorization: `Bearer ${idToken}` };
      await axios.delete(`${API_BASE_URL}/removeFriend/${friendUid}`, { headers });
      get().initializeProfileData();
    } catch (error) {
      console.error("Error removing friend:", error.response ? error.response.data : error.message);
    }
  },

  // --- Challenge Actions ---
  joinChallengeStore: async (challengeId) => { // Renamed
    const { user } = get();
    if (!user) { console.error("User not authenticated for joinChallenge"); return; }
    try {
      const idToken = await firebase.auth().currentUser.getIdToken();
      const headers = { Authorization: `Bearer ${idToken}` };
      await axios.post(`${API_BASE_URL}/joinChallenge`, { challengeId }, { headers });
      set(state => ({
        challenges: state.challenges.map(c => c.id === challengeId ? { ...c, joined: true } : c)
      }));
    } catch (error) {
      console.error("Error joining challenge:", error.response ? error.response.data : error.message);
    }
  },
  leaveChallengeStore: async (challengeId) => { // Renamed
    const { user } = get();
    if (!user) { console.error("User not authenticated for leaveChallenge"); return; }
    try {
      const idToken = await firebase.auth().currentUser.getIdToken();
      const headers = { Authorization: `Bearer ${idToken}` };
      await axios.post(`${API_BASE_URL}/leaveChallenge`, { challengeId }, { headers });
      set(state => ({
        challenges: state.challenges.map(c => c.id === challengeId ? { ...c, joined: false, progress: 0 } : c) // Also reset progress
      }));
    } catch (error) {
      console.error("Error leaving challenge:", error.response ? error.response.data : error.message);
    }
  },
}));

export default useStore;
