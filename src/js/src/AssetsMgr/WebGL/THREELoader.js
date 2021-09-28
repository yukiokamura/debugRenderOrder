import { TextureLoader, RepeatWrapping, LinearFilter, Cache } from "three";
class _THREELoader {
  constructor() {
    Cache.enabled = true;
    this.option = {
      wrapS: RepeatWrapping,
      wrapT: RepeatWrapping,
      magFilter: LinearFilter,
      minFilter: LinearFilter,
    };

    this.cache = [];
  }

  //promise
  async loadImg(path = null, _option = {}) {
    if (path === null) {
      console.warn("path is required");
      return;
    }
    const option = {
      ...this.option,
      ..._option,
    };
    const loader = new TextureLoader();
    const cache = Cache.get(path);

    if (cache) {
      console.log("cache load => " + path);
      return cache;
    }
    const p = new Promise((resolve, reject) => {
      loader.load(
        path,
        (texture) => {
          texture.wrapS = option.wrapS;
          texture.wrapT = option.wrapT;
          texture.magFilter = option.magFilter;
          texture.minFilter = option.minFilter;
          Cache.add(path, texture);
          this.cache.push(path);
          resolve(texture);
        },
        undefined,
        (err) => {
          console.error("fail load texture =>" + path);
          reject(err);
        }
      );
    });

    return await p;
  }

  //promise
  async loadImgList(paths = [], _option = {}) {
    if (!Array.isArray(paths)) {
      console.warn("paths needs array");
      return;
    }
    const textures = paths.map((path) => this.loadImg(path, _option));

    return await Promise.all(textures);
  }

  removeCache() {
    this.cache.forEach((key) => {
      Cache.remove(key);
    });
    this.cache = [];
  }

  //fbxLoad
  async loadFBX(path = null) {
    if (path === null) {
      console.warn("path is required");
      return;
    }
    const cache = Cache.get(path);
    if (cache) {
      console.log("cache load => " + path);
      return cache;
    }
    //script load
    const { FBXLoader } = await import(
      /* webpackChunkName: "FBXLoader" */ "three/examples/jsm/loaders/FBXLoader.js"
    );
    const loader = new FBXLoader();
    return this.loadModel(loader, path);
  }

  //OBJLoad
  async loadOBJ(objPath = null, mtPath = null) {
    if (objPath === null || mtPath === null) {
      console.warn("objPath or mtPath is required");
      return;
    }
    const objcache = Cache.get(objPath);
    if (objcache) {
      console.log("cache load => " + objPath);
      return objcache;
    }

    let mt = Cache.get(mtPath);

    //script load

    const p = [
      import(
        /* webpackChunkName: "MTLLoader" */ "three/examples/jsm/loaders/MTLLoader.js"
      ),
      import(
        /* webpackChunkName: "OBJLoader" */ "three/examples/jsm/loaders/OBJLoader.js"
      ),
    ];

    const [{ MTLLoader }, { OBJLoader }] = await Promise.all(p);
    const mtlLoader = new MTLLoader();
    const objLoader = new OBJLoader();
    if (!mt) mt = await this.loadModel(mtlLoader, mtPath);
    mt.preload();
    objLoader.setMaterials(mt);
    return this.loadModel(objLoader, objPath);
    // return this.loadModel(loader, path);
  }

  //gltf or glb load
  async loadGLB(path = null) {
    if (path === null) {
      console.warn("path is required");
      return;
    }
    const cache = Cache.get(path);
    if (cache) {
      console.log("cache load => " + path);
      return cache;
    }
    const { GLTFLoader } = await import(
      /* webpackChunkName: "GLTFLoader" */ "three/examples/jsm/loaders/GLTFLoader.js"
    );

    const loader = new GLTFLoader();
    return this.loadModel(loader, path);
  }

  async loadModel(loader, path = null) {
    const p = new Promise((resolve, reject) => {
      loader.load(
        path,
        (obj) => {
          Cache.add(path, obj);
          this.cache.push(path);
          resolve(obj);
        },
        undefined,
        (err) => {
          reject(err);
        }
      );
    });

    return await p;
  }
}

const threeLoader = new _THREELoader();

export const LoadTexture = threeLoader.loadImg.bind(threeLoader);
export const LoadTextureList = threeLoader.loadImgList.bind(threeLoader);
export const RemoveCache = threeLoader.removeCache.bind(threeLoader);
export const LoadFBX = threeLoader.loadFBX.bind(threeLoader);
export const LoadOBJ = threeLoader.loadOBJ.bind(threeLoader);
export const LoadGLB = threeLoader.loadGLB.bind(threeLoader);
export default {
  loadTexture: LoadTexture,
  loadTextureList: LoadTextureList,
  removeCache: RemoveCache,
  loadFBX: LoadFBX,
  loadOBJ: LoadOBJ,
  loadGLB: LoadGLB,
};
