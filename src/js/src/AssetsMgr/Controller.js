//--------------------------------------------------
//
//  LoadMgr
//
//--------------------------------------------------

import THREELoader from "./WebGL/THREELoader";
import PIXILoader from "./WebGL/PIXILoader";

import DomLoader from "./Dom/Loader";

export default class LoadMgr {
  constructor() {
    this.isFirst = true;

    this.setup();
    this.setEvents();
  }

  setup() {
    this.domLoader = new DomLoader();
  }

  async load() {
    //画像100枚ロードする
    gb.assets.imgs = [];
    const imgs = [...Array(100)]
      .map((_, i) => i + 1)
      .map((e) => "/assets/resource/img/" + e + ".jpg")
      .map((path) => {
        return this.domLoader.loadImg(path).then((img) => {
          gb.assets.imgs.push(img);
        });
      });
    // this.domLoader.loadVideo("/assets/resource/mp4/movie.mp4").then((video) => {
    //   $(".imgs").append(video);
    // });
    await Promise.all(imgs);
  }

  setupLoad() {}

  setEvents() {
    //debug
    $(".btn1").on("click", (e) => {
      this.load().then((e) => {
        $(".status").append("<p>complete loaded</p>");
      });
    });

    $(".btn2").on("click", (e) => {
      this.load().then((e) => {
        let c = 0;
        const d = 20;
        $(".status").append("<p>complete loaded</p>");
        gb.assets.imgs.forEach((img, i) => {
          $(".imgs").append(img);
          setTimeout(() => {
            img.classList.add("show");

            setTimeout(function () {
              ++c;
              img.classList.remove("show");
              //
              if (c == gb.assets.imgs.length) {
                $(".imgs").addClass("show");
              }
            }, d);
            // img.style.opacity = 1;
          }, i * d);
        });
      });
    });
  }
}
