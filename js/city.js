/* ==========================================================================
   STREET CRITIC: Skater Polemico - Procedural Infinite Realistic City
   Generazione continua di strada, marciapiedi con cordolo, palazzi realistici,
   lampioni, cantieri comunali, alberi, arredo urbano e illuminazione solare.
   ========================================================================== */

import { TextureGenerator } from './textures.js';

export class City {
  constructor(scene) {
    this.scene = scene;

    // Configurazione dimensionale
    this.roadWidth = 6.4;
    this.sidewalkWidth = 3.6;
    this.segmentLength = 60; // Lunghezza di ogni blocco urbano
    this.visibleSegments = 5;

    this.segments = [];
    this.furthestZ = 0;

    // Inizializza texture riutilizzabili
    this.asphaltTexture = TextureGenerator.createAsphaltTexture();
    this.asphaltTexture.repeat.set(1, 4);

    this.sidewalkTexture = TextureGenerator.createSidewalkTexture();
    this.sidewalkTexture.repeat.set(1.5, 6);

    this.hazardTexture = TextureGenerator.createHazardStripesTexture();
    this.hazardTexture.repeat.set(3, 1);

    this.manholeTexture = TextureGenerator.createManholeTexture();

    // Materiali condivisi per massimizzare le performance WebGL
    this.materials = {
      asphalt: new THREE.MeshStandardMaterial({
        map: this.asphaltTexture,
        roughness: 0.85,
        metalness: 0.05
      }),
      sidewalk: new THREE.MeshStandardMaterial({
        map: this.sidewalkTexture,
        roughness: 0.8,
        metalness: 0.02
      }),
      curb: new THREE.MeshStandardMaterial({
        color: 0x85878a,
        roughness: 0.75
      }),
      metalPole: new THREE.MeshStandardMaterial({
        color: 0x212529,
        metalness: 0.85,
        roughness: 0.3
      }),
      lampLight: new THREE.MeshBasicMaterial({
        color: 0xfff3d1
      }),
      hazard: new THREE.MeshStandardMaterial({
        map: this.hazardTexture,
        roughness: 0.5
      }),
      manhole: new THREE.MeshStandardMaterial({
        map: this.manholeTexture,
        roughness: 0.7,
        metalness: 0.6
      }),
      treeTrunk: new THREE.MeshStandardMaterial({
        color: 0x4a2e18,
        roughness: 0.9
      }),
      treeLeaves: new THREE.MeshStandardMaterial({
        color: 0x2e6930,
        roughness: 0.8
      }),
      trashBin: new THREE.MeshStandardMaterial({
        color: 0x27ae60, // Verde cassonetto
        roughness: 0.6
      }),
      benchWood: new THREE.MeshStandardMaterial({
        color: 0x784212,
        roughness: 0.7
      })
    };

    // Crea un set di texture per i palazzi con stili diversi
    this.buildingTextures = [
      TextureGenerator.createBuildingTexture(0),
      TextureGenerator.createBuildingTexture(1),
      TextureGenerator.createBuildingTexture(2),
      TextureGenerator.createBuildingTexture(3)
    ];

    this.setupLighting();
    this.buildInitialCity();
  }

  setupLighting() {
    // 1. Luce Ambientale naturale (cielo metropolitano)
    const ambientLight = new THREE.AmbientLight(0xced8e2, 0.75);
    this.scene.add(ambientLight);

    // 2. Luce Solare Direzionale (pomeriggio dorato / ombre realistiche)
    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.25);
    sunLight.position.set(28, 48, 18);
    sunLight.castShadow = true;

    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 140;

    const d = 26;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;

    this.sunLight = sunLight;
    this.scene.add(sunLight);

