const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true}); // Initialize cors

admin.initializeApp();

/**
 * Registers a new user.
 * Expects {email, password} in the request body.
 */
exports.registerUser = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send('Email and password are required.');
    }

    try {
      const userRecord = await admin.auth().createUser({
        email: email,
        password: password,
      });

      // Create a user profile document in Firestore
      const db = admin.firestore();
      const userProfile = {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: req.body.displayName || null, // Per schema, displayName is optional
        profileType: "Student", // Default value
        preferences: {
          theme: "light",
          fontSizeMultiplier: 1.0,
          notificationSettings: {
            taskReminders: true,
            appointmentAlerts: true,
          }
        },
        aiCoachSettings: {
          taskSuggestionsEnabled: true,
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        // photoURL can be added via updateUserProfile
      };
      await db.collection('users').doc(userRecord.uid).set(userProfile);

      return res.status(201).send({ uid: userRecord.uid, email: userRecord.email, displayName: userProfile.displayName });
    } catch (error) {
      console.error('Error creating new user:', error);
      // Provide more specific error messages if possible
      let errorMessage = 'Error creating new user.';
      if (error.code === 'auth/email-already-exists') {
        errorMessage = 'The email address is already in use by another account.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'The email address is not valid.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'The password is not strong enough.';
      }
      return res.status(500).send({ error: errorMessage });
    }
  });
});

/**
 * Retrieves the profile of the authenticated user.
 * Requires authentication.
 */
exports.getUserProfile = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'GET') {
      return res.status(405).send('Method Not Allowed');
    }

    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) {
      return res.status(403).send('Unauthorized: No token provided.');
    }

    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      console.error('Error verifying ID token:', error);
      return res.status(403).send('Unauthorized: Invalid token.');
    }
    const userId = decodedToken.uid;

    try {
      const db = admin.firestore();
      const userProfileRef = db.collection('users').doc(userId);
      const doc = await userProfileRef.get();

      if (!doc.exists) {
        // Optionally, return a default profile structure or a specific "not found" message
        return res.status(404).send({ error: 'User profile not found.' });
      }

      return res.status(200).send(doc.data());
    } catch (error) {
      console.error('Error getting user profile:', error);
      return res.status(500).send({ error: 'Error getting user profile.' });
    }
  });
});

/**
 * Updates the profile of the authenticated user.
 * Requires authentication.
 * Accepts profile data (e.g., name, bio, avatarUrl) in the request body.
 */
exports.updateUserProfile = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'PATCH' && req.method !== 'PUT') { // Typically PATCH for partial updates
      return res.status(405).send('Method Not Allowed');
    }

    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) {
      return res.status(403).send('Unauthorized: No token provided.');
    }

    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      console.error('Error verifying ID token:', error);
      return res.status(403).send('Unauthorized: Invalid token.');
    }
    const userId = decodedToken.uid;
    const dataToUpdate = req.body;

    if (Object.keys(dataToUpdate).length === 0) {
      return res.status(400).send({ error: 'No data provided for update.' });
    }

    // Basic validation example: ensure name is a string if provided
    if (dataToUpdate.name && typeof dataToUpdate.name !== 'string') {
      return res.status(400).send({ error: 'Invalid name format. Name must be a string.' });
    }
    // Add more validation as needed for other fields (bio, avatarUrl, etc.)

    // Prevent updating immutable fields like UID or email from this endpoint
    delete dataToUpdate.uid;
    delete dataToUpdate.email;
    delete dataToUpdate.createdAt; // Should not be updated by user
    dataToUpdate.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    try {
      const db = admin.firestore();
      const userProfileRef = db.collection('users').doc(userId);

      // Using update method which is suitable for partial updates.
      // Firestore's update method with dot notation (e.g., 'preferences.theme') works for nested fields.
      // If the client sends the whole map, it will overwrite the map.
      // It's generally better for clients to send specific fields to update using dot notation for nested maps.
      await userProfileRef.update(dataToUpdate);

      const updatedDoc = await userProfileRef.get();
      return res.status(200).send(updatedDoc.data());
    } catch (error) {
      console.error('Error updating user profile:', error);
      return res.status(500).send({ error: 'Error updating user profile.' });
    }
  });
});

