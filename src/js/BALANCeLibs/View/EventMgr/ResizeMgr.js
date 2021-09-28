//--------------------------------------------------
//
//  ResizeMgr
//
//--------------------------------------------------

export default class ResizeMgr {

  constructor() {

    this.w = 0;
    this.h = 0;
    this.oldW = 0;
    this.oldH = 0;
    this.ww = 0;
    this.wh = 0;

    this.setup();
    this.setEvents();

  }

  setup() {

    this.getWindowSize();

  }

  getWindowSize(){

    this.oldW = this.w;
    this.oldH = this.h;
    this.w = window.innerWidth;
    this.h = window.innerHeight;

    this.ww = $(window).width();
    this.hh = $(window).height();

    this.haw = this.w / 2;
    this.hah = this.h / 2;

  }

  onResize(e) {

    this.getWindowSize();

  }

  setEvents() {

    $(window).on('resize', this.onResize.bind(this));
    // $(window).on('resize', $.throttle(100, false, this.onResize.bind(this)));
    // $(window).on('resize', $.debounce(200, this.onResize.bind(this)));

  }

}