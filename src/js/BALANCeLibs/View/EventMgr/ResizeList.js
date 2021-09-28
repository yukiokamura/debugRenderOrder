//--------------------------------------------------
//
//  ResizeList
//
//--------------------------------------------------

export default class ResizeList {

  constructor() {

    this.list = [];

    this.setup();
    this.setEvents();

  }

  setup() {


  }

  onResize(e) {

    for (var i in this.list) this.list[i].func();

  }

  add(name, func) {

    var obj = {name:name,func:func};

    this.list.push(obj);
    
  }

  remove(name) {

    var arr = this.list;
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

  }

  setEvents() {

    // $(window).on('resize', this.onResize.bind(this));
    $(window).on('resize', $.throttle(100, false, this.onResize.bind(this)));
    $(window).on('resize', $.debounce(200, this.onResize.bind(this)));

  }

}