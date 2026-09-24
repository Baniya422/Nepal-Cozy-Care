export type CuratedBlog = {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  author_role: string;
  author_image: string;
  author_bio?: string;
  meta_title?: string;
  meta_description?: string;
  category: string;
  read_time: string;
  views: number;
  published_at: string;
  is_featured?: boolean;
  is_top_trend?: boolean;
  tags: string[];
  tips?: string[];
  takeaways?: string[];
};

export const CURATED_BLOGS: CuratedBlog[] = [
  {
    id: 101,
    title: "The Complete Kathmandu Indoor Gardening Handbook: Thriving Plants Across Seasons",
    excerpt:
      "From the crisp, dry winter winds of the Kathmandu Valley to the lush humidity of the monsoon peak, learn how to calibrate indoor sunlight, soil aeration, and watering cadence for thriving greenery.",
    content: `Indoor gardening in Nepal offers a unique reward. With Kathmandu's subtropical highland climate, our homes experience distinct seasonal rhythms that directly influence plant metabolism, transpiration, and root growth.

### Navigating the Valley's Microclimates
Most indoor houseplants originate from tropical understories—meaning they adore gentle indirect sunlight, steady warmth, and high ambient moisture. However, our winter months often bring dry indoor air and chilly overnight drops, while the monsoon brings saturated humidity. Understanding this duality is the key to thriving rather than merely surviving.

> "A plant in your home is not just an aesthetic decoration—it is a living ecosystem that mirrors the seasons outside your window."

### The Golden Rules for Indoor Success
1. **Light is Food, Water is Metabolism**: Always position foliage within 2 to 4 feet of an east-facing or south-facing window. If leaves begin to look pale or stretched, they are asking for stronger ambient light.
2. **The Finger Moisture Test**: Discard rigid watering schedules. Always insert your finger two inches into the topsoil. If it feels cool and damp, wait two more days.
3. **Aerated Soil is Non-Negotiable**: Standard garden clay compacts quickly in pots. Mix equal parts potting soil, perlite, and coconut coir to allow roots to breathe freely.

By aligning your care routine with local climate patterns, your living space will transform into a restorative urban oasis throughout the year.`,
    image: "/images/blog-hero-lush.jpg",
    author: "Sarah Johnson",
    author_role: "Head Botanist & Founder",
    author_image: "/images/team-sarah.jpg",
    category: "Indoor Plants",
    read_time: "6 min read",
    views: 3420,
    published_at: "2026-09-08",
    is_featured: false,
    is_top_trend: true,
    tags: ["KathmanduGardening", "UrbanSanctuary", "SeasonalCare", "IndoorPlants"],
    tips: [
      "Wipe large leaves with a soft damp microfiber cloth every two weeks to remove dust and maximize photosynthesis.",
      "Never allow potted plants to sit in standing water trays after deep watering.",
    ],
    takeaways: [
      "Seasonal transitions in Nepal require adjusting your watering schedule.",
      "Aerated, free-draining soil prevents root rot even in humid monsoon weather.",
      "South and east-facing exposures provide the most gentle, consistent ambient light.",
    ],
  },
  {
    id: 102,
    title: "Monstera Deliciosa Mastery: How to Get Huge Fenestrations and Aerial Roots",
    excerpt:
      "Why aren't your Monstera leaves splitting? We break down light lux requirements, moss pole training, and the secret nutrient blend for lush tropical leaves.",
    content: `The Swiss Cheese plant (*Monstera deliciosa*) is undeniably the monarch of modern indoor aesthetics. Yet one question plagues plant parents more than any other: *Why are my new leaves coming in solid without fenestrations?*

### The Science of Leaf Splitting
In its native jungle habitat, Monstera vines scramble up giant trees. Fenestrations (the natural holes and splits in the leaf blade) evolved to allow torrential tropical winds to pass through without tearing the foliage, while allowing lower canopy leaves to catch dappled sun rays.

If your Monstera is producing solid leaves, the plant is signaling that light intensity is too low. Plants will only expend the energy required to create majestic split leaves when provided with bright, indirect light for at least 6 to 8 hours daily.

> "Feed the light, support the climb, and the fenestrations will follow naturally."

### Training on a Coir or Moss Pole
Monstera is an epiphyte—it relies on aerial roots to anchor and absorb atmospheric moisture. Providing a sturdy moss or coco-coir pole mimics the trunk of a tree. Gently secure the main vine stem using soft plant Velcro. As the aerial roots burrow into the pole, leaf size will double within months.`,
    image: "/images/blog-leaf-macro.jpg",
    author: "Michael Chen",
    author_role: "Nursery Director",
    author_image: "/images/team-michael.jpg",
    category: "Plant Care & Hacks",
    read_time: "5 min read",
    views: 2890,
    published_at: "2026-09-05",
    is_featured: false,
    is_top_trend: true,
    tags: ["MonsteraCare", "LeafFenestration", "MossPole", "PlantHacks"],
    tips: [
      "Tuck mature aerial roots back into the potting soil or direct them into a moist moss pole for rapid growth.",
      "Fertilize with a balanced liquid feed diluted to half-strength during the warm growing months.",
    ],
    takeaways: [
      "Fenestrations require bright indirect light—low light yields small, solid leaves.",
      "Vertical climbing support stimulates the development of much larger leaves.",
    ],
  },
  {
    id: 103,
    title: "Monsoon Moisture & Root Rot Prevention: The Ultimate Survival Guide",
    excerpt:
      "High humidity can be a double-edged sword. Here is how to prevent fungal mold, soggy potting soil, and fungus gnats during heavy Nepal monsoon rains.",
    content: `Nepal's monsoon brings lush cloud forests and abundant rainfall, which tropical houseplants adore. However, indoors, sustained relative humidity above 85% paired with stagnant airflow can quickly invite root rot and fungal gnats.

### Recognizing Early Root Stress
Root rot begins silently beneath the soil line when roots suffocate from lack of oxygen. The first outward sign is paradoxically yellowing, limp leaves that look dehydrated even though the soil is soaking wet. If stems feel soft or the pot gives off a sour, swampy odor, immediate intervention is necessary.

### Immediate Emergency Action Plan
1. **Unpot and Inspect**: Gently tip the plant out and wash away the soil. Healthy roots are firm and creamy-white; rotted roots are dark brown, stringy, and mushy.
2. **Sterilize and Prune**: Use sharp shears sterilized with rubbing alcohol to prune away all diseased roots until only healthy tissue remains.
3. **Hydrogen Peroxide Rinse**: Dip remaining roots in a diluted 3% hydrogen peroxide solution (1 part peroxide to 4 parts water) to kill anaerobic bacteria.
4. **Repot into Fresh, Chunky Mix**: Never reuse the contaminated soil. Use fresh airy potting mix rich in pumice or perlite.`,
    image: "/images/snake.jpg",
    author: "Emily Rodriguez",
    author_role: "Plant Health Specialist",
    author_image: "/images/team-emily.jpg",
    category: "Plant Doctor",
    read_time: "4 min read",
    views: 2150,
    published_at: "2026-08-28",
    is_featured: false,
    is_top_trend: true,
    tags: ["PlantDoctor", "RootRot", "MonsoonCare", "PlantHealth"],
    tips: [
      "Keep an oscillating fan running on low in plant rooms during monsoon weeks to prevent fungal spores from settling.",
      "Switch from plastic pots to breathable unglazed terracotta to accelerate soil drying.",
    ],
    takeaways: [
      "Watering frequency must be reduced by at least 40% during overcast monsoon weeks.",
      "Air circulation is your number one defense against fungal mold and leaf spot.",
    ],
  },
  {
    id: 104,
    title: "Water Propagation Secrets: How to Clone Your Plants in Beautiful Glass Jars",
    excerpt:
      "Turn a single stem cutting into a thriving urban nursery. Master node identification, clean callusing, and the transition from water to soil.",
    content: `There is nothing quite as satisfying as watching fresh, pearly white roots emerge inside a clear glass jar on your windowsill. Water propagation is accessible, beautiful, and the ultimate way to share plant love with friends.

### Finding the Magic Node
A node is the swollen joint on a plant stem where leaves, aerial roots, and buds originate. Leaves without a node (with a few exceptions like Sansevieria) cannot generate a new root system. Always make your clean cut approximately 1/4 inch below a healthy node using clean shears.

> "Patience is a gardener's quiet superpower. Give a cutting clean water, gentle warmth, and watch life unfold."

### The Transition to Soil
Once water roots reach 2 to 3 inches in length with secondary branching, it is time to pot them up. Water roots are delicate and adapted to liquid; keep the new potting soil evenly moist for the first 10 days to help the root system adapt without shock.`,
    image: "/images/rubber.jpg",
    author: "David Thompson",
    author_role: "Propagation Master",
    author_image: "/images/team-david.jpg",
    category: "Soil & Propagation",
    read_time: "5 min read",
    views: 1940,
    published_at: "2026-08-20",
    is_featured: false,
    tags: ["Propagation", "PlantCloning", "GlassJarGardening", "GreenLife"],
    tips: [
      "Change the propagation water every 5 to 7 days to maintain high dissolved oxygen levels.",
      "Add a single chunk of horticultural charcoal to the glass jar to keep water sweet and inhibit algae.",
    ],
    takeaways: [
      "Always cut beneath a leaf node; stems without nodes will not produce roots.",
      "Transitioning to soil requires keeping the mix slightly moist during the initial week.",
    ],
  },
  {
    id: 105,
    title: "Top 7 Air-Purifying Plants That Require Almost Zero Sunlight",
    excerpt:
      "No bright balcony? No problem. Snake plants, ZZ plants, and Cast Iron plants flourish in cozy bedrooms, quiet hallways, and shaded city apartments.",
    content: `Urban life often means living in north-facing flats, inner apartment rooms, or spaces with small windows. Fortunately, nature has evolved resilient botanical champions that naturally dwell on deep forest floors with minimal daylight.

### The Unstoppable Trio
1. **Sansevieria (Snake Plant / Mother-in-Law's Tongue)**: Converts carbon dioxide to oxygen at night, making it ideal for bedrooms. Requires water only once every 3 to 4 weeks.
2. **Zamioculcas zamiifolia (ZZ Plant)**: Features glossy, waxy leaves that hold moisture in underground rhizomes. Can tolerate low-light corners for months with ease.
3. **Aglaonema (Chinese Evergreen)**: Offers stunning variegated foliage in silver, cream, and pink tones that stays vibrant in indirect glow.

These species are forgiving, visually stunning, and serve as natural air purifiers filtering everyday indoor compounds.`,
    image: "/images/about-plants.jpg",
    author: "Sarah Johnson",
    author_role: "Head Botanist",
    author_image: "/images/team-sarah.jpg",
    category: "Urban Living & Decor",
    read_time: "4 min read",
    views: 3100,
    published_at: "2026-08-14",
    is_featured: false,
    tags: ["LowLightPlants", "AirPurifying", "ApartmentLiving", "EasyCare"],
    tips: [
      "Lower light means slower water consumption. Always let the potting soil dry out completely between waterings.",
    ],
    takeaways: [
      "Snake plants and ZZ plants are virtually indestructible in low light.",
      "Overwatering is the only true threat to low-light foliage.",
    ],
  },
  {
    id: 106,
    title: "Winter Warmth: Protecting Tropical Foliage from Cold Valley Drafts",
    excerpt:
      "When temperatures drop at night in Nepal, tropical indoor plants go into survival mode. Follow our insulation, humidity tray, and watering reduction checklist.",
    content: `As December and January bring cold Himalayan drafts down into Kathmandu Valley, our homes cool significantly at night. Tropical houseplants that thrive at 22°C to 28°C can experience cold shock if exposed to windows that chill below 10°C.

### Practical Steps to Winterize Your Indoor Plants
- **Pull Plants Away from Glass**: Windows act like giant ice packs after sunset. Move delicate foliage 1 to 2 feet away from window glass.
- **Stop Feeding and Cut Back Water**: Growth slows dramatically during winter dormancy. Fertilizing during cold months can burn dormant root hairs.
- **Create Warmth and Humidity Trays**: Fill a shallow saucer with pebbles and water, placing the plant pot on top of the stones. The evaporating water surrounds the foliage with a gentle humidity buffer without wetting roots.`,
    image: "/images/winter-garden.png",
    author: "Emily Rodriguez",
    author_role: "Plant Health Specialist",
    author_image: "/images/team-emily.jpg",
    category: "Seasonal Advice",
    read_time: "5 min read",
    views: 1820,
    published_at: "2026-08-02",
    is_featured: false,
    tags: ["WinterCare", "ColdDrafts", "HumidityTrays", "NepalSeasons"],
    tips: [
      "Water your plants in the morning using room-temperature water so the roots don't freeze from tap water chill.",
    ],
    takeaways: [
      "Keep leaves away from icy window panes during winter nights.",
      "Hold off on fertilizing until new spring shoots emerge in March.",
    ],
  },
];

