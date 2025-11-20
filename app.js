// ---------------- ONLINE / OFFLINE ----------------
const statusEl = document.getElementById("status");

function updateStatus() {
    statusEl.textContent = navigator.onLine ? "Online" : "Offline";
}
window.addEventListener("online", updateStatus);
window.addEventListener("offline", updateStatus);
updateStatus();

// ---------------- INDEXEDDB SETUP ----------------
let db;
const request = indexedDB.open("TodoDB", 1);

request.onupgradeneeded = function (e) {
    db = e.target.result;
    if (!db.objectStoreNames.contains("todos")) {
        db.createObjectStore("todos", { keyPath: "id", autoIncrement: true });
    }
};

request.onsuccess = function (e) {
    db = e.target.result;
    displayTodos();
};

// ---------------- ADD TASK ----------------
const form = document.getElementById("todoForm");

form.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("taskName").value;
    const desc = document.getElementById("taskDesc").value;

    const tx = db.transaction(["todos"], "readwrite");
    tx.objectStore("todos").add({ name, description: desc });

    tx.oncomplete = () => {
        form.reset();
        displayTodos();
    };
});

// ---------------- DISPLAY TASKS ----------------
function displayTodos() {
    const tx = db.transaction(["todos"], "readonly");
    const req = tx.objectStore("todos").getAll();

    req.onsuccess = () => {
        const list = document.getElementById("todoList");
        list.innerHTML = "";

        req.result.forEach(todo => {
            const li = document.createElement("li");
            li.innerHTML = `
                <strong>${todo.name}</strong><br>
                ${todo.description}
                <div>
                    <button onclick="deleteTodo(${todo.id})">🗑</button>
                </div>`;
            list.appendChild(li);
        });
    };
}

// ---------------- DELETE ----------------
function deleteTodo(id) {
    const tx = db.transaction(["todos"], "readwrite");
    tx.objectStore("todos").delete(id);
    tx.oncomplete = displayTodos;
}

// ---------------- REGISTER SW ----------------
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js");
}
