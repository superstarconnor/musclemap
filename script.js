console.log('🔌 script.js loaded as ES module');

(async () => {
  // 1) Dynamic ES-module imports
  const THREE = await import('https://esm.sh/three@0.153.0');
  const { OBJLoader } = await import('https://esm.sh/three@0.153.0/examples/jsm/loaders/OBJLoader.js');
  const { OrbitControls } = await import('https://esm.sh/three@0.153.0/examples/jsm/controls/OrbitControls.js');

  // Small prefs keys
  const TEX_KEY = 'mm_tex_choice';          // 'basic' | 'advanced'
  const SIDEBAR_W_KEY = 'mm_sidebar_w';     // e.g., '360px'

  // Close button for the info panel
  const closeBtn = document.querySelector('.sidebar .close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      document.getElementById('muscleSidebar')?.classList.remove('active');
      document.body.classList.remove('sidebar-open');
    });
  }

  // 2) Data map for muscles
  const MUSCLE_INFO = {
    pec: {
      title: 'Pectoralis Major (Pecs)',
      description:
        "Derived from Latin 'pectus,' meaning breast, your pectoralis major(s) are located just beneath the breast tissue. Together with the pectoralis minor, these muscles make up what we call the chest.",
      img: 'IMG_4191.PNG',
      function:
        'The pectoralis major(s) have two heads: the clavicular (attaches to the clavicle) and the sternal (attaches to the sternum).',
      head: 'These muscles are responsible for flexion, adduction, and internal rotation of the shoulder joint.',
      exercises: ['Bench Press', 'Push-Ups', 'Chest Fly']
    },
    deltoid: {
      title: 'Deltoid',
      img: 'Screenshot 2025-05-27 at 12.16.11 PM.png',
      description:
        "When a person says they're training their shoulders, what they're really referring to is the deltoid. Named after the Greek letter delta (Δ), deltoids are a triangular muscle capping the shoulder.",
      function:
        'Comprised of three heads: anterior (front), lateral (side), and posterior (rear).',
      he:
        'Abduction, flexion, and extension of the shoulder joint. Each head can be biased with raises in its direction (e.g., lateral raises for lateral delts).',
      exercises: ['Lateral Raise', 'Overhead Press', 'Front Raise']
    },
    tricep: {
      title: 'Tricep Brachii',
      img: '400px-Long_head_of_triceps_brachii_muscle_-_Kenhub.png',
      description:
        'Like the bicep, the tricep is named for its number of heads. It makes up roughly two-thirds of the upper arm mass—crucial for thick arms.',
      function: 'Elbow extension; the long head also assists in shoulder extension and adduction.',
      exercises: ['Overhead Cable Extension', 'Skullcrushers', 'Cable Pulldown']
    },
    bicep: {
      title: 'Bicep Brachii',
      img: 'biceps_intro.jpg',
      description:
        "Aptly named, the bicep has two heads sitting at the front of the arm. And yes—it looks great during curls.",
      function: 'Elbow flexion and forearm supination; assists in shoulder flexion.',
      exercises: ['Barbell Curl', 'Dumbbell Curl', 'Hammer Curl']
    },
    latissimus: {
      title: 'Latissimus Dorsi (Lats)',
      img: 'biceps_intro.jpg',
      description:
        'The latissimus dorsi—“lats”—are the widest upper-body muscle and key to a powerful V-taper.',
      function: 'Shoulder adduction, extension, and internal rotation.',
      exercises: ['Lat Pulldown', 'Pull-Ups', 'Seated Row']
    },
    trapezius: {
      title: 'Trapezius',
      img: 'trapeze.jpg',
      description:
        'The trapezius (“traps”) spans the upper back and neck. Often tricky to feel at first.',
      function: 'Scapular elevation, retraction, and depression (upper, middle, lower fibers).',
      exercises: ['Shrugs', 'Face Pulls', 'Bent-Over Rows']
    },
    oblique: {
      title: 'External Obliques',
      img: 'oblique.jpg',
      description:
        'The external obliques run along the sides of the abdomen and aid in trunk rotation and stability.',
      function: 'Trunk rotation, lateral flexion, and intra-abdominal pressure.',
      exercises: ['Cable Woodchop', 'Side Plank', 'Pallof Press']
    },
    abdominis: {
      title: 'Abdominis (Abs)',
      img: 'hamstrings.png',
      description:
        'Three muscles on the back of the thigh: biceps femoris, semitendinosus, and semimembranosus. They cross the hip and knee.',
      function:
        'Hip extension (long heads) and knee flexion; help control tibial rotation.',
      exercises: ['Romanian Deadlift', 'Nordic Curl', 'Leg Curl']
    },
    gluteus: {
      title: 'Gluteus Maximus (Glutes)',
      img: 'gluteus_maximus.png', // swap to your actual asset
      description:
        'Your glutes are the largest muscle group in the body. The gluteus maximus gives the hips their power for standing up, climbing, and sprinting, while the smaller gluteus medius/minimus help keep the pelvis stable when you walk or stand on one leg.',
      function:
        'Primary hip extension and external rotation (gluteus maximus). The gluteus medius/minimus assist with hip abduction and internal/external rotation and stabilize the pelvis during gait.',
      exercises: ['Hip Thrust / Glute Bridge', 'Romanian Deadlift', 'Bulgarian Split Squat']
    },
    quadriceps: {
      title: 'Quadriceps Femoris (Quads)',
      img: 'quadriceps.png',
      description:
        'Four muscles on the front of the thigh: rectus femoris, vastus lateralis, vastus medialis, and vastus intermedius. Big contributors to knee extension and athletic power.',
      function:
        'Primary knee extension; rectus femoris also assists hip flexion.',
      exercises: ['Back/Front Squat', 'Leg Press', 'Leg Extension']
    },
    hamstrings: {
      title: 'Hamstrings',
      img: 'hamstrings.png',
      description:
        'Three muscles on the back of the thigh: biceps femoris, semitendinosus, and semimembranosus. They cross the hip and knee.',
      function:
        'Hip extension (long heads) and knee flexion; help control tibial rotation.',
      exercises: ['Romanian Deadlift', 'Nordic Curl', 'Leg Curl']
    },
    adductors: {
      title: 'Hip Adductors',
      img: 'adductors.png',
      description:
        'Inner-thigh group (adductor magnus/longus/brevis, gracilis, pectineus). Important for change-of-direction and pelvic control.',
      function:
        'Hip adduction; some fibers assist hip extension/flexion depending on angle.',
      exercises: ['Copenhagen Plank', 'Cable/Band Adductions', 'Sumo Squat']
    },
    
    // add additional muscles here
  };

  // Helper: open and populate the sidebar for a given key
  function openSidebarWith(key) {
    const info = MUSCLE_INFO[key];
    if (!info) return;
    const sidebar = document.getElementById('muscleSidebar');
    document.getElementById('muscleName').textContent = info.title;
    sidebar.querySelector('img').src = info.img || '';
    const descP = sidebar.querySelectorAll('.sidebar-section p')[0];
    descP.textContent = info.description || '';
    const funcP = sidebar.querySelectorAll('.sidebar-section h3')[0].nextElementSibling;
    funcP.textContent = info.function || '';
    const ul = sidebar.querySelector('.sidebar-section ul');
    ul.innerHTML = (info.exercises || []).map(ex => `<li>${ex}</li>`).join('');
    sidebar.classList.add('active');
    document.body.classList.add('sidebar-open');
  }

  // 3) Scene setup
  const container = document.getElementById('three-container');
  if (!container) return console.error('Missing #three-container');

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 1, 2.2);

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
  controls.zoomSpeed    = 0.3;
  controls.minDistance  = 1.5;
  controls.maxDistance  = 8;

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

  // === Draggable sidebar (smooth delta-based) + remember width (clamped) ===
  const sidebarEl = document.getElementById('muscleSidebar');
  const resizer   = sidebarEl?.querySelector('.sidebar-resizer');

  let resizing = false;
  let startX = 0;
  let startWidth = 0;

  function setSidebarWidth(px){
    const min = 320;
    const max = Math.floor(window.innerWidth * 0.5); // 50vw
    const w   = Math.max(min, Math.min(max, px));
    const val = `${Math.round(w)}px`;
    document.documentElement.style.setProperty('--sidebar-width', val);
    // no localStorage write: resets to 35vw next reload
  }
  
  function getSidebarWidthPx(){
    return sidebarEl?.getBoundingClientRect().width || 0;
  }

  if (resizer) {
    resizer.addEventListener('pointerdown', (e) => {
      if (!sidebarEl.classList.contains('active')) return;
      resizing = true;
      startX = e.clientX;
      startWidth = getSidebarWidthPx();
      resizer.setPointerCapture(e.pointerId);
      document.body.classList.add('resizing');
      sidebarEl.classList.add('resizing');
      controls.enabled = false;
      e.preventDefault();
    });

    resizer.addEventListener('pointermove', (e) => {
      if (!resizing) return;
      const dx = startX - e.clientX;     // dragging left increases width
      setSidebarWidth(startWidth + dx);
    });

    resizer.addEventListener('pointerup', (e) => {
      if (!resizing) return;
      resizing = false;
      resizer.releasePointerCapture(e.pointerId);
      document.body.classList.remove('resizing');
      sidebarEl.classList.remove('resizing');
      controls.enabled = true;
    });

    // Double-click to snap to a default width
    resizer.addEventListener('dblclick', () => setSidebarWidth(360));

    // Keep bounds sensible on window resize
    window.addEventListener('resize', () => {
      const current = sidebarEl.classList.contains('active') ? getSidebarWidthPx() : 320;
      setSidebarWidth(current);
    });
  }

  // 4) Loaders & state
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
  const textureURLs = [
    'Ecorche_Muscles.png',
    'Ecorche_Muscles_Color_Codes.png'
  ];
  const textureCache = new Map();
  let pendingTextureURL = null; // apply after model loads, if needed

  function loadTex(url) {
    return new Promise((resolve, reject) => {
      texLoader.load(
        url,
        (tex) => {
          // nicer sampling & correct color
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

  // 5) Load model
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

  // 6) Texture toggle (and save choice)
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

  // 7) Hover highlight + tooltip (does NOT override a selected mesh)
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

  // 8) Click-to-select + open sidebar using MUSCLE_INFO
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

      // Open sidebar with the clicked muscle if we can match it
      const meshName = (mesh.name || '').toLowerCase();
      const key = Object.keys(MUSCLE_INFO).find(k => meshName.includes(k));
      if (key) openSidebarWith(key);
    }
  });

  // 9) Search (simple & reliable)
  const searchInput = document.getElementById('muscleSearch');
  const resultsList = document.getElementById('muscleResults');

  // compact index (forgiving contains search)
  const SEARCH_INDEX = Object.entries(MUSCLE_INFO).map(([key, m]) => ({
    key,
    title: m.title,
    hay: [key, m.title, (m.title || '').replace(/\s+/g, '')].join(' ').toLowerCase()
  }));

  function clearResults(){
    resultsList.innerHTML = '';
    resultsList.style.display = 'none';
  }
  function renderResults(matches){
    if (!matches.length) {
      resultsList.innerHTML = `<li class="search-item" style="padding:0.5rem 0.75rem;opacity:.7;">No results</li>`;
      resultsList.style.display = 'block';
      return;
    }
    resultsList.innerHTML = matches.map((m,i)=>
      `<li class="search-item" data-key="${m.key}" data-idx="${i}" style="padding:0.5rem 0.75rem; border-bottom:1px solid #222; cursor:pointer; text-align:left; color:#e6e6e6;">${m.title}</li>`
    ).join('');
    resultsList.style.display = 'block';
  }
  function findMatches(q){
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return SEARCH_INDEX.filter(item => item.hay.includes(s)).slice(0,8);
  }

  if (searchInput && resultsList){
    resultsList.style.display = 'none';

    searchInput.addEventListener('input', (e) => {
      const matches = findMatches(e.target.value);
      renderResults(matches);
    });

    // Click a result
    resultsList.addEventListener('click', (e) => {
      const li = e.target.closest('li.search-item');
      if (!li || !li.dataset.key) return;
      openSidebarWith(li.dataset.key);
      clearResults();
    });

    // Enter opens best match automatically
    searchInput.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      const matches = findMatches(searchInput.value);
      if (matches.length) {
        openSidebarWith(matches[0].key);
        clearResults();
      }
    });

    // Click outside to close the list
    document.addEventListener('click', (e) => {
      if (!resultsList.contains(e.target) && e.target !== searchInput) {
        clearResults();
      }
    });
  }

  // 10) Handle resize for renderer/camera
  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  // 11) Animate
  (function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  })();
})();
