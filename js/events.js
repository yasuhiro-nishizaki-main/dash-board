/* =========================
   キーボードイベント
========================= */

document.addEventListener("keydown", (event) => {

  // PIN画面以外では何もしない
  const pinDisplay = document.getElementById("pin-display-slots");
  if (!pinDisplay) return;

  let targetButton = null;

  switch (event.key) {

    // 数字
    case "0":
    case "1":
    case "2":
    case "3":
    case "4":
    case "5":
    case "6":
    case "7":
    case "8":
    case "9":
      targetButton = event.key;
      break;

    // テンキー
    case "Numpad0":
    case "Numpad1":
    case "Numpad2":
    case "Numpad3":
    case "Numpad4":
    case "Numpad5":
    case "Numpad6":
    case "Numpad7":
    case "Numpad8":
    case "Numpad9":
      targetButton = event.key.replace("Numpad", "");
      break;

    // 1文字削除
    case "Backspace":
      targetButton = "訂正";
      break;

    // 全クリア
    case "Delete":
      targetButton = "全クリア";
      break;

    // キャンセル
    case "Escape":
      targetButton = "キャンセル";
      break;

    default:
      return;
  }

  event.preventDefault();

  document
    .querySelectorAll(".keypad-btn")
    .forEach(btn => {

      if (btn.innerText.trim() === targetButton) {
        btn.click();
      }

    });

});
