import  PATH  from "../_setting/config.js";
import browserSync from "browser-sync";
export function browsersync(cb) {
  browserSync.init({
    port: 3000,
    server: {
      baseDir: PATH.dist.root,
      index: "index.html",
    },
  });

  cb();
}

export function reload(cb) {
  browserSync.reload();
  cb();
}
