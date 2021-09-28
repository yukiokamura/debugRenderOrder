// ------------------------------------------------------------
//
//  // 全画面
//
// ------------------------------------------------------------
export function full() {
  var b = document.body;
  // var b = document.getElementById("wrapper")
  // var b = document.getElementsByClassName('menu03');

  if (b.requestFullScreen) {
    b.requestFullScreen();
  } else if (b.webkitRequestFullScreen) {
    b.webkitRequestFullScreen();
  } else if (b.mozRequestFullScreen) {
    b.mozRequestFullScreen();
  } else if (b.msRequestFullscreen) {
    b.msRequestFullscreen();
  } else {
    alert("ご利用のブラウザはフルスクリーン操作に対応していません");
    return;
  }
}
