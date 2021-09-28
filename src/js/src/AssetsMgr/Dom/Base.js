import bufferify from "json-bufferify";
export default class Loader {
  constructor() {
    this.worker = new Worker("./assets/js/worker.js");
    this.promise = {};

    this.setEvents();
  }

  async load(path, type) {
    const url = new URL(location.href);
    url.pathname = path;
    const id = Date.now() + "-" + Math.random() * 10000;
    const p = new Promise((resolve, reject) => {
      this.promise[id] = resolve;
    });
    this.worker.postMessage({
      path: url.href,
      id,
      type,
    });
    return p;
  }

  /**
   *   @param {array} list [path,path,...]
   */
  loadList(list) {
    return Promise.all(list.map((path) => this.load(path)));
  }

  createDom(type, url) {
    const ele = document.createElement(type);
    ele.onload = () => {
      window.URL.revokeObjectURL(url);
    };
    ele.src = url;

    return ele;
  }

  setEvents() {
    this.worker.addEventListener("message", async ({ data }) => {
      const blob = await Promise.resolve(new Blob([data.data]));
      const url = await Promise.resolve(URL.createObjectURL(blob));
      const ele = this.createDom(data.type, url);
      // console.log(url);
      this.promise[data.id](ele);
    });
  }
}
