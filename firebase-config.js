// Firebase Configuration
// Konfigurasi Firebase untuk aplikasi IMS Finance

const firebaseConfig = {
    apiKey: "AIzaSyAu9GP9Ie1ohwunpapWBN7H8Kecby2v_qI",
    authDomain: "imsfinance-bf5fb.firebaseapp.com",
    databaseURL: "https://imsfinance-bf5fb-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "imsfinance-bf5fb",
    storageBucket: "imsfinance-bf5fb.firebasestorage.app",
    messagingSenderId: "752636802657",
    appId: "1:752636802657:web:ece790a75cd41660005c20"
};

// Konfigurasi untuk environment yang berbeda
const environments = {
    development: {
        apiKey: "AIzaSyAu9GP9Ie1ohwunpapWBN7H8Kecby2v_qI",
        authDomain: "imsfinance-bf5fb.firebaseapp.com",
        databaseURL: "https://imsfinance-bf5fb-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "imsfinance-bf5fb",
        storageBucket: "imsfinance-bf5fb.firebasestorage.app",
        messagingSenderId: "752636802657",
        appId: "1:752636802657:web:ece790a75cd41660005c20"
    },
    production: {
        apiKey: "AIzaSyAu9GP9Ie1ohwunpapWBN7H8Kecby2v_qI",
        authDomain: "imsfinance-bf5fb.firebaseapp.com",
        databaseURL: "https://imsfinance-bf5fb-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "imsfinance-bf5fb",
        storageBucket: "imsfinance-bf5fb.firebasestorage.app",
        messagingSenderId: "752636802657",
        appId: "1:752636802657:web:ece790a75cd41660005c20"
    }
};

// Deteksi environment berdasarkan URL
function getCurrentEnvironment() {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'development';
    } else {
        return 'production';
    }
}

// Ekspor konfigurasi berdasarkan environment
const currentEnv = getCurrentEnvironment();
const config = environments[currentEnv] || firebaseConfig;

console.log(`Using Firebase config for: ${currentEnv}`);

// Export untuk digunakan di file lain
if (typeof module !== 'undefined' && module.exports) {
    module.exports = config;
} else if (typeof window !== 'undefined') {
    window.firebaseConfig = config;
}

export default config;