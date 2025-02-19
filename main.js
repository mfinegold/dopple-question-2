/*import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader.js";
*/

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.146.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.146.0/examples/jsm/loaders/GLTFLoader.js';
import { GLTFExporter } from 'https://cdn.jsdelivr.net/npm/three@0.146.0/examples/jsm/exporters/GLTFExporter.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.146.0/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'https://cdn.jsdelivr.net/npm/three@0.146.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.jsdelivr.net/npm/three@0.146.0/examples/jsm/postprocessing/RenderPass.js';
import { OutlinePass } from 'https://cdn.jsdelivr.net/npm/three@0.146.0/examples/jsm/postprocessing/OutlinePass.js';
import { ShaderPass } from 'https://cdn.jsdelivr.net/npm/three@0.146.0/examples/jsm/postprocessing/ShaderPass.js';
import { GammaCorrectionShader } from 'https://cdn.jsdelivr.net/npm/three@0.146.0/examples/jsm/shaders/GammaCorrectionShader.js';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(0, 2, 5);

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace; // ensures correct colors
document.body.appendChild(renderer.domElement);
renderer.setClearColor(0x264258); 


// handle resizing of windows
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    // update post-processing effects as well
    composer.setSize(window.innerWidth, window.innerHeight);
    outlinePass.resolution.set(window.innerWidth, window.innerHeight);
});

// orbit controls
const orbit = new OrbitControls(camera, renderer.domElement);


// post processing highlight effect - a white outline for selected mesh
const renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
    colorSpace: THREE.SRGBColorSpace // ensures correct gamma
});
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
outlinePass.edgeStrength = 5;
outlinePass.edgeGlow = 1;
outlinePass.edgeThickness = 2;
outlinePass.pulsePeriod = 0;
outlinePass.visibleEdgeColor.set("#ffffff");
composer.addPass(outlinePass);

// ensure correct gamma
const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
composer.addPass(gammaCorrectionPass);

// GUI elements
const fileInput = document.getElementById("fileInput");
const fileLabel = document.getElementById("fileLabel");
const statusMessage = document.getElementById("statusMessage");
const colorSelection = document.getElementById("colorSelection");
const applyVariantsButton  = document.getElementById("applyVariants");
const variantPreview = document.getElementById("variantPreview");
const variantDropdown = document.getElementById("variantDropdown");
const exportGLBButton   = document.getElementById("exportGLB");
const colorPickers = [
    document.getElementById("colorPicker01"),
    document.getElementById("colorPicker02"),
    document.getElementById("colorPicker03")
];



// GLTF loader
const loader = new GLTFLoader();

let loadedModel;
let selectedMesh = null;
let selectedColors = colorPickers.map(picker => picker.value);


// raycaster for detecing clicked meshes
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();



// handle event when user selects a file
fileInput.addEventListener("change", fileSelectHandler);


function fileSelectHandler(event) {
    const file = event.target.files[0];
    if (!file) {
        console.error("No file selected.");
        return;
    }

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = function(event) {
        const arrayBuffer = event.target.result; // the binary data
        const blob = new Blob([arrayBuffer], { type: "model/gltf-binary" }); // wrap in Blob object so browser can handle it
        const url = URL.createObjectURL(blob); // points to the data in memory
        loadGLB(url);
    };

    updateGUIAfterLoad();

}


// loading of the file into the scene
function loadGLB(url) {
    loader.load(url, onModelLoaded, undefined, function(error) {
        console.error("Error loading model:", error);
    });
}

function onModelLoaded(gltf) {
    if (loadedModel) {
        scene.remove(loadedModel); // remove existing model
    }

    loadedModel = gltf.scene;
    scene.add(loadedModel);
    console.log("File successfully loaded");

    console.log("GLTF Version:", gltf.parser.json.asset.version);
    

    // center model
    const box = new THREE.Box3().setFromObject(loadedModel); // bounding box
    const center = box.getCenter(new THREE.Vector3());
    loadedModel.position.sub(center);
    console.log("Model centered")
}

// gui updates
function updateGUIAfterLoad() {
    fileLabel.innerText = "You may select another GLB file:";
    statusMessage.classList.remove("hidden");
    exportGLBButton.classList.remove("hidden");
}


// lighting

const ambientLight = new THREE.AmbientLight('#ffffff', 0.05);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight('#ffffff', 0.8);
keyLight.position.set(5, 10, 7);
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight('#ffffff', 0.2);
rimLight.position.set(-5, 2, 2);
scene.add(rimLight);


// light helpers
// const keyLightHelper = new THREE.DirectionalLightHelper(keyLight, 1);
// scene.add(keyLightHelper);
// const rimLightHelper = new THREE.DirectionalLightHelper(rimLight, 1);
// scene.add(rimLightHelper);

