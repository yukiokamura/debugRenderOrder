import Base from "./Base";

import { loadYoutubeAPI, loadWebFontsLoader, loadScript } from "./Utiles";

export default class Loader extends Base {
  constructor() {
    super();
    this.isYoutubeFirstLoaded = false;
    this.youtubeAPILoad;
  }

  loadImg(path) {
    return super.load(path, "img");
  }

  loadVideo(path) {
    return super.load(path, "video");
  }

  async loadYoutube(id, element, events) {
    if (!("YT" in window) && !this.isYoutubeFirstLoaded) {
      this.isYoutubeFirstLoaded = true;
      this.youtubeAPILoad = loadYoutubeAPI();
    }
    if (!("YT" in window)) {
      await this.youtubeAPILoad;
    }
    const p = new Promise((resolve, reject) => {
      new YT.Player(element, {
        height: "360",
        width: "640",
        videoId: id,
        events: {
          ...events,
          onReady: (e) => {
            events.onReady();
            resolve();
          },
        },
      });
    });
  }

  //https://github.com/typekit/webfontloader
  async loadWebFonts(config) {
    const loader = await loadWebFontsLoader();
    const p = new Promise((resolve, reject) => {
      let _config = {
        ...config,
        active: (e) => {
          if ("active" in config) config.active();
          resolve();
        },
      };
      loader(_config);
    });

    return await p;
  }

  async loadJson(path) {
    return fetch(path).then((e) => e.json());
  }

  loadScript(path) {
    return loadScript(path);
  }
}
