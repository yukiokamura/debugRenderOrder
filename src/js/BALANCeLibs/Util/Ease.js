// # ---------------------------------------------------
// # イージング計算用オブジェクト
// # t(0~1)を渡すと歪めた結果(0~1)を返す
// # ---------------------------------------------------

// # -----------------------------------------------
// # メソッド一覧
// # @linear
// #
// # @inBack
// # @inBounce
// # @inCirc
// # @inCubic
// # @inElastic
// # @inExpo
// # @inQuad
// # @inQuart
// # @inQuint
// # @inSine
// #
// # @outBack
// # @outBounce
// # @outCirc
// # @outCubic
// # @outElastic
// # @outExpo
// # @outQuad
// # @outQuart
// # @outQuint
// # @outSine
// #
// # @inOutBack
// # @inOutBounce
// # @inOutCirc
// # @inOutCubic
// # @inOutExpo
// # @inOutQuad
// # @inOutQuart
// # @inOutQuint
// # @inOutSine
// # -----------------------------------------------

export function linear(t) {
  
    return t;
  
  }
  
export function inBack(t) {
    
    s = 1.70158;
    return t * t * ((s + 1) * t - s);
  
  }
  
export function inBounce(t) {
    
    t = 1.0 - t;
    
    if (t < 1 / 2.75) return 1.0 - (7.5625 * t * t);
    
    if (t < 2 / 2.75) {
      t -= 1.5 / 2.75;
      return 1.0 - (7.5625 * t * t + 0.75);
    }

    
    if (t < 2.5 / 2.75) {
      t -= 2.25 / 2.75;
      return 1.0 - (7.5625 * t * t + 0.9375);
    }
    
    t -= 2.625 / 2.75;    
    return 1.0 - (7.5625 * t * t + 0.984375);

  }
  
export function inCirc(t) {
    
    if(t >= 1) return 1;
    else return -(Math.sqrt(1 - t * t) - 1);

  }
  
export function inCubic(t) {
    
    return t * t * t;
  
  }
  
export function inElastic(t) {
    
    var p = 0.3;
    var a = 1.0;
    var s = 1.70158;
    
    if (t == 0) return 0;
    
    if (t == 1.0) return 1.0;
      
    if (a < 1.0) {
      a = 1.0;
      s = p / 4;
    } else {
      s = p / (2 * 3.1419) * Math.asin(1.0 / a);
    }
    
    --t;
    return -(a * Math.pow(2, 10 * t) * Math.sin((t - s) * (2 * 3.1419) / p));
  
  }
  
export function inExpo(t) {
    
    if (t == 0) return 0;
    else return Math.pow(2, 10 * (t - 1));
  
  }
  
export function inQuad(t) {
    
    return t * t;
  
  }
  
export function inQuart(t) {
    
    return t * t * t * t;
  
  }
  
export function inQuint(t) {
    
    return t * t * t * t * t;
  
  }
  
export function inSine(t) {
    
    return -Math.cos(t * (Math.PI / 2)) + 1.0;
  
  }
  
export function outBack(t, s) {
    
    s = s || 1.70158;
    --t;
    return t * t * ((s + 1.0) * t + s) + 1.0;
  
  }
  
export function outBounce(t) {
    
    if (t < 1 / 2.75) return 7.5625 * t * t;
    
    if (t < 2 / 2.75) {
      t -= 1.5 / 2.75;
      return 7.5625 * t * t + 0.75;
    }
    
    if (t < 2.5 / 2.75) {
      t -= 2.25 / 2.75;
      return 7.5625 * t * t + 0.9375;
    }
      
    t -= 2.625 / 2.75;
    return 7.5625 * t * t + 0.984375;
  
  }
  
export function outCirc(t) {
    
    --t;
    return Math.sqrt(1 - t * t);
  
  }
  
export function outCubic(t) {
    
    --t;
    return t * t * t + 1;
  
  }
  
export function outElastic(t, s) {
    
    var p = s || 0.3;
    var a = 1.0;
    
    if (t == 0) return 0;
    
    if (t == 1.0) return 1.0;
    
    if (a < 1.0) {
      a = 1.0;
      s = p / 4;
    } else {
      s = p / (2 * 3.1419) * Math.asin(1.0 / a);
    }
    
    return a * Math.pow(2, -10 * t) * Math.sin((t - s) * (2 * 3.1419) / p) + 1.0;
  
  }
  
export function outExpo(t) {
    
    if (t == 1.0) return 1;
    else return -Math.pow(2, -10 * t) + 1;
  
  }
  
  
export function outQuad(t) {
    
    return -t * (t - 2);
  
  }
  
export function outQuart(t) {
    
    --t;
    return 1.0 - t * t * t * t;
  
  }
  
export function outQuint(t) {
    
    --t;
    return t * t * t * t * t + 1;
  
  }
  
export function outSine(t) {
    
    return Math.sin(t * (Math.PI / 2));
  
  }
  
export function inOutBack(t, s) {
    
    var s = s || 1.70158;
    var k = 1.525;
    
    t *= 2;
    s *= k;
    
    if (t < 1) return 0.5 * (t * t * ((s + 1) * t - s));
    
    t -= 2;
    return 0.5 * (t * t * ((s + 1) * t + s) + 2);
  
  }
  
export function inOutBounce(t) {
    
    if (t < 0.5) return this.inBounce(t * 2) * 0.5;
    else return this.outBounce(t * 2 - 1.0) * 0.5 + 0.5;
  
  }
  
export function inOutCirc(t) {
    
    t *= 2;

    if (t < 1) return -0.5 * (Math.sqrt(1 - t * t) - 1);

    t -= 2;
    return 0.5 * (Math.sqrt(1 - t * t) + 1);
  
  }
  
export function inOutCubic(t) {
    
    t *= 2;

    if (t < 1) return 0.5 * t * t * t;

    t -= 2;
    return 0.5 * (t * t * t + 2);
  
  }
  
export function inOutExpo(t) {
    
    if (t == 0) return 0;
    
    if (t == 1.0) return 1.0;

    t *= 2;
    if (t < 1) return 0.5 * Math.pow(2, 10 * (t - 1));

    --t;
    return 0.5 * (-Math.pow(2, -10 * t) + 2);
  
  }
  
export function inOutQuad(t) {
    
    t *= 2;

    if (t < 1) return 0.5 * t * t * t * t;

    t -= 2;
    return -0.5 * (t * t * t * t - 2);
  
  }
  
export function inOutQuart(t) {
    
    t *= 2;

    if (t < 1) return 0.5 * t * t * t * t;

    t -= 2;
    return -0.5 * (t * t * t * t - 2);
  
  }
  
export function inOutQuint(t) {
    
    t *= 2;

    if (t < 1) return 0.5 * t * t * t * t * t;

    t -= 2;
    return 0.5 * (t * t * t * t * t + 2);
  
  }
  
export function inOutSine(t) {
    
    return -0.5 * (Math.cos(Math.PI * t) - 1);

  }
