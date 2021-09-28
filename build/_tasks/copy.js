import gulp from "gulp";
import PATH from "../_setting/config.js";
export function resourceCopy(cb) {
  return gulp
    .src([PATH.dist.resource + "**/*"])
    .pipe(gulp.dest(PATH.production.resource));
}
