/* ==========================================================================
   SAVONA ANARCHY: World Engine
   Mondo a scorrimento parallasse di Via Savona a Milano:
   Ciclo casuale Giorno/Notte, pioggia/riflessi, loft in mattoni, insegne neon
   ("VIA SAVONA", "SUPERSTUDIO", "ARMANI SILOS"), rotaie del tram storico 19.
   ========================================================================== */

export class World {
  constructor() {
    this.groundY = 460;

    // VARIABILE RANDOM: Ciclo Giorno / Notte
    this.isNight = Math.random() > 0.45;

    // VARIABILE RANDOM: Pioggia milanese
    this.isRaining = Math.random() > 0.5;
    this.raindrops = [];
    if (this.isRaining) {
      for (let i = 0; i < 70; i++) {
        this.raindrops.push({
          x: Math.random() * 1200,
          y: Math.random() * 600,
          speed: 14 + Math.random() * 8,
          len: 12 + Math.random() * 10
        });
      }
    }

    // Insegne neon di Via Savona
    this.signs = [
      { text: "VIA SAVONA", color: "#e74c3c" },
      { text: "SUPERSTUDIO // EXPO", color: "#f39c12" },
      { text: "DESIGN WEEK 2026", color: "#3498db" },
      { text: "SPAZIO ANARCHIA", color: "#2ecc71" }
    ];

    // Posizione del tram milanese storico di passaggio
    this.tramX = 1400;
  }

  getGroundY(x) {
    return this.groundY;
  }

  update(delta, cameraX) {
    // Aggiornamento pioggia
    if (this.isRaining) {
      for (const drop of this.raindrops) {
        drop.y += drop.speed;
        drop.x -= 2;
        if (drop.y > 600) {
          drop.y = -20;
          drop.x = Math.random() * 1200;
        }
      }
    }

    // Movimento tram storico
    this.tramX -= 1.8;
    if (this.tramX < -600) {
      this.tramX = 1800 + Math.random() * 1000;
    }
  }

  render(ctx, cameraX, canvasWidth, canvasHeight) {
    // -------------------------------------------------------------
    // 1. CIELO (Giorno / Notte con palette surrealista)
    // -------------------------------------------------------------
    if (this.isNight) {
      // Notte milanese blu petrolio / antracite
      const grad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
      grad.addColorStop(0, "#0a0c10");
      grad.addColorStop(0.6, "#161b22");
      grad.addColorStop(1, "#21262d");
      ctx.fillStyle = grad;
    } else {
      // Crepuscolo pomeridiano dorato / ocra industriale
      const grad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
      grad.addColorStop(0, "#2c3e50");
      grad.addColorStop(0.5, "#d35400");
      grad.addColorStop(1, "#f39c12");
      ctx.fillStyle = grad;
    }
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // -------------------------------------------------------------
    // 2. PARALLASSE LIVELLO 1: Ciminieri e tetti industriali distanti
    // -------------------------------------------------------------
    ctx.save();
    const p1 = -(cameraX * 0.15) % 800;
    ctx.translate(p1, 0);
    ctx.fillStyle = this.isNight ? "#0d1117" : "#5d4037";

    for (let i = -1; i < 3; i++) {
      const offsetX = i * 800;
      // Profilo fabbriche dismesse e capannoni
      ctx.fillRect(offsetX + 50, 280, 140, 200);
      ctx.fillRect(offsetX + 140, 220, 25, 260); // Ciminiera
      ctx.fillRect(offsetX + 260, 310, 190, 170);
      ctx.fillRect(offsetX + 520, 260, 160, 220);
      ctx.fillRect(offsetX + 620, 200, 20, 280); // Ciminiera 2
    }
    ctx.restore();

    // -------------------------------------------------------------
    // 3. PARALLASSE LIVELLO 2: Loft in mattoni & Showroom di Via Savona
    // -------------------------------------------------------------
    ctx.save();
    const p2 = -(cameraX * 0.45) % 1000;
    ctx.translate(p2, 0);

    for (let i = -1; i < 3; i++) {
      const offsetX = i * 1000;

      // Palazzi loft rossi/antracite
      ctx.fillStyle = this.isNight ? "#1c2128" : "#8b4513";
      ctx.fillRect(offsetX + 80, 220, 240, 260);
      ctx.fillRect(offsetX + 360, 180, 280, 300);
      ctx.fillRect(offsetX + 680, 240, 260, 240);

      // Grandi finestre a vetrata industriale
      ctx.fillStyle = this.isNight ? "#ffd685" : "#34495e";
      for (let wy = 230; wy < 420; wy += 45) {
        for (let wx = 100; wx < 300; wx += 40) {
          ctx.fillRect(offsetX + wx, wy, 24, 32);
        }
        for (let wx = 380; wx < 620; wx += 45) {
          ctx.fillRect(offsetX + wx, wy, 28, 32);
        }
      }

      // Insegne al neon animate di Via Savona
      const signIdx = Math.abs(i) % this.signs.length;
      const s = this.signs[signIdx];
      ctx.fillStyle = s.color;
      ctx.font = "900 13px monospace";
      ctx.fillText(s.text, offsetX + 380, 170);
    }
    ctx.restore();

    // -------------------------------------------------------------
    // 4. TRAM STORICO MILANESE (Giallo Milano 1928 che passa sullo sfondo)
    // -------------------------------------------------------------
    ctx.save();
    const tramScreenX = this.tramX - cameraX * 0.7;
    // Cassa tram gialla
    ctx.fillStyle = "#f1c40f";
    ctx.fillRect(tramScreenX, 360, 160, 65);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(tramScreenX, 360, 160, 18);
    // Finestrini tram illuminati
    ctx.fillStyle = "#fff8e1";
    for (let tx = 8; tx < 150; tx += 20) {
      ctx.fillRect(tramScreenX + tx, 382, 14, 22);
    }
    // Targa 19
    ctx.fillStyle = "#111111";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText("19 SAVONA", tramScreenX + 45, 374);
    ctx.restore();

    // -------------------------------------------------------------
    // 5. PIANO STRADA: Asfalto, lastre di marciapiede e rotaie del tram
    // -------------------------------------------------------------
    ctx.save();
    // Asfalto
    ctx.fillStyle = this.isNight ? "#161b22" : "#2d3436";
    ctx.fillRect(0, this.groundY, canvasWidth, canvasHeight - this.groundY);

    // Rotaie del tram in metallo
    ctx.fillStyle = "#7f8c8d";
    ctx.fillRect(0, this.groundY + 14, canvasWidth, 3);
    ctx.fillRect(0, this.groundY + 28, canvasWidth, 3);

    // Cordolo del marciapiede in pietra
    ctx.fillStyle = "#95a5a6";
    ctx.fillRect(0, this.groundY - 4, canvasWidth, 4);

    // Targa via a bandiera
    ctx.fillStyle = "#1a3a6b";
    ctx.fillRect(40 - (cameraX % 400), this.groundY - 95, 110, 26);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 10px monospace";
    ctx.fillText("VIA SAVONA", 50 - (cameraX % 400), this.groundY - 78);
    ctx.restore();

    // -------------------------------------------------------------
    // 6. PIOGGIA MILANESE (Se attiva nella variabile random)
    // -------------------------------------------------------------
    if (this.isRaining) {
      ctx.save();
      ctx.strokeStyle = "rgba(174, 214, 241, 0.45)";
      ctx.lineWidth = 1.2;
      for (const drop of this.raindrops) {
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x - 2, drop.y + drop.len);
        ctx.stroke();
      }
      ctx.restore();
    }
  }
}
