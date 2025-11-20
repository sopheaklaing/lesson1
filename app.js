// -----------------------------
// 1. ONLINE / OFFLINE DETECTION
// -----------------------------
const statusEl = document.getElementById('status');

function updateOnlineStatus() {
    statusEl.textContent = navigator.onLine ? 'Online' : 'Offline';
}
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus(); // initial check

// -----------------------------
// 2. INDEXEDDB SETUP
// -----------------------------
let db;
const request = indexedDB.open('OfflineDB', 1);

request.onupgradeneeded = function(event) {
    db = event.target.result;
    if (!db.objectStoreNames.contains('dataStore')) {
        db.createObjectStore('dataStore', { autoIncrement: true });
    }
};

request.onsuccess = function(event) {
    db = event.target.result;
    displayData();
};

request.onerror = function(event) {
    console.error('IndexedDB error:', event.target.errorCode);
};

// -----------------------------
// 3. ADD DATA TO INDEXEDDB
// -----------------------------
const form = document.getElementById('dataForm');
form.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    if (!name) return;

    const transaction = db.transaction(['dataStore'], 'readwrite');
    const store = transaction.objectStore('dataStore');
    store.add({ name });

    transaction.oncomplete = function() {
        displayData();
        form.reset();
    };

    transaction.onerror = function(event) {
        console.error('Transaction error:', event.target.errorCode);
    };
});

// -----------------------------
// 4. DISPLAY DATA
// -----------------------------
function displayData() {
    const transaction = db.transaction(['dataStore'], 'readonly');
    const store = transaction.objectStore('dataStore');
    const request = store.getAll();

    request.onsuccess = function() {
        const dataList = document.getElementById('dataList');
        dataList.innerHTML = '';
        request.result.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item.name;
            dataList.appendChild(li);
        });
    };
}

// -----------------------------
// 5. REGISTER SERVICE WORKER
// -----------------------------
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('Service Worker registered'))
        .catch(err => console.error('SW registration failed:', err));
}
