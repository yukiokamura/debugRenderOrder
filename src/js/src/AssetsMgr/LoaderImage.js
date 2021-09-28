//--------------------------------------------------
//
//  LoaderImage
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

export default class LoaderImage {

  constructor() {

    this.list = [];

    this.cb = ()=>{};

  }

  img(paths, cbProg=()=>{}, cbComp=()=>{}){

    var cnt = 0, img;

    for(var i = 0;i < paths.length;i++){
      var p = paths[i];
      var l = [];
      for (var j = 0; j < p.length; j++) {
        var src = p[j].imgsrc;

        img = new Image();
        l.push(img);
        img.onload = ()=>{
          cbProg();
          cnt++;
          if(cnt == paths.length) cbComp();
        }
        // img.src = paths[i];
        img.src = src;
      }
      this.list.push(l);

    }

  }

}
