<script setup>
import * as THREE from "three";
import { ref, reactive } from "vue";
// Add orbit controller
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";

// Import the gui.js library
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";

// Import the tween.js library
import * as TWEEN from "@tweenjs/tween.js";

const glb = new URL("/public/model/Lamborghini.glb", import.meta.url).href;
const bg = new URL("/src/assets/background.jpg", import.meta.url).href;

// Instantiate a gui object
const gui = new GUI();

// Create a scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(
  40,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.set(4.25, 1.4, -4.5);

// Create a renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // Receive shadows
document.body.appendChild(renderer.domElement);

// Add controller
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Set control damping
controls.maxDistance = 10; // Maximum zoom distance
controls.minDistance = 1; // Minimum zoom distance
controls.minPolarAngle = 0; // Minimum rotation angle
controls.maxPolarAngle = (85 / 360) * 2 * Math.PI; // Maximum rotation angle

// Listen for page changes
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// Car Body material
let bodyMaterial = new THREE.MeshPhysicalMaterial({
  color: "red",
  metalness: 1,
  roughness: 0.5,
  clearcoat: 1.0,
  clearcoatRoughness: 0.03,
});
// Glass material
let glassMaterial = new THREE.MeshPhysicalMaterial({
  color: "#793e3e",
  metalness: 0.25,
  roughness: 0,
  transmission: 1.0, // Translucency
});

// Set up the door collection
let doors = [];

// Load the car model
const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");
loader.setDRACOLoader(dracoLoader);
loader.load(glb, (gltf) => {
  const carModel = gltf.scene;
  carModel.rotation.y = Math.PI;
  carModel.traverse((obj) => {
    if (
      obj.name === "Object_103" ||
      obj.name === "Object_64" ||
      obj.name === "Object_77"
    ) {
      // Body
      obj.material = bodyMaterial;
    } else if (obj.name === "Object_90") {
      // Glass
      obj.material = glassMaterial;
    } else if (obj.name === "Empty001_16" || obj.name === "Empty002_20") {
      // door
      doors.push(obj);
    } else {
      return true;
    }
    // Car model shadow
    obj.castShadow = true;
  });
  scene.add(gltf.scene);
});

// Set ambient light
const ambientLight = new THREE.AmbientLight("#fff", 0.5);
scene.add(ambientLight);

// Set floor style
const floorGeometry = new THREE.PlaneGeometry(20, 20);
const floormaterial = new THREE.MeshPhysicalMaterial({
  side: THREE.DoubleSide,
  color: 0x808080,
  metalness: 0, // Set metallicity
  roughness: 0.1, // Set roughness
  wireframe: false, // Turn off grid lines
});
const mesh = new THREE.Mesh(floorGeometry, floormaterial);
mesh.rotation.x = Math.PI / 2;
// mesh.receiveShadow = true // receive Shadow
scene.add(mesh);

// Set cylindrical exhibition hall
const cylinder = new THREE.CylinderGeometry(12, 12, 20, 32);
const cylindermaterial = new THREE.MeshPhysicalMaterial({
  color: 0x6c6c6c,
  side: THREE.DoubleSide,
});
const cylinderMesh = new THREE.Mesh(cylinder, cylindermaterial);
scene.add(cylinderMesh);

//  Set spotlight (to give the car a more three-dimensional metal feel)
const spotLight = new THREE.SpotLight("#fff", 2);
spotLight.angle = Math.PI / 8; // Scattering angle, the angle with the horizontal line
spotLight.penumbra = 0.2; // Lateral, penumbra decay percentage of the spotlight cone
spotLight.decay = 2; // Longitudinal, decay along the distance of light
spotLight.distance = 30;
spotLight.shadow.radius = 10;
spotLight.shadow.mapSize.set(4096, 4096);
spotLight.position.set(-5, 10, 1);
spotLight.target.position.set(0, 0, 0); // Direction of light illumination
spotLight.castShadow = true;
scene.add(spotLight);

// set Gui controller
// Change the default panel name
gui.domElement.parentNode.querySelector(".title").textContent =
  "3D Car Configurator";

const bodyChange = gui.addFolder("body material");
bodyChange.close(); // Default closed state
bodyChange
  .addColor(bodyMaterial, "color")
  .name("body color")
  .onChange((value) => {
    bodyMaterial.color.set(value);
  });
bodyChange
  .add(bodyMaterial, "metalness", 0, 1)
  .name("metalness")
  .onChange((value) => {
    bodyMaterial.metalness = value;
  });
bodyChange
  .add(bodyMaterial, "roughness", 0, 1)
  .name("roughness")
  .onChange((value) => {
    bodyMaterial.roughness = value;
  });
bodyChange
  .add(bodyMaterial, "clearcoat", 0, 1)
  .name("clearcoat")
  .onChange((value) => {
    bodyMaterial.clearcoat = value;
  });
bodyChange
  .add(bodyMaterial, "clearcoatRoughness", 0, 1)
  .name("clearcoat roughness")
  .onChange((value) => {
    bodyMaterial.clearcoatRoughness = value;
  });
