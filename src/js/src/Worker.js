// const FileType = require("file-type/browser");

onmessage = ({ data }) => {
  const xhr = new XMLHttpRequest();

  xhr.open("GET", data.path, true);
  xhr.responseType = "arraybuffer";

  xhr.onload = (e) => {
    if (xhr.status == 200) {
      postMessage(
        {
          id: data.id,
          data: xhr.response,
          type: data.type,
        },
        [xhr.response]
      );
    }
  };

  xhr.send();
};
