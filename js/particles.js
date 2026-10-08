/* ==========================================================================
   SAVONA ANARCHY: Particle Engine
   Effetti particellari per esplosioni surreali di umani, fumo, frammenti geometrici,
   scintille di proiettili e fiammate da sparo.
   ========================================================================== */

export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  // Esplosione surrealista del pedone quando viene insultato
  createHumanExplosion(x, y, color = "#ff4757") {
    const count = 55;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 8.5;
      const size = 3 + Math.random() * 7;
      const colors = [color, "#ffffff", "#ff6b81", "#2f3542", "#ffa502"];
      const pColor = colors[Math.floor(Math.random() * colors.length)];

      this.particles.push({
        x: x,
        y: y - 25,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.5, // Salto iniziale verso l'alto
        size: size,
        color: pColor,
        alpha: 1.0,
        decay: 0.015 + Math.random() * 0.02,
        gravity: 0.22,
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.2,
        shape: Math.random() > 0.5 ? 'square' : 'circle'
      });
    }

    // Aggiungi anello d'urto ad espansione (shockwave)
    this.particles.push({
      x: x,
      y: y - 25,
      radius: 5,
      maxRadius: 65,
      growRate: 4.5,
      color: "rgba(255, 255, 255, 0.8)",
      alpha: 0.9,
      decay: 0.04,
      isShockwave: true
    });
  }

  // Fiammata e scintille quando il pedone armato spara
  createMuzzleFlash(x, y, dir) {
    for (let i = 0; i < 12; i++) {
      const angle = (dir > 0 ? 0 : Math.PI) + (Math.random() - 0.5) * 0.8;
      const speed = 4 + Math.random() * 7;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 4,
        color: "#ffa502",
        alpha: 1.0,
        decay: 0.06,
        gravity: 0.05
      });
    }
  }

  // Fumo dello skate sull'asfalto
  createSkatePuff(x, y) {
    if (Math.random() > 0.4) return;
    this.particles.push({
      x: x + (Math.random() - 0.5) * 10,
      y: y,
      vx: (Math.random() - 0.5) * 0.8,
      vy: -0.5 - Math.random() * 0.8,
      size: 3 + Math.random() * 4,
      color: "rgba(220, 220, 220, 0.4)",
      alpha: 0.5,
      decay: 0.03,
      gravity: -0.02
    });
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      if (p.isShockwave) {
        p.radius += p.growRate;
        p.alpha -= p.decay;
        if (p.alpha <= 0) {
          this.particles.splice(i, 1);
        }
        continue;
      }

      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity || 0.15;
      p.alpha -= p.decay;
      if (p.rotation !== undefined) p.rotation += p.vRot;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  render(ctx) {
    ctx.save();
    for (const p of this.particles) {
      if (p.isShockwave) {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 3;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.stroke();
        continue;
      }

      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;

      ctx.save();
      ctx.translate(p.x, p.y);
      if (p.rotation) ctx.rotate(p.rotation);

      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      }
      ctx.restore();
    }
    ctx.restore();
  }

  reset() {
    this.particles = [];
  }
}
