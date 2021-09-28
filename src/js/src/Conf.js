class _Conf {
  constructor() {
    this.RELEASE = true;
    this.LOG = true;
    this.PARAM = true;
    this.Profiler = true;
    this.LOADING = true;
    this.OPENING = false;
    this.EFFECT = false;
    this.INERTIA = false;
    this.isUpdateMgr = true;
    this.isResizeMgr = true;
    this.isScrollMgr = true;
    this.isMouseMgr = true;

    this.vDefW = window.innerWidth;
    this.vDefH = window.innerHeight;
    this.vW = window.innerWidth;
    this.vH = window.innerHeight;
    this.vSPW = window.innerWidth;
    this.vSPH = window.innerHeight;

    this.DefW = 1300;
    this.DefH = 850;
    this.W = 1200;
    this.H = 750;
    this.SPW = 375;
    this.SPH = 667;

    this.bp00 = 375;
    this.bp01 = 768;
    this.bp02 = 1080;
    this.bp03 = 1280;

    this.isRetina =
      window.devicePixelRatio && window.devicePixelRatio > 1 ? true : false;

    this.APIURL = "./setting.xml";

    this.isFirst = true;
    this.isSound = true;

    this.setEvents();
  }

  setEvents() {
    window.addEventListener("resize", (e) => {
      this.vW = window.innerWidth;
      this.vH = window.innerHeight;
      this.vSPW = window.innerWidth;
      this.vSPH = window.innerHeight;
      this.vDefW = window.innerWidth;
      this.vDefH = window.innerHeight;
    });
  }
}

export const Conf = new _Conf();
