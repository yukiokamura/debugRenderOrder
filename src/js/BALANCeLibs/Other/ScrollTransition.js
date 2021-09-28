//--------------------------------------------------
//
//  ScrollTransition
//
//--------------------------------------------------

export default class ScrollTransition {

  constructor($target) {

    this.pageList = {
      'top': 0,
      'movie': 1,
      'interview': 2,
      'history': 3,
    }

    // variable
    this.current = 0;
    this.old = null;
    this.next = 1;
    this.prev = null;
    this.len = 4;

    this.isSwitch = true;


    this.setup();
    this.setEvents();

  }

  setup() {


  }

  switch() {

    if (!gb.u.isIE) var val = 30;
    else var val = 0;

    log(gb.pjax.isPjaxLock,this.STAmount,this.current,this.isSwitch);

    // pjaxlock時は処理しない
    if (gb.pjax.isPjaxLock) return;

    // ページ番号を取得
    this.current = this.pageList[gb.pjax.id];

    //ホイールが0以上 かつ currentが一番最初でない かつ switch可能状態であれば
    if (this.STAmount > val && this.current > 0 && this.isSwitch) {

      // historyページのときは上スクロールしてもinterview indexに飛ばさない
      if (gb.pjax.id=='history') return;

      this.isSwitch = false;
  
      this.calculateOrder('prev');

      var pageName = Object.keys(this.pageList).filter( (key) => { return this.pageList[key] === this.current })[0];

      $('.pjaxTo_'+pageName).trigger('click');


    //ホイールが0以下 かつ currentが一番最後でない かつ switch可能状態であれば
    } else if(this.STAmount < -val && this.current < this.len-1 && this.isSwitch) {

      this.isSwitch = false;
      
      this.calculateOrder('next');

      var pageName = Object.keys(this.pageList).filter( (key) => { return this.pageList[key] === this.current })[0];

      $('.pjaxTo_'+pageName).trigger('click');

    };


  }

  calculateOrder(dir) {

    this.old = this.current;

    if (dir=='next') {

      this.current++;
      if (this.current>this.len-1) this.current=this.len-1;
      this.next = this.current+1;
      this.prev = this.current-1;

    } else {

      this.current--;
      if (this.current<0) this.current=0;  
      this.next = this.current+1;
      this.prev = this.current-1;

    }     

  }

  onMouseWheel(e, delta, deltaX, deltaY) {

    // menuが開いているときはスクロール遷移させない
    if (gb.menu.isOpen) return;
    // res spのときは処理しない
    if (gb.u.isResSP) return

    this.STAmount = gb.s.STAmount;
    
    this.switch();

  }

  setEvents() {


    gb.s.add('ScrollTransition', this.onMouseWheel.bind(this));


  }
  
}