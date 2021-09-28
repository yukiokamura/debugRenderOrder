import PATH from "../_setting/config.js";

import gulp from "gulp";
import plumber from "gulp-plumber";
import sass from "gulp-sass";
import glob from "gulp-sass-glob";
import notify from "gulp-notify";
import autoprefixer from "autoprefixer";
import cssmin from "gulp-cssmin";
export function scss(cb) {
  return gulp
    .src([PATH.src.css + "style.scss"], { sourcemaps: true })
    .pipe(glob())
    .pipe(sass({ outputStyle: "expanded" }))
    .pipe(gulp.dest(PATH.dist.css, { sourcemaps: "./maps/" }));
}

export function scssmin(cb) {
  return gulp
    .src([PATH.src.css + "style.scss"])
    .pipe(glob())
    .pipe(sass({ outputStyle: "expanded" }))
    .pipe(cssmin())
    .pipe(gulp.dest(PATH.production.css));
}
