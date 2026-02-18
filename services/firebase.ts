import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, serverTimestamp, Timestamp, Firestore } from "firebase/firestore";

// ===================================================================================
// PENTING: Ganti nilai placeholder di bawah ini dengan konfigurasi proyek Firebase Anda.
// Anda bisa mendapatkan ini dari Firebase Console (Project Settings > General).
// https://console.firebase.google.com/
// ===================================================================================
const firebaseConfig = {
  apiKey: "GANTI_DENGAN_API_KEY_ANDA",
  authDomain: "GANTI_DENGAN_AUTH_DOMAIN_ANDA",
  projectId: "GANTI_DENGAN_PROJECT_ID_ANDA",
  storageBucket: "GANTI_DENGAN_STORAGE_BUCKET_ANDA",
  messagingSenderId: "GANTI_DENGAN_MESSAGING_SENDER_ID_ANDA",
  appId: "GANTI_DENGAN_APP_ID_ANDA"
};

// Initialize Firebase
let app: FirebaseApp | null = null;
let db: Firestore | null = null;

// Only initialize if the config has been changed from the placeholders.
if (firebaseConfig.apiKey !== "GANTI_DENGAN_API_KEY_ANDA" && firebaseConfig.projectId !== "GANTI_DENGAN_PROJECT_ID_ANDA") {
    try {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
    } catch (e) {
        console.error("Firebase initialization failed. Please check your configuration in services/firebase.ts", e);
    }
} else {
    // This warning is for the developer. It explains why cloud functionality is disabled.
    console.warn("Firebase config is using placeholder values. Cloud backup will be disabled. Please update 'services/firebase.ts'.");
}


// ID dokumen unik di Firestore, sesuai dengan email yang diminta.
const BACKUP_DOC_ID = 'zahragrafika-krw';

/**
 * Menyimpan data aplikasi ke Firestore.
 * @param data Objek data yang akan di-backup.
 */
export const backupDataToFirebase = async (data: object): Promise<void> => {
    if (!db) throw new Error("Firebase tidak terkonfigurasi. Harap periksa file 'services/firebase.ts'.");
    try {
        const backupRef = doc(db, 'backups', BACKUP_DOC_ID);
        await setDoc(backupRef, {
            backupData: data,
            lastBackup: serverTimestamp()
        });
    } catch (error) {
        console.error("Error backing up to Firebase:", error);
        throw new Error("Gagal melakukan backup ke cloud. Pastikan konfigurasi Firebase benar dan ada koneksi internet.");
    }
};

/**
 * Mengambil data backup dari Firestore.
 * @returns Objek yang berisi data backup dan tanggal backup, atau null jika tidak ditemukan.
 */
export const restoreDataFromFirebase = async (): Promise<{ backupData: any, lastBackup: Date } | null> => {
    if (!db) throw new Error("Firebase tidak terkonfigurasi. Harap periksa file 'services/firebase.ts'.");
    try {
        const backupRef = doc(db, 'backups', BACKUP_DOC_ID);
        const docSnap = await getDoc(backupRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const lastBackupTimestamp = data.lastBackup as Timestamp;
            return {
                backupData: data.backupData,
                lastBackup: lastBackupTimestamp ? lastBackupTimestamp.toDate() : new Date()
            };
        } else {
            console.log("No backup document found in Firebase!");
            return null;
        }
    } catch (error) {
        console.error("Error restoring from Firebase:", error);
        throw new Error("Gagal memulihkan data dari cloud. Pastikan konfigurasi Firebase benar dan ada koneksi internet.");
    }
};
