// -----------------------------------
// ONLINE / OFFLINE STATUS
// -----------------------------------
const statusEl = document.getElementById("status");

function updateStatus() {
    statusEl.textContent = navigator.onLine ? "Online" : "Offline";
}
window.addEventListener("online", updateStatus);
window.addEventListener("offline", updateStatus);
updateStatus();

// -----------------------------------
// INDEXEDDB SETUP
// -----------------------------------
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

// -----------------------------------
// ADD TASK
// -----------------------------------
const form = document.getElementById("todoForm");

form.addEventListener("submit", function (e) {
    e.preventDefault();

    const task = document.getElementById("task").value;
    if (!task) return;

    const tx = db.transaction(["todos"], "readwrite");
    tx.objectStore("todos").add({ text: task, done: false });

    tx.oncomplete = () => {
        form.reset();
        displayTodos();
    };
});

// -----------------------------------
// DISPLAY TASKS
// -----------------------------------
function displayTodos() {
    const tx = db.transaction(["todos"], "readonly");
    const store = tx.objectStore("todos");
    const req = store.getAll();

    req.onsuccess = function () {
        const list = document.getElementById("todoList");
        list.innerHTML = "";

        req.result.forEach(todo => {
            const li = document.createElement("li");

            li.innerHTML = `
                <span class="${todo.done ? "completed" : ""}">${todo.text}</span>
                <div>
                    <button onclick="toggleDone(${todo.id}, ${todo.done})">✓</button>
                    <button onclick="deleteTodo(${todo.id})">🗑</button>
                </div>
            `;

            list.appendChild(li);
        });
    };
}

// -----------------------------------
// MARK DONE / UNDONE
// -----------------------------------
function toggleDone(id, done) {
    const tx = db.transaction(["todos"], "readwrite");
    const store = tx.objectStore("todos");

    store.get(id).onsuccess = function (e) {
        const data = e.target.result;
        data.done = !done;
        store.put(data);
    };

    tx.oncomplete = displayTodos;
}

// -----------------------------------
// DELETE TASK
// -----------------------------------
function deleteTodo(id) {
    const tx = db.transaction(["todos"], "readwrite");
    tx.objectStore("todos").delete(id);
    tx.oncomplete = displayTodos;
}

// -----------------------------------
// REGISTER SERVICE WORKER
// -----------------------------------
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js")   // IMPORTANT for GitHub Pages
        .then(() => console.log("Service Worker Registered"));
}
