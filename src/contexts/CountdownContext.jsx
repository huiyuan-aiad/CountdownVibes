import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase/config';

const CountdownContext = createContext();

export function useCountdown() {
  return useContext(CountdownContext);
}

export function CountdownProvider({ children }) {
  const [countdowns, setCountdowns] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth() || {};

  // Predefined categories
  const predefinedCategories = [
    { name: 'Celebrations', color: '#10b981' },
    { name: 'Milestones', color: '#3b82f6' },
    { name: 'Deadlines', color: '#ef4444' },
  ];

  // Load countdowns from Firestore
  useEffect(() => {
    setLoading(true);
    
    // Initialize with predefined categories
    setCategories([...predefinedCategories]);
    
    if (!currentUser) {
      setCountdowns([]);
      setLoading(false);
      return;
    }
    
    const countdownsRef = collection(db, 'countdowns');
    const userCountdownsQuery = query(countdownsRef, where('userId', '==', currentUser.uid));
    
    const unsubscribe = onSnapshot(userCountdownsQuery, (snapshot) => {
      const countdownsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setCountdowns(countdownsData);
      
      // Extract unique categories from countdowns
      const uniqueCategories = [...new Set(countdownsData.map(c => c.category))];
      const customCategories = uniqueCategories
        .filter(cat => !predefinedCategories.some(pc => pc.name === cat))
        .map(cat => {
          const countdown = countdownsData.find(c => c.category === cat);
          return {
            name: cat,
            color: countdown?.color || '#4f46e5'
          };
        });
      
      setCategories([...predefinedCategories, ...customCategories]);
      setLoading(false);
    });
    
    return unsubscribe;
  }, [currentUser]);

  // Add a new countdown
  async function addCountdown(countdownData) {
    if (!currentUser) {
      throw new Error('You must be logged in to add a countdown');
    }
    
    try {
      const docRef = await addDoc(collection(db, 'countdowns'), {
        ...countdownData,
        userId: currentUser.uid,
        createdAt: new Date().toISOString()
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error adding countdown:', error);
      throw error;
    }
  }

  // Update an existing countdown
  async function updateCountdown(id, countdownData) {
    if (!currentUser) {
      throw new Error('You must be logged in to update a countdown');
    }
    
    try {
      const countdownRef = doc(db, 'countdowns', id);
      await updateDoc(countdownRef, {
        ...countdownData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating countdown:', error);
      throw error;
    }
  }

  // Delete a countdown
  async function deleteCountdown(id) {
    if (!currentUser) {
      throw new Error('You must be logged in to delete a countdown');
    }
    
    try {
      await deleteDoc(doc(db, 'countdowns', id));
    } catch (error) {
      console.error('Error deleting countdown:', error);
      throw error;
    }
  }

  // Get a specific countdown by ID
  function getCountdown(id) {
    return countdowns.find(countdown => countdown.id === id);
  }

  // Add a new category
  function addCategory(categoryData) {
    // Check if category already exists
    if (categories.some(cat => cat.name === categoryData.name)) {
      return; // Category already exists
    }
    
    setCategories(prev => [...prev, categoryData]);
  }

  // Delete a category
  function deleteCategory(categoryName) {
    // Check if category is in use
    if (countdowns.some(countdown => countdown.category === categoryName)) {
      throw new Error('Cannot delete a category that is in use');
    }
    
    // Check if it's a predefined category
    if (predefinedCategories.some(cat => cat.name === categoryName)) {
      throw new Error('Cannot delete a predefined category');
    }
    
    setCategories(prev => prev.filter(cat => cat.name !== categoryName));
  }

  const value = {
    countdowns,
    categories,
    predefinedCategories,
    loading,
    addCountdown,
    updateCountdown,
    deleteCountdown,
    getCountdown,
    addCategory,
    deleteCategory
  };

  return (
    <CountdownContext.Provider value={value}>
      {children}
    </CountdownContext.Provider>
  );
}