//--------------------------------------------------
//
//  ReceiveSerial
//
//--------------------------------------------------

(function(){

  var gb = jp.co.onepieace;

  function ReceiveSerial() {
    
    //websocket接続
    this.ws = new WebSocket('ws://localhost:8784');

    this.setEvents();
    this.ready();

  }

  ReceiveSerial.prototype = {

    ready: function () {


    },

    pushed: function () {

      // alert('pushed!!!!');

    },

    hide: function () {


    },

    setEvents: function () {

      var self = this;

      // イベント受け取り
      this.ws.onmessage = function(e){

        log(e);
        log(e.data);
        self.pushed();

      };

      // $('#btn_on').click(function(){
      //     ws.send('y');
      // });
      // $('#btn_off').click(function(){
      //     ws.send('n');
      // });

    },

    run: function () {


    }

  }

  gb.ReceiveSerial = ReceiveSerial;

})();