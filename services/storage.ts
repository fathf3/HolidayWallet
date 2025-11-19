import { Trip, Expense } from '../types';
import { firestore } from '../firebaseConfig';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc 
} from "firebase/firestore";

// LocalStorage Fallback Keys
const STORAGE_KEY_TRIPS = 'db_trips';
const STORAGE_KEY_EXPENSES = 'db_expenses';

const generateTripCode = () => {
    return 'TUR-' + Math.random().toString(36).substring(2, 6).toUpperCase();
};

// Helper: LocalStorage Implementation (Fallback)
const localDb = {
    saveTrip: (trip: Trip) => {
        const trips = JSON.parse(localStorage.getItem(STORAGE_KEY_TRIPS) || '{}');
        trips[trip.id] = trip;
        localStorage.setItem(STORAGE_KEY_TRIPS, JSON.stringify(trips));
    },
    getTrip: (id: string): Trip | null => {
        const trips = JSON.parse(localStorage.getItem(STORAGE_KEY_TRIPS) || '{}');
        return trips[id] || null;
    },
    saveExpense: (expense: Expense) => {
        const expenses = JSON.parse(localStorage.getItem(STORAGE_KEY_EXPENSES) || '[]');
        expenses.push(expense);
        localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(expenses));
    },
    getExpenses: (tripId: string): Expense[] => {
        const expenses = JSON.parse(localStorage.getItem(STORAGE_KEY_EXPENSES) || '[]');
        return expenses.filter((e: Expense) => e.tripId === tripId)
            .sort((a: Expense, b: Expense) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
    deleteExpense: (id: string) => {
        const expenses = JSON.parse(localStorage.getItem(STORAGE_KEY_EXPENSES) || '[]');
        const filtered = expenses.filter((e: Expense) => e.id !== id);
        localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(filtered));
    }
};

export const db = {
    // Create Trip
    createTrip: async (tripData: Omit<Trip, 'id'>): Promise<Trip> => {
        const code = generateTripCode();
        const newTrip: Trip = { ...tripData, id: code };

        try {
            await setDoc(doc(firestore, "trips", code), newTrip);
        } catch (error) {
            console.warn("Firestore not available (Permissions/Offline), falling back to local storage:", error);
            localDb.saveTrip(newTrip);
        }
        return newTrip;
    },

    // Get Trip
    getTrip: async (tripId: string): Promise<Trip | null> => {
        try {
            const docRef = doc(firestore, "trips", tripId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return docSnap.data() as Trip;
            }
        } catch (error) {
             console.warn("Firestore read failed, checking local storage:", error);
        }
        // Fallback to local if cloud fails or not found in cloud
        return localDb.getTrip(tripId);
    },

    // Get Expenses
    getExpenses: async (tripId: string): Promise<Expense[]> => {
        try {
            const expensesRef = collection(firestore, "expenses");
            const q = query(expensesRef, where("tripId", "==", tripId));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
                const expenses: Expense[] = [];
                querySnapshot.forEach((doc) => expenses.push(doc.data() as Expense));
                return expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            }
        } catch (error) {
            console.warn("Firestore read expenses failed, checking local storage:", error);
        }
        return localDb.getExpenses(tripId);
    },

    // Add Expense
    addExpense: async (expense: Expense): Promise<Expense> => {
        try {
            await setDoc(doc(firestore, "expenses", expense.id), expense);
        } catch (error) {
            console.warn("Firestore write failed, saving locally:", error);
            localDb.saveExpense(expense);
        }
        return expense;
    },

    // Delete Expense
    deleteExpense: async (tripId: string, expenseId: string): Promise<void> => {
        try {
            await deleteDoc(doc(firestore, "expenses", expenseId));
        } catch (error) {
             console.warn("Firestore delete failed, deleting locally:", error);
             localDb.deleteExpense(expenseId);
        }
    }
};