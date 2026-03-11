// ============================
// CONFIGURACIÓ INICIAL
// ============================

const imatgeTauler = "Imatges/tauler.png";
let bloquejat = false;

const posicionsInicials = {};
const posicionsOcupades = new Set();

const PECES_CORRECTES = [
  "equitat",
  "aprenentatge",
  "itineraris_personalitzats",
  "reptes",
  "acompanyament",
  "diversitat",
  "inclusio",
  "formacio",
];

// ============================
// ZONES OBJECTIU
// ============================

const TOLERANCIA = 50;

const zonesObjectiu = {
  equitat: [
    { x: 512,  y: 317 },
    { x: 783, y: 317 },
    { x: 925, y: 452 },
    { x: 374, y: 452 }
  ],
  aprenentatge: [
    { x: 512,  y: 317 },
    { x: 783, y: 317 },
    { x: 925, y: 452 },
    { x: 374, y: 452 }
  ],
  diversitat: [
    { x: 512,  y: 317 },
    { x: 783, y: 317 },
    { x: 920, y: 452 },
    { x: 374, y: 452 }
  ],
  reptes: [
    { x: 512,  y: 317 },
    { x: 783, y: 317 },
    { x: 925, y: 452 },
    { x: 374, y: 452 }
  ],
  acompanyament: [
    { x: 512, y: 515 },
    { x: 716, y: 515 }
  ],
  itineraris_personalitzats: [
    { x: 512, y: 515 },
    { x: 716, y: 515 }
  ],
  inclusio: [
    { x: 651, y: 317 },
  ],
  formacio: [
    { x: 497, y: 169 },
  ]
};

// ============================
// GUARDAR POSICIONS INICIALS
// ============================

function guardarPosicionsInicials() {
  document.querySelectorAll(".peça").forEach(peça => {
    posicionsInicials[peça.id] = {
      left: peça.offsetLeft,
      top:  peça.offsetTop,
    };
  });
}

// ============================
// TORNAR PEÇA AL LLOC D'INICI
// ============================

function tornarAPosicioInicial(peça, ambAnimacio = true) {
  const pos = posicionsInicials[peça.id];
  if (!pos) return;

  if (ambAnimacio) {
    peça.style.transition = 'left 0.4s ease, top 0.4s ease';
    setTimeout(() => { peça.style.transition = ''; }, 450);
  }

  peça.style.left = pos.left + 'px';
  peça.style.top  = pos.top  + 'px';
  peça.style.zIndex = 1; 
}

// ============================
// OBTENIR ESCALA ACTUAL
// ============================

function obtenirEscala() {
  const contingut = document.getElementById('contingut-principal');
  const transform = contingut.style.transform;
  const match = transform.match(/scale\(([^)]+)\)/);
  return match ? parseFloat(match[1]) : 1;
}

// ============================
// AJUDA DE TAULER
// ============================

function teEncavalcamentAmbTauler(peça) {
  const tr = document.getElementById('tauler').getBoundingClientRect();
  const pr = peça.getBoundingClientRect();

  return pr.left < tr.right  &&
         pr.right > tr.left  &&
         pr.top < tr.bottom  &&
         pr.bottom > tr.top;
}

function actualitzarAjuda(peça) {
  const ajuda = document.getElementById('ajuda');
  if (teEncavalcamentAmbTauler(peça)) {
    ajuda.classList.add('visible');
  } else {
    ajuda.classList.remove('visible');
  }
}

// ============================
// COMPROVAR SI LA PEÇA ÉS CORRECTA
// ============================

function obtenirPosicionsObjectiu(idPeça) {
  return zonesObjectiu[idPeça] || null;
}

function comprovarPeça(peça) {
  const id = peça.id;

  if (!PECES_CORRECTES.includes(id)) {
    mostrarFeedbackError(peça);
    tornarAPosicioInicial(peça);
    setTimeout(() => {
      peça.classList.add('peca-incorrecta'); 
    }, 450);
    return false;
  }

  const objectius = obtenirPosicionsObjectiu(id);
  if (!objectius) return false;

  const peçaX = peça.offsetLeft;
  const peçaY = peça.offsetTop;

  for (let objectiu of objectius) {
    const clau = `${objectiu.x},${objectiu.y}`;

    if (posicionsOcupades.has(clau)) continue;

    const distancia = Math.sqrt(
      Math.pow(peçaX - objectiu.x, 2) +
      Math.pow(peçaY - objectiu.y, 2)
    );

    console.log(`[${id}] Posició: (${Math.round(peçaX)}, ${Math.round(peçaY)}) | Objectiu: (${Math.round(objectiu.x)}, ${Math.round(objectiu.y)}) | Distància: ${Math.round(distancia)}px`);

    if (distancia <= TOLERANCIA) {
      ferSnap(peça, objectiu.x, objectiu.y);
      return true;
    }
  }

  mostrarFeedbackError(peça);
  tornarAPosicioInicial(peça);
  return false;
}

