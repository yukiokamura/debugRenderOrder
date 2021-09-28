// setting
// import Conf from "@/Conf";
import { Conf } from "@/Conf";

import Util from "@BALANCeLibs/Util/Controller";
import Debugger from "@BALANCeLibs/Util/Debugger";

// model
import AssetsMgr from "@/AssetsMgr/Controller";
import Loading from "@/Loading/Controller";

// events
import UpdateMgr from "@BALANCeLibs/View/EventMgr/UpdateMgr";
import ResizeMgr from "@BALANCeLibs/View/EventMgr/ResizeMgr";
import ScrollMgr from "@BALANCeLibs/View/EventMgr/ScrollMgr";
import MouseMgr from "@BALANCeLibs/View/EventMgr/MouseMgr";
// import UpdateList from '@BALANCeLibs/View/EventMgr/UpdateList';
// import ResizeList from '@BALANCeLibs/View/EventMgr/ResizeList';
import ScrollList from "@BALANCeLibs/View/EventMgr/ScrollList";
// import MouseList from '@BALANCeLibs/View/EventMgr/MouseList';

//gsap
//プラグインを使うときに読む
import "@BALANCeLibs/View/gsap";

// view
import View from "@/View/Controller";

export default class Common {
  constructor() {
    this.onImmediate();
    this.setEvents();
  }

  onImmediate() {
    // ------------------------------------------------------------
    //  初期値の設定・データの配置
    //  util関数の初期化
    //  イベントマネージャーの設置
    // ------------------------------------------------------------
    // setting
    // gb.conf = new Conf();
    gb.conf = Conf;
    // util
    gb.u = new Util();
    gb.d = new Debugger();

    if (gb.conf.isUpdateMgr) gb.up = new UpdateMgr();
    if (gb.conf.isResizeMgr) gb.r = new ResizeMgr();

    this.onReady();
  }

  onReady() {
    gb.assets = {};
    // new AssetsMgr();
    // new Loading();

    // ------------------------------------------------------------
    //  View
    // ------------------------------------------------------------
    // Layout, UI, Effects
    gb.v = new View();
  }

  onLoad() {
    // ------------------------------------------------------------
    //  Util
    // ------------------------------------------------------------
    // ------------------------------------------------------------
    //  Model
    // ------------------------------------------------------------
    // ------------------------------------------------------------
    //  View
    // ------------------------------------------------------------
  }

  setEvents() {
    $(window).on("load", this.onLoad.bind(this));
  }
}

// ------------------------------------------------------------
//
//  Main
//
// ------------------------------------------------------------
(() => {
  // // globalオブジェクト
  if (window.gb === undefined) window.gb = {};

  gb.common = new Common();

  if (gb.up) gb.up.loop(); //全体のループスタート
})();
