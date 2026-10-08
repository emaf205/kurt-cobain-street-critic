/* ==========================================================================
   SAVONA ANARCHY: Entities Engine
   Kurt Cobain (stile rotoscopio Prince of Persia), Pedoni (con 1 su 5 armato che spara),
   Proiettili letali e collisioni.
   ========================================================================== */

import { getRandomInsult, getRandomPedestrianType } from './dialogues.js';
import { sound } from './audio.js';

export class Kurt {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.width = 24;
    this.height = 54;

    this.facing = 1; // 1: Destra, -1: Sinistra
    this.isGrounded = false;
    this.isDucking = false;
    this.isSkating = false;
    this.isDead = false;

    // Timer skate casuale
    this.skateTimer = 0;
    this.nextRandomSkate = 8 + Math.random() * 10;

    // Animazioni
    this.animCycle = 0;
    this.deathTimer = 0;
  }

  jump() {
    if (this.isGrounded && !this.isDead && !this.isDucking) {
      this.vy = -11.5;
      this.isGrounded = false;
      sound.playJump();
    }
  }

  duck(isDown) {
    if (this.isDead) return;
    this.isDucking = isDown;
    this.height = isDown ? 28 : 54;
  }

  toggleSkate(force = null) {
    if (this.isDead) return;
    this.isSkating = force !== null ? force : !this.isSkating;
    if (this.isSkating) {
      this.skateTimer = 6.5;
      sound.playBoardDrop();
    }
  }

  kill() {
    if (this.isDead) return;
    this.isDead = true;
    this.vy = -6;
    this.vx = -this.facing * 3;
    this.isSkating = false;
  }

  update(delta, input, world) {
    if (this.isDead) {
      this.vy += 0.45; // Gravità
      this.x += this.vx;
      this.y += this.vy;
      const groundY = world.getGroundY(this.x);
      if (this.y >= groundY - this.height) {
        this.y = groundY - this.height;
        this.vx = 0;
      }
      return;
    }

    // Timer skate burst
    if (this.isSkating) {
      this.skateTimer -= delta;
      if (this.skateTimer <= 0) {
        this.isSkating = false;
      }
    } else {
      this.nextRandomSkate -= delta;
      if (this.nextRandomSkate <= 0) {
        this.toggleSkate(true);
        this.nextRandomSkate = 12 + Math.random() * 12;
      }
    }

    // Movimento orizzontale
    const speed = this.isSkating ? 5.8 : (this.isDucking ? 1.0 : 3.4);
    if (input.left) {
      this.vx = -speed;
      this.facing = -1;
      this.animCycle += delta * (this.isSkating ? 4 : 12);
    } else if (input.right) {
      this.vx = speed;
      this.facing = 1;
      this.animCycle += delta * (this.isSkating ? 4 : 12);
    } else {
      this.vx = 0;
      this.animCycle = 0;
    }

    // Gravità e salto
    this.vy += 0.52; // Gravità costante
    this.x += this.vx;
    this.y += this.vy;

    // Collisione con il suolo / marciapiede di Via Savona
    const groundY = world.getGroundY(this.x);
    if (this.y >= groundY - this.height) {
      this.y = groundY - this.height;
      this.vy = 0;
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }

    // Suono dei passi a piedi
    if (this.isGrounded && !this.isSkating && Math.abs(this.vx) > 0.5) {
      if (Math.sin(this.animCycle) > 0.95) {
        sound.playFootstep();
      }
    }
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height);
    ctx.scale(this.facing, 1);

    // Animazione morte: cade supino a terra
    if (this.isDead) {
      ctx.rotate(Math.PI / 2.2);
    }

    const legSwing = Math.sin(this.animCycle) * 12;

    // --- 1. TAVOLA DA SKATE ---
    if (this.isSkating) {
      // Tavola a terra sotto i piedi
      ctx.fillStyle = "#111111";
      ctx.fillRect(-18, -4, 36, 4);
      // Ruote
      ctx.fillStyle = "#f5f6fa";
      ctx.fillRect(-14, 0, 5, 4);
      ctx.fillRect(9, 0, 5, 4);
    } else {
      // Tavola sotto il braccio
      ctx.fillStyle = "#111111";
      ctx.save();
      ctx.translate(-8, -32);
      ctx.rotate(0.3);
      ctx.fillRect(-3, -16, 6, 32);
      ctx.restore();
    }

    // --- 2. GAMBE & JEANS STRAPPATI ---
    ctx.fillStyle = "#5d8aa8"; // Denim slavato
    if (this.isDucking) {
      ctx.fillRect(-10, -14, 10, 14);
      ctx.fillRect(0, -14, 10, 14);
    } else if (this.isSkating) {
      // Posa piegata skate
      ctx.fillRect(-10, -22, 9, 22);
      ctx.fillRect(1, -22, 9, 22);
    } else {
      // Camminata fluida stile Prince of Persia
      ctx.fillRect(-8 - legSwing * 0.4, -26, 7, 26);
      ctx.fillRect(1 + legSwing * 0.4, -26, 7, 26);

      // Squarcio sul ginocchio sinistro
      ctx.fillStyle = "#f5cba7";
      ctx.fillRect(-7 - legSwing * 0.4, -15, 5, 4);
    }

    // Scarpe Converse nere consumate
    ctx.fillStyle = "#111111";
    ctx.fillRect(-10 - (this.isGrounded ? legSwing * 0.4 : 0), -4, 11, 4);
    ctx.fillRect(0 + (this.isGrounded ? legSwing * 0.4 : 0), -4, 11, 4);

    // --- 3. BUSTO & CARDIGAN VERDE MTV UNPLUGGED ---
    const torsoY = this.isDucking ? -26 : -44;
    ctx.fillStyle = "#4a5d3f"; // Verde oliva iconico
    ctx.fillRect(-9, torsoY, 18, 20);

    // Maglietta vintage bianca visibile al centro
    ctx.fillStyle = "#dcdde1";
    ctx.fillRect(-3, torsoY + 2, 6, 14);

    // --- 4. TESTA & CAPELLI BIONDI SCARMIGLIATI ---
    const headY = this.isDucking ? -38 : -54;
    // Volto
    ctx.fillStyle = "#f5cba7";
    ctx.fillRect(-5, headY + 3, 11, 10);

    // Capelli biondi grunge a ciocche
    ctx.fillStyle = "#e5c97d";
    ctx.fillRect(-7, headY, 15, 6); // Corona
    ctx.fillRect(-9, headY + 4, 5, 12); // Ciocca sx
    ctx.fillRect(4, headY + 4, 5, 12);  // Ciocca dx
    ctx.fillRect(-2, headY + 4, 6, 4);  // Frangetta sul viso

    ctx.restore();
  }
}