/**
 * Logs in a user.
 * Firebase client SDK is typically used for login, this is more of a validation.
 * For actual session management, the client SDK handles token generation and management.
 * This function can be used to verify credentials if needed before client-side sign-in,
 * or for server-side operations requiring user context if you were to implement custom token minting.
 * For simplicity with Firebase client SDK, direct client-side sign-in is often preferred.
 *
 * This endpoint will mostly serve as a placeholder for now, as Firebase client SDK
 * handles sign-in and token management more effectively.
 * We can simulate a check or simply return a success if we want to keep it.
 */
exports.loginUser = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send('Email and password are required.');
    }

    // Firebase Admin SDK does not directly sign in users like client SDKs do.
    // Client SDKs (e.g., in your React Native app) should be used for sign-in,
    // which then communicate with Firebase Auth services directly.
    // This function could verify user existence or custom claims if needed.
    // For this example, we'll just acknowledge the request.
    // In a real scenario, the client would use firebase.auth().signInWithEmailAndPassword(email, password)
    try {
      // This doesn't "log in" the user in a session sense via admin SDK,
      // but it verifies the user exists.
      const userRecord = await admin.auth().getUserByEmail(email);
      // IMPORTANT: Never verify password like this on server for actual login.
      // Client SDK handles this securely. This is a conceptual placeholder.
      // To "validate" password, you'd need a custom flow or rely on client SDK.
      res.status(200).send({ message: "Login endpoint acknowledged. Client should use Firebase SDK for actual sign-in.", uid: userRecord.uid });
    } catch (error) {
      console.error('Error during login attempt:', error);
      let errorMessage = 'Login failed.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'User not found.';
      } else if (error.code === 'auth/wrong-password') {
        // Note: Admin SDK getUserByEmail doesn't check password.
        // This error code is more typical of client-side SDK direct sign-in.
        errorMessage = 'Incorrect password.';
      }
      res.status(401).send({ error: errorMessage });
    }
  });
});
/**
 * Retrieves all profile templates.
 */
exports.getProfileTemplates = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'GET') {
      return res.status(405).send('Method Not Allowed');
    }

    try {
      const db = admin.firestore();
      const profileTemplatesSnapshot = await db.collection('profileTemplates').get();

      if (profileTemplatesSnapshot.empty) {
        return res.status(404).send({ message: 'No profile templates found.' });
      }

      const templates = {};
      profileTemplatesSnapshot.forEach(doc => {
        templates[doc.id] = doc.data();
      });

      return res.status(200).send(templates);
    } catch (error) {
      console.error('Error getting profile templates:', error);
      return res.status(500).send({ error: 'Error getting profile templates.' });
    }
  });
});
/**
 * Retrieves tasks for the authenticated user.
 * Requires authentication.
 */
exports.getTasks = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'GET') {
      return res.status(405).send('Method Not Allowed');
    }

    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) {
      return res.status(403).send('Unauthorized: No token provided.');
    }

    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      console.error('Error verifying ID token:', error);
      return res.status(403).send('Unauthorized: Invalid token.');
    }
    const userId = decodedToken.uid;

    try {
      const db = admin.firestore();
      const tasks = [];
      const query = db.collection('tasks').where('userId', '==', userId);
      const userTasksSnapshot = await query.get();

      if (!userTasksSnapshot.empty) {
        userTasksSnapshot.forEach(doc => {
          tasks.push({ id: doc.id, ...doc.data() });
        });
      }
      // Removed fallback to profileTemplates for Phase 1
      return res.status(200).send(tasks);
    } catch (error) {
      console.error('Error getting tasks:', error);
      return res.status(500).send({ error: 'Error getting tasks.' });
    }
  });
});

/**
 * Adds a new task for the authenticated user.
 * Requires authentication.
 */
