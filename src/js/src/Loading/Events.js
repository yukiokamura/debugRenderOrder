//--------------------------------------------------
//
//  Events
//
//--------------------------------------------------

export default class Events {

  constructor(parent) {

    this.parent = parent;

    this.current = 0;
    this.ease = 0.12;

    this.isLock = false;
    this.loopStart = true;

    this.setup();
    this.setEvents();

  }

  setup(){


  }

  update() {

    var target = (gb.lm.completed / gb.lm.total) * 100;
    this.current += (target - this.current) * this.ease;
    gb.lm.current = this.current;
    // log(gb.lm.completed,gb.lm.total)

    // 終了処理
    if (this.current >= 100 && !this.isLock) {
      this.isLock = true;
      this.parent.onComplete();
    }

    // current が 99.9 より大きければ 100 と見なして終了処理へ
    if (this.current > 99.9) {
      this.current = 100;
    }

    // log(gb.lm.completed, gb.lm.total, this.current);

    return this;

  }

  setEvents() {


  }

}