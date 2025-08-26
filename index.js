/* === UI CORE — no three.js, just panels/rail/resizer ===================== */
console.info('✅ UI core executing');

/* ===== MUSCLE DATA + RENDERERS + INDEX BUILDER ======================== */
/* 1) Data (extend this with all your real entries) */
window.MUSCLE_INFO = window.MUSCLE_INFO || {
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
      serratus:{ title: 'hey' },
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
      infraspinatus:{ title: 'Infraspinatus' },
      teres:{ title:'teres' },
      iliac:{ title:'iliac' },
      sternocleidomastoid:{ title:'Sternocleidomastiod' },
  
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
      brachialis:{ title:'Brachialis', img: 'brachialis.jpg', description: 'lol idkkk' },
      palmaris:{ title:'Palmaris Longus', img: 'palmaris.jpg', description: 'lol idkkk' },
      pronator:{ title:'Pronator Teres', img: 'pronator.jpg', description: 'lol idkkk' },
      flexor:{  title:'Pronator Teres', img: 'pronator.jpg', description: 'lol idkkk' },
  
      gluteus: {
        title: 'Gluteus Maximus (Glutes)',
        img: 'glutemax.jpg',
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
        function: 'Primary knee extension; rectus femoris also assists hip flexion.',
        exercises: ['Back/Front Squat', 'Leg Press', 'Leg Extension']
      },
      hamstrings: {
        title: 'Hamstrings',
        img: 'hamstrings.png',
        description:
          'Three muscles on the back of the thigh: biceps femoris, semitendinosus, and semimembranosus. They cross the hip and knee.',
        function: 'Hip extension (long heads) and knee flexion; help control tibial rotation.',
        exercises: ['Romanian Deadlift', 'Nordic Curl', 'Leg Curl']
      },
      pectineus:{ title: 'Pectineus' },
      adductors: {
        title: 'Hip Adductors',
        img: 'adductors.jpg',
        description:
          'Inner-thigh group (adductor magnus/longus/brevis, gracilis, pectineus). Important for change-of-direction and pelvic control.',
        function: 'Hip adduction; some fibers assist hip extension/flexion depending on angle.',
        exercises: ['Copenhagen Plank', 'Cable/Band Adductions', 'Sumo Squat']
      },
      sartorius: { title: 'Satorius' },
      gracilis:  { title: 'Gracilis' },
      tensor:    { title: 'Tensor fasciae' },
      gastrocnemius: {
        title: 'Gastrocnemius (Calves)',
        img: 'adductors.jpg',
        description:
          'Inner-thigh group (adductor magnus/longus/brevis, gracilis, pectineus). Important for change-of-direction and pelvic control.',
        function:
          'Hip adduction; some fibers assist hip extension/flexion depending on angle.',
        exercises: ['Copenhagen Plank', 'Cable/Band Adductions', 'Sumo Squat']
      },
      patella: { title:"Patella" },
      soleus:  { title:'Soleus' },
      tibia:   { title:"Tibia" },
      fibula:  { title:"Fibula" },
      gracilis:{ title:'Gracilis' },
    };
    // …add your full list here; you can keep aliases to improve 3D name matching.
  
  /* 2) Renderers for the tab content */
  function renderMuscleInfo(info){
    const $ = (id)=>document.getElementById(id);
    ($('muscleName')||{}).textContent = info.title || 'Muscle';
    const img = $('muscleImage');
    if (img){
      if (info.img){ img.src = info.img; img.alt = `${info.title} illustration`; img.style.display='block'; }
      else { img.removeAttribute('src'); img.alt=''; img.style.display='none'; }
    }
    const desc = $('info-desc'); if (desc) desc.textContent = info.description || 'Description coming soon.';
    const head = $('info-head'); if (head) head.textContent = info.head || '';
    const func = $('info-func'); if (func) func.textContent = info.function || '';
  }
  function renderMuscleExercises(info){
    const ul = document.getElementById('exerciseList');
    if (!ul) return;
    ul.innerHTML = (info.exercises||[]).map(x=>`<li>${x}</li>`).join('') || `<li>No exercises yet.</li>`;
  }
  
  /* 3) Open the info panel for a given key */
  window.openSidebarWith = function(key){
    const info = (window.MUSCLE_INFO || {})[key];
    // If missing, synthesize a readable title so the page still opens.
    const fallback = (k)=>({ title: k.replace(/[_-]/g,' ').replace(/\b\w/g,m=>m.toUpperCase()), description:'Coming soon.' });
    const data = info || fallback(key);
  
    renderMuscleInfo(data);
    renderMuscleExercises(data);
  
    // Show panel and default to About tab
    document.body.classList.remove('panel-closed');
    document.getElementById('mm-panel')?.setAttribute('aria-hidden','false');
    document.getElementById('mmPanelToggle')?.setAttribute('aria-expanded','true');
    document.getElementById('panel-info')?.classList.remove('is-hidden');
    document.getElementById('panel-exercises')?.classList.add('is-hidden');
  
    // Let the viewer know (to highlight/zoom)
    window.dispatchEvent(new CustomEvent('mm:selected', { detail:{ name:key }}));
  };

  /* === Tabs: auto-wire by data-panel / aria-controls ===================== */
