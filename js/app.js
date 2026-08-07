  // グローバル状態
  let masterPin = "";
  let configData = [];
  let isUnlocked = false;
  let pendingConfirmAction = null;
  let currentPinInput = "";
  let pendingActionAfterPin = null;

  // 1. 初期化＆設定のロード
  async function initPortal() {
    // A. リポジトリ直下の ./portal-config.json を自動読み込み試行
    try {
      const response = await fetch('./portal-config.json?v=' + Date.now());
      if (response.ok) {
        const remoteData = await response.json();
        parseLoadedData(remoteData);
        updateStatusTag("GITHUB HOSTED");
        checkSecurityAndRender();
        return;
      }
    } catch (e) {
      console.log("ローカル portal-config.json なし");
    }

    // B. LocalStorageから取得
    const localData = localStorage.getItem('atm_portal_config');
    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        parseLoadedData(parsed);
        updateStatusTag("LOCAL READY");
      } catch (e) {
        configData = [];
      }
    } else {
      configData = [];
      updateStatusTag("INITIAL MODE");
    }

    checkSecurityAndRender();
  }

  function parseLoadedData(data) {
    if (Array.isArray(data)) {
      configData = data;
      masterPin = "";
    } else if (typeof data === 'object' && data !== null) {
      masterPin = data.masterPin || "";
      configData = data.buttons || [];
    }
  }

  function updateStatusTag(msg) {
    document.getElementById('status-tag').innerText = msg;
  }

  // 2. セキュリティチェック（ポータル全体ロック）
  function checkSecurityAndRender() {
    if (masterPin && masterPin.trim() !== "" && !isUnlocked) {
      // 全体ロックがかかっている場合
      promptMasterPinEntry();
    } else {
      renderScreen();
    }
  }





  // 自動保存用関数
  function saveSettingsToStorage() {
    const fullData = {
      masterPin: masterPin ? masterPin.trim() : "",
      buttons: configData
    };
    localStorage.setItem('atm_portal_config', JSON.stringify(fullData));
  }

  // 設定の保存
  function saveSettings() {
    saveSettingsToStorage();
    closeSettings();
    checkSecurityAndRender();
  }

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

  // アプリケーション起動
  window.onload = initPortal;
