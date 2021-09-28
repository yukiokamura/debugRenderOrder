//--------------------------------------------------
//
//  SPSensor
//
//--------------------------------------------------

export default class SPSensor {

  constructor() {

    this.orientation = {};
    // X軸 -90〜90 0:水平 -90または90:垂直
    this.beta = 0;
    // Y軸 -90〜90 0:水平 -90または90:垂直
    this.gamma = 0;
    // Z軸  0〜360 0:北 90:西 180:南 270:東
    this.alpha = 0;

    this.accelerateGx = 0;
    this.accelerateGy = 0;
    this.accelerateGz = 0;

    this.rotationRateBeta = 0;
    this.rotationRateGamma = 0;
    this.rotationRateAlpha = 0;

    this.accelerationX = 0;
    this.accelerationY = 0;
    this.accelerationZ = 0;

    this.setEvents();

  }

  onDeviceOrientation(e) {

    this.beta = e.beta;
    this.gamma = e.gamma;
    this.alpha = e.alpha;

  }

  onDeviceMotion(e) {

    this.accelerateGx = e.accelerationIncludingGravity.x
    this.accelerateGy = e.accelerationIncludingGravity.y
    this.accelerateGz = e.accelerationIncludingGravity.z

    this.rotationRateBeta = e.rotationRate.beta
    this.rotationRateGamma = e.rotationRate.gamma
    this.rotationRateAlpha = e.rotationRate.alpha

    this.accelerationX = e.acceleration.x;
    this.accelerationY = e.acceleration.y;
    this.accelerationZ = e.acceleration.z;

    // log(this.accelerateGx,this.accelerateGy,this.accelerateGz);
    // log(this.rotationRateBeta,this.rotationRateGamma,this.rotationRateAlpha);
    // log(this.accelerationX);

  }

  // 方角(deviceorientationを使って)
  getCompassHeading(alpha, beta, gamma) {
    // var degtorad = Math.PI / 180;
   
    // var _x = beta ? beta * degtorad : 0;
    // var _y = gamma ? gamma * degtorad : 0;
    // var _z = alpha ? alpha * degtorad : 0;
   
    // var cY = Math.cos(_y);
    // var cZ = Math.cos(_z);
    // var sX = Math.sin(_x);
    // var sY = Math.sin(_y);
    // var sZ = Math.sin(_z);
   
    // var Vx = -cZ * sY - sZ * sX * cY;
    // var Vy = -sZ * sY + cZ * sX * cY;
   
    // var compassHeading = Math.atan(Vx / Vy);
   
    // if (Vy < 0) {
    //   compassHeading += Math.PI;
    // }
    // else if (Vx < 0) {
    //   compassHeading += 2 * Math.PI;
    // }
   
    // return compassHeading * ( 180 / Math.PI );
  }

  vibrate(){

    navigator.vibrate(300);

  }
        
  geoLoaction(){

    // geolocationのインスタンスと処理をこの中で

  }

  // 照度が変化
  onDeviceLight(e) {

    // var lux = event.value;

  }

  // 照度が変化
  onDeviceProximity(e) {

    // // センサーの検知範囲に物体がある
    // if (!e.value) {

    // // センサーの検知範囲に物体はない
    // } else {

    // }

  }

       
  setEvents() {

    window.addEventListener('deviceorientation', (e)=>{this.onDeviceOrientation(e)});
    // window.addEventListener('devicemotion', function(e){self.onDeviceMotion.call(self,e)});
    // // 照明センサー(firefoxのみ)
    // window.addEventListener("devicelight", this.onDeviceLight.bind(this));
    // // 近接センサー(firefoxのみ)
    // window.addEventListener("deviceproximity", this.onDeviceProximity.bind(this));

  }

}
