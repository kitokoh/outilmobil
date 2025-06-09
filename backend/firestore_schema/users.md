# `users` Collection Schema

*   **Document ID:** `uid` (from Firebase Authentication)
*   **Fields:**
    *   `email`: (String) User's email address.
    *   `displayName`: (String, Optional) User's display name.
    *   `photoURL`: (String, Optional) URL to user's profile picture.
    *   `createdAt`: (Timestamp) When the user document was created.
    *   `profileType`: (String) e.g., "Student", "Professional".
    *   `preferences`: (Map)
        *   `theme`: (String) e.g., "light", "dark".
        *   `fontSizeMultiplier`: (Number) e.g., 1.0, 1.2.
        *   `notificationSettings`: (Map) e.g., `{"taskReminders": true}`.
    *   `aiCoachSettings`: (Map) e.g., `{"taskSuggestionsEnabled": true}`.