    // 3. Nebbia atmosferica di profondità (sfumatura verso l'orizzonte urbano)
    this.scene.fog = new THREE.Fog(0xb8c6d4, 45, 150);
  }

  // Costruisce un singolo segmento di viale urbano lungo 60 metri
  createSegment(zStart) {
    const group = new THREE.Group();
    group.position.z = zStart;

    // --- CARREGGIATA ASFALTATA ---
    const roadGeo = new THREE.PlaneGeometry(this.roadWidth, this.segmentLength);
    const roadMesh = new THREE.Mesh(roadGeo, this.materials.asphalt);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.position.set(0, 0, -this.segmentLength / 2);
    roadMesh.receiveShadow = true;
    group.add(roadMesh);

    // Tombini in ghisa lungo la carreggiata
    if (Math.random() < 0.6) {
      const manhole = new THREE.Mesh(new THREE.CircleGeometry(0.42, 20), this.materials.manhole);
      manhole.rotation.x = -Math.PI / 2;
      manhole.position.set((Math.random() > 0.5 ? 1 : -1) * 1.5, 0.003, -Math.random() * this.segmentLength);
      group.add(manhole);
    }

    // Strisce pedonali a inizio blocco
    const crosswalkGeo = new THREE.PlaneGeometry(0.48, 4.2);
    const crosswalkMat = new THREE.MeshStandardMaterial({ color: 0xededed, roughness: 0.7 });
    for (let c = -2.4; c <= 2.4; c += 0.8) {
      const stripe = new THREE.Mesh(crosswalkGeo, crosswalkMat);
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(c, 0.002, -4);
      group.add(stripe);
    }

    // --- MARCIAPIEDI DESTRO E SINISTRO CON CORDOLO ---
    [-1, 1].forEach((side) => {
      const xCenter = side * (this.roadWidth / 2 + this.sidewalkWidth / 2);

      // Piano marciapiede (leggermente rialzato di 15cm)
      const walkGeo = new THREE.BoxGeometry(this.sidewalkWidth, 0.15, this.segmentLength);
      const walkMesh = new THREE.Mesh(walkGeo, this.materials.sidewalk);
      walkMesh.position.set(xCenter, 0.075, -this.segmentLength / 2);
      walkMesh.receiveShadow = true;
      group.add(walkMesh);

      // Cordolo in pietra di granito
      const curbX = side * (this.roadWidth / 2 + 0.08);
      const curbGeo = new THREE.BoxGeometry(0.16, 0.16, this.segmentLength);
      const curbMesh = new THREE.Mesh(curbGeo, this.materials.curb);
      curbMesh.position.set(curbX, 0.08, -this.segmentLength / 2);
      group.add(curbMesh);
    });

    // --- PALAZZI URBANI A SCHIERA SUI LATI ---
    [-1, 1].forEach((side) => {
      let currentZ = 0;
      while (currentZ < this.segmentLength) {
        const buildingWidth = 12 + Math.random() * 8;
        const buildingHeight = 16 + Math.random() * 20; // 4-8 piani
        const buildingDepth = 15;

        const xPos = side * (this.roadWidth / 2 + this.sidewalkWidth + buildingDepth / 2);
        const zPos = -(currentZ + buildingWidth / 2);

        const texIndex = Math.floor(Math.random() * this.buildingTextures.length);
        const bldgMat = new THREE.MeshStandardMaterial({
          map: this.buildingTextures[texIndex],
          roughness: 0.75,
          metalness: 0.1
        });

        const bldgGeo = new THREE.BoxGeometry(buildingDepth, buildingHeight, buildingWidth);
        const bldgMesh = new THREE.Mesh(bldgGeo, bldgMat);
        bldgMesh.position.set(xPos, buildingHeight / 2, zPos);
        bldgMesh.castShadow = true;
        bldgMesh.receiveShadow = true;
        group.add(bldgMesh);

        // Cornicione superiore sul tetto
        const roofTrimGeo = new THREE.BoxGeometry(buildingDepth + 0.4, 0.5, buildingWidth + 0.4);
        const roofTrim = new THREE.Mesh(roofTrimGeo, this.materials.curb);
        roofTrim.position.set(xPos, buildingHeight + 0.25, zPos);
        group.add(roofTrim);

        currentZ += buildingWidth + 0.2;
      }
    });

    // --- ELEMENTI DI ARREDO URBANO (Lampioni, Cantieri, Alberi, Panchine) ---
    // 1. Lampioni stradali (uno ogni ~28m)
    for (let lz = 12; lz < this.segmentLength; lz += 28) {
      const side = Math.random() > 0.5 ? 1 : -1;
      const lx = side * (this.roadWidth / 2 + 0.6);
      this.addStreetlight(group, lx, -lz, side);
    }

    // 2. Cantiere stradale (transenne e birilli, elemento iconico per gli Umarell!)
    if (Math.random() < 0.65) {
      const cantiereZ = -(15 + Math.random() * (this.segmentLength - 30));
      const cSide = Math.random() > 0.5 ? 1 : -1;
      this.addConstructionSite(group, cSide * 3.6, cantiereZ);
    }

    // 3. Alberi di viale
    for (let tz = 6; tz < this.segmentLength; tz += 18) {
      const side = Math.random() > 0.5 ? 1 : -1;
      const tx = side * (this.roadWidth / 2 + 2.4);
      this.addTree(group, tx, -tz);
    }

    // 4. Cassonetti o panchine
    if (Math.random() < 0.5) {
      const bx = (Math.random() > 0.5 ? 1 : -1) * (this.roadWidth / 2 + 2.6);
      this.addTrashBin(group, bx, -Math.random() * this.segmentLength);
    }

    this.scene.add(group);
    return {
      group,
      zStart,
      zEnd: zStart - this.segmentLength
    };
  }

  addStreetlight(parent, x, z, side) {
    const poleHeight = 5.2;
    // Palo verticale
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, poleHeight, 10), this.materials.metalPole);
    pole.position.set(x, poleHeight / 2, z);
    pole.castShadow = true;
    parent.add(pole);

    // Braccio ricurvo verso la strada
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.08, 0.08), this.materials.metalPole);
    arm.position.set(x - side * 0.45, poleHeight - 0.1, z);
    parent.add(arm);

    // Lanterna LED
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.2), this.materials.lampLight);
    lamp.position.set(x - side * 0.85, poleHeight - 0.15, z);
    parent.add(lamp);
  }

  addConstructionSite(parent, x, z) {
    const cantiereGroup = new THREE.Group();
    cantiereGroup.position.set(x, 0, z);

    // Transenna zebrata bianco-rossa
    const barrierGeo = new THREE.BoxGeometry(0.1, 0.8, 2.4);
    const barrier = new THREE.Mesh(barrierGeo, this.materials.hazard);
    barrier.position.set(0, 0.45, 0);
    barrier.castShadow = true;
    cantiereGroup.add(barrier);

    // Piedi in metallo della transenna
    [-1.0, 1.0].forEach(pz => {
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.04, 0.08), this.materials.metalPole);
      foot.position.set(0, 0.02, pz);
      cantiereGroup.add(foot);
    });

    // Cono stradale arancione
    const coneMat = new THREE.MeshStandardMaterial({ color: 0xe67e22 });
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.55, 12), coneMat);
    cone.position.set(0.4, 0.28, 0.6);
    cone.castShadow = true;
    cantiereGroup.add(cone);

    parent.add(cantiereGroup);
  }

  addTree(parent, x, z) {
    const trunkHeight = 2.4;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, trunkHeight, 10), this.materials.treeTrunk);
    trunk.position.set(x, trunkHeight / 2 + 0.15, z);
    trunk.castShadow = true;
    parent.add(trunk);

    const foliage = new THREE.Mesh(new THREE.SphereGeometry(1.2, 12, 12), this.materials.treeLeaves);
    foliage.position.set(x, trunkHeight + 0.9, z);
    foliage.castShadow = true;
    parent.add(foliage);
  }

  addTrashBin(parent, x, z) {
    const bin = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.85, 0.9), this.materials.trashBin);
    bin.position.set(x, 0.55, z);
    bin.castShadow = true;
    parent.add(bin);
  }

  buildInitialCity() {
    let currentZ = 30; // Inizia leggermente dietro allo skater
    for (let i = 0; i < this.visibleSegments; i++) {
      const seg = this.createSegment(currentZ);
      this.segments.push(seg);
      currentZ -= this.segmentLength;
    }
    this.furthestZ = currentZ;
  }

  update(skaterZ) {
    // Muovi il sole assieme allo skater per mantenere ombre nitide e uniformi
    if (this.sunLight) {
      this.sunLight.position.z = skaterZ + 18;
      this.sunLight.target.position.z = skaterZ - 10;
      this.sunLight.target.updateMatrixWorld();
    }

    // Aggiungi nuovi segmenti in avanti man mano che lo skater procede
    while (this.furthestZ > skaterZ - 140) {
      const newSeg = this.createSegment(this.furthestZ);
      this.segments.push(newSeg);
      this.furthestZ -= this.segmentLength;
    }

    // Rimuovi i segmenti che sono rimasti molto dietro alla telecamera
    while (this.segments.length > 0 && this.segments[0].zEnd > skaterZ + 45) {
      const oldSeg = this.segments.shift();
      this.scene.remove(oldSeg.group);
      // Pulizia memoria geometrie/mesh
      oldSeg.group.traverse(child => {
        if (child.geometry) child.geometry.dispose();
      });
    }
  }

  reset() {
    this.segments.forEach(seg => {
      this.scene.remove(seg.group);
      seg.group.traverse(child => {
        if (child.geometry) child.geometry.dispose();
      });
    });
    this.segments = [];
    this.furthestZ = 0;
    this.buildInitialCity();
  }
}
