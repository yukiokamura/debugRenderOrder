//--------------------------------------------------
//
//  Controller
//
//--------------------------------------------------

import Base from "@BALANCeLibs/Base.js";
import * as m from "@BALANCeLibs/Util/Math.js";

import gsap from "gsap";
import { CustomEase } from "@BALANCeLibs/View/gsap/CustomEase/CustomEase.js";

import { Conf } from "@/Conf";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const createPlane = () => {
  const geometry = new THREE.PlaneGeometry(100, 2000);
  const material = new THREE.MeshBasicMaterial({
    color: 0xff00ff,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.5,
  });
  const plane = new THREE.Mesh(geometry, material);

  plane.position.y = -100;
  plane.rotation.x = Math.PI * 0.5;

  return plane;
};

export default class Controller extends Base {
  constructor() {
    super();

    this.setup();
    this.setEvents();

    // this.timeline();
  }

  setup() {
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.querySelector(".canvas").appendChild(renderer.domElement);
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      100000
    );
    camera.position.set(0, 0, 1000);
    const controls = new OrbitControls(camera, renderer.domElement);
    const scene = new THREE.Scene();

    const axisHelper = new THREE.AxisHelper(1000); // 引数は 軸のサイズ
    scene.add(axisHelper);

    const geometry = new THREE.SphereGeometry(100, 64, 64);
    const material = new THREE.MeshBasicMaterial({
      color: 0x0000ff,
      transparent: true,
      opacity: 0.5,
      // wireframe: true,
    });

    const cube = new THREE.Mesh(geometry, material);
    cube.position.z = 0;
    const material2 = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.5,
      // wireframe: true,
    });
    const geometry2 = new THREE.SphereGeometry(100, 64, 64);
    const cube2 = new THREE.Mesh(geometry2, material2);
    cube2.position.z = 250;

    const material3 = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.5,
      // wireframe: true,
    });
    const geometry3 = new THREE.SphereGeometry(100, 64, 64);
    const cube3 = new THREE.Mesh(geometry3, material3);
    cube3.position.z = -250;

    const material4 = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.5,
      // wireframe: true,
    });
    const geometry4 = new THREE.SphereGeometry(100, 64, 64);
    geometry4.translate(0, 0, 1000);
    const cube4 = new THREE.Mesh(geometry4, material4);
    cube4.position.z = -500;
    // cube4.position.z = -250;

    scene.add(createPlane());
    scene.add(cube2);
    scene.add(cube);
    scene.add(cube3);
    scene.add(cube4);

    //cube2 => cube

    const tick = () => {
      // controls.update();
      renderer.render(scene, camera);

      requestAnimationFrame(tick);
    };

    tick();
  }

  timeline() {
    Conf.isFirst = false;
  }

  update() {}

  onResize() {}

  setEvents() {
    super.setEvents();
  }
}
