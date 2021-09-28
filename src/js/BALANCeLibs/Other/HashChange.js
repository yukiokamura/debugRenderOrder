//--------------------------------------------------
//
//  HashChange
//
//--------------------------------------------------

export default class HashChange {

  constructor($target = $('.hash')) {

    // ---------------------
    //  dom
    // ---------------------
    this.$target = $target;

    this.id = this.getID();

    this.nextHash = ''; //次のページ 
    this.curHash = this.getHash(); //現在ページ 
    this.prevHash = ''; //前のページ 

    this.state = 'static';
      // click クリック
      // before 遷移前1秒

      // 遷移

      // after 遷移後1秒
      // done ページ表示完了

    this.transition = ()=>{};  
    this.onChangeFuncList = [];

    this.setup();
    this.setEvents();

  }

  setup() {

    // リンク機能停止
    $('a').click((e)=>{e.preventDefault();});

  }

  getID() {

    return $('body').attr('id');

  }

  setID() {

    this.id = $('.pjaxWrap').data('id');
    $('body').attr('id', this.id);

  }

  getHash() {

    var hash = location.hash;
    return hash.split('#')[1];
      
  }

  switchHash(hash) {

    location.hash = hash;
      
  }

  onHashChange() {

    this.prevHash = this.curHash;
    this.curHash = this.getHash();


    log(this.curHash,this.prevHash);

    for (var i in this.onChangeFuncList) this.onChangeFuncList[i](this.curHash,this.prevHash);

  }

  onClick(e) {

    var hash = $(e.currentTarget).data('hash');
    this.e = e;
    this.nextHash = href;

    // 遷移前アニメーション時間 1秒
    this.transition();

    // ハッシュの変更
    this.transition.onBeforeComplete = this.switchHash.bind(this)

    // 遷移後アニメーション時間 1秒
    this.transition.onAfterComplete = ()=>{}

    // ページ表示完了
    this.transition.onComplete = ()=>{}

  }

  setEvents() {

    $(window).hashchange(this.onHashChange.bind(this));
    this.$target.on('click.hash', (e)=>{this.onClick(e)});

  }

  removeEvent() {

    

  }


}