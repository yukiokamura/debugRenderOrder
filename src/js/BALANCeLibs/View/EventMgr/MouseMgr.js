//--------------------------------------------------
//
//  MouseMgr
//
//--------------------------------------------------

export default class MouseMgr {

  constructor($wrap = $(document)) {

    this.$wrap = $wrap;

    this.x = 0;
    this.y = 0;
    this.px = 0; // previous
    this.py = 0; // previous

    this.cx = 0;
    this.cy = 0;

    this.setup();
    this.setEvents();

  }

  setup() {


  }

  onMousemove(e) {

    this.getPos(e);    

  }

  onTouchmove(e) {

    this.x = e.originalEvent.changedTouches[0].pageX; 
    this.y = e.originalEvent.changedTouches[0].pageY;

  }

  getPos(e) {

    if (e.offsetX==undefined) { // this works for Firefox
       this.x = e.pageX - this.$wrap.offset().left;
       this.y = e.pageY - this.$wrap.offset().top;
     } else { // works in Google Chrome
       this.x = e.pageX - $(window).scrollLeft();
       this.y = e.pageY - $(window).scrollTop();
     }

    this.cx = e.clientX - gb.r.haw;
    this.cy = e.clientY - gb.r.hah;

  }

  setEvents(){

    this.$wrap.on("touchmove.MouseMgr", (e)=>{this.onTouchmove(e);});
    this.$wrap.on("mousemove.MouseMgr", (e)=>{this.onMousemove(e);});

  }

  removeEvents(){

    this.$wrap.off("touchmove.MouseMgr");
    this.$wrap.off("mousemove.MouseMgr");

  }

}