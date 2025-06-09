# `tasks` Collection Schema

*   **Document ID:** Auto-generated
*   **Fields:**
    *   `userId`: (String) `uid` of the user who owns the task. (Indexed for querying)
    *   `title`: (String) Task title.
    *   `description`: (String, Optional) Task details.
    *   `dueDate`: (Timestamp, Optional) When the task is due.
    *   `isCompleted`: (Boolean) Default: `false`.
    *   `completedAt`: (Timestamp, Optional) When the task was completed.
    *   `createdAt`: (Timestamp) When the task was created.
    *   `updatedAt`: (Timestamp) When the task was last updated.
    *   `category`: (String, Optional) e.g., "Work", "Personal".
    *   `priority`: (String, Optional) e.g., "High", "Medium", "Low".
