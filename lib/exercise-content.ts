export interface ExerciseVideo {
  videoId: string;
  title: string;
  channel: string;
  language: 'nl' | 'en';
}

export interface ExerciseEducation {
  setup: string;
  steps: string[];
  commonMistakes: string[];
  video: ExerciseVideo;
}

export function isValidYouTubeVideoId(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Za-z0-9_-]{11}$/.test(value);
}

export function validateExerciseEducation(exerciseId: string, value: unknown): asserts value is ExerciseEducation {
  const education = value as Partial<ExerciseEducation> | null;
  if (!education || typeof education !== 'object') throw new Error(`${exerciseId} is missing exercise education.`);
  if (typeof education.setup !== 'string' || education.setup.trim().length < 20) throw new Error(`${exerciseId} needs a clear setup.`);
  if (!Array.isArray(education.steps) || education.steps.length < 3 || education.steps.some((step) => typeof step !== 'string' || step.trim().length < 10)) throw new Error(`${exerciseId} needs at least three clear steps.`);
  if (!Array.isArray(education.commonMistakes) || education.commonMistakes.length < 1 || education.commonMistakes.some((mistake) => typeof mistake !== 'string' || !mistake.trim())) throw new Error(`${exerciseId} needs a common mistake.`);
  const video = education.video as Partial<ExerciseVideo> | undefined;
  if (!video || !isValidYouTubeVideoId(video.videoId)) throw new Error(`${exerciseId} has an invalid YouTube video ID.`);
  if (typeof video.title !== 'string' || video.title.trim().length < 5) throw new Error(`${exerciseId} needs a video title.`);
  if (typeof video.channel !== 'string' || video.channel.trim().length < 2) throw new Error(`${exerciseId} needs a video channel.`);
  if (video.language !== 'nl' && video.language !== 'en') throw new Error(`${exerciseId} needs a valid video language.`);
}

const education = (
  setup: string,
  steps: string[],
  commonMistakes: string[],
  videoId: string,
  title: string,
  channel: string,
  language: 'nl' | 'en' = 'en'
): ExerciseEducation => ({ setup, steps, commonMistakes, video: { videoId, title, channel, language } });

