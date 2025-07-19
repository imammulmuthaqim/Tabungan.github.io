// Firebase Configuration Template
// Ganti nilai-nilai di bawah ini dengan konfigurasi Firebase Anda

const firebaseConfig = {
  apiKey: "AIzaSyAu9GP9Ie1ohwunpapWBN7H8Kecby2v_qI",
  authDomain: "imsfinance-bf5fb.firebaseapp.com",
  databaseURL: "https://imsfinance-bf5fb-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "imsfinance-bf5fb",
  storageBucket: "imsfinance-bf5fb.firebasestorage.app",
  messagingSenderId: "752636802657",
  appId: "1:752636802657:web:ece790a75cd41660005c20"
}; 

// Contoh konfigurasi untuk environment yang berbeda
const configs = {
    development: {
        apiKey: "your-dev-api-key",
        authDomain: "your-dev-project.firebaseapp.com",
        databaseURL: "https://your-dev-project-default-rtdb.firebaseio.com",
        projectId: "your-dev-project",
        storageBucket: "your-dev-project.appspot.com",
        messagingSenderId: "123456789012",
        appId: "1:123456789012:web:dev123456789"
    },
    production: {
        apiKey: "your-prod-api-key",
        authDomain: "your-prod-project.firebaseapp.com",
        databaseURL: "https://your-prod-project-default-rtdb.firebaseio.com",
        projectId: "your-prod-project",
        storageBucket: "your-prod-project.appspot.com",
        messagingSenderId: "987654321098",
        appId: "1:987654321098:web:prod987654321"
    }
};

// Pilih konfigurasi berdasarkan environment
const environment = 'development'; // Ganti dengan 'production' untuk production
const selectedConfig = configs[environment];

// Export konfigurasi
export default selectedConfig || firebaseConfig;

