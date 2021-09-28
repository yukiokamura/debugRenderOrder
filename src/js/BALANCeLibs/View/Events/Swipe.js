// ------------------------------------------------------------
//
//  Swipe
//
// ------------------------------------------------------------
import { TweenMax, Power4 } from "gsap";
export default class Swipe {
  constructor() {
    // ---------------
    //  dom
    // ---------------
    this.$wrap = $(".watchWrap");
    this.$menu = $(".faceMenuWrap");
    this.$item = this.$menu.find(".item");
    this.len = this.$item.length;

    // ---------------
    //  variable
    // ---------------

    // position
    this.sX = 0;
    this.mX = 0;
    this.eX = 0; //startX,moveX,endX
    this.dis = 0;
    this.minDis = 10;

    // time
    this.sT = 0;
    this.eT = 0;
    this.minT = 300; //startTime,ellapsedTime,

    this.tarX = 0;
    this.div = 0;
    this.tarBaseX = 0;

    // 左端
    this.edgeL = 120;
    // 右端
    this.edgeR = -1240;

    this.isNotTouch = true;

    this.W = gb.r.W();

    this.onTouchLong = () => {};
    this.onTouchStartCB = () => {};
    this.onTouchEndCB = () => {};

    this.setup();
    this.setEvents();
  }

  setup() {
    // 最初は、左端にしておく
    this.tarX = this.edgeL;
    this.tarBaseX = this.edgeL;

    this.setCenterReady();
  }

  onTouchStart(e) {
    // time
    this.sT = new Date().getTime();

    // targetX
    var x = e.originalEvent.changedTouches[0].pageX;
    this.sX = x;

    this.isNotTouch = false;

    // コールバック
    this.onTouchStartCB();
  }

  onTouchMove(e) {
    // targetX
    var x = e.originalEvent.changedTouches[0].pageX;
    this.mX = x;

    this.div = (this.mX - this.sX) * 2;

    // ----------------
    //  position
    // ----------------

    // 右端と左端だと引っ張る距離を制限
    if (this.tarX > this.edgeL && this.tarBaseX == this.edgeL) {
      this.div = Math.min(this.W / 2, this.div);
      var rate = (this.W - this.div) / this.W;
      this.div = this.div * rate;
    }
    if (this.tarX < this.edgeR && this.tarBaseX == this.edgeR) {
      this.div = Math.min(this.W / 2, -this.div);
      var rate = (this.W - this.div) / this.W;
      this.div = -this.div * rate;
    }

    this.tarX = this.div + this.tarBaseX;
  }

  onTouchEnd(e) {
    // time
    this.eT = new Date().getTime() - this.sT;

    // 最小時間より長かったら、処理
    if (this.minT < this.eT) this.onTouchLong();

    // targetX
    this.tarBaseX += this.div;
    this.div = 0;

    if (this.tarX < this.edgeR) {
      this.tarX = this.edgeR;
      this.tarBaseX = this.edgeR;
    }
    if (this.tarX > this.edgeL) {
      this.tarX = this.edgeL;
      this.tarBaseX = this.edgeL;
    }

    this.setCenter();

    // ----------------
    //  blur解除
    // ----------------
    this.isNotTouch = true;

    // コールバック
    this.onTouchEndCB();
  }

  // きちんと、一番近い時計が真ん中に来るようにする
  setCenterReady(val) {
    var div = -170;

    // 各時計の真ん中位置
    this.centerList = [];
    // 各時計の真ん中位置から半分の距離
    this.centerMidList = [];

    for (var i = 0; i < this.len; i++) {
      this.centerList[i] = this.edgeL + i * div;
    }

    for (var i = 0; i < this.len; i++) {
      if (i == this.len - 1) continue;

      var c01 = this.centerList[i];
      var c02 = this.centerList[i + 1];

      this.centerMidList[i] = c01 - (c01 - c02) / 2;
    }
  }

  // きちんと、一番近い時計が真ん中に来るようにする
  setCenter(val) {
    var x = this.tarBaseX;

    // ----------------
    //  ハードコード
    // ----------------

    // // 各時計の真ん中位置
    // var center00 = 120;
    // var center01 = -50;
    // var center02 = -220;
    // var center03 = -390;

    // // 各時計の真ん中位置から半分の距離
    // var centerMid01 = center00 - (center00 - center01)/2; //35
    // var centerMid02 = center01 - (center01 - center02)/2; //-135
    // var centerMid03 = center02 - (center02 - center03)/2; //-305

    // log(x,centerMid01,centerMid02);

    // if (x < centerMid01 && x >= centerMid02) {
    //   TweenMax.to(this, 0.3, {tarBaseX: center01,tarX: center01,ease: Power4.easeOut});
    // }
    // if (x < centerMid02 && x >= centerMid03) {
    //   TweenMax.to(this, 0.3, {tarBaseX: center02,tarX: center02,ease: Power4.easeOut});
    // }

    // ----------------
    //  ハードコード
    // ----------------

    // 左端、右端以外
    for (var i = 0; i < this.len; i++) {
      var c01 = this.centerMidList[i];
      var c02 = this.centerMidList[i + 1];
      var center = this.centerList[i + 1];

      if (x < c01 && x >= c02) {
        TweenMax.to(this, 0.3, {
          tarBaseX: center,
          tarX: center,
          ease: Power4.easeOut,
        });
      }
    }

    // 一番左端
    if (x >= this.centerMidList[0]) {
      TweenMax.to(this, 0.3, {
        tarBaseX: this.edgeL,
        tarX: this.edgeL,
        ease: Power4.easeOut,
      });
    }

    // 一番右端
    if (x < this.centerMidList[this.len - 1]) {
      TweenMax.to(this, 0.3, {
        tarBaseX: this.edgeR,
        tarX: this.edgeR,
        ease: Power4.easeOut,
      });
    }
  }

  setEvents() {
    var self = this;

    this.$wrap.on("touchstart.Swipe", (e) => {
      this.onTouchStart(e);
    });
    this.$wrap.on("touchmove.Swipe", (e) => {
      this.onTouchMove(e);
    });
    this.$wrap.on("touchend.Swipe", (e) => {
      this.onTouchEnd(e);
    });
  }
}
