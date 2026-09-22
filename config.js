/* ============================================================
   CONFIG — The Book of Palak, Chapter 26
   Every bit of text on the site lives here. Edit freely.
   Lines marked // EDIT are placeholders — swap in the real thing
   whenever you know it. Nothing will break if you don't.
   ============================================================ */

window.CONFIG = {

  meta: {
    herName: "Palak Sinha",
    houseName: "Slytherin",
    patronus: "Falcon",
    wand: "10¾\" black walnut, phoenix feather core, hard flexibility",
    dob: "2026-09-23T00:00:00+05:30", // birthday moment, IST
    calledYou: "Boss",       // what she calls him
    youCallHer: "Ma'am",     // what he calls her
    signature: "— Boss",
    signatureLong: "Tumhara Boss,\nVikas",
    // EDIT — swap for her real favourites whenever you learn them.
    defaultCake: "Chocolate",
    defaultNonVeg: "Chicken biryani",
  },

  // ---------- CHAPTER 0 — THE OWL LETTER ----------
  owlLetter: {
    salutation: "Dear Ms. Palak Sinha,",
    body: [
      "We are pleased to inform you that you have been selected for your 26th birthday.",
      "House: Slytherin.",
      "Wand: 10¾\" black walnut, phoenix feather core, hard flexibility.",
      "Party venue: wherever you are right now (location unknown, as usual).",
      "Dress code: pyjamas.",
      "Guest list: introverts only."
    ],
    tapToUnlock: "Tap the seal to open",
    soundHint: "(tap breaks the wax, and wakes the sound)",
  },

  countdown: {
    heading: "The candle hasn't been lit yet.",
    sub: "Chapter 26 begins at midnight.",
    skipLabel: "Alohomora (open now)",
  },

  // ---------- THE DECREE ----------
  decree: {
    title: "OFFICIAL DECREE",
    subtitle: "By order of her best friend",
    body: [
      "Palak Sinha is hereby excused from all responsibilities for the day of 23 September 2026.",
      "No schedules. No targets. No guilt.",
      "Only cake, books, rest, and being celebrated.",
      "This decree cannot be appealed."
    ],
    signPrompt: "Sign here, Ma'am, to make it official.",
    signedLine: "Decree signed and sealed.",
  },

  // ---------- CHAPTER 1 — SORTING QUIZ ----------
  quiz: {
    intro: "A few questions. There is no wrong answer. There is, however, a funniest one.",
    questions: [
      {
        q: "Ma'am is 200 metres from home. ETA?",
        options: [
          { text: "2 minutes", reply: "Ambitious. Noted, not believed." },
          { text: "5 minutes", reply: "Optimistic. The falcon respects it." },
          { text: "Google Maps has resigned", reply: "Correct. It filed the resignation itself.", correct: true },
          { text: "Tomorrow morning, via 3 unknown colonies", reply: "Historically accurate." },
        ]
      },
      {
        q: "Ideal birthday guest list?",
        options: [
          { text: "50 people", reply: "Ma'am has left the building already." },
          { text: "10 people", reply: "Still nine too many." },
          { text: "2 people", reply: "Close. Still one person too many." },
          { text: "0: me, a novel, and a cake", reply: "Correct. A packed house.", correct: true },
        ]
      },
      {
        q: "Phone rings, unknown number. Ma'am's reaction?",
        options: [
          { text: "Picks up immediately", reply: "Factually incorrect and everyone knows it." },
          { text: "Lets it ring, then googles the number", reply: "Correct. Due diligence first.", correct: true },
          { text: "Calls back after 3 days", reply: "A bold alternate strategy." },
          { text: "Blocks on principle", reply: "Efficient. Slightly extreme." },
        ]
      },
      {
        q: "Her wand has hard flexibility. What does that say about her?",
        options: [
          { text: "Will not change her opinion for anyone", reply: "Correct. Ollivander knew what he was doing.", correct: true },
          { text: "Loves confrontation", reply: "Incorrect. She just quietly wins later." },
          { text: "Bends easily under pressure", reply: "The wand would like a word." },
          { text: "Random trivia, means nothing", reply: "Ollivander doesn't do small talk. Try again." },
        ]
      },
      {
        q: "If Ma'am's life were a K-drama, Episode 1 would open with?",
        options: [
          { text: "She takes a wrong turn near her own house", reply: "Standard episode 1 material.", correct: true },
          { text: "A meet-cute at a coffee shop", reply: "Too easy for her plotline." },
          { text: "A chaebol heir appears", reply: "Not yet, give it a few episodes." },
          { text: "She finishes a book in one sitting", reply: "This is technically every episode." },
        ]
      },
      {
        q: "Cake or chicken?",
        options: [
          { text: "Cake", reply: "An incomplete answer." },
          { text: "Chicken", reply: "Also incomplete." },
          { text: "Both. Next question.", reply: "Correct. No further discussion needed.", correct: true },
          { text: "Neither", reply: "This option does not exist for her." },
        ]
      },
      {
        q: "Ma'am's ideal Friday night?",
        options: [
          { text: "A party with loud music", reply: "Wrong universe entirely." },
          { text: "A novel, a blanket, silence", reply: "Correct. Peak Friday.", correct: true },
          { text: "Group video call", reply: "She will mute and read subtitles of her own life." },
          { text: "Karaoke", reply: "Only under duress." },
        ]
      },
      {
        q: "Someone asks Ma'am for directions. What happens?",
        options: [
          { text: "She gives perfect directions", reply: "A hypothetical scenario." },
          { text: "She points confidently in the wrong direction", reply: "Correct. Confidence was never the problem.", correct: true },
          { text: "She pulls up Maps for them", reply: "Ironic, considering." },
          { text: "She pretends not to hear", reply: "A respected evasive manoeuvre." },
        ]
      },
    ],
    verdict: "Sorting Hat's verdict: Slytherin. Obviously.",
    verdictSub: "It barely touched her head before deciding.",
  },

  // ---------- CHAPTER 2 — ACTIVITIES ----------
  maze: {
    oath: "I solemnly swear that I am up to no good.",
    intro: "Ghar bohot paas hai. Raasta thoda lamba.",
    result: "Distance: 50 m. Time taken: 45 min. Mischief managed.",
  },

  balloons: {
    intro: "Pop one at a time. No rush, this isn't a race with your bus stop.",
    lines: [
      "Bus ne galat stop pe utaara, ye kisi aur ka fault tha.",
      "You once forgot which direction your own house was in. Legendary, honestly.",
      "Introverts don't get lost in crowds. Ma'am gets lost in empty streets. A specialised skill.",
      "Your Papa's pickup service has a 100% success rate.",
      "You read faster than you walk in the right direction.",
      "Slytherin house point deducted: for making a 200m walk a 45 minute journey.",
      "K-drama marathons: the one thing you never lose your way through.",
      "If cake could talk, it would still say less than you do. And it would still win the argument.",
    ],
  },

  scratchCards: {
    intro: "Scratch to reveal. No skill involved, just patience — a thing you have plenty of.",
    cards: [
      "1 silent coffee date, zero small talk.",
      "1 non-veg treat, on me. Chicken biryani, obviously.",
      "1 full day of no calls, just memes.",
      "1 free pass to get lost, no questions asked.",
    ],
  },

  // ---------- ROOM OF REQUIREMENT — GAMES ----------
  room: {
    intro: "A room that appears because she needed it. A room of her own.",
    exit: "Room of Requirement closes. It'll be here whenever you need it.",
    door1: "Potions Class",
    door1sub: "Brew the birthday cake",
    door2: "Falcon Flight",
    door2sub: "An arcade for a bad navigator",
    door3: "Guess the Story",
    door3sub: "How well do you know stories",
    skip: "Skip",
  },

  potions: {
    intro: "Drag each ingredient into the cauldron, in order.",
    recipe: ["Flour", "Sugar", "Eggs", "Butter", "Chocolate", "A pinch of phoenix feather"],
    decoys: [
      { name: "Chicken leg", reply: "Chicken cake. Bold choice. Rejected." },
      { name: "Ringing phone", reply: "Isko cauldron mein daalne se call band nahi hogi." },
      { name: "A map", reply: "Map tumhare kis kaam ka." },
    ],
    stirPrompt: "Stir it. Draw circles.",
    stirDone: "Smells like it might actually work.",
    decorateTitle: "Decorate it your way.",
    flavours: ["Chocolate", "Vanilla", "Red Velvet", "Butterscotch"],
    icingColours: ["Emerald", "Silver", "Cream", "Rose"],
    toppings: ["Sprinkles", "Stars", "A tiny falcon", "Books", "A snake"],
    namePrompt: "Write a name in icing.",
    saved: "Cake saved. It'll be waiting later tonight.",
  },

  falconFlight: {
    intro: "Drag to fly. Catch the good stuff. Avoid the rest. 3 lives.",
    catchGood: [
      { label: "Cake slice", points: 10 },
      { label: "Chicken", points: 10 },
      { label: "Book", points: 15 },
      { label: "Coffee", points: 5 },
      { label: "Golden Snitch", points: 50, rare: true },
    ],
    avoidBad: [
      "Unknown Caller",
      "Beta, kya kar rahi ho aajkal?",
      "Party ke log",
      "Wrong Turn",
    ],
    gameOverLines: [
      "Ek relative ne pakad liya. Happens to the best of us.",
      "Wrong Turn sign jeet gaya. Fir se koshish karo.",
      "Unknown Caller ne mission fail kar diya.",
      "Party ke log dhoond hi lete hain.",
    ],
    playAgain: "Play again",
    highScore: "Best score",
  },

  guessStory: {
    intro: "One line each. Guess the story. Dry delivery guaranteed.",
    questions: [
      {
        summary: "Ek ladka seedhiyon ke neeche rehta hai. Phir ek chitthi aati hai. Life aur complicated ho jati hai, but magical.",
        options: ["Harry Potter and the Philosopher's Stone", "Percy Jackson", "The Chronicles of Narnia", "Matilda"],
        answer: 0,
        reply: "Correct. The cupboard years were rough."
      },
      {
        summary: "Ek tournament, teen schools, aur ek ladka jo participate hi nahi karna chahta tha.",
        options: ["Harry Potter and the Goblet of Fire", "The Hunger Games", "Divergent", "Percy Jackson"],
        answer: 0,
        reply: "Correct. Nobody asked him, really."
      },
      {
        summary: "Ek professor jo dog jaisa dikhta hai. Ek godfather jo dog ban jaata hai. Confusing family reunion.",
        options: ["Harry Potter and the Prisoner of Azkaban", "Twilight", "The Chronicles of Narnia", "His Dark Materials"],
        answer: 0,
        reply: "Correct. Worst family reunion in fiction."
      },
      {
        summary: "Ek pilot crash hota hai North Korea mein, aur wahan ek officer se milta hai. Milta nahi, ladki hai.",
        options: ["Crash Landing on You", "Goblin", "Vincenzo", "It's Okay to Not Be Okay"],
        answer: 0,
        reply: "Correct. Worst possible way to meet someone."
      },
      {
        summary: "Ek immortal goblin, ek bride jo usse maar sakti hai. Romance, but make it existential.",
        options: ["Goblin", "Hotel Del Luna", "The Legend of the Blue Sea", "Vincenzo"],
        answer: 0,
        reply: "Correct. Immortality, but complicated."
      },
      {
        summary: "Ek Italian mafia consigliere Korea aata hai gold dhoondhne. Building ke logon se dost ban jaata hai.",
        options: ["Vincenzo", "Itaewon Class", "Reply 1988", "Signal"],
        answer: 0,
        reply: "Correct. Best kind of neighbourhood watch."
      },
      {
        summary: "Panch dost, ek gully, aur ek decade jo unhe wapas bulati rehti hai.",
        options: ["Reply 1988", "Hospital Playlist", "Twenty-Five Twenty-One", "Start-Up"],
        answer: 0,
        reply: "Correct. The husband guessing game never gets old."
      },
      {
        summary: "Ek ladki, ek zamindar, aur bahut saari galatfahmiyan jo 300 pages mein sulajhti hain.",
        options: ["Pride and Prejudice", "Sense and Sensibility", "Little Women", "Jane Eyre"],
        answer: 0,
        reply: "Correct. Sulajhne mein waqt toh lagta hai."
      },
    ],
    outro: "Itni kahaniyan padh li. Ab tumhari kahani ka next chapter shuru hota hai.",
  },

  // ---------- CHAPTER 3 — DAILY PROPHET ----------
  prophet: {
    masthead: "THE DAILY PROPHET",
    dateline: "23 September 2026 · Special Birthday Edition",
    headlines: [
      { h: "Local Witch Lost 200 Metres From Home, Falcon Patronus Files Complaint", sub: "Papa dispatched for emergency retrieval, as is tradition." },
      { h: "Entire Cake Vanishes, Only One Suspect", sub: "Investigation closed within minutes. No remorse reported." },
      { h: "Introvert Successfully Avoids Three Phone Calls In One Day", sub: "A personal best, sources say." },
      { h: "Bus Stop Confusion Now Officially A College Legend", sub: "Retold annually, with increasing dramatics." },
      { h: "Silent Reader Finishes Novel Before Anyone Notices She Started It", sub: "Speed unclear. Dedication undeniable." },
      { h: "Slytherin Common Room Reports One Resident Who Simply Will Not Change Her Mind", sub: "Hard flexibility, as documented." },
    ],
    columnTitle: "THE FUTURE OFFICER",
    columnBody: [
      "There is a version of this column that could be funny. This isn't it.",
      "For years now, quietly and without asking for credit, she has been doing the work — the kind that doesn't show results every day, the kind that takes discipline most people talk about but don't actually have.",
      "No shortcuts. No announcements. Just the same desk, the same hours, the same books, on the days nobody was watching.",
      "Abhi sirf main tumhe Ma'am bolta hoon. Ek din poora district bolega.",
      "Proud doesn't even cover it. But it's the closest word I have."
    ],
  },

  // ---------- CHAPTER 4 — PENSIEVE ----------
  pensieve: {
    intro: "Tap the bowl. Let the memories out.",
    photoCount: 11, // matches /photos/1.jpg – 11.jpg
    captions: [
      "One of the good days.", // EDIT
      "This one, we still talk about.", // EDIT
      "No filter could've saved this one.", // EDIT
      "Exhibit A in every argument about who's the funnier one.", // EDIT
      "Still one of my favourite photos of us.", // EDIT
      "Proof this happened, in case anyone asks.", // EDIT
      "Kept this one for a reason.", // EDIT
      "Somewhere in here, a story neither of us tells right.", // EDIT
      "This one aged well. Unlike some of our decisions that day.", // EDIT
      "Filed under: do not delete, ever.", // EDIT
      "Last one. Saving the best for last, obviously.", // EDIT
    ],
  },

  // ---------- QUIET ROOM ----------
  quietRoom: {
    intro: "Stay as long as you want. Nobody's timing this.",
    line: "Bahut mehnat ki hai tumne. Aaj bas rest karo. Duniya ek din wait kar sakti hai.",
    sounds: [
      { key: "rain", label: "Rain" },
      { key: "fire", label: "Fireplace" },
      { key: "wind", label: "Wind" },
    ],
    breathingLabel: "A minute of nothing",
    breatheIn: "saans lo...",
    breatheOut: "chhodo...",
  },

  // ---------- OPEN WHEN LETTERS ----------
  openWhen: [
    {
      title: "Open when you're tired",
      lines: [
        "Rest karna kaam se bhagna nahi hota.",
        "Tum bohot der se bina ruke chal rahi ho.",
        "Ek pause, aur duniya wahi rahegi jahan chhodi thi.",
        "Baithi raho thodi der. Koi jaldi nahi hai."
      ]
    },
    {
      title: "Open when you feel you're not enough",
      lines: [
        "Jo bhi ye soch tumhe de raha hai, galat hai.",
        "Tumne itna kuch akele sambhala hai, chup chaap.",
        "Kisi se manzoori lene ki zaroorat nahi. Main keh raha hoon, aur main aise hi nahi kehta.",
        "Main jaanta hoon tum kaafi ho. Hamesha thi."
      ]
    },
    {
      title: "Open when you miss college",
      lines: [
        "Wo corridors, wo bekaar ki baatein, wo din jab kuch bhi serious nahi tha.",
        "Kabhi kabhi main bhi bohot miss karta hoon.",
        "Waqt aage badh gaya, par wo yaadein wahin hain, safe.",
        "Jab bhi miss ho, yahi samajhna — main bhi wahi soch raha hoon."
      ]
    },
    {
      title: "Open when you get lost (literally)",
      lines: [
        "Pehle: saans lo.",
        "Doosra: Papa ko call karo, jaisa hamesha karti ho.",
        "Teesra: ye tumhari superpower hai, kisi tarah se.",
        "Falcons navigate well. Tum navigate differently. Dono valid hain."
      ]
    },
    {
      title: "Open when you need a reason to smile",
      lines: [
        "Ek cake tumhara wait kar raha hai, kahin na kahin.",
        "Koi ek K-drama abhi bhi unfinished pada hai tumhare list mein.",
        "Aur ek Boss hai jo aaj bhi tumhe Ma'am bulata hai, seriously.",
        "Chhota sa reason hai, par kaam chal jaana chahiye."
      ]
    },
    {
      title: "Open on the day you achieve your dream",
      lines: [
        "Agar tum ye padh rahi ho, toh ho gaya.",
        "Maine hamesha kaha tha, aur maine hamesha maana tha.",
        "Ab poora district tumhe wahi bulayega jo maine bohot pehle bulana shuru kiya tha.",
        "Congratulations, Ma'am. Sach mein. Aakhir mein."
      ]
    },
  ],

  // ---------- DISTANCE HUG ----------
  distanceHug: {
    prompt: "Press and hold.",
    line: "Distance: bahut zyada. Hug: phir bhi deliver ho gaya. Baaki wala milke, udhaar raha.",
  },

  // ---------- CHAPTER 5 — THE LETTER ----------
  letter: {
    body:
`Ma'am,

Shuru mein hi bata doon — ye letter thoda emotional ho sakta hai. Sambhal lena, jaisa tum sab sambhal leti ho, chup chaap.

Pehle wo waala kissa yaad hai — bus ne galat stop pe utaar diya, aur tumne apne hi ghar ka raasta bhula diya? Papa ko call karna pada. Ye kahani ab officially college legend hai. Main isse kabhi nahi chhodunga, ye tumhe pata hai.

Lekin iske aage bhi kuch kehna hai.

Jitni baar zindagi mushkil lagi — career ho, ghar ki baatein ho, ya wo sab jo dil se juda hota hai — tum wahi thi jo bina drama ke, bina judge kiye, seedha kaam ki baat karti thi. Advice maangi, mili. Kabhi maangi nahi, tab bhi mili, jab zaroorat thi.

Tum loud nahi ho. Tumne kabhi credit nahi maanga. Bas hamesha wahin thi.

Ab tum kuch bada kar rahi ho — quietly, discipline ke saath, bina kisi shor ke. Mujhe pura yakeen hai tum wahan pahunchogi jahan jaana chahti ho. Aur jis din pahunchogi, sabse zyada khush main hi hoga. Ye baazi maine bohot pehle laga li thi.

College ke din bohot yaad aate hain. Wo bekaar ki baatein, wo corridors, wo din jab sab kuch simple tha. Waqt badal gaya. Par kuch nahi badla — tum abhi bhi wahi ho jise main sabse zyada trust karta hoon.

Ek baat aur — tum chahe kahin bhi lost ho jao, chahe kitni baar apne hi ghar ka raasta bhool jao — mujhe tum kabhi lost nahi lagi. Even if you get lost everywhere, you'll never be lost to me.

Happy 26th birthday, Ma'am.

— Boss`,
  },

  // ---------- CHAPTER 6 — GRAND FINALE ----------
  finale: {
    lumosLabel: "Lumos",
    blowLabel: "Blow (or tap here)",
    micHint: "Phone ke mic mein phoonk maaro. Ya bas tap kar do.",
    afterBlow: "Expecto Patronum",
    skyText: "Happy Birthday, Palak",
    lanternPrompt: "Ek lantern aasmaan mein chhodo. Ek wish ke saath, jitni chaho utni.",
    lanternWishes: ["Peace", "Good health", "Selection", "Home-cooked biryani", "Never getting lost again"],
    finalText: [
      "Happy 26th, Palak.",
      "Main wahan nahi hoon, par yeh poori raat tumhare naam hai.",
      "Chapter 26: To be continued. Milte hain jaldi."
    ],
    closingLine: "Introvert-friendly party. Guest list: 1 (you). Noise: minimal. Love: maximum. Mischief managed.",
    readAgain: "Read the book again",
    backToQuiet: "Go back to the Quiet Room",
  },

  // ---------- EASTER EGGS ----------
  easterEggs: {
    feather: "Ek pankh, ek pal. Ma'am, tumhe kabhi bataya nahi ki kitna proud feel hota hoon.",
    moon: "Teen baar chaand ko chhu liya. Kuch cheezein sirf akele mein mehsoos ki jaati hain.",
    polaroidBack: "Ye photo mere phone mein sabse zyada dekhi gayi hai. Tumhe pata bhi nahi tha.",
    fog: "Window saaf kar diya. Bahar kuch nahi hai, bas raat hai. Kabhi kabhi itna hi kaafi hota hai.",
  },
};
