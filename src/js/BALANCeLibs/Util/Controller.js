//--------------------------------------------------
//
//  Controller
//
//--------------------------------------------------

import UrlParamMgr from "@/Model/Url/UrlParamMgr.js";
import Profiler from "@BALANCeLibs/Other/Profiler.js";
import {
  blank,
  requestAnimationFrame,
  scrollRestoration,
  checkPassive,
} from "./Other.js";

export default class Controller {
  constructor() {
    this.setup();
    this.setEvents();
  }

  setup() {
    blank();
    requestAnimationFrame();
    scrollRestoration(false);
    checkPassive();

    // page id
    gb.pageID = $("body").attr("id");

    // UrlParam パラメータ調整用
    gb.urlp = new UrlParamMgr();

    if (gb.conf.Profiler) new Profiler(); // Profiler
  }

  setEvents() {}
}
