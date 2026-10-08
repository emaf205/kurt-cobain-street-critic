/* ==========================================================================
   VIA SAVONA CRITIC: Kurt Cobain 3D Character Controller
   Grunge style: Shaggy blonde hair, oversized olive knit cardigan, vintage tee,
   ripped jeans, Converse sneakers. Walks freely in 360°, carries board under arm,
   triggers random/manual skate bursts, hops over obstacles, and roasts pedestrians.
   ========================================================================== */

import { TextureGenerator } from './textures.js';
import { sound } from './audio.js';

export class KurtCharacter {
  constructor(scene) {
    this.scene = scene;

    // Position and Navigation (Free 360° Movement)
    this.position = new THREE.Vector3(0, 0, 0);
    this.rotation = 0; // Y-rotation angle in radians
    this.velocity = new THREE.Vector3();

    // Movement speeds
    this.walkSpeed = 4.2;   // Normal walking speed (m/s)
    this.skateSpeed = 9.8;  // High-speed skate burst (m/s)
    this.currentSpeed = 0;

    // Locomotion States
    this.isSkating = false;
    this.skateBurstTimer = 0;
    this.nextRandomSkateTimer = 12 + Math.random() * 10; // Random burst trigger

    this.isWalking = false;
    this.walkCycle = 0;
    this.footstepTimer = 0;

    // Jump / Obstacle Leap
    this.isJumping = false;
    this.jumpY = 0;
    this.jumpVelocity = 0;

    // Obstacle Stumble
    this.isStumbling = false;
    this.stumbleTimer = 0;

    // Confrontation / Insulting Pedestrian
    this.isInsulting = false;
    this.insultTimer = 0;

    // 3D Groups
    this.group = new THREE.Group();
    this.bodyGroup = new THREE.Group();
    this.skateboardMesh = null;
    this.wheels = [];

    this.buildKurtModel();
    this.scene.add(this.group);
  }

