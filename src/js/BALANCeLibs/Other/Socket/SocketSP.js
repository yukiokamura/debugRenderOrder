// ------------------------------------------------------------
//
//  SocketSP
//
// ------------------------------------------------------------
import { TweenMax } from "gsap";
(function () {
  var gb = jp.co.sjPlus;

  function SocketSP() {
    this.$target = null;
    this.$canvasArea = null;
    this.$scrollArea = null;

    this.state = "";
    // scroll スクロール状態
    // draw 線描く状態
    this.tAry = []; //touch array
    this.curNum = -1;
    this.startNum = -1;
    this.endNum = 0;
    this.url = "undefined";
    this.preUrl = "";
    this.touchedList = [];

    this.circlePos = gb.data;
    this.maxDis = 45;
    this.len = this.circlePos.length;

    this.urlList = {
      // '0345': '/pc/',
      "13457": "/pc/",
      "02346": "/pc/project",
      "1345": "/pc/detail",
      // '678': '/pc/detail',
      "246": "/pc/detail/close",
      "01235678": "/pc/about",
      "03458": "/pc/technology",
      "0124": "/pc/contact",
      "1457": "playVideo",
    };

    this.W = null;
    this.H = null;
    this.w = null;
    this.h = null;
    this.x = null;
    this.y = null;
    this.scale = 1;

    this.isStop = false;
    this.scTimer = null; //scroll画像用timer
    this.animate = null;

    this.pairing();
    this.setEvents();
    // this.ready();
  }

  SocketSP.prototype = {
    pairing: function () {
      var url = location.href;
      var query = url.split("?")[1];
      var roomID = query.split("=")[1];

      gb.socket.emit("pairingSP", { roomID: roomID });
      gb.roomID = roomID;
    },

    ready: function () {
      this.$target = $(".touchArea");
      this.W = window.innerWidth;
      this.H = window.innerHeight;
      this.w = this.$target.width();
      this.h = this.$target.height();

      this.scale =
        parseInt($(".line").attr("width")) / parseInt($(".line").css("width"));
      log(
        parseInt($(".line").attr("width")),
        parseInt($(".line").css("width"))
      );
    },

    // ------------------------------------------------------------
    //  指で触り始めた時
    // ------------------------------------------------------------
    onStart: function (e) {
      if (this.isStop) return;

      gb.socket.emit("start", {});

      this.tAry = [];
      this.startNum = -1;
      this.curNum = -1;
      this.preUrl = "";
      this.touchedList = [];

      if (this.scTimer) clearTimeout(this.scTimer);
      TweenMax.killTweensOf(this.animate);
      this.animate = TweenMax.to($(".scrollArea"), 0.5, {
        opacity: 0,
        onComplete: function () {
          $(".scrollArea").hide();
        },
      });
    },

    // ------------------------------------------------------------
    // 指でなぞっている時
    // ------------------------------------------------------------
    onMove: function (e) {
      if (this.isStop) return;

      this.x =
        -1 * $(".touchArea").offset().left +
        e.originalEvent.changedTouches[0].pageX;
      this.y =
        -1 * $(".touchArea").offset().top +
        e.originalEvent.changedTouches[0].pageY;

      var data = {
        x: this.x * this.scale,
        y: this.y * this.scale,
        w: this.w,
        h: this.h,
        scale: this.scale,
      };
      gb.socket.emit("move", data);

      this.onTouch();
    },

    // ------------------------------------------------------------
    // 指で、丸に触れた際
    // ------------------------------------------------------------
    onTouch: function () {
      var tPos = { x: this.x * this.scale, y: this.y * this.scale }; //touch postion

      for (var i = 0; i < this.len; i++) {
        if (
          gb.u.dist(this.circlePos[i], tPos) < this.maxDis &&
          this.curNum !== i
        ) {
          if (this.startNum == -1) this.startNum = i;
          this.curNum = i;
          if (!this.checkRepeat())
            gb.socket.emit("touchNew", { curNum: this.curNum });
          this.tAry.push(i);

          gb.socket.emit("touch", { arr: this.tAry });
        }
      }

      this.onRightMark();
    },

    // ------------------------------------------------------------
    //  重複してないかどうか確認
    // ------------------------------------------------------------
    checkRepeat: function () {
      for (var j = 0; j < this.touchedList.length; j++) {
        if (this.touchedList[j] == this.curNum) return true;
      }

      return false;
    },

    // ------------------------------------------------------------
    // 正しいマークを書いたかどうか確かめる
    // ------------------------------------------------------------
    onRightMark: function () {
      var arr = [];
      // ソート
      arr = gb.u.descend(this.tAry);
      // 重複削除
      arr = gb.u.removeRepeat(arr);
      this.touchedList = arr;

      // 連結して文字列化 → リンク取得
      var order = arr.join("");
      this.url = this.urlList[order];
      if (this.url == undefined) this.url = "undefined";

      // デバイス選択時は特定の図形でしか光らせない
      if (gb.deviceSelect == "yet") {
        if (order !== "0345") return;
      }

      // markがaboutとcontactの時
      if (this.url == "/pc/about" || this.url == "/pc/contact") {
        // 最初のタッチと最後のタッチが同じかどうか かつ 全ての番号が触れられている場合
        // 正しいマークですよイベント発行
        if (this.startNum == this.curNum && this.url !== "undefined") {
          if (this.preUrl == this.url) return;
          gb.socket.emit("rightMark", { url: this.url });
          this.preUrl = this.url;
        }

        // detailとcloseの時
      } else if (this.url == "/pc/detail" || this.url == "/pc/detail/close") {
        var id = gb.pageID;
        if (
          id == "page_project" ||
          id == "page_project_detail" ||
          id == "page_technology"
        ) {
          if (this.preUrl == this.url) return;
          gb.socket.emit("rightMark", { url: this.url });
          this.preUrl = this.url;
        }

        // それ以外の時
      } else if (this.url !== "undefined") {
        if (this.preUrl == this.url) return;
        gb.socket.emit("rightMark", { url: this.url });
        this.preUrl = this.url;
      }
    },

    onEnd: function (e) {
      var self = this;

      if (this.url == "undefined") {
        this.scTimer = setTimeout(function () {
          self.tweenScrollAreaHide();
        }, 1000);
      } else {
        this.isStop = true;

        clearTimeout(this.scTimer);
        this.scTimer = setTimeout(function () {
          self.tweenScrollAreaHide();
          // end処理
          self.isStop = false;
        }, 1000);
      }

      gb.socket.emit("end", { url: this.url, touchedList: this.touchedList });
      this.url = "undefined";
    },

    tweenScrollAreaHide: function () {
      // scrollarea appear
      $(".scrollArea").css("display", "block");
      TweenMax.killTweensOf(this.animate);
      this.animate = TweenMax.to($(".scrollArea"), 0.5, { opacity: 1 });
    },

    onPrevent: function (e) {
      // デフォルトの動作を止める
      e.preventDefault();
      e.stopPropagation();
    },

    onResize: function (e) {
      this.W = window.innerWidth;
      this.H = window.innerHeight;
      this.w = this.$target.width();
      this.h = this.$target.height();

      this.scale =
        parseInt($(".line").attr("width")) / parseInt($(".line").css("width"));
    },

    onStartScrollArea: function (e) {
      e.stopPropagation();
      e.preventDefault();

      // 一旦タッチポイントを消す
      this.tAry = [];
      this.touchedList = [];

      this.h = $(".touchArea").height();
      this.y =
        -1 * $(".touchArea").offset().top +
        e.originalEvent.changedTouches[0].pageY;

      gb.socket.emit("scrollStart", { y: this.y, h: this.h });

      return false;
    },

    onMoveScrollArea: function (e) {
      e.stopPropagation();
      e.preventDefault();

      this.x =
        -1 * $(".touchArea").offset().left +
        e.originalEvent.changedTouches[0].pageX;
      this.y =
        -1 * $(".touchArea").offset().top +
        e.originalEvent.changedTouches[0].pageY;

      gb.socket.emit("scrollMove", {
        x: this.x,
        y: this.y,
        w: this.w,
        h: this.h,
      });

      return false;
    },

    onEndScrollArea: function (e) {
      e.stopPropagation();
      e.preventDefault();

      gb.socket.emit("scrollEnd", {});

      return false;
    },

    onSetSPControllerEvents: function (e) {
      var self = this;
      this.$canvasArea = $(".canvasArea");
      this.$scrollArea = $(".scrollArea");

      // タッチ座標をサーバーに渡す
      this.$scrollArea.on("touchstart", function (e) {
        self.onStartScrollArea.call(self, e);
      });
      this.$scrollArea.on("touchmove", function (e) {
        self.onMoveScrollArea.call(self, e);
      });
      this.$scrollArea.on("touchend", function (e) {
        self.onEndScrollArea.call(self, e);
      });
      this.$canvasArea.on("touchstart", function (e) {
        self.onStart.call(self, e);
      });
      this.$canvasArea.on("touchstart touchmove", function (e) {
        self.onMove.call(self, e);
      });
      this.$canvasArea.on("touchend", function (e) {
        self.onEnd.call(self, e);
      });
      gb.u.setPrevent();

      // contact
      $(".formName").on("keyup keydown keypress", function (e) {
        self.onInput.call(self, e);
      });
      $(".formCompany").on("keyup keydown keypress", function (e) {
        self.onInput.call(self, e);
      });
      $(".formAddress").on("keyup keydown keypress", function (e) {
        self.onInput.call(self, e);
      });
      $(".formInquiry").on("keyup keydown keypress", function (e) {
        self.onInput.call(self, e);
      });
      $(".checkbox").on("touchstart", function () {
        self.onCheck.call(this);
      });
    },

    onInput: function (e) {
      var text01 = $(".formName").val();
      var text02 = $(".formCompany").val();
      var text03 = $(".formAddress").val();
      var text04 = $(".formInquiry").val();

      gb.socket.emit("key", {
        text01: text01,
        text02: text02,
        text03: text03,
        text04: text04,
      });
    },

    onCheck: function (e) {
      gb.socket.emit("contactCheck", {});
    },

    onContactSuccess: function (data) {
      var obj = {};
      obj.data = data.data.data;
      obj.status = data.data.status;
      gb.inquiry.sendSuccess(obj);
    },

    onContactError: function () {
      log("error");
      gb.inquiry.sendError();
    },

    onPageID: function (data) {
      var id = data.id;
      log(id, data.pjax);
      if (id == "page_contact" && data.pjax) {
        gb.modal.open();

        TweenMax.set($("#form"), { opacity: 1, display: "block", y: 0 });
        TweenMax.set($("#thank"), { opacity: 0, display: "none", y: 0 });
        gb.u.removePrevent();
      }
    },

    setEvents: function () {
      var self = this;

      $(window).on("resize", function (e) {
        self.onResize.call(self, e);
      });
      $(window).on("layoutEnd", function (e) {
        self.ready.call(self, e);
      });
      gb.socket.on("successParing", this.onSetSPControllerEvents.bind(this));
      gb.socket.on("contact_success_pc", function (data) {
        self.onContactSuccess.call(self, data);
      });
      gb.socket.on("contact_error_pc", function (data) {
        self.onContactError.call(self, data);
      });
      gb.socket.on("pageID", function (data) {
        self.onPageID.call(self, data);
      });
      log(1);
    },
  };

  gb.SocketSP = SocketSP;
})();
