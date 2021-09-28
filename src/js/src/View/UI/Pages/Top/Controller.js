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
import { mergeBufferGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { Vector2 } from "three";

const createPlane = () => {
  const planegeometry = new THREE.PlaneGeometry(100, 2000);
  const spheregeometry = new THREE.SphereGeometry(150, 64, 64);
  spheregeometry.translate(0, -600, -20);
  planegeometry.translate(0, 0, 100);
  const geometry = mergeBufferGeometries([planegeometry, spheregeometry]);
  console.log(geometry);
  const material = new THREE.MeshBasicMaterial({
    color: 0x000000,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.5,
  });
  const plane = new THREE.Mesh(geometry, material);

  // plane.position.y = -100;
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
    const obj3D = new THREE.Object3D();
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
    cube.name = "cube";
    const material2 = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.5,

      // wireframe: true,
    });
    const geometry2 = new THREE.SphereGeometry(100, 64, 64);
    const cube2 = new THREE.Mesh(geometry2, material2);
    cube2.name = "cube2";
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
    cube3.name = "cube3";
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
    cube4.name = "cube4";
    // cube4.position.z = -250;

    obj3D.add(createPlane());
    obj3D.add(cube2);
    obj3D.add(cube);
    obj3D.add(cube3);
    // obj3D.add(cube4);

    scene.add(obj3D);

    // const ray = new THREE.Raycaster();

    // ray.far = Infinity;
    // ray.near = 0.01;
    // ray.camera = camera;
    //cube2 => cube

    const tick = () => {
      // controls.update();
      // const direction = camera.position.clone().multiplyScalar(-1).normalize();
      // ray.set(camera.position, direction);

      // ray.setFromCamera(new Vector2(0, 0), camera);
      // const target = ray.intersectObjects(obj3D.children, true);
      // target.forEach((item, i) => {
      //   item.object.renderOrder = target.length - i;
      // });
      // // console.log(camera.position);
      // console.log(target);

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
