console.log('🔌 script.js loaded as ES module');

// Safety guard for DOM lookups in early loads
document.addEventListener('DOMContentLoaded', () => {
  // no-op: your existing listeners can stay as-is
});

(async () => {
  // 1) Dynamic ES-module imports
  const THREE = await import('https://esm.sh/three@0.153.0');
  const { OBJLoader } = await import('https://esm.sh/three@0.153.0/examples/jsm/loaders/OBJLoader.js');
  const { OrbitControls } = await import('https://esm.sh/three@0.153.0/examples/jsm/controls/OrbitControls.js');

  // Viewer-only globals/aliases
  const TEX_KEY = 'mm_tex_choice';           // 'basic' | 'advanced'
  const MUSCLE_INFO = window.MUSCLE_INFO || {};

  const body  = document.body;

  // --- optional theme toggle (guarded) ---
  const darkSheet  = document.getElementById('theme-dark');
  const lightSheet = document.getElementById('theme-light');
  const toggleBtn  = document.getElementById('themeToggle');
  if (toggleBtn && darkSheet && lightSheet) {
    toggleBtn.addEventListener('click', () => {
      const darkEnabled = !darkSheet.disabled;
      darkSheet.disabled = darkEnabled;
      lightSheet.disabled = !darkEnabled;
      localStorage.setItem('theme', darkEnabled ? 'light' : 'dark');
    });

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      darkSheet.disabled = true;
      lightSheet.disabled = false;
    }
  }

  // ---------- Three.js Scene setup ----------
  const container = document.getElementById('three-container');
  if (!container) return console.error('Missing #three-container');

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0.6, 0.6, 2.3,);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  // sRGB output path for richer colors
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;

  container.appendChild(renderer.domElement);

  scene.add(
    new THREE.HemisphereLight(0xffffff, 0x444444, 0.6),
    (() => { const dl = new THREE.DirectionalLight(0xffffff, 0.8); dl.position.set(5,10,7.5); return dl; })()
  );

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.zoomSpeed    = 0.7;
  controls.minDistance  = 0.5;
  controls.maxDistance  = 4;

  // --- Hover tooltip setup ---
  const mmTip = document.createElement('div');
  mmTip.className = 'mm-tooltip';
  document.body.appendChild(mmTip);
  function showTip(text, x, y) {
    mmTip.textContent = text;
    mmTip.style.left = x + 'px';
    mmTip.style.top  = y + 'px';
    mmTip.classList.add('show');
  }
  function hideTip() { mmTip.classList.remove('show'); }

  // Loaders & state
  const texLoader  = new THREE.TextureLoader();
  const objLoader  = new OBJLoader();
  const raycaster  = new THREE.Raycaster();
  const pointer    = new THREE.Vector2();
  let model        = null;
  const loader = new THREE.TextureLoader();
  const boneTex = loader.load('Ecorche_Bones.png', t => {
  t.encoding = THREE.sRGBEncoding;  // match your color workflow
  t.wrapS = t.wrapT = THREE.RepeatWrapping; // keep default if atlas
});

// Keep a global so you can toggle later
const BoneOverlay = { enabled: false, mix: 1.0, mode: 'multiply' }; // mix 0..1

function addBoneOverlay(mat) {
  if (!mat || mat.userData._hasBoneOverlay) return;

  mat.onBeforeCompile = (shader) => {
    // uniforms we can tweak later
    shader.uniforms.uBoneTex = { value: boneTex };
    shader.uniforms.uBoneMix = { value: BoneOverlay.enabled ? BoneOverlay.mix : 0.0 };
    shader.uniforms.uBoneMode = { value: 0 }; // 0=multiply, 1=overlay, 2=add

    // add a sampler + helper at the top of fragment shader
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `
        #include <common>
        uniform sampler2D uBoneTex;
        uniform float uBoneMix;
        uniform int uBoneMode;

        vec3 blendOverlay(vec3 base, vec3 blend) {
          return mix(2.0*base*blend, 1.0 - 2.0*(1.0-base)*(1.0-blend), step(0.5, base));
        }
        `
      )
      // right after diffuse color is computed, mix in bone texture using the same UVs
      .replace(
        '#include <map_fragment>',
        `
        #include <map_fragment>
        vec3 boneRGB = texture2D(uBoneTex, vMapUv).rgb;
        #if defined( USE_MAP )
          // baseColor = texelColor.xyz already computed by <map_fragment>
          vec3 mixed;
          if (uBoneMode == 0) {
            mixed = diffuseColor.rgb * boneRGB;                // multiply
          } else if (uBoneMode == 1) {
            mixed = blendOverlay(diffuseColor.rgb, boneRGB);   // overlay
          } else {
            mixed = diffuseColor.rgb + boneRGB - 1.0;          // add
          }
          diffuseColor.rgb = mix(diffuseColor.rgb, mixed, uBoneMix);
        #endif
        `
      );

    // stash so we can update later
    mat.userData.shader = shader;
  };

  mat.needsUpdate = true;
  mat.userData._hasBoneOverlay = true;
}

