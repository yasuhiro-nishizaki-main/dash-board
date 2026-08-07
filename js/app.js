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

  // 3. 進入時の全体暗証番号入力画面
  function promptMasterPinEntry() {
    currentPinInput = "";
    const container = document.getElementById('app-content');
    const msgBox = document.getElementById('msg-box');
    container.innerHTML = "";
    msgBox.innerText = "🔒 【セキュリティ】 暗証番号(6桁)を入力してください。";

    const pinContainer = document.createElement('div');
    pinContainer.className = "pin-container";

    const pinDisplay = document.createElement('div');
    pinDisplay.className = "pin-display-box";
    pinDisplay.id = "pin-display-slots";
    updatePinDisplay(pinDisplay);

    const keypad = document.createElement('div');
    keypad.className = "pin-keypad";

    const keys = ['1','2','3','4','5','6','7','8','9','--','0','訂正'];
    keys.forEach(key => {
      const btn = document.createElement('div');
      btn.className = "keypad-btn";
      if (key === '--') btn.classList.add('keypad-btn-cancel');
      if (key === '訂正') btn.classList.add('keypad-btn-danger');
      btn.innerText = key;

      btn.onclick = () => {
        if (key === '--') return;
        if (key === '訂正') {
          currentPinInput = currentPinInput.slice(0, -1);
          updatePinDisplay(document.getElementById('pin-display-slots'));
        } else {
          if (currentPinInput.length < 6) {
            currentPinInput += key;
            updatePinDisplay(document.getElementById('pin-display-slots'));
            if (currentPinInput.length === 6) {
              setTimeout(() => {
                if (currentPinInput === masterPin.trim()) {
                  isUnlocked = true;
                  msgBox.innerText = "暗証番号を確認しました。";
                  renderScreen();
                } else {
                  msgBox.innerText = "⚠️ 暗証番号が間違っています。もう一度入力してください。";
                  currentPinInput = "";
                  updatePinDisplay(document.getElementById('pin-display-slots'));
                }
              }, 150);
            }
          }
        }
      };
      keypad.appendChild(btn);
    });

    pinContainer.appendChild(pinDisplay);
    pinContainer.appendChild(keypad);
    container.appendChild(pinContainer);
  }

  // 7. ボタン暗証番号入力画面
  function promptButtonPinEntry(correctPin, onSuccess, title) {
    currentPinInput = "";
    pendingActionAfterPin = onSuccess;

    const container = document.getElementById('app-content');
    const msgBox = document.getElementById('msg-box');
    container.innerHTML = "";
    msgBox.innerText = `【${title || '取引'}】 暗証番号(6桁)を入力してください。`;

    const pinContainer = document.createElement('div');
    pinContainer.className = "pin-container";

    const pinDisplay = document.createElement('div');
    pinDisplay.className = "pin-display-box";
    pinDisplay.id = "pin-display-slots";
    updatePinDisplay(pinDisplay);

    const keypad = document.createElement('div');
    keypad.className = "pin-keypad";

    const keys = ['1','2','3','4','5','6','7','8','9','キャンセル','0','訂正'];
    keys.forEach(key => {
      const btn = document.createElement('div');
      btn.className = "keypad-btn";
      if (key === 'キャンセル') btn.classList.add('keypad-btn-cancel');
      if (key === '訂正') btn.classList.add('keypad-btn-danger');
      btn.innerText = key;

      btn.onclick = () => {
        if (key === 'キャンセル') {
          renderScreen();
        } else if (key === '訂正') {
          currentPinInput = currentPinInput.slice(0, -1);
          updatePinDisplay(document.getElementById('pin-display-slots'));
        } else {
          if (currentPinInput.length < 6) {
            currentPinInput += key;
            updatePinDisplay(document.getElementById('pin-display-slots'));
            if (currentPinInput.length === 6) {
              setTimeout(() => {
                if (currentPinInput === correctPin) {
                  msgBox.innerText = "暗証番号を確認しました。";
                  renderScreen();
                  if (pendingActionAfterPin) pendingActionAfterPin();
                } else {
                  msgBox.innerText = "⚠️ 暗証番号が間違っています。もう一度入力してください。";
                  currentPinInput = "";
                  updatePinDisplay(document.getElementById('pin-display-slots'));
                }
              }, 150);
            }
          }
        }
      };
      keypad.appendChild(btn);
    });

    pinContainer.appendChild(pinDisplay);
    pinContainer.appendChild(keypad);
    container.appendChild(pinContainer);
  }

  function updatePinDisplay(containerEl) {
    if (!containerEl) return;
    containerEl.innerHTML = "";
    for (let i = 0; i < 6; i++) {
      const slot = document.createElement('div');
      slot.className = "pin-digit-slot";
      if (i < currentPinInput.length) {
        slot.innerText = "●";
      } else {
        slot.innerText = "";
      }
      containerEl.appendChild(slot);
    }
  }

  /* --- 8. 設定モーダル制御 --- */
  function openSettings() {
    document.getElementById('master-pin-input').value = masterPin || "";
    renderSettingsList();
    document.getElementById('modal-overlay').style.display = 'flex';
  }

  function closeSettings() {
    document.getElementById('modal-overlay').style.display = 'none';
  }

  function renderSettingsList() {
    const list = document.getElementById('settings-list');
    list.innerHTML = "";

    if (configData.length === 0) {
      list.innerHTML = `<div style="text-align:center; padding:30px; color:#718096; font-size:15px;">ボタンがまだありません。「＋ 新しいボタンを追加」を押してください。</div>`;
      return;
    }

    configData.forEach((btn, index) => {
      const item = document.createElement('div');
      item.className = 'config-card';
      item.dataset.index = index;
      
      let html = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <strong style="color:var(--bg-green); font-size:16px;">ボタン ${index + 1}</strong>
          <span style="font-size:12px; color:#718096;">ID: ${btn.id}</span>
        </div>

        <label>ボタン表示名:</label>
        <input type="text" value="${btn.title || ''}" placeholder="例: 営業ダッシュボード" onchange="configData[${index}].title = this.value">
        
        <label>個別の暗証番号 (6桁の数字 - 不要なら空欄):</label>
        <input type="text" maxlength="6" value="${btn.pin || ''}" placeholder="例: 123456 (なしの場合は空欄)" onchange="configData[${index}].pin = this.value">

        <label>ボタンの種類:</label>
        <select onchange="changeType(${index}, this.value)">
          <option value="single" ${btn.type==='single'?'selected':''}>単一ファイル / GitHub Pages / URL直飛び</option>
          <option value="folder" ${btn.type==='folder'?'selected':''}>フォルダ (複数ファイルを格納)</option>
        </select>
      `;

      if (btn.type === 'single') {
        html += `
          <label>URL (Google Drive エクセル / スプシ等):</label>
          <input type="text" value="${btn.url || ''}" onchange="configData[${index}].url = this.value" placeholder="https://drive.google.com/... や https://...">
        `;
      } else {
        html += `<div style="margin-top:14px; font-size:14px; font-weight:bold; color:#2b6cb0;">📂 フォルダ内の登録ファイル:</div>`;
        (btn.sheets || []).forEach((sheet, sheetIdx) => {
          html += `
            <div class="sheet-link-input">
              <input type="text" value="${sheet.name || ''}" placeholder="表示名 (例: 営業売上.xlsx)" onchange="configData[${index}].sheets[${sheetIdx}].name = this.value">
              <input type="text" value="${sheet.url || ''}" placeholder="URL (https://...)" onchange="configData[${index}].sheets[${sheetIdx}].url = this.value" style="margin-top:6px;">
              <input type="text" maxlength="6" value="${sheet.pin || ''}" placeholder="ファイル個別暗証番号6桁 (任意)" onchange="configData[${index}].sheets[${sheetIdx}].pin = this.value" style="margin-top:6px;">
              <button class="btn-sm btn-danger" onclick="removeSheet(${index}, ${sheetIdx})" style="margin-top:8px;">このファイルを削除</button>
            </div>
          `;
        });
        html += `<button class="btn-sm" onclick="addSheet(${index})" style="margin-top:10px; background:#ebf8ff; color:#2b6cb0; border-color:#90cdf4;">＋ ファイル・リンクを追加</button>`;
      }

      html += `
        <div class="item-controls">
          <button class="btn-sm" onclick="moveItem(${index}, -1)" ${index===0?'disabled':''}>▲ 上へ移動</button>
          <button class="btn-sm" onclick="moveItem(${index}, 1)" ${index===configData.length-1?'disabled':''}>▼ 下へ移動</button>
          <button class="btn-sm btn-danger" onclick="confirmDeleteButton(${index})" style="margin-left:auto;">ボタン削除</button>
        </div>
      `;

      item.innerHTML = html;
      list.appendChild(item);
    });
    // ※ 設定画面内の Sortable 適用を除外（ドラッグ移動を無効化）
  }

  function changeType(index, type) {
    configData[index].type = type;
    if (type === 'folder' && !configData[index].sheets) configData[index].sheets = [];
    renderSettingsList();
  }

  function addSheet(btnIndex) {
    if (!configData[btnIndex].sheets) configData[btnIndex].sheets = [];
    configData[btnIndex].sheets.push({ name: "", url: "", pin: "" });
    renderSettingsList();
  }

  function removeSheet(btnIndex, sheetIndex) {
    configData[btnIndex].sheets.splice(sheetIndex, 1);
    renderSettingsList();
  }

  function addNewButton() {
    configData.push({
      id: Date.now(),
      title: "新しい取引",
      type: "single",
      url: "",
      pin: ""
    });
    renderSettingsList();
  }

  function moveItem(index, direction) {
    const targetIndex = index + direction;
    if (targetIndex >= 0 && targetIndex < configData.length) {
      const temp = configData[index];
      configData[index] = configData[targetIndex];
      configData[targetIndex] = temp;
      renderSettingsList();
    }
  }

  function confirmDeleteButton(index) {
    showConfirm("このボタンを削除してもよろしいですか？", () => {
      configData.splice(index, 1);
      renderSettingsList();
    });
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
