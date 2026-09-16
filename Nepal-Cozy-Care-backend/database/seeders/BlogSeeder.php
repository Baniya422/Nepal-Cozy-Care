<?php

namespace Database\Seeders;

use App\Models\Blog;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BlogSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first() ?? User::first();

        $blogs = [
            [
                'title' => 'The Complete Kathmandu Indoor Gardening Handbook: Thriving Plants Across Seasons',
                'excerpt' => 'From the crisp, dry winter winds of the Kathmandu Valley to the lush humidity of the monsoon peak, learn how to calibrate indoor sunlight, soil aeration, and watering cadence for thriving greenery.',
                'content' => "Indoor gardening in Nepal offers a unique reward. With Kathmandu's subtropical highland climate, our homes experience distinct seasonal rhythms that directly influence plant metabolism, transpiration, and root growth.\n\n### Navigating the Valley's Microclimates\nMost indoor houseplants originate from tropical understories—meaning they adore gentle indirect sunlight, steady warmth, and high ambient moisture. However, our winter months often bring dry indoor air and chilly overnight drops, while the monsoon brings saturated humidity. Understanding this duality is the key to thriving rather than merely surviving.\n\n> \"A plant in your home is not just an aesthetic decoration—it is a living ecosystem that mirrors the seasons outside your window.\"\n\n### The Golden Rules for Indoor Success\n1. **Light is Food, Water is Metabolism**: Always position foliage within 2 to 4 feet of an east-facing or south-facing window. If leaves begin to look pale or stretched, they are asking for stronger ambient light.\n2. **The Finger Moisture Test**: Discard rigid watering schedules. Always insert your finger two inches into the topsoil. If it feels cool and damp, wait two more days.\n3. **Aerated Soil is Non-Negotiable**: Standard garden clay compacts quickly in pots. Mix equal parts potting soil, perlite, and coconut coir to allow roots to breathe freely.\n\nBy aligning your care routine with local climate patterns, your living space will transform into a restorative urban oasis throughout the year.",
                'image' => '/images/blog-hero-lush.jpg',
                'author' => 'Sarah Johnson',
                'category' => 'Indoor Plants',
                'views' => 3420,
                'is_published' => true,
                'published_at' => now()->subDays(4),
                'is_top_trend' => true,
                'is_top_story' => true,
            ],
            [
                'title' => 'The Science of Watering: Why Overwatering Kills More Plants Than Drought',
                'excerpt' => 'Understanding root oxygenation, cellular turgor, and the deceptive signs of root suffocation that look identical to thirst.',
                'content' => "It is the single most common confession we hear at Cozy Care: \"I gave it so much love and water, but the leaves turned yellow and drooped anyway.\"\n\n### The Cellular Paradox of Root Rot\nWhen roots drown in waterlogged soil, they run out of oxygen. Roots require active respiration to take up water and nutrients. Without oxygen, the fine root hairs rot and decompose. The plant literally dies of dehydration in a pot filled with water, because it no longer has functional roots to absorb moisture!\n\n> \"Never water on a calendar schedule. Water according to living cellular demand.\"\n\n### Diagnosis: Overwatering vs Underwatering\n- **Overwatered**: Soft, limp, yellowish leaves that drop easily; spongy stems; soil smells earthy or sour.\n- **Underwatered**: Crispy, papery foliage; dry pot weight; leaves perk up within 3 hours after deep saturation.\n\n### Recovery Protocol\nIf you suspect root rot, gently unpot the plant, rinse away mushy roots with room temperature water, prune black/brown decayed roots with sterilized shears, and repot into fresh perlite-rich mix.",
                'image' => '/images/blog-leaf-macro.jpg',
                'author' => 'Dr. Aris Thorne',
                'category' => 'Plant Care & Hacks',
                'views' => 2890,
                'is_published' => true,
                'published_at' => now()->subDays(6),
                'is_top_trend' => true,
                'is_top_story' => false,
            ],
            [
                'title' => 'Monstera Deliciosa: Achieving Fenestrations & Massive Aerial Roots',
                'excerpt' => 'Unlock the secret to huge split leaves, sturdy moss poles, and robust aerial root training in residential apartments.',
                'content' => "Monstera deliciosa is the quintessential botanical statement piece. Yet many plant parents wonder why their juvenile specimen continues to produce plain heart-shaped leaves without the iconic fenestrations (holes and splits).\n\n### The Secret is Luminous Light\nIn natural rainforests, Monstera vines scramble up tree trunks toward the canopy light. Fenestrations evolved to let sunlight pass through to lower foliage while allowing heavy tropical downpours to pass through without tearing large leaves. If your Monstera is in low light, it will never split.\n\n### Step-by-Step Training\n1. **Provide a Sturdy Support**: Install a damp sphagnum moss pole or cedar plank directly behind the main stem.\n2. **Secure the Node**: Fasten the vine using soft plant ties (never wire) just below each node.\n3. **Guide Aerial Roots**: Direct hanging aerial roots into the potting soil or into the moss pole for extra moisture uptake.",
                'image' => '/images/about-plants.jpg',
                'author' => 'Sarah Johnson',
                'category' => 'Indoor Plants',
                'views' => 1940,
                'is_published' => true,
                'published_at' => now()->subDays(8),
                'is_top_trend' => false,
                'is_top_story' => false,
            ],
            [
                'title' => 'The Ultimate Aroid Soil Mix: Goodbye Root Rot Forever',
                'excerpt' => 'A step-by-step masterclass on blending pine bark, perlite, horticultural charcoal, and coco coir for indestructible houseplants.',
                'content' => "If you purchase pre-bagged potting soil from standard garden centers, you are often buying heavy peat or dense clay soil designed for outdoor raised beds. When placed indoors in plastic or ceramic pots, this dense soil remains wet for weeks, cutting off oxygen.\n\n### The Chunky Aroid Recipe\n- 40% Chunky Orchid Pine Bark (creates aeration pockets)\n- 25% High-Grade Coconut Coir (water retention without compaction)\n- 20% Coarse Perlite or Pumice (aeration and drainage)\n- 10% Worm Castings (organic slow-release nutrients)\n- 5% Horticultural Charcoal (microbial filter & toxin absorber)\n\nBlend thoroughly with clean gardening gloves and pot into containers with ample bottom drainage holes.",
                'image' => '/images/rubber.jpg',
                'author' => 'Dr. Aris Thorne',
                'category' => 'Soil & Propagation',
                'views' => 1520,
                'is_published' => true,
                'published_at' => now()->subDays(10),
                'is_top_trend' => false,
                'is_top_story' => false,
            ],
            [
                'title' => 'Winter Plant Survival: Protecting Foliage from Cold Drafts & Low Light',
                'excerpt' => 'How to navigate heater drying, shorter daylight hours, and winter dormancy without losing your beloved tropical collection.',
                'content' => "As temperatures dip across the valley between November and February, tropical houseplants slow down their growth cycle and enter a semi-dormant state.\n\n### Winter Adjustments\n1. **Move Away From Cold Windowpanes**: Glass conducts exterior chill; leaves touching the glass can experience frost shock.\n2. **Elevate Off Concrete Floors**: Cold floors chill the root ball. Use wooden saucers or plant stands.\n3. **Cut Watering in Half**: With lower evaporation, pots stay wet twice as long. Test with a wooden skewer before giving any water.\n4. **Wipe Leaves Frequently**: Dust accumulation combined with weak winter sunlight deprives plants of crucial energy.",
                'image' => '/images/winter-garden.png',
                'author' => 'Sarah Johnson',
                'category' => 'Seasonal Advice',
                'views' => 2130,
                'is_published' => true,
                'published_at' => now()->subDays(12),
                'is_top_trend' => true,
                'is_top_story' => false,
            ],
            [
                'title' => 'Snake Plant: The Indestructible Air Purifier for Low-Light Bedrooms',
                'excerpt' => 'Why Sansevieria is the reigning champion of resilient indoor greenery, and how to propagate leaf cuttings in water.',
                'content' => "The Snake Plant (Sansevieria / Dracaena trifasciata) is legendary for good reason: it tolerates near-total neglect, low light, and dry winter air.\n\n### Crassulacean Acid Metabolism (CAM)\nUnlike most houseplants that release carbon dioxide during the night, Sansevieria performs CAM photosynthesis. It opens its stomata exclusively at night to capture carbon dioxide, releasing clean oxygen while you sleep—making it the gold standard bedroom plant.\n\n### Propagation in Water\nCut a healthy leaf into 3-inch V-shaped segments, let the cut callus for 24 hours, and submerge the bottom tip in a glass of clean water. Refresh weekly until roots sprout in 4 to 6 weeks!",
                'image' => '/images/snake.jpg',
                'author' => 'Pooja Shrestha',
                'category' => 'Indoor Plants',
                'views' => 1780,
                'is_published' => true,
                'published_at' => now()->subDays(14),
                'is_top_trend' => false,
                'is_top_story' => false,
            ],
            [
                'title' => 'Pet-Safe Houseplants: Creating a Non-Toxic Urban Jungle for Cats & Dogs',
                'excerpt' => 'Curate a gorgeous verdant apartment without risking your furry companions with ASPCA-approved non-toxic species.',
                'content' => "Plant parenthood and pet parenthood should go hand-in-hand. Many popular houseplants like Monsteras and Philodendrons contain insoluble calcium oxalate crystals that cause oral irritation if chewed.\n\n### Pet-Friendly Champions\n- **Spider Plant (Chlorophytum comosum)**: Completely non-toxic to cats and dogs, plus air purifying!\n- **Boston Ferns & Maidenhairs**: Delicate, feathery fronds that are 100% pet safe.\n- **Calatheas & Marantas (Prayer Plants)**: Stunning painterly foliage with zero animal toxicity.\n\nElevate toxic statement plants on hanging macrame planters or high wall shelves away from curious paws.",
                'image' => '/images/spider.jpg',
                'author' => 'Dr. Aris Thorne',
                'category' => 'Pet Friendly',
                'views' => 2410,
                'is_published' => true,
                'published_at' => now()->subDays(16),
                'is_top_trend' => true,
                'is_top_story' => false,
            ],
            [
                'title' => 'Water Propagation 101: Multiplying Monsteras & Pothos from Single Stem Nodes',
                'slug' => 'water-propagation-101-nodes',
                'excerpt' => 'A visual step-by-step masterclass on identifying growth nodes, making clean 45-degree cuts, and watching fresh white roots sprout.',
                'content' => "Multiplying your plant collection for free is one of the most rewarding joys of indoor gardening.\n\n### Finding the Node\nA node is the swollen brown bump or junction along a vine where leaves, aerial roots, and dormant buds emerge. Cuttings without a node will never grow new vines!\n\n### 3 Golden Rules\n1. Use sterilized pruning shears to make a clean cut 1/2 inch below a healthy node.\n2. Submerge only the node in room-temperature water; keep foliage elevated above the rim.\n3. Change the water weekly to maintain dissolved oxygen levels.",
                'image' => '/images/about-plants.jpg',
                'author' => 'Sarah Johnson',
                'category' => 'Soil & Propagation',
                'views' => 1950,
                'is_published' => true,
                'published_at' => now()->subDays(18),
                'is_top_trend' => false,
                'is_top_story' => false,
            ],
            [
                'title' => 'The Art of Terracotta: Why Breathable Clay Outperforms Plastic Pots',
                'excerpt' => 'Understand clay transpiration, natural root cooling, and why terracotta is the ultimate insurance policy against overwatering.',
                'content' => "Plastic nursery pots trap 100% of moisture inside. If you accidentally overwater, soil stays soggy for weeks.\n\n### The Terracotta Advantage\nNatural unglazed terracotta clay is porous. Moisture wicks through the pot walls and evaporates into ambient room air, allowing fresh oxygen to circulate continuously through root tips. In humid climates like Nepal's monsoon, terracotta is your greatest defense against root rot.",
                'image' => '/images/pot2.jpg',
                'author' => 'Pooja Shrestha',
                'category' => 'Pots & Styling',
                'views' => 1630,
                'is_published' => true,
                'published_at' => now()->subDays(20),
                'is_top_trend' => false,
                'is_top_story' => false,
            ],
        ];

        foreach ($blogs as $blog) {
            $slug = Str::slug($blog['title']);
            Blog::updateOrCreate(
                ['slug' => $slug],
                array_merge($blog, [
                    'user_id' => $admin?->id,
                ])
            );
        }
    }
}
