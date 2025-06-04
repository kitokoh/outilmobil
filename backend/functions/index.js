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
        name: req.body.name || userRecord.email, // Use name from request body or default to email
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        // Initialize other profile fields as needed
        bio: '',
        avatarUrl: '',
      };
      await db.collection('users').doc(userRecord.uid).set(userProfile);

      return res.status(201).send({ uid: userRecord.uid, email: userRecord.email, name: userProfile.name });
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

    try {
      const db = admin.firestore();
      const userProfileRef = db.collection('users').doc(userId);

      await userProfileRef.set(dataToUpdate, { merge: true }); // Use merge: true to update existing fields or create if not present

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
 * Retrieves reminders for the authenticated user.
 * Optionally filters by profileId and falls back to profile template routines.
 * Requires authentication.
 */
exports.getReminders = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'GET') {
      return res.status(405).send('Method Not Allowed');
    }

    // Authentication check (example, adapt to your auth method if not using callable)
    // For HTTPS onRequest, you'd typically verify an ID token passed in Authorization header
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
    const { profileId } = req.query;

    try {
      const db = admin.firestore();
      let reminders = [];

      // Fetch user-specific reminders
      // If profileId is provided, filter by it as well. Otherwise, fetch all for the user.
      let query = db.collection('reminders').where('userId', '==', userId);
      if (profileId) {
          query = query.where('profileId', '==', profileId);
      }
      const userRemindersSnapshot = await query.get();

      if (!userRemindersSnapshot.empty) {
        userRemindersSnapshot.forEach(doc => {
          reminders.push({ id: doc.id, ...doc.data() });
        });
      }

      // Fallback to profile template routines if no user-specific reminders found for the given profileId
      if (reminders.length === 0 && profileId) {
        const profileTemplateDoc = await db.collection('profileTemplates').doc(profileId).get();
        if (profileTemplateDoc.exists) {
          const templateData = profileTemplateDoc.data();
          if (templateData.routines && Array.isArray(templateData.routines)) {
            reminders = templateData.routines.map(routine => ({
              ...routine, // Spread existing routine properties like id, time, task
              profileId: profileId, // Ensure profileId is set
              userId: userId, // Assign to current user
              isTemplate: true, // Mark as a template, client might handle differently
              // Ensure completed and streak are present as per original store.js logic
              completed: routine.completed !== undefined ? routine.completed : false,
              streak: routine.streak !== undefined ? routine.streak : 0,
            }));
          }
        }
      }

      return res.status(200).send(reminders);
    } catch (error) {
      console.error('Error getting reminders:', error);
      return res.status(500).send({ error: 'Error getting reminders.' });
    }
  });
});

/**
 * Adds a new reminder for the authenticated user.
 * Requires authentication.
 */
exports.addReminder = functions.https.onRequest((req, res) => {
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

    const { task, time, category, priority, profileId } = req.body;
    if (!task || !profileId) { // Added profileId as required based on original structure
      return res.status(400).send({ error: 'Task and profileId are required.' });
    }

    try {
      const db = admin.firestore();
      const newReminder = {
        userId,
        profileId, // Store profileId with the reminder
        task,
        time: time || null,
        category: category || 'personnel',
        priority: priority || 'medium',
        completed: false,
        streak: 0,
        aiOptimized: false, // Default value
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      const docRef = await db.collection('reminders').add(newReminder);
      return res.status(201).send({ id: docRef.id, ...newReminder });
    } catch (error) {
      console.error('Error adding reminder:', error);
      return res.status(500).send({ error: 'Error adding reminder.' });
    }
  });
});

/**
 * Updates an existing reminder for the authenticated user.
 * Can be used for toggling completion or other fields.
 * Requires authentication.
 */
exports.updateReminder = functions.https.onRequest((req, res) => {
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

    const reminderId = req.params.id || req.path.split('/').pop(); // Get ID from path e.g. /reminders/:id
    const dataToUpdate = req.body;

    if (!reminderId) {
        return res.status(400).send({ error: 'Reminder ID is required in the path.' });
    }
    if (Object.keys(dataToUpdate).length === 0) {
        return res.status(400).send({ error: 'No data provided for update.' });
    }
    // Prevent user from updating userId
    if (dataToUpdate.userId) {
        delete dataToUpdate.userId;
    }

    try {
      const db = admin.firestore();
      const reminderRef = db.collection('reminders').doc(reminderId);
      const doc = await reminderRef.get();

      if (!doc.exists) {
        return res.status(404).send({ error: 'Reminder not found.' });
      }
      if (doc.data().userId !== userId) {
        return res.status(403).send({ error: 'User not authorized to update this reminder.' });
      }

      // For PATCH, merge. For PUT, replace (Firestore update does a merge by default for specified fields)
      await reminderRef.update(dataToUpdate);
      const updatedDoc = await reminderRef.get();
      return res.status(200).send({ id: updatedDoc.id, ...updatedDoc.data() });
    } catch (error) {
      console.error('Error updating reminder:', error);
      return res.status(500).send({ error: 'Error updating reminder.' });
    }
  });
});

/**
 * Deletes a reminder for the authenticated user.
 * Requires authentication.
 */
exports.deleteReminder = functions.https.onRequest((req, res) => {
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

    const reminderId = req.params.id || req.path.split('/').pop(); // Get ID from path e.g. /reminders/:id

    if (!reminderId) {
        return res.status(400).send({ error: 'Reminder ID is required in the path.' });
    }

    try {
      const db = admin.firestore();
      const reminderRef = db.collection('reminders').doc(reminderId);
      const doc = await reminderRef.get();

      if (!doc.exists) {
        return res.status(404).send({ error: 'Reminder not found.' });
      }
      if (doc.data().userId !== userId) {
        return res.status(403).send({ error: 'User not authorized to delete this reminder.' });
      }

      await reminderRef.delete();
      return res.status(200).send({ message: 'Reminder deleted successfully.' });
    } catch (error) {
      console.error('Error deleting reminder:', error);
      return res.status(500).send({ error: 'Error deleting reminder.' });
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
        appointments.push({ id: doc.id, ...doc.data() });
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

    const { title, time, date, with: withPerson, type, location, confirmed } = req.body;
    if (!title || !date || !time) {
      return res.status(400).send({ error: 'Title, date, and time are required for an appointment.' });
    }

    try {
      const db = admin.firestore();
      const newAppointment = {
        userId,
        title,
        time,
        date,
        with: withPerson || null,
        type: type || 'personal',
        location: location || null,
        confirmed: confirmed !== undefined ? confirmed : false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      const docRef = await db.collection('appointments').add(newAppointment);
      return res.status(201).send({ id: docRef.id, ...newAppointment });
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
    if (dataToUpdate.userId) { delete dataToUpdate.userId; } // Prevent changing owner

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
      const updatedDoc = await appointmentRef.get();
      return res.status(200).send({ id: updatedDoc.id, ...updatedDoc.data() });
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
