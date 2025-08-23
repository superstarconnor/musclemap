
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

(function () {
  const body   = document.body;
  const panel  = document.getElementById('mm-panel');
  const toggle = document.getElementById('mmPanelToggle');

  const isOpen = () => !body.classList.contains('panel-closed');

  function setOpen(open) {
    body.classList.toggle('panel-closed', !open);
    panel.setAttribute('aria-hidden', String(!open));
    if (toggle) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close muscle info panel' : 'Open muscle info panel');
    }
    try { localStorage.setItem('mm.panel.open', open ? '1' : '0'); } catch {}
  }

  // initial state: honor saved pref or current body class
  let open = !body.classList.contains('panel-closed');
  try {
    const saved = localStorage.getItem('mm.panel.open');
    if (saved === '0' || saved === '1') open = saved === '1';
  } catch {}
  setOpen(open);

  toggle?.addEventListener('click', () => setOpen(!isOpen()));
  document.querySelector('#mm-panel .close-btn')?.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
})();


  // Small prefs keys
  const TEX_KEY = 'mm_tex_choice';          // 'basic' | 'advanced'
  
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

  const tabInfo        = document.getElementById('tab-info');
  const tabExercises  = document.getElementById('tab-exercises');
  const panelInfo     = document.getElementById('panel-info');
  const panelExercises= document.getElementById('panel-exercises');
  const underline     = document.querySelector('.tab-underline');

  function positionUnderline(activeBtn){
    if (!activeBtn || !underline) return;
    const x = activeBtn.offsetLeft;
    const w = activeBtn.offsetWidth;
    underline.style.width = `${w}px`;
    underline.style.transform = `translateX(${Math.round(x)}px)`;
  }

  function showTab(which){
    const isInfo = which === 'info';
    tabInfo?.classList.toggle('is-active', isInfo);
    tabExercises?.classList.toggle('is-active', !isInfo);
    tabInfo?.setAttribute('aria-selected', String(isInfo));
    tabExercises?.setAttribute('aria-selected', String(!isInfo));
    if (panelInfo)      { panelInfo.hidden = !isInfo; panelInfo.classList.toggle('is-hidden', !isInfo); }
    if (panelExercises) { panelExercises.hidden = isInfo; panelExercises.classList.toggle('is-hidden', isInfo); }
    positionUnderline(isInfo ? tabInfo : tabExercises);
  }

  window.addEventListener('load',  () => positionUnderline(tabInfo));
  window.addEventListener('resize',() => positionUnderline(tabInfo?.classList.contains('is-active') ? tabInfo : tabExercises));
  tabInfo?.addEventListener('click',      () => showTab('info'));
  tabExercises?.addEventListener('click', () => showTab('exercises'));

  function renderMuscleInfo(info){
    document.getElementById('muscleName').textContent = info.title || 'Muscle';
  
    const img = document.getElementById('muscleImage');
    if (img){
      if (info.img){ img.src = info.img; img.alt = `${info.title} illustration`; img.style.display='block'; }
      else { img.removeAttribute('src'); img.alt=''; img.style.display='none'; }
    }
  
    const d = document.getElementById('info-desc'); if (d) d.textContent = info.description || '';
  
    // NEW: Heads
    const h = document.getElementById('info-head');
    const headWrap = h ? h.closest('.mm-panel-section') : null;
    const headSep = headWrap ? headWrap.previousElementSibling : null; // the mm-sep2 just above the Heads section
    if (h){
      const txt = (info.head || '').trim();
      if (txt){
        h.textContent = txt;
        if (headWrap) headWrap.classList.remove('is-hidden');
        if (headSep && headSep.classList?.contains('mm-sep2')) headSep.style.display = '';
      } else {
        h.textContent = '';
        if (headWrap) headWrap.classList.add('is-hidden');
        if (headSep && headSep.classList?.contains('mm-sep2')) headSep.style.display = 'none';
      }
    }
  
    const f = document.getElementById('info-func'); if (f) f.textContent = info.function || '';
  }
  

  function renderMuscleExercises(info){
    const list = document.getElementById('exerciseList');
    if (!list) return;
    list.innerHTML = (info.exercises || []).map(ex => `<li>${ex}</li>`).join('') || `<li>No exercises yet.</li>`;
  }

  // 2) Data map for muscles
  const MUSCLE_INFO = {
    pectoralis: {
      title: 'Pectoralis Major (Pecs)',
      description:
        "Derived from Latin 'pectus,' meaning breast, your pectoralis major(s) are located just beneath the breast tissue. Together with the pectoralis minor, these muscles make up what we call the chest.",
      img: 'pecpic.jpg',
      head:
        'The pectoralis major(s) are made up of two heads: the clavicular (attaches to the clavicle) and the sternal (attaches to the sternum).',
      function: 'These muscles are responsible for flexion, adduction, and internal rotation of the shoulder joint.',
      exercises: ['- Bench press; flat or incline.', '- Traditional push-ups.', '- Fly variations -  such as the cable fly, dumbell fly, or pec-dec machine.']
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
      title: 'Rectus Abdominis (Abs)',
      img: 'abs.jpg',
      description:
        'Informally known as just "abs," the rectus abdominis a long muscle of the anterior abdominal wall. It extends from the rib cage all the way to the pubic bone. Unlike other muscles, abs only become visible below a certian body fat percentage.',
      function:
        'Hip extension (long heads) and knee flexion; help control tibial rotation.',
      exercises: ['Romanian Deadlift', 'Nordic Curl', 'Leg Curl']
    },

    
    latissimus: {
      title: 'Latissimus Dorsi (Lats)',
      img: 'biceps_intro.jpg',
      description:
        'The latissimus dorsi—“lats”—are the widest upper-body muscle and the key to the appearance of a powerful V-taper. Besides the trapezius, the lats make up most of the upper back.',
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
    infraspinatus:{
      title: 'Infraspinatus'
    },
    teres:{
      title:'teres',
    },
    iliac:{
      title:'iliac'
    },
    sternocleidomastoid:{
      title:'Sternocleidomastiod'
    },


    deltoid: {
      title: 'Deltoid',
      img: 'delt.jpg',
      description:
        "When a person says they're training their shoulders, they're really referring their deltoids. Named after the Greek letter delta (Δ), deltoids are a triangular muscle that cap the shoulder.",
      head:
        'The deltoid is comprised of three equally-sized heads: anterior (front), lateral (side), and posterior (rear).',
      function:
        'Abduction, flexion, and extension of the shoulder joint. Each head can be biased with raises in its direction (e.g., lateral raises for lateral delts).',
      exercises: ['- Shoulder raise variations, such as a front or lateral raise.','Note: There is no rear delt raise due to the limited range of motion of the rotator cuff. However, a reverse delt fly will bias the rear delts while also working parts of the back.', '- Overhead Press', '- Front Raise']
    },
    tricep: {
      title: 'Tricep Brachii',
      img: '400px-Long_head_of_triceps_brachii_muscle_-_Kenhub.png',
      description:
        'Like the bicep, the tricep is named for its number of heads. It makes up roughly two-thirds of the upper arm mass—crucial for thick arms.',
        head: 'The triceps are composed of three heads: the long and medial heads, located on the back of the arm, and the lateral head, which is the only head that crosses the arm laterally.',
      function: 'Elbow extension; the long head also assists in shoulder extension and adduction.',
      exercises: ['Overhead Cable Extension', 'Skullcrushers', 'Cable Pulldown']
    },
    bicep: {
      title: 'Bicep Brachii',
      img: 'biceps_intro.jpg',
      description:
        "Aptly named, the bicep has two heads sitting at the front of the arm. And yes—it looks great during curls.",
        head:'The bicep has two simply-named heads: the long, making up the outer half of the bicep, and the short head, making up the inner half toward your torso.',
      function: 'Elbow flexion and forearm supination; assists in shoulder flexion.',
      exercises: ['Barbell Curl', 'Dumbbell Curl', 'Hammer Curl']
    },
    brachioradialis: {
      title: 'Brachioradialis',
      img: 'brachioradialis.jpg',
      description: 'The Brachioradialis is located in the lateral part of the posterior forearm. It comprises the radial group of forearm muscles, which belong to the superficial layer of posterior forearm muscles. ',
      head: 'This muscle does not have multiple heads,rather, it is one muscle.',
      function: 'Forearm pronation; assists elbow flexion.',
      exercises: ['DB/Hammer Pronation', 'Cable Pronation', 'Band Pronation']
    },
    brachialis:{
        title:'Brachialis',
        img: 'brachialis.jpg',
        description: 'lol idkkk',
    },
    palmaris:{
        title:'Palmaris Longus',
        img: 'palmaris.jpg',
        description: 'lol idkkk',
    },
    pronator:{
        title:'Pronator Teres',
        img: 'pronator.jpg',
        description: 'lol idkkk',
    },
    flexor:{
      title:'Pronator Teres',
      img: 'pronator.jpg',
      description: 'lol idkkk',
    },


    gluteus: {
      title: 'Gluteus Maximus (Glutes)',
      img: 'glutemax.jpg', // swap to your actual asset
      description:
        'Your glutes are the largest muscle group in the body. The gluteus maximus gives the hips their power for standing up, climbing, and sprinting, while the smaller gluteus medius/minimus help keep the pelvis stable when you walk or stand on one leg.',
      function:
        'Primary hip extension and external rotation (gluteus maximus). The gluteus medius/minimus assist with hip abduction and internal/external rotation and stabilize the pelvis during gait.',
      exercises: ['Hip Thrust / Glute Bridge', 'Romanian Deadlift', 'Bulgarian Split Squat']
    },
    quadriceps: {
      title: 'Quadriceps Femoris (Quads)',
      img: 'quads.png',
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
    pectineus:{
      title: 'Pectineus'
    },
    adductors: {
      title: 'Hip Adductors',
      img: 'adductors.jpg',
      description:
        'Inner-thigh group (adductor magnus/longus/brevis, gracilis, pectineus). Important for change-of-direction and pelvic control.',
      function:
        'Hip adduction; some fibers assist hip extension/flexion depending on angle.',
      exercises: ['Copenhagen Plank', 'Cable/Band Adductions', 'Sumo Squat']
    },
    sartorius: {
      title: 'Satorius',
    },
 
    gracilis: {
      title: 'Gracilis',
    },
    tensor: {
      title: 'Tensor fasciae',
    },
    gastrocnemius: {
      title: 'Gastrocnemius (Calves)',
      img: 'adductors.jpg',
      description:
        'Inner-thigh group (adductor magnus/longus/brevis, gracilis, pectineus). Important for change-of-direction and pelvic control.',
      function:
        'Hip adduction; some fibers assist hip extension/flexion depending on angle.',
      exercises: ['Copenhagen Plank', 'Cable/Band Adductions', 'Sumo Squat']
    },
    patella: {
      title:"Patella",
    },
    soleus: {
      title:'Soleus',
    },
    tibia: {
      title:"Tibia",
    },
    fibula: {
      title:"Fibula",
    },
    gracilis: {
      title:'Gracilis',
    },
  };

function openSidebarWith(key) {
  const info = MUSCLE_INFO[key];
  if (!info) return;

  // populate
  renderMuscleInfo(info);
  renderMuscleExercises(info);

  // open the panel
  document.body.classList.remove('panel-closed');
  document.getElementById('mm-panel')?.setAttribute('aria-hidden', 'false');
  document.getElementById('mmPanelToggle')?.setAttribute('aria-expanded', 'true');

    showTab('info');
    // nudge underline after layout
    requestAnimationFrame(() => positionUnderline(document.getElementById('tab-info')));
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

    // Click a result (now highlights + zooms)
    resultsList.addEventListener('click', (e) => {
      const li = e.target.closest('li.search-item');
      if (!li || !li.dataset.key) return;
      // #3 highlight same as click
      selectMeshByKey(li.dataset.key);
      // open panel
      openSidebarWith(li.dataset.key);
      // #4 auto-zoom
      autoZoomToKey(li.dataset.key, { duration: 900, fitRatio: 1.35 });
      clearResults();
    });

    // Enter opens best match automatically (with highlight + zoom)
    searchInput.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      const matches = findMatches(searchInput.value);
      if (matches.length) {
        const key = matches[0].key;
        selectMeshByKey(key);
        openSidebarWith(key);
        autoZoomToKey(key, { duration: 900, fitRatio: 1.35 });
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
