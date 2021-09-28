import PATH from "../_setting/config.js";
import gulp from "gulp";
import ejs from "gulp-ejs";
import rename from "gulp-rename";
import htmlmin from "gulp-htmlmin";
const path = require("path");
import fs from "fs";
import stripJsonComments from "strip-json-comments";

export function ejsBuild(cb) {
  var json = PATH.src.ejs + "inc/metaData.json";
  var data = JSON.parse(stripJsonComments(fs.readFileSync(json, "utf8")));

  return gulp
    .src([PATH.src.ejs + "page/**/!(_)*.ejs", "!" + PATH.src.ejs + "inc/**/*"])
    .pipe(ejs({ data: data }, { root: PATH.dist.root }))
    .pipe(rename({ extname: ".html" }))
    .pipe(gulp.dest(PATH.dist.root));
}

export function ejsMinBuild(cb) {
  var json = PATH.src.ejs + "inc/metaData.json";
  var data = JSON.parse(stripJsonComments(fs.readFileSync(json, "utf8")));

  return gulp
    .src([PATH.src.ejs + "page/**/!(_)*.ejs", "!" + PATH.src.ejs + "inc/**/*"])
    .pipe(ejs({ data: data }, { root: PATH.dist.root }))
    .pipe(rename({ extname: ".html" }))
    .pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
    .pipe(gulp.dest(PATH.production.root));
}
