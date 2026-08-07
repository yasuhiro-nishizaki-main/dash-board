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

<input
  id="task-input"
  type="text"
  placeholder="タスク名を入力"
>

<input
  id="task-deadline"
  type="datetime-local"
  style="margin-top:12px;"
>

<button
  class="action-btn btn-primary"
  onclick="addTask()"
  style="margin-top:12px;"
>
  ＋追加
</button>

  <hr style="margin:20px 0;">

  <div id="task-list"></div>

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
  const input = document.getElementById("task-input");
  const deadlineInput = document.getElementById("task-deadline");

  const title = input.value.trim();
  const deadline = deadlineInput.value;

  if (!title) return;

  tasks.push({
  id: Date.now(),
  title,
  deadline
});

  input.value = "";
  deadlineInput.value = "";

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
  tasks.sort((a, b) => {
  // 期限なしは下へ
  if (!a.deadline && b.deadline) return 1;
  if (a.deadline && !b.deadline) return -1;

  // 両方期限なしならそのまま
  if (!a.deadline && !b.deadline) return 0;

  // 期限が早い順
  return new Date(a.deadline) - new Date(b.deadline);
});
  taskList.innerHTML = tasks.map(task => `
    <div class="task-item">
      <div>
        <div>${task.title}</div>

        ${task.deadline ? `
          <small>
            期限：${new Date(task.deadline).toLocaleString("ja-JP")}
          </small>
        ` : ""}
      </div>

      <button
        class="btn-sm"
        onclick="deleteTask(${task.id})"
      >
        🗑 削除
      </button>
    </div>
  `).join("");
}
function saveTasks() {
  localStorage.setItem("portalTasks", JSON.stringify(tasks));
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);

  saveTasks();
  renderTaskList();
}

loadTasks();