function setBoneOverlayEnabled(on) {
  BoneOverlay.enabled = on;
  scene.traverse(o => {
    if (o.isMesh) {
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach(m => {
        if (!m?.userData?.shader) return;
        m.userData.shader.uniforms.uBoneMix.value = on ? BoneOverlay.mix : 0.0;
      });
    }
  });
}

function setBoneOverlayMix(x) { // 0..1
  BoneOverlay.mix = x;
  scene.traverse(o => {
    if (o.isMesh) {
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach(m => {
        if (!m?.userData?.shader) return;
        m.userData.shader.uniforms.uBoneMix.value = x;
      });
    }
  });
}

// Example bindings:
document.querySelector('#toggle-bones').addEventListener('change', (e) => {
  setBoneOverlayEnabled(e.target.checked);
});

document.querySelector('#bones-mix').addEventListener('input', (e) => {
  setBoneOverlayMix(parseFloat(e.target.value)); // 0..1 range
});

// Optional: switch blend mode (multiply/overlay/add)
function setBoneBlendMode(mode) {
  // 0=multiply, 1=overlay, 2=add
  const modeIdx = { multiply:0, overlay:1, add:2 }[mode] ?? 0;
  BoneOverlay.mode = mode;
  scene.traverse(o => {
    if (!o.isMesh) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    mats.forEach(m => m?.userData?.shader && (m.userData.shader.uniforms.uBoneMode.value = modeIdx));
  });
}


// Apply to all textured meshes you want to support
scene.traverse(o => {
  if (o.isMesh) {
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    mats.forEach(m => {
      if (m && (m.map || m.userData.forceOverlay)) addBoneOverlay(m);
    });
  }
});



  // Selection state (persistent highlight)
  let selectedMesh = null;
  let selectedPrevEmissive = 0x000000;
  const HOVER_COLOR  = 0x777777;   // tweak if you want lighter/darker
  const SELECT_COLOR = 0x66ccff;

  // --- Preload textures & cache ---
  const textureURLs = ['Ecorche_Muscles.png','Ecorche_Muscles_Color_Codes.png'];
  const textureCache = new Map();
  let pendingTextureURL = null; // apply after model loads, if needed

  function loadTex(url) {
    return new Promise((resolve, reject) => {
      texLoader.load(
        url,
        (tex) => {
          if ('colorSpace' in tex) tex.colorSpace = THREE.SRGBColorSpace;
          const anis = renderer.capabilities.getMaxAnisotropy?.() || 1;
          tex.anisotropy = anis;
          textureCache.set(url, tex);
          resolve(tex);
        },
        undefined,
        reject
      );
    });
  }
  Promise.all(textureURLs.map(loadTex))
    .then(() => console.log('✅ Textures preloaded'))
    .catch(err => console.warn('Texture preload issue:', err));

  // Apply texture (uses cache; defers if model not ready)
  function applyTexture(url) {
    const useTex = (tex) => {
      if (!model) { pendingTextureURL = url; return; }
      model.traverse(ch => {
        if (ch.isMesh) {
          ch.material.map = tex;
          ch.material.needsUpdate = true;
        }
      });
    };
    const cached = textureCache.get(url);
    if (cached) useTex(cached);
    else loadTex(url).then(useTex).catch(err => console.error('Texture load error', err));
  }

  // initial texture (remember choice)
  const savedTex = localStorage.getItem(TEX_KEY) || 'basic';
  applyTexture(savedTex === 'advanced'
    ? 'Ecorche_Muscles_Color_Codes.png'
    : 'Ecorche_Muscles.png');
  // reflect in radios
  const savedRadio = document.querySelector(`input[name="texture"][value="${savedTex}"]`);
  if (savedRadio) savedRadio.checked = true;

  // Load model
  objLoader.load(
    'Ecorche_by_AlexLashko.obj',
    obj => {
      model = obj;
      // center model
      const box = new THREE.Box3().setFromObject(obj);
      const center = box.getCenter(new THREE.Vector3());
      obj.position.sub(center);
      obj.traverse(ch => {
        if (ch.isMesh) {
          ch.material = new THREE.MeshStandardMaterial({ roughness: 0.6, metalness: 0.1, color: 0xffffff });
        }
      });
      scene.add(obj);


      // if a texture was requested before model loaded, apply it now
      if (pendingTextureURL) {
        const tex = textureCache.get(pendingTextureURL);
        if (tex) applyTexture(pendingTextureURL);
        pendingTextureURL = null;
      }
    },
    xhr => console.log(`Model ${(xhr.loaded / xhr.total * 100).toFixed(0)}% loaded`),
    err => console.error('OBJ load error', err)
  );