(function tabsAutoWire(){
    document.querySelectorAll('.tabs').forEach(tabsEl => {
      const buttons   = tabsEl.querySelectorAll('.tab');
      const underline = tabsEl.querySelector('.tab-underline');
      const panels    = new Map();
  
      tabsEl.setAttribute('role','tablist');
  
      buttons.forEach(btn => {
        const targetId = btn.dataset.panel || btn.getAttribute('aria-controls');
        const panel = targetId ? document.getElementById(targetId) : null;
        if (panel) panels.set(btn, panel);
        btn.setAttribute('role','tab');
        if (targetId) btn.setAttribute('aria-controls', targetId);
        btn.setAttribute('tabindex','-1');
      });
  
      function positionUnderline(btn){
        if (!underline || !btn) return;
        underline.style.width = `${btn.offsetWidth}px`;
        underline.style.transform = `translateX(${btn.offsetLeft}px)`;
      }
  
      function activate(btn){
        buttons.forEach(b => {
          const active = b === btn;
          const panel  = panels.get(b);
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-selected', String(active));
          b.setAttribute('tabindex', active ? '0' : '-1');
          if (panel){
            panel.hidden = !active;
            panel.classList.toggle('is-hidden', !active); // harmless if you use this class
          }
        });
        positionUnderline(btn);
      }
  
      // events
      buttons.forEach(btn => btn.addEventListener('click', () => activate(btn)));
      window.addEventListener('resize', () => {
        const current = tabsEl.querySelector('.tab.is-active') || buttons[0];
        positionUnderline(current);
      });
  
      // initial state: use .is-active if present, else first tab
      activate(tabsEl.querySelector('.tab.is-active') || buttons[0]);
    });
  })();
  
  
  /* 4) Build the muscle index (list + search). If the viewer later
        sends a full mesh-name list, we’ll merge any missing entries. */
  (function buildIndex(){
    const UL = document.getElementById('mi-list');
    const Q  = document.getElementById('mi-search');
    if (!UL) return;
  
    const titleOf = (k,m)=>(m?.title)||k.replace(/[_-]/g,' ').replace(/\b\w/g,m=>m.toUpperCase());
    function allItems(){
      return Object.entries(window.MUSCLE_INFO||{})
        .map(([key,m]) => ({ key, title: titleOf(key,m) }))
        .sort((a,b)=>a.title.localeCompare(b.title));
    }
  
    function render(list){
      UL.innerHTML = '';
      const frag = document.createDocumentFragment();
      for (const it of list){
        const li  = document.createElement('li');
        const btn = document.createElement('button');
        btn.className = 'mm-list-item';
        btn.type = 'button';
        btn.textContent = it.title;
        btn.dataset.key = it.key;
        btn.addEventListener('click', () => openSidebarWith(it.key));
        li.appendChild(btn); frag.appendChild(li);
      }
      UL.appendChild(frag);
    }
  
    function filter(q, items){
      const s = q.trim().toLowerCase();
      return !s ? items : items.filter(n => n.title.toLowerCase().includes(s));
    }
  
    // initial draw
    let ITEMS = allItems();
    render(ITEMS);
  
    // search
    Q?.addEventListener('input',(e)=>render(filter(e.target.value, ITEMS)));
  
    // keep highlight in sync
    addEventListener('mm:selected',(e)=>{
      const key = e.detail?.name;
      UL.querySelectorAll('.mm-list-item.is-active').forEach(el => el.classList.remove('is-active'));
      const match = [...UL.querySelectorAll('.mm-list-item')].find(b => b.dataset.key === key);
      match?.classList.add('is-active');
      match?.scrollIntoView({ block:'nearest', behavior:'smooth' });
    });
  
    // Viewer can send us all mesh names; we merge any we’re missing and rebuild once.
    window.addEventListener('mm:meshList', (e) => {
      const names = e.detail?.names || [];
      let added = 0;
      for (const raw of names){
        const k = raw.toLowerCase().replace(/[^a-z]/g,''); // normalized key
        if (!window.MUSCLE_INFO[k]){
          window.MUSCLE_INFO[k] = { title: titleOf(k) };
          added++;
        }
      }
      if (added){
        ITEMS = allItems();
        render(ITEMS);
        console.info(`📚 index merged ${added} new item(s) from model`);
      }
    });
  
    console.info(`📚 muscle index rendered: ${ITEMS.length} items`);
  })();
  