export const DAILY_BOTANICAL_TIPS = [
  {
    season: "Kathmandu Valley Climate",
    title: "Morning Sunlight Window Hack",
    text: "Position delicate ferns and calatheas near East-facing windows. The morning sun provides gentle photosynthetic energy without the harsh ultraviolet rays of afternoon heat.",
  },
  {
    season: "Monsoon Moisture Advisory",
    title: "Preventing Root Rot in Humid Weeks",
    text: "When relative humidity climbs past 80%, extend watering intervals by 4 to 6 days. Aerate the topsoil using a chopstick to allow oxygen down to the root ball.",
  },
  {
    season: "Urban Living & Airflow",
    title: "The Clean Leaf Shower",
    text: "Dust buildup reduces a plant's photosynthesis by up to 35%. Take broad-leaf plants into the shower once a month for a lukewarm rinse to wash away city soot.",
  },
  {
    season: "Winter Insulation Hack",
    title: "Avoid Chilled Tap Water Shock",
    text: "Never use cold tap water during December and January mornings. Let your watering can sit at room temperature overnight before feeding your green companions.",
  },
  {
    season: "Propagation Pro Tip",
    title: "The Single Cinnamon Dip",
    text: "Before placing fresh stem cuttings into soil, dust the wound lightly with organic cinnamon powder. It is a natural antifungal agent that prevents stem decay.",
  },
];
