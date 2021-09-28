// ------------------------------------------------------------
//
//  SocketPCSP
//
// ------------------------------------------------------------

(function(){

  var gb = jp.co.sjPlus;
  gb.start = {};
  gb.start.y = 0;

  function SocketPCSP() {


    this.setEvents();

  }

  SocketPCSP.prototype = {

    onStart: function() {

      $(window).trigger('start');

    },

    onMove: function(data) {

      var x = (data.x) * ($('.touchArea').width() / data.w);
      var y = (data.y) * ($('.touchArea').height() / data.h);

      if (gb.ua.devicePC) {
        gb.x = x / data.scale;
        gb.y = y / data.scale;
      } else {
        gb.x = x;
        gb.y = y;
      }

      $(window).trigger('move');

    },

    onTouch: function(data) {

      gb.tArr = data.arr;
      $(window).trigger('touch');

    },

    onTouchNew: function(data) {

      gb.curNum = data.curNum;
      $(window).trigger('touchNew');

    },

    onRightMark: function(data) {

      gb.url = data.url;
      $(window).trigger('rightMark');

    },

    onEnd: function(data) {

      gb.url = data.url;
      gb.touchedList = data.touchedList;
      $(window).trigger('end'); 

    },

    onScrollStart: function(data) {

      var y = data.y * ($('.touchArea').height() / data.h);
      gb.start.y = y;

      $(window).trigger('scrollStart');

    },

    onScrollMove: function(data) {

      var x = data.x * ($('.touchArea').width() / data.w);
      var y = data.y * ($('.touchArea').height() / data.h);
      gb.x = x;
      gb.y = y;

      $(window).trigger('scrollMove');

    },

    onScrollEnd: function(data) {

      $(window).trigger('scrollEnd');

    },

    onPageID: function(data) {

      gb.pageID = data.id;

    },

    onDeviceSelect: function(data) {

      gb.deviceSelect = data.status;

    },

    setEvents: function() {

      var self = this;

      gb.socket.on('start', function(data){self.onStart.call(self,data);});
      gb.socket.on('move', function(data){self.onMove.call(self,data);});
      gb.socket.on('touch', function(data){self.onTouch.call(self,data);});
      gb.socket.on('touchNew', function(data){self.onTouchNew.call(self,data);});
      gb.socket.on('rightMark', function(data){self.onRightMark.call(self,data);});
      gb.socket.on('end', function(data){self.onEnd.call(self,data);});
      gb.socket.on('scrollStart', function(data){self.onScrollStart.call(self,data);});
      gb.socket.on('scrollMove', function(data){self.onScrollMove.call(self,data);});
      gb.socket.on('scrollEnd', function(data){self.onScrollEnd.call(self,data);});
      gb.socket.on('pageID', function(data){self.onPageID.call(self,data);});
      gb.socket.on('deviceSelect', function(data){self.onDeviceSelect.call(self,data);});

    },

  }
  
  gb.SocketPCSP = SocketPCSP;

})();