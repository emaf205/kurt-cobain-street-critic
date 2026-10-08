/* ==========================================================================
   STREET CRITIC: Skater Polemico - Skater & Skateboard 3D Entity
   Fisica realistica di skate, modello 3D proporzionato, deck con truck e ruote,
   e animazioni fluide (carving lean, push col piede, powerslide, ollie, gesti).
   ========================================================================== */

import { TextureGenerator } from './textures.js';
import { sound } from './audio.js';

export class Skater {
  constructor(scene) {
    this.scene = scene;

    // Parametri di movimento e fisica
    this.position = new THREE.Vector3(0, 0, 0);
    this.speed = 0.18; // Velocità di crociera base (m/frame)
    this.baseSpeed = 0.18;
    this.maxSpeed = 0.45;
    this.minSpeed = 0.05;
    this.lateralSpeed = 0.16;

    this.laneX = 0; // Posizione laterale (-3.5 a +3.5)
    this.targetLaneX = 0;

    // Stati di animazione
    this.isPushing = false;
    this.pushTimer = 0;

    this.isBraking = false;
    this.brakeTimer = 0;

    this.isJumping = false;
    this.jumpTimer = 0;
    this.jumpHeight = 0;
    this.jumpVelocity = 0;

    this.turnAngle = 0; // Angolo di sterzata
    this.leanAngle = 0; // Rollio della tavola sui truck

    this.gestureTimer = 0; // Timer gesticolazione polemica

    // Gruppi Three.js
    this.group = new THREE.Group();
    this.boardGroup = new THREE.Group();
    this.skaterGroup = new THREE.Group();
    this.wheels = [];

    this.build3DModel();
    this.scene.add(this.group);
  }

