//--------------------------------------------------
//
//  NoTransition
//
//--------------------------------------------------

(function(){

  var gb = jp.co.mie;

  function NoTransition($target) {

    this.$target = $target;

    this.isPCLock = false;
    this.isSPLock = false;

    this.Timer = null;

    this.run();
    this.setEvents();

  }

  NoTransition.prototype = {

    run: function () {

      // ------------------------------------------------------------
      //  ブレイクポイントよりもsp側
      // ------------------------------------------------------------
      if (gb.u.isResSP && !this.isSPLock) {
        this.isPCLock = false;
        this.isSPLock = true;

        $('html').addClass('noTransition');

        clearTimeout(this.Timer);
        this.Timer = setTimeout(function(){
          $('html').removeClass('noTransition');
        },200);

      } 

      // ------------------------------------------------------------
      //  ブレイクポイントよりもpc側
      // ------------------------------------------------------------
      if (gb.u.isResPC && !this.isPCLock) {
        this.isPCLock = true;
        this.isSPLock = false;

        $('html').addClass('noTransition');

        clearTimeout(this.Timer);
        this.Timer = setTimeout(function(){
          $('html').removeClass('noTransition');
        },200);

      }

    },

    setEvents: function () {

      gb.r.add(this.run.bind(this));
    },

  }

  gb.NoTransition = NoTransition;

})();