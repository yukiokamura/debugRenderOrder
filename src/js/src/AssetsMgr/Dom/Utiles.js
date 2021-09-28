export const loadYoutubeAPI = () => {
  loadScript("https://www.youtube.com/iframe_api");
  const p = new Promise((resolve, reject) => {
    window.onYouTubeIframeAPIReady = (e) => {
      resolve();
    };
  });
  return p;
};
export const loadWebFontsLoader = () => {
  return import(/* webpackChunkName: "webfontloader" */ "webfontloader").then(
    ({ load }) => load
  );
};

export const loadScript = async (path) => {
  const tag = document.createElement("script");
  tag.src = path;
  document.getElementsByTagName("head")[0].appendChild(tag);

  const p = new Promise((resolve, reject) => {
    tag.onload = resolve;
  });

  return p;
};
