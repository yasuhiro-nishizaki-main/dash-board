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
