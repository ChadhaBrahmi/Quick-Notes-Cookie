
if (!window.__cookieSidebarInit) {
  window.__cookieSidebarInit = true;

  let sidebar;
  let visible = false;
  let todos = [];
  let notes = [];
  let isReady = false;

  function waitForBody(callback) {
    if (document.body) {
      callback();
    } else {
      setTimeout(() => waitForBody(callback), 50);
    }
  }

  function init() {
    waitForBody(() => {
      
      const existing = document.getElementById("cookie-notes-sidebar");
      if (existing) {
        sidebar = existing;
        isReady = true;
        return;
      }

      createSidebar();
      isReady = true;
    });
  }

  function createSidebar() {
    sidebar = document.createElement("div");
    sidebar.id = "cookie-notes-sidebar";

    sidebar.innerHTML = `
      <div class="cookie-header">
        <span>🍪 My Cookie Planner</span>
        <button id="cookie-close">×</button>
      </div>

      <div class="cookie-section">
        <h3>🍪 To-Do List</h3>
        <div class="todo-input">
          <input type="text" id="todoText" placeholder="Add a sweet task..." />
          <button id="addTodo">+</button>
        </div>
        <ul id="todoList"></ul>
      </div>

      <div class="cookie-section">
        <h3>📝 Notes</h3>
        <div class="note-input">
          <input type="text" id="noteText" placeholder="Write a note..." />
          <button id="saveNote">Save</button>
        </div>
        <ul id="noteList"></ul>
      </div>

      <div class="rolling-cookie">🍪</div>
    `;

    document.body.appendChild(sidebar);

    
    sidebar.addEventListener('click', (e) => {
      if (e.target.id === 'cookie-close') {
        toggleSidebar();
      } else if (e.target.id === 'addTodo') {
        addTodo();
      } else if (e.target.id === 'saveNote') {
        addNote();
      } else if (e.target.classList.contains('delete-btn')) {
        handleDelete(e.target);
      } else if (e.target.type === 'checkbox') {
        handleCheckbox(e.target);
      }
    });

   
    sidebar.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        if (e.target.id === 'todoText') {
          addTodo();
        } else if (e.target.id === 'noteText') {
          addNote();
        }
      }
    });

    loadData();
  }

  function handleCheckbox(checkbox) {
    const li = checkbox.closest('li');
    const list = checkbox.closest('ul');
    const index = Array.from(list.children).indexOf(li);
    
    if (list.id === 'todoList') {
      todos[index].done = !todos[index].done;
      saveData();
      renderTodos();
    }
  }

  function handleDelete(btn) {
    const li = btn.closest('li');
    const list = li.closest('ul');
    const index = Array.from(list.children).indexOf(li);
    
    if (list.id === 'todoList') {
      todos.splice(index, 1);
      saveData();
      renderTodos();
    } else if (list.id === 'noteList') {
      notes.splice(index, 1);
      saveData();
      renderNotes();
    }
  }

  function toggleSidebar() {
    if (!sidebar) {
      sidebar = document.getElementById("cookie-notes-sidebar");
    }
    if (!sidebar) return;
    
    visible = !visible;
    sidebar.classList.toggle("open", visible);
  }

  function getKey() {
    return "cookie_data_" + window.location.hostname;
  }

  function saveData() {
    chrome.storage.local.set({
      [getKey()]: { todos, notes }
    });
  }

  function loadData() {
    chrome.storage.local.get([getKey()], (result) => {
      if (result[getKey()]) {
        todos = result[getKey()].todos || [];
        notes = result[getKey()].notes || [];
      }
      renderTodos();
      renderNotes();
    });
  }

  function addTodo() {
    const input = document.getElementById("todoText");
    if (!input || !input.value.trim()) return;

    todos.push({ text: input.value, done: false });
    input.value = "";
    saveData();
    renderTodos();
  }

  function renderTodos() {
    const list = document.getElementById("todoList");
    if (!list) return;
    
    list.innerHTML = "";

    todos.forEach((todo) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <input type="checkbox" ${todo.done ? "checked" : ""}>
        <span class="${todo.done ? "done" : ""}">${todo.text}</span>
        <button class="delete-btn">×</button>
      `;
      list.appendChild(li);
    });
  }

  function addNote() {
    const input = document.getElementById("noteText");
    if (!input || !input.value.trim()) return;

    notes.push(input.value);
    input.value = "";
    saveData();
    renderNotes();
  }

  function renderNotes() {
    const list = document.getElementById("noteList");
    if (!list) return;
    
    list.innerHTML = "";

    notes.forEach((note) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span>${note}</span>
        <button class="delete-btn">×</button>
      `;
      list.appendChild(li);
    });
  }

  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "toggle") {
      if (!isReady) {
       
        setTimeout(() => toggleSidebar(), 100);
      } else {
        toggleSidebar();
      }
    }
  });

  
  init();
}


function saveData() {
  localStorage.setItem(getKey(), JSON.stringify({ todos, notes }));
}

function loadData() {
  const data = localStorage.getItem(getKey());
  
}

