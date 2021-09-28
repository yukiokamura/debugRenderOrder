import gulp from "gulp";

import { scss, scssmin } from "./_tasks/scss.js";
import { ejsBuild, ejsMinBuild } from "./_tasks/ejs.js";

import { delMaps } from "./_tasks/delete.js";
import { browsersync, reload } from "./_tasks/browserSync.js";
import { jsonMin } from "./_tasks/json.js";
import { resourceCopy } from "./_tasks/copy.js";

import PATH from "./_setting/config.js";

function watch(cb) {
  console.log("....watch file....");
  console.log("css =>" + PATH.src.css + "**/*.scss");
  console.log(
    "ejs =>" + [PATH.src.root + "**/*.ejs", PATH.dist.resource + "**/*.svg"]
  );
  console.log("js =>" + PATH.dist.js);
  console.log("....watch file....");
  gulp.watch(PATH.src.css + "**/*.scss", gulp.series(scss, reload));
  gulp.watch(
    [PATH.src.root + "**/*.ejs", PATH.dist.resource + "**/*.svg"],
    gulp.series(ejsBuild, reload)
  );
  gulp.watch(PATH.dist.js, gulp.series(reload));
}

gulp.task(
  "default",
  gulp.series(gulp.parallel(scss, ejsBuild), gulp.series(browsersync, watch))
);

gulp.task(
  "release",
  gulp.parallel(scssmin, ejsMinBuild, gulp.series(resourceCopy, jsonMin))
);
