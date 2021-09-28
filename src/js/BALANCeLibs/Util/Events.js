// ------------------------------------------------------------
//
//  スマホ操作無効 (touch move)
//
// ------------------------------------------------------------
export function notMove(flag = true, $wrap = $("#wrapper")) {
  if (flag) {
    $wrap.on(
      "touchstart.noControl touchmove.noControl touchend.noControl",
      function (e) {
        e.preventDefault();
      }
    );

    // this.f = (e)=>{e.preventDefault();};
    // document.addEventListener('touchmove', this.f, { passive: false });
  } else {
    $wrap.off("touchstart.noControl touchmove.noControl touchend.noControl");

    // document.removeEventListener('touchmove', this.f, false);
  }

  // this.offNotMove();

  // $(window).on('touchstart.noControl touchmove.noControl touchend.noControl click.noControl', function(e){e.preventDefault();});
}

// export function offNotMove() {

//   $(window).off('touchstart.noControl touchmove.noControl touchend.noControl');
//   // $(window).off('touchstart.noControl touchmove.noControl touchend.noControl click.noControl');

// }

// export function notMove(flag=true) {

//   if (flag) {

//     this.f = (e)=>{e.preventDefault();};

//     document.addEventListener('touchmove', this.f, { passive: false });

//   } else {

//     log('off',this.f)

//     document.removeEventListener('touchmove', this.f, false);

//   }

// }

// export function notMove() {

//   this.offNotMove();

//   this.f = (e)=>{e.preventDefault();};

//   document.addEventListener('touchmove', this.f.bind(this), { passive: false });

// }

// export function offNotMove() {

//   log(111,this.f);
//   if (this.f) {
//     log(111,this.f);
//     document.removeEventListener('touchmove', this.f.bind(this));
//   }

// }

export function setPreventMousemove() {
  var self = this;

  this.removePrevent();
  $(window).on("touchmove.noControl", function (e) {
    e.preventDefault();
  });
}

export function preventDefault(e) {
  e = e || window.event;
  if (e.preventDefault) e.preventDefault();
  e.returnValue = false;
}

export function preventDefaultForScrollKeys(e) {
  if (keys[e.keyCode]) {
    preventDefault(e);
    return false;
  }
}

// ------------------------------------------------------------
//
//  スクロール操作無効
//
// ------------------------------------------------------------
export function disableScroll($target) {
  if ($target.get(0).addEventListener)
    // older FF
    $target
      .get(0)
      .addEventListener("DOMMouseScroll", this.preventDefault, false);
  $target.get(0).onwheel = this.preventDefault; // modern standard
  $target.get(0).onmousewheel = document.onmousewheel = this.preventDefault; // older browsers, IE
  $target.get(0).ontouchmove = this.preventDefault; // mobile
  // document.onkeydown  = this.preventDefaultForScrollKeys;
}

export function enableScroll($target) {
  if ($target.get(0).removeEventListener)
    $target
      .get(0)
      .removeEventListener("DOMMouseScroll", this.preventDefault, false);
  $target.get(0).onmousewheel = document.onmousewheel = null;
  $target.get(0).onwheel = null;
  $target.get(0).ontouchmove = null;
  document.onkeydown = null;
}
