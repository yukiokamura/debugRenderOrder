//--------------------------------------------------
//
//  Render
//
//--------------------------------------------------
import { TweenMax } from "gsap";
export default class Render {
  constructor(parent) {
    this.$wrap = $("html");

    this.setup();
    this.setEvents();
  }

  setup() {}

  add() {
    var html =
      '<div id="loading">' +
      '<div class="loadingBar"></div>' +
      '<div class="loadingPercent"></div>' +
      "</div>";

    this.$wrap.append(html);

    // get dom
    this.$loading = $("#loading");
    this.$bar = $("#loading .loadingBar");
    this.$percent = $("#loading .loadingPercent");
  }

  show() {
    // var tl = new TimelineMax();

    // tl.to(this.$loading, 1.0, {
    //   opacity: 1,
    //   ease: Expo.easeInOut,
    //   onComplete: ()=>{

    //   }
    // })

    TweenMax.set(this.$loading, { opacity: 1 });
  }

  update(e) {
    // log('loading', e.current);

    this.$bar.css({ width: e.current + "%" }); // bar
    // this.$percent.html( Math.floor(e.current) + '<span>%</span>'); // value
    this.$percent.html(Math.floor(e.current)); // value
  }

  hide() {
    var tl = new TimelineMax();

    tl.to(this.$bar, 1.0, {
      x: "102%",
      ease: Expo.easeInOut,
      onComplete: () => {
        this.remove();
      },
    }).to(
      this.$percent,
      1.0,
      {
        opacity: 0,
        ease: Power2.easeInOut,
      },
      0.0
    );
  }

  remove() {
    this.$loading.remove();
  }

  setEvents() {}
}