  buildKurtModel() {
    // -------------------------------------------------------------
    // MATERIALS: Authentic Grunge Aesthetic (Kurt Cobain Style)
    // -------------------------------------------------------------
    // Iconic olive green cardigan (MTV Unplugged knit style)
    const cardiganMat = new THREE.MeshStandardMaterial({
      color: 0x4a5d3f,
      roughness: 0.95,
      metalness: 0.05
    });

    // Faded thrift store tee underneath
    const vintageTeeMat = new THREE.MeshStandardMaterial({
      color: 0xdcdde1,
      roughness: 0.85
    });

    // Shaggy bleached blonde hair
    const blondeHairMat = new THREE.MeshStandardMaterial({
      color: 0xe5c97d,
      roughness: 0.9
    });

    // Fair skin
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xf5cba7,
      roughness: 0.65
    });

    // Light-wash ripped denim jeans
    const denimMat = new THREE.MeshStandardMaterial({
      color: 0x5a7d9a,
      roughness: 0.9
    });

    // Beat-up black canvas Converse sneakers
    const sneakerCanvasMat = new THREE.MeshStandardMaterial({
      color: 0x181818,
      roughness: 0.8
    });
    const dingyToeCapMat = new THREE.MeshStandardMaterial({
      color: 0xded8c8, // Aged dirty white rubber
      roughness: 0.6
    });

    // -------------------------------------------------------------
    // 1. PELVIS & SLOUCHED TORSO
    // -------------------------------------------------------------
    this.pelvis = new THREE.Group();
    this.pelvis.position.y = 0.86;

    // Torso: Vintage Tee
    const teeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.48, 0.22), vintageTeeMat);
    teeMesh.position.y = 0.24;
    teeMesh.castShadow = true;
    this.pelvis.add(teeMesh);

    // Over-Cardigan: Slouchy, open at front
    const cardiganBack = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.54, 0.08), cardiganMat);
    cardiganBack.position.set(0, 0.23, -0.09);
    cardiganBack.castShadow = true;
    this.pelvis.add(cardiganBack);

    // Cardigan front flaps (left and right)
    const cardLeft = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.52, 0.06), cardiganMat);
    cardLeft.position.set(-0.16, 0.22, 0.1);
    this.pelvis.add(cardLeft);

    const cardRight = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.52, 0.06), cardiganMat);
    cardRight.position.set(0.16, 0.22, 0.1);
    this.pelvis.add(cardRight);

    // -------------------------------------------------------------
    // 2. HEAD & ICONIC SHAGGY BLONDE HAIR
    // -------------------------------------------------------------
    // Neck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.075, 0.1, 10), skinMat);
    neck.position.y = 0.52;
    this.pelvis.add(neck);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.125, 16, 16), skinMat);
    head.position.y = 0.64;
    head.castShadow = true;
    this.pelvis.add(head);

    // Shaggy Blonde Hair Layers (Falling over face and shoulders)
    this.hairGroup = new THREE.Group();
    this.hairGroup.position.set(0, 0.65, 0);

    // Main top hair dome
    const hairTop = new THREE.Mesh(new THREE.SphereGeometry(0.145, 14, 14, 0, Math.PI * 2, 0, Math.PI / 1.7), blondeHairMat);
    this.hairGroup.add(hairTop);

    // Left locks over shoulder
    const lockL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.04, 0.28, 8), blondeHairMat);
    lockL.position.set(-0.12, -0.06, 0.04);
    lockL.rotation.z = 0.25;
    this.hairGroup.add(lockL);

    // Right locks over shoulder
    const lockR = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.04, 0.28, 8), blondeHairMat);
    lockR.position.set(0.12, -0.06, 0.04);
    lockR.rotation.z = -0.25;
    this.hairGroup.add(lockR);

    // Back grunge hair fringe
    const lockBack = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 0.08), blondeHairMat);
    lockBack.position.set(0, -0.07, -0.1);
    this.hairGroup.add(lockBack);

    // Front messy fringe dropping into eyes
    const bangs = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.06), blondeHairMat);
    bangs.position.set(0, 0.05, 0.11);
    bangs.rotation.x = -0.3;
    this.hairGroup.add(bangs);

    this.pelvis.add(this.hairGroup);

    // -------------------------------------------------------------
    // 3. ARMS
    // -------------------------------------------------------------
    // Left Arm (Carries skateboard when walking, or balances on board when skating)
    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-0.24, 0.44, 0);
    const lSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.32, 10), cardiganMat);
    lSleeve.position.y = -0.16;
    this.leftArm.add(lSleeve);
    const lHand = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), skinMat);
    lHand.position.y = -0.34;
    this.leftArm.add(lHand);
    this.pelvis.add(this.leftArm);

    // Right Arm (Swings naturally when walking, points during insults)
    this.rightArm = new THREE.Group();
    this.rightArm.position.set(0.24, 0.44, 0);
    const rSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.32, 10), cardiganMat);
    rSleeve.position.y = -0.16;
    this.rightArm.add(rSleeve);
    const rHand = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), skinMat);
    rHand.position.y = -0.34;
    this.rightArm.add(rHand);
    this.pelvis.add(this.rightArm);

    // -------------------------------------------------------------
    // 4. LEGS (Ripped denim jeans & Converse sneakers)
    // -------------------------------------------------------------
    // Left Leg
    this.leftLeg = new THREE.Group();
    this.leftLeg.position.set(-0.11, 0, 0);
    const lThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.42, 10), denimMat);
    lThigh.position.y = -0.21;
    this.leftLeg.add(lThigh);

    // Knee rip showing skin
    const lRip = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.05, 0.02), skinMat);
    lRip.position.set(0, -0.42, 0.06);
    this.leftLeg.add(lRip);

    const lShin = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.06, 0.38, 10), denimMat);
    lShin.position.y = -0.58;
    this.leftLeg.add(lShin);

    // Converse Sneaker Left
    const lShoe = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.07, 0.22), sneakerCanvasMat);
    lShoe.position.set(0, -0.78, 0.04);
    lShoe.castShadow = true;
    this.leftLeg.add(lShoe);
    const lToe = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.06, 10), dingyToeCapMat);
    lToe.rotation.x = Math.PI / 2;
    lToe.position.set(0, -0.78, 0.12);
    this.leftLeg.add(lToe);

    this.pelvis.add(this.leftLeg);

    // Right Leg
    this.rightLeg = new THREE.Group();
    this.rightLeg.position.set(0.11, 0, 0);
    const rThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.42, 10), denimMat);
    rThigh.position.y = -0.21;
    this.rightLeg.add(rThigh);

    // Knee rip showing skin
    const rRip = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.05, 0.02), skinMat);
    rRip.position.set(0, -0.42, 0.06);
    this.rightLeg.add(rRip);

    const rShin = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.06, 0.38, 10), denimMat);
    rShin.position.y = -0.58;
    this.rightLeg.add(rShin);

    // Converse Sneaker Right
    const rShoe = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.07, 0.22), sneakerCanvasMat);
    rShoe.position.set(0, -0.78, 0.04);
    rShoe.castShadow = true;
    this.rightLeg.add(rShoe);
    const rToe = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.06, 10), dingyToeCapMat);
    rToe.rotation.x = Math.PI / 2;
    rToe.position.set(0, -0.78, 0.12);
    this.rightLeg.add(rToe);

    this.pelvis.add(this.rightLeg);

    this.bodyGroup.add(this.pelvis);
    this.group.add(this.bodyGroup);

    // -------------------------------------------------------------
    // 5. SKATEBOARD ENTITY
    // -------------------------------------------------------------
    this.buildSkateboard();
  }

  buildSkateboard() {
    this.boardGroup = new THREE.Group();
    const gripTex = TextureGenerator.createKurtGripTapeTexture();

    const deckMat = new THREE.MeshStandardMaterial({
      map: gripTex,
      roughness: 0.9,
      metalness: 0.05
    });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0xb58448, roughness: 0.7 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.85, roughness: 0.2 });
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0xe8e6df, roughness: 0.35 });

    // Deck
    const deck = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.022, 0.86), [woodMat, woodMat, deckMat, woodMat, woodMat, woodMat]);
    deck.position.y = 0.09;
    deck.castShadow = true;
    this.boardGroup.add(deck);

    // Trucks & Wheels
    [-0.28, 0.28].forEach(zPos => {
      const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.32, 12), metalMat);
      axle.rotation.z = Math.PI / 2;
      axle.position.set(0, 0.05, zPos);
      this.boardGroup.add(axle);

      [-0.15, 0.15].forEach(xPos => {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.04, 14), wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(xPos, 0.05, zPos);
        wheel.castShadow = true;
        this.boardGroup.add(wheel);
        this.wheels.push(wheel);
      });
    });

    // Start with board carried under arm while walking!
    this.setSkatingMode(false);
  }

  // Toggle between walking (board carried under arm) and skating (riding on ground)
  setSkatingMode(skating) {
    this.isSkating = skating;

    if (this.isSkating) {
      // Board drops to asphalt underneath Kurt's feet
      if (this.boardGroup.parent) this.boardGroup.parent.remove(this.boardGroup);
      this.group.add(this.boardGroup);
      this.boardGroup.position.set(0, 0, 0);
      this.boardGroup.rotation.set(0, 0, 0);
      this.boardGroup.scale.set(1, 1, 1);

      // Kurt crouches slightly in skate stance
      this.pelvis.rotation.y = 0.55; // Angled skate stance
      this.leftArm.rotation.set(0.4, 0, 0.5);
      this.rightArm.rotation.set(-0.3, 0, -0.5);

      sound.playBoardDrop();
    } else {
      // Board tucked under left arm while Kurt walks
      if (this.boardGroup.parent) this.boardGroup.parent.remove(this.boardGroup);
      this.leftArm.add(this.boardGroup);
      this.boardGroup.position.set(0.06, -0.22, 0);
      this.boardGroup.rotation.set(Math.PI / 2, 0, 0.2);
      this.boardGroup.scale.set(0.85, 0.85, 0.85);

      this.pelvis.rotation.y = 0; // Natural facing forward
    }
  }

  // Manual or Random burst trigger
  triggerSkateBurst() {
    if (this.isSkating || this.isInsulting) return;
    this.setSkatingMode(true);
    this.skateBurstTimer = 7.0; // 7 seconds of high-speed street cruising
  }

  // Jump / Ollie over street obstacles
  jump() {
    if (this.isJumping) return;
    this.isJumping = true;
    this.jumpVelocity = 0.15;
    this.jumpY = 0;
    sound.playOlliePop();
  }

  // Hit obstacle: Kurt stumbles, grunts, loses speed
  stumble() {
    if (this.isStumbling) return;
    this.isStumbling = true;
    this.stumbleTimer = 0.7; // 0.7 seconds of stumble
    this.currentSpeed = 0.5; // Stumbled speed drop
    sound.playObstacleHit();

    // If on skate, knock off board to walking
    if (this.isSkating) {
      this.setSkatingMode(false);
    }
  }

  // Confront pedestrian: Stop, face them, unleash insult
  startConfrontation(targetPedestrianPos) {
    this.isInsulting = true;
    this.insultTimer = 2.6; // Confrontation duration
    this.currentSpeed = 0;

    // Face the pedestrian
    const dx = targetPedestrianPos.x - this.position.x;
    const dz = targetPedestrianPos.z - this.position.z;
    this.rotation = Math.atan2(dx, dz);

    // Sarcastic pointing gesture
    this.rightArm.rotation.set(-1.3, 0, 0.3);
    this.hairGroup.rotation.z = 0.12; // Tired head tilt
  }

  update(delta, input) {
    // -------------------------------------------------------------
    // 1. TIMERS: Random skate bursts, stumbles, and insults
    // -------------------------------------------------------------
    if (this.insultTimer > 0) {
      this.insultTimer -= delta;
      if (this.insultTimer <= 0) {
        this.isInsulting = false;
        this.rightArm.rotation.set(0, 0, 0);
        this.hairGroup.rotation.z = 0;
      }
      return; // Freeze locomotion during the verbal confrontation
    }

    if (this.isStumbling) {
      this.stumbleTimer -= delta;
      if (this.stumbleTimer <= 0) {
        this.isStumbling = false;
      }
    }

    // Skate Burst Duration Timer
    if (this.isSkating) {
      this.skateBurstTimer -= delta;
      if (this.skateBurstTimer <= 0) {
        this.setSkatingMode(false); // Return to walking
      }
    } else {
      // Random Skate Burst Countdown
      this.nextRandomSkateTimer -= delta;
      if (this.nextRandomSkateTimer <= 0) {
        this.triggerSkateBurst();
        this.nextRandomSkateTimer = 16 + Math.random() * 12;
      }
    }

    // -------------------------------------------------------------
    // 2. MOVEMENT & INPUT HANDLING (Free 360° Omnidirectional)
    // -------------------------------------------------------------
    const moveX = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    const moveZ = (input.down ? 1 : 0) - (input.up ? 1 : 0);

    const hasInput = (moveX !== 0 || moveZ !== 0);

    if (hasInput && !this.isStumbling) {
      this.isWalking = true;
      const targetSpeed = this.isSkating ? this.skateSpeed : this.walkSpeed;
      this.currentSpeed = THREE.MathUtils.lerp(this.currentSpeed, targetSpeed, 0.15);

      // Target direction angle
      const targetAngle = Math.atan2(moveX, moveZ);
      // Smoothly rotate character toward movement vector
      const diff = THREE.MathUtils.euclideanModulo(targetAngle - this.rotation + Math.PI, Math.PI * 2) - Math.PI;
      this.rotation += diff * 0.18;

      // Update position
      const vx = Math.sin(this.rotation) * this.currentSpeed * delta;
      const vz = Math.cos(this.rotation) * this.currentSpeed * delta;
      this.position.x += vx;
      this.position.z += vz;

      // Restrict within Via Savona street boundaries (sidewalk walls)
      this.position.x = Math.max(-5.2, Math.min(5.2, this.position.x));
    } else {
      this.isWalking = false;
      this.currentSpeed = THREE.MathUtils.lerp(this.currentSpeed, 0, 0.18);
    }

    // -------------------------------------------------------------
    // 3. JUMP & OLLIE PHYSICS
    // -------------------------------------------------------------
    if (this.isJumping) {
      this.jumpY += this.jumpVelocity;
      this.jumpVelocity -= 0.011; // Gravity

      if (this.jumpY <= 0) {
        this.jumpY = 0;
        this.isJumping = false;
        this.jumpVelocity = 0;
      }
    }
    this.position.y = this.jumpY;

    // -------------------------------------------------------------
    // 4. ANIMATIONS: Walking vs. Skating
    // -------------------------------------------------------------
    if (this.isSkating) {
      // Skating posture: deep carve lean and wheel spinning
      const wheelSpin = this.currentSpeed * 10 * delta;
      this.wheels.forEach(w => w.rotation.x += wheelSpin);

      // Slight rhythmic board carving
      const carve = Math.sin(Date.now() * 0.006) * 0.08;
      this.boardGroup.rotation.z = carve;

      sound.updateRoll(this.currentSpeed, true);
    } else if (this.isWalking && this.currentSpeed > 0.4) {
      // Natural walking cycle (legs & right arm swing)
      this.walkCycle += delta * (this.currentSpeed * 1.6);
      const swing = Math.sin(this.walkCycle) * 0.48;

      this.leftLeg.rotation.x = swing;
      this.rightLeg.rotation.x = -swing;

      // Right arm swings opposite to right leg
      this.rightArm.rotation.x = swing * 0.65;

      // Footstep sound cadence
      this.footstepTimer += delta * this.currentSpeed;
      if (this.footstepTimer > 2.2) {
        this.footstepTimer = 0;
        sound.playFootstep(Math.sin(this.walkCycle) > 0);
      }

      // Natural slouched body bobbing
      this.bodyGroup.position.y = Math.abs(Math.sin(this.walkCycle * 2)) * 0.04;
      sound.updateRoll(0, false);
    } else {
      // Idle slouch
      this.leftLeg.rotation.x = 0;
      this.rightLeg.rotation.x = 0;
      this.rightArm.rotation.x = 0;
      this.bodyGroup.position.y = 0;
      sound.updateRoll(0, false);
    }

    // Apply global position and rotation
    this.group.position.copy(this.position);
    this.group.rotation.y = this.rotation;
  }
}
