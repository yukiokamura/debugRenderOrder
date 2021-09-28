//--------------------------------------------------
//
//  updateManager
//
//--------------------------------------------------

export default class UpdateMgr {

  constructor() {

    this.frame = 0;
    this.len = 0;
    this.Timer = null;
    this.isStop = false;

    this.st = 0;
    this.et = 0;
    this.delta = 0;
    this.frameRate = 0;

    this.setup();

  }

  setup() {

    this.start = this.st = new Date().getTime();
    this.fps = 60.0;
    this.frameLength = 6.0;

  }

  loop() {

    // delta
    var et = new Date().getTime();    
    this.delta = et - this.st;
    this.st = et;

    // frame
    this.frame++;

    // 再帰
    this.Timer = requestAnimationFrame(this.loop.bind(this));

  }

  stop() {

    cancelAnimationFrame(this.Timer);    

  }

  resume() {

    this.loop();

  }

  getElapsedTime () {

    var elapsed = new Date().getTime() - this.start;

    return elapsed / 1000;

  }

}