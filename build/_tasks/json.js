import gulp from "gulp";
import jsonMinify from "gulp-json-minify";
import PATH from "../_setting/config.js";
export function jsonMin(cb) {
  return gulp
    .src([PATH.production.resource + "**/*.json"])
    .pipe(jsonMinify())
    .pipe(gulp.dest(PATH.production.resource));
}
