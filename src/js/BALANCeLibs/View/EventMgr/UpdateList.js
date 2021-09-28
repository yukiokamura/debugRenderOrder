//--------------------------------------------------
//
//  updateList
//
//--------------------------------------------------

export default class UpdateList {

  constructor() {

    this.list = [];

    this.Timer = null;
    this.isStop = false;

  }

  setup() {


  }

  update() {

    // 処理
    for (var i in this.list) this.list[i].func();

    // 再帰
    this.Timer = requestAnimationFrame(this.update.bind(this));
    if (this.isStop) cancelAnimationFrame(this.Timer);    

  }

  start() {

    this.update();

  }

  stop() {

    this.isStop = true;

  }

  resume() {

    this.isStop = false;
    this.update();

  }

  add(name, func) {

    var obj = {name:name,func:func};

    this.list.push(obj);
    
  }

  remove(name) {

    var target = {name:name,func:()=>{}};

    UpdateList.arrRemove(this.list, target);

  }

  // ------------------------------------------------------------
  //
  //  静的メンバ
  //
  // ------------------------------------------------------------
  static arrRemove(arr , target) {

    var len = arr.length;
    var check;
    for( var i = 0 ; i < len; i++ ) {
      check = arr[ i ];

      if( check.name == target.name){
        arr.splice( i , 1 ) ;
        i--;
        len--;
      }
    }

    return arr;

  }

}