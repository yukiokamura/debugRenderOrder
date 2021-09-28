import PATH from "../_setting/config.js";
import gulp from "gulp";
import del from "delete";
console.log(PATH.dist.css);
export function delMaps(cb) {
  return del([PATH.dist.css + "/maps/"], { force: true });
}
