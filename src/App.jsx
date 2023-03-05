import "./App.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { useLayoutEffect } from "react";

import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";
import modelFile from "./assets/jellyfish.glb";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { BleachBypassShader } from "three/addons/shaders/BleachBypassShader.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { FilmPass } from "three/addons/postprocessing/FilmPass.js";

const imageRatio = 1535 / 1024;

function getScene() {
  return new THREE.Scene();
}

async function getGeometry() {
  const ModelLoader = new GLTFLoader();
  const modelData = await ModelLoader.loadAsync(modelFile);
  const model = modelData.scene.children[0];
  return model.children[0].children[0].children[0].children[0].geometry;
}

async function getMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      resolution: { value: new THREE.Vector4() },
      uColor1: { value: new THREE.Color(0x612574) },
      uColor2: { value: new THREE.Color(0x293583) },
      uColor3: { value: new THREE.Color(0x1954ec) },
    },
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    vertexShader,
    fragmentShader,
  });
}

async function getShape() {
  return new THREE.Points(await getGeometry(), await getMaterial());
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
  camera.position.z = 6;

  return camera;
}

function getRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x111122);
  return renderer;
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

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    2.9,
    0.2,
    0.6
  );
  composer.addPass(bloomPass);

  // const effectFilmPass = new FilmPass(0.35, 0.95, 2048, false);
  // composer.addPass(effectFilmPass);

  const effectBleachBypassShader = new ShaderPass(BleachBypassShader);
  effectBleachBypassShader.uniforms["opacity"].value = 0.8;
  composer.addPass(effectBleachBypassShader);

  return composer;
}

async function initThreeJS() {
  const canvas = document.querySelector(".webgl");
  const renderer = getRenderer(canvas);
  const scene = getScene();
  const shape = await getShape();
  const camera = getCamera();
  const group = new THREE.Group();
  const clock = new THREE.Clock();
  const composer = await getComposer(renderer, scene, camera);

  const numberOfObjects = shape.geometry.attributes.position.array.length / 3;
  const randoms = new Float32Array(numberOfObjects);
  const colors = new Float32Array(numberOfObjects);

  for (let i = 0; i < numberOfObjects; i++) {
    randoms[i] = Math.random();
    colors[i] = Math.random();
  }

  shape.geometry.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 1));
  shape.geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 1));

  shape.rotation.x = Math.PI * 0.5;
  shape.position.y = 1.5;

  group.add(shape);
  scene.add(group);
  scene.add(camera);

  addControls(camera, canvas);

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
    shape.rotation.z = 0.1 * elapsedTime;
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
