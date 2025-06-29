// Firebase Configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    deleteDoc, 
    doc, 
    query, 
    orderBy,
    where
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyBv31cJC19G5Aoa5LTgaeXRdpN84z5TKsY",
    authDomain: "imammulmu322.firebaseapp.com",
    projectId: "imammulmu322",
    storageBucket: "imammulmu322.firebasestorage.app",
    messagingSenderId: "1048023716189",
    appId: "1:1048023716189:web:e467f867fdd91c4ed518b4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Global variables
let savingsData = [];
let currentDeleteId = null;

// DOM Elements
const savingsForm = document.getElementById('savingsForm');
const amountInput = document.getElementById('amount');
const monthSelect = document.getElementById('month');
const yearSelect = document.getElementById('year');
const submitBtn = document.getElementById('submitBtn');
const loadingSpinner = document.getElementById('loadingSpinner');
const historyLoading = document.getElementById('historyLoading');
const historyContent = document.getElementById('historyContent');
const emptyState = document.getElementById('emptyState');
const historyTable = document.getElementById('historyTable');
const historyTableBody = document.getElementById('historyTableBody');
const totalSavingsEl = document.getElementById('totalSavings');
const totalMonthsEl = document.getElementById('totalMonths');
const averageSavingsEl = document.getElementById('averageSavings');
const filterYearSelect = document.getElementById('filterYear');
const exportBtn = document.getElementById('exportBtn');
const deleteModal = document.getElementById('deleteModal');
const deleteDetails = document.getElementById('deleteDetails');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const toast = document.getElementById('toast');

// Month names in Indonesian
const monthNames = [
    '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    populateYearOptions();
    setCurrentMonthYear();
    loadSavingsData();
    setupEventListeners();
}

function populateYearOptions() {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 5;
    const endYear = currentYear + 5;
    
    // Clear existing options except the first one
    yearSelect.innerHTML = '<option value="">Pilih Tahun</option>';
    filterYearSelect.innerHTML = '<option value="">Semua Tahun</option>';
    
    for (let year = endYear; year >= startYear; year--) {
        const option = new Option(year, year);
        const filterOption = new Option(year, year);
        yearSelect.appendChild(option);
        filterYearSelect.appendChild(filterOption);
    }
}

function setCurrentMonthYear() {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    monthSelect.value = currentMonth;
    yearSelect.value = currentYear;
}

function setupEventListeners() {
    savingsForm.addEventListener('submit', handleFormSubmit);
    filterYearSelect.addEventListener('change', filterSavingsByYear);
    exportBtn.addEventListener('click', exportToCSV);
    confirmDeleteBtn.addEventListener('click', confirmDelete);
    
    // Input validation
    amountInput.addEventListener('input', validateAmount);
    amountInput.addEventListener('blur', formatAmount);
    
    // Auto-hide toast after 5 seconds
    let toastTimeout;
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'class' && toast.classList.contains('show')) {
                clearTimeout(toastTimeout);
                toastTimeout = setTimeout(hideToast, 5000);
            }
        });
    });
    observer.observe(toast, { attributes: true, attributeFilter: ['class'] });
}

function validateAmount() {
    const amount = parseFloat(amountInput.value);
    const errorEl = document.getElementById('amountError');
    
    if (amountInput.value && (isNaN(amount) || amount <= 0)) {
        errorEl.textContent = 'Jumlah harus berupa angka positif';
        amountInput.style.borderColor = '#e53e3e';
        return false;
    } else if (amount > 99999999) {
        errorEl.textContent = 'Jumlah maksimal 99.999.999';
        amountInput.style.borderColor = '#e53e3e';
        return false;
    } else {
        errorEl.textContent = '';
        amountInput.style.borderColor = '#e2e8f0';
        return true;
    }
}

function formatAmount() {
    const amount = parseFloat(amountInput.value);
    if (!isNaN(amount) && amount > 0) {
        amountInput.value = Math.floor(amount);
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    const formData = new FormData(savingsForm);
    const amount = parseInt(formData.get('amount'));
    const month = parseInt(formData.get('month'));
    const year = parseInt(formData.get('year'));
    
    // Check if entry already exists
    const existingEntry = savingsData.find(item => 
        item.month === month && item.year === year
    );
    
    if (existingEntry) {
        showToast('Data untuk bulan dan tahun tersebut sudah ada!', 'error');
        return;
    }
    
    setLoading(true);
    
    try {
        const savingData = {
            amount: amount,
            month: month,
            year: year,
            createdAt: new Date(),
            monthName: monthNames[month]
        };
        
        const docRef = await addDoc(collection(db, 'savings'), savingData);
        
        // Add to local data with the document ID
        savingsData.push({
            id: docRef.id,
            ...savingData
        });
        
        showToast('Tabungan berhasil disimpan!', 'success');
        savingsForm.reset();
        setCurrentMonthYear();
        updateStatistics();
        renderSavingsHistory();
        updateFilterOptions();
        
    } catch (error) {
        console.error('Error adding document: ', error);
        showToast('Gagal menyimpan data. Silakan coba lagi.', 'error');
    } finally {
        setLoading(false);
    }
}

function validateForm() {
    let isValid = true;
    
    // Validate amount
    if (!validateAmount()) {
        isValid = false;
    }
    
    // Validate month
    const monthError = document.getElementById('monthError');
    if (!monthSelect.value) {
        monthError.textContent = 'Pilih bulan';
        monthSelect.style.borderColor = '#e53e3e';
        isValid = false;
    } else {
        monthError.textContent = '';
        monthSelect.style.borderColor = '#e2e8f0';
    }
    
    // Validate year
    const yearError = document.getElementById('yearError');
    if (!yearSelect.value) {
        yearError.textContent = 'Pilih tahun';
        yearSelect.style.borderColor = '#e53e3e';
        isValid = false;
    } else {
        yearError.textContent = '';
        yearSelect.style.borderColor = '#e2e8f0';
    }
    
    return isValid;
}

function setLoading(loading) {
    if (loading) {
        submitBtn.disabled = true;
        submitBtn.querySelector('span').style.display = 'none';
        loadingSpinner.style.display = 'block';
    } else {
        submitBtn.disabled = false;
        submitBtn.querySelector('span').style.display = 'inline';
        loadingSpinner.style.display = 'none';
    }
}

async function loadSavingsData() {
    historyLoading.style.display = 'block';
    historyContent.style.display = 'none';
    
    try {
        const q = query(collection(db, 'savings'), orderBy('year', 'desc'), orderBy('month', 'desc'));
        const querySnapshot = await getDocs(q);
        
        savingsData = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            savingsData.push({
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate() || new Date()
            });
        });
        
        updateStatistics();
        renderSavingsHistory();
        updateFilterOptions();
        
    } catch (error) {
        console.error('Error loading data: ', error);
        showToast('Gagal memuat data. Silakan refresh halaman.', 'error');
    } finally {
        historyLoading.style.display = 'none';
        historyContent.style.display = 'block';
    }
}