export class Pedestrian {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 24;
    this.height = 54;
    this.facing = -1; // Camminano incontro a Kurt
    this.type = getRandomPedestrianType();

    // 1 SU 5 È ARMATO E SPARA (20% DI PROBABILITÀ)
    this.isArmed = Math.random() < 0.20;
    this.hasShot = false;
    this.aimTimer = 0;

    this.walkSpeed = 0.8 + Math.random() * 0.6;
    this.animCycle = Math.random() * 10;
  }

  update(delta, kurt, bullets, particles, onInsultExplosion) {
    this.animCycle += delta * 6;
    this.x += this.facing * this.walkSpeed;

    const distToKurt = Math.abs(kurt.x - this.x);

    // --- SE È ARMATO: PRENDE LA MIRA E SPARA! ---
    if (this.isArmed && !this.hasShot && distToKurt < 230 && distToKurt > 45) {
      // Si ferma e punta la pistola
      this.walkSpeed = 0;
      this.facing = kurt.x < this.x ? -1 : 1;
      this.aimTimer += delta;

      if (this.aimTimer >= 0.42) { // Tempo di mira prima del colpo letale
        this.hasShot = true;
        sound.playGunshot();
        particles.createMuzzleFlash(this.x + (this.facing * 16), this.y + 26, this.facing);

        // Genera proiettile ad alta velocità
        bullets.push(new Bullet(
          this.x + (this.facing * 16),
          this.y + 26,
          this.facing * 9.5
        ));
      }
    }

    // --- SE KURT SI AVVICINA: INSULTO & L'UMANO ESPLODE! ---
    if (!kurt.isDead && distToKurt < 48 && Math.abs(kurt.y - this.y) < 35) {
      // Kurt lancia l'insulto
      const insult = getRandomInsult();
      sound.speak(insult);
      sound.playHumanExplosion();
      sound.playGuitarStinger();

      // Esplosione surrealista del pedone
      particles.createHumanExplosion(this.x + this.width / 2, this.y + this.height, this.type.color);

      // Notifica punteggio e dialogo
      onInsultExplosion(insult, this);
      return false; // Rimuovi pedone (è esploso!)
    }

    return true; // Pedone ancora vivo
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height);
    ctx.scale(this.facing, 1);

    const legSwing = Math.sin(this.animCycle) * 10;

    // Gambe
    ctx.fillStyle = "#2c3e50";
    ctx.fillRect(-7 - legSwing * 0.4, -24, 6, 24);
    ctx.fillRect(1 + legSwing * 0.4, -24, 6, 24);

    // Busto / Abito alla moda milanese
    ctx.fillStyle = this.type.color;
    ctx.fillRect(-8, -46, 16, 22);

    // Braccio (se mira con la pistola)
    if (this.isArmed && this.aimTimer > 0) {
      // Braccio teso in avanti con la pistola
      ctx.fillStyle = this.type.color;
      ctx.fillRect(0, -42, 18, 5);
      // Pistola nera metallica
      ctx.fillStyle = "#111111";
      ctx.fillRect(16, -45, 8, 8);

      // Punto esclamativo rosso di pericolo sopra la testa!
      ctx.fillStyle = "#e74c3c";
      ctx.font = "bold 16px monospace";
      ctx.fillText("!", -3, -58);
    }

    // Testa
    ctx.fillStyle = "#f5cba7";
    ctx.fillRect(-5, -54, 10, 9);
    // Capelli
    ctx.fillStyle = this.type.hair;
    ctx.fillRect(-6, -58, 12, 5);

    ctx.restore();
  }
}

export class Bullet {
  constructor(x, y, vx) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.width = 12;
    this.height = 3;
    this.isDead = false;
  }

  update(kurt) {
    this.x += this.vx;

    // Verifica collisione letale con Kurt
    if (!kurt.isDead && !kurt.isDucking) {
      if (
        this.x > kurt.x &&
        this.x < kurt.x + kurt.width &&
        this.y > kurt.y &&
        this.y < kurt.y + kurt.height
      ) {
        kurt.kill();
        this.isDead = true;
      }
    }

    // Se Kurt si è accovacciato (Duck), il proiettile gli sibila sopra la testa!
  }

  render(ctx) {
    ctx.save();
    ctx.fillStyle = "#ffa502";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    // Scia luminosa
    ctx.fillStyle = "rgba(255, 165, 2, 0.4)";
    ctx.fillRect(this.x - Math.sign(this.vx) * 16, this.y, 16, this.height);
    ctx.restore();
  }
}
