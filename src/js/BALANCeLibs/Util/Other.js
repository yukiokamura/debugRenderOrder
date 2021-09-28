// ------------------------------------------------------------
//
//  .blankをつけることで、別タブになるように
//
// ------------------------------------------------------------
export function blank() {
  $(() => {
    $(".blank").attr("target", "_blank");
  });
}

// ------------------------------------------------------------
//
//  scroll位置の設定
//
// ------------------------------------------------------------
export function scrollRestoration(bool = true) {
  // スクロール位置を元の位置に戻す
  if (bool) {
    window.history.scrollRestoration = "auto";

    // スクロール位置を必ず一番上に
  } else {
    window.history.scrollRestoration = "manual";
  }
}

// ------------------------------------------------------------
//
//  requestAnimationFrameの各ブラウザ対応
//
// ------------------------------------------------------------
export function requestAnimationFrame() {
  var FPS = 1000 / 60;

  window.requestAnimationFrame =
    window.requestAnimationFrame || // chromeや最新の
    window.mozRequestAnimationFrame || // 古いfirefox用
    window.webkitRequestAnimationFrame || // safari6以前、iOS6 safari用
    function (callback) {
      window.setTimeout(callback, FPS);
    };

  window.cancelAnimationFrame =
    window.cancelAnimationFrame ||
    window.mozCancelAnimationFrame ||
    window.webkitCancelAnimationFrame ||
    function (timer) {
      window.clearTimeout(timer);
    };
}

// ------------------------------------------------------------
//
//  chromeブラウザでpassive errorが呼ばれないように
//
// ------------------------------------------------------------
export function checkPassive() {
  // check passive
  var supportsPassive = false;
  try {
    // getter として opts.passive を定義して、 addEventListener 内で呼ばれたことがわかるようにする
    var opts = Object.defineProperty({}, "passive", {
      get: function () {
        // 内部で opts.passive が呼ばれたら対応ブラウザ
        // 用意しておいたフラグを有効にする
        supportsPassive = true;
      },
    });
    // 試しに適当なイベントを補足し、 opts.passive が呼ばれるか試す
    window.addEventListener("test", null, opts);
    window.removeEventListener("test", null, opts);
  } catch (e) {}

  window.addEventListenerWithOptions = (target, type, handler, options) => {
    var optionsOrCapture = options;
    if (!supportsPassive) {
      // 非対応ブラウザでは、他のオプションは全て捨て
      // { capture: bool } の値を useCapture の値として採用する
      optionsOrCapture = options.capture;
    }
    //
    target.addEventListener(type, handler, optionsOrCapture);
  };
}

// ------------------------------------------------------------
//
//  sp 全画面
//
// ------------------------------------------------------------
export function SPH($target = $("#wrapper")) {
  if (gb.u.dv.isPC) return;

  var r = () => {
    clearTimeout(this.Timer);
    this.Timer = setTimeout(() => {
      var adjust = 0;
      if ($("body").hasClass("landscape")) adjust = 200;
      $target.innerHeight(gb.r.h + adjust);
    }, 100);
  };

  r();

  // $(window).on('resize', r);
  $(window).on("orientationchange", r);
}

// ------------------------------------------------------------
//
//  cssのmix blendmodeが使えるかどうか
//
// ------------------------------------------------------------
export function checkCssBlend() {
  if ("CSS" in window && "supports" in window.CSS) {
    if (!window.CSS.supports("mix-blend-mode", "soft-light")) {
      document.documentElement.classList.add("not-mix-blend-mode");
    }
  }

  log(gb.u.isIE);

  if (gb.u.isIE) {
    document.documentElement.classList.add("not-mix-blend-mode");
  }
}

// ------------------------------------------------------------
//
//  画像保存できないように
//
// ------------------------------------------------------------
export function notSaveImg() {
  // ------------------------------------------------------------
  //
  //  pc
  //
  // ------------------------------------------------------------

  if (gb.u.isPC) {
    $(() => {
      $("img").on("contextmenu", () => {
        return false;
      });
    });
  }

  // ------------------------------------------------------------
  //
  //  sp android
  //
  // ------------------------------------------------------------
  var v = gb.u.isAndroidVersion();

  if (v == undefined) return;
  if (v < 5) {
    var timer;
    $("img").on("touchstart", () => {
      timer = setTimeout(() => {
        alert("画像は保存できません");
      }, 500);
      return false;
    });
    $("img").on("touchend", () => {
      clearTimeout(timer);
      return false;
    });
  }
}

// ------------------------------------------------------------
//
//  画像切り替えでhover → moduleに
//
// ------------------------------------------------------------
export function smartRollover($target, off = "_off.", on = "_on.") {
  var $images = $target;

  for (var i = 0; i < $images.length; i++) {
    if ($images.eq(i).get(0).getAttribute("src").match(off)) {
      log(111);

      $images.eq(i).get(0).onmouseover = function () {
        this.setAttribute("src", this.getAttribute("src").replace(off, on));
      };
      $images.eq(i).get(0).onmouseout = function () {
        this.setAttribute("src", this.getAttribute("src").replace(on, off));
      };
    }
  }
}
