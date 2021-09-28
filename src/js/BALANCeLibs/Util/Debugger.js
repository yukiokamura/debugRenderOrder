// ------------------------------------------------------------
//
//  Debugger
//
// ------------------------------------------------------------

export default class Debugger {

  constructor() {

    this.setup();
    this.setEvents();

  }

  setup() {

    this.console(); // console

  }

  // html外出し用
  setupHTML() {

    // 本番だったら、div追加しない
    if (!gb.conf.LOG) return;

    this.$target = $('<div class="debug"></div>');

    this.$target
      .prependTo($('body'))
      .css({
        position: 'fixed',
        'z-index': 99999,
        left: 20,
        top: 20,
      });

  }

  // log系を短く
  console() {

    // 置換対象のメソッドを配列として保持する
    var methods = [
      'log',
      // 'debug',
      // 'info',
      // 'warn',
      // 'error',
      // 'dir',
      // 'trace',
      // 'assert',
      // 'dirxml',
      // 'group',
      // 'groupEnd',
      // 'time',
      // 'timeEnd',
      // 'count',
      // 'profile',
      // 'profileEnd'
    ];

    // consoleが使えない場合は空のオブジェクトを設定しておく
    if( typeof window.console === "undefined" ){
      window.console = {};
    }

    // 各メソッドをwindowへ直接追加して行く
    for( var i in methods ){
      (function( m ){

       // consoleにある？デバッグモードは有効？consoleのものは関数？
       if( console[m] && typeof console[m] === "function" && gb.conf.LOG){
        window[m] = console[m].bind(console);
       } else {　// debugModeがfalse,もしくは該当メソッドが存在しない場合は、空のメソッドを用意する
        window[m] = function(){};
       }

      })( methods[i] );
    }

  }

  // htmlに外出し
  html(v) {

    // 本番だったら、div追加しない
    if (!gb.conf.LOG) return;

    this.$target.text(v);

  }

  // alert
  alert(v) {

    window.alert(v);

  }

  onReady() {

    this.setupHTML();

  }

  setEvents() {

    $(document).on('ready', this.onReady.bind(this));

  }

}