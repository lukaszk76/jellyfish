import "./App.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { useLayoutEffect } from "react";

import mermaids from "./assets/mermaids.png";
import sea from "./assets/envmap1.webp";
import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";

import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";

import { RGBShiftShader } from "three/addons/shaders/RGBShiftShader.js";
import { DotScreenShader } from "three/addons/shaders/DotScreenShader.js";
import { BloomPass } from "three/addons/postprocessing/BloomPass.js";
import { FilmPass } from "three/addons/postprocessing/FilmPass.js";

import { BleachBypassShader } from "three/addons/shaders/BleachBypassShader.js";
import { ColorifyShader } from "three/addons/shaders/ColorifyShader.js";
import { HorizontalBlurShader } from "three/addons/shaders/HorizontalBlurShader.js";
import { VerticalBlurShader } from "three/addons/shaders/VerticalBlurShader.js";
import { SepiaShader } from "three/addons/shaders/SepiaShader.js";
import { VignetteShader } from "three/addons/shaders/VignetteShader.js";
import { GammaCorrectionShader } from "three/addons/shaders/GammaCorrectionShader.js";
import { OutlinePass } from "three/addons/postprocessing/OutlinePass.js";

const imageRatio = 1535 / 1024;

async function getTexture() {
  return new THREE.TextureLoader().load(mermaids, (texture) => texture);
}
function getScene() {
  return new THREE.Scene();
}

function getGeometry() {
  return new THREE.SphereGeometry(3, 32, 32);
}

async function getMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uTexture: { value: await getTexture() },
      resolution: { value: new THREE.Vector4() },
    },
    vertexShader,
    fragmentShader,
  });
}

async function getShape() {
  return new THREE.Mesh(getGeometry(), await getMaterial());
}

function getLight() {
  const lightColor1 = new THREE.Color(0xedb6a3);

  const light = new THREE.DirectionalLight(lightColor1, 1);
  light.position.x = 4.4;
  light.position.y = 4.4;
  light.position.z = 7.9;

  return light;
}

function addControls(camera, canvas) {
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
}

function getCamera() {
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.x = 0;
  camera.position.y = 0;
  camera.position.z = 8;

  return camera;
}

function getRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: false,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x111122);
  return renderer;
}

async function getEnvMap(renderer) {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  return new THREE.TextureLoader().load(sea, (texture) => {
    texture.encoding = THREE.sRGBEncoding;
    texture.mapping = THREE.EquirectangularReflectionMapping;
    pmremGenerator.dispose();
    return pmremGenerator.fromEquirectangular(texture).texture;
  });
}
function getResolution() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  let a1;
  let a2;
  if (height / width > imageRatio) {
    a1 = (width / height) * imageRatio;
    a2 = 1;
  } else {
    a1 = 1;
    a2 = (height / width) * imageRatio;
  }
  return { x: width, y: height, z: a1, w: a2 };
}

async function getComposer(renderer, scene, camera) {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  // const effectDotScreenShader = new ShaderPass(DotScreenShader);
  // effectDotScreenShader.uniforms["scale"].value = 4;
  // composer.addPass(effectDotScreenShader);

  // const effectBloomPass = new BloomPass(10.25);
  // composer.addPass(effectBloomPass);

  // const effectFilmPass = new FilmPass(0.35, 0.95, 2048, false);
  // composer.addPass(effectFilmPass);

  // const effectBleachBypassShader = new ShaderPass(BleachBypassShader);
  // effectBleachBypassShader.uniforms["opacity"].value = 0.95;
  // composer.addPass(effectBleachBypassShader);

  // const effectColorifyShader = new ShaderPass(ColorifyShader);
  // effectColorifyShader.uniforms["color"].value = new THREE.Color(0xedb6a3);
  // composer.addPass(effectColorifyShader);

  // const effectHorizontalBlurShader = new ShaderPass(HorizontalBlurShader);
  // effectHorizontalBlurShader.uniforms["h"].value = 1 / 512;
  // composer.addPass(effectHorizontalBlurShader);

  // const effectVerticalBlurShader = new ShaderPass(VerticalBlurShader);
  // effectVerticalBlurShader.uniforms["v"].value = 1 / 512;
  // composer.addPass(effectVerticalBlurShader);

  // const effectSepiaShader = new ShaderPass(SepiaShader);
  // composer.addPass(effectSepiaShader);

  // const effectVignetteShader = new ShaderPass(VignetteShader);
  // effectVignetteShader.uniforms["offset"].value = 1.1;
  // effectVignetteShader.uniforms["darkness"].value = 1.5;
  // composer.addPass(effectVignetteShader);

  // const effectGammaCorrectionShader = new ShaderPass(GammaCorrectionShader);
  // composer.addPass(effectGammaCorrectionShader);

  // const effectRGBShiftShader = new ShaderPass(RGBShiftShader);
  // effectRGBShiftShader.uniforms["amount"].value = 0.005;
  // composer.addPass(effectRGBShiftShader);

  return composer;
}

