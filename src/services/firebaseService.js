import { db, storage, auth } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp, 
  deleteDoc,
  setDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// --- Chat Operations ---

export const createNewChat = async (userId, title = "New Chat") => {
  try {
    const chatRef = await addDoc(collection(db, 'chats'), {
      userId,
      title,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      messages: [] // We might store messages in a subcollection if they get too large, but array is fine for now
    });
    return chatRef.id;
  } catch (error) {
    console.error("Error creating chat:", error);
    throw error;
  }
};

export const getUserChats = async (userId) => {
  try {
    const q = query(
      collection(db, 'chats'), 
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching chats:", error);
    throw error;
  }
};

export const saveMessage = async (chatId, message) => {
  try {
    const chatRef = doc(db, 'chats', chatId);
    const chatSnap = await getDoc(chatRef);
    
    if (chatSnap.exists()) {
      const currentMessages = chatSnap.data().messages || [];
      await updateDoc(chatRef, {
        messages: [...currentMessages, message],
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error("Error saving message:", error);
    throw error;
  }
};

export const updateChatTitle = async (chatId, title) => {
  try {
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, { title });
  } catch (error) {
    console.error("Error updating chat title:", error);
    throw error;
  }
};

export const deleteChat = async (chatId) => {
  try {
    await deleteDoc(doc(db, 'chats', chatId));
  } catch (error) {
    console.error("Error deleting chat:", error);
    throw error;
  }
};

// --- User Settings ---

export const saveUserSettings = async (userId, settings) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, { settings }, { merge: true });
  } catch (error) {
    console.error("Error saving settings:", error);
    throw error;
  }
};

export const getUserSettings = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data().settings;
    }
    return null;
  } catch (error) {
    console.error("Error fetching settings:", error);
    throw error;
  }
};

// --- File Storage ---

export const uploadFileToStorage = async (file, userId) => {
  try {
    const storageRef = ref(storage, `uploads/${userId}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};
