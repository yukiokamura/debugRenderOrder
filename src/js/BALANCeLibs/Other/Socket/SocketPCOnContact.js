// ------------------------------------------------------------
//
//  SocketPCOnContact
//
// ------------------------------------------------------------
(function(){

  var gb = jp.co.sjPlus;

  function SocketPCOnContact() {

    this.setup();
    this.setEvents();

  }

  SocketPCOnContact.prototype = {

    setup: function(){

    },

    onKey: function(data) {

      $('.formName').val(data.text01);
      $('.formCompany').val(data.text02);
      $('.formAddress').val(data.text03);
      $('.formInquiry').val(data.text04);

      gb.inquiry.inputCheck();
      gb.inquiry.removeAllError();

    },

    onContactCheck: function(data) {

      gb.inquiry.onTouch.call($('.checkbox'));

    },

    onContactSuccess: function(data) {

      var obj = {};
      obj.data = data.data.data;
      obj.status = data.data.status;
      gb.inquiry.sendSuccess(obj);

    },

    onContactError: function() {

      log('error');
      gb.inquiry.sendError();

    },

    setEvents: function(){

      var self = this;

      gb.socket.on('key', function(data){self.onKey.call(self,data);});
      gb.socket.on('contactCheck', function(data){self.onContactCheck.call(self,data);});
      gb.socket.on('contact_success_sp', function(data){self.onContactSuccess.call(self,data);});
      gb.socket.on('contact_error_sp', function(data){self.onContactError.call(self,data);});

    },

  }

  gb.SocketPCOnContact = SocketPCOnContact;

})();