exports.addTask = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) { return res.status(403).send('Unauthorized: No token provided.'); }
    let decodedToken;
    try { decodedToken = await admin.auth().verifyIdToken(idToken); }
    catch (error) { return res.status(403).send('Unauthorized: Invalid token.'); }
    const userId = decodedToken.uid;

    const { title, description, dueDate, category, priority } = req.body;
    if (!title) {
      return res.status(400).send({ error: 'Title is required for a task.' });
    }

    try {
      const db = admin.firestore();
      const newTask = {
        userId,
        title,
        description: description || null,
        dueDate: dueDate || null, // Should be a Firestore Timestamp if provided
        isCompleted: false,
        // completedAt will be set when task is completed
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        category: category || null,
        priority: priority || null,
      };
      const docRef = await db.collection('tasks').add(newTask);
      return res.status(201).send({ id: docRef.id, ...newTask });
    } catch (error) {
      console.error('Error adding task:', error);
      return res.status(500).send({ error: 'Error adding task.' });
    }
  });
});

/**
 * Updates an existing task for the authenticated user.
 * Requires authentication.
 */
exports.updateTask = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'PATCH' && req.method !== 'PUT') {
      return res.status(405).send('Method Not Allowed');
    }

    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) { return res.status(403).send('Unauthorized: No token provided.'); }
    let decodedToken;
    try { decodedToken = await admin.auth().verifyIdToken(idToken); }
    catch (error) { return res.status(403).send('Unauthorized: Invalid token.'); }
    const userId = decodedToken.uid;

    const taskId = req.params.id || req.path.split('/').pop();
    const dataToUpdate = req.body;

    if (!taskId) {
        return res.status(400).send({ error: 'Task ID is required in the path.' });
    }
    if (Object.keys(dataToUpdate).length === 0) {
        return res.status(400).send({ error: 'No data provided for update.' });
    }
    // Prevent user from updating userId or createdAt
    delete dataToUpdate.userId;
    delete dataToUpdate.createdAt;

    dataToUpdate.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    // Handle completedAt based on isCompleted status
    if (dataToUpdate.isCompleted === true) {
        dataToUpdate.completedAt = admin.firestore.FieldValue.serverTimestamp();
    } else if (dataToUpdate.isCompleted === false) {
        dataToUpdate.completedAt = null; // Or FieldValue.delete() to remove it
    }


    try {
      const db = admin.firestore();
      const taskRef = db.collection('tasks').doc(taskId);
      const doc = await taskRef.get();

      if (!doc.exists) {
        return res.status(404).send({ error: 'Task not found.' });
      }
      if (doc.data().userId !== userId) {
        return res.status(403).send({ error: 'User not authorized to update this task.' });
      }

      await taskRef.update(dataToUpdate);
      const updatedDoc = await taskRef.get();
      return res.status(200).send({ id: updatedDoc.id, ...updatedDoc.data() });
    } catch (error) {
      console.error('Error updating task:', error);
      return res.status(500).send({ error: 'Error updating task.' });
    }
  });
});

/**
 * Deletes a task for the authenticated user.
 * Requires authentication.
 */
exports.deleteTask = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'DELETE') {
      return res.status(405).send('Method Not Allowed');
    }

    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) { return res.status(403).send('Unauthorized: No token provided.'); }
    let decodedToken;
    try { decodedToken = await admin.auth().verifyIdToken(idToken); }
    catch (error) { return res.status(403).send('Unauthorized: Invalid token.'); }
    const userId = decodedToken.uid;

    const taskId = req.params.id || req.path.split('/').pop();

    if (!taskId) {
        return res.status(400).send({ error: 'Task ID is required in the path.' });
    }

    try {
      const db = admin.firestore();
      const taskRef = db.collection('tasks').doc(taskId);
      const doc = await taskRef.get();

      if (!doc.exists) {
        return res.status(404).send({ error: 'Task not found.' });
      }
      if (doc.data().userId !== userId) {
        return res.status(403).send({ error: 'User not authorized to delete this task.' });
      }

      await taskRef.delete();
      return res.status(200).send({ message: 'Task deleted successfully.' });
    } catch (error) {
      console.error('Error deleting task:', error);
      return res.status(500).send({ error: 'Error deleting task.' });
    }
  });
});
/**
 * Retrieves appointments for the authenticated user.
 * Requires authentication.
 */
