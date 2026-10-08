/* ==========================================================================
   SAVONA ANARCHY: Kurt Cobain in Prince of Persia Style
   Database Dialoghi, Battute Surrealiste & Intro Cinematografica in Italiano
   ========================================================================== */

export const INTRO_TEXTS = [
  "MILANO, VIA SAVONA. ORE 03:42.",
  "IL DISTRETTO DEL DESIGN È UN CIMITERO DI APERITIVI, BRIEFING E VANITÀ.",
  "KURT SI È RISVEGLIATO SULL'ASFALTO TRA LE ROTAIE DEL TRAM.",
  "UNICO OBIETTIVO: DISSACRARE IL CONFORMISMO PRIMA CHE QUALCUNO GLI SPARI."
];

export const INSULTS = [
  "Puzzi di stage non retribuito, rassegnazione borghese e profumo di nicchia.",
  "La tua borsa di tela biologica nasconde il vuoto cosmico del tuo aperitivo.",
  "Sei solo un algoritmo che ha imparato a ordinare il matcha latte da sette euro.",
  "Bella la giacca d'archivio: l'hai comprata per farti perdonare l'assenza di talento?",
  "Parli di 'sostenibilità spaziale' mentre progetti sedie che causano la scoliosi.",
  "Sorridi ancora un po' per le storie di Instagram e ti si stacca il botox dalla fronte.",
  "Novanta ore a settimana in agenzia per sentirti dire che sei 'resiliente'. Fai tenerezza.",
  "Tranquillo, il tuo bonus di fine anno sopravviverà alla tua dignità.",
  "La società dello spettacolo ti ha masticato e ti ha sputato su questo marciapiede.",
  "Corri pure al casting: ti pagheranno con una tote bag e un trauma infantile.",
  "Un'altra mostra sull'incomunicabilità curata da chi non sa dire 'buongiorno'. Meraviglioso.",
  "Il tuo cappotto di cachemire non scalderà mai il gelo delle tue relazioni umane.",
  "Hai trent'anni e ti definisci 'content creator'. I tuoi nonni hanno fatto la Resistenza.",
  "Non guardarmi con quegli occhiali tondi da architetto: so che sogni solo di dormire."
];

export const PEDESTRIAN_TYPES = [
  { name: "ARCHITETTO DOLCEVITA", color: "#1a1a1a", hair: "#333333" },
  { name: "INFLUENCER AVANT-GARDE", color: "#e74c3c", hair: "#d4ac0d" },
  { name: "YUPPIE DELLO SPRITZ", color: "#2980b9", hair: "#5d4037" },
  { name: "MODEL IN CASTING", color: "#8e44ad", hair: "#1c2833" },
  { name: "SCIURA DI ZONA TORTONA", color: "#d35400", hair: "#bdc3c7" },
  { name: "CURATORE FUORISALONE", color: "#27ae60", hair: "#424949" }
];

export function getRandomInsult() {
  return INSULTS[Math.floor(Math.random() * INSULTS.length)];
}

export function getRandomPedestrianType() {
  return PEDESTRIAN_TYPES[Math.floor(Math.random() * PEDESTRIAN_TYPES.length)];
}
