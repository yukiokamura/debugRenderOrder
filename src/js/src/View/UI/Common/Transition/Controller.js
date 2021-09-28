//--------------------------------------------------
//
//  Controller
//
//--------------------------------------------------

import Base from "@BALANCeLibs/Base.js";
import * as m from "@BALANCeLibs/Util/Math/index.js";

export default class Controller extends Base {
  constructor() {
    super();

    this.setup();
    this.setEvents();

    // this.timeline();
  }

  setup() {}

  timeline() {}

  update() {}

  onResize() {}

  setEvents() {
    super.setEvents();

    // $(window).on('loadingEnd', this.timeline.bind(this));
    $(window).on("loadingEnd", this.setup.bind(this));
  }
}
