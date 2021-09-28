/******/ (() => { // webpackBootstrap
/*!*******************************!*\
  !*** ../src/js/src/Worker.js ***!
  \*******************************/
// const FileType = require("file-type/browser");
onmessage = function onmessage(_ref) {
  var data = _ref.data;
  var xhr = new XMLHttpRequest();
  xhr.open("GET", data.path, true);
  xhr.responseType = "arraybuffer";

  xhr.onload = function (e) {
    if (xhr.status == 200) {
      postMessage({
        id: data.id,
        data: xhr.response,
        type: data.type
      }, [xhr.response]);
    }
  };

  xhr.send();
};
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ndWxwLy4uL3NyYy9qcy9zcmMvV29ya2VyLmpzIl0sIm5hbWVzIjpbIm9ubWVzc2FnZSIsImRhdGEiLCJ4aHIiLCJYTUxIdHRwUmVxdWVzdCIsIm9wZW4iLCJwYXRoIiwicmVzcG9uc2VUeXBlIiwib25sb2FkIiwiZSIsInN0YXR1cyIsInBvc3RNZXNzYWdlIiwiaWQiLCJyZXNwb25zZSIsInR5cGUiLCJzZW5kIl0sIm1hcHBpbmdzIjoiOzs7O0FBQUE7QUFFQUEsU0FBUyxHQUFHLHlCQUFjO0FBQUEsTUFBWEMsSUFBVyxRQUFYQSxJQUFXO0FBQ3hCLE1BQU1DLEdBQUcsR0FBRyxJQUFJQyxjQUFKLEVBQVo7QUFFQUQsS0FBRyxDQUFDRSxJQUFKLENBQVMsS0FBVCxFQUFnQkgsSUFBSSxDQUFDSSxJQUFyQixFQUEyQixJQUEzQjtBQUNBSCxLQUFHLENBQUNJLFlBQUosR0FBbUIsYUFBbkI7O0FBRUFKLEtBQUcsQ0FBQ0ssTUFBSixHQUFhLFVBQUNDLENBQUQsRUFBTztBQUNsQixRQUFJTixHQUFHLENBQUNPLE1BQUosSUFBYyxHQUFsQixFQUF1QjtBQUNyQkMsaUJBQVcsQ0FDVDtBQUNFQyxVQUFFLEVBQUVWLElBQUksQ0FBQ1UsRUFEWDtBQUVFVixZQUFJLEVBQUVDLEdBQUcsQ0FBQ1UsUUFGWjtBQUdFQyxZQUFJLEVBQUVaLElBQUksQ0FBQ1k7QUFIYixPQURTLEVBTVQsQ0FBQ1gsR0FBRyxDQUFDVSxRQUFMLENBTlMsQ0FBWDtBQVFEO0FBQ0YsR0FYRDs7QUFhQVYsS0FBRyxDQUFDWSxJQUFKO0FBQ0QsQ0FwQkQsQyIsImZpbGUiOiJ3b3JrZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBjb25zdCBGaWxlVHlwZSA9IHJlcXVpcmUoXCJmaWxlLXR5cGUvYnJvd3NlclwiKTtcblxub25tZXNzYWdlID0gKHsgZGF0YSB9KSA9PiB7XG4gIGNvbnN0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gIHhoci5vcGVuKFwiR0VUXCIsIGRhdGEucGF0aCwgdHJ1ZSk7XG4gIHhoci5yZXNwb25zZVR5cGUgPSBcImFycmF5YnVmZmVyXCI7XG5cbiAgeGhyLm9ubG9hZCA9IChlKSA9PiB7XG4gICAgaWYgKHhoci5zdGF0dXMgPT0gMjAwKSB7XG4gICAgICBwb3N0TWVzc2FnZShcbiAgICAgICAge1xuICAgICAgICAgIGlkOiBkYXRhLmlkLFxuICAgICAgICAgIGRhdGE6IHhoci5yZXNwb25zZSxcbiAgICAgICAgICB0eXBlOiBkYXRhLnR5cGUsXG4gICAgICAgIH0sXG4gICAgICAgIFt4aHIucmVzcG9uc2VdXG4gICAgICApO1xuICAgIH1cbiAgfTtcblxuICB4aHIuc2VuZCgpO1xufTtcbiJdLCJzb3VyY2VSb290IjoiIn0=