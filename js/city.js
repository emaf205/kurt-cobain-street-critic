/* ==========================================================================
   VIA SAVONA CRITIC: Milan Urban Environment & Interactive Obstacles
   Via Savona architecture (brick showrooms, design lofts, Milan street signs)
   and street obstacles to dodge or jump over (delivery boxes, parked e-scooters,
   cocktail bistro tables, and roadworks barriers).
   ========================================================================== */

import { TextureGenerator } from './textures.js';

export class City {
  constructor(scene) {
    this.scene = scene;

    this.roadWidth = 6.8;
    this.sidewalkWidth = 4.2;
    this.segmentLength = 60;
    this.visibleSegments = 5;

    this.segments = [];
    this.obstacles = []; // Active obstacle collision entities
    this.furthestZ = 0;

    // Procedural Textures
    this.asphaltTexture = TextureGenerator.createAsphaltTexture();
    this.asphaltTexture.repeat.set(1, 4);

    this.sidewalkTexture = TextureGenerator.createSidewalkTexture();
    this.sidewalkTexture.repeat.set(1.5, 6);

    this.boxTexture = TextureGenerator.createBoxTexture();

    // Reusable Materials
    this.materials = {
      asphalt: new THREE.MeshStandardMaterial({ map: this.asphaltTexture, roughness: 0.85 }),
      sidewalk: new THREE.MeshStandardMaterial({ map: this.sidewalkTexture, roughness: 0.8 }),
      curb: new THREE.MeshStandardMaterial({ color: 0x6e7073, roughness: 0.75 }),
      metal: new THREE.MeshStandardMaterial({ color: 0x222426, metalness: 0.8, roughness: 0.3 }),
      cardboard: new THREE.MeshStandardMaterial({ map: this.boxTexture, roughness: 0.85 }),
      hazardOrange: new THREE.MeshStandardMaterial({ color: 0xe67e22, roughness: 0.5 }),
      hazardRed: new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: 0.5 }),
      whiteStripe: new THREE.MeshStandardMaterial({ color: 0xfdfefe, roughness: 0.4 }),
      scooterLime: new THREE.MeshStandardMaterial({ color: 0x00e676, roughness: 0.4 })
    };

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
    // Ambient Milanese afternoon light
    const ambientLight = new THREE.AmbientLight(0xd5dfe8, 0.75);
    this.scene.add(ambientLight);

    // Warm directional sun
    const sunLight = new THREE.DirectionalLight(0xfff5e4, 1.25);
    sunLight.position.set(24, 45, 15);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 140;

    const d = 28;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;

    this.sunLight = sunLight;
    this.scene.add(sunLight);

    // Atmospheric Milan haze
    this.scene.fog = new THREE.Fog(0x9ca8b5, 40, 145);
  }

  createSegment(zStart) {
    const group = new THREE.Group();
    group.position.z = zStart;

    // --- CARREGGIATA VIA SAVONA ---
    const roadGeo = new THREE.PlaneGeometry(this.roadWidth, this.segmentLength);
    const roadMesh = new THREE.Mesh(roadGeo, this.materials.asphalt);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.position.set(0, 0, -this.segmentLength / 2);
    roadMesh.receiveShadow = true;
    group.add(roadMesh);

    // --- MARCIAPIEDI DESTRO E SINISTRO ---
    [-1, 1].forEach((side) => {
      const xCenter = side * (this.roadWidth / 2 + this.sidewalkWidth / 2);

      // Piattaforma marciapiede
      const walkGeo = new THREE.BoxGeometry(this.sidewalkWidth, 0.15, this.segmentLength);
      const walkMesh = new THREE.Mesh(walkGeo, this.materials.sidewalk);
      walkMesh.position.set(xCenter, 0.075, -this.segmentLength / 2);
      walkMesh.receiveShadow = true;
      group.add(walkMesh);

      // Cordolo
      const curbX = side * (this.roadWidth / 2 + 0.08);
      const curbGeo = new THREE.BoxGeometry(0.16, 0.16, this.segmentLength);
      const curbMesh = new THREE.Mesh(curbGeo, this.materials.curb);
      curbMesh.position.set(curbX, 0.08, -this.segmentLength / 2);
      group.add(curbMesh);
    });

    // --- PALAZZI LOFT & SHOWROOM VIA SAVONA ---
    [-1, 1].forEach((side) => {
      let currentZ = 0;
      while (currentZ < this.segmentLength) {
        const buildingWidth = 14 + Math.random() * 8;
        const buildingHeight = 18 + Math.random() * 16;
        const buildingDepth = 16;

        const xPos = side * (this.roadWidth / 2 + this.sidewalkWidth + buildingDepth / 2);
        const zPos = -(currentZ + buildingWidth / 2);

        const texIndex = Math.floor(Math.random() * this.buildingTextures.length);
        const bldgMat = new THREE.MeshStandardMaterial({
          map: this.buildingTextures[texIndex],
          roughness: 0.8,
          metalness: 0.08
        });

        const bldgGeo = new THREE.BoxGeometry(buildingDepth, buildingHeight, buildingWidth);
        const bldgMesh = new THREE.Mesh(bldgGeo, bldgMat);
        bldgMesh.position.set(xPos, buildingHeight / 2, zPos);
        bldgMesh.castShadow = true;
        bldgMesh.receiveShadow = true;
        group.add(bldgMesh);

        currentZ += buildingWidth + 0.2;
      }
    });

    // --- OSTACOLI DA SCHIVARE O SALTARE ---
    // 1. Pila di scatole da consegna showroom ("FRAGILE // MILANO DESIGN")
    if (Math.random() < 0.75) {
      const boxZ = -(10 + Math.random() * (this.segmentLength - 20));
      const boxSide = Math.random() > 0.5 ? 1 : -1;
      const boxX = boxSide * (1.2 + Math.random() * 2.8);
      this.spawnBoxObstacle(group, boxX, boxZ, zStart);
    }

    // 2. Monopattino elettrico abbandonato sul marciapiede / bordo strada
    if (Math.random() < 0.65) {
      const scootZ = -(18 + Math.random() * (this.segmentLength - 25));
      const scootSide = Math.random() > 0.5 ? 1 : -1;
      const scootX = scootSide * (1.8 + Math.random() * 2.2);
      this.spawnScooterObstacle(group, scootX, scootZ, zStart);
    }

    // 3. Tavolino e sedie aperitivo milanese
    if (Math.random() < 0.55) {
      const tableZ = -(25 + Math.random() * (this.segmentLength - 30));
      const tableSide = Math.random() > 0.5 ? 1 : -1;
      const tableX = tableSide * (3.2 + Math.random() * 1.2);
      this.spawnBistroObstacle(group, tableX, tableZ, zStart);
    }

    // 4. Barriera cantiere A2A / fibra ottica
    if (Math.random() < 0.5) {
      const barrierZ = -(8 + Math.random() * (this.segmentLength - 16));
      const barrierX = (Math.random() > 0.5 ? 1 : -1) * 2.2;
      this.spawnBarrierObstacle(group, barrierX, barrierZ, zStart);
    }

    this.scene.add(group);
    return {
      group,
      zStart,
      zEnd: zStart - this.segmentLength
    };
  }

  // Obstacle 1: Cardboard Box Stack
  spawnBoxObstacle(parent, x, relZ, zStart) {
    const boxGroup = new THREE.Group();
    boxGroup.position.set(x, 0.35, relZ);

    const box = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.7), this.materials.cardboard);
    box.castShadow = true;
    boxGroup.add(box);

    parent.add(boxGroup);

    this.obstacles.push({
      mesh: boxGroup,
      x: x,
      z: zStart + relZ,
      radius: 0.6,
      height: 0.75,
      name: "Delivery Box Stack"
    });
  }

  // Obstacle 2: Dumped Electric Scooter
  spawnScooterObstacle(parent, x, relZ, zStart) {
    const scootGroup = new THREE.Group();
    scootGroup.position.set(x, 0.1, relZ);
    scootGroup.rotation.z = 0.85; // Knocked over on its side

    const deck = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.95), this.materials.scooterLime);
    deck.castShadow = true;
    scootGroup.add(deck);

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.0, 8), this.materials.metal);
    pole.position.set(0, 0.45, 0.4);
    scootGroup.add(pole);

    parent.add(scootGroup);

    this.obstacles.push({
      mesh: scootGroup,
      x: x,
      z: zStart + relZ,
      radius: 0.65,
      height: 0.45,
      name: "Dumped E-Scooter"
    });
  }

  // Obstacle 3: Outdoor Bistro Table & Chairs
  spawnBistroObstacle(parent, x, relZ, zStart) {
    const bistroGroup = new THREE.Group();
    bistroGroup.position.set(x, 0, relZ);

    // Round cocktail table
    const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.04, 16), this.materials.metal);
    tableTop.position.y = 0.78;
    tableTop.castShadow = true;
    bistroGroup.add(tableTop);

    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.76, 8), this.materials.metal);
    leg.position.y = 0.38;
    bistroGroup.add(leg);

    parent.add(bistroGroup);

    this.obstacles.push({
      mesh: bistroGroup,
      x: x,
      z: zStart + relZ,
      radius: 0.55,
      height: 0.85,
      name: "Aperitivo Table"
    });
  }

  // Obstacle 4: Roadworks Hazard Barrier
  spawnBarrierObstacle(parent, x, relZ, zStart) {
    const barrierGroup = new THREE.Group();
    barrierGroup.position.set(x, 0.42, relZ);

    const board = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.65, 0.08), this.materials.hazardOrange);
    board.castShadow = true;
    barrierGroup.add(board);

    parent.add(barrierGroup);

    this.obstacles.push({
      mesh: barrierGroup,
      x: x,
      z: zStart + relZ,
      radius: 0.9,
      height: 0.8,
      name: "Roadworks Barrier"
    });
  }

  // Collision Check between Kurt and Street Obstacles
  checkCollisions(kurt) {
    for (let i = 0; i < this.obstacles.length; i++) {
      const obs = this.obstacles[i];
      const dx = kurt.position.x - obs.x;
      const dz = kurt.position.z - obs.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < obs.radius) {
        // If Kurt is jumping high enough to clear the obstacle
        if (kurt.position.y > obs.height - 0.1) {
          // Cleared via jump!
          continue;
        }

        // Stumble!
        kurt.stumble();
        return obs;
      }
    }
    return null;
  }

  buildInitialCity() {
    let currentZ = 20;
    for (let i = 0; i < this.visibleSegments; i++) {
      const seg = this.createSegment(currentZ);
      this.segments.push(seg);
      currentZ -= this.segmentLength;
    }
    this.furthestZ = currentZ;
  }

  update(kurtZ) {
    if (this.sunLight) {
      this.sunLight.position.z = kurtZ + 16;
      this.sunLight.target.position.z = kurtZ - 10;
      this.sunLight.target.updateMatrixWorld();
    }

    // Add new street segments ahead
    while (this.furthestZ > kurtZ - 140) {
      const newSeg = this.createSegment(this.furthestZ);
      this.segments.push(newSeg);
      this.furthestZ -= this.segmentLength;
    }

    // Remove segments far behind
    while (this.segments.length > 0 && this.segments[0].zEnd > kurtZ + 35) {
      const oldSeg = this.segments.shift();
      this.scene.remove(oldSeg.group);
      oldSeg.group.traverse(c => { if (c.geometry) c.geometry.dispose(); });

      // Clean up old obstacles
      this.obstacles = this.obstacles.filter(o => o.z < kurtZ + 35);
    }
  }

  reset() {
    this.segments.forEach(seg => {
      this.scene.remove(seg.group);
      seg.group.traverse(c => { if (c.geometry) c.geometry.dispose(); });
    });
    this.segments = [];
    this.obstacles = [];
    this.furthestZ = 0;
    this.buildInitialCity();
  }
}
