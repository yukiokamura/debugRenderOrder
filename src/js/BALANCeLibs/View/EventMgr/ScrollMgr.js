//--------------------------------------------------
//
//  ScrollMgr
//
//--------------------------------------------------

export default class ScrollMgr {

  constructor() {

    // this.$wrap = $(window);
    if (gb.u.dv.isPC) this.$wrap = $(window);
    else this.$wrap = $('#wrapper');
    
    this.st = 0; // 現在のscroll top
    this.prest = 0;
    this.sb = 0; // 現在のscroll bottom

    this.isUp = null; // 上スクロールか下スクロールか;
    this.dis = 0;
    this.deltaY = 0;
    this.offset = 0;

    this.isSetWheel = false;

    this.setup();
    this.setEvents();

  }

  setup() {


  }

  onScroll() {

    this.st = this.$wrap.scrollTop();
    this.sb = this.st + gb.r.h;

    // down or up
    // if (this.st > this.prest) {
    //   console.log('down');
    // } else {
    //   console.log('up');
    // }
    // this.prest = this.st;

  }

  onWheel(e,delta,deltaX,deltaY) {

    this.isWheel = true;

    if (deltaY>0) this.isUp = true;
    else this.isUp = false;

    this.dis = deltaY - this.deltaY;
    this.offset += deltaY;
    this.deltaY = deltaY;

  }

  setEvents() {

    // scroll
    var $wrap = this.$wrap.get(0);
    window.addEventListenerWithOptions($wrap, 'scroll', this.onScroll.bind(this), {passive : true,capture : false})    
    // this.$wrap.on('scroll', $.throttle(100, false, this.onScroll.bind(this)));

    // wheel
    if (this.isSetWheel) $(document).on('mousewheel', (e,delta,deltaX,deltaY)=>{this.onWheel(e,delta,deltaX,deltaY);}); // → document指定だと、trackball controlsが上手く動かない
    // $('canvas').on('mousewheel', (e,delta,deltaX,deltaY)=>{this.onWheel(e,delta,deltaX,deltaY);});

  }

}