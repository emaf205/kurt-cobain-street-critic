# KURT IN MILAN: Via Savona Critic 🎸🛹

A 3D realistic free-roam urban satire indie game built in Vanilla Web & Three.js. You play as a scruffy, disillusioned Kurt Cobain wandering through Via Savona — Milan's most pretentious fashion and design district — dodging delivery obstacles, cruising on bursts of skateboard, and mercilessly humiliating fashion victims, architects, and corporate yuppies with brutal existential insults.

![Version](https://img.shields.io/badge/version-2.0.0-orange)
![Setting](https://img.shields.io/badge/setting-Via%20Savona%20%2F%20Milan-red)
![Sound](https://img.shields.io/badge/audio-Tube%20Overdrive%20%26%20Feedback-yellow)
![Private Repo](https://img.shields.io/badge/github-private%20repo-success)

---

## 🎮 Concept & Lore

Stranded in the post-industrial loft district of Via Savona (Zona Tortona, Milan), Kurt Cobain walks among showroom openings, design installations, and high-fashion PR events. 

Clad in his iconic oversized olive green knit cardigan (MTV Unplugged style), distressed vintage tee, shredded denim jeans, and beat-up black Converse sneakers, he carries his skateboard tucked under his arm. 

As you navigate the sidewalks of Via Savona, Kurt can jump over street obstacles, burst onto his skateboard for high-speed cruising, and confront approaching pedestrians to unleash devastating, cynical grunge insults in English.

---

## 🕹️ Controls

- **W / A / S / D** or **Arrow Keys**: Free 360° omnidirectional walking and steering across Via Savona.
- **SPACE**: Jump / Ollie (leap over delivery boxes, electric scooters, and roadworks barriers).
- **SHIFT**: Manual Skate Burst (Kurt drops the board with a sharp snap and rides for several seconds; bursts also trigger automatically at random intervals).
- **APPROACHING PEOPLE**: Walk directly towards pedestrians to confront them face-to-face and trigger the insult confrontation.
- **C**: Cycle camera view (3rd Person dynamic follow, Low Street shoe-cam, Overhead Milan loft view).
- **M**: Mute / Unmute Grunge Sound FX.
- **V**: Mute / Unmute Kurt's Voice.
- **P**: Pause / Resume.

---

## 👥 The Milanese Archetypes (Via Savona)

1. **Fashion Week Influencer**: All-black archival avant-garde runway outfit, dark sunglasses at 3 PM, recording an outfit check next to dumpster bags.
2. **Fuorisalone Architect**: Black turtleneck, round horn-rimmed spectacles, theorizing "spatial discomfort" while charging €8,000 for brutalist chairs.
3. **Finance / Aperitivo Bro**: Blue blazer, beige chinos, holding an Aperol/Negroni spritz while shouting quarterly KPIs into AirPods.
4. **Runway Casting Model**: Running on cobblestones in four-inch heels with an oversized portfolio book.
5. **Showroom Door Hostess / PR Bouncer**: Sleek black jumpsuit with clipboard and radio headset, acting as gatekeeper to private previews.
6. **Zona Tortona Aristocrat (Sciura)**: Camel hair coat, pearl necklace, and a groomed toy poodle on a leash.
7. **Specialty Coffee Snob Barista**: Raw canvas work apron, woolen beanie in summer heat, charging €7 for anaerobic Ethiopian pour-overs.
8. **App Food Courier**: Speeding down the sidewalk with an insulated green delivery box.

---

## 🚧 Interactive Street Obstacles

Via Savona is cluttered with real-world obstacles that you must steer around or jump over:
- **Cardboard Delivery Box Stacks** (*"Fragile // Milano Design Week"*)
- **Dumped Lime / Dott Electric Scooters** knocked over on the pavement
- **Outdoor Aperitivo Bistro Tables & Chairs**
- **Roadworks Hazard Barriers**

*Hitting an obstacle without jumping causes Kurt to stumble, grunt, lose momentum, and triggers a stumble alert.*

---

## 🔊 Sound Design & Voice

- **Tube Overdrive Guitar Distortion**: Built using custom non-linear Waveshaper curves in Web Audio API to reproduce authentic vintage valve amplifier saturation.
- **Drop-D Power Chord Stingers**: Electric guitar chord burst upon every successful confrontation.
- **Microphone Feedback**: High-frequency squeal evoking live grunge concert energy.
- **Footsteps & Skateboard Mechanics**: Footstep impacts on stone slabs, board drop snaps, and urethane wheel roll resonance.
- **English Web Speech Synthesis**: Deadpan, raspy, tired vocal delivery tuned specifically for Kurt Cobain's cadence.

---

## 📦 FTP Deployment

A pre-packaged archive ready for instant FTP upload to any static web hosting server is included:
- `via-savona-kurt-cobain-ftp-ready.zip` (175 KB, sanitized, zero metadata).
- Simply unzip into your `public_html` or web root directory.

---

## 📂 Project Architecture

```
kind-volta/
├── index.html                           # Main entry point (WebGL Canvas & HUD)
├── VERSION.txt                          # Semantic version (2.0.0)
├── CHANGELOG.md                         # Detailed changelog
├── README.md                            # Comprehensive documentation
├── via-savona-kurt-cobain-ftp-ready.zip # Production FTP release archive
├── css/
│   └── style.css                        # Post-industrial Milanese design system & 3D bubbles
├── js/
│   ├── game.js                          # Core 60fps loop, 360° input & camera management
│   ├── skater.js                        # Kurt Cobain 3D controller, animations & skate bursts
│   ├── pedestrians.js                   # Milanese reactive pedestrian AI & recoil logic
│   ├── city.js                          # Via Savona procedural street & interactive obstacles
│   ├── textures.js                      # High-res procedural textures (Milan lofts, boxes)
│   ├── dialogues.js                     # English dialogue database & cynical grunge insults
│   ├── audio.js                         # Overdrive guitar synth & English speech synthesis
│   └── ui.js                            # 3D-to-2D screen projection & anti-overlap HUD
└── vendor/
    └── three.min.js                     # Local Three.js library (zero CDN dependency)
```
