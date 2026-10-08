/* ==========================================================================
   STREET CRITIC: Skater Polemico - Pedestrians Manager & 3D Archetypes
   Modelli 3D realistici e differenziati per tutti gli archetipi urbani,
   gestione del pool, animazioni di camminata/reazione e trigger di prossimità.
   ========================================================================== */

import { PEDESTRIAN_TYPES, PEDESTRIAN_CONFIG, getRandomDialogue } from './dialogues.js';
import { sound } from './audio.js';

export class PedestrianManager {
  constructor(scene) {
    this.scene = scene;
    this.pedestrians = [];
    this.spawnDistance = 110; // Distanza a cui generare i nuovi pedoni
    this.lastSpawnZ = -15;

    // Tipi di pedoni disponibili per la generazione casuale
    this.typeList = Object.values(PEDESTRIAN_TYPES);

    // Callback per comunicare con l'interfaccia UI
    this.onDialogueTriggered = null;
  }

  // Costruisce la mesh 3D specifica in base all'archetipo
  createPedestrianMesh(type) {
    const config = PEDESTRIAN_CONFIG[type];
    const group = new THREE.Group();

    // Materiali di base
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xf5cba7, roughness: 0.6 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.9 });
    const outfitMat = new THREE.MeshStandardMaterial({ color: config.colorOutfit, roughness: 0.75 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: config.colorPants || 0x2c3e50, roughness: 0.8 });
    const shoesMat = new THREE.MeshStandardMaterial({ color: 0x17202a, roughness: 0.6 });

    // 1. Gambe
    const legGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.72, 10);
    const leftLeg = new THREE.Mesh(legGeo, pantsMat);
    leftLeg.position.set(-0.13, 0.36, 0);
    leftLeg.castShadow = true;
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, pantsMat);
    rightLeg.position.set(0.13, 0.36, 0);
    rightLeg.castShadow = true;
    group.add(rightLeg);

    // Scarpe
    const shoeGeo = new THREE.BoxGeometry(0.12, 0.08, 0.22);
    const leftShoe = new THREE.Mesh(shoeGeo, shoesMat);
    leftShoe.position.set(-0.13, 0.04, 0.04);
    group.add(leftShoe);

    const rightShoe = new THREE.Mesh(shoeGeo, shoesMat);
    rightShoe.position.set(0.13, 0.04, 0.04);
    group.add(rightShoe);

    // 2. Busto / Abito
    const torsoGeo = new THREE.BoxGeometry(0.42, 0.58, 0.26);
    const torso = new THREE.Mesh(torsoGeo, outfitMat);
    torso.position.y = 1.02;
    torso.castShadow = true;
    group.add(torso);

    // 3. Testa & Volto
    const headGeo = new THREE.SphereGeometry(0.135, 16, 16);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 1.45;
    head.castShadow = true;
    group.add(head);

    // 4. Braccia
    const armGeo = new THREE.CylinderGeometry(0.065, 0.055, 0.54, 10);
    const leftArm = new THREE.Mesh(armGeo, outfitMat);
    leftArm.position.set(-0.28, 1.0, 0);
    group.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, outfitMat);
    rightArm.position.set(0.28, 1.0, 0);
    group.add(rightArm);

    // -------------------------------------------------------------
    // PERSONALIZZAZIONI SPECIFICHE PER ARCHETIPO
    // -------------------------------------------------------------
    switch (type) {
      case PEDESTRIAN_TYPES.UMARELL: {
        // Coppola grigia in testa
        const capMat = new THREE.MeshStandardMaterial({ color: 0x7f8c8d });
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.05, 14), capMat);
        cap.position.set(0, 1.55, 0);
        group.add(cap);

        // Mani dietro la schiena (classica postura da cantiere)
        leftArm.rotation.set(0.7, 0, -0.4);
        rightArm.rotation.set(0.7, 0, 0.4);
        leftArm.position.set(-0.2, 0.95, -0.15);
        rightArm.position.set(0.2, 0.95, -0.15);
        break;
      }

      case PEDESTRIAN_TYPES.MANAGER: {
        // Cravatta rossa
        const tieMat = new THREE.MeshStandardMaterial({ color: 0xc0392b });
        const tie = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.32, 0.02), tieMat);
        tie.position.set(0, 1.05, 0.14);
        group.add(tie);

        // Valigetta 24ore in cuoio scuro nella mano destra
        const caseMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.4 });
        const briefcase = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.28, 0.38), caseMat);
        briefcase.position.set(0.38, 0.65, 0);
        group.add(briefcase);
        break;
      }

      case PEDESTRIAN_TYPES.VIGILE: {
        // Pettorina catarifrangente giallo fluo
        const vestMat = new THREE.MeshStandardMaterial({ color: 0xf4d03f, roughness: 0.3 });
        const vest = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.46, 0.28), vestMat);
        vest.position.y = 1.02;
        group.add(vest);

        // Berretto da vigile bianco/blu
        const policeCapMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const policeCap = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 0.08, 16), policeCapMat);
        policeCap.position.y = 1.56;
        group.add(policeCap);
        break;
      }

      case PEDESTRIAN_TYPES.INFLUENCER: {
        // Selfie stick con smartphone alzato verso l'alto
        const stickMat = new THREE.MeshStandardMaterial({ color: 0xbdc3c7, metalness: 0.8 });
        const phoneMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
        const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.6, 8), stickMat);
        stick.position.set(0.2, 1.45, 0.3);
        stick.rotation.set(-0.6, 0, -0.3);
        group.add(stick);

        const phone = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.2, 0.015), phoneMat);
        phone.position.set(0.32, 1.72, 0.45);
        phone.rotation.set(-0.6, 0, -0.3);
        group.add(phone);

        rightArm.rotation.set(-1.2, 0, 0.4);
        break;
      }

      case PEDESTRIAN_TYPES.BOOMER_MONOPATTINO: {
        // Caschetto giallo fluo
        const helmetMat = new THREE.MeshStandardMaterial({ color: 0xf1c40f });
        const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 14, 0, Math.PI * 2, 0, Math.PI / 1.8), helmetMat);
        helmet.position.y = 1.52;
        group.add(helmet);

        // Monopattino elettrico
        const scooterMat = new THREE.MeshStandardMaterial({ color: 0x27ae60 });
        const metalMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.9 });

        // Pedana monopattino
        const deck = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 0.9), scooterMat);
        deck.position.set(0, 0.08, 0);
        group.add(deck);

        // Asta e manubrio
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.1, 10), metalMat);
        pole.position.set(0, 0.62, 0.4);
        group.add(pole);

        const handlebar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 10), metalMat);
        handlebar.rotation.z = Math.PI / 2;
        handlebar.position.set(0, 1.16, 0.4);
        group.add(handlebar);

        // Braccia tese sul manubrio
        leftArm.rotation.set(-0.8, 0, 0.2);
        rightArm.rotation.set(-0.8, 0, -0.2);
        break;
      }

      case PEDESTRIAN_TYPES.SCIURA: {
        // Cagnolino barboncino al guinzaglio accanto alla signora
        const dogMat = new THREE.MeshStandardMaterial({ color: 0xfdfefe, roughness: 0.9 });
        const dogGroup = new THREE.Group();
        dogGroup.position.set(-0.65, 0.15, 0.3);

        const dogBody = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.32), dogMat);
        dogGroup.add(dogBody);
        const dogHead = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 10), dogMat);
        dogHead.position.set(0, 0.14, 0.18);
        dogGroup.add(dogHead);

        // 4 zampine
        [-0.08, 0.08].forEach(x => {
          [-0.1, 0.1].forEach(z => {
            const paw = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.15, 8), dogMat);
            paw.position.set(x, -0.09, z);
            dogGroup.add(paw);
          });
        });

        group.add(dogGroup);
        break;
      }

      case PEDESTRIAN_TYPES.MARANZA: {
        // Borsello a tracolla scuro
        const pouchMat = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.5 });
        const pouch = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, 0.08), pouchMat);
        pouch.position.set(-0.16, 0.92, 0.14);
        group.add(pouch);

        // Cappellino con visiera dritta
        const mCapMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
        const mCap = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2), mCapMat);
        mCap.position.y = 1.5;
        group.add(mCap);
        break;
      }

      case PEDESTRIAN_TYPES.TURISTA: {
        // Zaino grande da trekking sulle spalle
        const packMat = new THREE.MeshStandardMaterial({ color: 0x2980b9, roughness: 0.8 });
        const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.52, 0.26), packMat);
        backpack.position.set(0, 1.05, -0.22);
        group.add(backpack);

        // Mappa spiegata tra le mani
        const mapMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
        const mapMesh = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.22, 0.01), mapMat);
        mapMesh.position.set(0, 1.05, 0.25);
        mapMesh.rotation.x = -0.4;
        group.add(mapMesh);

        leftArm.rotation.set(-0.7, 0, 0.2);
        rightArm.rotation.set(-0.7, 0, -0.2);
        break;
      }

      case PEDESTRIAN_TYPES.RUNNER: {
        // Fascia fluo per capelli
        const bandMat = new THREE.MeshStandardMaterial({ color: 0xe67e22 });
        const band = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.02, 8, 16), bandMat);
        band.position.y = 1.48;
        band.rotation.x = Math.PI / 2;
        group.add(band);
        break;
      }
    }

    return {
      group,
      leftLeg,
      rightLeg,
      leftArm,
      rightArm,
      type,
      config
    };
  }

  // Genera un nuovo pedone lungo il percorso
  spawnPedestrian(zPos) {
    const type = this.typeList[Math.floor(Math.random() * this.typeList.length)];
    const pedObj = this.createPedestrianMesh(type);

    // Posizione laterale X:
    // La maggior parte sta sul marciapiede (3.2 a 4.2 o -4.2 a -3.2),
    // alcuni stanno sul ciglio della strada (1.8 a 2.5 o -2.5 a -1.8)
    const side = Math.random() > 0.5 ? 1 : -1;
    let posX;
    if (Math.random() < 0.65) {
      posX = side * (3.1 + Math.random() * 1.0); // Marciapiede
    } else {
      posX = side * (1.6 + Math.random() * 0.9); // Bordo carreggiata
    }

    pedObj.group.position.set(posX, 0, zPos);

    // Rotazione: camminano incontro allo skater (verso Z positivo) o sono voltati verso la strada
    if (Math.random() < 0.7) {
      pedObj.group.rotation.y = 0; // Guardano verso lo skater in arrivo
    } else {
      pedObj.group.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2; // Guardano verso la strada
    }

    pedObj.interacted = false;
    pedObj.walkSpeed = 0.02 + Math.random() * 0.015;
    pedObj.animCycle = Math.random() * 10;
    pedObj.isStunned = false;

    this.scene.add(pedObj.group);
    this.pedestrians.push(pedObj);
  }

  // Aggiornamento frame e verifica prossimità
  update(delta, skater) {
    // 1. Spawna nuovi pedoni man mano che lo skater avanza
    while (this.lastSpawnZ > skater.position.z - this.spawnDistance) {
      this.lastSpawnZ -= 14 + Math.random() * 12; // Spaziatura di ~14-26 metri
      this.spawnPedestrian(this.lastSpawnZ);
    }

    // 2. Aggiorna ogni pedone attivo
    for (let i = this.pedestrians.length - 1; i >= 0; i--) {
      const p = this.pedestrians[i];

      // Animazione di camminata se non sono fermi
      if (!p.isStunned) {
        p.animCycle += delta * 5.0;
        const swing = Math.sin(p.animCycle) * 0.45;
        p.leftLeg.rotation.x = swing;
        p.rightLeg.rotation.x = -swing;

        // Se non è l'Umarell con le mani dietro la schiena o chi ha accessori fissi
        if (p.type !== PEDESTRIAN_TYPES.UMARELL && p.type !== PEDESTRIAN_TYPES.BOOMER_MONOPATTINO && p.type !== PEDESTRIAN_TYPES.TURISTA) {
          p.leftArm.rotation.x = -swing * 0.8;
          p.rightArm.rotation.x = swing * 0.8;
        }

        // Camminata in avanti lenta verso lo skater
        if (p.group.rotation.y === 0) {
          p.group.position.z += p.walkSpeed * 60 * delta;
        }
      }

      // 3. VERIFICA PROSSIMITÀ INTERAZIONE CON LO SKATER
      // Se lo skater è a distanza di ingaggio (~6-8.5 metri in linea d'asse Z)
      const distZ = skater.position.z - p.group.position.z;
      const distX = Math.abs(skater.position.x - p.group.position.x);

      if (!p.interacted && distZ > 0.5 && distZ < 7.5 && distX < 4.8) {
        p.interacted = true;
        p.isStunned = true; // Si ferma esterrefatto/stizzito

        // Fai voltare il pedone verso lo skater
        p.group.lookAt(skater.position.x, 0, skater.position.z);

        // Seleziona battuta polemica e reazione
        const dialogue = getRandomDialogue(p.type);

        // Skater esegue gesto polemico con la mano
        skater.triggerDialogueGesture();

        // Sintesi vocale italiana della battuta
        sound.speak(dialogue.skater);

        // Effetto sonoro punteggio dissing
        sound.playDissingScore();

        // Notifica la UI per mostrare i balloon e aggiornare statistiche
        if (this.onDialogueTriggered) {
          this.onDialogueTriggered(dialogue, p);
        }
      }

      // 4. Rimozione pedoni superati da tempo
      if (p.group.position.z > skater.position.z + 18) {
        this.scene.remove(p.group);
        this.pedestrians.splice(i, 1);
      }
    }
  }

  reset() {
    this.pedestrians.forEach(p => this.scene.remove(p.group));
    this.pedestrians = [];
    this.lastSpawnZ = -15;
  }
}
