(function () {
  "use strict";

  const topics = [
    {
      id: "fractions",
      route: "fractions",
      title: "Fractions",
      shortTitle: "Fractions",
      skillNoun: "Fractions topic",
      description: "Make fractions visible, then build the method one step at a time.",
      heroTitle: "Fractions, made visible.",
      heroDescription: "Open any topic and work through its teaching, supported practice and final check.",
      heroVariant: "fractions",
      heroSymbol: "3/4",
      openingNarration: {
        lead: "Let's get started with {skillTitle}.",
        skillLeads: Object.freeze({
          "FRA-01": "Let's learn how fractions work as equal parts."
        }),
        hook: "Fractions are all around us whenever we share, measure, compare or scale something. We'll make the idea visible first, then build it together."
      },
      packRoot: "/FRA%2001%20to%2028/revily_fractions_v1_2/",
      manifestPath: "FRACTIONS_MANIFEST.yaml",
      dialoguePath: "shared/RYAN_DIALOGUE_PROFILE_v1.yaml",
      schemaPath: "shared/revily-skill-spec-v1.2.schema.json",
      expectedSkillCount: 28,
      skillIdPattern: "^FRA-\\d{2}$",
      skillPrefix: "FRA",
      storageNamespace: "fractions"
    },
    {
      id: "add-subtract-fractions",
      route: "add-subtract-fractions",
      title: "Adding and Subtracting Fractions",
      shortTitle: "Add & subtract",
      skillNoun: "fraction operation skill",
      description: "Build from equal denominators to mixed-number and multi-step fraction problems.",
      heroTitle: "Fraction operations, made visible.",
      heroDescription: "Match the part sizes, choose the operation and carry each answer through to its required form.",
      heroVariant: "fractions",
      heroSymbol: "⅔ + ¼",
      openingNarration: {
        lead: "Let's get started with {skillTitle}.",
        skillLeads: Object.freeze({
          "AF-01": "Let's add equal-sized fraction parts without changing their size."
        }),
        hook: "We will make the part sizes visible first, then build from direct calculations to independent GCSE problems."
      },
      packRoot: "/CUR-N01_Add_Subtract_Fractions_v1_0/",
      manifestPath: "ADD_SUBTRACT_FRACTIONS_MANIFEST.yaml",
      dialoguePath: "../FRA%2001%20to%2028/revily_fractions_v1_2/shared/RYAN_DIALOGUE_PROFILE_v1.yaml",
      schemaPath: "../FRA%2001%20to%2028/revily_fractions_v1_2/shared/revily-skill-spec-v1.2.schema.json",
      expectedSkillCount: 18,
      skillIdPattern: "^AF-\\d{2}$",
      skillPrefix: "AF",
      storageNamespace: "add-subtract-fractions"
    },
    {
      id: "multiply-divide-fractions",
      route: "multiply-divide-fractions",
      title: "Multiplying and Dividing Fractions",
      shortTitle: "Multiply & divide",
      skillNoun: "fraction operation skill",
      description: "Move from fractions of amounts to products, reciprocals, division and mixed applications.",
      heroTitle: "Scale and group fractions.",
      heroDescription: "See when a fraction scales an amount, when division counts groups and why the reciprocal method works.",
      heroVariant: "fractions",
      heroSymbol: "¾ × ⅖",
      openingNarration: {
        lead: "Let's get started with {skillTitle}.",
        skillLeads: Object.freeze({
          "MD-01": "Let's find one equal fractional part of a whole amount."
        }),
        hook: "We will connect equal groups to exact multiplication and division, then choose methods independently."
      },
      packRoot: "/CUR-N02_Multiply_Divide_Fractions_v1_0/",
      manifestPath: "MULTIPLY_DIVIDE_FRACTIONS_MANIFEST.yaml",
      dialoguePath: "../FRA%2001%20to%2028/revily_fractions_v1_2/shared/RYAN_DIALOGUE_PROFILE_v1.yaml",
      schemaPath: "../FRA%2001%20to%2028/revily_fractions_v1_2/shared/revily-skill-spec-v1.2.schema.json",
      expectedSkillCount: 17,
      skillIdPattern: "^MD-\\d{2}$",
      skillPrefix: "MD",
      storageNamespace: "multiply-divide-fractions"
    },
    {
      id: "decimal-calculation",
      route: "decimals",
      title: "Decimal Calculation",
      shortTitle: "Decimals",
      skillNoun: "Decimal skill",
      description: "Develop decimal place value and calculation through nineteen focused skills.",
      heroTitle: "Decimals, made visible.",
      heroDescription: "Build place value, calculation and context skills through the same teaching and practice flow.",
      heroVariant: "decimals",
      heroSymbol: "0.75",
      openingNarration: {
        lead: "Let's get started with {skillTitle}.",
        skillLeads: Object.freeze({
          "DEC-01": "Let's learn how to read, write and partition decimals."
        }),
        hook: "Decimals are all around us in money, measurements, temperatures and scores. We'll make the idea clear first, then build it together."
      },
      packRoot: "/CUR-N03_Decimal_Calculation_19_Atomic_Skills_v1.2/",
      manifestPath: "DECIMAL_CALCULATION_MANIFEST.yaml",
      dialoguePath: "shared/RYAN_DIALOGUE_PROFILE_v1.yaml",
      schemaPath: "shared/revily-skill-spec-v1.2.schema.json",
      expectedSkillCount: 19,
      skillIdPattern: "^DEC-\\d{2}$",
      skillPrefix: "DEC",
      storageNamespace: "decimal-calculation"
    },
    {
      id: "fractions-decimals-percentages",
      route: "fractions-decimals-percentages",
      title: "Fractions, Decimals and Percentages",
      shortTitle: "FDP conversions",
      skillNoun: "conversion skill",
      description: "Connect equivalent forms, convert in every direction, then compare and order mixed representations.",
      heroTitle: "One value, three forms.",
      heroDescription: "Place fractions, decimals and percentages on one shared number scale and choose an efficient conversion route.",
      heroVariant: "decimals",
      heroSymbol: "½ = 0.5 = 50%",
      openingNarration: {
        lead: "Let's get started with {skillTitle}.",
        skillLeads: Object.freeze({
          "FDP-01": "Let's connect tenths and hundredths to their decimal places."
        }),
        hook: "The notation can change while the value stays fixed. We will make that equivalence visible before using formal methods."
      },
      packRoot: "/CUR-N03_FDP_Conversions_v1_0/",
      manifestPath: "FDP_CONVERSIONS_MANIFEST.yaml",
      dialoguePath: "../FRA%2001%20to%2028/revily_fractions_v1_2/shared/RYAN_DIALOGUE_PROFILE_v1.yaml",
      schemaPath: "../FRA%2001%20to%2028/revily_fractions_v1_2/shared/revily-skill-spec-v1.2.schema.json",
      expectedSkillCount: 15,
      skillIdPattern: "^FDP-\\d{2}$",
      skillPrefix: "FDP",
      storageNamespace: "fractions-decimals-percentages"
    },
    {
      id: "percentage-amounts",
      route: "percentage-amounts",
      title: "Finding Percentages of Amounts",
      shortTitle: "Percentages",
      skillNoun: "percentage skill",
      description: "Identify the whole, read the percentage and set up the required part before calculating.",
      heroTitle: "Percentages, made meaningful.",
      heroDescription: "See which amount is the whole, what the percentage selects and how the calculation is built.",
      heroVariant: "percentages",
      heroSymbol: "35%",
      openingNarration: {
        lead: "Let's get started with {skillTitle}.",
        skillLeads: Object.freeze({
          "PA-01": "Let's learn how to interpret a percentage of an amount.",
          "PA-02": "Let's learn how one of ten equal shares gives ten percent.",
          "PA-03": "Let's learn how one of one hundred equal shares gives one percent.",
          "PA-04": "Let's use halves and quarters to find familiar percentages.",
          "PA-05": "Let's build multiples of ten percent from equal groups.",
          "PA-06": "Let's split ten percent into equal five-percent halves.",
          "PA-07": "Let's combine useful benchmark parts from the same whole."
        }),
        hook: "Percentages describe a part of a chosen whole. We'll identify those roles first, then build the calculation from them."
      },
      packRoot: "/CUR-N04_Percentage_Amounts_v1_0/",
      manifestPath: "PERCENTAGE_AMOUNTS_MANIFEST.yaml",
      dialoguePath: "../FRA%2001%20to%2028/revily_fractions_v1_2/shared/RYAN_DIALOGUE_PROFILE_v1.yaml",
      schemaPath: "../FRA%2001%20to%2028/revily_fractions_v1_2/shared/revily-skill-spec-v1.2.schema.json",
      expectedSkillCount: 15,
      skillIdPattern: "^PA-\\d{2}$",
      skillPrefix: "PA",
      storageNamespace: "percentage-amounts"
    },
    {
      id: "percentage-change",
      route: "percentage-change",
      title: "Percentage Change",
      shortTitle: "Percentage change",
      skillNoun: "percentage-change skill",
      description: "Distinguish original, change and final amounts before using forward, reverse and repeated-change methods.",
      heroTitle: "Track what changes—and what stays the reference.",
      heroDescription: "Build percentage increase and decrease from the original whole, then reverse and repeat the structure accurately.",
      heroVariant: "percentages",
      heroSymbol: "× 1.15",
      openingNarration: {
        lead: "Let's get started with {skillTitle}.",
        skillLeads: Object.freeze({
          "PC-01": "Let's separate the original, the change and the final amount."
        }),
        hook: "Percentage change becomes reliable once the original amount stays visible as the reference whole."
      },
      packRoot: "/CUR-N05_Percentage_Change_v1_0/",
      manifestPath: "PERCENTAGE_CHANGE_MANIFEST.yaml",
      dialoguePath: "../FRA%2001%20to%2028/revily_fractions_v1_2/shared/RYAN_DIALOGUE_PROFILE_v1.yaml",
      schemaPath: "../FRA%2001%20to%2028/revily_fractions_v1_2/shared/revily-skill-spec-v1.2.schema.json",
      expectedSkillCount: 13,
      skillIdPattern: "^PC-\\d{2}$",
      skillPrefix: "PC",
      storageNamespace: "percentage-change"
    }
  ];

  function findTopic(value) {
    const key = String(value || "").toLowerCase();
    return topics.find((topic) => topic.id === key || topic.route === key) || null;
  }

  window.RevilyTopics = Object.freeze({
    all: Object.freeze(topics.map((topic) => Object.freeze(topic))),
    find: findTopic,
    narration: Object.freeze({
      performer: "Ryan",
      voiceId: "en-GB-RyanNeural",
      voiceName: "Microsoft Ryan Online (Natural) - English (United Kingdom)"
    })
  });
})();
