import * as PIXI from "pixi.js-legacy";
class _PIXILoader {
  constructor() {
    this.cache = [];
  }

  async loadImg(path = null) {
    if (path === null) {
      console.warn("path is required");
      return;
    }
    const cache = this.getCache(path);
    if (cache) {
      console.log("cache load => " + path);
      return cache.texture;
    }
    const loader = new PIXI.Loader();
    loader.add(path, path);
    const p = new Promise((resolve, reject) => {
      loader.load((loader, resources) => {
        const texture =
          "texture" in resources[path]
            ? resources[path].texture
            : resources[path].textures;
        this.cache.push({
          id: path,
          texture,
        });
        resolve(texture);
      });
    });

    return p;
    // if(this.cache[])
  }

  async loadImgFromJson(path = null) {
    return this.loadImg(path);
  }

  getCache(id) {
    const cache = this.cache.filter((item) => item.id == id);
    if (cache.length) return cache[0];
    else undefined;
  }
}

const pixiLoader = new _PIXILoader();

export const LoadTexture = pixiLoader.loadImg.bind(pixiLoader);
export const LoadTextureFromJSON = pixiLoader.loadImgFromJson.bind(pixiLoader);

export default {
  loadTexture: LoadTexture,
  loadTextureFromJSON: LoadTextureFromJSON,
};