export const EXERCISE_EDUCATION: Record<string, ExerciseEducation> = {
  'machine-chest-press': education(
    "Stel de zitting zo in dat de handgrepen midden op je borst staan. Zet je voeten stevig neer en houd je schouderbladen rustig tegen de leuning.",
    ["Pak de handgrepen vast met je polsen recht en adem rustig in.", "Duw de handgrepen naar voren zonder je schouders op te trekken.", "Pauzeer kort wanneer je armen bijna gestrekt zijn.", "Laat het gewicht langzaam terugkomen tot je borst prettig op spanning staat."],
    ["De zitting te hoog of te laag zetten, waardoor je schouders het werk overnemen.", "Het gewicht laten terugvallen en de schouderbladen van de leuning laten komen."],
    "YXjhMV7uz4c", "How to PROPERLY Use The Chest Press Machine At The Gym (Exercise Demonstration)", "Gerardi Performance"
  ),
  'dumbbell-floor-press': education(
    "Ga op je rug liggen met je knieen gebogen en je voeten op de vloer. Houd de dumbbells boven je borst met je handpalmen naar voren en je bovenarmen vrij van de vloer.",
    ["Span je buik licht aan en trek je schouderbladen naar beneden.", "Laat beide dumbbells gecontroleerd zakken tot je bovenarmen zacht de vloer raken.", "Duw de dumbbells omhoog en houd ze boven je borst, niet boven je gezicht.", "Herhaal met een korte stop op de vloer zonder te stuiteren."],
    ["De ellebogen hard in de vloer laten vallen of de dumbbells tegen elkaar slaan.", "De onderrug overdreven hol maken om zwaarder te kunnen drukken."],
    "Bx4QPVH-J1g", "Dumbbell Floor Press: The RIGHT Way (Most People Do This Wrong)", "Colossus Fitness"
  ),
  'barbell-bench-press': education(
    "Ga met je ogen ongeveer onder de stang liggen. Zet je voeten vast, trek je schouderbladen samen en kies een greep waarbij je onderarmen onderaan bijna verticaal zijn.",
    ["Span je billen en buik aan voordat je de stang uit het rek haalt.", "Laat de stang rustig zakken naar het onderste of middelste deel van je borst.", "Raak je borst licht aan zonder de spanning te verliezen.", "Duw de stang terug omhoog terwijl je polsen boven je ellebogen blijven."],
    ["De stang laten stuiteren of de billen van de bank tillen.", "De ellebogen volledig zijwaarts laten uitklappen met gebogen polsen."],
    "4Y2ZdHCOXok", "How to PROPERLY Bench Press for Growth (5 Easy Steps)", "Jeremy Ethier"
  ),
  'push-up': education(
    "Plaats je handen net buiten je schouders en zet je voeten op heupbreedte. Maak van je hoofd tot je hielen een rechte lijn en draai je handen licht naar buiten als dat prettiger voelt.",
    ["Span je buik en billen aan voordat je zakt.", "Buig je ellebogen ongeveer 30 tot 45 graden van je romp.", "Zak tot je borst bijna de vloer raakt zonder je hoofd vooruit te steken.", "Duw de vloer weg en houd je romp als een plank."],
    ["De heupen laten doorzakken of juist als eerste omhoog sturen.", "De schouders naar de oren trekken en alleen halve herhalingen maken."],
    "I9fsqKE5XHo", "Do Push-Ups with Proper Form!", "Upright Health"
  ),
  'band-chest-press': education(
    "Veranker de band op borsthoogte achter je. Stap naar voren tot er al spanning op staat, zet een stabiele houding neer en houd de handgrepen naast je borst.",
    ["Zet een voet iets voor de andere en span je buik aan.", "Duw de handgrepen recht vooruit tot je armen bijna gestrekt zijn.", "Breng je handen gecontroleerd terug terwijl je borst open blijft.", "Houd de band de hele set onder spanning en adem uit tijdens het duwen."],
    ["Te dicht op het anker staan waardoor de band slap wordt.", "De schouders optrekken of de romp naar voren laten vallen."],
    "T0UJ0W-_yIE", "Resistance Band Standing Chest Press", "LGN Lyfestile"
  ),
  'incline-dumbbell-press': education(
    "Zet een bank op een lage helling van ongeveer 20 tot 35 graden. Plaats je voeten stevig op de vloer en start met de dumbbells boven je bovenborst.",
    ["Trek je schouderbladen licht naar achteren en beneden.", "Laat de dumbbells naast je borst zakken met je onderarmen verticaal.", "Stop wanneer je bovenarmen comfortabel onder je romp komen.", "Duw omhoog zonder de dumbbells bovenaan hard tegen elkaar te slaan."],
    ["Een te hoge bankhelling kiezen waardoor de schouders domineren.", "De ellebogen extreem wijd zetten of de voeten los laten komen."],
    "ou6s32mJgjU", "Incline DB Bench - BEST Guide Ever Made", "Davis Diley"
  ),
  'incline-machine-press': education(
    "Stel de zitting in zodat de handgrepen ter hoogte van je bovenborst staan. Houd je rug en achterhoofd tegen de leuning en plaats je voeten stevig.",
    ["Pak de handgrepen vast met je polsen recht.", "Duw de grepen omhoog en naar voren volgens het vaste pad.", "Strek je armen bijna volledig zonder je schouders naar voren te laten rollen.", "Laat het gewicht langzaam zakken tot de borstspieren spanning houden."],
    ["De startpositie te diep forceren terwijl de schouders naar voren kantelen.", "Het gewicht laten rusten tussen herhalingen of de rug losmaken."],
    "VesHgJR14E8", "INCLINE CHEST PRESS | Exercise Form Guide", "Max Euceda"
  ),
  'feet-elevated-push-up': education(
    "Zet je voeten op een stabiele verhoging en plaats je handen op de vloer iets buiten je schouders. Houd je heupen op dezelfde lijn als je borst en hielen.",
    ["Duw de vloer weg en maak je romp stevig voordat je zakt.", "Buig je ellebogen schuin langs je romp.", "Laat je borst gecontroleerd richting vloer zakken.", "Duw terug omhoog zonder je hoofd of kin vooruit te steken."],
    ["De heupen laten doorzakken of de verhoging zo hoog maken dat de onderrug hol trekt.", "De beweging verkorten zodra de schouders vermoeid raken."],
    "jmp6RQNviI0", "Elevated Feet Push-up", "Daily Workout Builder"
  ),
  'machine-shoulder-press': education(
    "Stel de zitting zo in dat de handgrepen net onder schouderhoogte starten. Plaats je voeten stevig en houd je onderrug en schouderbladen tegen de rugleuning.",
    ["Pak de grepen vast met je polsen recht en je ellebogen onder je handen.", "Duw omhoog zonder je schouders naar je oren te trekken.", "Stop vlak voor je ellebogen volledig op slot gaan.", "Laat het gewicht gecontroleerd zakken tot de startpositie."],
    ["De rugleuning verlaten om extra range of gewicht te maken.", "De ellebogen ver naar achteren laten vallen in de onderste positie."],
    "3R14MnZbcpw", "How to PROPERLY Shoulder Machine Press (LEARN FAST)", "Colossus Fitness"
  ),
  'dumbbell-shoulder-press': education(
    "Ga zitten met de rugleuning rechtop of sta stabiel met je voeten onder je heupen. Start met de dumbbells op schouderhoogte en je polsen boven je ellebogen.",
    ["Span buik en billen aan zodat je ribben laag blijven.", "Duw de dumbbells omhoog in een lichte boog.", "Breng ze boven je hoofd zonder ze hard tegen elkaar te drukken.", "Laat ze rustig zakken tot je ellebogen net onder je handen komen."],
    ["De onderrug hol trekken om het laatste stuk te halen.", "De polsen laten knikken of de ellebogen te ver naar buiten sturen."],
    "B-aVuyhvLHU", "How to Do a Dumbbell Shoulder Press", "LIVESTRONG"
  ),
  'barbell-overhead-press': education(
    "Sta met je voeten ongeveer heupbreedte en de stang op je sleutelbeen. Pak de stang iets buiten je schouders en houd je polsen gestapeld boven je onderarmen.",
    ["Knijp je billen aan en span je buik voordat je duwt.", "Beweeg je hoofd kort naar achteren zodat de stang recht omhoog kan.", "Duw de stang boven het midden van je voet en breng je hoofd eronder.", "Laat de stang gecontroleerd terugzakken naar je sleutelbeen."],
    ["De ribben uitduwen en de beweging veranderen in een achteroverleunende press.", "De stang voor je lichaam laten slingeren of de polsen knikken."],
    "KP1sYz2VICk", "How to do the BARBELL OVERHEAD 'MILITARY' PRESS! | 2 Minute Tutorial", "Max Euceda"
  ),
  'pike-push-up': education(
    "Begin op handen en voeten en loop je voeten naar achteren tot je heupen hoog staan. Plaats je handen iets breder dan je schouders en houd je vingers gespreid.",
    ["Duw je handen stevig in de vloer en maak je nek lang.", "Buig je ellebogen en breng je kruin schuin voor je handen.", "Zak alleen zo diep als je schouders stabiel blijven.", "Duw de vloer weg en strek je armen gecontroleerd."],
    ["De rug volledig rond maken en vanuit de benen stuiteren.", "De handen te ver naar voren zetten waardoor de schouders wegvallen."],
    "eG20L9cl81w", "Pike Push Ups Made Easy (3 Steps)", "Stozfit"
  ),
  'band-overhead-press': education(
    "Ga met beide voeten op het midden van de band staan. Houd de handgrepen of uiteinden op schouderhoogte en kies genoeg bandspanning om al controle te voelen.",
    ["Sta lang met je ribben boven je bekken en je buik licht aangespannen.", "Duw de band recht omhoog zonder je schouders op te trekken.", "Strek je armen boven je hoofd terwijl je polsen neutraal blijven.", "Laat de band langzaam zakken tot schouderhoogte."],
    ["De onderrug hol trekken zodra de band zwaar wordt.", "De band te breed of te dicht bij je lichaam vasthouden."],
    "1-VfJqjYquQ", "Resistance Band Overhead Press", "LGN Lyfestile"
  ),
  'chest-supported-row': education(
    "Stel de bank of machine zo in dat je borst stevig wordt ondersteund en je armen volledig kunnen hangen. Kies een neutrale of licht geproneerde greep.",
    ["Laat je schouderbladen onderin rustig naar voren bewegen zonder spanning te verliezen.", "Trek je ellebogen naar je heupen en houd je borst op de steun.", "Pauzeer kort wanneer je handen naast je romp zijn.", "Laat het gewicht gecontroleerd zakken tot je armen lang zijn."],
    ["De borst van de steun tillen om momentum te gebruiken.", "De schouders optrekken en alleen met de handen trekken."],
    "vmX58YYK3-8", "Perfecte Dumbbell Chest Supported Rows (KONING van de rugoefeningen)", "Seriously Strong Training", "nl"
  ),
  'one-arm-dumbbell-row': education(
    "Zet een hand en dezelfde knie op een bank, of steun met beide voeten stevig op de vloer. Houd je rug lang en de dumbbell recht onder je schouder.",
    ["Maak je romp stabiel en laat je schouderblad onderin lang worden.", "Trek de dumbbell naar je broekzak met je elleboog dicht langs je romp.", "Pauzeer bovenaan zonder je borst open te draaien.", "Laat de dumbbell langzaam zakken en wissel daarna van kant."],
    ["De romp meedraaien of de dumbbell naar de oksel trekken.", "De schouder naar het oor laten komen tijdens de trek."],
    "qN54-QNO1eQ", "How to Single Arm Dumbbell Row", "TylerPath"
  ),
  'barbell-row': education(
    "Sta met je voeten onder de stang en pak hem iets buiten je benen. Scharnier vanuit je heupen tot je romp stabiel voorover helt en houd je rug neutraal.",
    ["Span buik en billen aan voordat je de stang van de vloer of uit het rek haalt.", "Trek de stang naar je onderste ribben met je ellebogen richting heupen.", "Houd je romphoek stil en pauzeer kort bovenaan.", "Laat de stang zakken zonder hem van je lichaam weg te laten drijven."],
    ["De rug rond maken of met de benen opveren.", "De schouders optrekken en de stang hoog naar de borst trekken."],
    "T3N-TO4reLQ", "How to do Barbell Rows PROPERLY for a Big Back (AVOID MISTAKES!)", "ATHLEAN-X"
  ),
  'seated-cable-row': education(
    "Ga rechtop zitten met je voeten tegen de steunen en een lichte buiging in je knieen. Pak de greep vast terwijl je rug lang en je schouders laag blijven.",
    ["Strek je armen zonder je onderrug rond te maken.", "Trek de greep naar je navel of onderste ribben.", "Pauzeer wanneer je schouderbladen naar elkaar toe bewegen.", "Laat de kabel gecontroleerd teruggaan zonder achterover te vallen."],
    ["Achterover zwaaien om de kabel naar je toe te krijgen.", "De schouders naar voren laten schieten of de ellebogen ver uitklappen."],
    "vwHG9Jfu4sw", "How to do the SEATED CABLE ROW! | 2 Minute Tutorial", "Max Euceda"
  ),
  'band-row': education(
    "Veranker de band op borsthoogte of rond een stevig punt voor je. Sta of zit zo dat er spanning op de band staat en houd je borst rustig.",
    ["Pak de band vast met je armen lang en je polsen recht.", "Trek je handen naar je ribben terwijl je ellebogen naar achteren gaan.", "Pauzeer kort met je schouderbladen laag en naast je romp.", "Strek je armen langzaam terug zonder de spanning te verliezen."],
    ["De band zonder anker gebruiken of te dicht bij het anker staan.", "De romp heen en weer bewegen in plaats van de rug te laten werken."],
    "LSkyinhmA8k", "How To Do A Resistance Band Row", "Get Healthy U - with Chris Freytag"
  ),
  'prone-w-raise': education(
    "Ga op je buik liggen met je voorhoofd op een handdoek. Buig je ellebogen in een W-vorm naast je romp en houd je duimen richting het plafond.",
    ["Trek je buik licht aan en houd je nek lang.", "Til je handen en onderarmen een klein stukje van de vloer.", "Beweeg je ellebogen rustig richting je ribben zonder je schouders op te trekken.", "Laat je armen langzaam zakken en houd de beweging klein en strak."],
    ["Te hoog tillen waardoor de onderrug of nek het overneemt.", "Snel zwaaien in plaats van de schouderbladen gecontroleerd te bewegen."],
    "QdGTI4Lshg4", "Prone Y T W", "The Active Life"
  ),
  'lat-pulldown': education(
    "Stel het kussen zo in dat je bovenbenen stevig vastzitten. Pak de stang iets buiten schouderbreedte en ga lang zitten met je borst rustig omhoog.",
    ["Laat je schouders eerst laag worden voordat je trekt.", "Trek je ellebogen naar je zij en breng de stang richting bovenborst.", "Pauzeer kort zonder achterover te hangen.", "Laat de stang gecontroleerd omhooggaan tot je armen lang zijn."],
    ["De stang achter de nek trekken of met een zwaai naar beneden halen.", "De romp ver naar achteren gooien en de schouders optrekken."],
    "SALxEARiMkw", "How to do Lat Pulldowns (AVOID MISTAKES!)", "ATHLEAN-X"
  ),
  'cable-pulldown': education(
    "Zet een kabel hoog en kies een rechte of neutrale greep. Ga stabiel zitten of staan, houd je borst rustig en begin met lange armen.",
    ["Duw je schouders weg van je oren en maak je oksels actief.", "Trek de handgreep naar je bovenborst door je ellebogen omlaag te bewegen.", "Houd de eindpositie kort vast zonder je polsen te buigen.", "Laat de kabel langzaam teruggaan tot je armen volledig lang zijn."],
    ["Te veel gewicht gebruiken en de kabel met momentum naar beneden trekken.", "De ellebogen achter je romp trekken in plaats van omlaag."],
    "hnSqbBk15tw", "Stop Messing Up Your Lat Pulldowns", "Jeff Nippard"
  ),
  'dumbbell-pullover': education(
    "Ga op een bank liggen met een dumbbell boven je borst. Houd beide handen aan een uiteinde van het gewicht en zet je voeten stevig op de vloer.",
    ["Span je buik aan zodat je ribben niet omhoog uitwaaieren.", "Laat de dumbbell in een rustige boog achter je hoofd zakken.", "Stop zodra je schouders prettig op spanning staan en je rug neutraal blijft.", "Breng de dumbbell terug boven je borst door je oksels aan te spannen."],
    ["De onderrug laten overstrekken om dieper te zakken.", "Een pijnlijke schouderhoek forceren of de ellebogen volledig stijf houden."],
    "5lbvUCXfDU0", "Dumbbell pullovers You are doing them wrong", "mountaindog1"
  ),
  'pull-up': education(
    "Hang aan een stabiele stang met een greep iets breder dan je schouders. Start met lange armen, een rustige romp en je voeten vrij van de vloer.",
    ["Maak eerst je schouders laag en actief zonder je ellebogen te buigen.", "Trek je borst richting de stang door je ellebogen naar beneden te sturen.", "Pauzeer bovenaan wanneer je kin boven de stang komt of je vorm stopt.", "Laat jezelf gecontroleerd zakken tot je armen lang zijn."],
    ["Zwaaien, kicken of de kin naar voren steken om de stang te halen.", "De onderste positie laten vallen zonder schoudercontrole."],
    "eGo4IYlbE5g", "The Perfect Pull Up - Do it right!", "Calisthenicmovement"
  ),
  'band-pulldown': education(
    "Veranker de band stevig boven je hoofd. Kniel of sta rechtop met de band voor je, handen hoog en armen lang, zodat de band al spanning heeft.",
    ["Houd je ribben laag en maak je nek lang.", "Trek je ellebogen naar beneden richting je zij.", "Pauzeer wanneer je handen naast je schouders komen.", "Laat de band langzaam terugveren tot je armen lang zijn."],
    ["De band aan een onbetrouwbaar punt vastmaken.", "Achterover leunen of de handen naar je borst trekken zonder de ellebogen te sturen."],
    "_97pmOC2tzE", "How To Do Lat Pull Down With Resistance Band | Back Workout", "Fitness My Life"
  ),
  'hack-squat': education(
    "Plaats je schouders en rug volledig tegen de steunen en zet je voeten midden op het platform. Ontgrendel de sled pas nadat je knieen en tenen dezelfde richting op wijzen.",
    ["Adem in en span je buik voordat je zakt.", "Laat je knieen gecontroleerd buigen en houd je hele voet op het platform.", "Zak zo diep als je bekken en onderrug stabiel blijven.", "Duw het platform weg en strek je knieen zonder ze hard te blokkeren."],
    ["De hielen laten loskomen of de knieen naar binnen laten vallen.", "Te diep zakken terwijl het bekken onderin wegkrult."],
    "rYgNArpwE7E", "Hack Squat", "Renaissance Periodization"
  ),
  'goblet-squat': education(
    "Sta met je voeten ongeveer schouderbreedte en houd een dumbbell rechtop tegen je borst. Draai je tenen licht naar buiten en verdeel je gewicht over de hele voet.",
    ["Adem in en zet je buik vast voordat je zakt.", "Duw je knieen in de richting van je tenen terwijl je heupen tussen je voeten zakken.", "Pauzeer kort op de diepste stabiele positie.", "Duw de vloer weg en strek je heupen en knieen tegelijk."],
    ["De dumbbell van je borst laten zakken waardoor je romp instort.", "De knieen naar binnen laten vallen of op de voorvoet veren."],
    "gCESNsDsbqk", "Goblet Squats: Proper Form & Technique", "BuiltLean"
  ),
  'back-squat': education(
    "Plaats de stang stabiel op je bovenrug en stap uit het rek met je voeten onder je. Kies een stand waarin je knieen de richting van je tenen kunnen volgen.",
    ["Adem diep in en span je romp rondom de stang aan.", "Zak gecontroleerd door je heupen en knieen tegelijk te buigen.", "Houd je hele voet zwaar en je rug neutraal onderin.", "Duw de vloer weg en kom omhoog zonder je knieen naar binnen te laten draaien."],
    ["De rug rond laten worden of de stang van je rug laten rollen.", "De knieen naar binnen laten knikken of uit de bodem stuiteren."],
    "dW3zj79xfrc", "The PERFECT Barbell Squat", "Andrew Kwong (DeltaBolic)"
  ),
  'bodyweight-squat': education(
    "Sta stevig met je voeten op ongeveer schouderbreedte. Houd je armen voor je als tegengewicht en maak ruimte voor je knieen door je tenen licht naar buiten te draaien.",
    ["Span je buik licht aan en begin met je heupen en knieen tegelijk.", "Zak rustig terwijl je knieen de tenen volgen.", "Houd je borst open en je hele voet contact met de vloer.", "Duw de vloer weg en eindig lang zonder je onderrug te overstrekken."],
    ["De knieen naar binnen laten vallen of de hielen optillen.", "Te snel veren en de onderkant van de squat laten instorten."],
    "P-yaD24bUE8", "Bodyweight Squat Tutorial - Proper Form and Technique", "Runna"
  ),
  'band-squat': education(
    "Ga op het midden van de band staan en houd de uiteinden op schouderhoogte. Zet je voeten stabiel en kies genoeg spanning om de band onderin niet slap te laten worden.",
    ["Adem in en houd je romp stevig.", "Zak tussen je heupen terwijl je knieen de richting van je tenen volgen.", "Blijf midden op je voet en houd de band gecontroleerd.", "Duw omhoog en strek heupen en knieen tegelijk."],
    ["De band tegen je nek laten schuren of hem zonder spanning vasthouden.", "De knieen naar binnen laten trekken zodra je omhoog komt."],
    "duP-UZsfOaQ", "How To Do Resistance Band Squat", "Get Healthy U - with Chris Freytag"
  ),
  'romanian-deadlift': education(
    "Sta met de stang tegen je bovenbenen en je voeten onder je heupen. Houd je knieen zacht gebogen, je armen lang en de stang dicht bij je lichaam.",
    ["Adem in en span je buik voordat je je heupen naar achteren duwt.", "Laat de stang langs je benen zakken terwijl je rug neutraal blijft.", "Stop zodra je hamstrings maximaal op spanning staan zonder je rug te verliezen.", "Duw je heupen naar voren en eindig rechtop met je billen aangespannen."],
    ["De stang van je benen laten wegdrijven of vanuit de onderrug buigen.", "De knieen te veel strekken waardoor het een gewone deadlift wordt."],
    "7j-2w4-P14I", "Romanian Deadlift | Nuffield Health", "Nuffield Health"
  ),
  'dumbbell-rdl': education(
    "Sta met dumbbells voor je bovenbenen en je voeten onder je heupen. Houd je armen lang en laat de gewichten dicht langs je benen bewegen.",
    ["Maak je buik stevig en duw je heupen rustig naar achteren.", "Laat de dumbbells zakken tot je hamstrings duidelijk spanning geven.", "Houd je schouders laag en je rug in dezelfde neutrale lijn.", "Duw de vloer weg en breng je heupen onder je terug naar stand."],
    ["De dumbbells voor het lichaam laten zwaaien.", "Dieper zakken door de rug rond te maken in plaats van de heupen verder te bewegen."],
    "hQgFixeXdZo", "Dumbbell Romanian (RDL) Deadlift | TECHNIQUE for Beginners", "Mike | J2FIT Strength & Conditioning"
  ),
  'machine-back-extension': education(
    "Stel de machine zo in dat je heupen op het draaipunt zitten en je voeten stevig verankerd zijn. Houd je romp lang en kies een bereik waarin je rug rustig blijft.",
    ["Span je buik licht aan voordat je voorover beweegt.", "Buig vanuit je heupen terwijl je rug neutraal blijft.", "Duw je heupen tegen het kussen en kom terug tot je romp in een rechte lijn staat.", "Pauzeer kort zonder achterover te hangen en herhaal beheerst."],
    ["Verder strekken dan een rechte lijn en de onderrug overmatig hol trekken.", "De beweging versnellen of met de schouders trekken in plaats van met de heupen."],
    "bADOg7F5dKI", "True Low Back Extension Machine", "The Players Club & Spa"
  ),
  'band-good-morning': education(
    "Sta op het midden van de band en leg de band achter je nek of over je schouders, nooit op je keel. Zet je voeten onder je heupen en houd de spanning vast.",
    ["Span je buik aan en maak je knieen zacht.", "Duw je heupen naar achteren terwijl je romp voorover helt.", "Stop wanneer je hamstrings spanning geven en je rug neutraal blijft.", "Duw je heupen naar voren en kom rustig terug naar stand."],
    ["De band op de nek leggen of met een ronde rug zakken.", "De knieen diep buigen waardoor de heupscharnier verdwijnt."],
    "rQmkPvfcaSU", "Resistance Band Goodmorning", "Nick Forgione"
  ),
  'single-leg-hip-hinge': education(
    "Sta op een been met een zachte knie en gebruik zo nodig een lichte steun. Houd je heupen recht naar voren en laat je vrije been lang naar achteren wijzen.",
    ["Span je voetboog en buik aan voordat je beweegt.", "Duw je staande heup naar achteren en laat je romp voorover kantelen.", "Houd je heupen en schouders recht terwijl je vrije been langer wordt.", "Duw via je hele voet terug naar stand en wissel daarna van kant."],
    ["Het bekken open draaien of de knie op slot zetten.", "Te ver naar beneden reiken waardoor de rug rond wordt."],
    "tX_0Pas9iNI", "Single Leg Hip Hinge Bodyweight", "Muscle & Motion"
  ),
  'reverse-lunge': education(
    "Sta rechtop met je voeten onder je heupen en houd je blik vooruit. Begin zonder gewicht of met dumbbells langs je lichaam.",
    ["Stap rustig recht naar achteren en houd je voorste voet volledig op de vloer.", "Zak recht omlaag tot beide knieen gecontroleerd buigen.", "Duw via de hele voorste voet terug naar stand.", "Wissel van been of maak eerst alle herhalingen aan een kant."],
    ["Te ver zijwaarts stappen waardoor de voorste knie instabiel wordt.", "De voorste hiel optillen of naar voren vallen bij het opstaan."],
    "xrPteyQLGAo", "How To Reverse Lunge", "PureGym"
  ),
  'dumbbell-split-squat': education(
    "Neem een stabiele split-stance met je voorste voet plat en je achterste voet op de bal van je voet. Houd dumbbells naast je lichaam en je romp lang.",
    ["Zak recht omlaag terwijl je voorste knie de richting van je tenen volgt.", "Houd het grootste deel van de druk op je voorste voet.", "Pauzeer kort onderin zonder je achterste knie hard te laten vallen.", "Duw de vloer weg en kom terug zonder je voorste hiel te verliezen."],
    ["Te smal staan waardoor je wiebelt of je knie naar binnen zakt.", "Voorover duiken en de achterste voet als belangrijkste krachtbron gebruiken."],
    "m8mQ_92_Ylg", "Fix your form: split squats", "Jack Hanrahan Fitness"
  ),
  'barbell-split-squat': education(
    "Plaats de stang stabiel op je bovenrug en zet je voeten in een lange, comfortabele split-stance. Houd je heupen recht vooruit en je voorste voet volledig plat.",
    ["Breng je gewicht gecontroleerd boven je voorste been.", "Zak recht omlaag terwijl beide knieen buigen.", "Houd je romp stevig en pauzeer op de diepste stabiele positie.", "Duw via de voorste voet omhoog en wissel pas daarna van been."],
    ["Een te korte stand kiezen waardoor de voorste hiel loskomt.", "Met de stang uit balans raken door te draaien of te stuiteren."],
    "8nW4ZwKi4gk", "How To Perform The Barbell Split Squat", "Champion Physical Therapy and Performance"
  ),
  'machine-single-leg-press': education(
    "Stel de stoel zo in dat je knie onderin kan buigen zonder dat je bekken loskomt. Plaats een voet midden op het platform en houd de andere voet veilig weg.",
    ["Ontgrendel het platform met je voet volledig ondersteund.", "Laat je knie naar je borst bewegen terwijl je bekken stil blijft.", "Duw het platform weg via je hele voet.", "Strek je knie bijna volledig zonder hard te vergrendelen en herhaal aan de andere kant."],
    ["Te diep gaan waardoor de onderrug of het bekken kantelt.", "De knie naar binnen laten vallen of met de vrije heup meedraaien."],
    "BsOg0iBKs6A", "Exercise Tutorial - Single leg press (glute bias)", "josh cowan"
  ),
  'band-split-squat': education(
    "Ga op het midden van de band staan en houd de uiteinden op schouderhoogte. Zet een voet voor en een voet achter je met genoeg ruimte om recht omlaag te zakken.",
    ["Span je buik aan en houd je voorste voet volledig plat.", "Zak recht omlaag terwijl je voorste knie de richting van je tenen volgt.", "Pauzeer kort onderin en houd de band onder controle.", "Duw via de voorste voet terug omhoog en wissel daarna van kant."],
    ["De band achter de nek leggen of zonder spanning vasthouden.", "Zijwaarts stappen, de knie naar binnen laten vallen of opveren."],
    "EAiBBcN_XKI", "Resistance Band Split Squat", "Nick Forgione"
  ),
  'lying-leg-curl': education(
    "Ga met je knieen in lijn met het draaipunt op de machine liggen. Plaats de rol net boven je hielen en houd je heupen zwaar op het kussen.",
    ["Span je buik aan en pak de handgrepen vast.", "Krul je hielen rustig richting je billen zonder je heupen te liften.", "Pauzeer kort wanneer je hamstrings volledig aanspannen.", "Laat de rol langzaam teruggaan tot je knieen bijna gestrekt zijn."],
    ["De heupen optillen om extra range te maken.", "Het gewicht laten terugvallen of de enkel hard naar binnen draaien."],
    "_lgE0gPvbik", "Leg Curl Form Tips (DO THIS!)", "Andrew Kwong (DeltaBolic)"
  ),
  'cable-leg-curl': education(
    "Bevestig een enkelband aan een lage kabel en steun je vast aan het rek. Houd je bovenbeen in lijn met je romp en laat de kabel al licht trekken.",
    ["Buig je knie terwijl je bovenbeen stil blijft.", "Breng je hiel richting je bil zonder je heup te draaien.", "Pauzeer kort in de samengetrokken positie.", "Laat je been gecontroleerd terugstrekken tegen de kabelspanning."],
    ["Het bovenbeen naar achteren zwaaien in plaats van de knie te buigen.", "Te veel gewicht gebruiken en de kabel laten rukken."],
    "Y1dQUd6OKHk", "Low Cable Single Leg Hamstring Curl: How To", "Hammer Fitness"
  ),
  'sliding-leg-curl': education(
    "Ga op je rug liggen met je hielen op sliders of handdoeken. Zet je armen naast je en maak een rechte lijn van schouders tot knieen.",
    ["Duw je heupen omhoog en span je billen aan.", "Schuif je hielen langzaam van je af terwijl je heupen hoog blijven.", "Trek je hielen terug onder je knieen zonder je rug te overstrekken.", "Laat je heupen pas zakken nadat de herhaling klaar is."],
    ["De heupen laten zakken zodra de benen langer worden.", "De sliders te snel wegschieten of met de onderrug trekken."],
    "kkkTfzi2gj4", "How To: Slider Leg Curl", "Kia Khadem"
  ),
  'band-leg-curl': education(
    "Veranker de band laag achter je en bevestig hem aan een enkel of houd hem rond je voet. Steun met je handen en zet je bovenbeen stil.",
    ["Begin met je knie bijna gestrekt en de band onder spanning.", "Krul je hiel rustig richting je bil.", "Pauzeer kort zonder je heup naar voren te draaien.", "Laat je voet langzaam teruggaan tegen de band in."],
    ["De band op een glad of onveilig anker plaatsen.", "Het bovenbeen optillen en de beweging uit de heup halen."],
    "UAod62tMmhk", "How to do a Leg Curl: Health e-University", "Health e-University"
  ),
  'machine-hip-thrust': education(
    "Plaats je bovenrug en bekken tegen de daarvoor bestemde steunen en zet je voeten ongeveer heupbreedte. Stel de machine zo in dat je knieen bovenaan ongeveer 90 graden zijn.",
    ["Kantel je bekken licht achterover en houd je kin rustig.", "Duw via je hielen tot je heupen volledig gestrekt zijn.", "Pauzeer bovenaan terwijl je ribben laag blijven.", "Laat je heupen gecontroleerd zakken zonder spanning te verliezen."],
    ["De onderrug overstrekken in plaats van de billen aanspannen.", "De voeten te ver weg plaatsen waardoor hamstrings het werk overnemen."],
    "_i6qpcI1Nw4", "Hip Thrust Tips", "ArielYu_Fit"
  ),
  'barbell-hip-thrust': education(
    "Zet je bovenrug tegen een stevige bank en rol de stang met bescherming over je heupen. Plaats je voeten zo dat je schenen bovenaan bijna verticaal staan.",
    ["Zet je kin licht naar je borst en houd je ribben laag.", "Duw via je hielen en strek je heupen omhoog.", "Knijp je billen bovenaan samen zonder de onderrug te overtrekken.", "Laat de stang langzaam zakken tot je heupen onder controle zijn."],
    ["De voeten te ver van het lichaam zetten of op de tenen duwen.", "De nek overstrekken en de beweging uit de onderrug maken."],
    "pUdIL5x0fWg", "Hip Thrust | Nuffield Health", "Nuffield Health"
  ),
  'dumbbell-glute-bridge': education(
    "Ga op je rug liggen met je knieen gebogen en je voeten plat. Leg een dumbbell horizontaal op je heupen en houd hem met beide handen stabiel.",
    ["Duw je onderrug niet hard in de vloer maar kantel je bekken licht.", "Duw via je hielen en til je heupen op.", "Pauzeer bovenaan met je ribben laag en je billen aangespannen.", "Laat je heupen langzaam zakken tot net boven de vloer."],
    ["De dumbbell los op je heupen laten liggen.", "Te hoog tillen waardoor de onderrug het eindpunt maakt."],
    "E6VLOEz7tWE", "Dumbbell Glute Bridge Tutorial (for Beginners)", "Tim Bullici"
  ),
  'single-leg-glute-bridge': education(
    "Ga op je rug liggen met een knie gebogen en de andere heup en knie opgetild. Zet de voet van je werkbeen plat en houd je bekken recht.",
    ["Span je buik licht aan en houd je ribben laag.", "Duw via je werkvoet je heupen omhoog.", "Pauzeer bovenaan zonder je bekken naar de vrije kant te laten draaien.", "Laat langzaam zakken en wissel na alle herhalingen van kant."],
    ["De knie naar binnen laten vallen of het bekken open draaien.", "De beweging zo groot maken dat de onderrug de lift afmaakt."],
    "yFNjwkUNIao", "How To Single Leg Glute Bridge Properly", "Michael Hermann | Performance Revolution"
  ),
  'band-hip-thrust': education(
    "Ga met je bovenrug tegen een bank of op de vloer liggen en plaats de band laag over je heupen. Zet je voeten stabiel en houd de band al licht gespannen.",
    ["Kantel je bekken licht achterover voordat je omhoog duwt.", "Duw via je hielen je heupen omhoog.", "Pauzeer bovenaan met je ribben laag en je knieen naar buiten tegen de band.", "Laat je heupen langzaam zakken zonder de spanning te verliezen."],
    ["De band te hoog op de buik leggen of zonder spanning laten.", "De onderrug overstrekken en de knieen naar binnen laten zakken."],
    "6oYSPzZlwL0", "How to Properly Perform Resistance Band Glute Bridge With Good Form", "Gerardi Performance"
  ),
  'standing-calf-machine': education(
    "Plaats je schouders onder de kussens en de bal van je voeten op het platform. Laat je hielen vrij bewegen en houd je knieen zacht maar stabiel.",
    ["Zak langzaam tot je kuiten onderaan op rek staan.", "Pauzeer kort in de diepe positie zonder te veren.", "Duw via de bal van je voet zo hoog mogelijk omhoog.", "Pauzeer bovenaan en laat daarna volledig gecontroleerd zakken."],
    ["Korte stuiterende herhalingen maken of de hielen nooit laten zakken.", "De knieen buigen en strekken om momentum te gebruiken."],
    "30ygzcJw4v4", "How To Use: Standing Calf Raise Machine", "Anytime Fitness Ashfield"
  ),
  'dumbbell-calf-raise': education(
    "Sta met een dumbbell in een hand en gebruik de andere hand licht voor balans. Plaats de bal van je voet op een verhoging als je meer bewegingsruimte hebt.",
    ["Laat je hiel rustig zakken tot je kuit op rek staat.", "Houd je knie stabiel en duw via je grote teen omhoog.", "Pauzeer bovenaan wanneer je enkel volledig gestrekt is.", "Laat langzaam terugzakken en wissel eventueel van kant."],
    ["Te ver naar voren rollen of de enkel zijwaarts laten wegzakken.", "Snel veren waardoor de kuit nauwelijks spanning krijgt."],
    "SRUtMJ0tE2A", "Dumbbell Calf Raises Tutorial", "IronmasterPro"
  ),
  'barbell-calf-raise': education(
    "Plaats de stang stabiel op je bovenrug en zet de bal van je voeten op een stevige verhoging. Houd een rek of muur dichtbij voor extra veiligheid.",
    ["Zak gecontroleerd met je hielen tot je kuiten spanning voelen.", "Houd je lichaam stil en duw via de bal van je voet omhoog.", "Pauzeer kort in de hoogste positie.", "Laat volledig zakken zonder te stuiteren en herhaal rustig."],
    ["De stang laten rollen of zonder stabiele voetsteun werken.", "Vanuit de knieen veren in plaats van de enkels te bewegen."],
    "3UWi44yN-wM", "How To: Standing Barbell Calf Raise", "ScottHermanFitness"
  ),
  'single-leg-calf-raise': education(
    "Sta op een been met de bal van je voet op de vloer of een lage verhoging. Houd licht steun vast voor balans en laat je andere been ontspannen hangen.",
    ["Laat je hiel langzaam zakken tot je kuit op rek staat.", "Duw via de bal van je voet zo hoog mogelijk omhoog.", "Pauzeer bovenaan zonder je knie te vergrendelen.", "Laat gecontroleerd zakken en wissel daarna van been."],
    ["De enkel naar buiten rollen of de knie meebuigen om te helpen.", "De balans verliezen door te weinig steun te gebruiken."],
    "ElcvJ0kjt6c", "Single Leg Calf Raise Tutorial - Proper Form and Technique", "Runna"
  ),
  'band-calf-press': education(
    "Ga zitten met je benen lang en lus de band stevig om de bal van je voet. Houd de uiteinden vast zodat de band niet naar je enkel schuift.",
    ["Trek je tenen rustig naar je toe tegen de bandspanning in.", "Duw daarna je enkel volledig weg alsof je een pedaal indrukt.", "Pauzeer kort in de gestrekte positie.", "Laat de band langzaam terugkomen en houd de beweging vloeiend."],
    ["De band los rond de tenen leggen of een anker gebruiken dat kan verschuiven.", "Alleen de tenen bewegen in plaats van de enkel volledig te strekken."],
    "utU05RX7fEw", "Calf strengthening with a resistance band", "Triumph Physio"
  ),
  'cable-crunch': education(
    "Kniel voor een hoge kabel met een touw in beide handen. Houd het touw naast je hoofd, je heupen boven je knieen en je onderrug rustig.",
    ["Adem uit en trek je ribben richting je bekken.", "Krul je romp omlaag zonder aan het touw te trekken met je armen.", "Pauzeer kort in de gebogen positie terwijl je heupen stil blijven.", "Kom langzaam terug tot je romp lang is zonder je onderrug te overstrekken."],
    ["De heupen naar achteren duwen en de oefening als een hip hinge uitvoeren.", "Het touw met de armen naar beneden trekken in plaats van de buik te krullen."],
    "ToJeyhydUxU", "Cable Crunch: Do It Right!", "Testosterone Nation"
  ),
  'machine-crunch': education(
    "Stel de machine zo in dat je rug tegen de steun zit en het draaipunt bij je romp past. Plaats je voeten stevig en houd je heupen stil.",
    ["Span je buik aan voordat je de handgrepen beweegt.", "Krul je borst richting je bekken vanuit je romp.", "Pauzeer kort onderin zonder met je armen te trekken.", "Laat de machine gecontroleerd teruggaan tot je buik op rek staat."],
    ["De heupen optillen of de beweging uit de armen halen.", "Te zwaar kiezen waardoor de terugweg wegvalt."],
    "V7p_DmkYLZw", "Full Crunch Machine - Abs Exercise", "MyTraining App"
  ),
  'dumbbell-dead-bug': education(
    "Ga op je rug liggen met je heupen en knieen in 90 graden. Houd een lichte dumbbell met gestrekte armen boven je borst en druk je onderrug rustig richting de vloer.",
    ["Adem uit en span je buik aan zonder je ribben op te trekken.", "Laat een arm en het tegenovergestelde been langzaam zakken.", "Stop voordat je onderrug loskomt van de vloer.", "Breng terug naar het midden en wissel gecontroleerd van kant."],
    ["De dumbbell te zwaar kiezen of de onderrug laten loskomen.", "Armen en benen snel laten vallen zonder ademcontrole."],
    "TDJWeNydYHg", "Dead Bug with Dumbbells", "Dale Dymkoski"
  ),
  'dead-bug': education(
    "Ga op je rug liggen met je heupen en knieen boven je heupen. Strek je armen naar het plafond en houd je onderrug rustig tegen de vloer.",
    ["Adem uit en maak je romp stevig voordat je beweegt.", "Laat een arm en het tegenovergestelde been langzaam richting vloer gaan.", "Houd je bekken stil en stop zodra je rug wil loskomen.", "Breng beide ledematen terug en wissel van kant."],
    ["De onderrug laten hol trekken om verder te reiken.", "De adem inhouden of de beweging te snel uitvoeren."],
    "o4GKiEoYClI", "Dead Bug Exercise For Core Stability", "Pursuit Physical Therapy"
  ),
  'pallof-press': education(
    "Veranker een band op borsthoogte naast je. Sta zijwaarts met beide handen bij je borst, voeten stabiel en genoeg afstand om constante spanning te voelen.",
    ["Span je billen en buik aan zodat je romp niet meedraait.", "Duw je handen recht van je borst weg.", "Pauzeer met gestrekte armen terwijl de band je naar het anker trekt.", "Breng je handen langzaam terug en wissel daarna van kant."],
    ["De schouders of heupen naar het anker laten draaien.", "De band te licht kiezen waardoor er geen anti-rotatiespanning is."],
    "y1fOBVtANdM", "How to do a Standing Banded Pallof Press", "TurnFit - Vancouver Personal Trainers"
  ),
  'machine-lateral-raise': education(
    "Stel de machine zo in dat de draaipunten bij je ellebogen liggen. Plaats je voeten stevig, houd je romp tegen de steun en laat je armen ontspannen starten.",
    ["Zet je schouders laag en leid de beweging met je ellebogen.", "Til je armen zijwaarts tot ongeveer schouderhoogte.", "Pauzeer kort zonder je nek aan te spannen.", "Laat de armen langzaam zakken en houd onderin nog spanning."],
    ["Te zwaar kiezen en de romp laten meebewegen.", "Hoger tillen dan je schouder rustig kan controleren."],
    "NNAs8jx_zJI", "How to PROPERLY Lateral Raise Machine (STOP THIS)", "Colossus Fitness"
  ),
  'cable-lateral-raise': education(
    "Zet de kabel laag en pak hem met de hand die van het apparaat af staat. Sta stabiel met de kabel voor je lichaam en houd je arm licht gebogen.",
    ["Span je buik aan en houd je romp recht.", "Til je arm zijwaarts met je elleboog als hoogste punt.", "Stop rond schouderhoogte zonder de kabel te laten trekken aan je nek.", "Laat langzaam zakken tot je schouder onder spanning blijft."],
    ["De romp zijwaarts kantelen om meer gewicht te verplaatsen.", "De pols laten knikken of de arm ver voor het lichaam zwaaien."],
    "f_OGBg2KxgY", "Stop Messing Up Lateral Raises (Easy Fix)", "Jeff Nippard"
  ),
  'dumbbell-lateral-raise': education(
    "Sta met lichte dumbbells langs je lichaam en houd je voeten stabiel. Laat je ellebogen zacht gebogen en je nek ontspannen.",
    ["Span je buik licht aan en houd je schouders laag.", "Til de dumbbells zijwaarts met je ellebogen iets hoger dan je handen.", "Stop rond schouderhoogte zonder momentum.", "Laat de dumbbells langzaam zakken en behoud controle onderin."],
    ["Zwaar zwaaien vanuit de heupen of de schouders optrekken.", "De handen veel hoger dan de ellebogen laten komen."],
    "pgrWjBfaFe8", "How to PROPERLY Dumbbell Lateral Raise For Bigger Shoulders", "Colossus Fitness"
  ),
  'band-lateral-raise': education(
    "Ga op de band staan met een of beide voeten en houd de uiteinden langs je lichaam. Kies een bandlengte waarbij de start al lichte spanning geeft.",
    ["Houd je romp stil en je schouders laag.", "Til je armen zijwaarts door je ellebogen te leiden.", "Stop rond schouderhoogte en pauzeer kort.", "Laat de band langzaam terugtrekken zonder je handen te laten klappen."],
    ["De band te lang of te zwaar kiezen waardoor je moet zwaaien.", "De nek aanspannen en de schouders naar de oren trekken."],
    "yfNg5sFndbw", "Band Lateral Raise", "Men's Health"
  ),
  'machine-curl': education(
    "Stel de zitting zo in dat je ellebogen in lijn zijn met het draaipunt. Plaats je bovenarmen stevig tegen het kussen en houd je polsen recht.",
    ["Begin met je armen bijna gestrekt zonder de ellebogen te overstrekken.", "Krul de handgrepen richting je schouders zonder je bovenarmen te liften.", "Pauzeer bovenaan en knijp je biceps rustig aan.", "Laat langzaam zakken tot je armen weer lang zijn."],
    ["De schouders naar voren trekken of de bovenarmen losmaken.", "Het gewicht laten vallen tijdens de excentrische fase."],
    "AR-oARBkYxI", "How to PROPERLY DO Machine Bicep Curls (Machine Preacher Curls)", "Colossus Fitness"
  ),
  'cable-curl': education(
    "Zet de kabel laag en pak een rechte of touwgreep. Sta met je voeten stabiel, je ellebogen naast je romp en de kabel al licht gespannen.",
    ["Houd je bovenarmen stil en begin met bijna gestrekte ellebogen.", "Krul de greep naar je schouders zonder je polsen te knikken.", "Pauzeer bovenaan met je biceps aangespannen.", "Laat de kabel langzaam teruggaan tot je armen lang zijn."],
    ["Achterover leunen of heupmomentum gebruiken.", "De ellebogen naar voren laten schuiven tijdens het krullen."],
    "2MUEL4nL6hA", "How to PROPERLY Cable Bicep Curl For Bigger Biceps", "Colossus Fitness"
  ),
  'dumbbell-curl': education(
    "Sta of zit stabiel met dumbbells naast je lichaam. Houd je ellebogen onder je schouders en kies een houding waarin je polsen recht kunnen blijven.",
    ["Draai je handpalm rustig omhoog terwijl je de dumbbell optilt.", "Krul vanuit je elleboog en houd je bovenarm naast je romp.", "Pauzeer bovenaan zonder je schouder naar voren te brengen.", "Laat de dumbbell langzaam zakken en wissel gecontroleerd van arm."],
    ["Met de heupen zwaaien of de schouder naar voren gooien.", "De pols laten knikken om het gewicht te blijven vasthouden."],
    "MKWBV29S6c0", "PERFECT Bicep Curl Form Tips", "Andrew Kwong (DeltaBolic)"
  ),
  'barbell-curl': education(
    "Sta met je voeten stabiel en pak de stang onderhandse greep. Houd je ellebogen naast je romp en span je buik aan voordat je start.",
    ["Krul de stang vanuit je ellebogen zonder je bovenarmen te verplaatsen.", "Pauzeer kort wanneer je onderarmen dicht bij je biceps komen.", "Laat de stang langzaam zakken tot je armen bijna gestrekt zijn.", "Houd je romp stil en begin de volgende herhaling zonder heupzwaai."],
    ["De rug achterover gooien of de stang met de heupen lanceren.", "De polsen knikken of de ellebogen naar voren laten drijven."],
    "ZQWL7omZh94", "Barbell Curl: Good vs. Bad Form", "Testosterone Nation"
  ),
  'band-curl': education(
    "Ga op het midden van de band staan met je voeten stabiel en houd de uiteinden onderhand vast. Stap breder of smaller om de startspanning aan te passen.",
    ["Houd je ellebogen naast je romp en je polsen recht.", "Krul de band omhoog zonder je schouders op te trekken.", "Pauzeer bovenaan terwijl de band spanning houdt.", "Laat je handen langzaam zakken tot je armen bijna gestrekt zijn."],
    ["De band onder een losse of gladde voet plaatsen.", "Achterover leunen en de weerstand met lichaamsmomentum verplaatsen."],
    "AaA7Yj3zHiU", "How to do Bicep curls with resistance bands", "YuryFit"
  ),
  'cable-pressdown': education(
    "Zet een kabel hoog en pak een touw of stang vast. Sta dichtbij genoeg om je ellebogen naast je romp te houden en span je buik licht aan.",
    ["Begin met je ellebogen gebogen en je bovenarmen stil.", "Duw de greep omlaag tot je ellebogen bijna volledig gestrekt zijn.", "Pauzeer onderaan zonder je schouders naar voren te trekken.", "Laat de greep gecontroleerd terugkomen tot de triceps op rek staan."],
    ["De romp over de greep heen hangen of de schouders laten meebewegen.", "De ellebogen naar voren en achteren laten schuiven."],
    "4NWWB0f0vzQ", "Cable Triceps Extension Key Points", "ArielYu_Fit"
  ),
  'machine-triceps-extension': education(
    "Stel de machine zo in dat je ellebogen bij het draaipunt liggen. Plaats je bovenarmen stevig tegen het kussen en houd je schouders laag.",
    ["Start met je ellebogen gebogen en je polsen recht.", "Strek je ellebogen rustig tegen de weerstand in.", "Pauzeer wanneer je armen bijna recht zijn zonder hard te blokkeren.", "Laat langzaam teruggaan tot je triceps prettig op rek staat."],
    ["De bovenarmen van het kussen tillen of de schouders optrekken.", "De terugweg laten vallen en de ellebogen onder spanning verliezen."],
    "1AFJTda1btg", "The PERFECT Machine Triceps Extension", "Andrew Kwong (DeltaBolic)"
  ),
  'dumbbell-triceps-extension': education(
    "Sta stabiel of ga zitten met een dumbbell boven je hoofd. Houd het gewicht met beide handen vast en wijs je ellebogen zoveel mogelijk naar voren.",
    ["Span je buik aan en houd je bovenarmen bijna stil.", "Laat de dumbbell achter je hoofd zakken door je ellebogen te buigen.", "Stop bij een comfortabele rek zonder je schouders te forceren.", "Strek je ellebogen en breng de dumbbell terug boven je hoofd."],
    ["De ellebogen wijd laten uitwaaieren of de onderrug hol trekken.", "Te diep zakken terwijl de schouderpositie niet stabiel blijft."],
    "-Vyt2QdsR7E", "How To: Standing Overhead Dumbbell Tricep Extension", "ScottHermanFitness"
  ),
  'close-grip-push-up': education(
    "Neem een plankpositie met je handen iets smaller dan je schouders. Houd je vingers gespreid, je voeten stevig en je hoofd in lijn met je romp.",
    ["Span buik en billen aan voordat je zakt.", "Houd je ellebogen dicht langs je romp terwijl je borst richting vloer beweegt.", "Stop voordat je schouders of onderrug de lijn verliezen.", "Duw de vloer weg en strek je armen gecontroleerd."],
    ["De handen zo smal zetten dat de polsen of ellebogen ongemakkelijk worden.", "De heupen laten zakken of de herhaling met een zwaai afmaken."],
    "CZT3gEobyOo", "Close Grip Push Ups", "Strength Coach Sam"
  ),
  'band-pressdown': education(
    "Veranker de band stevig boven je hoofd en pak de uiteinden of een handgreep vast. Sta stabiel met je ellebogen naast je romp en de band al onder spanning.",
    ["Buig je ellebogen zonder je bovenarmen te verplaatsen.", "Duw de band omlaag tot je armen bijna gestrekt zijn.", "Pauzeer onderaan en knijp je triceps aan.", "Laat langzaam terugkomen terwijl je schouders laag blijven."],
    ["De band aan een onveilig anker hangen of op de terugweg laten losschieten.", "Voorover hangen of de ellebogen naar voren bewegen."],
    "aBawjUAsWB0", "Banded Tricep Pressdown", "Derek Ward"
  )
};
