//--------------------------------------------------
//
//  Loader
//
//--------------------------------------------------

// TextLoader
// SVGLoader
// CSSLoader
// JavaScriptLoader
// BinaryLoader
// ImageLoader
// SpriteSheetLoader
// VideoLoader
// SoundLoader
// JSONLoader
// JSONPLoader
// XMLLoader

export default class Loader {

  constructor() {

    this.cb = ()=>{};

  }

  youtubeIframeScript(cb) {

    // IFrame Player API の読み込み
    var tag = document.createElement('script');
    tag.onload = ()=>{

      // this.cb();

    };

    // tag.src = "https://www.youtube.com/iframe_api";
    tag.src = "//www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);


    // YouTube動画
    window.onYouTubeIframeReady = function() {

      log('youtubeready');


    }

  }

  webFont(config) {

    // web font loader用jsのappend
    var wf = document.createElement('script');
    wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
      '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
    wf.type = 'text/javascript';
    wf.async = 'true';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wf, s);

    var again = ()=>{

      // yt.playerがloadされていない場合を考慮して
      if((typeof WebFont !== "undefined") && WebFont) {

          WebFont.load(config);

      }else{

          setTimeout(again, 100);

      }

    }

    again();    

  }

  webFont_setting() {

    // web font loader用param
    // var config = {
    //   custom: {
    //     families: [
    //       'Cormorant',
    //       'Roboto Condensed'
    //       // 'Noto Sans Japanese',
    //       // 'Roboto',
    //       // 'Alegreya Sans',
    //       // 'Alegreya Sans SC'
    //       ],
    //     urls: [
    //       'https://fonts.googleapis.com/css?family=Cormorant:500,500i|Roboto+Condensed'
    //       // './ff15/royal/gallery2018/assets/css/font.css',
    //       // 'https://fonts.googleapis.com/css?family=Roboto:400,500,300',
    //       // 'https://fonts.googleapis.com/css?family=Alegreya+Sans:400,100',
    //       // 'https://fonts.googleapis.com/css?family=Alegreya+Sans+SC:400,300,100'
    //       ]
    //   },
    //   active: function() { 
          
    //       log('webFont!!!!');
    //       gb.in.conf.webFontLoaded = true;

    //   } 
    // };

    var conf = {
      custom: {
        families: ['Source Code Pro', 'FontAwesome'],
        urls: [
          'https://fonts.googleapis.com/css?family=Source+Code+Pro:600',
          'https://netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css'
        ],
        testStrings: {
          'FontAwesome': '\uf001'
        }
      },
      // Web Fontが使用可能になったとき
      active: function() {
        new DemoIconsWorld();
      }
    }

    var loader = new Loader();   
    loader.webFont(config);

  }


}