function ferSnap(peça, x, y) {
  const clau = `${x},${y}`;
  posicionsOcupades.add(clau);

  peça.style.transition = 'left 0.3s ease, top 0.3s ease';
  peça.style.left = x + 'px';
  peça.style.top  = y + 'px';
  peça.style.cursor = 'default';
  peça.style.zIndex = 10;
  peça.classList.add('peca-col-locada');
  peça.dataset.col_locada = 'true';

  setTimeout(() => { peça.style.transition = ''; }, 350);
  setTimeout(() => comprovarVictoria(), 400);
}

function mostrarFeedbackError(peça) {
  peça.classList.add('peca-error');
  setTimeout(() => peça.classList.remove('peca-error'), 500);
}

// ============================
// COMPROVAR VICTÒRIA
// ============================

function comprovarVictoria() {
  const pecesCol_locades = document.querySelectorAll('.peça[data-col_locada="true"]');
  const ids = Array.from(pecesCol_locades).map(p => p.id);
  const totesCol_locades = PECES_CORRECTES.every(id => ids.includes(id));

  if (totesCol_locades) {
    setTimeout(mostrarVictoria, 600);
  }
}

// ============================
// INICIAR JOC
// ============================

function iniciarJoc() {
  posicionsOcupades.clear();

  document.getElementById('titol-principal').style.visibility = 'visible';
  document.getElementById('subtitol').style.visibility = 'visible';
  document.getElementById('titol-aconseguit').classList.remove('visible');
  document.getElementById('subtitol-aconseguit').style.visibility = 'hidden';
  document.querySelector('.contenidor-joc').style.opacity = '1';
  document.getElementById('aillament').style.visibility = 'visible';
  document.getElementById('competicio').style.visibility = 'visible';

  document.querySelectorAll('.foto-final').forEach(foto => {
    foto.style.animation = 'none';
    foto.style.opacity = '0';
  });

  const victoria = document.getElementById('victoria');
  victoria.classList.remove('mostrar');
  bloquejat = false;

  const peces = document.querySelectorAll(".peça");
  peces.forEach(peça => {
    peça.dataset.col_locada = 'false';
    peça.classList.remove('peca-col-locada', 'peca-error', 'peca-incorrecta');
    peça.style.cursor = 'grab';
    peça.style.zIndex = '';
    peça.style.visibility = 'visible';

    if (posicionsInicials[peça.id]) {
      tornarAPosicioInicial(peça, true);
    } else {
      peça.style.transition = '';
      peça.style.left = '';
      peça.style.top  = '';
    }
  });

  if (Object.keys(posicionsInicials).length === 0) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        guardarPosicionsInicials();
        afegirEventsDrag();
      });
    });
  } else {
    afegirEventsDrag();
  }
}

// ============================
// EVENTS DRAG
// ============================

function afegirEventsDrag() {
  const peces = document.querySelectorAll(".peça");

  peces.forEach(peça => {
    const clone = peça.cloneNode(true);
    peça.parentNode.replaceChild(clone, peça);
    const p = document.getElementById(clone.id);

    let movent = false;
    let offsetX, offsetY;

    // ---- MOUSE ----
    p.addEventListener("mousedown", (e) => {
      if (bloquejat) return;
      if (p.dataset.col_locada === 'true') return;

      e.stopPropagation();
      movent = true;
      p.style.cursor = "grabbing";
      p.style.zIndex = 1000;

      const escala = obtenirEscala();
      offsetX = (e.clientX / escala) - p.offsetLeft;
      offsetY = (e.clientY / escala) - p.offsetTop;
    });

    document.addEventListener("mousemove", (e) => {
      if (!movent) return;
      const escala = obtenirEscala();
      p.style.left = (e.clientX / escala - offsetX) + "px";
      p.style.top  = (e.clientY / escala - offsetY) + "px";
      actualitzarAjuda(p);
    });

    document.addEventListener("mouseup", () => {
      if (!movent) return;
      movent = false;
      p.style.cursor = "grab";
      document.getElementById('ajuda').classList.remove('visible');
      comprovarPeça(p);
    });

    // ---- TOUCH ----
    p.addEventListener("touchstart", (e) => {
      if (bloquejat) return;
      if (p.dataset.col_locada === 'true') return;

      const touch = e.touches[0];

      e.stopPropagation();
      movent = true;
      p.style.zIndex = 1000;

      const escala = obtenirEscala();
      offsetX = (touch.clientX / escala) - p.offsetLeft;
      offsetY = (touch.clientY / escala) - p.offsetTop;
    }, { passive: true });

    document.addEventListener("touchmove", (e) => {
      if (!movent) return;
      e.preventDefault();
      const touch = e.touches[0];
      const escala = obtenirEscala();
      p.style.left = (touch.clientX / escala - offsetX) + "px";
      p.style.top  = (touch.clientY / escala - offsetY) + "px";
      actualitzarAjuda(p);
    }, { passive: false });

    document.addEventListener("touchend", () => {
      if (!movent) return;
      movent = false;
      document.getElementById('ajuda').classList.remove('visible');
      comprovarPeça(p);
    });
  });
}

