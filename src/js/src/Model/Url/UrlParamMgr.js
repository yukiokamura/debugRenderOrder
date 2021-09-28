// ------------------------------------------------------------
//
//  UrlParamMgr
//
// ------------------------------------------------------------

import Base from "@BALANCeLibs/Base.js";

import Keys from "./Keys.js";

export default class UrlParamMgr extends Base {
  constructor() {
    super();

    this.name = "UrlParamMgr";

    this.keys = Keys();

    this.setParam();
    this.getParam();
  }

  setParam() {}

  getParam() {
    var params = location.search.replace("?", "").split("&");

    // データの設定
    for (var i = 0, len = params.length; i < len; i++) {
      // 各キー、バリューを取得
      var param = params[i];
      var p = param.split("=");
      var key = p[0],
        value = p[1];

      // データと比較して設定
      for (var j = 0; j < this.keys.length; j++) {
        var obj = this.keys[j];

        // パラメータがキーと一緒だったら
        if (obj.key === key) {
          // 各値と比較
          for (var k = 0; k < obj.value.length; k++) {
            var val = obj.value[k];

            // キーをthis.keysのkeyに、valueを比較して同値だったものに
            if (val === value) {
              this[obj.key] = val;
              break;
              // anyは、どの値でも
            } else if (val == "any") {
              this[obj.key] = value;
              break;
              // anyでも、特定の値でもなければ、def値を入れる
            } else {
              this[obj.key] = obj.def;
            }
          }
        }
      }
    }

    // キーに値が設定されてなければ、def値を設定
    for (var j = 0; j < this.keys.length; j++) {
      var obj = this.keys[j];

      if (this[obj.key] == undefined) this[obj.key] = obj.def;
    }
  }
}
