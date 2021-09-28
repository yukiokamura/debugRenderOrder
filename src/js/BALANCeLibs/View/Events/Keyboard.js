//--------------------------------------------------
//
//  Keyboard
//
//--------------------------------------------------

(function(){

  var gb = jp.co.onepieace;


  function Keyboard() {

    // var key_code = e.keyCode;
    // // Shiftキーの押下状態
    // var shift_key = e.shiftKey;
    // // Ctrlキーの押下状態
    // var ctrl_key = e.ctrlKey;
    // // Altキーの押下状態
    // var alt_key = e.altKey;


    this.setEvents();

  }

  Keyboard.prototype = {

    // ------------------------------------------------------------
    //  a オブジェクト追加
    // ------------------------------------------------------------
    add: function(e) {

      if(e.keyCode == 65 || e.keyCode == 97) {

        addParticles([Math.floor(Math.random()*10),Math.floor(Math.random()*10),Math.floor(Math.random()*10)]);
      
      }

    },

    // ------------------------------------------------------------
    //  shift + r オブジェクト削除
    // ------------------------------------------------------------
    remove: function(e) {

      if((e.keyCode == 82 && e.shiftKey) || e.keyCode == 114 && e.shiftKey) {

        removeParticles();
      
      }

    },

    // ------------------------------------------------------------
    //  b 開始
    // ------------------------------------------------------------
    begin: function(e) {

      if(e.keyCode == 66 || e.keyCode == 98) {

        // initVisual();
        // gb.um.setup();
        // gb.um.loop();
      
      }

    },

    // ------------------------------------------------------------
    //  s 停止
    // ------------------------------------------------------------
    stop: function(e) {

      if(e.keyCode == 83 || e.keyCode == 115) {

        gb.p.stop();
        gb.s.pause();    
      
      }

    },

    // ------------------------------------------------------------
    //  r 再開
    // ------------------------------------------------------------
    resume: function(e) {

      if(e.keyCode == 82 || e.keyCode == 114) {

        gb.p.reStart();
        gb.p.loop();
        gb.s.resume();    
      
      }

    },

    // ------------------------------------------------------------
    //  f 全画面 
    // ------------------------------------------------------------
    full: function(e) {

      if(e.keyCode == 70 || e.keyCode == 102) {
        
        var f = document.body;

        if (f.requestFullScreen) {
          f.requestFullScreen();
        } else if(f.webkitRequestFullScreen) {
          f.webkitRequestFullScreen();
        } else if(f.mozkitRequestFullScreen) {
          f.mozkitRequestFullScreen();
        }

      }

    },

    // ------------------------------------------------------------
    //  c 全画面解除 
    // ------------------------------------------------------------
    cancelFull: function(e) {

      if(e.keyCode == 67 || e.keyCode == 99) {

        var c = document;            
        
        if (c.cancelFullScreen) {
          c.cancelFullScreen();
        } else if(c.webkitCancelFullScreen) {
          c.webkitCancelFullScreen();
        } else if(c.mozkitCancelFullScreen) {
          c.mozkitCancelFullScreen();
        } else {
          c.exitFullScreen();
        }

      }

    },

    // ------------------------------------------------------------
    //  検索 enter
    // ------------------------------------------------------------
    enter: function(e) {

      if(e.keyCode == 13 && gb.conf.isOpening == 'end') {
      gb.conf.isOpening = null;

        $(window).trigger('openingEnd');

      }

    },

    // ------------------------------------------------------------
    //  →
    // ------------------------------------------------------------
    arrowRight: function() {

      if(e.keyCode == 39) {

        var num = cur+1;
        num = num%videoList.length;
        onSwitch('',num);

      }

    },

    // ------------------------------------------------------------
    //  ←
    // ------------------------------------------------------------
    arrowLeft: function() {

      if(e.keyCode == 37) {

        var num = cur-1;
        if (num<0) num=videoList.length-1;
        onSwitch('',num);

      }

    },

    // ------------------------------------------------------------
    //  ↑
    // ------------------------------------------------------------
    arrowUp: function() {

      if(e.keyCode == 38) {

      }

    },

    // ------------------------------------------------------------
    //  ↓
    // ------------------------------------------------------------
    arrowDown: function() {

      if(e.keyCode == 40) {

      }

    },
    
    glslEffect: function(e) {

      // ------------------------------------------------------------
      //  1
      // ------------------------------------------------------------
      if(e.keyCode == 49) {
        _composerNum = 0;
      }
      // ------------------------------------------------------------
      //  2
      // ------------------------------------------------------------
      if(e.keyCode == 50) {
        _composerNum = 1;
      }
      // ------------------------------------------------------------
      //  3
      // ------------------------------------------------------------
      if(e.keyCode == 51) {
        _composerNum = 2;
      }
      // ------------------------------------------------------------
      //  4
      // ------------------------------------------------------------
      if(e.keyCode == 52) {
        _composerNum = 3;
      }
      // ------------------------------------------------------------
      //  5
      // ------------------------------------------------------------
      if(e.keyCode == 53) {
        _composerNum = 4;
      }

    },

    onKey: function(e) {

      this.full(e);
      this.cancelFull(e);
      this.enter(e);
      // this.begin(e);
      // this.stop(e);
      // this.resume(e);
      // this.glslEffect(e);
      // this.add(e);
      // this.remove(e);

    },

    setEvents: function() {

      var self = this;

      $(document).on('keydown', function(e){self.onKey.call(self,e);});

    }

  }

  gb.Keyboard = Keyboard;

})();