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

  // Texture toggle (and save choice)
  document.querySelectorAll('input[name="texture"]').forEach(radio => {
    radio.addEventListener('change', e => {
      const choice = e.target.value;            // 'advanced' | 'basic'
      localStorage.setItem(TEX_KEY, choice);    // remember it
      const url = choice === 'advanced'
        ? 'Ecorche_Muscles_Color_Codes.png'
        : 'Ecorche_Muscles.png';
      applyTexture(url);
    });
  });



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
