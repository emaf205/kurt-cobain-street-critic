/* ==========================================================================
   STREET CRITIC: Skater Polemico - Procedural Realistic Textures
   Generatore su Canvas di texture urbane fotorealistiche ad alta definizione
   ========================================================================== */

export class TextureGenerator {
  // Texture Asfalto Realistico con grana bituminosa, righe stradali e imperfezioni
  static createAsphaltTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // 1. Base asfalto grigio antracite scuro
    ctx.fillStyle = '#222326';
    ctx.fillRect(0, 0, 1024, 1024);

    // 2. Grana bitume e aggregato minerale (pietrisco)
    const imgData = ctx.getImageData(0, 0, 1024, 1024);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 35;
      data[i] = Math.min(255, Math.max(20, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(20, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(22, data[i + 2] + noise + 2)); // tono asfalto freddo
    }
    ctx.putImageData(imgData, 0, 0);

    // 3. Piccole crepe realistiche
    ctx.strokeStyle = '#141415';
    ctx.lineWidth = 1.5;
    for (let c = 0; c < 15; c++) {
      ctx.beginPath();
      let x = Math.random() * 1024;
      let y = Math.random() * 1024;
      ctx.moveTo(x, y);
      for (let s = 0; s < 5; s++) {
        x += (Math.random() - 0.5) * 60;
        y += (Math.random() - 0.5) * 60;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // 4. Linee stradali centrali tratteggiate bianche (leggermente usurate dall'usura)
    ctx.fillStyle = '#dedcd4';
    ctx.globalAlpha = 0.88;
    // Tratteggio corsia centrale
    for (let y = 60; y < 1024; y += 220) {
      ctx.fillRect(504, y, 16, 120);
    }
    ctx.globalAlpha = 1.0;

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  // Texture Marciapiede in porfido/lastricato di pietra con cordolo
  static createSidewalkTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Base pietra chiara
    ctx.fillStyle = '#9c9a96';
    ctx.fillRect(0, 0, 512, 512);

    // Lastre di pietra con fughe
    const tileSize = 64;
    for (let x = 0; x < 512; x += tileSize) {
      for (let y = 0; y < 512; y += tileSize) {
        // Variazione tonalità tra lastre
        const shade = Math.floor(Math.random() * 20 - 10);
        ctx.fillStyle = `rgb(${156 + shade}, ${154 + shade}, ${150 + shade})`;
        ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);

        // Fughe scure
        ctx.strokeStyle = '#5a5854';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, tileSize, tileSize);
      }
    }

    // Micro-rumore poroso della pietra
    const imgData = ctx.getImageData(0, 0, 512, 512);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const n = (Math.random() - 0.5) * 20;
      data[i] = Math.min(255, Math.max(0, data[i] + n));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + n));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + n));
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  // Texture Facciate Palazzi Realistici (Finestre, cornicioni, vetrine a piano terra)
  static createBuildingTexture(style = 0) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    const wallColors = ['#a36d4f', '#7e7b75', '#ba936f', '#4a535e', '#8c735d'];
    const baseColor = wallColors[style % wallColors.length];

    // Muro
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 512, 1024);

    // Trama mattoni / intonaco
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    for (let y = 0; y < 1024; y += 12) {
      ctx.fillRect(0, y, 512, 1);
    }

    // Finestre regolari
    const winWidth = 44;
    const winHeight = 72;
    const cols = 5;
    const rows = 9;
    const startY = 160;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = 36 + c * 92;
        const y = startY + r * 94;

        // Cornice finestra
        ctx.fillStyle = '#222';
        ctx.fillRect(x - 4, y - 4, winWidth + 8, winHeight + 8);

        // Vetro: riflesso realistico azzurrato / luce interna calda casuale
        const isLit = Math.random() > 0.45;
        if (isLit) {
          ctx.fillStyle = '#ffd685'; // Luce calda interna
        } else {
          ctx.fillStyle = '#1c2833'; // Vetro scuro con riflesso cielo
        }
        ctx.fillRect(x, y, winWidth, winHeight);

        // Montanti infissi
        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(x + winWidth / 2 - 1, y, 2, winHeight);
        ctx.fillRect(x, y + winHeight / 2 - 1, winWidth, 2);

        // Davanzale in pietra
        ctx.fillStyle = '#e0ded8';
        ctx.fillRect(x - 6, y + winHeight + 2, winWidth + 12, 6);
      }
    }

    // Piano terra: Vetrina negozio / bottega o portone
    ctx.fillStyle = '#1e2124';
    ctx.fillRect(20, 1024 - 150, 472, 150);

    // Insegna vetrina
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(35, 1024 - 140, 442, 32);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    const storeNames = ['BAR DELLA STAZIONE', 'BOUTIQUE VINTAGE', 'CAFFÈ LETTERARIO', 'LIBRERIA DEL CORSO', 'OTTICA MODERNA'];
    ctx.fillText(storeNames[style % storeNames.length], 256, 1024 - 118);

    // Vetrate del negozio
    ctx.fillStyle = '#1a3c40';
    ctx.fillRect(45, 1024 - 100, 422, 90);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  // Grip Tape dello Skateboard (ruvido, nero con intagli)
  static createGripTapeTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, 256, 512);

    const imgData = ctx.getImageData(0, 0, 256, 512);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const g = Math.random() * 40;
      data[i] = g;
      data[i + 1] = g;
      data[i + 2] = g;
    }
    ctx.putImageData(imgData, 0, 0);

    // Striscia sottile di intaglio nel grip tape (stile pro skater)
    ctx.fillStyle = '#d4ac0d'; // Giallo skate street
    ctx.fillRect(40, 250, 176, 4);

    return new THREE.CanvasTexture(canvas);
  }

  // Grafica sotto la tavola (Deck art audace e irriverente)
  static createDeckGraphicTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Gradiente legno acero canadese e graffiti
    const grad = ctx.createLinearGradient(0, 0, 256, 512);
    grad.addColorStop(0, '#e74c3c');
    grad.addColorStop(0.5, '#2c3e50');
    grad.addColorStop(1, '#f39c12');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 512);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.save();
    ctx.translate(128, 256);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("STREET CRITIC", 0, 0);
    ctx.font = '16px sans-serif';
    ctx.fillText("NO RESPECT // 2026", 0, 24);
    ctx.restore();

    return new THREE.CanvasTexture(canvas);
  }

  // Segnaletica transenna cantiere stradale (Strisce diagonali bianche e rosse catarifrangenti)
  static createHazardStripesTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#e74c3c'; // Rosso
    ctx.fillRect(0, 0, 256, 256);

    ctx.fillStyle = '#fdfefe'; // Bianco
    ctx.lineWidth = 36;
    ctx.strokeStyle = '#fdfefe';

    for (let d = -256; d < 512; d += 64) {
      ctx.beginPath();
      ctx.moveTo(d, 0);
      ctx.lineTo(d + 256, 256);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  // Tombino in ghisa stradale realistico
  static createManholeTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Ghisa scura
    ctx.fillStyle = '#1c1f22';
    ctx.beginPath();
    ctx.arc(128, 128, 124, 0, Math.PI * 2);
    ctx.fill();

    // Rilievo cerchi concentrici
    ctx.strokeStyle = '#2f353b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(128, 128, 110, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(128, 128, 75, 0, Math.PI * 2);
    ctx.stroke();

    // Scanalature a griglia
    ctx.lineWidth = 2;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
      ctx.beginPath();
      ctx.moveTo(128 + Math.cos(a) * 30, 128 + Math.sin(a) * 30);
      ctx.lineTo(128 + Math.cos(a) * 105, 128 + Math.sin(a) * 105);
      ctx.stroke();
    }

    ctx.fillStyle = '#7f8c8d';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText("ACQUEDOTTO", 128, 132);

    return new THREE.CanvasTexture(canvas);
  }
}
