import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Lütfen Firebase Console'dan aldığınız kendi yapılandırma bilgilerinizi buraya girin.
// 1. https://console.firebase.google.com adresine gidin.
// 2. Yeni proje oluşturun.
// 3. Web uygulaması ekleyin (</> ikonu).
// 4. Size verilen config objesini aşağıdaki alanlara yapıştırın.
const firebaseConfig = {
  apiKey: "AIzaSyD-YOUR_API_KEY_HERE",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Firebase uygulamasını başlat
const app = initializeApp(firebaseConfig);

// Firestore veritabanı örneğini al
export const firestore = getFirestore(app);