// ============================
// MOSTRAR PANTALLA DE VICTÒRIA
// ============================

function mostrarVictoria() {
  const titol = document.getElementById('titol-principal');
  const subtitol = document.getElementById('subtitol');
  const aconseguit = document.getElementById('titol-aconseguit');
  const aillament = document.getElementById('aillament');
  const competicio = document.getElementById('competicio');
  const equitat = document.getElementById('equitat');
  const aprenentatge = document.getElementById('aprenentatge');
  const acompanyament = document.getElementById('acompanyament');
  const itineraris_personalitzats = document.getElementById('itineraris_personalitzats');
  const formacio = document.getElementById('formacio');
  const diversitat = document.getElementById('diversitat');
  const reptes = document.getElementById('reptes');
  const inclusio = document.getElementById('inclusio');

  titol.style.visibility = "hidden";
  subtitol.style.visibility = "hidden";

  aconseguit.classList.add('visible');
  document.getElementById('subtitol-aconseguit').style.visibility = 'visible';

  aillament.style.visibility = "hidden";
  competicio.style.visibility = "hidden";

  setTimeout(() => {
    document.querySelector('.contenidor-joc').style.opacity = "0";
    equitat.style.visibility = "hidden";
    aprenentatge.style.visibility = "hidden";
    acompanyament.style.visibility = "hidden";
    itineraris_personalitzats.style.visibility = "hidden";
    formacio.style.visibility = "hidden";
    diversitat.style.visibility = "hidden";
    reptes.style.visibility = "hidden";
    inclusio.style.visibility = "hidden";

    const fotos = document.querySelectorAll('.foto-final');
    fotos.forEach((foto, i) => {
      setTimeout(() => {
        foto.style.animation = 'apareixer 1s ease forwards';
      }, i * 300);
    });

  }, 3000);
}

// ============================
// PANTALLA STANDBY
// ============================

const pantallaStandby = document.getElementById('pantallaStandby');

pantallaStandby.addEventListener('click', () => {
  const pantalla = document.getElementById('pantallaStandby');
  const titol = document.getElementById('titol-principal');
  const subtitol = document.getElementById('subtitol');
  const aconseguit = document.getElementById('titol-aconseguit');
  const aillament = document.getElementById('aillament');
  const competicio = document.getElementById('competicio');

  pantalla.classList.add('amagar');
  document.body.classList.remove('joc-no-iniciat');

  titol.style.visibility = "visible";
  subtitol.style.visibility = "visible";
  aconseguit.classList.remove('visible');

  aillament.style.visibility = "visible";
  competicio.style.visibility = "visible";

  iniciarJoc();
  reiniciarTemporizador();
});

pantallaStandby.addEventListener('touchstart', (e) => {
  e.preventDefault();
  pantallaStandby.click();
}, { passive: false });

// ============================
// TEMPORITZADOR D'INACTIVITAT
// ============================

let temporizadorInactivitat;
const TEMPS_INACTIVITAT = 60000;

function reiniciarTemporizador() {
  clearTimeout(temporizadorInactivitat);
  temporizadorInactivitat = setTimeout(tornarAStandby, TEMPS_INACTIVITAT);
}

function tornarAStandby() {
  document.getElementById('pantallaStandby').classList.remove('amagar');
  document.body.classList.add('joc-no-iniciat');
  document.getElementById('victoria').classList.remove('mostrar');
  document.getElementById('ajuda').classList.remove('visible');
  document.querySelectorAll('.foto-final').forEach(foto => {
    foto.style.animation = 'none';
    foto.style.opacity = '0';
  });
  bloquejat = false;
}

document.addEventListener('click',      reiniciarTemporizador);
document.addEventListener('touchstart', reiniciarTemporizador, { passive: true });
document.addEventListener('mousemove',  reiniciarTemporizador);

// ============================
// ESCALAT RESPONSIVE
// ============================

function escalar() {
  const contingut = document.getElementById('contingut-principal');
  const scaleX = window.innerWidth / 1456;
  const scaleY = window.innerHeight / 816;
  const scale = Math.min(scaleX, scaleY);

  contingut.style.transform = `scale(${scale})`;
  contingut.style.left = ((window.innerWidth - 1456 * scale) / 2) + 'px';
  contingut.style.top  = ((window.innerHeight - 816 * scale) / 2) + 'px';
}

window.addEventListener('resize', escalar);
window.addEventListener('load', escalar);
escalar();