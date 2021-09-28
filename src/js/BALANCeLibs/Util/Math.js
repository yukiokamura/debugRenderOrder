/**
 * Generate a random float
 *
 * @param  {number} minValue  Minimum boundary
 * @param  {number} maxValue  Maximum boundary
 * @param  {number} precision Precision
 * @return {number}           Generated float
 */
export function random( minValue, maxValue, precision = 2 ) {

  return parseFloat( Math.min( minValue + ( Math.random() * ( maxValue - minValue ) ), maxValue ).toFixed( precision ) );

}

// ランダムな整数を取得
// -----------------------------------
// @min : 最小値(int)
// @max : 最大値(int)
// return : minからmaxまでのランダムな整数(int)
// -----------------------------------
export function randomInt(min, max) {

  return Math.floor((Math.random() * ((max + 1) - min) + min));

}
    
// ランダムな整数を2つの範囲から取得
// -----------------------------------
// @min1 : 最小値1(int)
// @max1 : 最大値1(int)
// @min2 : 最小値2(int)
// @max2 : 最大値2(int)
// return : minからmaxまでのランダムな整数(int)
// -----------------------------------
export function random2(min1, max1, min2, max2) {
  
  if (this.hit(2)) {
    return this.randomInt(min1, max1);
  } else {
    return this.randomInt(min2, max2);
  }

}
    
// 1/@rangeの確率でtrueを取得
// -----------------------------------
// @range : 母数(int)
// return : true or false(boolean)
// -----------------------------------
export function hit(range) {

  return this.randomInt(0, range - 1) === 0;

}

// 0から範囲内でランダムな整数を取得
// -----------------------------------
// @val : 範囲(int)
// return : ランダムな整数(int)
// -----------------------------------
export function range(val) {

  return this.randomInt(-val, val);

}

// 値をマッピング
// -----------------------------------
// @num : マッピングする値(Number)
// @resMin : 結果となる値の最小値(Number)
// @resMax : 結果となる値の最大値(Number)
// @baseMin : 元となる値の最小値(Number)
// @baseMax : 元となる値の最大値(Number)
// return : マッピングされた値(Number)
// -----------------------------------
export function map(num, resMin, resMax, baseMin, baseMax) {

  var p;
  if (num < baseMin) {
    return resMin;
  }
  if (num > baseMax) {
    return resMax;
  }
  p = (resMax - resMin) / (baseMax - baseMin);

  return ((num - baseMin) * p) + resMin;

}

export function demical(v, n = 2) {

  // 計算 ( Math.pow( 10, 4 ) = 10000 )
  var val = Math.floor( v * Math.pow( 10, n ) ) / Math.pow( 10, n );

  return val;

}

export function float( v, n=2) {

  return v.toFixed(n);    

}

// 数値に小数点第@n位までをつけた文字列を返す
// -----------------------------------
// @num : 値(Number)
// @n : 小数点の位(int)
// return : 変換された値(String)
// -----------------------------------
// decimal(num, n) {
//   var i, pos;
//   num = String(num);
//   pos = num.indexOf(".");
//   if (n === 0) {
//     return num.split(".")[0];
//   }
//   if (pos === -1) {
//     num += ".";
//     i = 0;
//     while (i < n) {
//       num += "0";
//       i++;
//     }
//     return num;
//   }
//   num = num.substr(0, pos) + num.substr(pos, n + 1);
//   return num;
// }

export function clamp(val, min, max, minVal, maxVal) {

  if (val < min) val = (minVal==undefined)? min: minVal;
  else if (val > max) val = (maxVal==undefined)? max: maxVal;
  
  return val;

}

export function rate(val, base) {

  var v = val / base;
  
  return v;

}   

export function lerp (val01, val02, val) {

  val = val < 0 ? 0 : val;
  val = val > 1 ? 1 : val;
  return val01 + (val02 - val01) * val;

} 

export function degree(radians) {

  return radians * 180 / Math.PI; //1ラジアンが何度か

}

// to radians
export function radian(angle) { 

  return angle * Math.PI / 180; //1度何ラジアンか

}

export function dist(p1, p2) {

  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));

}

export function ascend(arr) {

  arr.sort(function(a,b){
    if( a > b ) return -1;
    if( a < b ) return 1;
    return 0;
  });
  // var a = [5,3,9,1,10]
  // 結果:10,9,5,3,1

  return arr;

}

export function descend(arr) {

  arr.sort(function(a,b){
    if( a < b ) return -1;
    if( a > b ) return 1;
    return 0;
  });

  // var a = [5,3,9,1,10]
  // 結果:1,3,5,9,10

  return arr;

}

// map(value, min01, max01, min02, max02) {

//   var dis01 = max01 - min01;
//   var dis02 = max02 - min02

//   var rate = dis02 / dis01;

//   value = value * rate;

//   return value;
// }

export function constrain(value, min, max) {

  return Math.min(max, Math.max(value, min));

  // if (value <= low) value = low;
  // if (value >= high) value = high;     
  // return value;

}