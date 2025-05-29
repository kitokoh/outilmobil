import { create } from 'zustand';
import axios from 'axios';
import { BookOpen, Briefcase, Heart, Zap, User } from 'lucide-react-native';
import { API_BASE_URL } from '@env'; // Import API_BASE_URL from react-native-dotenv

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

// Hardcoded credentials for login
const HARDCODED_USER = {
  email: 'user@example.com',
  password: 'password',
  name: 'Demo User',
  id: 'user123'
};

const useStore = create((set, get) => ({
  // State variables
  isAuthenticated: false, 
  user: null, 
  currentView: 'dashboard',
  userProfile: 'student', 
  reminders: [],
  appointments: [],
  friends: [],
  challenges: [],
  communityTemplates: [],
  aiSuggestions: [],
  notifications: 5,
  streak: 12,
  activeTab: 'reminders',
  profileTemplates: {}, 
  categories: categories,

  // Actions
  login: async (email, password) => {
    if (email === HARDCODED_USER.email && password === HARDCODED_USER.password) {
      set({ 
        isAuthenticated: true, 
        user: { email: HARDCODED_USER.email, name: HARDCODED_USER.name, id: HARDCODED_USER.id } 
      });
      await get().initializeProfileData(); 
      return true;
    }
    return false;
  },
  logout: () => {
    set({ 
      isAuthenticated: false, 
      user: null, 
      currentView: 'dashboard', 
      reminders: [], 
      appointments: [],
      friends: [],
      challenges: [],
    });
    // Re-initialize with public data after logout
    get().initializeProfileData();
  },
  setCurrentView: (view) => set({ currentView: view }),
  setUserProfile: async (profileId) => {
    set({ userProfile: profileId });
    if (get().isAuthenticated) {
      await get().initializeProfileData(); 
    }
  },
  setReminders: (reminders) => set({ reminders }),

  toggleReminderCompleted: async (reminderId) => {
    const reminder = get().reminders.find(r => r.id === reminderId);
    if (!reminder) return;

    try {
      const updatedReminder = { ...reminder, completed: !reminder.completed };
      const response = await axios.patch(`${API_BASE_URL}/reminders/${reminderId}`, {
        completed: updatedReminder.completed
      });

      if (response.status === 200) {
        set((state) => ({
          reminders: state.reminders.map(r =>
            r.id === reminderId ? response.data : r
          )
        }));
      } else {
        console.error("Failed to update reminder on server:", response);
      }
    } catch (error) {
      console.error("Error updating reminder:", error);
    }
  },
  
  initializeProfileData: async () => {
    const userProfileId = get().userProfile;
    const isAuthenticated = get().isAuthenticated;

    try {
      // Always fetch profileTemplates as they might be needed for login screen profile selection
      // or public parts of the app.
      const profileTemplatesRes = await axios.get(`${API_BASE_URL}/profileTemplates`);
      const fetchedProfileTemplates = profileTemplatesRes.data;
      const processedProfileTemplates = Object.entries(fetchedProfileTemplates).reduce((acc, [key, profile]) => {
        acc[key] = { ...profile, icon: iconMap[profile.iconName] || User };
        return acc;
      }, {});
      set({ profileTemplates: processedProfileTemplates });

      if (!isAuthenticated) {
        // If not authenticated, clear user-specific data and stop.
        set({
            reminders: [],
            appointments: [],
            friends: [],
            challenges: [],
            communityTemplates: [],
            aiSuggestions: [],
        });
        return;
      }

      // If authenticated, fetch all user-specific and other data
      const [
        appointmentsRes,
        friendsRes,
        challengesRes,
        communityTemplatesRes,
        aiSuggestionsRes
      ] = await Promise.all([
        axios.get(`${API_BASE_URL}/appointments`), 
        axios.get(`${API_BASE_URL}/friends`),
        axios.get(`${API_BASE_URL}/challenges`),
        axios.get(`${API_BASE_URL}/communityTemplates`),
        axios.get(`${API_BASE_URL}/aiSuggestions`)
      ]);

      const currentProfileData = processedProfileTemplates[userProfileId];
      let profileReminders = [];
      if (currentProfileData) {
        const remindersRes = await axios.get(`${API_BASE_URL}/reminders?profileId=${userProfileId}`);
        if (remindersRes.data && remindersRes.data.length > 0) {
             profileReminders = remindersRes.data.map(r => ({
                ...r,
                streak: r.streak !== undefined ? r.streak : Math.floor(Math.random() * 10) + 1,
                completed: r.completed !== undefined ? r.completed : Math.random() > 0.7,
             }));
        } else if (currentProfileData.routines) { 
            profileReminders = currentProfileData.routines.map(routine => ({
                ...routine,
                profileId: userProfileId,
                completed: routine.completed !== undefined ? routine.completed : Math.random() > 0.7,
                streak: routine.streak !== undefined ? routine.streak : Math.floor(Math.random() * 10) + 1,
            }));
        }
      }

      set({
        // profileTemplates already set
        appointments: appointmentsRes.data,
        friends: friendsRes.data,
        challenges: challengesRes.data,
        communityTemplates: communityTemplatesRes.data,
        aiSuggestions: aiSuggestionsRes.data,
        reminders: profileReminders,
      });

    } catch (error) {
      console.error("Failed to fetch data:", error);
      set({ 
        reminders: [], 
        appointments: [], 
        friends: [], 
        challenges: [], 
        communityTemplates: [], 
        aiSuggestions: [],
        // Keep profileTemplates if already fetched, otherwise set to empty
        profileTemplates: get().profileTemplates || {} 
      });
    }
  },
  setActiveTab: (tab) => set({ activeTab: tab }),
}));

export default useStore;