exports.getAppointments = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'GET') {
      return res.status(405).send('Method Not Allowed');
    }

    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) { return res.status(403).send('Unauthorized: No token provided.'); }
    let decodedToken;
    try { decodedToken = await admin.auth().verifyIdToken(idToken); }
    catch (error) { console.error('Error verifying ID token:', error); return res.status(403).send('Unauthorized: Invalid token.'); }
    const userId = decodedToken.uid;

    try {
      const db = admin.firestore();
      const appointmentsSnapshot = await db.collection('appointments').where('userId', '==', userId).get();

      const appointments = [];
      appointmentsSnapshot.forEach(doc => {
        let apptData = { id: doc.id, ...doc.data() };
        // Convert timestamps to ISO strings for consistent client response
        if (apptData.createdAt && apptData.createdAt.toDate) {
          apptData.createdAt = apptData.createdAt.toDate().toISOString();
        }
        if (apptData.updatedAt && apptData.updatedAt.toDate) {
          apptData.updatedAt = apptData.updatedAt.toDate().toISOString();
        }
        if (apptData.startTime && apptData.startTime.toDate) {
          apptData.startTime = apptData.startTime.toDate().toISOString();
        }
        if (apptData.endTime && apptData.endTime.toDate) {
          apptData.endTime = apptData.endTime.toDate().toISOString();
        }
        appointments.push(apptData);
      });

      return res.status(200).send(appointments);
    } catch (error) {
      console.error('Error getting appointments:', error);
      return res.status(500).send({ error: 'Error getting appointments.' });
    }
  });
});

/**
 * Adds a new appointment for the authenticated user.
 * Requires authentication.
 */
exports.addAppointment = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) { return res.status(403).send('Unauthorized: No token provided.'); }
    let decodedToken;
    try { decodedToken = await admin.auth().verifyIdToken(idToken); }
    catch (error) { return res.status(403).send('Unauthorized: Invalid token.'); }
    const userId = decodedToken.uid;

    // Fields based on appointments.md schema
    const { title, description, startTime, endTime, location, category } = req.body;

    if (!title || !startTime || !endTime) {
      return res.status(400).send({ error: 'Title, startTime, and endTime are required for an appointment.' });
    }

    // Optional: Add validation for startTime and endTime (e.g., ensure they are valid timestamps)

    try {
      const db = admin.firestore();
      const newAppointment = {
        userId,
        title,
        description: description || null,
        startTime, // Expecting ISO string or Firestore Timestamp from client
        endTime,   // Expecting ISO string or Firestore Timestamp from client
        location: location || null,
        category: category || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(), // Add updatedAt
      };
      const docRef = await db.collection('appointments').add(newAppointment);
      // Return the new appointment data along with its ID
      const createdAppointment = { id: docRef.id, ...newAppointment };
      // Convert server timestamps to string for consistent client response (optional)
      if (createdAppointment.createdAt.toDate) { // Check if it's a ServerTimestamp
        createdAppointment.createdAt = createdAppointment.createdAt.toDate().toISOString();
      }
      if (createdAppointment.updatedAt.toDate) { // Check if it's a ServerTimestamp
         createdAppointment.updatedAt = createdAppointment.updatedAt.toDate().toISOString();
      }
      return res.status(201).send(createdAppointment);
    } catch (error) {
      console.error('Error adding appointment:', error);
      return res.status(500).send({ error: 'Error adding appointment.' });
    }
  });
});

/**
 * Updates an existing appointment for the authenticated user.
 * Requires authentication.
 */