  build3DModel() {
    const gripTexture = TextureGenerator.createGripTapeTexture();
    const bottomTexture = TextureGenerator.createDeckGraphicTexture();

    // -------------------------------------------------------------
    // 1. TAVOLA DA SKATEBOOK (Deck con concavità, nose e tail rialzati)
    // -------------------------------------------------------------
    const deckMatTop = new THREE.MeshStandardMaterial({
      map: gripTexture,
      roughness: 0.95,
      metalness: 0.05
    });
    const deckMatBottom = new THREE.MeshStandardMaterial({
      map: bottomTexture,
      roughness: 0.35,
      metalness: 0.1
    });
    const woodSideMat = new THREE.MeshStandardMaterial({
      color: 0xc89658, // Legno d'acero
      roughness: 0.7
    });

    // Materiali multi-faccia per il deck
    const deckMaterials = [
      woodSideMat, // destra
      woodSideMat, // sinistra
      deckMatTop,  // sopra (grip tape)
      deckMatBottom, // sotto (grafica)
      woodSideMat, // fronte (nose)
      woodSideMat  // retro (tail)
    ];

    // Corpo centrale della tavola
    const deckGeo = new THREE.BoxGeometry(0.32, 0.024, 0.92);
    this.deckMesh = new THREE.Mesh(deckGeo, deckMaterials);
    this.deckMesh.position.y = 0.105;
    this.deckMesh.castShadow = true;
    this.boardGroup.add(this.deckMesh);

    // Nose rialzato
    const noseGeo = new THREE.BoxGeometry(0.31, 0.022, 0.22);
    const noseMesh = new THREE.Mesh(noseGeo, deckMaterials);
    noseMesh.position.set(0, 0.125, -0.52);
    noseMesh.rotation.x = 0.22; // Inclinazione nose
    noseMesh.castShadow = true;
    this.boardGroup.add(noseMesh);

    // Tail rialzato
    const tailGeo = new THREE.BoxGeometry(0.31, 0.022, 0.22);
    const tailMesh = new THREE.Mesh(tailGeo, deckMaterials);
    tailMesh.position.set(0, 0.125, 0.52);
    tailMesh.rotation.x = -0.22; // Inclinazione tail
    tailMesh.castShadow = true;
    this.boardGroup.add(tailMesh);

    // -------------------------------------------------------------
    // 2. TRUCK IN METALLO & BUSHING
    // -------------------------------------------------------------
    const truckMat = new THREE.MeshStandardMaterial({
      color: 0xb0bec5,
      metalness: 0.85,
      roughness: 0.25
    });
    const bushingMat = new THREE.MeshStandardMaterial({
      color: 0x3498db, // Gommini blu
      roughness: 0.4
    });

    [-0.32, 0.32].forEach((zPos) => {
      // Baseplate + Kingpin
      const baseplate = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.08), truckMat);
      baseplate.position.set(0, 0.08, zPos);
      this.boardGroup.add(baseplate);

      // Gommino
      const bushing = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 12), bushingMat);
      bushing.position.set(0, 0.065, zPos);
      this.boardGroup.add(bushing);

      // Asse orizzontale (Hanger)
      const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.34, 16), truckMat);
      axle.rotation.z = Math.PI / 2;
      axle.position.set(0, 0.05, zPos);
      axle.castShadow = true;
      this.boardGroup.add(axle);
    });

    // -------------------------------------------------------------
    // 3. RUOTE IN URETANO & CUSCINETTI A SFERA
    // -------------------------------------------------------------
    const wheelMat = new THREE.MeshStandardMaterial({
      color: 0xf5f5f0, // Uretano bianco avorio naturale
      roughness: 0.3,
      metalness: 0.05
    });
    const bearingMat = new THREE.MeshStandardMaterial({
      color: 0x2c3e50,
      metalness: 0.9,
      roughness: 0.1
    });

    const wheelGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.045, 18);
    const bearingGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.048, 12);

    const wheelPositions = [
      [-0.17, 0.05, -0.32],
      [0.17, 0.05, -0.32],
      [-0.17, 0.05, 0.32],
      [0.17, 0.05, 0.32]
    ];

    wheelPositions.forEach(pos => {
      const wheelGroup = new THREE.Group();
      wheelGroup.position.set(pos[0], pos[1], pos[2]);

      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.castShadow = true;
      wheelGroup.add(wheel);

      const bearing = new THREE.Mesh(bearingGeo, bearingMat);
      bearing.rotation.z = Math.PI / 2;
      wheelGroup.add(bearing);

      this.boardGroup.add(wheelGroup);
      this.wheels.push(wheelGroup);
    });

    this.group.add(this.boardGroup);

    // -------------------------------------------------------------
    // 4. PERSONAGGIO SKATER (Streetwear proporzionato, posa skate)
    // -------------------------------------------------------------
    // Materiali abiti skater
    const hoodieMat = new THREE.MeshStandardMaterial({
      color: 0x212529, // Felpa oversize antracite scura
      roughness: 0.8
    });
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xf0b27a, // Carnagione naturale
      roughness: 0.6
    });
    const pantsMat = new THREE.MeshStandardMaterial({
      color: 0x2c3e50, // Pantaloni cargo scuri
      roughness: 0.85
    });
    const shoeMat = new THREE.MeshStandardMaterial({
      color: 0x111111, // Scarpe skate scure con suola bianca
      roughness: 0.5
    });
    const soleMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, // Suola waffle bianca
      roughness: 0.7
    });
    const capMat = new THREE.MeshStandardMaterial({
      color: 0x8b0000, // Snapback bordeaux
      roughness: 0.75
    });
    const headphoneMat = new THREE.MeshStandardMaterial({
      color: 0xecf0f1,
      metalness: 0.7,
      roughness: 0.3
    });

    // Bacino / Cintura
    this.pelvis = new THREE.Group();
    this.pelvis.position.set(0, 0.85, 0);

    // Busto Felpa (Hoodie con pieghe morbide)
    const torsoGeo = new THREE.BoxGeometry(0.38, 0.52, 0.24);
    this.torso = new THREE.Mesh(torsoGeo, hoodieMat);
    this.torso.position.y = 0.3;
    this.torso.castShadow = true;
    this.pelvis.add(this.torso);

    // Collo & Cuffie over-ear al collo
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.1, 14), skinMat);
    neck.position.y = 0.6;
    this.pelvis.add(neck);

    const headphoneArc = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.02, 8, 20), headphoneMat);
    headphoneArc.rotation.x = Math.PI / 2;
    headphoneArc.position.y = 0.58;
    this.pelvis.add(headphoneArc);

    // Testa
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.125, 20, 20), skinMat);
    head.position.y = 0.72;
    head.castShadow = true;
    this.pelvis.add(head);

    // Cappellino snapback al contrario (visiera all'indietro)
    const capDome = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), capMat);
    capDome.position.y = 0.74;
    this.pelvis.add(capDome);

    const capVisor = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.015, 0.12), capMat);
    capVisor.position.set(0, 0.74, 0.14); // Visiera rivolta all'indietro
    capVisor.rotation.x = 0.1;
    this.pelvis.add(capVisor);

    // Braccio Sinistro (Bilanciamento skate)
    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-0.24, 0.52, 0);
    const lUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.28, 12), hoodieMat);
    lUpperArm.position.y = -0.14;
    this.leftArm.add(lUpperArm);
    const lHand = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 10), skinMat);
    lHand.position.y = -0.3;
    this.leftArm.add(lHand);
    this.pelvis.add(this.leftArm);

    // Braccio Destro (Per gesticolare e bilanciare)
    this.rightArm = new THREE.Group();
    this.rightArm.position.set(0.24, 0.52, 0);
    const rUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.28, 12), hoodieMat);
    rUpperArm.position.y = -0.14;
    this.rightArm.add(rUpperArm);
    const rHand = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 10), skinMat);
    rHand.position.y = -0.3;
    this.rightArm.add(rHand);
    this.pelvis.add(this.rightArm);

    // Gamba Anteriore (Piede sinistro, piantato saldo a 45 gradi)
    this.frontLeg = new THREE.Group();
    this.frontLeg.position.set(-0.06, 0.0, -0.16);
    const fThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.42, 12), pantsMat);
    fThigh.position.y = -0.21;
    this.frontLeg.add(fThigh);
    const fShin = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.065, 0.38, 12), pantsMat);
    fShin.position.set(0, -0.56, 0.05);
    this.frontLeg.add(fShin);

    // Scarpa anteriore
    const fShoe = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.24), shoeMat);
    fShoe.position.set(0, -0.74, 0.08);
    fShoe.castShadow = true;
    this.frontLeg.add(fShoe);
    const fSole = new THREE.Mesh(new THREE.BoxGeometry(0.124, 0.02, 0.244), soleMat);
    fSole.position.set(0, -0.78, 0.08);
    this.frontLeg.add(fSole);

    this.pelvis.add(this.frontLeg);

    // Gamba Posteriore (Piede destro, per spinta a terra o appoggio sul tail)
    this.backLeg = new THREE.Group();
    this.backLeg.position.set(0.06, 0.0, 0.24);
    const bThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.42, 12), pantsMat);
    bThigh.position.y = -0.21;
    this.backLeg.add(bThigh);
    this.bShin = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.065, 0.38, 12), pantsMat);
    this.bShin.position.set(0, -0.56, -0.04);
    this.backLeg.add(this.bShin);

    // Scarpa posteriore
    const bShoe = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.24), shoeMat);
    bShoe.position.set(0, -0.74, -0.02);
    bShoe.castShadow = true;
    this.backLeg.add(bShoe);
    const bSole = new THREE.Mesh(new THREE.BoxGeometry(0.124, 0.02, 0.244), soleMat);
    bSole.position.set(0, -0.78, -0.02);
    this.backLeg.add(bSole);

    this.pelvis.add(this.backLeg);

    // Posa iniziale skater da cruising (leggera torsione e piegamento ginocchia)
    this.pelvis.rotation.y = 0.45; // Angolato rispetto alla direzione di marcia
    this.skaterGroup.add(this.pelvis);
    this.group.add(this.skaterGroup);
  }

  // Esegui spinta col piede (Push)
  push() {
    if (this.isPushing || this.isJumping || this.isBraking) return;
    this.isPushing = true;
    this.pushTimer = 0;
    this.speed = Math.min(this.maxSpeed, this.speed + 0.08);
    sound.playFootstep();
  }

  // Esegui frenata brusca (Powerslide)
  brake(isKeyDown) {
    this.isBraking = isKeyDown;
    if (this.isBraking) {
      this.speed = Math.max(this.minSpeed, this.speed - 0.015);
      if (Math.random() < 0.25) sound.playPowerslide();
    }
  }

  // Esegui salto Ollie
  ollie() {
    if (this.isJumping) return;
    this.isJumping = true;
    this.jumpVelocity = 0.16;
    this.jumpHeight = 0;
    sound.playOlliePop();
  }

  // Attiva animazione del gesto polemico quando incrocia un passante
  triggerDialogueGesture() {
    this.gestureTimer = 45; // Durata frame dell'animazione
  }

  // Sterzata (direzione: -1 sinistra, +1 destra, 0 neutro)
  steer(dir) {
    if (dir !== 0) {
      this.laneX += dir * this.lateralSpeed;
      // Limite carreggiata (tra i marciapiedi)
      this.laneX = Math.max(-4.2, Math.min(4.2, this.laneX));
      // Inclinazione tavola (lean sui gommini del truck)
      this.turnAngle = THREE.MathUtils.lerp(this.turnAngle, dir * 0.22, 0.2);
      this.leanAngle = THREE.MathUtils.lerp(this.leanAngle, -dir * 0.18, 0.25);
    } else {
      this.turnAngle = THREE.MathUtils.lerp(this.turnAngle, 0, 0.15);
      this.leanAngle = THREE.MathUtils.lerp(this.leanAngle, 0, 0.2);
    }
  }

  update(delta) {
    // 1. Avanzamento lungo l'asse Z negativo (strada dritta infinita)
    this.position.z -= this.speed * 60 * delta;
    this.position.x = this.laneX;

    // Attrito naturale e ritorno alla velocità di crociera
    if (!this.isBraking && !this.isPushing) {
      if (this.speed > this.baseSpeed) {
        this.speed = Math.max(this.baseSpeed, this.speed - 0.02 * delta);
      } else if (this.speed < this.baseSpeed) {
        this.speed = Math.min(this.baseSpeed, this.speed + 0.02 * delta);
      }
    }

    // 2. Fisica Ollie (Salto con gravità)
    if (this.isJumping) {
      this.jumpHeight += this.jumpVelocity;
      this.jumpVelocity -= 0.012; // Gravità

      // Animazione del pop: la tavola prima alza il nose, poi si livella, poi scende
      if (this.jumpVelocity > 0.05) {
        this.boardGroup.rotation.x = -0.35; // Pop
      } else if (this.jumpVelocity < -0.05) {
        this.boardGroup.rotation.x = 0.15;  // Prep landing
      } else {
        this.boardGroup.rotation.x = 0.0;   // Livellata in aria
      }

      if (this.jumpHeight <= 0) {
        this.jumpHeight = 0;
        this.isJumping = false;
        this.jumpVelocity = 0;
        this.boardGroup.rotation.x = 0;
        sound.playLanding();
      }
    }
    this.position.y = this.jumpHeight;

    // 3. Animazione Push (gamba posteriore che spinge a terra)
    if (this.isPushing) {
      this.pushTimer += delta * 6.5;
      const progress = this.pushTimer;

      if (progress < 1.0) {
        // Discesa del piede verso l'asfalto e spinta all'indietro
        const kickZ = Math.sin(progress * Math.PI) * 0.35;
        const kickY = -Math.sin(progress * Math.PI) * 0.18;
        this.backLeg.position.z = 0.24 + kickZ;
        this.backLeg.position.y = kickY;
        this.backLeg.rotation.x = -Math.sin(progress * Math.PI) * 0.45;
      } else {
        // Ritorno sul tail della tavola
        this.isPushing = false;
        this.backLeg.position.set(0.06, 0.0, 0.24);
        this.backLeg.rotation.x = 0;
      }
    }

    // 4. Animazione Powerslide (Tavola di traverso e piegata)
    if (this.isBraking) {
      this.boardGroup.rotation.y = THREE.MathUtils.lerp(this.boardGroup.rotation.y, Math.PI / 2.6, 0.2);
      this.pelvis.position.y = THREE.MathUtils.lerp(this.pelvis.position.y, 0.65, 0.2); // Accovacciato
    } else {
      this.boardGroup.rotation.y = THREE.MathUtils.lerp(this.boardGroup.rotation.y, this.turnAngle, 0.18);
      this.pelvis.position.y = THREE.MathUtils.lerp(this.pelvis.position.y, 0.85, 0.15);
    }

    // Inclinazione tavola laterale (Lean sui gommini)
    this.boardGroup.rotation.z = this.leanAngle;

    // 5. Rotazione continua delle ruote proporzionale alla velocità
    const wheelRotSpeed = this.speed * 8.5;
    this.wheels.forEach(w => {
      w.children[0].rotation.x += wheelRotSpeed;
    });

    // 6. Animazione gesticolazione polemica del braccio destro
    if (this.gestureTimer > 0) {
      this.gestureTimer--;
      // Alza la mano destra a indicare il passante con sarcasmo
      this.rightArm.rotation.x = -1.2;
      this.rightArm.rotation.z = 0.4;
    } else {
      // Posizione naturale di bilanciamento delle braccia
      const balanceSway = Math.sin(Date.now() * 0.005) * 0.08;
      this.leftArm.rotation.z = 0.35 + balanceSway;
      this.rightArm.rotation.z = -0.35 - balanceSway;
      this.rightArm.rotation.x = 0;
    }

    // 7. Leggero molleggio naturale del corpo (cruising bobbing)
    if (!this.isJumping) {
      const bobbing = Math.sin(Date.now() * 0.012 * (this.speed / this.baseSpeed)) * 0.018;
      this.skaterGroup.position.y = bobbing;
    }

    // 8. Aggiorna posizione nello spazio 3D globale
    this.group.position.copy(this.position);

    // 9. Aggiorna audio di rotolamento delle ruote
    sound.updateRoll(this.speed, !this.isJumping);
  }
}