const glassChange = gui.addFolder("glass");
glassChange.close(); // Default closed state
glassChange
  .addColor(glassMaterial, "color")
  .name("glass color")
  .onChange((value) => {
    glassMaterial.color.set(value);
  });
glassChange
  .add(glassMaterial, "metalness", 0, 1)
  .name("metalness")
  .onChange((value) => {
    glassMaterial.metalness = value;
  });
glassChange
  .add(glassMaterial, "roughness", 0, 1)
  .name("roughness")
  .onChange((value) => {
    glassMaterial.roughness = value;
  });
glassChange
  .add(glassMaterial, "transmission", 0, 1)
  .name("transmission")
  .onChange((value) => {
    glassMaterial.transmission = value;
  });

// Set car status
let carStatus;
// Open left car door
const carLeftOpen = () => {
  carStatus = "open";
  setAnimationDoor({ x: 0 }, { x: Math.PI / 3 }, doors[1]);
};
// Open right car door
const carRightOpen = () => {
  carStatus = "open";
  setAnimationDoor({ x: 0 }, { x: Math.PI / 3 }, doors[0]);
};
// Close left car door
const carLeftClose = () => {
  carStatus = "close";
  setAnimationDoor({ x: Math.PI / 3 }, { x: 0 }, doors[1]);
};
// Close right car door
const carRightClose = () => {
  carStatus = "close";
  setAnimationDoor({ x: Math.PI / 3 }, { x: 0 }, doors[0]);
};

// Inside car view
const carIn = () => {
  setAnimationCamera(
    { cx: 4.25, cy: 1.4, cz: -4.5, ox: 0, oy: 0.5, oz: 0 },
    { cx: -0.27, cy: 0.83, cz: 0.6, ox: 0, oy: 0.5, oz: -3 },
  );
};
// Outside car view
const carOut = () => {
  setAnimationCamera(
    { cx: -0.27, cy: 0.83, cz: 0.6, ox: 0, oy: 0.5, oz: -3 },
    { cx: 4.25, cy: 1.4, cz: -4.5, ox: 0, oy: 0.5, oz: 0 },
  );
};

var obj = {
  carRightOpen,
  carLeftOpen,
  carRightClose,
  carLeftClose,
  carIn,
  carOut,
};
// Set dynamic operation of the car body
const doChange = gui.addFolder("dynamic operation");
doChange.close(); // Default closed state
doChange.add(obj, "carLeftOpen").name("open left door");
doChange.add(obj, "carRightOpen").name("open right door");
doChange.add(obj, "carLeftClose").name("close left door");
doChange.add(obj, "carRightClose").name("close right door");
doChange.add(obj, "carIn").name("carIn");
doChange.add(obj, "carOut").name("carOut");

// Set tween animation
const setAnimationDoor = (start, end, mesh) => {
  const tween = new TWEEN.Tween(start)
    .to(end, 1000)
    .easing(TWEEN.Easing.Quadratic.Out);
  tween.onUpdate((that) => {
    mesh.rotation.x = that.x;
  });
  tween.start();
};
const setAnimationCamera = (start, end) => {
  const tween = new TWEEN.Tween(start)
    .to(end, 3000)
    .easing(TWEEN.Easing.Quadratic.Out);
  tween.onUpdate((that) => {
    //  Use camera.position and controls.target together
    camera.position.set(that.cx, that.cy, that.cz);
    controls.target.set(that.ox, that.oy, that.oz);
  });
  tween.start();
};

// Use camera.position and controls.target together
window.addEventListener("click", onPointClick);
function onPointClick(event) {
  let pointer = {};
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  var vector = new THREE.Vector2(pointer.x, pointer.y);
  var raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(vector, camera);
  let intersects = raycaster.intersectObjects(scene.children);
  intersects.forEach((item) => {
    if (item.object.name === "Object_64" || item.object.name === "Object_77") {
      if (!carStatus || carStatus === "close") {
        carLeftOpen();
        carRightOpen();
      } else {
        carLeftClose();
        carRightClose();
      }
    }
  });
}

// Create spotlight function
const createSpotlight = (color) => {
  const newObj = new THREE.SpotLight(color, 2);
  newObj.castShadow = true;
  newObj.angle = Math.PI / 6;
  newObj.penumbra = 0.2;
  newObj.decay = 2;
  newObj.distance = 50;
  return newObj;
};

// Set picture background
const spotLight1 = createSpotlight("#ffffff");
const texture = new THREE.TextureLoader().load(bg);
spotLight1.position.set(0, 3, 0);
spotLight1.target.position.set(-10, 3, 10);
spotLight1.map = texture;
const lightHelper = new THREE.SpotLightHelper(spotLight1);
scene.add(spotLight1);

// Set the rendering function
const render = (time) => {
  controls.update();
  TWEEN.update(time);
  renderer.render(scene, camera);
  requestAnimationFrame(render);
};
render();
</script>