exports.updateAppointment = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'PATCH' && req.method !== 'PUT') {
      return res.status(405).send('Method Not Allowed');
    }

    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) { return res.status(403).send('Unauthorized: No token provided.'); }
    let decodedToken;
    try { decodedToken = await admin.auth().verifyIdToken(idToken); }
    catch (error) { return res.status(403).send('Unauthorized: Invalid token.'); }
    const userId = decodedToken.uid;

    const appointmentId = req.params.id || req.path.split('/').pop();
    const dataToUpdate = req.body;

    if (!appointmentId) {
        return res.status(400).send({ error: 'Appointment ID is required in the path.' });
    }
    if (Object.keys(dataToUpdate).length === 0) {
        return res.status(400).send({ error: 'No data provided for update.' });
    }

    // Prevent updating immutable fields
    delete dataToUpdate.userId;
    delete dataToUpdate.createdAt;

    // Add updatedAt timestamp
    dataToUpdate.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    // Ensure that if startTime or endTime are provided, they are valid (basic check)
    // More complex validation (e.g. ISO string, endTime > startTime) can be added
    if (dataToUpdate.startTime && typeof dataToUpdate.startTime !== 'string' && !dataToUpdate.startTime.toDate) {
        // Assuming client sends ISO string or Firestore Timestamp object
        return res.status(400).send({ error: 'Invalid startTime format.'});
    }
    if (dataToUpdate.endTime && typeof dataToUpdate.endTime !== 'string' && !dataToUpdate.endTime.toDate) {
        return res.status(400).send({ error: 'Invalid endTime format.'});
    }


    try {
      const db = admin.firestore();
      const appointmentRef = db.collection('appointments').doc(appointmentId);
      const doc = await appointmentRef.get();

      if (!doc.exists) {
        return res.status(404).send({ error: 'Appointment not found.' });
      }
      if (doc.data().userId !== userId) {
        return res.status(403).send({ error: 'User not authorized to update this appointment.' });
      }

      await appointmentRef.update(dataToUpdate);
      const updatedDocSnapshot = await appointmentRef.get();
      const updatedData = { id: updatedDocSnapshot.id, ...updatedDocSnapshot.data() };

      // Convert server timestamps to string for consistent client response (optional)
      if (updatedData.createdAt && updatedData.createdAt.toDate) {
        updatedData.createdAt = updatedData.createdAt.toDate().toISOString();
      }
      if (updatedData.updatedAt && updatedData.updatedAt.toDate) {
         updatedData.updatedAt = updatedData.updatedAt.toDate().toISOString();
      }
       if (updatedData.startTime && updatedData.startTime.toDate) {
         updatedData.startTime = updatedData.startTime.toDate().toISOString();
      }
      if (updatedData.endTime && updatedData.endTime.toDate) {
         updatedData.endTime = updatedData.endTime.toDate().toISOString();
      }

      return res.status(200).send(updatedData);
    } catch (error) {
      console.error('Error updating appointment:', error);
      return res.status(500).send({ error: 'Error updating appointment.' });
    }
  });
});

/**
 * Deletes an appointment for the authenticated user.
 * Requires authentication.
 */
exports.deleteAppointment = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'DELETE') {
      return res.status(405).send('Method Not Allowed');
    }

    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) { return res.status(403).send('Unauthorized: No token provided.'); }
    let decodedToken;
    try { decodedToken = await admin.auth().verifyIdToken(idToken); }
    catch (error) { return res.status(403).send('Unauthorized: Invalid token.'); }
    const userId = decodedToken.uid;

    const appointmentId = req.params.id || req.path.split('/').pop();

    if (!appointmentId) {
        return res.status(400).send({ error: 'Appointment ID is required in the path.' });
    }

    try {
      const db = admin.firestore();
      const appointmentRef = db.collection('appointments').doc(appointmentId);
      const doc = await appointmentRef.get();

      if (!doc.exists) {
        return res.status(404).send({ error: 'Appointment not found.' });
      }
      if (doc.data().userId !== userId) {
        return res.status(403).send({ error: 'User not authorized to delete this appointment.' });
      }

      await appointmentRef.delete();
      return res.status(200).send({ message: 'Appointment deleted successfully.' });
    } catch (error) {
      console.error('Error deleting appointment:', error);
      return res.status(500).send({ error: 'Error deleting appointment.' });
    }
  });
});
// --- Friends Endpoints ---
/**
 * Retrieves friends for the authenticated user.
 * Assumes friends are stored as an array of UIDs in the user's document or a subcollection.
 * For this example, we'll assume an array 'friendUids' in a 'users' collection document.
 */
