<?php

namespace App\Support;

class HomepageDefaults
{
    public static function get(): array
    {
        return [
            'hero' => [
                'background_image' => '/images/HomeBackground.png',
                'badge' => 'Fresh From Our Greenhouse',
                'title' => 'Bring Nature Home',
                'description' => 'Shop healthy indoor plants, discover the right plant for your room, diagnose common plant problems, and track care routines after purchase in one system built for Nepali homes.',
                'primary_cta' => ['label' => 'Explore Plants', 'path' => '/plants'],
                'secondary_cta' => ['label' => 'Find My Plant', 'path' => '/plant-finder'],
                'highlights' => [
                    'My Garden care tracking',
                    'Plant Finder quiz',
                    'Plant Health Checker',
                ],
            ],
            'features' => [
                ['title' => 'Healthy Guarantee', 'description' => 'Every plant checked before delivery'],
                ['title' => 'Plant Doctor', 'description' => 'Free care advice via WhatsApp'],
                ['title' => 'Free Delivery', 'description' => 'All over Kathmandu Valley'],
            ],
            'smart_tools' => [
                'kicker' => 'Smart Plant Care',
                'title' => 'More than shopping. A complete plant care system.',
                'description' => 'These tools help users discover, diagnose, and care for plants in one place.',
                'items' => [
                    ['title' => 'Plant Finder', 'description' => 'Match plants to sunlight, room type, and care confidence before you buy.', 'action' => 'Find My Plant', 'path' => '/plant-finder'],
                    ['title' => 'Plant Health Checker', 'description' => 'Check symptoms like yellow leaves or pests and get quick care guidance.', 'action' => 'Diagnose Issues', 'path' => '/plant-health-checker'],
                    ['title' => 'My Garden Dashboard', 'description' => 'Track watering, fertilizer routines, and personal notes after purchase.', 'action' => 'Open My Garden', 'path' => '/my-garden'],
                ],
            ],
            'seasonal' => [
                'kicker' => 'Seasonal Reminder Preview',
                'title' => 'Homepage care advice that updates with the season.',
                'description' => 'Timely plant-care guidance from your published seasonal reminders.',
                'badge_suffix' => 'guidance is active now',
                'primary_cta' => ['label' => 'Explore Care Tips', 'path' => '/care-tips'],
                'secondary_cta' => ['label' => 'Open My Garden', 'path' => '/my-garden'],
                'empty_title_suffix' => 'preview',
                'empty_description' => 'Add reminder cards from the admin panel and they will show here as fresh, seasonal guidance for users.',
                'empty_action' => ['label' => 'Open seasonal care tips', 'path' => '/care-tips?category=seasonal'],
            ],
            'product_sections' => [
                'popular' => ['title' => 'Popular Items', 'empty_message' => 'No popular items available yet.', 'button_label' => 'VIEW ALL', 'button_path' => '/popular-items'],
                'shop' => ['title' => 'Shop Plants', 'empty_message' => 'No shop plants available yet.', 'button_label' => 'VIEW ALL', 'button_path' => '/plants'],
                'best_sellers' => ['title' => 'Best Sellers', 'empty_message' => 'No best sellers available yet.', 'button_label' => 'VIEW ALL', 'button_path' => '/best-sellers'],
            ],
            'garden' => [
                'title' => 'Visit Our Greenhouse',
                'description' => 'Step into our lush greenhouse in Kathmandu where we nurture over 200 varieties of plants. From rare succulents to flowering beauties, each plant gets personalized care before finding its forever home with you.',
                'button_label' => 'Plant Care Tips',
                'button_path' => '/care-tips',
                'image' => '/images/about-plants.jpg',
                'image_alt' => 'Our greenhouse in Kathmandu',
            ],
            'mission' => [
                'title' => 'Our Mission',
                'description' => "We believe every Nepali home deserves a touch of green. Our goal is to make plant parenting accessible to everyone - whether you're a busy professional or a retired gardening enthusiast. Let's grow together!",
                'button_label' => 'Read Our Blog',
                'button_path' => '/blogs',
                'image' => '/images/mission-hero.jpg',
                'image_alt' => 'Our mission',
            ],
            'about' => [
                'title' => 'About Nepal Cozy Care',
                'description' => "We're a Kathmandu-based plant shop passionate about bringing greenery into urban homes. Our team hand-picks each plant from local nurseries, ensuring you get only the healthiest specimens. Plus, we provide lifetime care support - because we're plant parents too!",
                'button_label' => 'Our Story',
                'button_path' => '/about',
            ],
            'storefront' => [
                'announcement' => '🌿 Free Valley Delivery on orders over Rs. 999 | 🌸 Code: GREEN10 for 10% Off | 🩺 Free WhatsApp Plant Doctor Support',
                'announcement_path' => '/plant-finder',
                'sections' => [
                    ['id' => 'categories', 'enabled' => true],
                    ['id' => 'tabs_collection', 'enabled' => true],
                    ['id' => 'offers', 'enabled' => true],
                    ['id' => 'shop_the_look', 'enabled' => true],
                    ['id' => 'rooms', 'enabled' => true],
                    ['id' => 'best_sellers', 'enabled' => true],
                    ['id' => 'popular', 'enabled' => true],
                    ['id' => 'why_us', 'enabled' => true],
                    ['id' => 'smart_tools', 'enabled' => true],
                    ['id' => 'seasonal', 'enabled' => true],
                    ['id' => 'garden', 'enabled' => true],
                    ['id' => 'testimonials', 'enabled' => true],
                    ['id' => 'journal', 'enabled' => true],
                    ['id' => 'mission', 'enabled' => true],
                    ['id' => 'about', 'enabled' => true],
                    ['id' => 'faq', 'enabled' => true],
                ],
                'categories' => [
                    'title' => 'Shop By Category',
                    'items' => [
                        ['title' => 'Plants', 'image' => '/images/categories/plants.webp', 'path' => '/plants', 'description' => 'Indoor & Outdoor', 'label' => 'Explore'],
                        ['title' => 'Pots & Planters', 'image' => '/images/categories/pots.webp', 'path' => '/pots?category=pots', 'description' => 'Ceramic & Fiber', 'label' => 'Explore'],
                        ['title' => 'Seeds', 'image' => '/images/categories/seeds.webp', 'path' => '/seeds', 'description' => 'Herbs & Flowers', 'label' => 'Explore'],
                        ['title' => 'Soil & Nutrition', 'image' => '/images/categories/soil.webp', 'path' => '/pots?category=soil', 'description' => 'Organic Mix', 'label' => 'Explore'],
                        ['title' => 'Garden Tools', 'image' => '/images/categories/tools.webp', 'path' => '/pots?category=tools', 'description' => 'Pruners & Kits', 'label' => 'Explore'],
                        ['title' => 'Watering', 'image' => '/images/categories/watering.webp', 'path' => '/pots?category=watering', 'description' => 'Cans & Sprayers', 'label' => 'Explore'],
                        ['title' => 'Plant Care', 'image' => '/images/categories/care.webp', 'path' => '/care-tips', 'description' => 'Expert Guides', 'label' => 'Explore'],
                        ['title' => 'Doctor Green', 'image' => '/images/categories/fertiliser.webp', 'path' => '/plant-health-checker', 'description' => 'AI Scanner', 'label' => 'Explore'],
                    ],
                ],
                'offers' => [
                    'title' => 'Curated Essentials for Green Homes',
                    'items' => [
                        ['title' => 'Artisanal Ceramic Planters', 'image' => '/images/pot3.webp', 'path' => '/pots', 'description' => 'Designed to elevate your indoor jungle with drainage & saucer trays.', 'label' => 'Shop Planters'],
                        ['title' => 'Non-GMO Seeds & Grow Kits', 'image' => '/images/seeds_tomato.jpg', 'path' => '/seeds', 'description' => 'From crisp cherry tomatoes to fragrant herbs, grow fresh food at home.', 'label' => 'Start Growing'],
                    ],
                ],
                'rooms' => [
                    'title' => 'Plants Curated For Every Space',
                    'items' => [
                        ['title' => 'Living Room', 'image' => '/images/plantfinder/living-room.png', 'path' => '/plants?location=living-room', 'description' => 'Lush statement foliage', 'label' => 'Explore Space'],
                        ['title' => 'Bedroom', 'image' => '/images/plantfinder/bedroom.png', 'path' => '/plants?location=bedroom', 'description' => 'Calming oxygen boosters', 'label' => 'Explore Space'],
                        ['title' => 'Balcony & Patio', 'image' => '/images/plantfinder/balcony.png', 'path' => '/plants?location=balcony', 'description' => 'Sun-loving tropicals', 'label' => 'Explore Space'],
                        ['title' => 'Workspace & Desk', 'image' => '/images/plantfinder/office.png', 'path' => '/plants?location=workspace', 'description' => 'Compact focus enhancers', 'label' => 'Explore Space'],
                    ],
                ],
                'journey' => [
                    'title' => 'The Cozy Care Parenting Journey',
                    'items' => [
                        ['title' => '1. Find Your Match', 'image' => '/images/about-plants.jpg', 'path' => '/plant-finder', 'description' => 'Match plants to your room light, pet safety, and routine.', 'label' => 'Start Quiz'],
                        ['title' => '2. Safe Transit Delivery', 'image' => '/images/plant-box.jpg', 'path' => '/care-tips', 'description' => 'Delivered in breathable eco-boxes with zero soil spill.', 'label' => 'Unboxing Guide'],
                        ['title' => '3. Grow with Doctor Green', 'image' => '/images/indoor-garden.jpg', 'path' => '/my-garden', 'description' => 'Keep watering logs and chat with horticulturists anytime.', 'label' => 'Open Garden'],
                    ],
                ],
                'journal' => [
                    'title' => 'The Green Journal & Guides',
                    'items' => [
                        ['title' => '7 Air-Purifying Plants for Kathmandu Homes', 'image' => '/images/blog-hero-lush.jpg', 'path' => '/blogs', 'description' => 'Combat valley smog naturally with these NASA-backed indoor species.', 'label' => 'Read Guide'],
                        ['title' => 'How to Diagnose Yellow Leaves Quickly', 'image' => '/images/blog-leaf-macro.jpg', 'path' => '/plant-health-checker', 'description' => 'Learn the difference between overwatering, sunburn, and nutrient lock.', 'label' => 'Diagnose Now'],
                        ['title' => 'Winter Plant Care: Watering & Light Shifts', 'image' => '/images/winter-garden.png', 'path' => '/care-tips?category=seasonal', 'description' => 'Simple tips to keep tropical plants happy during colder months.', 'label' => 'Read Care Tips'],
                    ],
                ],
                'faq' => [
                    'title' => 'Frequently Asked Questions',
                    'items' => [
                        ['question' => 'How are plants safely delivered without damage or spilled soil?', 'answer' => 'We use specially engineered transit pods with breathable perforated walls and secure root-collar locks. Plants arrive upright, intact, and pre-hydrated.'],
                        ['question' => 'What if my plant arrives stressed or damaged during shipping?', 'answer' => 'Every order is backed by our 7-Day Healthy Plant Guarantee. Simply snap a quick photo and contact us on WhatsApp (+977-9800000000) for a prompt free replacement.'],
                        ['question' => 'Do plants come potted and ready to display?', 'answer' => 'Yes! All our plants arrive potted in high-drainage organic potting mix. You can also pair them with our designer ceramic or self-watering planters.'],
                        ['question' => 'Can I get care help after receiving my plant?', 'answer' => 'Absolutely. Use our built-in AI Plant Health Checker, track watering in My Garden, or message our Kathmandu plant doctors on WhatsApp anytime for free advice.'],
                    ],
                ],
            ],
            'shop_the_look' => [
                'title' => 'Shop The Look: Modern Green Living Room',
                'subtitle' => 'Hover or tap the hotspots to discover the exact plants and designer planters in this space.',
                'image' => '/images/HomeBackground.png',
                'hotspots' => [
                    [
                        'id' => 1,
                        'x' => 52,
                        'y' => 52,
                        'name' => 'Monstera Deliciosa (XL)',
                        'subtitle' => 'Iconic split-leaf tropical',
                        'price' => 1450,
                        'rating' => 4.9,
                        'image' => '/images/mos.jpg',
                        'path' => '/plants/1',
                    ],
                    [
                        'id' => 2,
                        'x' => 32,
                        'y' => 74,
                        'name' => 'Minimalist Ceramic Planter',
                        'subtitle' => 'Artisanal matte cream pot',
                        'price' => 750,
                        'rating' => 4.8,
                        'image' => '/images/pot3.webp',
                        'path' => '/pots',
                    ],
                    [
                        'id' => 3,
                        'x' => 70,
                        'y' => 64,
                        'name' => 'Golden Brass Watering Can',
                        'subtitle' => 'Precision long-spout design',
                        'price' => 899,
                        'rating' => 4.9,
                        'image' => '/images/can.jpg',
                        'path' => '/pots?category=watering',
                    ],
                ],
            ],
            'why_us' => [
                'title' => 'The Nepal Cozy Care Experience',
                'subtitle' => 'Everything you need to become a thriving, confident plant parent.',
                'items' => [
                    [
                        'icon' => 'PackageCheck',
                        'title' => 'Transit-Safe Packaging',
                        'description' => 'Custom breathable pods guarantee zero soil spillage and zero broken leaves on arrival.',
                    ],
                    [
                        'icon' => 'ShieldCheck',
                        'title' => '7-Day Transit Guarantee',
                        'description' => 'Hassle-free replacement if your plant arrives stressed, damaged, or unhappy.',
                    ],
                    [
                        'icon' => 'Sprout',
                        'title' => 'Valley-Acclimated Plants',
                        'description' => 'Nurtured in our local Kathmandu greenhouses so they effortlessly adapt to your home.',
                    ],
                    [
                        'icon' => 'Stethoscope',
                        'title' => 'Free Plant Doctor Advice',
                        'description' => 'Instant WhatsApp & AI symptom support from certified Nepali horticulturists.',
                    ],
                ],
            ],
            'testimonials' => [
                'title' => 'Loved By 25,000+ Plant Parents',
                'subtitle' => 'Real reviews from happy plant lovers across Nepal',
                'items' => [
                    [
                        'name' => 'Prashant Sharma',
                        'city' => 'Baluwatar, Kathmandu',
                        'rating' => 5,
                        'plant' => 'Monstera Deliciosa',
                        'text' => 'Arrived in pristine condition! Not a single leaf was torn, and the soil was still damp. The care card included is a lifesaver for beginners.',
                        'date' => '2 days ago',
                        'verified' => true,
                    ],
                    [
                        'name' => 'Aayusha Shrestha',
                        'city' => 'Jhamsikhel, Lalitpur',
                        'rating' => 5,
                        'plant' => 'ZZ Plant + Ceramic Pot',
                        'text' => 'The ceramic pot finish is top-tier luxury, exactly like high-end international stores. My ZZ plant is thriving on my desk with zero fuss.',
                        'date' => '1 week ago',
                        'verified' => true,
                    ],
                    [
                        'name' => 'Rohan Adhikari',
                        'city' => 'Lakeside, Pokhara',
                        'rating' => 5,
                        'plant' => 'Fiddle Leaf Fig',
                        'text' => 'I was worried about delivery all the way to Pokhara, but it was packed so securely! Doctor Green also answered my watering questions quickly.',
                        'date' => '2 weeks ago',
                        'verified' => true,
                    ],
                    [
                        'name' => 'Smriti Thapa',
                        'city' => 'Suryabinayak, Bhaktapur',
                        'rating' => 5,
                        'plant' => 'Peace Lily Bloom',
                        'text' => 'The white blooms were fresh and vibrant. The Plant Health Checker tool is so cool and practical. Will definitely order again!',
                        'date' => '3 weeks ago',
                        'verified' => true,
                    ],
                ],
            ],
        ];
    }
}
