//--------------------------------------------------
//
//  ViewTop sss
//
//--------------------------------------------------
import Base from "@BALANCeLibs/Base.js";

import UIController from "./UI/Controller.js";

export default class ViewCommon extends Base {
  constructor() {
    super();

    this.name = "ViewCommon";

    this.isUEv = false; // update
    this.isREv = true; // resize
    this.isSEv = false; // scroll
    this.isMEv = false; // mouse

    this.setup();
    this.setEvents();
  }

  setup() {}

  onLoad() {
    new UIController();
    // ------------------------------------------------------------
    // timeline
    // ------------------------------------------------------------
  }

  onLoadingEnd() {
    // ------------------------------------------------------------
    //  Util
    // ------------------------------------------------------------
    // ------------------------------------------------------------
    //  layout
    // ------------------------------------------------------------
    // ------------------------------------------------------------
    //  ui
    // ------------------------------------------------------------
    // ------------------------------------------------------------
    // effect
    // ------------------------------------------------------------
    // ------------------------------------------------------------
    // Scene / timeline
    // ------------------------------------------------------------
  }

  update() {}

  onResize() {}

  onLoadAll() {
    // new Responsive();
  }

  setEvents() {
    super.setEvents();

    $(window).on("load", this.onLoad.bind(this));
    $(window).on("loadingEnd", this.onLoadingEnd.bind(this));
    $(window).on("loadAll", this.onLoadAll.bind(this));
  }
}