// allow user to select mesh by clicking on it
window.addEventListener("click", function(event) {
    
    if (event.target.closest("#controls")) return; // exclude GUI interactions
    
    if (!loadedModel) return;

    event.preventDefault();

    // normalize mouse click coordinates to range -1,1
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(loadedModel, true);

    deselectMesh();
    if (intersects.length > 0) {
        selectMesh(intersects[0].object);
    }
});

function selectMesh(mesh) {
    if (selectedMesh === mesh) return; // nothing to do if same mesh already selected

    selectedMesh = mesh;
    outlinePass.selectedObjects = [selectedMesh];
    console.log("Selected mesh name:", selectedMesh.name);
    // update GUI
    colorSelection.classList.remove("hidden");
    //applyVariantsButton.classList.remove("hidden");
    updateVariantDropdown();
}

// populate dropdown with variants if they exist
function updateVariantDropdown() {
    variantDropdown.innerHTML = "";
    variantPreview.classList.add("hidden");

    if (!selectedMesh || !selectedMesh.userData.variants) return; // if nothing is selected or no variants

    selectedMesh.userData.variants.forEach((variant, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = variant.name;
        variantDropdown.appendChild(option);
    });

    variantPreview.classList.remove("hidden");  // show dropdown
}


function deselectMesh() {
    if (!selectedMesh) return; // nothing to do if nothing selected
    outlinePass.selectedObjects = [];
    selectedMesh = null;
    console.log("Selection cleared");
    // update GUI
    colorSelection.classList.add("hidden");
    variantPreview.classList.add("hidden");
}

// handle selecting colors
colorPickers.forEach((picker, index) => {
    picker.addEventListener("input", (event) => {
        selectedColors[index] = event.target.value;
    });
});


// applying material variants
applyVariantsButton.addEventListener("click", applyMaterialVariants);

function applyMaterialVariants() {
    if (!selectedMesh) return;

    // Ensure this mesh has a stored original material
    if (!selectedMesh.userData.originalMaterials) {
        selectedMesh.userData.originalMaterials = selectedMesh.material;
    }

    // create variants for this mesh, based on its original material, with the 3 selected base colors
    selectedMesh.userData.variants = selectedColors.map((color, index) => {
        const newMaterial = selectedMesh.material.clone();
        newMaterial.color.set(color);
        newMaterial.name = `${selectedMesh.name}_variant_${index + 1}`;
        return {
            name: `${selectedMesh.name} Variant ${index + 1}`,
            material: newMaterial
        };
    });

    // gui update - enable user to preview materials
    updateVariantDropdown();

    console.log(`Material variants applied to mesh "${selectedMesh.name}":`, selectedMesh.userData.variants);
  
}

// previewing variants in the render view
variantDropdown.addEventListener("change", function () {
    if (!selectedMesh || !selectedMesh.userData.variants) {
        console.log("No mesh selected")
        return;
    } 

    const selectedVariantIndex = parseInt(variantDropdown.value);
    console.log(`Applying variant ${selectedMesh.userData.variants[selectedVariantIndex].name}`);
    selectedMesh.material = selectedMesh.userData.variants[selectedVariantIndex].material;
});


// exporting the file
exportGLBButton.addEventListener("click", exportGLB);