exports.getFriends = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) return res.status(403).send('Unauthorized: No token');
    let decodedToken;
    try { decodedToken = await admin.auth().verifyIdToken(idToken); }
    catch (error) { return res.status(403).send('Unauthorized: Invalid token'); }
    const userId = decodedToken.uid;

    try {
      const db = admin.firestore();
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) return res.status(404).send({ error: 'User profile not found.' });

      const userData = userDoc.data();
      const friendUids = userData.friendUids || [];

      if (friendUids.length === 0) return res.status(200).send([]);

      // Fetch details of each friend. This can be N reads, consider optimizing for many friends.
      const friendPromises = friendUids.map(uid => db.collection('users').doc(uid).get());
      const friendDocs = await Promise.all(friendPromises);

      const friends = friendDocs.map(doc => {
        if (!doc.exists) return null; // Or some placeholder for a friend whose profile was deleted
        const { email, name, /* other relevant public fields */ } = doc.data();
        return { id: doc.id, email, name /*, avatar, status from original db.json if available */ };
      }).filter(friend => friend !== null);

      return res.status(200).send(friends);
    } catch (error) {
      console.error('Error getting friends:', error);
      return res.status(500).send({ error: 'Error getting friends.' });
    }
  });
});

/**
 * Adds a friend for the authenticated user.
 * Expects { friendUid } in the request body.
 */
exports.addFriend = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) return res.status(403).send('Unauthorized: No token');
    let decodedToken;
    try { decodedToken = await admin.auth().verifyIdToken(idToken); }
    catch (error) { return res.status(403).send('Unauthorized: Invalid token'); }
    const userId = decodedToken.uid;
    const { friendUid } = req.body;

    if (!friendUid) return res.status(400).send({ error: 'friendUid is required.' });
    if (friendUid === userId) return res.status(400).send({ error: 'Cannot add yourself as a friend.' });

    try {
      const db = admin.firestore();
      const userRef = db.collection('users').doc(userId);
      const friendRef = db.collection('users').doc(friendUid);

      const friendDoc = await friendRef.get();
      if (!friendDoc.exists) return res.status(404).send({ error: 'Friend user not found.' });

      // Add to user's friendUids array
      await userRef.update({ friendUids: admin.firestore.FieldValue.arrayUnion(friendUid) });
      // Optionally, add to friend's friendUids array too for a reciprocal relationship
      // await friendRef.update({ friendUids: admin.firestore.FieldValue.arrayUnion(userId) });

      return res.status(200).send({ message: 'Friend added successfully.' });
    } catch (error) {
      console.error('Error adding friend:', error);
      return res.status(500).send({ error: 'Error adding friend.' });
    }
  });
});

/**
 * Removes a friend for the authenticated user.
 * Expects { friendUid } in the request body or as a URL parameter.
 */
exports.removeFriend = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'DELETE') return res.status(405).send('Method Not Allowed'); // Or POST with an action
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) return res.status(403).send('Unauthorized: No token');
    let decodedToken;
    try { decodedToken = await admin.auth().verifyIdToken(idToken); }
    catch (error) { return res.status(403).send('Unauthorized: Invalid token'); }
    const userId = decodedToken.uid;
    // Friend UID could come from body for a POST, or path/query for DELETE
    const friendUid = req.body.friendUid || req.query.friendUid || req.params.friendUid || (req.path.split('/').pop());


    if (!friendUid) return res.status(400).send({ error: 'friendUid is required.' });

    try {
      const db = admin.firestore();
      const userRef = db.collection('users').doc(userId);
      // Remove from user's friendUids array
      await userRef.update({ friendUids: admin.firestore.FieldValue.arrayRemove(friendUid) });
      // Optionally, remove from friend's friendUids array too
      // const friendRef = db.collection('users').doc(friendUid);
      // await friendRef.update({ friendUids: admin.firestore.FieldValue.arrayRemove(userId) });

      return res.status(200).send({ message: 'Friend removed successfully.' });
    } catch (error) {
      console.error('Error removing friend:', error);
      return res.status(500).send({ error: 'Error removing friend.' });
    }
  });
});


