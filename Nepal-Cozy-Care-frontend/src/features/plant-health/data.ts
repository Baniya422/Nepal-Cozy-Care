import { Bug, Droplets, Leaf, Sun, Thermometer, Wind } from "lucide-react";
import type {
  DiagnosisProfile,
  PlantHealthHabit,
  SelectOption,
  SymptomCategory,
} from "./types";

export const symptomCategories: SymptomCategory[] = [
  {
    id: "leaves",
    name: "Leaf Problems",
    icon: Leaf,
    symptoms: [
      { id: "yellow_leaves", name: "Yellow Leaves", description: "Leaves turning yellow" },
      { id: "brown_tips", name: "Brown Leaf Tips", description: "Brown or crispy leaf edges" },
      { id: "drooping", name: "Drooping Leaves", description: "Leaves hanging down" },
      { id: "spots", name: "Brown/Black Spots", description: "Discolored spots on leaves" },
      { id: "curling", name: "Curling Leaves", description: "Leaves curling up or down" },
      { id: "falling", name: "Falling Leaves", description: "Leaves dropping prematurely" },
      { id: "holes", name: "Holes in Leaves", description: "Chewed or damaged leaves" },
      { id: "mold", name: "White/Powdery Coating", description: "Fuzzy or powdery substance" },
    ],
  },
  {
    id: "water",
    name: "Watering Issues",
    icon: Droplets,
    symptoms: [
      { id: "overwatering", name: "Overwatering", description: "Soil constantly wet, soggy" },
      { id: "underwatering", name: "Underwatering", description: "Dry soil, wilting" },
      { id: "root_rot", name: "Root Rot Signs", description: "Foul smell, mushy stems" },
      { id: "water_quality", name: "Water Quality", description: "Brown tips from tap water" },
    ],
  },
  {
    id: "light",
    name: "Light & Environment",
    icon: Sun,
    symptoms: [
      { id: "leggy", name: "Leggy Growth", description: "Stretched, sparse stems" },
      { id: "sunburn", name: "Sunburn", description: "Brown, crispy patches" },
      { id: "pale", name: "Pale/Light Green", description: "Loss of vibrant color" },
      { id: "no_growth", name: "No New Growth", description: "Stagnant plant" },
    ],
  },
  {
    id: "pests",
    name: "Pests & Diseases",
    icon: Bug,
    symptoms: [
      { id: "aphids", name: "Tiny Bugs", description: "Small insects on leaves or stems" },
      { id: "spider_mites", name: "Spider Webs", description: "Fine webbing on plant" },
      { id: "fungus_gnats", name: "Flying Insects", description: "Small flies around soil" },
      { id: "scale", name: "Sticky Spots", description: "Sticky residue on leaves" },
      { id: "mealybugs", name: "White Cottony Patches", description: "White fuzzy clusters" },
    ],
  },
  {
    id: "environment",
    name: "Temperature & Humidity",
    icon: Thermometer,
    symptoms: [
      { id: "cold_damage", name: "Cold Damage", description: "Blackened or mushy areas" },
      { id: "heat_stress", name: "Heat Stress", description: "Wilting in hot conditions" },
      { id: "low_humidity", name: "Low Humidity", description: "Crispy edges or browning" },
      { id: "draft", name: "Draft Sensitivity", description: "Damage near windows, vents, or AC" },
    ],
  },
];

export const allSymptoms = symptomCategories.flatMap((category) => category.symptoms);

export const plantTypeOptions: SelectOption[] = [
  { id: "general", label: "General Houseplant" },
  { id: "tropical", label: "Tropical Foliage" },
  { id: "succulent", label: "Succulent / Cactus" },
  { id: "flowering", label: "Flowering Plant" },
  { id: "fern", label: "Fern / Humidity Lover" },
];

export const environmentOptions: SelectOption[] = [
  { id: "living_room", label: "Living Room" },
  { id: "bedroom", label: "Bedroom" },
  { id: "bathroom", label: "Bathroom" },
  { id: "office", label: "Office" },
  { id: "balcony", label: "Balcony" },
  { id: "window", label: "Near Bright Window" },
];

