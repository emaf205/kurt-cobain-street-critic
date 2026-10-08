/* ==========================================================================
   VIA SAVONA CRITIC: Milanese Pedestrians & Reactive AI
   Realistic pedestrian archetypes of Via Savona, dynamic walking, and authentic
   recoil reactions when Kurt confronts them with brutal grunge insults.
   ========================================================================== */

import { PEDESTRIAN_TYPES, PEDESTRIAN_CONFIG, getRandomDialogue } from './dialogues.js';
import { sound } from './audio.js';

export class PedestrianManager {
  constructor(scene) {
    this.scene = scene;
    this.pedestrians = [];
    this.spawnDistance = 85;
    this.lastSpawnZ = 0;

    this.typeList = Object.values(PEDESTRIAN_TYPES);
    this.onDialogueTriggered = null;
  }

  createPedestrianMesh(type) {
    const config = PEDESTRIAN_CONFIG[type];
    const group = new THREE.Group();

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xf5cba7, roughness: 0.65 });
    const outfitMat = new THREE.MeshStandardMaterial({ color: config.colorOutfit, roughness: 0.8 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: config.colorPants || 0x222222, roughness: 0.85 });
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.6 });

    // Legs
    const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.72, 8), pantsMat);
    leftLeg.position.set(-0.13, 0.36, 0);
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.72, 8), pantsMat);
    rightLeg.position.set(0.13, 0.36, 0);
    group.add(rightLeg);

    // Torso / Outfit
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.58, 0.24), outfitMat);
    torso.position.y = 1.02;
    torso.castShadow = true;
    group.add(torso);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 14), skinMat);
    head.position.y = 1.45;
    head.castShadow = true;
    group.add(head);

    // Arms
    const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.52, 8), outfitMat);
    leftArm.position.set(-0.27, 0.98, 0);
    group.add(leftArm);

    const rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.52, 8), outfitMat);
    rightArm.position.set(0.27, 0.98, 0);
    group.add(rightArm);

    // Archetype-specific accessories
    switch (type) {
      case PEDESTRIAN_TYPES.FASHION_VICTIM: {
        // Dark designer sunglasses
        const glasses = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.08), new THREE.MeshBasicMaterial({ color: 0x050505 }));
        glasses.position.set(0, 1.46, 0.1);
        group.add(glasses);
        break;
      }
      case PEDESTRIAN_TYPES.DESIGN_ARCHITECT: {
        // Black turtleneck collar & portfolio
        const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.12, 10), new THREE.MeshStandardMaterial({ color: 0x111111 }));
        collar.position.y = 1.34;
        group.add(collar);
        break;
      }
      case PEDESTRIAN_TYPES.APERITIVO_BRO: {
        // Spritz cocktail glass in hand
        const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.025, 0.12, 8), new THREE.MeshStandardMaterial({ color: 0xff5722, transparent: true, opacity: 0.85 }));
        glass.position.set(0.32, 0.95, 0.15);
        group.add(glass);
        rightArm.rotation.set(-0.6, 0, 0.2);
        break;
      }
      case PEDESTRIAN_TYPES.MILANESE_SCIURA: {
        // Pearl necklace & poodle
        const pearls = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.015, 6, 12), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 }));
        pearls.position.set(0, 1.3, 0.04);
        pearls.rotation.x = Math.PI / 2;
        group.add(pearls);
        break;
      }
      case PEDESTRIAN_TYPES.ELECTRIC_COURIER: {
        // Large cube courier backpack
        const bag = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.44, 0.32), new THREE.MeshStandardMaterial({ color: 0x00a86b }));
        bag.position.set(0, 1.05, -0.24);
        group.add(bag);
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
      config,
      interacted: false,
      isRecoiling: false,
      recoilTimer: 0,
      walkSpeed: 1.2 + Math.random() * 0.8,
      walkCycle: Math.random() * 10
    };
  }

  spawnPedestrian(zPos) {
    const type = this.typeList[Math.floor(Math.random() * this.typeList.length)];
    const pedObj = this.createPedestrianMesh(type);

    // Place on left or right sidewalk of Via Savona
    const side = Math.random() > 0.5 ? 1 : -1;
    const posX = side * (2.8 + Math.random() * 1.8);

    pedObj.group.position.set(posX, 0, zPos);
    pedObj.group.rotation.y = Math.random() > 0.5 ? 0 : Math.PI; // Walking north or south

    this.scene.add(pedObj.group);
    this.pedestrians.push(pedObj);
  }

  update(delta, kurt) {
    // 1. Maintain active pedestrian population around Kurt (frequent encounters)
    while (this.lastSpawnZ > kurt.position.z - this.spawnDistance) {
      this.lastSpawnZ -= 8 + Math.random() * 8; // Dense Milan crowd
      this.spawnPedestrian(this.lastSpawnZ);
    }

    // 2. Update each pedestrian
    for (let i = this.pedestrians.length - 1; i >= 0; i--) {
      const p = this.pedestrians[i];

      if (p.isRecoiling) {
        // Pedestrian is flinching / shocked by Kurt's insult
        p.recoilTimer -= delta;

        // Shocked arms thrown up gesture
        p.leftArm.rotation.set(-1.1, 0, -0.4);
        p.rightArm.rotation.set(-1.1, 0, 0.4);

        if (p.recoilTimer <= 0) {
          p.isRecoiling = false;
          // Walk away in opposite direction
          p.group.rotation.y += Math.PI * 0.8;
          p.walkSpeed = 2.4; // Hustles away faster
        }
      } else {
        // Natural walking animation
        p.walkCycle += delta * (p.walkSpeed * 2.5);
        const swing = Math.sin(p.walkCycle) * 0.42;
        p.leftLeg.rotation.x = swing;
        p.rightLeg.rotation.x = -swing;
        p.leftArm.rotation.x = -swing * 0.6;
        p.rightArm.rotation.x = swing * 0.6;

        // Move forward in facing direction
        const vz = Math.cos(p.group.rotation.y) * p.walkSpeed * delta;
        p.group.position.z += vz;
      }

      // 3. PROXIMITY DETECTION & INSULT CONFRONTATION
      const dist = kurt.position.distanceTo(p.group.position);

      if (!p.interacted && dist < 3.4) {
        p.interacted = true;
        p.isRecoiling = true;
        p.recoilTimer = 2.8;

        // Turn pedestrian toward Kurt
        p.group.lookAt(kurt.position.x, 0, kurt.position.z);

        // Step back slightly in shock
        const recoilDir = new THREE.Vector3().subVectors(p.group.position, kurt.position).normalize();
        p.group.position.addScaledVector(recoilDir, 0.55);

        // Trigger Kurt's confrontation stance
        kurt.startConfrontation(p.group.position);

        // Trigger Audio: Pedestrian gasp + Kurt guitar sting + English TTS
        sound.playPedestrianGasp();
        sound.playGrungeStinger();

        const dialogue = getRandomDialogue(p.type);
        sound.speak(dialogue.kurt);

        // Notify UI to render dialogue bubbles and grant points
        if (this.onDialogueTriggered) {
          this.onDialogueTriggered(dialogue, p);
        }
      }

      // 4. Cleanup pedestrians left behind
      if (p.group.position.z > kurt.position.z + 35) {
        this.scene.remove(p.group);
        this.pedestrians.splice(i, 1);
      }
    }
  }

  reset() {
    this.pedestrians.forEach(p => this.scene.remove(p.group));
    this.pedestrians = [];
    this.lastSpawnZ = 0;
  }
}