// --- Challenges Endpoints ---
/**
 * Retrieves all available challenges.
 */
exports.getChallenges = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');
    try {
      const db = admin.firestore();
      const challengesSnapshot = await db.collection('challenges').get();
      const challenges = [];
      challengesSnapshot.forEach(doc => challenges.push({ id: doc.id, ...doc.data() }));
      return res.status(200).send(challenges);
    } catch (error) {
      console.error('Error getting challenges:', error);
      return res.status(500).send({ error: 'Error getting challenges.' });
    }
  });
});

/**
 * Allows an authenticated user to join a challenge.
 * Expects { challengeId } in request body.
 */
exports.joinChallenge = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) return res.status(403).send('Unauthorized: No token');
    let decodedToken;
    try { decodedToken = await admin.auth().verifyIdToken(idToken); }
    catch (error) { return res.status(403).send('Unauthorized: Invalid token'); }
    const userId = decodedToken.uid;
    const { challengeId } = req.body;

    if (!challengeId) return res.status(400).send({ error: 'challengeId is required.' });

    try {
      const db = admin.firestore();
      // Store joined challenges in a subcollection users/{userId}/joinedChallenges/{challengeId}
      const joinRef = db.collection('users').doc(userId).collection('joinedChallenges').doc(challengeId);
      // You can store additional info, like join date
      await joinRef.set({ joinedAt: admin.firestore.FieldValue.serverTimestamp(), progress: 0 });
      return res.status(200).send({ message: 'Successfully joined challenge.' });
    } catch (error) {
      console.error('Error joining challenge:', error);
      return res.status(500).send({ error: 'Error joining challenge.' });
    }
  });
});

/**
 * Allows an authenticated user to leave a challenge.
 * Expects { challengeId } in request body or as URL param.
 */
exports.leaveChallenge = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST' && req.method !== 'DELETE') return res.status(405).send('Method Not Allowed');
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) return res.status(403).send('Unauthorized: No token');
    let decodedToken;
    try { decodedToken = await admin.auth().verifyIdToken(idToken); }
    catch (error) { return res.status(403).send('Unauthorized: Invalid token'); }
    const userId = decodedToken.uid;
    const challengeId = req.body.challengeId || req.query.challengeId || req.params.challengeId || (req.path.split('/').pop());


    if (!challengeId) return res.status(400).send({ error: 'challengeId is required.' });

    try {
      const db = admin.firestore();
      const joinRef = db.collection('users').doc(userId).collection('joinedChallenges').doc(challengeId);
      await joinRef.delete();
      return res.status(200).send({ message: 'Successfully left challenge.' });
    } catch (error) {
      console.error('Error leaving challenge:', error);
      return res.status(500).send({ error: 'Error leaving challenge.' });
    }
  });
});

// --- Community Templates Endpoint ---
/**
 * Retrieves all community templates.
 */
exports.getCommunityTemplates = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');
    try {
      const db = admin.firestore();
      // Optional: add query parameters for filtering, e.g., by profile type
      // const { profile } = req.query;
      // let query = db.collection('communityTemplates');
      // if (profile) query = query.where('profile', '==', profile);
      const snapshot = await db.collection('communityTemplates').get();
      const templates = [];
      snapshot.forEach(doc => templates.push({ id: doc.id, ...doc.data() }));
      return res.status(200).send(templates);
    } catch (error) {
      console.error('Error getting community templates:', error);
      return res.status(500).send({ error: 'Error getting community templates.' });
    }
  });
});

// --- AI Suggestions Endpoint ---
/**
 * Retrieves all AI suggestions.
 */
exports.getAISuggestions = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');
    try {
      const db = admin.firestore();
      const snapshot = await db.collection('aiSuggestions').get();
      const suggestions = [];
      snapshot.forEach(doc => suggestions.push({ id: doc.id, ...doc.data() }));
      return res.status(200).send(suggestions);
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      return res.status(500).send({ error: 'Error getting AI suggestions.' });
    }
  });
});
console.log('Firebase functions for all core features are ready.');