export const soilOptions: SelectOption[] = [
  { id: "unknown", label: "Not sure" },
  { id: "wet", label: "Wet / Soggy" },
  { id: "normal", label: "Lightly moist" },
  { id: "dry", label: "Dry" },
];

export const getCurrentSeason = () => {
  const month = new Date().getMonth();

  if (month >= 2 && month <= 4) return "spring";
  if (month === 5 || month === 6) return "summer";
  if (month >= 7 && month <= 8) return "monsoon";
  if (month >= 9 && month <= 10) return "autumn";
  return "winter";
};

export const seasonOptions: SelectOption[] = [
  { id: "spring", label: "Spring" },
  { id: "summer", label: "Summer" },
  { id: "monsoon", label: "Monsoon" },
  { id: "autumn", label: "Autumn" },
  { id: "winter", label: "Winter" },
];

export const diagnosisProfiles: DiagnosisProfile[] = [
  {
    id: "overwatering",
    title: "Overwatering or Early Root Rot",
    summary:
      "Your plant is likely staying wet for too long, which can weaken roots and cause yellowing, drooping, and fungus gnat issues.",
    severity: "high",
    symptoms: [
      "overwatering",
      "root_rot",
      "yellow_leaves",
      "drooping",
      "falling",
      "fungus_gnats",
      "spots",
    ],
    immediateActions: [
      "Pause watering and check how wet the root zone really is.",
      "Empty any standing water from trays or decorative pots.",
      "Inspect roots quickly if the soil smells sour or stems feel soft.",
    ],
    causes: [
      "Watering too frequently for the plant and season",
      "Heavy soil or poor drainage",
      "A pot that stays damp for too long",
      "Too little airflow during humid weather",
    ],
    solutions: [
      "Let the top layer dry before watering again",
      "Repot into a faster-draining mix if roots are stressed",
      "Trim mushy roots and remove heavily damaged leaves",
      "Reduce watering further during monsoon or winter",
    ],
    prevention: [
      "Always check soil before watering",
      "Use drainage holes and breathable potting mix",
      "Adjust care with the season instead of using one fixed schedule",
    ],
    relatedCareTips: ["watering", "pest_control"],
    contextBoosts: {
      plantTypes: ["succulent"],
      environments: ["bathroom"],
      seasons: ["monsoon", "winter"],
      soilStates: ["wet"],
    },
  },
  {
    id: "underwatering",
    title: "Underwatering and Dry Stress",
    summary:
      "The plant is probably drying out too fast or not getting a full soaking, which leads to wilting, brown tips, and curling.",
    severity: "medium",
    symptoms: ["underwatering", "drooping", "brown_tips", "curling", "falling"],
    immediateActions: [
      "Water thoroughly until excess drains from the pot.",
      "Check whether the soil has pulled away from the pot edges.",
      "Move the plant away from harsh heat for recovery.",
    ],
    causes: [
      "Infrequent watering",
      "A small pot that dries out quickly",
      "Hot weather or strong sun exposure",
      "Dry indoor air",
    ],
    solutions: [
      "Rehydrate the soil fully and evenly",
      "Review how quickly this plant dries in its current room",
      "Increase humidity if the air is very dry",
      "Consider a slightly larger pot if roots are crowded",
    ],
    prevention: [
      "Check soil weekly instead of watering by habit",
      "Increase monitoring during summer",
      "Use reminders for thirsty plants or balcony plants",
    ],
    relatedCareTips: ["watering", "indoor"],
    contextBoosts: {
      environments: ["balcony", "window"],
      seasons: ["summer"],
      soilStates: ["dry"],
    },
  },
  {
    id: "low_light",
    title: "Low Light Stress",
    summary:
      "The plant may not be getting enough usable light, which slows growth and causes pale color or leggy stems.",
    severity: "low",
    symptoms: ["leggy", "pale", "no_growth", "falling"],
    immediateActions: [
      "Move the plant closer to brighter indirect light.",
      "Rotate it weekly so growth stays balanced.",
      "Avoid heavy fertilizing until light improves.",
    ],
    causes: [
      "Room placement too far from a window",
      "Light blocked by curtains, walls, or neighboring buildings",
      "Shorter winter days",
      "A light-hungry plant in a dim room",
    ],
    solutions: [
      "Relocate to a brighter room or window area",
      "Use a grow light if natural light is weak",
      "Prune stretched stems to encourage fuller regrowth",
    ],
    prevention: [
      "Match the plant to the room before buying",
      "Re-evaluate placement seasonally",
      "Choose lower-light plants for darker spaces",
    ],
    relatedCareTips: ["indoor"],
    contextBoosts: {
      plantTypes: ["flowering"],
      environments: ["office", "bathroom"],
      seasons: ["winter"],
    },
  },
  {
    id: "sunburn_heat",
    title: "Sunburn or Heat Stress",
    summary:
      "The plant is likely getting more direct sun or heat than it can handle, leading to patches, fading, and crisp damage.",
    severity: "medium",
    symptoms: ["sunburn", "heat_stress", "brown_tips", "curling", "pale"],
    immediateActions: [
      "Move the plant out of harsh midday sun right away.",
      "Check whether leaves touching hot glass are burned.",
      "Water only if the soil is actually dry.",
    ],
    causes: [
      "Sudden direct sun exposure",
      "A hot balcony or windowsill",
      "Strong seasonal heat",
      "Low humidity during hot weather",
    ],
    solutions: [
      "Shift to bright indirect light",
      "Use a sheer curtain or move the pot slightly back",
      "Remove badly scorched leaves after recovery begins",
    ],
    prevention: [
      "Acclimate plants slowly to stronger sun",
      "Protect leaves from hot afternoon light",
      "Watch balcony plants closely in summer",
    ],
    relatedCareTips: ["outdoor", "indoor"],
    contextBoosts: {
      environments: ["balcony", "window"],
      seasons: ["summer"],
    },
  },
  {
    id: "humidity_stress",
    title: "Low Humidity Stress",
    summary:
      "Dry air may be stressing the plant, especially if you see brown edges, curling, or spider-mite-friendly conditions.",
    severity: "medium",
    symptoms: ["low_humidity", "brown_tips", "curling", "spider_mites"],
    immediateActions: [
      "Move the plant away from direct AC or heating drafts.",
      "Increase humidity using a tray, group planting, or humidifier.",
      "Check leaf undersides for tiny pests as dry air often invites them.",
    ],
    causes: [
      "Dry indoor air",
      "Air conditioning or heater vents",
      "Winter indoor heating",
      "Plants that naturally prefer humidity",
    ],
    solutions: [
      "Boost humidity around the plant",
      "Keep the plant away from direct airflow",
      "Clean leaves and inspect regularly for pest buildup",
    ],
    prevention: [
      "Monitor humidity in dry seasons",
      "Choose better placement for humidity-loving plants",
      "Keep foliage clean and stress low",
    ],
    relatedCareTips: ["indoor", "pest_control"],
    contextBoosts: {
      plantTypes: ["fern", "tropical"],
      environments: ["bedroom", "office"],
      seasons: ["winter"],
    },
  },
  {
    id: "fungal_leaf_issue",
    title: "Fungal or Bacterial Leaf Issue",
    summary:
      "Spots, mold, and wet conditions together often point to fungal or bacterial stress that needs quick cleanup and better airflow.",
    severity: "high",
    symptoms: ["spots", "mold", "yellow_leaves", "root_rot"],
    immediateActions: [
      "Remove the most affected leaves with clean scissors.",
      "Improve airflow around the plant immediately.",
      "Avoid splashing water on foliage until the plant recovers.",
    ],
    causes: [
      "Leaves staying wet too long",
      "Poor airflow",
      "Persistently wet soil",
      "High humidity with low circulation",
    ],
    solutions: [
      "Prune damaged leaves and isolate if needed",
      "Water at soil level only",
      "Use a safe fungicidal treatment if the spread continues",
    ],
    prevention: [
      "Give plants breathing room",
      "Avoid overcrowding humid corners",
      "Keep foliage dry during watering",
    ],
    relatedCareTips: ["pest_control", "watering"],
    contextBoosts: {
      seasons: ["monsoon"],
      soilStates: ["wet"],
    },
  },
  {
    id: "sap_pests",
    title: "Sap-Sucking Pest Infestation",
    summary:
      "Sticky residue, white clusters, or tiny bugs often mean a sap-sucking pest problem that should be isolated and treated early.",
    severity: "medium",
    symptoms: ["aphids", "scale", "mealybugs", "yellow_leaves", "curling"],
    immediateActions: [
      "Isolate the plant from the rest of your collection.",
      "Check stems, leaf joints, and leaf undersides closely.",
      "Wipe or rinse visible pests before treatment.",
    ],
    causes: [
      "New plants carrying pests indoors",
      "Plant stress making it easier for pests to spread",
      "Overfeeding soft new growth",
    ],
    solutions: [
      "Use insecticidal soap or neem-based treatment",
      "Repeat treatment on schedule, not just once",
      "Inspect neighboring plants for spread",
    ],
    prevention: [
      "Quarantine new plants before mixing them in",
      "Inspect foliage weekly",
      "Avoid excessive fertilizer on soft growth",
    ],
    relatedCareTips: ["pest_control"],
    contextBoosts: {
      plantTypes: ["flowering", "tropical"],
      seasons: ["spring", "summer"],
    },
  },
  {
    id: "spider_mites",
    title: "Spider Mites",
    summary:
      "Fine webbing with yellowing or dry-looking leaves usually points to spider mites, especially in warm and dry conditions.",
    severity: "high",
    symptoms: ["spider_mites", "yellow_leaves", "brown_tips", "curling", "low_humidity"],
    immediateActions: [
      "Isolate the plant right away.",
      "Rinse the leaves, especially the undersides.",
      "Increase humidity while starting pest treatment.",
    ],
    causes: [
      "Very dry air",
      "Warm indoor conditions",
      "Plants under environmental stress",
    ],
    solutions: [
      "Use miticide or neem-based treatment repeatedly",
      "Wipe leaves and monitor new growth closely",
      "Raise humidity to reduce future flare-ups",
    ],
    prevention: [
      "Keep humidity higher for sensitive plants",
      "Inspect leaf undersides weekly",
      "Address dryness before pests gain momentum",
    ],
    relatedCareTips: ["pest_control", "indoor"],
    contextBoosts: {
      environments: ["bedroom", "office"],
      seasons: ["winter", "summer"],
    },
  },
  {
    id: "fungus_gnats",
    title: "Fungus Gnats From Wet Soil",
    summary:
      "Small flying insects around the soil usually mean the potting mix is staying damp too long and supporting fungus gnat larvae.",
    severity: "low",
    symptoms: ["fungus_gnats", "overwatering", "yellow_leaves", "root_rot"],
    immediateActions: [
      "Let the surface dry more between waterings.",
      "Use sticky traps to catch adult gnats.",
      "Clear dead debris from the soil surface.",
    ],
    causes: [
      "Consistently damp soil",
      "Organic debris in the pot",
      "Poor drainage or low airflow",
    ],
    solutions: [
      "Reduce watering frequency",
      "Top dress with sand or a drier surface layer",
      "Treat larvae if the infestation continues",
    ],
    prevention: [
      "Avoid keeping the top layer constantly wet",
      "Use a faster-draining mix for heavy pots",
      "Keep soil surfaces cleaner",
    ],
    relatedCareTips: ["watering", "pest_control"],
    contextBoosts: {
      seasons: ["monsoon"],
      soilStates: ["wet"],
    },
  },
  {
    id: "cold_draft",
    title: "Cold Damage or Draft Stress",
    summary:
      "Cold windows, night drafts, or direct AC can shock foliage and cause drooping, leaf drop, and dark damaged patches.",
    severity: "medium",
    symptoms: ["cold_damage", "draft", "drooping", "falling"],
    immediateActions: [
      "Move the plant away from cold windows or direct vents.",
      "Keep temperatures more stable for the next few days.",
      "Do not overwater a shocked plant.",
    ],
    causes: [
      "Cold night temperatures near glass",
      "AC or heater drafts",
      "Rapid temperature swings",
    ],
    solutions: [
      "Shift to a more stable room position",
      "Trim damaged tissue after the plant stabilizes",
      "Keep care gentle while it recovers",
    ],
    prevention: [
      "Keep sensitive plants away from drafts",
      "Monitor winter placements closely",
      "Avoid sudden environment changes",
    ],
    relatedCareTips: ["indoor"],
    contextBoosts: {
      environments: ["window", "balcony"],
      seasons: ["winter"],
    },
  },
  {
    id: "water_quality",
    title: "Water Quality or Salt Buildup",
    summary:
      "Brown tips with otherwise stable leaves can point to mineral-heavy water, chlorine sensitivity, or fertilizer salt buildup.",
    severity: "low",
    symptoms: ["water_quality", "brown_tips", "pale"],
    immediateActions: [
      "Flush the soil thoroughly once to remove excess salts.",
      "Switch to filtered, rested, or rainwater if possible.",
      "Pause fertilizer briefly if you recently fed the plant.",
    ],
    causes: [
      "Tap water sensitivity",
      "Fertilizer salts collecting in the soil",
      "Infrequent flushing of the potting mix",
    ],
    solutions: [
      "Use gentler water where possible",
      "Flush the soil monthly for sensitive plants",
      "Reduce fertilizer strength if needed",
    ],
    prevention: [
      "Monitor salt-sensitive plants closely",
      "Use lighter fertilizer doses more consistently",
      "Occasionally rinse out mineral buildup",
    ],
    relatedCareTips: ["watering", "fertilizing"],
  },
  {
    id: "chewing_damage",
    title: "Chewing Pest Damage",
    summary:
      "Visible holes or bites usually mean physical chewing damage from pests rather than a watering problem.",
    severity: "medium",
    symptoms: ["holes"],
    immediateActions: [
      "Inspect the plant at night and underneath leaves.",
      "Separate it if you suspect an active pest source.",
      "Remove badly damaged foliage if needed.",
    ],
    causes: [
      "Chewing insects or caterpillars",
      "Outdoor exposure on balconies or windows",
      "A hidden pest not yet identified",
    ],
    solutions: [
      "Inspect repeatedly until you find the source",
      "Use an appropriate pest-control treatment",
      "Protect the plant from repeat exposure",
    ],
    prevention: [
      "Inspect outdoor or balcony plants more often",
      "Clean foliage and pots regularly",
      "Catch damage early before it spreads",
    ],
    relatedCareTips: ["pest_control", "outdoor"],
    contextBoosts: {
      environments: ["balcony"],
      seasons: ["summer", "monsoon"],
    },
  },
];

