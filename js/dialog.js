  /* --- 9. ダイアログ制御 --- */
  function showNotice(msg) {
    document.getElementById('dialog-msg').innerText = msg;
    const btnContainer = document.getElementById('dialog-buttons');
    btnContainer.innerHTML = `<button class="action-btn btn-primary" onclick="closeDialog()">OK</button>`;
    document.getElementById('dialog-overlay').style.display = 'flex';
  }

  function showConfirm(msg, onConfirm) {
    document.getElementById('dialog-msg').innerText = msg;
    pendingConfirmAction = onConfirm;
    const btnContainer = document.getElementById('dialog-buttons');
    btnContainer.innerHTML = `
      <button class="action-btn btn-secondary" onclick="closeDialog()">キャンセル</button>
      <button class="action-btn btn-primary" style="background:#e53e3e;" onclick="executeConfirm()">削除する</button>
    `;
    document.getElementById('dialog-overlay').style.display = 'flex';
  }

  function executeConfirm() {
    if (pendingConfirmAction) pendingConfirmAction();
    closeDialog();
  }

  function closeDialog() {
    document.getElementById('dialog-overlay').style.display = 'none';
    pendingConfirmAction = null;
  }
