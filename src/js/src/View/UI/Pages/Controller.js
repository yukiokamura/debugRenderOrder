//--------------------------------------------------
//
//  Controller
//
//--------------------------------------------------

import Base from "@BALANCeLibs/Base.js";
import * as m from "@BALANCeLibs/Util/Math.js";
import Top from "./Top/Controller";
export default class Controller extends Base {
  constructor() {
    super();

    this.setup();
    this.setEvents();

    // this.timeline();
  }

  setup() {
    console.log("setup");
    this.top = new Top();
    this.top.timeline();
  }

  timeline() {}

  update() {}

  onResize() {}

  setEvents() {
    super.setEvents();

    // $(window).on('loadingEnd', this.timeline.bind(this));
    // $(window).on("loadingEnd", this.setup.bind(this));
  }
}