function addGui(controlledObject) {
  const gui = new GUI({ width: 280 });

  const params = {
    edgeStrength: 2.1,
    edgeGlow: 0.8,
    edgeThickness: 3.5,
    pulsePeriod: 0,
    rotate: false,
    usePatternTexture: false,
  };

  gui.add(params, "edgeStrength", 0.01, 10).onChange(function (value) {
    controlledObject.edgeStrength = Number(value);
  });

  gui.add(params, "edgeGlow", 0.0, 1).onChange(function (value) {
    controlledObject.edgeGlow = Number(value);
  });

  gui.add(params, "edgeThickness", 1, 4).onChange(function (value) {
    controlledObject.edgeThickness = Number(value);
  });

  gui.add(params, "pulsePeriod", 0.0, 5).onChange(function (value) {
    controlledObject.pulsePeriod = Number(value);
  });

  gui.add(params, "rotate");

  gui.add(params, "usePatternTexture").onChange(function (value) {
    controlledObject.usePatternTexture = value;
  });
  function Configuration() {
    this.visibleEdgeColor = "#ffffff";
    this.hiddenEdgeColor = "#190a05";
  }

  const conf = new Configuration();

  gui.addColor(conf, "visibleEdgeColor").onChange(function (value) {
    controlledObject.visibleEdgeColor.set(value);
  });

  gui.addColor(conf, "hiddenEdgeColor").onChange(function (value) {
    controlledObject.hiddenEdgeColor.set(value);
  });

  return gui;
}

async function getOutlinePass(scene, camera) {
  const outlinePass = new OutlinePass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    scene,
    camera
  );
  outlinePass.patternTexture = await getTexture();
  outlinePass.edgeStrength = 2.1;
  outlinePass.edgeGlow = 0.8;
  outlinePass.edgeThickness = 3.5;

  return outlinePass;
}
async function initThreeJS() {
  const canvas = document.querySelector(".webgl");
  const renderer = getRenderer(canvas);
  const envMap = await getEnvMap(renderer);
  const scene = getScene();
  const shape = await getShape();
  const light = getLight();
  const camera = getCamera();
  const group = new THREE.Group();
  const clock = new THREE.Clock();
  const composer = await getComposer(renderer, scene, camera);
  const mouse = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();
  const outlinePass = await getOutlinePass(scene, camera);

  let selectedObjects = [];

  scene.environment = envMap;
  shape.material.envMap = envMap;
  scene.background = envMap;
  shape.material.needsUpdate = true;

  composer.addPass(outlinePass);
  group.add(shape);
  scene.add(group);
  scene.add(light);
  scene.add(camera);

  addControls(camera, canvas);
  addGui(outlinePass);

  function onPointerMove(event) {
    if (event.isPrimary === false) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    checkIntersection();
  }

  window.addEventListener("pointermove", onPointerMove);

  function addSelectedObject(object) {
    selectedObjects = [];
    selectedObjects.push(object);
  }

  function checkIntersection() {
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(scene, true);

    if (intersects.length > 0) {
      const selectedObject = intersects[0].object;
      addSelectedObject(selectedObject);
      outlinePass.selectedObjects = selectedObjects;
    } else {
      outlinePass.selectedObjects = [];
    }
  }
  function onResize() {
    const resolution = getResolution();

    camera.aspect = resolution.x / resolution.y;
    camera.updateProjectionMatrix();

    shape.material.uniforms.resolution.value = resolution;
    shape.material.uniforms.needsUpdate = true;

    renderer.setSize(resolution.x, resolution.y);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    composer.setSize(resolution.x, resolution.y);
  }

  window.addEventListener("resize", () => {
    onResize();
  });

  onResize();

  const tick = () => {
    if (!renderer) return;

    const elapsedTime = clock.getElapsedTime();

    shape.material.uniforms.uTime.value = elapsedTime;
    shape.material.uniforms.needsUpdate = true;
    scene.rotation.y = 0.1 * elapsedTime;
    shape.rotation.y = -0.1 * elapsedTime;
    composer.render();

    window.requestAnimationFrame(tick);
  };

  tick();
}
function App() {
  useLayoutEffect(() => {
    initThreeJS();
  }, []);

  return <canvas className="webgl"></canvas>;
}

export default App;
