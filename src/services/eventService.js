// services/eventService.js

import { db } from "../firebase.ts";
import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy
} from "firebase/firestore";

const COLLECTION_NAME = "events";

/**
 * 🔥 Crear evento
 */
export const createEvent = async (eventData) => {
  //console.log('(S) createEvent');

  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...eventData,
      createdAt: serverTimestamp()
    });
    //console.log("(S) Evento creado con ID:", docRef.id);

    return docRef.id;
  } catch (error) {
    console.error("(S) createEvent error:", error);
    throw error;
  }
};

/**
 * 📥 Obtener eventos (una sola vez)
 */
export const getEvents = async () => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("(S) getEvents error:", error);
    throw error;
  }
};

/**
 * 👀 Escuchar eventos en tiempo real
 * @param {Function} callback - función que recibe los eventos
 * @returns unsubscribe function
 */
export const subscribeToEvents = (callback) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    orderBy("createdAt", "desc")
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    callback(events);
  });

  return unsubscribe;
};

/**
 * ✏️ Actualizar evento
 */
export const updateEvent = async (eventId, updatedData) => {
  try {
    const ref = doc(db, COLLECTION_NAME, eventId);

    await updateDoc(ref, {
      ...updatedData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("(S) updateEvent error:", error);
    throw error;
  }
};

/**
 * 🗑️ Eliminar evento
 */
export const deleteEvent = async (eventId) => {
  try {
    const ref = doc(db, COLLECTION_NAME, eventId);
    await deleteDoc(ref);
  } catch (error) {
    console.error("(S) deleteEvent error:", error);
    throw error;
  }
};