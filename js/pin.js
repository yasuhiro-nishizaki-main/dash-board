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

    const keys = ['1','2','3','4','5','6','7','8','9','全クリア','0','訂正'];
    keys.forEach(key => {
      const btn = document.createElement('div');
      btn.className = "keypad-btn";
      if (key === '全クリア') btn.classList.add('keypad-btn-cancel');
      if (key === '訂正') btn.classList.add('keypad-btn-danger');
      btn.innerText = key;

      btn.onclick = () => {
        if (key === '全クリア') {
          currentPinInput = "";
          updatePinDisplay(document.getElementById('pin-display-slots'));
          return;
        }
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

    const keys = ['1','2','3','4','5','6','7','8','9','全クリア','0','訂正'];
    keys.forEach(key => {
      const btn = document.createElement('div');
      btn.className = "keypad-btn";
      if (key === '全クリア') btn.classList.add('keypad-btn-cancel');
      if (key === '訂正') btn.classList.add('keypad-btn-danger');
      btn.innerText = key;

      btn.onclick = () => {
        if (key === '全クリア') {
          currentPinInput = "";
          updatePinDisplay(document.getElementById('pin-display-slots'));
          return;
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
      slot.innerText = currentPinInput[i];
    } else {
      slot.innerText = "";
    }

    containerEl.appendChild(slot);
  }
}
