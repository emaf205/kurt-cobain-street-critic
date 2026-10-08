/* ==========================================================================
   STREET CRITIC: Skater Polemico - Database Dialoghi & Reazioni
   Battute irriverenti, colte, sferzanti e ciniche da giovane polemico italiano
   ========================================================================== */

export const PEDESTRIAN_TYPES = {
  UMARELL: 'umarell',
  MANAGER: 'manager',
  VIGILE: 'vigile',
  INFLUENCER: 'influencer',
  BOOMER_MONOPATTINO: 'boomer_monopattino',
  SCIURA: 'sciura',
  RUNNER: 'runner',
  MARANZA: 'maranza',
  TURISTA: 'turista'
};

export const PEDESTRIAN_CONFIG = {
  [PEDESTRIAN_TYPES.UMARELL]: {
    name: 'Pensionato al Cantiere',
    title: 'L\'Umarell Certificato',
    colorOutfit: 0xd2b48c, // Giubbotto beige/cammello
    colorPants: 0x3d3d3d,
    accessory: 'hands_back',
    dialogues: [
      {
        skater: "Uè capo! Se fissi ancora quel buco nell'asfalto rischi che il Comune ti chieda la consulenza tecnica!",
        pedestrian: "Alla tua età lavoravo già 14 ore al giorno, disgraziato!"
      },
      {
        skater: "Tranquillo nonno, la malta fresca non scappa. Torna al bar a commentare il meteo!",
        pedestrian: "Guarda che asfalto hanno buttato... ai miei tempi si faceva meglio!"
      },
      {
        skater: "Mani dietro la schiena e sguardo da perito fallimentare: sei il monumento vivente dell'incuria urbana!",
        pedestrian: "Vai a lavorare invece di rotolare su quella tavola da delinquente!"
      },
      {
        skater: "Spostati zio, che sto calcolando la traiettoria e non vorrei incrinarti l'anca artificiale!",
        pedestrian: "Chiamo i vigili! Chiamo subito il 112!"
      },
      {
        skater: "Bello lo scavo, eh? Secondo te la granulometria del pietrisco è a norma ISO 9001?",
        pedestrian: "Ma guarda questo saputello con la felpa bucata..."
      }
    ]
  },

  [PEDESTRIAN_TYPES.MANAGER]: {
    name: 'Consulente / Yuppie',
    title: 'Senior Associate in Crisi',
    colorOutfit: 0x1c2833, // Completo scuro formale
    colorPants: 0x1c2833,
    accessory: 'briefcase',
    dialogues: [
      {
        skater: "Bello il completo in poliestere bro! Quante slide PowerPoint servono per giustificare il tuo stipendio?",
        pedestrian: "Non ho tempo per i ragazzini, ho una call con New York!"
      },
      {
        skater: "Corri pure al briefing delle nove, tanto il plusvalore te lo ciuccia tutto il partner dello studio!",
        pedestrian: "La mia parcella oraria vale più del tuo intero albero genealogico!"
      },
      {
        skater: "Fatturi o stai solo scappando dal vuoto cosmico delle tue relazioni interpersonali?",
        pedestrian: "Levati dal marciapiede, parassita improduttivo!"
      },
      {
        skater: "Occhio che ti cola il matcha latte biologico da sei euro sulla cravatta di seta!",
        pedestrian: "Questo me lo ripaga tuo padre quando ti denuncio!"
      },
      {
        skater: "Ottanta ore settimanali di lavoro per comprarti l'Apple Watch che ti dice di respirare: poesia pura!",
        pedestrian: "Sei un tipico caso di fallimento del sistema scolastico!"
      }
    ]
  },

  [PEDESTRIAN_TYPES.VIGILE]: {
    name: 'Agente di Polizia Locale',
    title: 'Il Paladino della Sosta',
    colorOutfit: 0x1a242f, // Divisa scura
    colorVest: 0xf4d03f,   // Pettorina catarifrangente giallo fluo
    accessory: 'cap_badge',
    dialogues: [
      {
        skater: "Maresciallo! Il codice della strada del '92 è incompatibile con il mio diritto alla traiettoria fluida!",
        pedestrian: "Ferma immediatamente quel mezzo non omologato o ti sequestro la tavola!"
      },
      {
        skater: "Multami per eccesso di gravità, agente! Qui di illegale ci sono solo le voragini del marciapiede!",
        pedestrian: "Articolo 190 del Codice della Strada! Favorisca le generalità!"
      },
      {
        skater: "Stia sereno con quel fischietto, che la tachicardia dopo i cinquanta è pericolosa!",
        pedestrian: "Ti becco alla prossima curva, mascalzone!"
      },
      {
        skater: "La mia tavola ha emissioni zero e zero rispetto per i sensi unici inventati dal Comune!",
        pedestrian: "Voi giovani senza senso civico siete la rovina della città!"
      },
      {
        skater: "Tranquillo che non ho la targa, la mia identità è un costrutto postmoderno inafferrabile!",
        pedestrian: "Centrale, ho un soggetto non cooperativo in felpa nera sul corso!"
      }
    ]
  },

  [PEDESTRIAN_TYPES.INFLUENCER]: {
    name: 'Content Creator',
    title: 'L\'Influencer di Quartiere',
    colorOutfit: 0xf5b7b1, // Tuta trendy pastello
    colorPants: 0xeb984e,
    accessory: 'selfie_stick',
    dialogues: [
      {
        skater: "Bro, quel ring light portatile non colmerà mai la voragine di affetto genitoriale che ti porti dietro!",
        pedestrian: "Ragazzi, guardate nei DM: sono appena stato aggredito da un boomer mentale!"
      },
      {
        skater: "Togliti da mezzo con quel bastone da selfie prima che te lo trasformi in un asse per il grind!",
        pedestrian: "Non rovinarmi la golden hour che devo fare la sponsorizzata della crema idratante!"
      },
      {
        skater: "Storytime: 'Oggi uno skater mi ha fatto notare che il mio engagement rate è ai minimi storici'!",
        pedestrian: "Ti cancello dai social! Ti blocco l'IP!"
      },
      {
        skater: "Bella la posa plastica sul cassonetto, fa molto 'estetica del degrado consapevole'!",
        pedestrian: "È storytelling visivo, ignorante, si chiama moodboard urbana!"
      },
      {
        skater: "Codice sconto 'SENZA-FUTURO20' per il prossimo corso su come arricchirsi vendendo fuffa online?",
        pedestrian: "La mia agenzia di management ti farà causa per danni d'immagine!"
      }
    ]
  },

  [PEDESTRIAN_TYPES.BOOMER_MONOPATTINO]: {
    name: 'Pendolare in Monopattino',
    title: 'Il Centauro a Batteria',
    colorOutfit: 0x2e86c1, // Giacca a vento blu
    colorHelmet: 0xf1c40f, // Caschetto fluo
    accessory: 'scooter',
    dialogues: [
      {
        skater: "Guidi quel trabiccolo a noleggio col terrore negli occhi di chi ha scoperto le leggi della fisica dopo i cinquanta!",
        pedestrian: "Spostati che io pago 29 centesimi al minuto per questo mezzo ecologico!"
      },
      {
        skater: "Caschetto giallo fluo e borsa di cuoio: sembri un evidenziatore Stabilo travolto dalla crisi di mezza età!",
        pedestrian: "La micromobilità è il futuro della transizione ecologica, cafone!"
      },
      {
        skater: "Tieniti a due mani quel manubrio che alla prima buca lasci l'otturazione del molare sull'asfalto!",
        pedestrian: "Frena! Frena che non so dov'è il pulsante del freno rigenerativo!"
      },
      {
        skater: "Il monopattino elettrico a ruotine piene: l'emblema supremo della capitolazione motoria della nostra specie!",
        pedestrian: "Tu usi ancora le gambe per spingerti, primitivo dell'era analogica!"
      }
    ]
  },

  [PEDESTRIAN_TYPES.SCIURA]: {
    name: 'Sciura Borghese',
    title: 'L\'Aristocratica del Marciapiede',
    colorOutfit: 0x935116, // Pelliccia/cappotto cammello elegante
    colorPants: 0x1b2631,
    accessory: 'lapdog',
    dialogues: [
      {
        skater: "Signora, quel barboncino è geneticamente un lupo selvatico: smetta di mettergli il cappottino zebrato!",
        pedestrian: "Fufi non ascoltare questa canaglia, abbraccia la mamma!"
      },
      {
        skater: "Se raccogliesse i souvenir del quadrupede con la stessa solerzia con cui mi fulmina con lo sguardo, saremmo a Zurigo!",
        pedestrian: "Che insolente! Ai miei tempi i giovani viaggiavano con la testa bassa e rispettavano le dame!"
      },
      {
        skater: "Tranquilla signora, non le rubo la borsa di Prada: sono anarco-marxista, mica un ladro di galline!",
        pedestrian: "Aiuto! Un comunista a rotelle! Qualcuno chiami una guardia giurata!"
      },
      {
        skater: "Bel lifting, signora! Se sorride ancora un po' le sopracciglia le decollano verso la stratosfera!",
        pedestrian: "Questa è pura invidia sociale di classe subalterna!"
      }
    ]
  },

  [PEDESTRIAN_TYPES.RUNNER]: {
    name: 'Fanatico del Fitness',
    title: 'Il Marciatore della Dopamina',
    colorOutfit: 0x27ae60, // Canotta fluo verde
    colorPants: 0x17202a,
    accessory: 'armband',
    dialogues: [
      {
        skater: "Corri pure a quattro al chilometro bro, ma dal mutuo a tasso variabile non scappi neanche con le scarpe in carbonio!",
        pedestrian: "Non interrompere la mia zona cardio aerobica, brucio acido lattico!"
      },
      {
        skater: "Tutti quei chilometri di sofferenza per produrre due grammi di endorfine e zero pensieri critici!",
        pedestrian: "Se corressi anche tu non avresti questa rabbia repressa verso il progresso!"
      },
      {
        skater: "Guarda che il cardiofrequenzimetro sul polso ti sta implorando un trancio di pizza e un bicchiere di vino!",
        pedestrian: "Oggi 21 chilometri a digiuno intermittente! Tu cosa hai fatto oggi?!"
      },
      {
        skater: "Attento alle ginocchia, fra! A trent'anni il menisco presenta il conto senza passare dal via!",
        pedestrian: "Sei solo un pigro che delega la cinetica a quattro cuscinetti a sfera!"
      }
    ]
  },

  [PEDESTRIAN_TYPES.MARANZA]: {
    name: 'Trapper di Periferia',
    title: 'Il Boss del Muretto',
    colorOutfit: 0x111111, // Tuta lucida nera
    colorPants: 0x111111,
    accessory: 'pouch_crossbody',
    dialogues: [
      {
        skater: "Bro, spegni quella cassa bluetooth! Quel pezzo trap in autotune fa sanguinare le orecchie anche ai piccioni!",
        pedestrian: "Oh fra ma che vuoi?! Guarda che ti faccio saltare la tavola dai piedi!"
      },
      {
        skater: "Bello il borsello da due litri a tracolla: ci tieni le giustificazioni per le assenze o i fazzoletti per piangere?",
        pedestrian: "Stai muto che chiamo i miei fra di Rozzano e vedi come voli!"
      },
      {
        skater: "Sguardo da duro a sedici anni, poi alle nove e mezza ti chiama tua madre che il minestrone è sul fuoco!",
        pedestrian: "Rispetta la strada fra, non sai chi sono io nel quartiere!"
      },
      {
        skater: "Tuta sintetizzata e ciabatte coi calzini d'inverno: la massima espressione del dadaismo contemporaneo!",
        pedestrian: "Questo è drip puro fra, tu vesti ancora con le felpe dell'oratorio!"
      }
    ]
  },

  [PEDESTRIAN_TYPES.TURISTA]: {
    name: 'Turista Spaesato',
    title: 'Il Pellegrino della Guida',
    colorOutfit: 0xe67e22, // Camicia hawaiana / zaino
    colorPants: 0xd5dbdb,
    accessory: 'big_backpack',
    dialogues: [
      {
        skater: "Welcome to reality my friend: il Colosseo è a trecento chilometri e quella in mano è la mappa della metropolitana di Tokyo!",
        pedestrian: "Excuse me! Where is the authentic real homemade carbonara with cream?!"
      },
      {
        skater: "Quattro euro per un espresso al banco non sono 'autentico folklore locale', sono un furto aggravato con scasso!",
        pedestrian: "Very beautiful historic town! But people are very aggressive on wheels!"
      },
      {
        skater: "Bello lo zaino da novanta litri per fare due passi sul corso piano: stai scalando l'Everest o ti sei trasferito?",
        pedestrian: "Is this the line for the Vatican Museum or the ice cream shop?!"
      }
    ]
  }
};

/**
 * Ottiene una battuta casuale per il tipo di pedone specificato
 */
export function getRandomDialogue(pedestrianType) {
  const config = PEDESTRIAN_CONFIG[pedestrianType] || PEDESTRIAN_CONFIG[PEDESTRIAN_TYPES.UMARELL];
  const list = config.dialogues;
  const index = Math.floor(Math.random() * list.length);
  return {
    ...list[index],
    name: config.name,
    title: config.title
  };
}