// first export it as json, so we can add the variants, and then turn into binary
function exportGLB() {
    if (!loadedModel) {
        alert('Please load a model first.');
        return;
    }
    
    const exporter = new GLTFExporter();
    const options = { binary: true, embedImages: true };

    let variantMaterials = [];
    let variantNames = []; // these are the names we see in a dropdown in any viewer that supports variants
    let materialIndexMap = new Map(); // map a material to its index in the variantMaterials list
    let variantMappings = {}; // dictionary to map mesh names to their assigned variants

    // reset all meshes to original materials
    // (note: without this, duplicate variants could be exported, so if you remove this, address that issue elsewhere)
    loadedModel.traverse((node) => {
        if (node.isMesh && node.userData.originalMaterials) {
            node.material = node.userData.originalMaterials; 
        }
    });

    // get all meshes' variant materials to add to the exported file 
    let globalVariantIndex = 0;
    loadedModel.traverse((node) => {
        if (node.isMesh && node.userData.variants) { // if it's a mesh AND has variants
            let meshVariants = [];
            // for each of this mesh's variant materials, check if that variant material is already in variantMaterials.
            // if not, add it and give it an index
            node.userData.variants.forEach((variant, index) => {
                if (!materialIndexMap.has(variant.material)) { 
                    materialIndexMap.set(variant.material, variantMaterials.length);
                    variantMaterials.push(variant.material);
                }
                // add each ariant name and assign an index to each variant
                // (regardless of whether that variant uses an already existing material)
                variantNames.push(variant.name);
                meshVariants.push({
                    material: materialIndexMap.get(variant.material),
                    variants: [globalVariantIndex]
                });
                globalVariantIndex++;
            });

            // update the dictionary with this mesh name mapped to its variant materials
            variantMappings[node.name] = meshVariants;
        }
    });


    // prepare and export the model (not the whole scene; not including the lights that were added)
    exporter.parse(loadedModel, function (gltf) {

    // add KHR_materials_variants
    gltf.extensionsUsed = gltf.extensionsUsed || [];
    if (!gltf.extensionsUsed.includes("KHR_materials_variants")) {
        gltf.extensionsUsed.push("KHR_materials_variants");
    }
    gltf.extensions = gltf.extensions || {};
    gltf.extensions["KHR_materials_variants"] = {
        variants: variantNames.map((name) => ({ name })) // Use the existing names!
    };

    // adding the new variant materials that were created to the gltf's list of materials
    gltf.materials = gltf.materials || [];
    const originalMaterialCount = gltf.materials.length;

        variantMaterials.forEach((mat) => {
            // put in all material properties supported by GLTFExporter
            // (they can be represented a bit differently in the gltf than in Three.js, e.g. metallicFactor instead of metalness)
            gltf.materials.push({
                name: mat.name,
                pbrMetallicRoughness: {
                    baseColorFactor: colorToFactor(mat.color),
                    metallicFactor: mat.metalness, 
                    roughnessFactor: mat.roughness 
                },
                emissiveFactor: mat.emissive ? colorToFactor(mat.emissive) : [0, 0, 0], 
                normalTexture: mat.normalMap ? { index: 0 } : undefined, 
                alphaMode: mat.transparent ? "BLEND" : "OPAQUE", 
            });
        });

        // assign the variants to their meshes by inserting them under the meshes' primitives
        if (gltf.nodes) {
            gltf.nodes.forEach((node) => {
                if (node.name && typeof node.mesh === 'number' && variantMappings[node.name]) {
                    const mesh = gltf.meshes[node.mesh];
                    if (mesh && mesh.primitives.length > 0) {
                        mesh.primitives[0].extensions = mesh.primitives[0].extensions || {};
                        mesh.primitives[0].extensions["KHR_materials_variants"] = {
                            mappings: variantMappings[node.name].map(({ material, variants }) => ({
                                material: originalMaterialCount + material, // assigning the right material index
                                variants
                            }))
                        };
                    }
                }
            });
        }

        console.log("GLTF:", gltf); // the json representation

        // for debugging purposes only: save json to file
        const jsonString = JSON.stringify(gltf, null, 2); 
        saveTextFile(jsonString, "debug_model.json"); 

        // save binary
        const glbBuffer = gltfToGlb(gltf); // convert to binary
        saveArrayBuffer(glbBuffer, "updated_model.glb"); // download file
        console.log("File sucessfully exported");
    }, options);
}
    
  
// helper to convert THREE.Color to [r,g,b,a] for the gltf
function colorToFactor(color) {
return [color.r, color.g, color.b, 1.0];
}

// convert json to binary
// padded with ASCII spaces (0x20) as per glTF spec
function gltfToGlb(gltf) {
    const jsonText = JSON.stringify(gltf);
    const jsonBuffer = new TextEncoder().encode(jsonText);
    const paddedLength = Math.ceil(jsonBuffer.byteLength / 4) * 4;
    
    // create buffer and fill with ASCII spaces (0x20)
    // (without this, the validator complains about the resulting file)
    const jsonChunk = new Uint8Array(paddedLength);
    jsonChunk.fill(0x20);
    jsonChunk.set(jsonBuffer);
    
    const headerByteLength = 12;
    const chunkHeaderByteLength = 8;
    const totalByteLength = headerByteLength + chunkHeaderByteLength + paddedLength;
    const glbBuffer = new ArrayBuffer(totalByteLength);
    const dataView = new DataView(glbBuffer);
    
    // glb header
    dataView.setUint32(0, 0x46546C67, true); // 'glTF'
    dataView.setUint32(4, 2, true);            // version 2
    dataView.setUint32(8, totalByteLength, true);
    
    // json chunk header
    dataView.setUint32(12, paddedLength, true);
    dataView.setUint32(16, 0x4E4F534A, true);  // 'JSON'
    
    // json chunk data (including padding)
    new Uint8Array(glbBuffer, 20, paddedLength).set(jsonChunk);
    return glbBuffer;
}

// for debugging purposes only
function saveTextFile(text, filename) {
    const blob = new Blob([text], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

// save as binary file
function saveArrayBuffer(buffer, filename) {
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename; // trigger download
    link.click();
}


// render scene with loaded model
// Render loop
function render() {
    // renderer.render(scene, camera);
    composer.render();
    requestAnimationFrame(render);
}
render();