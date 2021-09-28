// ------------------------------------------------------------
//
//  SocketPC
//
// ------------------------------------------------------------

import { TweenMax, Power2 } from "gsap";
(function () {
  var gb = jp.co.sjPlus;

  function SocketPC() {
    this.roomID = null;

    this.cnt = 0;
    this.Timer = null;
    this.dis = 0;

    jp.co.plusMV.orientation = {};
    jp.co.plusMV.orientation.beta = 0;
    jp.co.plusMV.orientation.gamma = 0;
    jp.co.plusMV.orientation.alpha = 0;

    this.pairing();
    this.setEvents();
    this.setup();
  }

  SocketPC.prototype = {
    setup: function () {
      new gb.SocketPCOnScroll();
      new gb.SocketPCOnContact();
    },

    // ------------------------------------------------------------
    //
    //  ページ読み込み時サーバー側にイベント発行 / q発行のため
    //
    // ------------------------------------------------------------
    pairing: function () {
      gb.socket.emit("pairingPC", {});
    },

    // ------------------------------------------------------------
    //
    //  pcの現在ページをspに伝達
    //
    // ------------------------------------------------------------
    pageID: function () {
      var id = $("body").attr("id");
      gb.socket.emit("pageID", { id: id, roomID: this.roomID });
    },

    // ------------------------------------------------------------
    //
    //  QRコード生成
    //
    // ------------------------------------------------------------
    onGenerateQR: function (data) {
      log(data);
      this.roomID = data.id;

      // ------------------------------------------------------------
      //  端末が特定台数以上だと、台数制限ページヘ
      // ------------------------------------------------------------
      // if (data.cntD > 3) {
      //   alert('台数制限ページ');
      //   return;
      // };

      // ------------------------------------------------------------
      //  qrコード生成
      // ------------------------------------------------------------
      // ドメイン判定
      var url = location.href;

      if (gb.u.isContain(url, "localhost")) {
        var domain = "http://172.16.1.15:3030/";
      } else {
        var domain =
          gb.u.protocol() + "//" + gb.u.host() + ":" + gb.u.port() + "/";
      }

      // qr生成
      $(".box__qr").MyQRCode({
        size: "174x174",
        content: domain + "sp/controller/index.html?q=" + data.id,
      });
    },

    // ------------------------------------------------------------
    //
    //  ペアリング成功
    //
    // ------------------------------------------------------------
    onSuccessPairing: function () {
      // step2を消す
      $(".device_select .step--num02").trigger("successPairing");
      // スマホモード
      common.gb.isSPOperateMode = true;
      // スマホモード用のclass付加
      $("html").addClass("is-connect");
      // スマホコントローラーcanvas開始
      gb.SPCLoop.loop();
      // ページ情報をspに
      this.pageID();
    },

    // ------------------------------------------------------------
    //
    //  Exit
    //
    // ------------------------------------------------------------
    onExit: function () {
      location.reload();
    },

    // ------------------------------------------------------------
    //  指押すととメニュー開く
    // ------------------------------------------------------------
    onStart: function () {
      // デバイス選択モードが終わっていたら
      if ($(".device_select").hasClass("is-end")) {
        common.gb.menu._open();
      }
    },

    onEnd: function () {
      // ------------------------------------------------------------
      // ページ遷移
      // ------------------------------------------------------------
      if (gb.url == "undefined") {
        // ------------------------------------------------------------
        //  メニュー閉じる
        // ------------------------------------------------------------
        // デバイス選択モードが終わっていたら
        if ($(".device_select").hasClass("is-end")) common.gb.menu._close();
      } else {
        clearTimeout(this.Timer);
        this.Timer = setTimeout(function () {
          // ------------------------------------------------------------
          //  メニュー閉じる
          // ------------------------------------------------------------
          common.gb.menu._close();

          // ------------------------------------------------------------
          //  device select時 topでなければ次の処理をしない
          // ------------------------------------------------------------
          if (!$(".device_select").hasClass("is-end") && gb.url !== "/pc/")
            return;

          switch (gb.url) {
            case "/pc/":
              $.pjax.click($(".pjaxTop"));
              break;
            case "/pc/project":
              $.pjax.click($(".pjaxProject"));
              break;
            case "/pc/detail":
              if (
                $("body").attr("id") == "page_project" ||
                $("body").attr("id") == "page_project_detail"
              ) {
                $.pjax.click($(".pjaxDetail"));
              }
              if ($("body").attr("id") == "page_technology") {
                $(".pjaxDetail").trigger("click");
              }
              break;
            case "/pc/detail/close":
              if ($("body").attr("id") == "page_project_detail") {
                $.pjax.click($(".pjaxProject"));
              }

              if ($("body").attr("id") == "page_technology") {
                $(".pjaxDetail").trigger("click");
              }
              break;
            case "/pc/about":
              $.pjax.click($(".pjaxAbout"));
              break;
            case "/pc/technology":
              $.pjax.click($(".pjaxTechnology"));
              break;
            case "/pc/contact":
              $.pjax.click($(".pjaxContact"));
              break;
            case "playVideo":
              log(jp.co.plusMV.in.YI.player);
              if (jp.co.plusMV.in.YI.player) {
                jp.co.plusMV.in.YI.player.playVideo();
                TweenMax.to($(".playBox"), 1, {
                  opacity: 0,
                  ease: Power3.easeInOut,
                });
              }

              break;
          }
        }, 300);
      }
    },

    onSelectAgain: function () {
      $(".device_select").show();
      TweenMax.set($(".device_select"), { scale: 1, visibility: "visible" });
      TweenMax.to($(".device_select"), 1, {
        opacity: 1,
        ease: Power2.easeOut,
      });
    },

    onOrientation: function (data) {
      jp.co.plusMV.orientation.beta = data.orientation.beta;
      jp.co.plusMV.orientation.gamma = data.orientation.gamma;
      jp.co.plusMV.orientation.alpha = data.orientation.alpha;
    },

    setEvents: function () {
      var self = this;

      gb.socket.on("generateQR", function (data) {
        self.onGenerateQR.call(self, data);
      });
      gb.socket.on("successParing", function (data) {
        self.onSuccessPairing.call(self, data);
      });
      gb.socket.on("exitPC", function (data) {
        self.onExit.call(self, data);
      });
      $(window).on("start", this.onStart.bind(this));
      $(window).on("end", this.onEnd.bind(this));
      $(".devide_controller").on("click", this.onSelectAgain.bind(this));
      gb.socket.on("orientation", function (data) {
        self.onOrientation.call(self, data);
      });
    },
  };

  gb.SocketPC = SocketPC;
})();
