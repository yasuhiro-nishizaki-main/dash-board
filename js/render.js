function detectLinkType(url) {
  if (!url) return { icon: '🔗', label: 'Web' };

  const u = url.toLowerCase();

  if (u.includes('github.io') || u.includes('github.com')) {
    return { icon: '🐙', label: 'GitHub' };
  } else if (
    u.includes('spreadsheet') ||
    u.includes('docs.google.com/spreadsheets')
  ) {
    return { icon: '📄', label: 'Sheet' };
  } else if (
    u.includes('drive.google.com') ||
    u.includes('.xlsx') ||
    u.includes('.xls')
  ) {
    return { icon: '📊', label: 'Excel' };
  }

  return { icon: '🔗', label: 'Link' };
}


// 4. メイン画面描画
function renderScreen() {
  const container = document.getElementById('app-content');
  const msgBox = document.getElementById('msg-box');

  container.innerHTML = "";

  if (!configData || configData.length === 0) {
    msgBox.innerText = "ボタンが登録されていません。";

    container.innerHTML = `
      <div class="empty-state">
        <div style="font-size:56px; margin-bottom:12px;">🏧</div>
        <p style="font-weight:bold; font-size:22px; margin-bottom:8px;">
          ポータル画面が空の状態です
        </p>
        <p style="font-size:15px; color:#4a5568;">
          右上の「⚙️ 設定」から新しいボタンを追加してください。
        </p>
      </div>
    `;

    return;
  }

  msgBox.innerText = "ご希望のお取引を押してください。";

  const grid = document.createElement('div');
  grid.className = 'button-grid';

  configData.forEach((btn, index) => {
    const btnEl = document.createElement('div');

    const linkInfo =
      btn.type === 'single'
        ? detectLinkType(btn.url)
        : { icon: '📁', label: 'Folder' };

    const hasPin = btn.pin && btn.pin.trim() !== "";

    btnEl.className =
      'atm-btn' +
      (linkInfo.label === 'GitHub' ? ' atm-btn-github' : '');

    btnEl.dataset.index = index;

    btnEl.innerHTML = `
      <span style="font-size:28px;">${linkInfo.icon}</span>
      <span>${btn.title || '無題のボタン'}</span>
      ${hasPin ? '<span class="lock-badge">🔒 6桁</span>' : ''}
    `;

    btnEl.onclick = () => {
      handleButtonClick(btn);
    };

    grid.appendChild(btnEl);
  });

  container.appendChild(grid);

  // ★ メイン画面のボタンのみドラッグ＆ドロップ適用
  new Sortable(grid, {
    animation: 150,
    ghostClass: 'sortable-ghost',

    onEnd: function (evt) {
      const movedItem = configData.splice(evt.oldIndex, 1)[0];
      configData.splice(evt.newIndex, 0, movedItem);

      saveSettingsToStorage();
    }
  });
}


// 5. 個別ボタン押下処理
function handleButtonClick(btn) {
  if (btn.pin && btn.pin.trim() !== "") {
    promptButtonPinEntry(
      btn.pin.trim(),
      () => {
        executeButtonAction(btn);
      },
      btn.title
    );
  } else {
    executeButtonAction(btn);
  }
}


function executeButtonAction(btn) {
  if (btn.type === 'single') {
    if (btn.url && btn.url.trim() !== '') {
      window.open(btn.url, '_blank');
    } else {
      showNotice(
        'このボタンにはURLが設定されていません。「⚙️ 設定」からURLを設定してください。'
      );
    }
  } else if (btn.type === 'folder') {
    showFolderView(btn);
  }
}


// 6. フォルダ内画面
function showFolderView(folderBtn) {
  const container = document.getElementById('app-content');
  const msgBox = document.getElementById('msg-box');

  container.innerHTML = "";

  msgBox.innerText =
    `【${folderBtn.title}】 内のファイル・リンクを選択してください。`;

  const folderContainer = document.createElement('div');
  folderContainer.className = "folder-view";

  if (folderBtn.sheets && folderBtn.sheets.length > 0) {
    folderBtn.sheets.forEach(sheet => {
      const linkInfo = detectLinkType(sheet.url);
      const hasPin = sheet.pin && sheet.pin.trim() !== "";

      const itemBtn = document.createElement('div');

      itemBtn.className =
        'atm-btn' +
        (linkInfo.label === 'GitHub' ? ' atm-btn-github' : '');

      itemBtn.style.justifyContent = 'flex-start';
      itemBtn.style.paddingLeft = '24px';

      itemBtn.innerHTML = `
        <span style="font-size:26px;">${linkInfo.icon}</span>
        <span>${sheet.name || '名称未設定ファイル'}</span>
        <span class="link-badge">${linkInfo.label}</span>
        ${hasPin ? '<span class="lock-badge">🔒 6桁</span>' : ''}
      `;

      itemBtn.onclick = () => {
        if (hasPin) {
          promptButtonPinEntry(
            sheet.pin.trim(),
            () => {
              if (sheet.url && sheet.url.trim() !== '') {
                window.open(sheet.url, '_blank');
              } else {
                showNotice('URLが設定されていません。');
              }
            },
            sheet.name
          );
        } else {
          if (sheet.url && sheet.url.trim() !== '') {
            window.open(sheet.url, '_blank');
          } else {
            showNotice('URLが開けません。');
          }
        }
      };

      folderContainer.appendChild(itemBtn);
    });

  } else {
    const emptyMsg = document.createElement('div');

    emptyMsg.style.padding = '30px';
    emptyMsg.style.textAlign = 'center';
    emptyMsg.style.color = '#4a5568';

    emptyMsg.innerText =
      'このフォルダにはファイルが登録されていません。';

    folderContainer.appendChild(emptyMsg);
  }

  // 戻るボタン
  const backBtn = document.createElement('div');

  backBtn.className = 'atm-btn';
  backBtn.style.background =
    'linear-gradient(180deg, #4a5568 0%, #2d3748 100%)';
  backBtn.style.color = '#ffffff';
  backBtn.style.borderColor = '#1a202c';
  backBtn.style.cursor = 'pointer';

  backBtn.innerText = '⬅️ 前の画面に戻る';

  backBtn.onclick = () => {
    renderScreen();
  };

  folderContainer.appendChild(backBtn);

  container.appendChild(folderContainer);
}
