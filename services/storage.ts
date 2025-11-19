import { Trip, Expense } from '../types';
import { firestore } from '../firebaseConfig';
import { 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs, 
    addDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy
} from 'firebase/firestore';

// Benzersiz Tur Kodu Üretici (Örn: TUR-X9Y2)
const generateTripCode = () => {
    return 'TUR-' + Math.random().toString(36).substring(2, 6).toUpperCase();
};

export const db = {
    // Tur Oluştur (Firestore'a kaydeder)
    createTrip: async (tripData: Omit<Trip, 'id'>): Promise<Trip> => {
        const code = generateTripCode();
        const newTrip: Trip = {
            ...tripData,
            id: code,
        };

        try {
            // "trips" koleksiyonuna, ID'si tur kodu olacak şekilde döküman ekle
            await setDoc(doc(firestore, "trips", code), newTrip);
            return newTrip;
        } catch (error) {
            console.error("Tur oluşturma hatası:", error);
            throw error;
        }
    },

    // Tur Koduna Göre Getir
    getTrip: async (tripId: string): Promise<Trip | null> => {
        try {
            const docRef = doc(firestore, "trips", tripId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return docSnap.data() as Trip;
            } else {
                return null;
            }
        } catch (error) {
            console.error("Tur getirme hatası:", error);
            return null;
        }
    },

    // Tura Ait Harcamaları Getir
    getExpenses: async (tripId: string): Promise<Expense[]> => {
        try {
            const expensesRef = collection(firestore, "expenses");
            // tripId'ye göre filtrele
            const q = query(expensesRef, where("tripId", "==", tripId));
            
            const querySnapshot = await getDocs(q);
            const expenses: Expense[] = [];
            
            querySnapshot.forEach((doc) => {
                expenses.push(doc.data() as Expense);
            });

            // Tarihe göre yeniden eskiye sırala (Javascript tarafında sıralama yapıyoruz)
            // Firestore'da composite index oluşturmamak için bu yöntem daha pratik
            return expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        } catch (error) {
            console.error("Harcamaları getirme hatası:", error);
            return [];
        }
    },

    // Harcama Ekle
    addExpense: async (expense: Expense): Promise<Expense> => {
        try {
            // Expenses koleksiyonunda, harcamanın kendi ID'sini döküman ID'si olarak kullanalım
            // Böylece silme işlemi kolaylaşır.
            await setDoc(doc(firestore, "expenses", expense.id), expense);
            return expense;
        } catch (error) {
            console.error("Harcama ekleme hatası:", error);
            throw error;
        }
    },

    // Harcama Sil
    deleteExpense: async (tripId: string, expenseId: string): Promise<void> => {
        try {
            await deleteDoc(doc(firestore, "expenses", expenseId));
        } catch (error) {
            console.error("Harcama silme hatası:", error);
            throw error;
        }
    }
};