let tasks = [];
function createTaskModal() {
  // すでに作成済みなら何もしない
  if (document.getElementById("task-modal-overlay")) {
    return;
  }

  const modalHtml = `
    <div id="task-modal-overlay" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>📋 タスク管理</h3>

          <button
            class="btn-sm"
            onclick="closeTaskManager()"
          >
            ✕ 閉じる
          </button>
        </div>

        <div class="modal-body">
          <div id="task-list">
            タスクはまだありません。
          </div>
        </div>

        <div class="modal-footer">
          <button
            class="action-btn btn-secondary"
            onclick="closeTaskManager()"
          >
            閉じる
          </button>

          <button
            class="action-btn btn-primary"
            onclick="addTask()"
          >
            ＋ タスク追加
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHtml);
}
function loadTasks() {
  const data = localStorage.getItem("portalTasks");

  if (data) {
    tasks = JSON.parse(data);
  }
}

function openTaskManager() {
  createTaskModal();
  renderTaskList();

  const modal = document.getElementById("task-modal-overlay");

  if (modal) {
    modal.style.display = "flex";
  }
}


function closeTaskManager() {
  const modal = document.getElementById("task-modal-overlay");

  if (modal) {
    modal.style.display = "none";
  }
}


function addTask() {
  const title = prompt("タスク名を入力してください");

  if (!title) return;

  tasks.push({
    id: Date.now(),
    title: title,
    completed: false
  });

  saveTasks();
  renderTaskList();
}
function renderTaskList() {
  const taskList = document.getElementById("task-list");

  if (!taskList) return;

  if (tasks.length === 0) {
    taskList.innerHTML = "タスクはまだありません。";
    return;
  }

  taskList.innerHTML = tasks.map(task => `
    <div class="task-item">
      <input
        type="checkbox"
        ${task.completed ? "checked" : ""}
      >

      <span>
        ${task.title}
      </span>
    </div>
  `).join("");
}
function saveTasks() {
  localStorage.setItem("portalTasks", JSON.stringify(tasks));
}
loadTasks();
