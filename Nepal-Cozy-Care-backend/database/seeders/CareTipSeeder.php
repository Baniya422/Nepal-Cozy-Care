<?php

namespace Database\Seeders;

use App\Models\CareTip;
use App\Models\Plant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CareTipSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first() ?? User::first();
        if (!$admin) {
            return;
        }

        $monstera = Plant::where('name', 'Monstera Deliciosa')->first();
        $snake = Plant::where('name', 'Snake Plant Laurentii')->first();
        $rubber = Plant::where('name', 'Rubber Tree Burgundy')->first();
        $lily = Plant::where('name', 'Peace Lily Sensation')->first();
        $aloe = Plant::where('name', 'Organic Aloe Vera')->first();
        $spider = Plant::where('name', 'Variegated Spider Plant')->first();

        $tips = [
            // ==================== WATERING 101 ====================
            [
                'title' => 'The Golden Rule of Finger-Testing Soil Moisture',
                'slug' => 'golden-rule-soil-moisture-test',
                'category' => 'watering',
                'difficulty' => 'beginner',
                'excerpt' => 'Never water on a calendar schedule. Learn the simple 2-inch tactile test that prevents 90% of houseplant deaths.',
                'content' => "Rigid weekly watering schedules cause more indoor plant fatalities than underwatering. Ambient room humidity, seasonal temperature shifts, and container porosity dictate water absorption speed.\n\n### How to Test Accurately\n1. Gently insert your index finger two inches into the potting medium near the mid-rim.\n2. If the soil feels cool, dark, and sticks to your skin, wait 2 to 3 days before re-checking.\n3. If it feels completely dry and crumbly through the top 2 inches, take your plant to the sink or use a long-spout watering can to saturate until water drains freely from the bottom holes.",
                'image' => '/images/blog-leaf-macro.jpg',
                'plant_ids' => $monstera ? [$monstera->id] : [],
                'views_count' => 520,
                'is_published' => true,
                'published_at' => now()->subDays(15),
            ],
            [
                'title' => 'Bottom Watering Masterclass: Deep Hydration Without Crown Rot',
                'slug' => 'bottom-watering-masterclass',
                'category' => 'watering',
                'difficulty' => 'beginner',
                'excerpt' => 'Discover how sub-irrigation encourages deeper root growth, prevents surface mold, and keeps sensitive leaf crowns dry.',
                'content' => "Bottom watering uses capillary action to draw water up from the bottom drainage holes directly to root level.\n\n### Why It Works So Well\n- **Protects Stems & Leaves**: Prevents crown rot on plants like African Violets and Peace Lilies.\n- **Deters Fungus Gnats**: Keeps the top 1 inch of soil dry, depriving fungus gnat larvae of moisture.\n- **Encourages Deep Roots**: Roots actively grow downwards chasing moisture.\n\n### Step-by-Step\nFill a shallow basin with 2 inches of room-temperature water. Place the potted plant in the basin for 15–20 minutes. Once the topsoil feels faintly cool to the touch, lift the pot, allow it to drain thoroughly for 5 minutes, and return to its saucer.",
                'image' => '/images/can.jpg',
                'plant_ids' => $lily ? [$lily->id] : [],
                'views_count' => 430,
                'is_published' => true,
                'published_at' => now()->subDays(12),
            ],
            [
                'title' => 'Tap Water vs Filtered: Preventing Brown Crunchy Leaf Tips',
                'slug' => 'tap-water-vs-filtered-water',
                'category' => 'watering',
                'difficulty' => 'beginner',
                'excerpt' => 'Does municipal or well water harm delicate plants? Understand chlorine, fluoride, and salt sensitivity on tropical houseplants.',
                'content' => "Notice crispy, brown tips on your Spider Plants, Calatheas, or Peace Lilies? Mineral sensitivity is frequently the hidden culprit.\n\n### Chlorine and Hard Minerals\nMunicipal tap water contains chlorine and dissolved calcium salts. Over time, these minerals build up in pot soil and are pushed to leaf margins where they cause tip scorch.\n\n### Easy Solutions for Nepal Homes\n1. **Let Tap Water Sit**: Fill your watering can and let it rest overnight (24 hours). This allows chlorine gas to dissipate naturally.\n2. **Use Boiled & Cooled Water**: Boiling precipitates temporary water hardness.\n3. **Catch Rainwater**: During the monsoon season, rainwater is pure, slightly acidic, and packed with atmospheric nitrogen that houseplants adore.",
                'image' => '/images/spider.jpg',
                'plant_ids' => $spider ? [$spider->id] : [],
                'views_count' => 380,
                'is_published' => true,
                'published_at' => now()->subDays(10),
            ],
            [
                'title' => 'Warning Signs of Root Rot: Emergency Diagnosis & Rescue Steps',
                'slug' => 'warning-signs-of-root-rot-rescue',
                'category' => 'watering',
                'difficulty' => 'intermediate',
                'excerpt' => 'Catch root rot before it destroys your plant. How to unpot, prune decay, and reset roots in an airy mix.',
                'content' => "Root rot happens when waterlogged soil deprives roots of oxygen, allowing anaerobic fungi to attack root cells.\n\n### Symptoms\n- Yellowing lower leaves that feel soft and soggy.\n- Blackened, mushy stems near the soil line.\n- Soil smells sour or swampy.\n\n### Emergency Rescue Protocol\n1. Unpot the plant gently and rinse away all old soil with lukewarm water.\n2. Using sterilized scissors, prune away all black, limp, or foul-smelling roots until only firm white or tan roots remain.\n3. Spray remaining roots with 3% hydrogen peroxide solution to kill lingering spores.\n4. Repot in a fresh, gritty mix (50% chunky perlite/bark) and wait 3 days before lightly watering.",
                'image' => '/images/mos.jpg',
                'plant_ids' => $monstera ? [$monstera->id] : [],
                'views_count' => 670,
                'is_published' => true,
                'published_at' => now()->subDays(8),
            ],

            // ==================== LIGHTING 101 (INDOOR) ====================
            [
                'title' => 'Bright Indirect Light Demystified: Exactly Where to Place Plants',
                'slug' => 'bright-indirect-light-demystified',
                'category' => 'indoor',
                'difficulty' => 'beginner',
                'excerpt' => 'What does "bright indirect" actually mean in a home? How to measure light without expensive meters using the hand shadow test.',
                'content' => "Bright indirect sunlight is the sweet spot for 85% of all tropical houseplants.\n\n### The Simple Hand Shadow Test\nHold your hand 12 inches above a piece of white paper or the floor where your plant sits at midday:\n- **Sharp, hard shadow**: Direct sunlight (can scorch delicate leaves like Monsteras).\n- **Soft, blurred shadow with distinct shape**: Perfect bright indirect light!\n- **Faint gray smudge**: Medium light.\n- **No shadow**: Low light (suitable only for Snake Plants or ZZ plants).\n\n### Best Window Orientations in Kathmandu\n- **East-Facing**: Gentle, cool morning sun—safe right on the sill.\n- **South-Facing**: High-intensity sun—place plants 3 to 5 feet back or hang sheer curtains.\n- **North-Facing**: Steady, soft ambient light—great for ferns and peace lilies.",
                'image' => '/images/about-hero.jpg',
                'plant_ids' => $monstera ? [$monstera->id] : [],
                'views_count' => 780,
                'is_published' => true,
                'published_at' => now()->subDays(14),
            ],
            [
                'title' => 'Low-Light Champions: Plants That Thrive in Dim Rooms & Offices',
                'slug' => 'low-light-indoor-plants-guide',
                'category' => 'indoor',
                'difficulty' => 'beginner',
                'excerpt' => 'No large windows? No problem. Meet the resilient foliage species that stay green in interior corridors and bedrooms.',
                'content' => "Not every home or apartment has floor-to-ceiling sunlit windows. Fortunately, evolution in dense tropical forest understories produced plants adapted to minimal illumination.\n\n### Top Low-Light Performers\n1. **Snake Plant (Sansevieria)**: Thrives in low ambient light and produces nighttime oxygen.\n2. **Cast Iron Plant (Aspidistra)**: Virtually indestructible.\n3. **ZZ Plant (Zamioculcas)**: Waxy leaves store water and photosynthesis efficiently in low lumens.\n\n### Low-Light Care Secret\nPlants in low light transpire slowly! Cut watering by at least 50% compared to plants sitting in bright windows.",
                'image' => '/images/snake.jpg',
                'plant_ids' => $snake ? [$snake->id] : [],
                'views_count' => 610,
                'is_published' => true,
                'published_at' => now()->subDays(11),
            ],
            [
                'title' => 'Sunburn vs Variegation Loss: How to Read Light Stress on Foliage',
                'slug' => 'sunburn-vs-variegation-loss',
                'category' => 'indoor',
                'difficulty' => 'intermediate',
                'excerpt' => 'Brown bleached patches or fading white streaks? Learn whether your foliage is begging for more photons or screaming for shade.',
                'content' => "Leaves communicate light stress visibly through their coloration.\n\n### Sunburn Symptoms\n- Pale bleached white or tan parchment-like patches in the middle of leaves.\n- Edges curl inward to reduce surface area exposed to direct heat.\n- Fix: Move 2 feet back from the window glass or install sheer privacy curtains.\n\n### Insufficient Light Symptoms\n- Variegated plants (like Variegated Spider Plant or Golden Pothos) turn solid dark green as they manufacture extra chlorophyll.\n- Stems become leggy, thin, and lean heavily toward the nearest light source.\n- Fix: Move closer to an east or south-facing window.",
                'image' => '/images/spider.jpg',
                'plant_ids' => $spider ? [$spider->id] : [],
                'views_count' => 390,
                'is_published' => true,
                'published_at' => now()->subDays(7),
            ],
            [
                'title' => 'Acclimating New Houseplants to Your Home Without Sudden Shock',
                'slug' => 'acclimating-new-houseplants',
                'category' => 'indoor',
                'difficulty' => 'beginner',
                'excerpt' => 'Why nursery plants drop leaves when brought home, and the 14-day gentle transition protocol for new arrivals.',
                'content' => "Commercial nurseries provide 80% humidity, optimal automated misting, and continuous bright illumination. When you bring a plant into a standard living room, it experiences microclimate shock.\n\n### The 14-Day Transition Rule\n1. **Do not repot immediately**: Give your new plant at least 10–14 days to settle in its nursery pot.\n2. **Place in moderate indirect light first**: Avoid intense sunny windows for the first week.\n3. **Check moisture with your finger**: Do not water immediately on arrival unless soil is bone-dry.\n4. **Expect 1 or 2 bottom leaves to yellow**: This is natural energy reallocation, not disease.",
                'image' => '/images/rubber.jpg',
                'plant_ids' => $rubber ? [$rubber->id] : [],
                'views_count' => 450,
                'is_published' => true,
                'published_at' => now()->subDays(5),
            ],

            // ==================== PEST CONTROL ====================
            [
                'title' => 'Organic Neem Oil Emulsion for Aphids and Spider Mites',
                'slug' => 'organic-neem-oil-pest-spray',
                'category' => 'pest_control',
                'difficulty' => 'beginner',
                'excerpt' => 'Safely eradicate indoor pests with an eco-friendly cold-pressed neem oil recipe safe for pets and children.',
                'content' => "When tiny spider mites, scale insects, or mealybugs appear on leaf undersides, reach for natural neem oil rather than harsh chemical sprays.\n\n### The Proven Formula\n- 1 Liter of lukewarm water\n- 5ml pure cold-pressed neem oil\n- 2-3 drops of mild natural liquid soap (emulsifier)\n\nShake vigorously and spray thoroughly over both sides of the leaves and stems in the evening, away from direct sunlight.",
                'image' => '/images/blog-hero-lush.jpg',
                'plant_ids' => $lily ? [$lily->id] : [],
                'views_count' => 540,
                'is_published' => true,
                'published_at' => now()->subDays(13),
            ],
            [
                'title' => 'Fungus Gnats Eradication: Cinnamon, Sticky Traps & Dry Topsoil',
                'slug' => 'fungus-gnats-eradication-guide',
                'category' => 'pest_control',
                'difficulty' => 'beginner',
                'excerpt' => 'Tiny black flies buzzing around your potting soil? Kill larvae in the soil and trap adults with zero toxic fumes.',
                'content' => "Fungus gnats are attracted to continuously wet soil with decaying organic matter. While harmless to humans, their larvae nibble on fine tender root hairs.\n\n### 3-Step Eradication\n1. **Let Topsoil Dry Completely**: Adult gnats only lay eggs in damp top 1 inch of soil. Let top 2 inches dry out.\n2. **Dust Pure Ground Cinnamon**: Cinnamon is a natural anti-fungal agent that kills the microscopic fungus larvae feed on.\n3. **Yellow Sticky Cards**: Insert yellow sticky cards near soil level to catch adult flying gnats before they lay new eggs.",
                'image' => '/images/best-soil-for-indoor-plants-1000x667-62c2fde2d71ae_n.webp',
                'plant_ids' => $monstera ? [$monstera->id] : [],
                'views_count' => 620,
                'is_published' => true,
                'published_at' => now()->subDays(9),
            ],
            [
                'title' => 'Eliminating Cottony Mealybugs with Rubbing Alcohol Swabs',
                'slug' => 'eliminating-mealybugs-rubbing-alcohol',
                'category' => 'pest_control',
                'difficulty' => 'beginner',
                'excerpt' => 'White fuzz in your plant leaf nodes? How to spot-treat mealybugs on contact and prevent colony spread.',
                'content' => "Mealybugs look like tiny flecks of white cotton nestled in stem junctions and leaf petioles. They secrete a waxy coating that repels ordinary water sprays.\n\n### Quick Eradication Method\n1. Dip a cotton swab (Q-tip) in 70% isopropyl rubbing alcohol.\n2. Touch each white bug directly. The alcohol dissolves their protective wax and eliminates them instantly on contact.\n3. After spot treating, wipe leaves with a damp cloth.\n4. Quarantine the plant for 10 days to check for freshly hatched nymphs.",
                'image' => '/images/alovera.jpg',
                'plant_ids' => $aloe ? [$aloe->id] : [],
                'views_count' => 410,
                'is_published' => true,
                'published_at' => now()->subDays(6),
            ],
            [
                'title' => 'Scale Insects: Gentle Manual Removal and Horticultural Wash',
                'slug' => 'scale-insects-removal-and-wash',
                'category' => 'pest_control',
                'difficulty' => 'intermediate',
                'excerpt' => 'Small brown bumps along stems that don\'t rub off easily? Recognize immobile scale pests and save plant sap.',
                'content' => "Scale insects appear as smooth brown or tan shells adhered tightly to stems and leaf veins. They pierce plant vascular tissue and drink nutrient sap.\n\n### Treatment\n- Gently scrape scales off using an old soft toothbrush dipped in soapy water.\n- Follow with an organic horticultural oil or diluted neem spray.\n- Wipe sticky honeydew secretions off nearby surfaces to prevent black sooty mold.",
                'image' => '/images/rubber.jpg',
                'plant_ids' => $rubber ? [$rubber->id] : [],
                'views_count' => 320,
                'is_published' => true,
                'published_at' => now()->subDays(4),
            ],

            // ==================== FERTILIZING & SOIL ====================
            [
                'title' => 'Indoor Houseplant Fertilization: Spring & Summer Protocol',
                'slug' => 'houseplant-fertilization-protocol',
                'category' => 'fertilizing',
                'difficulty' => 'intermediate',
                'excerpt' => 'Nutrient ratios, timing, and why half-strength fertilizer beats full-strength burns every single time.',
                'content' => "Potted plants have limited root volume and cannot seek out new soil minerals. Regular feeding during active growth seasons (Chaitra to Ashwin) keeps foliage radiant and deep green.\n\nAlways dilute balanced 20-20-20 or seaweed liquid fertilizer to half the manufacturer recommendation to avoid root burn.",
                'image' => '/images/rubber.jpg',
                'plant_ids' => $monstera ? [$monstera->id] : [],
                'views_count' => 510,
                'is_published' => true,
                'published_at' => now()->subDays(14),
            ],
            [
                'title' => 'Reading Nutrient Deficiencies: Nitrogen Yellowing vs Iron Chlorosis',
                'slug' => 'reading-nutrient-deficiencies',
                'category' => 'fertilizing',
                'difficulty' => 'intermediate',
                'excerpt' => 'Not all yellow leaves mean overwatering. How to tell mobile nitrogen deficiency apart from micro-nutrient lockout.',
                'content' => "When leaves yellow, diagnosing whether it is nitrogen or micronutrients saves your plant:\n\n### Nitrogen (N) Deficiency\n- Oldest lower leaves turn uniformly pale yellow while veins also turn pale.\n- Solution: Balanced liquid nitrogen feed.\n\n### Iron (Fe) Chlorosis\n- New young leaves turn bright yellow while leaf veins remain sharp emerald green (interveinal chlorosis).\n- Solution: Chelated iron micronutrient foliar spray or lower soil pH.",
                'image' => '/images/blog-leaf-macro.jpg',
                'plant_ids' => $lily ? [$lily->id] : [],
                'views_count' => 440,
                'is_published' => true,
                'published_at' => now()->subDays(11),
            ],
            [
                'title' => 'Organic Vermicompost Tea: Gentle Nutrition for Sensitive Roots',
                'slug' => 'organic-vermicompost-tea',
                'category' => 'fertilizing',
                'difficulty' => 'beginner',
                'excerpt' => 'Brew an odorless, microbe-rich organic liquid feed at home using earthworm castings and aerated water.',
                'content' => "Earthworm castings (vermicompost) are gentle, odorless, and packed with beneficial mycorrhizae and humic acids.\n\n### Simple Cold Brew Recipe\n1. Steep 1 cup of pure vermicompost in 4 liters of clean water for 24 hours.\n2. Strain through cheesecloth or a fine sieve.\n3. Pour directly onto soil once every 2 weeks. Roots absorb organic nutrients naturally with zero risk of chemical burns.",
                'image' => '/images/best-soil-for-indoor-plants-1000x667-62c2fde2d71ae_n.webp',
                'plant_ids' => $monstera ? [$monstera->id] : [],
                'views_count' => 390,
                'is_published' => true,
                'published_at' => now()->subDays(7),
            ],
            [
                'title' => 'Flushing Soil Salts: Why Houseplants Need a Deep Rinse Every 90 Days',
                'slug' => 'flushing-soil-salts',
                'category' => 'fertilizing',
                'difficulty' => 'beginner',
                'excerpt' => 'Notice crusty white chalk on pot rims? How to leach toxic salt buildup out of root systems safely.',
                'content' => "Over months of light watering and fertilizing, fertilizer mineral salts accumulate in the potting soil, forming a whitish crystalline crust on pot edges and topsoil.\n\n### How to Flush\nTake your potted plant to a shower or balcony drain. Pour room temperature water continuously through the soil until it streams out the bottom drainage holes for 1–2 minutes. This dissolves and carries away excess salts, refreshing root respiration.",
                'image' => '/images/pot1.jpg',
                'plant_ids' => $snake ? [$snake->id] : [],
                'views_count' => 330,
                'is_published' => true,
                'published_at' => now()->subDays(3),
            ],

            // ==================== SEASONAL & CLIMATE CARE ====================
            [
                'title' => 'Monsoon Care: Humidity, Ventilation & Root Rot Prevention',
                'slug' => 'monsoon-care-humidity-and-ventilation',
                'category' => 'seasonal',
                'difficulty' => 'intermediate',
                'excerpt' => 'During Nepal\'s monsoon season, indoor air reaches 85%+ humidity. Adapt your watering and spacing to avoid fungal growth.',
                'content' => "High monsoon humidity slows down soil evaporation dramatically. Plants that drank weekly in May might only need water once every 14–18 days during July and August.\n\n### Essential Monsoon Steps\n- **Air Circulation**: Turn on ceiling fans or open windows for gentle cross-breezes.\n- **Space Them Out**: Do not pack pots tightly together. Give each plant breathing space.\n- **Hold the Fertilizer**: Most plants slow their uptake during overcast monsoon days.",
                'image' => '/images/about-plants.jpg',
                'plant_ids' => $snake ? [$snake->id] : [],
                'views_count' => 640,
                'is_published' => true,
                'published_at' => now()->subDays(12),
            ],
            [
                'title' => 'Winter Protection: Cold Draft Shielding & Reduced Hydration',
                'slug' => 'winter-protection-cold-draft-shielding',
                'category' => 'seasonal',
                'difficulty' => 'beginner',
                'excerpt' => 'Kathmandu winter nights drop near freezing. Keep tropical foliage healthy through frosty valley temperatures.',
                'content' => "Tropical plants originate from equatorial regions where temperatures rarely drop below 18°C. Kathmandu valley winters frequently reach 2°C to 5°C overnight.\n\n### Cold Protection Protocol\n1. Pull pots at least 2 feet away from exterior glass panes at dusk.\n2. Do not water in the late afternoon or evening—wet cold roots rot quickly. Only water on sunny mornings.\n3. Elevate pots off cold marble or cement floors onto wooden stands or cork mats.",
                'image' => '/images/winter-garden.png',
                'plant_ids' => $rubber ? [$rubber->id] : [],
                'views_count' => 580,
                'is_published' => true,
                'published_at' => now()->subDays(8),
            ],
            [
                'title' => 'Spring Awakening: The Ultimate Repotting & Root-Pruning Checklist',
                'slug' => 'spring-awakening-repotting-checklist',
                'category' => 'seasonal',
                'difficulty' => 'intermediate',
                'excerpt' => 'Baishakh is prime repotting season. How to loosen rootbound coils and choose the ideal container size.',
                'content' => "When roots emerge from bottom drainage holes or water runs straight through without absorbing, your plant is rootbound.\n\n### Spring Steps\n- Upgrade to a container only 1 to 2 inches wider in diameter. Never jump to an overly large pot, which holds excess water and causes root rot.\n- Gently massage the bottom root coil with clean fingers to free root tips.\n- Backfill with fresh chunky aroid mix and water deeply once.",
                'image' => '/images/pot2.jpg',
                'plant_ids' => $monstera ? [$monstera->id] : [],
                'views_count' => 490,
                'is_published' => true,
                'published_at' => now()->subDays(4),
            ],

            // ==================== OUTDOOR & BALCONY ====================
            [
                'title' => 'Kathmandu Balcony Gardening: Windbreaks, Container Weight & Drainage',
                'slug' => 'kathmandu-balcony-gardening-guide',
                'category' => 'outdoor',
                'difficulty' => 'intermediate',
                'excerpt' => 'High winds and midday valley sun can scorch balcony greenery. Design an urban terrace sanctuary that thrives.',
                'content' => "Rooftop and balcony containers dry out up to three times faster than indoor pots due to constant wind exposure.\n\n### Balcony Essentials\n- **Heavy Ceramic / Terracotta Base**: Prevents tall top-heavy plants from tipping during spring gusts.\n- **Windbreak Screens**: Position hardy bamboo, ficus, or trellised climbers on the windward side to shelter fragile foliage.\n- **Mulch the Topsoil**: Layer coconut chips or pebbles over the soil surface to conserve soil moisture.",
                'image' => '/images/about-story.jpg',
                'plant_ids' => $aloe ? [$aloe->id] : [],
                'views_count' => 460,
                'is_published' => true,
                'published_at' => now()->subDays(10),
            ],
            [
                'title' => 'Terrace Citrus & Sun-Loving Succulents: Direct Light Demands',
                'slug' => 'terrace-citrus-and-succulents',
                'category' => 'outdoor',
                'difficulty' => 'beginner',
                'excerpt' => 'How to give Aloe Vera, Kumquat, and desert succulents maximum sun exposure without overheating pot roots.',
                'content' => "Succulents and outdoor fruiting plants crave 6+ hours of unobstructed direct sun daily.\n\nEnsure clay pots are used rather than dark plastic containers, as dark plastic absorbs scorching UV heat and literally bakes root hairs on open terraces.",
                'image' => '/images/alovera.jpg',
                'plant_ids' => $aloe ? [$aloe->id] : [],
                'views_count' => 370,
                'is_published' => true,
                'published_at' => now()->subDays(2),
            ],
        ];

        foreach ($tips as $tipData) {
            CareTip::updateOrCreate(
                ['slug' => $tipData['slug']],
                array_merge($tipData, ['user_id' => $admin->id])
            );
        }
    }
}
