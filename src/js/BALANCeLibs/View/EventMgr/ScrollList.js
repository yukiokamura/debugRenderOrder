//--------------------------------------------------
//
//  ScrollList
//
//--------------------------------------------------

export default class ScrollList {

  constructor() {

    this.list = [];
    this.endList = [];

    this.isStart = true;
    this.isWheel = false;// wheel中か、そうでないか
    this.endTimer = 200;

    this.setup();
    this.setEvents();

  }

  setup() {

    // this.add('end',this.onEnd.bind(this));

  }

  add(name, func) {

    var obj = {name:name,func:func};

    this.list.push(obj);
    
  }

  remove(name) {

    ScrollList.arrRemove(this.list, name);

  }

  onScroll(e) {

    // if (this.isStart) {
    //   this.isStart = false;
    //   // log('resizeStart');
    //   // 最初だけの処理
    // };

    for (var i in this.list) this.list[i].func();

  }

  onMouseWheel(e,delta,deltaX,deltaY) {

    this.isWheel = true;

    if (deltaY>0) this.upWheel = true;
    else this.upWheel = false;

    for (var i in this.list) this.list[i].func();

  }

  onEnd(e) {

    var self = this;

    if (this.Timer) clearTimeout(this.Timer);
    this.Timer = setTimeout(function() {
      self.isStart = true;
      self.isWheel = false;

      for (var i in self.endList) self.endList[i]();

    }, this.endTimer);

  }

  addFixedObjectScroll($target) {

    this.list.push(function(){

      $target.css("left", -$(window).scrollLeft());

    });

  }

  setEvents() {

    // $(window).on('scroll', (e)=>{this.onScroll(e);});
    // var $wrap = $(window).get(0);
    if (gb.u.dv.isPC) var $wrap = $(window).get(0);
    else var $wrap = $('#wrapper').get(0);
    window.addEventListenerWithOptions($wrap, 'scroll', this.onScroll.bind(this), {passive : true,capture : false})    
    // $(window).on('scroll', $.throttle(100, false, this.onScroll.bind(this)));
    // $(document).on('mousewheel', (e,delta,deltaX,deltaY)=>{this.onMouseWheel(e,delta,deltaX,deltaY);}); // → document指定だと、trackball controlsが上手く動かない
    // $('canvas').on('mousewheel', (e,delta,deltaX,deltaY)=>{this.onMouseWheel(e,delta,deltaX,deltaY);});

  }

  // ------------------------------------------------------------
  //
  //  静的メンバ
  //
  // ------------------------------------------------------------
  static arrRemove(arr , name) {

    var len = arr.length;
    var check;
    for( var i = 0 ; i < len; i++ ) {
      check = arr[ i ];

      if( check.name == name){
        arr.splice( i , 1 ) ;
        i--;
        len--;
      }
    }

    return arr;

  }

}