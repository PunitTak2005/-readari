import { useState, useEffect } from 'react';
import { 
  db, 
  auth, 
  isFirebaseConfigured, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocFromServer,
  updateDoc
} from '../lib/firebase.js';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors.js';
import { onAuthStateChanged } from 'firebase/auth';

const LOCAL_STORAGE_KEY_BASE = 'book_tracker_books';
const USERS_LOCAL_STORAGE_KEY = 'readari_local_users';
const ACTIVE_SESSION_USER_KEY = 'readari_active_session_user';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function useBooks() {
  const [books, setBooks] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dbLoading, setDbLoading] = useState(false);

  const getLocalStorageKey = () => {
    return currentUser ? `${LOCAL_STORAGE_KEY_BASE}_${currentUser.uid}` : LOCAL_STORAGE_KEY_BASE;
  };

  // Monitor Firebase & Local Authentication
  useEffect(() => {
    // 1. Initial check of local session
    const localSessionUser = localStorage.getItem(ACTIVE_SESSION_USER_KEY);
    let initialUser = null;
    if (localSessionUser) {
      try {
        initialUser = JSON.parse(localSessionUser);
        setCurrentUser(initialUser);
      } catch (e) {
        console.error("Local session user parse error", e);
      }
    }

    if (!isFirebaseConfigured || !auth) {
      setAuthLoading(false);
      // Load current template books directly
      const key = initialUser ? `${LOCAL_STORAGE_KEY_BASE}_${initialUser.uid}` : LOCAL_STORAGE_KEY_BASE;
      const cached = localStorage.getItem(key);
      if (cached) {
        try {
          const list = JSON.parse(cached).map(b => ({
            ...b,
            rating: Number(b.rating) || 0,
            currentPage: Number(b.currentPage) || 0,
            totalPages: Number(b.totalPages) || 0
          }));
          setBooks(list);
        } catch (e) {
          console.error("Error parsing local books:", e);
        }
      }
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setCurrentUser({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName,
          photoURL: fbUser.photoURL,
          isLocal: false
        });
      } else {
        const sessionUser = localStorage.getItem(ACTIVE_SESSION_USER_KEY);
        if (sessionUser) {
          try {
            setCurrentUser(JSON.parse(sessionUser));
          } catch {
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Setup Firestore synchronization or LocalStorage subscription
  useEffect(() => {
    if (authLoading) return;

    if (isFirebaseConfigured && db && currentUser && !currentUser.isLocal) {
      setDbLoading(true);
      const collectionPath = `users/${currentUser.uid}/books`;
      const booksRef = collection(db, 'users', currentUser.uid, 'books');

      // Test Connection per Firebase Spec
      const testConnection = async () => {
        try {
          await getDocFromServer(doc(db, 'test', 'connection'));
        } catch (error) {
          if (error instanceof Error && error.message.includes('the client is offline')) {
            console.warn("Firebase client reports as offline. Working in cached mode.");
          }
        }
      };
      testConnection();

      // Realtime listener
      const unsubscribe = onSnapshot(booksRef, 
        (snapshot) => {
          const list = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            list.push({
              id: docSnap.id,
              title: data.title || '',
              author: data.author || '',
              status: data.status || 'want-to-read',
              rating: Number(data.rating) || 0,
              review: data.review || '',
              currentPage: Number(data.currentPage) || 0,
              totalPages: Number(data.totalPages) || 0,
              notes: data.notes || '',
              coverImage: data.coverImage || '',
              currentChapter: data.currentChapter || '',
              createdAt: data.createdAt || new Date().toISOString(),
              updatedAt: data.updatedAt || new Date().toISOString(),
            });
          });
          
          // Sort by updatedAt descending
          list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
          
          setBooks(list);
          setDbLoading(false);

          // Keep a local storage warm backup for offline instant boot
          localStorage.setItem(getLocalStorageKey(), JSON.stringify(list));
        },
        (error) => {
          setDbLoading(false);
          handleFirestoreError(error, OperationType.LIST, collectionPath);
        }
      );

      return () => unsubscribe();
    } else if (currentUser && currentUser.isLocal) {
      // Fetch books from Express SQLite backend
      const fetchLocalBooks = async () => {
        setDbLoading(true);
        try {
          const response = await fetch(`${API_BASE_URL}/api/books`, {
            headers: {
              'X-User-Id': currentUser.uid
            }
          });
          const data = await response.json();
          if (data.success && data.books) {
            const sanitized = data.books.map(b => ({
              ...b,
              rating: Number(b.rating) || 0,
              currentPage: Number(b.currentPage) || 0,
              totalPages: Number(b.totalPages) || 0
            }));
            setBooks(sanitized);
          } else {
            console.error("Failed to load backend books:", data.error);
          }
        } catch (error) {
          console.error("Error loading books from backend sqlite:", error);
        } finally {
          setDbLoading(false);
        }
      };
      fetchLocalBooks();
    } else {
      // Local Storage only (Local Auth / Sandbox Mode)
      const cached = localStorage.getItem(getLocalStorageKey());
      if (cached) {
        try {
          const list = JSON.parse(cached).map(b => ({
            ...b,
            rating: Number(b.rating) || 0,
            currentPage: Number(b.currentPage) || 0,
            totalPages: Number(b.totalPages) || 0
          }));
          list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
          setBooks(list);
        } catch (e) {
          console.error("Local storage decode issue:", e);
        }
      } else {
        setBooks([]);
      }
      setDbLoading(false);
    }
  }, [currentUser, authLoading]);

  // Operations: Add Book
  const addBook = async (bookInput) => {
    const newId = 'bk_' + Math.random().toString(36).substring(2, 15);
    const timeStr = new Date().toISOString();
    const newBook = {
      ...bookInput,
      id: newId,
      rating: Number(bookInput.rating) || 0,
      currentPage: Number(bookInput.currentPage) || 0,
      totalPages: Number(bookInput.totalPages) || 0,
      createdAt: timeStr,
      updatedAt: timeStr,
    };

    if (isFirebaseConfigured && db && currentUser && !currentUser.isLocal) {
      const path = `users/${currentUser.uid}/books/${newId}`;
      try {
        const bookDocRef = doc(db, 'users', currentUser.uid, 'books', newId);
        await setDoc(bookDocRef, {
          title: newBook.title,
          author: newBook.author,
          status: newBook.status,
          rating: parseInt(newBook.rating.toString(), 10),
          currentPage: parseInt(newBook.currentPage.toString(), 10),
          totalPages: parseInt(newBook.totalPages.toString(), 10),
          review: newBook.review,
          notes: newBook.notes,
          coverImage: newBook.coverImage || '',
          currentChapter: newBook.currentChapter || '',
          createdAt: newBook.createdAt,
          updatedAt: newBook.updatedAt,
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    } else if (currentUser && currentUser.isLocal) {
      // Save to Express SQLite backend!
      try {
        const response = await fetch(`${API_BASE_URL}/api/books`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': currentUser.uid
          },
          body: JSON.stringify(newBook)
        });
        const data = await response.json();
        if (data.success && data.book) {
          const sanitized = {
            ...data.book,
            rating: Number(data.book.rating) || 0,
            currentPage: Number(data.book.currentPage) || 0,
            totalPages: Number(data.book.totalPages) || 0
          };
          setBooks((prev) => [sanitized, ...prev]);
        } else {
          console.error("Failed to save book to backend:", data.error);
        }
      } catch (error) {
        console.error("Error saving book to backend sqlite:", error);
      }
    } else {
      // Local save
      const updatedList = [newBook, ...books];
      setBooks(updatedList);
      localStorage.setItem(getLocalStorageKey(), JSON.stringify(updatedList));
    }
  };

  // Operations: Update Book
  const updateBook = async (bookId, updates) => {
    const timeStr = new Date().toISOString();
    
    if (isFirebaseConfigured && db && currentUser && !currentUser.isLocal) {
      const path = `users/${currentUser.uid}/books/${bookId}`;
      try {
        const bookDocRef = doc(db, 'users', currentUser.uid, 'books', bookId);
        const firestoreUpdates = {
          updatedAt: timeStr,
        };

        if (updates.title !== undefined) firestoreUpdates.title = updates.title;
        if (updates.author !== undefined) firestoreUpdates.author = updates.author;
        if (updates.status !== undefined) firestoreUpdates.status = updates.status;
        if (updates.rating !== undefined) firestoreUpdates.rating = parseInt(updates.rating.toString(), 10);
        if (updates.currentPage !== undefined) firestoreUpdates.currentPage = parseInt(updates.currentPage.toString(), 10);
        if (updates.totalPages !== undefined) firestoreUpdates.totalPages = parseInt(updates.totalPages.toString(), 10);
        if (updates.review !== undefined) firestoreUpdates.review = updates.review;
        if (updates.notes !== undefined) firestoreUpdates.notes = updates.notes;
        if (updates.coverImage !== undefined) firestoreUpdates.coverImage = updates.coverImage;
        if (updates.currentChapter !== undefined) firestoreUpdates.currentChapter = updates.currentChapter;

        await updateDoc(bookDocRef, firestoreUpdates);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    } else if (currentUser && currentUser.isLocal) {
      // Save update to Express SQLite backend!
      try {
        const response = await fetch(`${API_BASE_URL}/api/books/${bookId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': currentUser.uid
          },
          body: JSON.stringify({
            ...updates,
            updatedAt: timeStr
          })
        });
        const data = await response.json();
        if (data.success && data.book) {
          const sanitized = {
            ...data.book,
            rating: Number(data.book.rating) || 0,
            currentPage: Number(data.book.currentPage) || 0,
            totalPages: Number(data.book.totalPages) || 0
          };
          setBooks((prev) => prev.map((b) => (b.id === bookId ? sanitized : b)));
        } else {
          console.error("Failed to update book on backend:", data.error);
        }
      } catch (error) {
        console.error("Error updating book on backend sqlite:", error);
      }
    } else {
      // Local update
      const updatedList = books.map((b) => {
        if (b.id === bookId) {
          const merged = {
            ...b,
            ...updates,
            updatedAt: timeStr,
          };
          return {
            ...merged,
            rating: Number(merged.rating) || 0,
            currentPage: Number(merged.currentPage) || 0,
            totalPages: Number(merged.totalPages) || 0
          };
        }
        return b;
      });
      setBooks(updatedList);
      localStorage.setItem(getLocalStorageKey(), JSON.stringify(updatedList));
    }
  };

  // Operations: Delete Book
  const deleteBook = async (bookId) => {
    if (isFirebaseConfigured && db && currentUser && !currentUser.isLocal) {
      const path = `users/${currentUser.uid}/books/${bookId}`;
      try {
        const bookDocRef = doc(db, 'users', currentUser.uid, 'books', bookId);
        await deleteDoc(bookDocRef);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    } else if (currentUser && currentUser.isLocal) {
      // Delete from Express SQLite backend!
      try {
        const response = await fetch(`${API_BASE_URL}/api/books/${bookId}`, {
          method: 'DELETE',
          headers: {
            'X-User-Id': currentUser.uid
          }
        });
        const data = await response.json();
        if (data.success) {
          setBooks((prev) => prev.filter((b) => b.id !== bookId));
        } else {
          console.error("Failed to delete book on backend:", data.error);
        }
      } catch (error) {
        console.error("Error deleting book on backend sqlite:", error);
      }
    } else {
      // Local delete
      const updatedList = books.filter((b) => b.id !== bookId);
      setBooks(updatedList);
      localStorage.setItem(getLocalStorageKey(), JSON.stringify(updatedList));
    }
  };

  // Merge sandbox books into account on sign-in
  const syncSandboxBooks = async (sandboxBooks) => {
    if (!currentUser || sandboxBooks.length === 0) return;
    
    setDbLoading(true);
    if (isFirebaseConfigured && db && !currentUser.isLocal) {
      for (const localBk of sandboxBooks) {
        const path = `users/${currentUser.uid}/books/${localBk.id}`;
        const bookDocRef = doc(db, 'users', currentUser.uid, 'books', localBk.id);
        try {
          await setDoc(bookDocRef, {
            title: localBk.title,
            author: localBk.author,
            status: localBk.status,
            rating: localBk.rating,
            currentPage: localBk.currentPage,
            totalPages: localBk.totalPages,
            review: localBk.review,
            notes: localBk.notes,
            coverImage: localBk.coverImage || '',
            currentChapter: localBk.currentChapter || '',
            createdAt: localBk.createdAt,
            updatedAt: localBk.updatedAt,
          });
        } catch (error) {
          console.error("Error setting merged doc:", error);
        }
      }
    } else if (currentUser.isLocal) {
      // SQLite backend merge
      for (const localBk of sandboxBooks) {
        try {
          await fetch(`${API_BASE_URL}/api/books`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-User-Id': currentUser.uid
            },
            body: JSON.stringify(localBk)
          });
        } catch (error) {
          console.error("Error syncing sandbox book to SQLite:", error);
        }
      }
    }
    setDbLoading(false);
  };

  // Local signup authentication system
  const registerLocalUser = async (email, name, password) => {
    if (!email || !name || !password) {
      return { success: false, error: "Please enter all required fields." };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, name, password })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        return { success: false, error: data.error || 'Registration failed. Please try again.' };
      }

      const activeUserSession = {
        uid: data.user.uid,
        email: data.user.email,
        displayName: data.user.displayName,
        isLocal: true
      };

      localStorage.setItem(ACTIVE_SESSION_USER_KEY, JSON.stringify(activeUserSession));
      setCurrentUser(activeUserSession);
      return { success: true };
    } catch (e) {
      console.error('Register API error:', e);
      return { success: false, error: 'Unable to connect to backend. Please try again.' };
    }
  };

  const loginLocalUser = async (email, password) => {
    if (!email || !password) {
      return { success: false, error: "Please enter email and password." };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        return { success: false, error: data.error || 'Invalid email or password.' };
      }

      const activeUser = {
        uid: data.user.uid,
        email: data.user.email,
        displayName: data.user.displayName,
        isLocal: true
      };

      localStorage.setItem(ACTIVE_SESSION_USER_KEY, JSON.stringify(activeUser));
      setCurrentUser(activeUser);
      return { success: true };
    } catch (e) {
      console.error('Login API error:', e);
      return { success: false, error: 'Unable to connect to backend. Please try again.' };
    }
  };

  const logoutUser = async () => {
    localStorage.removeItem(ACTIVE_SESSION_USER_KEY);
    setCurrentUser(null);
    if (isFirebaseConfigured && auth) {
      try {
        const { signOut: fbSignOut } = await import('firebase/auth');
        await fbSignOut(auth);
      } catch (e) {
        console.error("Firebase logout error:", e);
      }
    }
  };

  return {
    books,
    isLoading: authLoading || dbLoading,
    currentUser,
    isFirebaseConfigured,
    addBook,
    updateBook,
    deleteBook,
    syncSandboxBooks,
    registerLocalUser,
    loginLocalUser,
    logoutUser,
  };
}
