console.log('🔌 script.js loaded as ES module');

(async () => {
  // 1) Dynamic ES-module imports
  const THREE = await import('https://esm.sh/three@0.153.0');
  const { OBJLoader } = await import('https://esm.sh/three@0.153.0/examples/jsm/loaders/OBJLoader.js');
  const { OrbitControls } = await import('https://esm.sh/three@0.153.0/examples/jsm/controls/OrbitControls.js');

  // 2) Data map for muscles
  const MUSCLE_INFO = {
    pec: {
      title: 'Pectoralis Major',
      img: 'IMG_4191.PNG',
      description:
        'Located beneath the breast tissue, the pectoralis major is responsible for flexion, adduction, and rotation of the shoulder joint.',
      function:
        'Primarily responsible for flexion, adduction, and internal rotation of the humerus.',
      exercises: ['Bench Press', 'Push-Ups', 'Chest Fly']
    },
    deltoid: {
      title: 'Deltoid',
      img: 'Screenshot 2025-05-27 at 12.16.11 PM.png',
      description:
        'The deltoid caps the shoulder, enabling arm abduction and stabilization when lifting. It is comprised of three heads: the anterior (front), medial (side/lateral), and posterior (back).',
      function:
        'Abduction, flexion, and extension of the shoulder joint.',
      exercises: ['Lateral Raise', 'Overhead Press', 'Front Raise']
    },
    
    tricep: {
      title: 'Tricep Brachialis',
      img: '400px-Long_head_of_triceps_brachii_muscle_-_Kenhub.png',
      description:
        'The tricep is comrpised of three heads, the ',
      function:
        'Abduction, flexion, and extension of the shoulder joint.',
      exercises: ['Lateral Raise', 'Overhead Press', 'Front Raise']
    },
    bicep: {
      title: 'Bicep Brachii',
      img: 'biceps_intro.jpg',
      description:
        'The tricep is comrpised of three heads, the ',
      function:
        'Abduction, flexion, and extension of the shoulder joint.',
      exercises: ['Lateral Raise', 'Overhead Press', 'Front Raise']
    },

    latissimus: {
      title: 'Latissimus Dorsi',
      img: 'biceps_intro.jpg',
      description:
        'The tricep is comrpised of three heads, the ',
      function:
        'Abduction, flexion, and extension of the shoulder joint.',
      exercises: ['Lateral Raise', 'Overhead Press', 'Front Raise']
    },
    trapezius: {
      title: 'Trapezius',
      img: 'trapeze.jpg',
      description:
        'The trapezius muscle, often called the "traps," ',
      function:
        'Abduction, flexion, and extension of the shoulder joint.',
      exercises: 
        ['Shoulder Shrugs', 
        'Face Pulls', 
        'Bent Rows']
    },
    // add additional muscles here
  };


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

  // 4) Loaders & state
  const texLoader  = new THREE.TextureLoader();
  const objLoader  = new OBJLoader();
  const raycaster  = new THREE.Raycaster();
  const pointer    = new THREE.Vector2();
  let model        = null;
  let texturesLoaded = false;

  // Helper to apply texture
  function applyTexture(url) {
    texLoader.load(
      url,
      tex => {
        texturesLoaded = true;
        if (!model) return;
        model.traverse(ch => {
          if (ch.isMesh) {
            ch.material.map = tex;
            ch.material.needsUpdate = true;
          }
        });
      },
      undefined,
      err => console.error('Texture load error', err)
    );
  }

  // initial Basic texture
  applyTexture('Ecorche_Muscles.png');

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
          ch.material = new THREE.MeshStandardMaterial({ roughness:0.6, metalness:0.1 });
        }
      });
      scene.add(obj);
    },
    xhr => console.log(`Model ${(xhr.loaded/xhr.total*100).toFixed(0)}% loaded`),
    err => console.error('OBJ load error', err)
  );

  // 6) Texture toggle
  document.querySelectorAll('input[name="texture"]').forEach(radio => {
    radio.addEventListener('change', e => {
      const url = e.target.value === 'advanced'
        ? 'Ecorche_Muscles_Color_Codes.png'
        : 'Ecorche_Muscles.png';
      applyTexture(url);
    });
  });

  // 7) Hover highlight
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
        if (currentHover) currentHover.material.emissive.setHex(0x000000);
        mesh.material.emissive.setHex(0x333333);
        currentHover = mesh;
      }
    } else if (currentHover) {
      currentHover.material.emissive.setHex(0x000000);
      currentHover = null;
    }
  });

  // 8) Click-to-sidebar using MUSCLE_INFO map
  container.addEventListener('pointerdown', e => {
    if (!model) return;
    const rect = container.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObject(model, true);
    if (hits.length) {
      const mesh = hits[0].object;
      const key = Object.keys(MUSCLE_INFO).find(k => mesh.name.toLowerCase().includes(k));
      if (key) {
        const info = MUSCLE_INFO[key];
        const sidebar = document.getElementById('muscleSidebar');
        // fill sidebar fields
        document.getElementById('muscleName').textContent = info.title;
        sidebar.querySelector('img').src = info.img;
        const descP = sidebar.querySelectorAll('.sidebar-section p')[0];
        descP.textContent = info.description;
        const funcP = sidebar.querySelectorAll('.sidebar-section h3')[0]
          .nextElementSibling;
        funcP.textContent = info.function;
        const ul = sidebar.querySelector('.sidebar-section ul');
        ul.innerHTML = info.exercises.map(ex => `<li>${ex}</li>`).join('');
        // open
        sidebar.classList.add('active');
        document.body.classList.add('sidebar-open');
      }
    }
  });

  // 9) Handle resize
  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  // 10) Animate
  (function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  })();
})();
