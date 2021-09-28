// rgbからHEX(16進数)カラー取得
// -----------------------------------
// @r : 0~255
// @g : 0~255
// @b : 0~255
// return : ex "#FFFFFF"
// -----------------------------------
export function getHexColor(r, g, b) {
  var str;
  str = ((r << 16) | (g << 8) | b).toString(16);
  return "#" + new Array(7 - str.length).join("0") + str;
}

// rgbからhslへ
export function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  var max = Math.max(r, g, b);
  var min = Math.min(r, g, b);
  var h, s, l;

  l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    var d = max - min;
    switch (max) {
      case r:
        h = (((g - b) / d) * 60 + 360) % 360;
        break;
      case g:
        h = ((b - r) / d) * 60 + 120;
        break;
      case b:
        h = ((r - g) / d) * 60 + 240;
        break;
    }
    s = l <= 0.5 ? d / (max + min) : d / (2 - max - min);
  }

  return [h, s * 100, l * 100];
}

// hslからrgbへ
export function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;

  var r, g, b;

  if (s === 0) {
    r = g = b = l * 255;
  } else {
    var v2 = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var v1 = 2 * l - v2;
    r = Math.round(hueToRgb(v1, v2, h + 120) * 255);
    g = Math.round(hueToRgb(v1, v2, h) * 255);
    b = Math.round(hueToRgb(v1, v2, h - 120) * 255);
  }

  return [r, g, b];
}