export const defaultDiagnosis: DiagnosisProfile = {
  id: "general_stress",
  title: "General Plant Stress",
  summary:
    "Your plant is showing stress, but the current symptom mix does not point strongly to one issue. Start with the basics and re-check conditions.",
  severity: "medium",
  symptoms: [],
  immediateActions: [
    "Inspect roots, soil moisture, and light placement together.",
    "Avoid making too many changes at once.",
    "Watch for new symptoms over the next few days.",
  ],
  causes: [
    "A mix of environmental stress and care imbalance",
    "Early-stage issues that are not obvious yet",
    "More than one small issue happening together",
  ],
  solutions: [
    "Review watering, light, and airflow first",
    "Look under leaves and around the soil surface",
    "Use care tips for the most likely category",
  ],
  prevention: [
    "Track care changes more consistently",
    "Check the plant weekly instead of waiting for major decline",
    "Adjust routines slowly and observe the result",
  ],
  relatedCareTips: ["indoor", "watering"],
};

export const healthyPlantHabits: PlantHealthHabit[] = [
  {
    title: "Check Soil Before Watering",
    description:
      "The fastest way to avoid most plant problems is to water based on soil moisture, not on memory alone.",
    icon: Droplets,
  },
  {
    title: "Match The Plant To The Room",
    description:
      "A healthy plant in the wrong room will still struggle. Light and airflow matter more than decoration.",
    icon: Sun,
  },
  {
    title: "Inspect Weekly",
    description:
      "Look under leaves, around the soil, and near stems once a week so you catch pests and stress before they spread.",
    icon: Wind,
  },
];