function updateStatistics() {
    const total = savingsData.reduce((sum, item) => sum + item.amount, 0);
    const count = savingsData.length;
    const average = count > 0 ? total / count : 0;
    
    totalSavingsEl.textContent = formatCurrency(total);
    totalMonthsEl.textContent = count;
    averageSavingsEl.textContent = formatCurrency(average);
}

function renderSavingsHistory() {
    const filteredData = getFilteredData();
    
    if (filteredData.length === 0) {
        emptyState.style.display = 'block';
        historyTable.style.display = 'none';
        return;
    }
    
    emptyState.style.display = 'none';
    historyTable.style.display = 'block';
    
    historyTableBody.innerHTML = '';
    
    filteredData.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.monthName || monthNames[item.month]}</td>
            <td>${item.year}</td>
            <td class="amount-cell">${formatCurrency(item.amount)}</td>
            <td class="date-cell">${formatDate(item.createdAt)}</td>
            <td class="action-cell">
                <button class="btn-danger" onclick="showDeleteModal('${item.id}', '${item.monthName || monthNames[item.month]} ${item.year}', ${item.amount})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        historyTableBody.appendChild(row);
    });
}

function getFilteredData() {
    const selectedYear = filterYearSelect.value;
    if (!selectedYear) {
        return savingsData;
    }
    return savingsData.filter(item => item.year.toString() === selectedYear);
}

function filterSavingsByYear() {
    renderSavingsHistory();
}

function updateFilterOptions() {
    const years = [...new Set(savingsData.map(item => item.year))].sort((a, b) => b - a);
    const currentOptions = Array.from(filterYearSelect.options).slice(1).map(option => parseInt(option.value));
    
    // Add new years that aren't already in the filter
    years.forEach(year => {
        if (!currentOptions.includes(year)) {
            const option = new Option(year, year);
            filterYearSelect.appendChild(option);
        }
    });
}

function showDeleteModal(id, monthYear, amount) {
    currentDeleteId = id;
    deleteDetails.textContent = `${monthYear} - ${formatCurrency(amount)}`;
    deleteModal.classList.add('show');
}

function closeDeleteModal() {
    deleteModal.classList.remove('show');
    currentDeleteId = null;
}

async function confirmDelete() {
    if (!currentDeleteId) return;
    
    confirmDeleteBtn.disabled = true;
    confirmDeleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menghapus...';
    
    try {
        await deleteDoc(doc(db, 'savings', currentDeleteId));
        
        // Remove from local data
        savingsData = savingsData.filter(item => item.id !== currentDeleteId);
        
        updateStatistics();
        renderSavingsHistory();
        closeDeleteModal();
        showToast('Data berhasil dihapus!', 'success');
        
    } catch (error) {
        console.error('Error deleting document: ', error);
        showToast('Gagal menghapus data. Silakan coba lagi.', 'error');
    } finally {
        confirmDeleteBtn.disabled = false;
        confirmDeleteBtn.innerHTML = 'Hapus';
    }
}

function exportToCSV() {
    if (savingsData.length === 0) {
        showToast('Tidak ada data untuk diekspor', 'error');
        return;
    }
    
    const filteredData = getFilteredData();
    const csvContent = generateCSV(filteredData);
    downloadCSV(csvContent, 'tabungan-bulanan.csv');
    showToast('Data berhasil diekspor!', 'success');
}

function generateCSV(data) {
    const headers = ['Bulan', 'Tahun', 'Jumlah', 'Tanggal Input'];
    const rows = data.map(item => [
        item.monthName || monthNames[item.month],
        item.year,
        item.amount,
        formatDate(item.createdAt)
    ]);
    
    const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
    
    return csvContent;
}

function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

function showToast(message, type = 'success') {
    const toastIcon = toast.querySelector('.toast-icon');
    const toastMessage = toast.querySelector('.toast-message');
    
    toast.className = `toast ${type}`;
    toastMessage.textContent = message;
    
    if (type === 'success') {
        toastIcon.className = 'toast-icon fas fa-check-circle';
    } else {
        toastIcon.className = 'toast-icon fas fa-exclamation-circle';
    }
    
    toast.classList.add('show');
}

function hideToast() {
    toast.classList.remove('show');
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

// Make functions available globally for onclick handlers
window.showDeleteModal = showDeleteModal;
window.closeDeleteModal = closeDeleteModal;
window.hideToast = hideToast;