(() => {
  const root  = document.documentElement;
  const body  = document.body;
  const panel = document.getElementById('mm-panel');       // info sidebar

  /* ---------------- panel width helpers (CSS var: --mm-panel-w) --------- */
  function varPx(name, fallback=0){
    const v = getComputedStyle(root).getPropertyValue(name).trim();
    if (!v) return fallback;
    if (v.endsWith('px')) return parseFloat(v);
    if (v.endsWith('vw')) return innerWidth * (parseFloat(v)/100);
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : fallback;
  }
  const minPx = () => varPx('--mm-panel-min', 260);
  const maxPx = () => varPx('--mm-panel-max', Math.round(innerWidth * 0.5));

  function setPanelWidth(px){
    const w = Math.max(minPx(), Math.min(maxPx(), px|0));
    root.style.setProperty('--mm-panel-w', `${w}px`);
    try { localStorage.setItem('mm.panel.width', `${w}px`); } catch {}
    dispatchEvent(new Event('resize'));
  }

  // expose for quick console tests: __mm.setPanelWidth(520)
  window.__mm = Object.assign(window.__mm || {}, { setPanelWidth });

  // restore saved width (if any)
  try { const saved = localStorage.getItem('mm.panel.width'); if (saved) root.style.setProperty('--mm-panel-w', saved); } catch {}

  /* ---------------- info panel open/close (hamburger) ------------------- */
  (function(){
    const toggle = document.getElementById('mmPanelToggle');
    const isOpen = () => !body.classList.contains('panel-closed');
    function setOpen(open){
      body.classList.toggle('panel-closed', !open);
      panel?.setAttribute('aria-hidden', String(!open));
      toggle?.setAttribute('aria-expanded', String(open));
    }
    let startOpen = !body.classList.contains('panel-closed');
    try { const saved = localStorage.getItem('mm.panel.open'); if (saved) startOpen = saved === '1'; } catch {}
    setOpen(startOpen);

    toggle?.addEventListener('click', () => {
      const next = !isOpen();
      setOpen(next);
      try { localStorage.setItem('mm.panel.open', next ? '1' : '0'); } catch {}
    });
    document.querySelector('#mm-panel .close-btn')?.addEventListener('click', () => setOpen(false));
    document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') setOpen(false); });
  })();

  /* ---------------- late-bound resizer binding -------------------------- */
  function bindResizer(){
    const handle = document.getElementById('mm-panel-resizer');
    if (!handle || !panel) return console.warn('no #mm-panel-resizer or #mm-panel');

    let startX = 0, startW = 0, active = false;

    function onDown(e){
      if (body.classList.contains('panel-closed')) return;
      active = true;
      startX = e.clientX;
      startW = panel.getBoundingClientRect().width;
      panel.classList.add('is-resizing');
      handle.setPointerCapture?.(e.pointerId);
      addEventListener('pointermove', onMove);
      addEventListener('pointerup', onUp, { once:true });
      e.preventDefault?.();
    }
    function onMove(e){ if (active) setPanelWidth(startW + (e.clientX - startX)); }
    function onUp(){ active = false; panel.classList.remove('is-resizing'); removeEventListener('pointermove', onMove); }

    handle.addEventListener('pointerdown', onDown);

    // keyboard nudge (←/→)
    handle.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight'){
        const cur = panel.getBoundingClientRect().width;
        setPanelWidth(cur + (e.key === 'ArrowRight' ? 24 : -24));
        e.preventDefault();
      }
    });

    console.info('🟦 resizer bound');
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindResizer, { once:true });
  } else { bindResizer(); }

  /* ---------------- muscle index toggle (middle rail) ------------------- */
  (function(){
    const idxPanel = document.getElementById('muscle-index');
    const btn      = document.getElementById('muscleIndexToggle');
    if (!btn || !idxPanel) return;

    const setOpen = (open) => {
      body.classList.toggle('index-open', open);
      body.classList.toggle('index-closed', !open);
      idxPanel.setAttribute('aria-hidden', String(!open));
      btn.setAttribute('aria-expanded', String(open));
      btn.dataset.active = open ? 'true' : 'false';
      try { localStorage.setItem('mm.index.open', open ? '1' : '0'); } catch {}
      dispatchEvent(new Event('resize'));
    };
    let open = false;
    try { const saved = localStorage.getItem('mm.index.open'); if (saved) open = saved === '1'; } catch {}
    setOpen(open);

    btn.addEventListener('click', () => setOpen(!body.classList.contains('index-open')));
    document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') setOpen(false); });
  })();

  /* ---------------- muscle index builder (from MUSCLE_INFO) ------------- */
  function buildMuscleIndex(){
    const UL = document.getElementById('mi-list');
    const Q  = document.getElementById('mi-search');
    if (!UL) return; // might be on another page

    // Use global MUSCLE_INFO if provided by your app; else a tiny sample so you see something
    const SRC = (typeof window.MUSCLE_INFO === 'object' && window.MUSCLE_INFO) ? window.MUSCLE_INFO : {
      pectoralis:{ title:'Pectoralis Major' },
      deltoid:{ title:'Deltoid' },
      bicep:{ title:'Biceps Brachii' },
      tricep:{ title:'Triceps Brachii' },
      quadriceps:{ title:'Quadriceps' },
      hamstrings:{ title:'Hamstrings' },
    };

    const ALL = Object.entries(SRC).map(([key, m]) => ({
      key,
      title: (m && (m.title || m.name || key))
    })).sort((a,b) => a.title.localeCompare(b.title));

    function render(list){
      UL.innerHTML = '';
      const frag = document.createDocumentFragment();
      for (const it of list){
        const li  = document.createElement('li');
        const btn = document.createElement('button');
        btn.className = 'mm-list-item';
        btn.type = 'button';
        btn.textContent = it.title;
        btn.dataset.key = it.key;
        btn.addEventListener('click', () => {
          setActive(it.key);
          if (window.openSidebarWith) window.openSidebarWith(it.key);
          dispatchEvent(new CustomEvent('mm:select', { detail:{ name: it.key } }));
        });
        li.appendChild(btn); frag.appendChild(li);
      }
      UL.appendChild(frag);
    }
    function setActive(key){
      UL.querySelectorAll('.mm-list-item.is-active').forEach(el => el.classList.remove('is-active'));
      const match = [...UL.querySelectorAll('.mm-list-item')].find(b => b.dataset.key === key);
      match?.classList.add('is-active');
      match?.scrollIntoView({ block:'nearest', behavior:'smooth' });
    }

    render(ALL);

    Q?.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      render(!q ? ALL : ALL.filter(n => n.title.toLowerCase().includes(q)));
    });

    addEventListener('mm:selected', (e) => setActive(e.detail?.name));

    console.info(`📚 muscle index rendered: ${ALL.length} items`);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildMuscleIndex, { once:true });
  } else { buildMuscleIndex(); }
})();
