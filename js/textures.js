/* ==========================================================================
   VIA SAVONA CRITIC: Kurt in Milan - Procedural Textures
   Textures of Milan's Via Savona / Zona Tortona: Post-industrial brick lofts,
   fashion showrooms, cobblestone/asphalt, Milan street signs, and obstacle props.
   ========================================================================== */

export class TextureGenerator {
  // Realistic Milanese Asphalt with road wear, cobblestone borders and cracks
  static createAsphaltTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Dark charcoal asphalt
    ctx.fillStyle = '#1e2024';
    ctx.fillRect(0, 0, 1024, 1024);

    // Bitumen grain & mineral grit
    const imgData = ctx.getImageData(0, 0, 1024, 1024);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 32;
      data[i] = Math.min(255, Math.max(16, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(16, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(18, data[i + 2] + noise + 2));
    }
    ctx.putImageData(imgData, 0, 0);

    // Weathering cracks
    ctx.strokeStyle = '#111214';
    ctx.lineWidth = 1.5;
    for (let c = 0; c < 12; c++) {
      ctx.beginPath();
      let x = Math.random() * 1024;
      let y = Math.random() * 1024;
      ctx.moveTo(x, y);
      for (let s = 0; s < 5; s++) {
        x += (Math.random() - 0.5) * 50;
        y += (Math.random() - 0.5) * 50;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Faded white lane dashed markings
    ctx.fillStyle = '#d2d0c8';
    ctx.globalAlpha = 0.85;
    for (let y = 60; y < 1024; y += 220) {
      ctx.fillRect(504, y, 16, 120);
    }
    ctx.globalAlpha = 1.0;

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  // Milanese Sidewalk: Dark porphyry/granite slabs with curb stones
  static createSidewalkTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#6e7072';
    ctx.fillRect(0, 0, 512, 512);

    const tileSize = 64;
    for (let x = 0; x < 512; x += tileSize) {
      for (let y = 0; y < 512; y += tileSize) {
        const shade = Math.floor(Math.random() * 24 - 12);
        ctx.fillStyle = `rgb(${110 + shade}, ${112 + shade}, ${114 + shade})`;
        ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);

        ctx.strokeStyle = '#484a4c';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, tileSize, tileSize);
      }
    }

    const imgData = ctx.getImageData(0, 0, 512, 512);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const n = (Math.random() - 0.5) * 22;
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

  // Via Savona Industrial Lofts & Fashion Showrooms
  static createBuildingTexture(style = 0) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Milanese factory loft brick & plaster hues
    const wallColors = ['#5c3a21', '#40454a', '#8a4b2d', '#2b2f33', '#7a604c'];
    const baseColor = wallColors[style % wallColors.length];

    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 512, 1024);

    // Brick mortar lines
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    for (let y = 0; y < 1024; y += 14) {
      ctx.fillRect(0, y, 512, 1);
    }

    // Industrial multi-pane loft windows with black iron frames
    const winWidth = 54;
    const winHeight = 84;
    const cols = 5;
    const rows = 8;
    const startY = 150;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = 32 + c * 92;
        const y = startY + r * 102;

        ctx.fillStyle = '#181a1b';
        ctx.fillRect(x - 3, y - 3, winWidth + 6, winHeight + 6);

        // Glass reflection / internal warm lighting
        ctx.fillStyle = (c + r + style) % 3 === 0 ? '#ffeaae' : '#232b32';
        ctx.fillRect(x, y, winWidth, winHeight);

        // Iron window panes grid
        ctx.fillStyle = '#111213';
        ctx.fillRect(x + winWidth / 2 - 1, y, 2, winHeight);
        ctx.fillRect(x, y + winHeight / 3, winWidth, 2);
        ctx.fillRect(x, y + (winHeight * 2) / 3, winWidth, 2);

        // Stone lintel above window
        ctx.fillStyle = '#9e9e9e';
        ctx.fillRect(x - 4, y - 6, winWidth + 8, 4);
      }
    }

    // Ground Floor: Minimalist High-End Fashion Showroom / Design Gallery
    ctx.fillStyle = '#121416';
    ctx.fillRect(15, 1024 - 170, 482, 170);

    // Showroom Signboard
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(30, 1024 - 160, 452, 34);

    ctx.fillStyle = '#0a0a0a';
    ctx.font = '900 16px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';

    const showrooms = [
      'SPAZIO SAVONA 37 // MILANO',
      'TORTONA ARCHIVE GALLERY',
      'SUPERSTUDIO EXPO // DESIGN',
      'ATELIER VIA SAVONA // SHOWROOM',
      'CONCEPT SPACE MILANO 2026'
    ];
    ctx.fillText(showrooms[style % showrooms.length], 256, 1024 - 138);

    // Large showroom glass display
    ctx.fillStyle = '#1b2d38';
    ctx.fillRect(35, 1024 - 115, 442, 105);

    // Milanese blue street name plaque on building corner
    ctx.fillStyle = '#1a3a6b';
    ctx.fillRect(25, 45, 190, 45);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(27, 47, 186, 41);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText("VIA SAVONA", 38, 68);
    ctx.font = '9px sans-serif';
    ctx.fillText("ZONA TORTONA / MILANO", 38, 82);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  // Kurt's beat-up grunge skateboard deck (scratched grip tape)
  static createKurtGripTapeTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#181818';
    ctx.fillRect(0, 0, 256, 512);

    const imgData = ctx.getImageData(0, 0, 256, 512);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const g = Math.random() * 35;
      data[i] = g;
      data[i + 1] = g;
      data[i + 2] = g;
    }
    ctx.putImageData(imgData, 0, 0);

    // Rough handwritten stencil "KURT" or "SUB POP"
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px monospace';
    ctx.save();
    ctx.translate(128, 256);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("SUB POP", -40, 6);
    ctx.restore();

    return new THREE.CanvasTexture(canvas);
  }

  // Cardboard delivery box obstacle texture ("FRAGILE // DESIGN EXHIBITION")
  static createBoxTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#bfa175'; // Brown cardboard
    ctx.fillRect(0, 0, 256, 256);

    // Packing tape
    ctx.fillStyle = '#a6824e';
    ctx.fillRect(0, 110, 256, 36);

    // Fragile stencil
    ctx.fillStyle = '#8b0000';
    ctx.font = 'bold 18px monospace';
    ctx.fillText("FRAGILE", 20, 50);
    ctx.fillStyle = '#111111';
    ctx.font = '12px sans-serif';
    ctx.fillText("MILANO DESIGN", 20, 80);
    ctx.fillText("VIA SAVONA EXPO", 20, 98);

    return new THREE.CanvasTexture(canvas);
  }
}
