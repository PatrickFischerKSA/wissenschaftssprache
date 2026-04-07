const MODULES = [
  {
    id: "neunelf",
    step: "1",
    title: "9/11: Anschlag, Täter, Folgen",
    era: "11. September 2001 bis 2002",
    intro:
      "Diese Auftaktstation rekonstruiert den Anschlagstag, ordnet die Rolle der Täter um Mohammed Atta ein und verbindet den unmittelbaren Schock mit den politischen und gesellschaftlichen Langzeitfolgen.",
    goal:
      "Du kannst den Ablauf des 11. September 2001 erklären und begründen, warum 9/11 zu einem weltpolitischen Wendepunkt wurde.",
    route:
      "Starte mit der Tagesschau vom 11. September 2001, arbeite danach mit dem Atta-Video und schließe mit der ARTE-Reportage über Überlebende ab. Bearbeite erst die Chronologie, dann Täterstruktur und schließlich die Frage nach den Folgen.",
    teacherNote:
      "Didaktisch wichtig ist hier die Balance zwischen Ereignisgeschichte, Täteranalyse und der Perspektive der Betroffenen. Die Station sollte nicht nur als Sicherheitsgeschichte, sondern auch als Geschichte von Medienbildern und Nachwirkungen gelesen werden.",
    teacherToolkit: {
      duration: "40 bis 50 Minuten",
      socialForms: [
        "Einzelarbeit mit gesicherter Chronologie im Tandem",
        "Kurze Plenumsphase zur Frage, warum Bilder Geschichte prägen",
        "Transferantwort als schriftliche Einzelaufgabe"
      ],
      assessmentFocus: [
        "Den Ablauf von 9/11 präzise von späteren Deutungen trennen",
        "Al-Qaida und die Taliban nicht gleichsetzen",
        "Langzeitfolgen über den Anschlagstag hinaus benennen"
      ],
      misconceptions: [
        "9/11 sei nur ein amerikanisches Ereignis gewesen",
        "Die Taliban hätten die Anschläge selbst durchgeführt",
        "Die Folgen seien nur militärisch gewesen"
      ],
      product:
        "Chronologischer Kurztext oder gewichtete Transferantwort zum Wendepunktcharakter von 9/11.",
      extension:
        "Mit der Zusatzfrage arbeiten, wie Live-Bilder politische Entscheidungen beschleunigen oder emotional aufladen."
    },
    visual: {
      src: "https://i.ytimg.com/vi/TUBqiwBtNuo/hqdefault.jpg",
      alt: "Vorschaubild zur historischen Tagesschau vom 11. September 2001"
    },
    miniQuestions: [
      {
        id: "mq-neunelf-1",
        title: "Medienereignis 9/11",
        type: "short-text",
        challenge: "Zusatzcheck",
        prompt:
          "Warum gilt 9/11 zugleich als Terroranschlag und als globales Medienereignis?",
        help:
          "Nenne mindestens zwei Sinnschichten: den realen Angriff und seine weltweite mediale Wahrnehmung.",
        placeholder: "9/11 wurde zum globalen Medienereignis, weil ...",
        sourceIds: ["r-911-tv", "r-911-bpb"],
        conceptGroups: [
          {
            label: "Live-Bilder oder weltweite Fernsehübertragung",
            variants: [
              "live",
              "fernsehen",
              "fernsehbilder",
              "medien",
              "weltweit gesehen",
              "live uebertragung"
            ]
          },
          {
            label: "Schockwirkung über die USA hinaus",
            variants: [
              "schock",
              "weltweit",
              "globale wirkung",
              "wendepunkt",
              "internationale reaktion",
              "ganze welt"
            ]
          },
          {
            label: "Angriff auf zivile Symbole",
            variants: [
              "world trade center",
              "zwillingstuerme",
              "zivile symbole",
              "symbol",
              "new york",
              "pentagon"
            ]
          }
        ],
        successThreshold: 2,
        modelAnswer:
          "9/11 war nicht nur ein Anschlag, sondern auch ein globales Medienereignis, weil die Bilder der einstürzenden Türme live um die Welt gingen. Dadurch wurde der Schock sofort international wahrgenommen und politisch aufgeladen."
      },
      {
        id: "mq-neunelf-2",
        title: "Mohammed Atta",
        type: "short-text",
        challenge: "Zusatzcheck",
        prompt:
          "Warum ist Mohammed Atta für die historische Einordnung der Anschläge besonders wichtig?",
        help:
          "Verbinde Person, Netzwerk und Rolle innerhalb des Anschlagsplans.",
        placeholder: "Atta ist historisch wichtig, weil ...",
        sourceIds: ["r-911-atta", "r-911-archives"],
        conceptGroups: [
          {
            label: "Mitglied der Hamburger Zelle",
            variants: [
              "hamburger zelle",
              "hamburg",
              "netzwerk",
              "attas gruppe",
              "zelle"
            ]
          },
          {
            label: "Pilot oder operative Schlüsselfigur",
            variants: [
              "pilot",
              "attentatspilot",
              "operative rolle",
              "lenkte",
              "führte an",
              "koordinator"
            ]
          },
          {
            label: "zeigt transnationale Planung von Al-Qaida",
            variants: [
              "al qaida",
              "international",
              "transnational",
              "planung",
              "netzwerkterrorismus",
              "global"
            ]
          }
        ],
        successThreshold: 2,
        modelAnswer:
          "Mohammed Atta ist wichtig, weil er als Teil der Hamburger Zelle und als Pilot von Flug 11 eine operative Schlüsselfigur war. An ihm lässt sich zeigen, dass 9/11 von einem transnationalen Al-Qaida-Netzwerk geplant und vorbereitet wurde."
      }
    ],
    resources: [
      {
        id: "r-911-tv",
        bucket: "Pflichtfilme: zuerst bearbeiten",
        type: "Video",
        title: "Tagesschau vom 11. September 2001",
        focus:
          "Historische Nachrichtenbilder vom Anschlagstag, unmittelbare Wahrnehmung, Schock und Unsicherheit.",
        link: "https://www.youtube.com/watch?v=TUBqiwBtNuo",
        tags: ["YouTube", "Pflicht", "Einstieg"],
        selectionNote:
          "Starker Einstieg, weil das Video die damalige Wahrnehmung ohne spätere Rückschau zeigt.",
        didacticUse:
          "Zuerst anschauen, um Chronologie, Stimmung und mediale Wirkung des Tages zu sichern."
      },
      {
        id: "r-911-atta",
        bucket: "Pflichtfilme: zuerst bearbeiten",
        type: "Video",
        title: "Wer war Terrorpilot Atta? - Die Anschläge von 9/11 | Terra X",
        focus:
          "Täterprofil, Hamburger Zelle, Planung der Anschläge und Rolle Mohammed Attas.",
        link: "https://www.youtube.com/watch?v=QaViEEyxxGY",
        tags: ["YouTube", "Pflicht", "Täteranalyse"],
        selectionNote:
          "Hilfreich, weil das Video die Ebene der Täterplanung ergänzt und 9/11 nicht nur als Medienbild, sondern als organisierten Terrorakt zeigt.",
        didacticUse:
          "Nach dem Nachrichtenmaterial einsetzen, um Täterstruktur und Al-Qaida-Netzwerk zu klären."
      },
      {
        id: "r-911-arte",
        bucket: "Pflichtfilme: zuerst bearbeiten",
        type: "Video",
        title: "USA: 9/11 überlebt und krank an Leib und Seele | ARTE Reportage",
        focus:
          "Langzeitfolgen für Überlebende und Rettungskräfte, körperliche und psychische Nachwirkungen.",
        link: "https://www.youtube.com/watch?v=WSiKShic-ng",
        tags: ["YouTube", "Pflicht", "Nachwirkungen"],
        selectionNote:
          "Wichtige Gegenperspektive zur geopolitischen Erzählung. Der Link war in deiner Sammlung doppelt enthalten und wird hier einmal eingebaut.",
        didacticUse:
          "Zum Schluss der Station nutzen, damit 9/11 nicht auf Täter und Militärpolitik verengt wird."
      },
      {
        id: "r-911-bpb",
        bucket: "Zusatzquellen: Kontext und Vertiefung",
        type: "Website",
        title: "bpb: 2001 - Terroranschläge vom 11. September",
        focus:
          "Knapper Überblick zu Ablauf, Al-Qaida, War on Terror und politischen Folgen.",
        link: "https://www.bpb.de/kurz-knapp/hintergrund-aktuell/339825/2001-terroranschlaege-vom-11-september/",
        tags: ["bpb", "Kontext"],
        selectionNote:
          "Gut geeignet als sachlicher Überblick in deutscher Sprache.",
        didacticUse:
          "Zum Nacharbeiten der Grundfakten und als Stütze für die Transferfrage."
      },
      {
        id: "r-911-memorial",
        bucket: "Zusatzquellen: Kontext und Vertiefung",
        type: "Website",
        title: "9/11 Memorial & Museum: Resources",
        focus:
          "Offizielle Sammlung mit interaktiven Timelines, Oral Histories und Materialien zu Anschlägen und Nachgeschichte.",
        link: "https://www.911memorial.org/learn/resources",
        tags: ["Museum", "Offizielle Quelle"],
        selectionNote:
          "Besonders nützlich, wenn die Klasse mit Zeitachsen und Zeitzeugenperspektiven arbeiten soll.",
        didacticUse:
          "Für Vertiefung, Recherche und Differenzierung im Lehrer*innenmodus."
      },
      {
        id: "r-911-archives",
        bucket: "Zusatzquellen: Kontext und Vertiefung",
        type: "Website",
        title: "National Archives: 9/11 Commission Memoranda for the Record",
        focus:
          "Archivzugang zu Untersuchungsunterlagen der 9/11-Kommission.",
        link: "https://www.archives.gov/research/9-11/commission-memoranda2.html",
        tags: ["Archiv", "Offizielle Quelle"],
        selectionNote:
          "Erlaubt quellenkritische Vertiefung über bloße Überblickstexte hinaus.",
        didacticUse:
          "Vor allem für starke Lerngruppen oder vertiefte Rechercheaufträge geeignet."
      }
    ],
    questions: [
      {
        id: "q-911-1",
        type: "short-text",
        challenge: "Grundwissen",
        prompt:
          "Nenne zwei Merkmale des Anschlagsverlaufs vom 11. September 2001 und eine langfristige Folge.",
        help:
          "Verbinde den konkreten Ablauf des Tages mit einer politischen oder gesellschaftlichen Folge.",
        placeholder: "Am 11. September 2001 ... Langfristig führte das zu ...",
        sourceIds: ["r-911-tv", "r-911-bpb"],
        conceptGroups: [
          {
            label: "vier Flugzeuge oder mehrere Anschlagsorte",
            variants: [
              "vier flugzeuge",
              "vier maschinen",
              "world trade center",
              "pentagon",
              "pennsylvania",
              "gekaperte flugzeuge"
            ]
          },
          {
            label: "Al-Qaida oder koordinierter Terroranschlag",
            variants: [
              "al qaida",
              "terroristen",
              "koordiniert",
              "anschlagsplan",
              "hijacker",
              "attentaeter"
            ]
          },
          {
            label: "War on Terror oder Krieg in Afghanistan oder Sicherheitsgesetze",
            variants: [
              "war on terror",
              "krieg gegen den terror",
              "afghanistan",
              "patriot act",
              "nato",
              "sicherheitsgesetze"
            ]
          }
        ],
        successThreshold: 2,
        modelAnswer:
          "Am 11. September 2001 kaperten 19 Al-Qaida-Terroristen vier Passagierflugzeuge und steuerten sie in New York, Washington und Pennsylvania in tödliche Szenarien. Langfristig begann dadurch der War on Terror mit Kriegen, neuen Sicherheitsgesetzen und einer veränderten Außenpolitik der USA."
      },
      {
        id: "q-911-2",
        type: "short-text",
        challenge: "Einordnung",
        prompt:
          "Nenne drei historische Folgen von 9/11.",
        help:
          "Eine passende Antwort nennt politische, militärische oder gesellschaftliche Folgen.",
        placeholder: "Zu den Folgen von 9/11 gehörten ...",
        sourceIds: ["r-911-tv", "r-911-atta", "r-911-arte", "r-911-bpb"],
        conceptGroups: [
          {
            label: "NATO-Bündnisfall",
            variants: ["nato", "bündnisfall", "buendnisfall", "artikel 5", "article 5"]
          },
          {
            label: "Krieg in Afghanistan oder War on Terror",
            variants: ["afghanistan", "war on terror", "krieg gegen den terror", "intervention", "taliban"]
          },
          {
            label: "Sicherheitsgesetze oder Überwachung",
            variants: ["patriot act", "sicherheitsgesetze", "überwachung", "ueberwachung", "kontrollen", "sicherheitspolitik"]
          },
          {
            label: "Langzeitfolgen für Betroffene",
            variants: ["langzeitfolgen", "trauma", "rettungskräfte", "ueberlebende", "überlebende", "erkrankungen"]
          }
        ],
        successThreshold: 2,
        modelAnswer:
          "Zu den Folgen von 9/11 gehörten der erstmals ausgerufene NATO-Bündnisfall, der Krieg in Afghanistan im Rahmen des War on Terror sowie neue Sicherheitsgesetze und langanhaltende Folgen für Betroffene und Rettungskräfte."
      },
      {
        id: "q-911-3",
        type: "drag-order",
        challenge: "Chronologie",
        prompt:
          "Ordne die zentralen Ereignisse des 11. September 2001 in die richtige Reihenfolge.",
        help:
          "Beginne mit dem Einschlag in den Nordturm und ende mit dem Einsturz des Nordturms.",
        sourceIds: ["r-911-tv", "r-911-bpb", "r-911-memorial"],
        items: [
          {
            id: "north-impact",
            label: "08:46 Uhr: Flug 11 schlägt in den Nordturm des World Trade Centers ein.",
            detail: "Ab diesem Moment richtet sich die Aufmerksamkeit der Welt auf New York."
          },
          {
            id: "south-impact",
            label: "09:03 Uhr: Flug 175 trifft den Südturm.",
            detail: "Spätestens jetzt ist klar, dass es sich um einen koordinierten Anschlag handelt."
          },
          {
            id: "pentagon",
            label: "09:37 Uhr: Flug 77 schlägt ins Pentagon ein.",
            detail: "Der Angriff erreicht damit auch das militärische Zentrum der USA."
          },
          {
            id: "flight93",
            label: "10:03 Uhr: Flug 93 stürzt in Pennsylvania ab.",
            detail: "Passagiere versuchen, die Entführer zu stoppen."
          },
          {
            id: "south-collapse",
            label: "09:59 Uhr: Der Südturm stürzt ein.",
            detail: "Die Bilder prägen das kollektive Gedächtnis des Tages."
          },
          {
            id: "north-collapse",
            label: "10:28 Uhr: Der Nordturm stürzt ein.",
            detail: "Nun ist die Dimension der Katastrophe endgültig sichtbar."
          }
        ],
        correctOrder: [
          "north-impact",
          "south-impact",
          "pentagon",
          "south-collapse",
          "flight93",
          "north-collapse"
        ],
        explanation:
          "Die genaue Chronologie zeigt, wie schnell aus einem zunächst unklaren Ereignis ein koordinierter Massenanschlag wurde. Gerade die zeitliche Verdichtung erklärt die enorme Schockwirkung."
      },
      {
        id: "q-911-4",
        type: "short-text",
        challenge: "Perspektivwechsel",
        prompt:
          "Warum ist die Reportage über Überlebende und Erkrankte für die historische Arbeit zu 9/11 wichtig?",
        help:
          "Eine gute Antwort geht über Mitgefühl hinaus und erklärt den Erkenntniswert dieser Perspektive.",
        placeholder: "Die Reportage ist wichtig, weil ...",
        sourceIds: ["r-911-arte", "r-911-memorial"],
        conceptGroups: [
          {
            label: "zeigt Langzeitfolgen",
            variants: [
              "langzeitfolgen",
              "jahre spaeter",
              "spätfolgen",
              "dauerhaft",
              "noch heute",
              "lange nachwirkungen"
            ]
          },
          {
            label: "macht Opfer- oder Betroffenenperspektive sichtbar",
            variants: [
              "betroffene",
              "ueberlebende",
              "rettungskraefte",
              "opferperspektive",
              "menschliche ebene",
              "zeitzeugen"
            ]
          },
          {
            label: "erweitert die politische Ereignisgeschichte",
            variants: [
              "mehr als politik",
              "nicht nur geopolitik",
              "gesellschaftliche folgen",
              "erinnerung",
              "historische arbeit",
              "nachgeschichte"
            ]
          }
        ],
        successThreshold: 2,
        modelAnswer:
          "Die Reportage ist wichtig, weil sie zeigt, dass 9/11 nicht mit dem Einsturz der Türme endete. Sie macht die Perspektive von Überlebenden und Rettungskräften sichtbar und erweitert die politische Ereignisgeschichte um körperliche, psychische und erinnerungskulturelle Langzeitfolgen."
      },
      {
        id: "q-911-5",
        type: "short-text",
        challenge: "Transfer",
        prompt:
          "Warum gilt 9/11 als weltpolitischer Wendepunkt?",
        help:
          "Verbinde den Anschlag mit mindestens zwei größeren Folgen.",
        placeholder: "9/11 gilt als Wendepunkt, weil ...",
        sourceIds: ["r-911-tv", "r-911-atta", "r-911-arte", "r-911-bpb", "r-911-memorial"],
        conceptGroups: [
          {
            label: "globaler Schock oder mediale Wirkung",
            variants: ["schock", "weltweit", "medien", "live", "globale wirkung", "bilder"]
          },
          {
            label: "Krieg in Afghanistan oder War on Terror",
            variants: ["afghanistan", "war on terror", "krieg gegen den terror", "intervention", "taliban"]
          },
          {
            label: "neue Sicherheitsordnung",
            variants: ["nato", "bündnisfall", "sicherheitsgesetze", "überwachung", "ueberwachung", "patriot act"]
          }
        ],
        successThreshold: 2,
        modelAnswer:
          "9/11 gilt als weltpolitischer Wendepunkt, weil der Anschlag weltweit Schock und mediale Wirkung auslöste, zum Krieg in Afghanistan führte und eine neue Sicherheitsordnung mit Bündnisfall, Überwachung und dem War on Terror hervorbrachte."
      }
    ]
  },
  {
    id: "afghanistan",
    step: "2",
    title: "Afghanistan 2001 bis 2021",
    era: "1979 bis 30. August 2021",
    intro:
      "Diese Station verbindet die Vorgeschichte Afghanistans mit dem US-geführten Krieg seit Oktober 2001, der Jagd auf Osama bin Laden, dem langen Kampf gegen die Taliban und dem Abzug der USA am 30. August 2021.",
    goal:
      "Du kannst erklären, warum Afghanistan nach 9/11 zum Hauptkriegsschauplatz wurde und warum der Einsatz trotz militärischer Überlegenheit nicht zu dauerhafter Stabilität führte.",
    route:
      "Sichere zuerst die lange Vorgeschichte mit dem Überblicksvideo, kläre dann die Bin-Laden-Jagd und arbeite anschließend mit der frontal-Dokumentation zur Rückkehr der Taliban. Die Fragen führen von der Begründung des Krieges zur Analyse seines Scheiterns.",
    teacherNote:
      "Entscheidend ist, zwischen Al-Qaida, Taliban und afghanischer Gesellschaft zu unterscheiden. Die Station sollte gerade nicht den Eindruck erwecken, Afghanistan sei bloß die Bühne für westliche Politik gewesen.",
    teacherToolkit: {
      duration: "45 bis 55 Minuten",
      socialForms: [
        "Einzelarbeit mit Chronologiesicherung",
        "Partneraustausch zur Unterscheidung Taliban und Al-Qaida",
        "Transferfrage als bewertende Kurz-Essay-Aufgabe"
      ],
      assessmentFocus: [
        "Vorgeschichte Afghanistans als Voraussetzung mitdenken",
        "Bin Ladens Tötung nicht mit Kriegsende verwechseln",
        "Scheitern von Militär, Staatsaufbau und Legitimität zusammen betrachten"
      ],
      misconceptions: [
        "9/11 und Afghanistan seien identisch",
        "Mit Bin Ladens Tod 2011 sei der Krieg praktisch beendet gewesen",
        "Die Taliban seien nur von außen gesteuert worden"
      ],
      product:
        "Begründete Analyse zum Scheitern des langjährigen Afghanistan-Einsatzes.",
      extension:
        "Zusatzdiskussion zur Frage, ob der Krieg an zu großen Zielen, falschen Mitteln oder an der Struktur Afghanistans scheiterte."
    },
    visual: {
      src: "https://i.ytimg.com/vi/A9m7WLa4ECc/hqdefault.jpg",
      alt: "Vorschaubild zum Überblicksvideo über die Geschichte Afghanistans"
    },
    miniQuestions: [
      {
        id: "mq-afghanistan-1",
        title: "Kriegsgeschwächtes Land",
        type: "short-text",
        challenge: "Zusatzcheck",
        prompt:
          "Warum war Afghanistan im Jahr 2001 bereits ein kriegsgeschwächtes Land?",
        help:
          "Nenne mindestens zwei historische Vorbelastungen vor dem US-Einsatz.",
        placeholder: "Afghanistan war 2001 bereits geschwächt, weil ...",
        sourceIds: ["r-afghan-history", "r-afghan-bpb"],
        conceptGroups: [
          {
            label: "Sowjetkrieg oder sowjetische Intervention",
            variants: [
              "sowjet",
              "sowjetunion",
              "1979",
              "sowjetkrieg",
              "besatzung",
              "sowjetische intervention"
            ]
          },
          {
            label: "Bürgerkrieg oder Machtkämpfe nach 1989",
            variants: [
              "bürgerkrieg",
              "warlords",
              "fraktionen",
              "machtkampf",
              "mujahedin",
              "zerfall"
            ]
          },
          {
            label: "Taliban-Herrschaft vor 2001",
            variants: [
              "taliban",
              "taleban",
              "kabul 1996",
              "regime",
              "herrschaft",
              "islamistisches regime"
            ]
          }
        ],
        successThreshold: 2,
        modelAnswer:
          "Afghanistan war 2001 bereits durch den sowjetisch-afghanischen Krieg, den anschließenden Bürgerkrieg und die Taliban-Herrschaft geschwächt. Der US-Einsatz traf also nicht auf einen stabilen Staat, sondern auf ein von Gewalt und Machtkämpfen geprägtes Land."
      },
      {
        id: "mq-afghanistan-2",
        title: "Bin Laden 2011",
        type: "short-text",
        challenge: "Zusatzcheck",
        prompt:
          "Warum beendete die Tötung Osama bin Ladens am 2. Mai 2011 den Krieg in Afghanistan nicht?",
        help:
          "Unterscheide klar zwischen Al-Qaida, Taliban und dem politischen Zustand Afghanistans.",
        placeholder: "Bin Ladens Tod beendete den Krieg nicht, weil ...",
        sourceIds: ["r-afghan-binladen", "r-afghan-crs"],
        conceptGroups: [
          {
            label: "Taliban und Al-Qaida sind nicht identisch",
            variants: [
              "nicht identisch",
              "taliban",
              "taleban",
              "al qaida",
              "verschiedene gruppen",
              "anderes ziel"
            ]
          },
          {
            label: "Staatsaufbau oder Sicherheitslage blieben ungelöst",
            variants: [
              "staatsaufbau",
              "sicherheitslage",
              "korruption",
              "regierung schwach",
              "instabil",
              "keine stabilität"
            ]
          },
          {
            label: "Krieg war lokal und regional verankert",
            variants: [
              "lokal",
              "regional",
              "aufstand",
              "aufständische",
              "rückhalt",
              "netzwerke"
            ]
          }
        ],
        successThreshold: 2,
        modelAnswer:
          "Bin Ladens Tod beendete den Krieg nicht, weil Al-Qaida und die Taliban unterschiedliche Akteure waren. Die Taliban blieben kampffähig, während Staatsaufbau, Korruption und Sicherheitslage in Afghanistan weiterhin ungelöst waren."
      }
    ],
    resources: [
      {
        id: "r-afghan-history",
        bucket: "Pflichtfilme: zuerst bearbeiten",
        type: "Video",
        title: "Die Geschichte Afghanistans: Ein Land im Kriegszustand",
        focus:
          "Lange Vorgeschichte seit dem 20. Jahrhundert, sowjetischer Krieg, Bürgerkrieg und Taliban-Herrschaft.",
        link: "https://www.youtube.com/watch?v=A9m7WLa4ECc",
        tags: ["YouTube", "Pflicht", "Überblick"],
        selectionNote:
          "Das Video verhindert, dass Afghanistan nur als Folge von 9/11 erscheint. Es schafft die nötige Tiefenschärfe für den späteren Krieg.",
        didacticUse:
          "Immer zuerst nutzen, um Voraussetzungen, Begriffe und Akteurslagen zu klären."
      },
      {
        id: "r-afghan-binladen",
        bucket: "Pflichtfilme: zuerst bearbeiten",
        type: "Video",
        title: "Die Jagd auf Amerikas Staatsfeind Nr. 1 | Terra X",
        focus:
          "Osama bin Laden, Geheimdienstarbeit, Abbottabad 2011 und Symbolik der Tötung.",
        link: "https://www.youtube.com/watch?v=8BxMpoeclhE",
        tags: ["YouTube", "Pflicht", "Bin Laden"],
        selectionNote:
          "Stark für die Frage, warum ein symbolischer Erfolg nicht automatisch das politische Kriegsziel erfüllt.",
        didacticUse:
          "Nach dem Überblick einsetzen, um zwischen Terrorabwehr und Afghanistan-Krieg zu unterscheiden."
      },
      {
        id: "r-afghan-taliban",
        bucket: "Pflichtfilme: zuerst bearbeiten",
        type: "Video",
        title: "Der geheime Kampf des Westens gegen die Taliban | frontal",
        focus:
          "Rückkehr der Taliban, Verflechtung von Krieg, Geheimdienstlogik und Scheitern westlicher Strategien.",
        link: "https://www.youtube.com/watch?v=6EMU09KMj54",
        tags: ["YouTube", "Pflicht", "Vertiefung"],
        selectionNote:
          "Hilfreich, weil das Video die späte Kriegsphase und das Problem des nicht gewonnenen Friedens sichtbar macht.",
        didacticUse:
          "Als drittes Material einsetzen und mit der Transferfrage zum Scheitern verbinden."
      },
      {
        id: "r-afghan-bpb",
        bucket: "Zusatzquellen: Kontext und Vertiefung",
        type: "Website",
        title: "bpb: Afghanistan 2001 bis 2021",
        focus:
          "Vertiefender Überblick zur Entwicklung von Taliban und Al-Qaida seit 9/11.",
        link: "https://www.bpb.de/shop/zeitschriften/apuz/nine-eleven-2021/336164/afghanistan-2001-bis-2021/",
        tags: ["bpb", "Vertiefung"],
        selectionNote:
          "Besonders stark für differenzierte Antworten, weil der Text Taliban und Al-Qaida sauber auseinanderhält.",
        didacticUse:
          "Für anspruchsvollere Transferantworten und Zusatzrecherche geeignet."
      },
      {
        id: "r-afghan-crs",
        bucket: "Zusatzquellen: Kontext und Vertiefung",
        type: "Website",
        title: "Congressional Research Service: Afghanistan - Background and U.S. Policy in Brief",
        focus:
          "Kompakter Bericht zur US-Politik, zur Taliban-Rückkehr und zur Lage nach 2021.",
        link: "https://crsreports.congress.gov/product/pdf/R/R45122",
        tags: ["CRS", "Bericht", "Offizielle Quelle"],
        selectionNote:
          "Gut als faktenreiche Hintergrundquelle mit Blick auf politische Entscheidungen der USA.",
        didacticUse:
          "Als faktenreiche Zusatzquelle für Vertiefung und Nachschlagen."
      },
      {
        id: "r-afghan-withdrawal",
        bucket: "Zusatzquellen: Kontext und Vertiefung",
        type: "Website",
        title: "U.S. Department of Defense: Statement on the End of the American War in Afghanistan",
        focus:
          "Offizielle US-Erklärung zum Ende des Krieges und zum Abschluss des militärischen Abzugs am 30. August 2021.",
        link: "https://www.defense.gov/News/Releases/release/article/2759181/statement-by-secretary-of-defense-lloyd-austin-iii-on-the-end-of-the-american-w/",
        tags: ["DoD", "Offizielle Quelle"],
        selectionNote:
          "Nützlich, um offizielle Selbstdeutung und historische Bilanz miteinander zu vergleichen.",
        didacticUse:
          "Für Quellenkritik: Wie beschreibt die US-Regierung selbst das Ende des Krieges?"
      }
    ],
    questions: [
      {
        id: "q-afghan-1",
        type: "short-text",
        challenge: "Grundwissen",
        prompt:
          "Warum griffen die USA Afghanistan ab dem 7. Oktober 2001 an?",
        help:
          "Nenne den Zusammenhang zwischen 9/11, Al-Qaida und dem Taliban-Regime.",
        placeholder: "Die USA griffen Afghanistan an, weil ...",
        sourceIds: ["r-afghan-history", "r-afghan-bpb"],
        conceptGroups: [
          {
            label: "9/11 als Auslöser",
            variants: ["9/11", "11. september", "anschläge", "terroranschläge", "new york", "anschlag"]
          },
          {
            label: "Al-Qaida oder Bin Laden",
            variants: ["al qaida", "bin laden", "osama", "terrornetzwerk", "terrororganisation"]
          },
          {
            label: "Taliban schützten Al-Qaida oder lieferten Bin Laden nicht aus",
            variants: ["taliban", "taleban", "nicht ausliefern", "schutzraum", "schützten", "auslieferung"]
          }
        ],
        successThreshold: 2,
        modelAnswer:
          "Die USA griffen Afghanistan an, weil sie Al-Qaida für 9/11 verantwortlich machten und das Taliban-Regime Bin Laden nicht auslieferte, sondern dem Netzwerk Schutz bot."
      },
      {
        id: "q-afghan-2",
        type: "short-text",
        challenge: "Ursachenanalyse",
        prompt:
          "Nenne drei Gründe, warum der Afghanistan-Krieg so lange dauerte.",
        help:
          "Geeignet sind strukturelle Gründe wie Staatsaufbau, Taliban und wechselnde Kriegsziele.",
        placeholder: "Der Krieg dauerte so lange, weil ...",
        sourceIds: ["r-afghan-history", "r-afghan-taliban", "r-afghan-crs"],
        conceptGroups: [
          {
            label: "schwacher Staat oder Korruption",
            variants: ["schwacher staat", "korruption", "regierung schwach", "staatsaufbau", "institutionen", "instabil"]
          },
          {
            label: "Taliban blieben kampffähig oder verankert",
            variants: ["taliban", "taleban", "verankert", "rückkehr", "aufstand", "netzwerke"]
          },
          {
            label: "Kriegsziele weiteten sich aus",
            variants: ["staatsaufbau", "demokratisierung", "ziele", "nation building", "mehrere ziele", "ausweitung"]
          }
        ],
        successThreshold: 2,
        modelAnswer:
          "Der Afghanistan-Krieg dauerte so lange, weil der Staatsaufbau schwach und oft korrupt blieb, die Taliban regional verankert und kampffähig waren und sich die westlichen Ziele von Terrorabwehr zu breitem Staatsaufbau ausweiteten."
      },
      {
        id: "q-afghan-3",
        type: "drag-order",
        challenge: "Chronologie",
        prompt:
          "Ordne die Schlüsselereignisse Afghanistans von der Taliban-Herrschaft bis zum US-Abzug in die richtige Reihenfolge.",
        help:
          "Beginne mit der Machtübernahme der Taliban in Kabul und ende mit dem vollständigen Abzug der USA am 30. August 2021.",
        sourceIds: ["r-afghan-history", "r-afghan-binladen", "r-afghan-taliban", "r-afghan-withdrawal"],
        items: [
          {
            id: "taliban-1996",
            label: "1996: Die Taliban erobern Kabul und errichten ihr Regime.",
            detail: "Damit beginnt die Phase, in der Afghanistan zum Schutzraum für Al-Qaida wird."
          },
          {
            id: "attack-2001",
            label: "11. September 2001: Die Anschläge in den USA verändern die Lage grundlegend.",
            detail: "Afghanistan wird zum Hauptziel des US-geführten Gegenschlags."
          },
          {
            id: "oef-2001",
            label: "7. Oktober 2001: Die USA und Verbündete beginnen die Intervention in Afghanistan.",
            detail: "Der Krieg startet zunächst als direkte Reaktion auf 9/11."
          },
          {
            id: "abbottabad-2011",
            label: "2. Mai 2011: Osama bin Laden wird in Abbottabad in Pakistan getötet.",
            detail: "Ein symbolischer Erfolg, aber kein Kriegsende."
          },
          {
            id: "doha-2020",
            label: "29. Februar 2020: Das Doha-Abkommen zwischen den USA und den Taliban wird geschlossen.",
            detail: "Es ebnet den Weg zum späteren Abzug."
          },
          {
            id: "withdrawal-2021",
            label: "30. August 2021: Die letzten US-Soldaten verlassen Afghanistan.",
            detail: "Der militärische Einsatz der USA endet nach fast 20 Jahren."
          }
        ],
        correctOrder: [
          "taliban-1996",
          "attack-2001",
          "oef-2001",
          "abbottabad-2011",
          "doha-2020",
          "withdrawal-2021"
        ],
        explanation:
          "Die Chronologie macht sichtbar, dass der Afghanistan-Krieg eine lange Vorgeschichte hatte und dass zwischen 9/11, Bin Ladens Tod und dem eigentlichen Kriegsende fast zwei Jahrzehnte lagen."
      },
      {
        id: "q-afghan-4",
        type: "short-text",
        challenge: "Strukturverständnis",
        prompt:
          "Warum ließ sich Afghanistan nach 2001 nicht einfach in einen stabilen westlichen Verbündeten verwandeln?",
        help:
          "Verbinde lokale Machtverhältnisse, äußere Intervention und gesellschaftliche Realität.",
        placeholder: "Afghanistan ließ sich nicht einfach stabilisieren, weil ...",
        sourceIds: ["r-afghan-history", "r-afghan-taliban", "r-afghan-crs"],
        conceptGroups: [
          {
            label: "schwacher Staat oder Korruption",
            variants: [
              "schwacher staat",
              "korruption",
              "regierung schwach",
              "instabil",
              "staatsaufbau",
              "klientel"
            ]
          },
          {
            label: "Taliban blieben verankert oder kehrten zurück",
            variants: [
              "taliban",
              "taleban",
              "kehrten zurück",
              "verankert",
              "aufstand",
              "rückhalt"
            ]
          },
          {
            label: "äußere Intervention stieß an Grenzen",
            variants: [
              "ausländische truppen",
              "intervention",
              "von außen",
              "westen",
              "grenzen",
              "keine legitimität"
            ]
          }
        ],
        successThreshold: 2,
        modelAnswer:
          "Afghanistan ließ sich nicht einfach stabilisieren, weil der Staat schwach und oft korrupt blieb, die Taliban regional verankert waren und ausländische Intervention an gesellschaftliche und politische Grenzen stieß. Militärische Überlegenheit allein reichte deshalb nicht aus."
      },
      {
        id: "q-afghan-5",
        type: "short-text",
        challenge: "Transfer",
        prompt:
          "Warum erreichten die USA ihr politisches Ziel in Afghanistan trotz militärischer Überlegenheit nicht dauerhaft?",
        help:
          "Nenne mindestens zwei strukturelle Gründe und wenn möglich den Bezug zum Abzug 2021.",
        placeholder: "Das politische Ziel wurde nicht dauerhaft erreicht, weil ...",
        sourceIds: ["r-afghan-history", "r-afghan-binladen", "r-afghan-taliban", "r-afghan-bpb", "r-afghan-withdrawal"],
        conceptGroups: [
          {
            label: "militärischer Erfolg reichte nicht für Stabilität",
            variants: ["militärisch", "stabilität", "nicht genug", "politisch", "keine stabile ordnung", "dauerhaft"]
          },
          {
            label: "schwacher Staatsaufbau oder Korruption",
            variants: ["staatsaufbau", "korruption", "regierung schwach", "legitimität", "institutionen", "schwacher staat"]
          },
          {
            label: "Taliban kehrten zurück oder blieben verankert",
            variants: ["taliban", "taleban", "rückkehr", "verankert", "aufstand", "netzwerke"]
          }
        ],
        successThreshold: 2,
        modelAnswer:
          "Die USA erreichten ihr politisches Ziel in Afghanistan nicht dauerhaft, weil militärische Überlegenheit keine stabile Ordnung garantierte. Der Staatsaufbau blieb schwach und korrupt, die Taliban blieben verankert und kehrten 2021 nach dem Abzug schnell an die Macht zurück."
      }
    ]
  },
  {
    id: "irak",
    step: "3",
    title: "Irak: Vom Golfkrieg 1991 zum US-Abzug 2011",
    era: "2. August 1990 bis 18. Dezember 2011",
    intro:
      "Diese Station nimmt den Irakkrieg nicht isoliert in den Blick, sondern beginnt mit einem kurzen Rückblick auf den ersten Golfkrieg 1990/91. Von dort führt die Lernroute über Saddam Hussein, den Irakkrieg ab dem 20. März 2003 und die Besatzungsphase bis zum Abzug der letzten US-Kampftruppen im Dezember 2011.",
    goal:
      "Du kannst den Unterschied zwischen Golfkrieg 1991 und Irakkrieg 2003 erklären und beurteilen, warum der Sturz Saddam Husseins keine stabile Nachkriegsordnung hervorbrachte.",
    route:
      "Bearbeite zuerst das Überblicksvideo zu den Golfkriegen und sichere dann mit der Saddam-Biografie die Akteursseite. Nutze danach die Zusatzquellen, um 1991, 2003 und 2011 klar voneinander zu unterscheiden.",
    teacherNote:
      "Die Station eignet sich besonders, um die verbreitete Gleichsetzung von 9/11 und Irakkrieg zu korrigieren. Entscheidend ist die Unterscheidung zwischen Befreiung Kuwaits 1991, Regimewechsel 2003 und der langen Phase der Besatzung und Gewalt danach.",
    teacherToolkit: {
      duration: "45 bis 55 Minuten",
      socialForms: [
        "Einzelarbeit mit begriffsgeleiteter Sicherung",
        "Partnervergleich zu 1991 und 2003",
        "Transferfrage als gewichtendes Urteil"
      ],
      assessmentFocus: [
        "1991 und 2003 sauber unterscheiden",
        "Saddams Diktatur nicht mit Kriegsursachen gleichsetzen",
        "Instabilität nach 2003 als Folge der Besatzung und innerirakischer Konflikte erfassen"
      ],
      misconceptions: [
        "Der Irakkrieg 2003 sei die direkte militärische Antwort auf 9/11 gewesen",
        "Mit dem Sturz Saddam Husseins sei der Konflikt gelöst gewesen",
        "Der Abzug 2011 bedeute automatisch Frieden und Ordnung"
      ],
      product:
        "Gewichtetes Urteil zu Motiven, Verlauf und Folgen des Irakkriegs.",
      extension:
        "Vertiefung zur Frage, ob der Irakkrieg eher Sicherheitskrieg, Regimewechselkrieg oder machtpolitisches Projekt war."
    },
    visual: {
      src: "https://i.ytimg.com/vi/4hzzL9fi2Tc/hqdefault.jpg",
      alt: "Vorschaubild zum Überblicksvideo über die Golfkriege"
    },
    miniQuestions: [
      {
        id: "mq-irak-1",
        title: "Warum 1991 wichtig ist",
        type: "short-text",
        challenge: "Zusatzcheck",
        prompt:
          "Warum ist der Golfkrieg 1990/91 wichtig, obwohl der Irakkrieg 2003 viel später begann?",
        help:
          "Verbinde den Krieg um Kuwait mit den offenen Konflikten der 1990er Jahre.",
        placeholder: "Der Golfkrieg 1990/91 ist wichtig, weil ...",
        sourceIds: ["r-iraq-golf", "r-iraq-bpb"],
        conceptGroups: [
          {
            label: "Saddam blieb nach 1991 an der Macht",
            variants: [
              "saddam blieb",
              "an der macht",
              "nicht gestürzt",
              "regime blieb",
              "kein regimewechsel",
              "hussein blieb"
            ]
          },
          {
            label: "Sanktionen oder Eindämmungspolitik folgten",
            variants: [
              "sanktionen",
              "eindämmung",
              "containment",
              "embargo",
              "no fly zones",
              "kontrollen"
            ]
          },
          {
            label: "Konflikt blieb für die USA und die Region offen",
            variants: [
              "offen",
              "ungelöst",
              "späterer krieg",
              "vorgeschichte",
              "regionale spannung",
              "weiterer konflikt"
            ]
          }
        ],
        successThreshold: 2,
        modelAnswer:
          "Der Golfkrieg 1990/91 ist wichtig, weil Saddam Hussein trotz der Niederlage an der Macht blieb und danach ein langes Sanktions- und Eindämmungsregime entstand. Dadurch blieb der Konflikt mit dem Irak offen und bildete eine wichtige Vorgeschichte für 2003."
      },
      {
        id: "mq-irak-2",
        title: "1991 oder 2003?",
        type: "short-text",
        challenge: "Zusatzcheck",
        prompt:
          "Was ist der Kernunterschied zwischen dem Krieg von 1991 und dem Krieg von 2003?",
        help:
          "Nenne das jeweilige Ziel beider Kriege in einem klaren Gegensatz.",
        placeholder: "1991 ging es vor allem um ..., 2003 dagegen um ...",
        sourceIds: ["r-iraq-golf", "r-iraq-history-state"],
        conceptGroups: [
          {
            label: "1991: Kuwait befreien oder Irak zurückdrängen",
            variants: [
              "kuwait",
              "befreien",
              "zurückdrängen",
              "desert storm",
              "irak aus kuwait",
              "grenze"
            ]
          },
          {
            label: "2003: Regimewechsel oder Sturz Saddams",
            variants: [
              "regimewechsel",
              "saddam stürzen",
              "sturz saddams",
              "besetzung",
              "bagdad",
              "occupation"
            ]
          },
          {
            label: "2003 führte zu langer Besatzung",
            variants: [
              "besatzung",
              "langer krieg",
              "nachkriegsordnung",
              "instabilität",
              "bürgerkrieg",
              "gewalt"
            ]
          }
        ],
        successThreshold: 2,
        modelAnswer:
          "1991 ging es vor allem darum, den Irak aus Kuwait zurückzudrängen. 2003 ging es dagegen um den Sturz Saddam Husseins und um Regimewechsel, was in eine lange Besatzungs- und Gewaltphase führte."
      }
    ],
    resources: [
      {
        id: "r-iraq-golf",
        bucket: "Pflichtfilme: zuerst bearbeiten",
        type: "Video",
        title: "Die Golfkriege einfach erklärt",
        focus:
          "Überblick zu Golfkrieg 1990/91, Irakkrieg 2003 und den wichtigsten Unterschieden beider Kriege.",
        link: "https://www.youtube.com/watch?v=4hzzL9fi2Tc",
        tags: ["YouTube", "Pflicht", "Überblick"],
        selectionNote:
          "Das Video ordnet beide Kriege zusammen und ist deshalb ideal für den von dir gewünschten Rückblick auf 1991.",
        didacticUse:
          "Zuerst einsetzen, damit 1991, 2003 und 2011 begrifflich sauber getrennt werden."
      },
      {
        id: "r-iraq-saddam",
        bucket: "Pflichtfilme: zuerst bearbeiten",
        type: "Video",
        title: "Saddam Hussein - Biografie eines Tyrannen | Terra X",
        focus:
          "Diktatur, Gewaltapparat, Machtstil Saddam Husseins und seine Rolle in den Konflikten um den Irak.",
        link: "https://www.youtube.com/watch?v=gskoaKjcebc",
        tags: ["YouTube", "Pflicht", "Akteur"],
        selectionNote:
          "Hilfreich, um die Person Saddam als Faktor zu verstehen, ohne die Kriegsursachen auf Biografie zu verkürzen.",
        didacticUse:
          "Nach dem Überblicksvideo einsetzen und anschließend kritisch mit der Transferfrage verknüpfen."
      },
      {
        id: "r-iraq-bpb",
        bucket: "Zusatzquellen: Kontext und Vertiefung",
        type: "Website",
        title: "bpb: Der Zweite Golfkrieg",
        focus:
          "Kompakter Überblick zu Kuwait 1990, internationaler Koalition, Sanktionen und regionalen Folgen.",
        link: "https://www.bpb.de/kurz-knapp/hintergrund-aktuell/210410/der-zweite-golfkrieg/",
        tags: ["bpb", "Rückblick"],
        selectionNote:
          "Gut geeignet, um den kurzen Rückblick auf 1991 mit belastbaren Fakten zu unterfüttern.",
        didacticUse:
          "Für den Unterschied zwischen 1991 und 2003 sowie zur Einordnung der Sanktionen."
      },
      {
        id: "r-iraq-history-state",
        bucket: "Zusatzquellen: Kontext und Vertiefung",
        type: "Website",
        title: "Office of the Historian: Iraq",
        focus:
          "Offizieller historischer Überblick zur US-Irak-Politik mit Abschnitten zu 2003, 2004 und danach.",
        link: "https://history.state.gov/countries/iraq",
        tags: ["Historian", "Offizielle Quelle"],
        selectionNote:
          "Nützlich, weil die Quelle den Übergang von Invasion, Besatzung und Souveränitätsübertragung knapp zusammenfasst.",
        didacticUse:
          "Als faktenorientierte Stütze für die Fragen zu 2003 bis 2011."
      },
      {
        id: "r-iraq-homecoming",
        bucket: "Zusatzquellen: Kontext und Vertiefung",
        type: "Website",
        title: "White House Archive: Homecoming for the Final U.S. Forces Iraq Troops",
        focus:
          "Offizielle US-Selbstdeutung zum Ende des Krieges und zur Rückkehr der letzten Kräfte im Dezember 2011.",
        link: "https://obamawhitehouse.archives.gov/blog/2011/12/20/homecoming-final-us-forces-iraq-troops",
        tags: ["White House", "Offizielle Quelle"],
        selectionNote:
          "Ermöglicht die Frage, wie Regierungen das Kriegsende darstellen und welche Probleme dabei ausgeblendet werden.",
        didacticUse:
          "Für Quellenkritik und zur Einordnung des US-Abzugs 2011."
      }
    ],
    questions: [
      {
        id: "q-iraq-1",
        type: "short-text",
        challenge: "Grundwissen",
        prompt:
          "Warum war der Irakkrieg ab dem 20. März 2003 nicht einfach eine direkte Fortsetzung von 9/11?",
        help:
          "Unterscheide zwischen der Atmosphäre nach 9/11 und den tatsächlichen Begründungen für den Irakkrieg.",
        placeholder: "Der Irakkrieg 2003 war nicht einfach eine direkte Fortsetzung von 9/11, weil ...",
        sourceIds: ["r-iraq-golf", "r-iraq-history-state"],
        conceptGroups: [
          {
            label: "kein gesicherter direkter 9/11-Nachweis gegen Saddam",
            variants: [
              "kein direkter nachweis",
              "keine direkte verbindung",
              "nicht 9/11",
              "saddam nicht nachgewiesen",
              "kein beweis",
              "keine operative verbindung"
            ]
          },
          {
            label: "Begründung mit Massenvernichtungswaffen oder Sicherheitsbedrohung",
            variants: [
              "massenvernichtungswaffen",
              "waffen",
              "wmd",
              "bedrohung",
              "sicherheitsargument",
              "abrüstung"
            ]
          },
          {
            label: "Regimewechsel oder Sturz Saddams",
            variants: [
              "regimewechsel",
              "saddam stürzen",
              "sturz",
              "besatzung",
              "bagdad",
              "machtwechsel"
            ]
          }
        ],
        successThreshold: 2,
        modelAnswer:
          "Der Irakkrieg 2003 war nicht einfach eine direkte Fortsetzung von 9/11, weil für Saddam Hussein keine direkte operative Verantwortung für die Anschläge nachgewiesen wurde. Die US-Regierung begründete den Krieg vor allem mit Massenvernichtungswaffen und Regimewechsel."
      },
      {
        id: "q-iraq-2",
        type: "short-text",
        challenge: "Folgenanalyse",
        prompt:
          "Nenne drei Entwicklungen, die die Lage im Irak nach 2003 verschärften.",
        help:
          "Achte auf Besatzungspolitik, Gewaltentwicklung und Machtvakuum.",
        placeholder: "Nach 2003 verschärfte sich die Lage, weil ...",
        sourceIds: ["r-iraq-golf", "r-iraq-saddam", "r-iraq-history-state"],
        conceptGroups: [
          {
            label: "Auflösung der Armee oder Entbaathifizierung",
            variants: ["armee aufgelöst", "entbaathifizierung", "de-baathifizierung", "baath", "machtvakuum", "verwaltung"]
          },
          {
            label: "Aufstand oder konfessionelle Gewalt",
            variants: ["aufstand", "terror", "konfessionelle gewalt", "bürgerkrieg", "anschläge", "gewalt"]
          },
          {
            label: "Al-Qaida im Irak oder Instabilität",
            variants: ["al qaida im irak", "instabilität", "machtvakuum", "extremisten", "aufständische", "unsicherheit"]
          }
        ],
        successThreshold: 2,
        modelAnswer:
          "Nach 2003 verschärfte sich die Lage im Irak durch die Auflösung von Armee und Verwaltung, durch Aufstand und konfessionelle Gewalt sowie durch das Machtvakuum, in dem Gruppen wie Al-Qaida im Irak an Einfluss gewannen."
      },
      {
        id: "q-iraq-3",
        type: "drag-order",
        challenge: "Chronologie",
        prompt:
          "Ordne die Schlüsselereignisse vom Golfkrieg bis zum US-Abzug aus dem Irak.",
        help:
          "Beginne mit dem Einmarsch in Kuwait und ende mit dem Rückzug der letzten US-Kampftruppen 2011.",
        sourceIds: ["r-iraq-golf", "r-iraq-bpb", "r-iraq-history-state", "r-iraq-homecoming"],
        items: [
          {
            id: "kuwait-1990",
            label: "2. August 1990: Irakische Truppen besetzen Kuwait.",
            detail: "Damit beginnt die Krise, die zum Golfkrieg führt."
          },
          {
            id: "desert-storm-1991",
            label: "Januar/Februar 1991: Die internationale Koalition drängt den Irak militärisch aus Kuwait zurück.",
            detail: "Saddam bleibt dennoch an der Macht."
          },
          {
            id: "invasion-2003",
            label: "20. März 2003: Die USA und Verbündete greifen den Irak an.",
            detail: "Nun steht Regimewechsel im Zentrum."
          },
          {
            id: "sovereignty-2004",
            label: "28. Juni 2004: Die Besatzungsbehörde übergibt formell Souveränität an eine irakische Übergangsregierung.",
            detail: "Der Konflikt ist damit aber keineswegs beendet."
          },
          {
            id: "withdrawal-2011",
            label: "18. Dezember 2011: Die letzten US-Kampftruppen verlassen den Irak.",
            detail: "Der formale Abzug beendet nicht automatisch die Instabilität im Land."
          }
        ],
        correctOrder: [
          "kuwait-1990",
          "desert-storm-1991",
          "invasion-2003",
          "sovereignty-2004",
          "withdrawal-2011"
        ],
        explanation:
          "Die Reihenfolge zeigt, dass der Irakkrieg von 2003 ohne den ungelösten Konflikt seit 1990/91 kaum verständlich ist. Zugleich wird sichtbar, dass auch der Abzug 2011 nicht mit Frieden gleichzusetzen ist."
      },
      {
        id: "q-iraq-4",
        type: "short-text",
        challenge: "Akteursanalyse",
        prompt:
          "Wie hilft die Saddam-Biografie beim Verständnis des Krieges, und wo reicht diese Erklärung allein nicht aus?",
        help:
          "Verbinde die Person Saddams mit größeren politischen und internationalen Zusammenhängen.",
        placeholder: "Die Biografie hilft, weil ... Sie reicht aber nicht aus, weil ...",
        sourceIds: ["r-iraq-saddam", "r-iraq-golf", "r-iraq-bpb"],
        conceptGroups: [
          {
            label: "zeigt Diktatur, Gewalt oder Repression",
            variants: [
              "diktatur",
              "repression",
              "gewaltapparat",
              "tyrann",
              "unterdrückung",
              "herrschaft"
            ]
          },
          {
            label: "erklärt aber nicht allein 2003",
            variants: [
              "nicht allein",
              "reicht nicht",
              "nur biografie",
              "nicht genug",
              "mehrere ursachen",
              "allein nicht"
            ]
          },
          {
            label: "internationale Politik oder 9/11-Kontext muss ergänzt werden",
            variants: [
              "9/11",
              "internationale politik",
              "massenvernichtungswaffen",
              "usa",
              "regimewechsel",
              "golfkrieg"
            ]
          }
        ],
        successThreshold: 2,
        modelAnswer:
          "Die Saddam-Biografie hilft, weil sie Diktatur, Gewalt und Machtstil des Regimes sichtbar macht. Sie reicht aber nicht aus, weil der Krieg von 2003 zusätzlich durch internationale Machtpolitik, den Kontext nach 9/11 und die Debatte um Massenvernichtungswaffen erklärt werden muss."
      },
      {
        id: "q-iraq-5",
        type: "short-text",
        challenge: "Transfer",
        prompt:
          "Warum führte der Sturz Saddam Husseins 2003 nicht zu einer stabilen Nachkriegsordnung?",
        help:
          "Nenne mindestens zwei Faktoren aus Besatzung, Gewalt und Machtvakuum.",
        placeholder: "Der Sturz Saddams führte nicht zu Stabilität, weil ...",
        sourceIds: ["r-iraq-golf", "r-iraq-saddam", "r-iraq-bpb", "r-iraq-history-state", "r-iraq-homecoming"],
        conceptGroups: [
          {
            label: "Besatzung oder Fehlentscheidungen nach 2003",
            variants: ["besatzung", "fehlentscheidungen", "armee", "entbaathifizierung", "verwaltung", "machtvakuum"]
          },
          {
            label: "Gewalt oder Aufstand",
            variants: ["aufstand", "terror", "gewalt", "konfessionell", "anschläge", "bürgerkrieg"]
          },
          {
            label: "keine stabile politische Ordnung",
            variants: ["instabilität", "keine stabile ordnung", "nicht stabil", "schwacher staat", "unsicherheit", "ordnung"]
          }
        ],
        successThreshold: 2,
        modelAnswer:
          "Der Sturz Saddam Husseins führte nicht zu einer stabilen Nachkriegsordnung, weil die Besatzungspolitik ein Machtvakuum erzeugte, Gewalt und Aufstand zunahmen und keine dauerhaft tragfähige politische Ordnung entstand."
      }
    ]
  }
];

window.NINE_ELEVEN_MODULES = MODULES;