// ADD THIS BLOCK TO SCRIPT.JS:

  // ---------- Texture Toggle Logic ----------
  const textureToggleBtn = document.getElementById('texture-toggle');
  const textureLabel = document.getElementById('texture-label');
  const iconOutline = document.getElementById('texture-icon-outline');
  const iconFilled = document.getElementById('texture-icon-filled');
  const TEXKEY = 'mm_tex_choice'; // Ensure this key is available globally or defined here

  // Helper function to update the UI visuals (icons/text)
  function updateTextureUI(isAdvanced) {
    if (iconOutline) iconOutline.classList.toggle('hidden', isAdvanced);
    if (iconFilled) iconFilled.classList.toggle('hidden', !isAdvanced);
    if (textureLabel) textureLabel.textContent = isAdvanced ? 'High-Contrast' : 'Default';
    if (textureToggleBtn) textureToggleBtn.setAttribute('aria-pressed', String(isAdvanced));
  }

  // Primary function to set the state and apply the texture
  function setTextureChoice(choice) {
    localStorage.setItem(TEX_KEY, choice);
    const isAdvanced = choice === 'advanced';
    
    const url = isAdvanced
      ? 'Ecorche_Muscles_Color_Codes.png'
      : 'Ecorche_Muscles.png';
    
    // Note: applyTexture is assumed to be defined elsewhere in script.js
    if (typeof applyTexture === 'function') {
        applyTexture(url);
    } else {
        console.warn("applyTexture function not found. Texture change not applied to model.");
    }
    updateTextureUI(isAdvanced);
  }

  // Restore initial state on load
  const initialTex = localStorage.getItem(TEX_KEY) || 'basic';
  setTextureChoice(initialTex);
  
  // Event Listener for the new toggle button
  textureToggleBtn?.addEventListener('click', () => {
    const currentChoice = localStorage.getItem(TEX_KEY) || 'basic';
    const nextChoice = currentChoice === 'basic' ? 'advanced' : 'basic';
    setTextureChoice(nextChoice);
  });

  // ---------- End Texture Toggle Logic ----------



  // ---------- Selection + Zoom helpers ----------
  function getMeshForKey(key) {
    if (!model || !key) return null;
    const k = key.toLowerCase();
    let hit = null;
    model.traverse(ch => {
      if (hit || !ch.isMesh) return;
      const name = (ch.name || '').toLowerCase();
      if (name.includes(k)) hit = ch;
    });
    return hit;
  }
  function highlightMesh(mesh) {
    // clear previous
    if (selectedMesh && selectedMesh.material?.emissive) {
      selectedMesh.material.emissive.setHex(selectedPrevEmissive);
    }
    selectedMesh = mesh || null;
    if (selectedMesh?.material?.emissive) {
      selectedPrevEmissive = selectedMesh.material.emissive.getHex();
      selectedMesh.material.emissive.setHex(SELECT_COLOR);
    }
  }
  function selectMeshByKey(key) {
    const m = getMeshForKey(key);
    if (!m) return false;
    highlightMesh(m);
    // ensure hover doesn't override selection
    if (m && m !== currentHover && currentHover?.material?.emissive) {
      currentHover.material.emissive.setHex(0x000000);
    }
    return true;
  }
  // Smoothly fit/zoom camera to a mesh (OrbitControls-friendly)
  function zoomToMesh(mesh, opts = {}) {
    if (!mesh || !camera) return;
    const { duration = 900, fitRatio = 1.35 } = opts;

    const box = new THREE.Box3().setFromObject(mesh);
    const sphere = box.getBoundingSphere(new THREE.Sphere());

    const startPos = camera.position.clone();
    const startTarget = controls ? controls.target.clone() : new THREE.Vector3();

    const endTarget = sphere.center.clone();

    // keep current viewing direction but set distance to fit sphere
    const dir = startPos.clone().sub(startTarget).normalize();
    const dist = sphere.radius * fitRatio / Math.sin(THREE.MathUtils.degToRad(camera.fov * 0.5));
    const endPos = endTarget.clone().add(dir.multiplyScalar(dist));

    const t0 = performance.now();
    function animateZoom() {
      const t = Math.min(1, (performance.now() - t0) / duration);
      // ease in-out
      const e = t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t;

      camera.position.lerpVectors(startPos, endPos, e);
      if (controls) {
        controls.target.lerpVectors(startTarget, endTarget, e);
        controls.update();
      }
      camera.lookAt(controls ? controls.target : endTarget);
      if (t < 1) requestAnimationFrame(animateZoom);
    }
    animateZoom();
  }
  function autoZoomToKey(key, opts) {
    const m = getMeshForKey(key);
    if (m) zoomToMesh(m, opts);
  }

  // ---- Hover highlight + tooltip (does NOT override a selected mesh) ----
  let currentHover = null;
  container.addEventListener('pointermove', e => {
    if (!model) return;
    const rect = container.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObject(model, true);

    if (hits.length) {
      const mesh = hits[0].object;

      if (currentHover !== mesh) {
        // unhover previous if it isn't the selected one
        if (currentHover && currentHover !== selectedMesh && currentHover.material?.emissive) {
          currentHover.material.emissive.setHex(0x000000);
        }
        // light hover only if not currently selected
        if (mesh !== selectedMesh && mesh.material?.emissive) {
          mesh.material.emissive.setHex(HOVER_COLOR);
        }
        currentHover = mesh;
      }

      // tooltip text from MUSCLE_INFO key
      const meshName = (mesh.name || '').toLowerCase();
      const key = Object.keys(MUSCLE_INFO).find(k => meshName.includes(k));
      if (key) showTip(MUSCLE_INFO[key].title, e.clientX + 12, e.clientY + 12);
      else hideTip();

    } else {
      if (currentHover && currentHover !== selectedMesh && currentHover.material?.emissive) {
        currentHover.material.emissive.setHex(0x000000);
      }
      currentHover = null;
      hideTip();
    }
  });
  // Hide tooltip when pointer leaves the viewer
  container.addEventListener('pointerleave', hideTip);

  container.addEventListener('pointerdown', e => {
    if (!model) return;
    const rect = container.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObject(model, true);

    if (hits.length) {
      const mesh = hits[0].object;

      // Clear previous selection
      if (selectedMesh && selectedMesh.material?.emissive) {
        selectedMesh.material.emissive.setHex(selectedPrevEmissive);
      }

      // Store and mark new selection
      selectedMesh = mesh;
      if (mesh.material?.emissive) {
        selectedPrevEmissive = mesh.material.emissive.getHex();
        mesh.material.emissive.setHex(SELECT_COLOR); // selection color
      }

      // Ensure hover doesn't override selection
      if (currentHover && currentHover !== selectedMesh && currentHover.material?.emissive) {
        currentHover.material.emissive.setHex(0x000000);
      }

      const meshName = (mesh.name || '').toLowerCase();
      const key = Object.keys(MUSCLE_INFO).find(k => meshName.includes(k));
      if (key) {
        openSidebarWith(key);
        // auto-zoom on click too (consistent with search)
        autoZoomToKey(key, { duration: 900, fitRatio: 1.35 });
      }
    }
  });

  // ---- Handle resize for renderer/camera ----
  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  // ---- Animate ----
  (function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  })();
})();
