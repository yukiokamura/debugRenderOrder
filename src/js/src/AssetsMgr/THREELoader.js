//--------------------------------------------------
//
//  THREELoader
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

export default class THREELoader {

  constructor() {

    this.cb = ()=>{};

  }

  textureByName(len,r,cbProg,cbComp) {

    this.list = [];
    var cnt = 0;

    for(var i = 0;i < len; i++) {

      var resource = r[i];
      var tl = new THREE.TextureLoader();
      // tl.crossOrigin = 'anonymous';
      tl.load(resource, (tex) => {

        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        
        cbProg();
        cnt++; // ロード数をカウント
        this.list.push(tex);
        if (cnt==len) cbComp();

      });

    }

  }

  textureByName_order(len,r,cbProg,cbComp) {

    this.list = [];
    var cnt = 0;

    var load = (i)=>{

      var resource = r[i];
      var tl = new THREE.TextureLoader();
      // tl.crossOrigin = 'anonymous';
      tl.load(resource, (tex) => {

        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        
        // ロード数をカウント
        cnt++;
        this.list.push(tex);

        cbProg();
        if (cnt==len) cbComp();
        else load(cnt);

      });

    }

    load(cnt);

  }

}
