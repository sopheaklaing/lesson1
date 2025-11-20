// ------------- ONLINE / OFFLINE ----------------
const statusEl = document.getElementById("status");

function updateStatus() {
    statusEl.textContent = navigator.onLine ? "Online" : "Offline";
}
window.addEventListener("online", updateStatus);
window.addEventListener("offline", updateStatus);
updateStatus();

// ------------- INDEXEDDB ----------------
let db;
const req = indexedDB.open("TodoDB", 1);

req.onsuccess = function (e) {
    db = e.target.result;
    loadDashData();
};

// ------------- ADD FROM DASHBOARD ----------------
const form = document.getElementById("dashboardForm");

form.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("dashName").value;
    const desc = document.getElementById("dashDesc").value;

    const tx = db.transaction(["todos"], "readwrite");
    tx.objectStore("todos").add({ name, description: desc });

    tx.oncomplete = () => {
        form.reset();
        loadDashData();
    };
});

// ------------- LOAD DATA ----------------
function loadDashData() {
    const tx = db.transaction(["todos"], "readonly");
    const req = tx.objectStore("todos").getAll();

    req.onsuccess = () => {
        const list = document.getElementById("dashList");
        list.innerHTML = "";
        req.result.forEach(todo => {
            const li = document.createElement("li");
            li.innerHTML = `
                <strong>${todo.name}</strong><br>
                ${todo.description}
                <button onclick="deleteDash(${todo.id})">🗑</button>
            `;
            list.appendChild(li);
        });
    };
}

// ------------- DELETE ----------------
function deleteDash(id) {
    const tx = db.transaction(["todos"], "readwrite");
    tx.objectStore("todos").delete(id);
    tx.oncomplete = loadDashData;
}
