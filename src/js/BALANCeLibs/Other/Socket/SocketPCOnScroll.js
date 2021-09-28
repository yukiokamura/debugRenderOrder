// ------------------------------------------------------------
//
//  SocketPCOnScroll
//
// ------------------------------------------------------------
import { TweenMax, Power2, Power3 } from "gsap";
(function () {
  var gb = jp.co.sjPlus;

  function SocketPCOnScroll() {
    this.cnt = 0;
    this.Timer = null;
    this.dis = 0;

    this.setup();
    this.setEvents();
  }

  SocketPCOnScroll.prototype = {
    setup: function () {},

    onScrollMove: function () {
      this.dis = gb.start.y - gb.y;

      // 値の微調整
      if ($("body").attr("id") == "page_about") this.dis *= 3;
      else this.dis *= 4;

      // projectページの場合は、スクロールをキャンセル
      if ($("body").attr("id") == "page_project") return;
      // aboutページの場合は、section04部分だけスクロール

      if ($("body").attr("id") == "page_about") {
        if (common.gb.aboutScroll.isScrollOKForSP) {
          TweenMax.to($(".section04"), 0.5, {
            scrollTop: "+=" + this.dis,
            ease: Power2.easeOut,
          });
        }

        // その他は通常html,body
      } else {
        if (gb.ua.isFirefox) {
          TweenMax.to($("body,html"), 0.5, {
            scrollTop: "+=" + this.dis,
            ease: Power2.easeOut,
          });
        } else {
          TweenMax.to($("html,body"), 0.5, {
            scrollTop: "+=" + this.dis,
            ease: Power2.easeOut,
          });
        }
      }

      // ------------------------------------------------------------
      // project detailページスクロール
      // ------------------------------------------------------------
      if ($("body").attr("id") == "page_project_detail") {
        var st = $("body").scrollTop();
        if (st >= 0) $(window).trigger("projectDetailTween");

        log(common.gb.projectDetail.isYoutubeLock);
        // youtubeiframe読み込み済みなら
        if (!common.gb.projectDetail.isYoutubeLock) {
          var state = jp.co.plusMV.in.YI.player.getPlayerState();
          if (state == 1) {
            jp.co.plusMV.in.YI.player.pauseVideo();
            TweenMax.to($(".playBox"), 1, {
              opacity: 1,
              ease: Power3.easeInOut,
            });
          }
        }
      }
    },

    onScrollEnd: function () {
      // ------------------------------------------------------------
      // aboutページスクロール
      // ------------------------------------------------------------

      if ($("body").attr("id") == "page_about") {
        if (this.dis > 10) {
          if (common.gb.aboutScroll.current !== 3) common.gb.aboutScroll.up();
        } else if (this.dis < -10) {
          if (common.gb.aboutScroll.current !== 3) common.gb.aboutScroll.down();
          if (
            common.gb.aboutScroll.current == 3 &&
            common.gb.aboutScroll.st == 0
          )
            common.gb.aboutScroll.down();
        }
      }

      // ------------------------------------------------------------
      // projectページスクロール
      // ------------------------------------------------------------

      if (
        $("body").attr("id") == "page_project" &&
        !$(".main_menu__container").hasClass("menuOpen")
      ) {
        if (this.dis > 10) {
          if (!common.gb.projectScroll.props.isAnimate)
            common.gb.projectScroll._slideDown();
        } else if (this.dis < -10) {
          if (!common.gb.projectScroll.props.isAnimate)
            common.gb.projectScroll._slideUp();
        }
      }

      // ------------------------------------------------------------
      // project detailページスクロール
      // ------------------------------------------------------------
      if ($("body").attr("id") == "page_project_detail") {
        // 動画の高さの3/4以上がviewport内に入っていたら
        if ($(".block__movie").get(0) == undefined) return;
        var mh = $(".block__movie").height(); //movie height
        var mSt = $(".block__movie").offset().top;
        var mSb = mSt + mh;
        var mh = $(".block__movie").height();
        var h = $(window).height();
        var st = $(window).scrollTop();
        var sb = st + h;

        // 上から && 下から
        if (mSt + (mh * 3) / 4 < sb && mSb - (mh * 3) / 4 > st) {
          if (gb.ua.isFirefox) {
            TweenMax.to($("body,html"), 0.7, {
              scrollTop: mSt - (h - mh) / 2,
              ease: Power3.easeOut,
              delay: 0.3,
            });
          } else {
            TweenMax.to($("html,body"), 0.7, {
              scrollTop: mSt - (h - mh) / 2,
              ease: Power3.easeOut,
              delay: 0.3,
            });
          }
        }
      }

      // ------------------------------------------------------------
      // technologyページスクロール
      // ------------------------------------------------------------
      if ($("body").attr("id") == "page_technology") {
        if ($(".block--case_study .item_detail").hasClass("is-active")) {
          if (this.dis > 10) {
            common.gb.technology.modal._playMovieTween();
          } else if (this.dis < -10) {
            common.gb.technology.modal._pauseMovieTween();
            common.gb.technology.player.pauseVideo();
          }
        } else {
          if (this.dis > 10) {
            common.gb.technologyScroll._slideDown();
          } else if (this.dis < -10) {
            common.gb.technologyScroll._slideUp();
          }
        }
      }
    },

    setEvents: function () {
      var self = this;

      $(window).on("scrollMove", this.onScrollMove.bind(this));
      $(window).on("scrollEnd", this.onScrollEnd.bind(this));
    },
  };

  gb.SocketPCOnScroll = SocketPCOnScroll;
})();
