//--------------------------------------------------
//
//  MouseList
//
//--------------------------------------------------

export default class MouseList {

  constructor($wrap = $(document)) {

    this.$wrap = $wrap;

    this.list = [{name:'def',func:()=>{}}];
    this.startList = [{name:'def',func:()=>{}}];
    this.endList = [{name:'def',func:()=>{}}];

    this.x = 0;
    this.y = 0;
    this.endx = 0;
    this.endy = 0;

    this.isStart = true;
    this.Timer = null;
    this.endTime = 20;

    this.setup();
    this.setEvents();

  }

  setup() {

    // this.add('onEnd', this.onMouseEnd.bind(this));

  }

  onTouchMove(e) {

    for (var i in this.list) this.list[i].func();

  }

  onMouseMove(e) {

    if (this.Timer) clearTimeout(this.Timer);
    var dis = gb.m.x - this.endx;
    // log(this.isStart, dis);
    // if (this.isStart && Math.abs(dis)>3) {
    //   this.isStart = false;

    //   // 最初だけの処理
    //   // log('moveStart');

    //   for (var i in this.startList) this.startList[i].func();

    // };

    for (var i in this.list) this.list[i].func();

  }

  onMouseEnd(e) {

    if (this.Timer) clearTimeout(this.Timer);
    this.Timer = setTimeout(()=>{
      if (!this.isStart) {
        this.isStart = true;

        // log('moveEnd');
        this.endx = gb.m.x;
        this.endy = gb.m.y;

        for (var i in this.endList) this.endList[i].func();
      }
    }, this.endTime);

  }

  add(name, func) {

    var obj = {name:name,func:func};

    this.list.push(obj);
    
  }
 
  addStart (name, func) {

    var obj = {name:name,func:func};

    this.startList.push(obj);
    
  }

  addEnd (name, func) {

    var obj = {name:name,func:func};

    this.endList.push(obj);
    
  }

  remove(name) {

    MouseList.arrRemove(this.list, name);

  }

  removeStart(name) {

    MouseList.arrRemove(this.startList, name);

  }

  removeEnd(name) {

    MouseList.arrRemove(this.endList, name);

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

  setEvents(){

    this.$wrap.on("touchmove.MouseList", (e)=>{this.onTouchMove(e);});
    this.$wrap.on("mousemove.MouseList", (e)=>{this.onMouseMove(e);});

  }

  removeEvents(){

    this.$wrap.off("touchmove.MouseList");
    this.$wrap.off("mousemove.MouseList");

  }


}