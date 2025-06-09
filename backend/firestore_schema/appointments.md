# `appointments` Collection Schema

*   **Document ID:** Auto-generated
*   **Fields:**
    *   `userId`: (String) `uid` of the user who owns the appointment. (Indexed for querying)
    *   `title`: (String) Appointment title.
    *   `description`: (String, Optional) Appointment details.
    *   `startTime`: (Timestamp) Appointment start time.
    *   `endTime`: (Timestamp) Appointment end time.
    *   `location`: (String, Optional) Appointment location.
    *   `createdAt`: (Timestamp) When the appointment was created.
    *   `updatedAt`: (Timestamp) When the appointment was last updated.
    *   `category`: (String, Optional) e.g., "Work Meeting", "Doctor".
