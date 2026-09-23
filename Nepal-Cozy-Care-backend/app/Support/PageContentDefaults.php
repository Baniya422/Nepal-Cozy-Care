<?php

namespace App\Support;

class PageContentDefaults
{
    public static function contact(): array
    {
        return [
            'hero' => [
                'eyebrow' => 'Contact Cozy Care',
                'title' => 'Talk to us about orders, delivery locations, and plant care.',
                'description' => 'Use this page for general support, order follow-up, and delivery help. After an order is placed, our admin team can call, email, or WhatsApp you to confirm the address and make delivery smoother.',
                'cards' => [
                    ['title' => 'Order Confirmation', 'description' => 'Get quick help for order approval, delivery timing, or callback requests.'],
                    ['title' => 'Location Check', 'description' => 'Add landmarks and delivery notes so admin can confirm the exact location.'],
                    ['title' => 'Plant Care Help', 'description' => 'Ask for plant care guidance, post-purchase support, or product suggestions.'],
                ],
            ],
            'info' => [
                'eyebrow' => 'Support Channels',
                'title' => 'We help with delivery, orders, and healthy plants.',
                'description' => 'Reach out if you need help before ordering, after checkout, or while waiting for delivery. Include your order number if your message is about a recent purchase.',
                'promises' => [
                    'Order support and confirmation guidance',
                    'Location and landmark clarification',
                    'Plant care help after purchase',
                ],
                'details' => [
                    ['label' => 'Email', 'value' => 'support@cozycare.com'],
                    ['label' => 'Call or WhatsApp', 'value' => '+977 9876543211'],
                    ['label' => 'Delivery Support Base', 'value' => 'Kathmandu Valley, Nepal'],
                    ['label' => 'Mon - Sat 9:00 - 18:00', 'value' => 'Sunday Closed'],
                ],
                'note_title' => 'Best way to get faster help',
                'note_description' => 'For delivery questions, include your order number, city, and a nearby landmark. That makes it much easier for our admin team to confirm the location with you.',
            ],
            'form' => [
                'title' => 'Send a support request',
                'description' => 'Choose the topic and how you want us to contact you back. For order issues, add the order number if you have it.',
                'name_placeholder' => 'Your name*',
                'email_placeholder' => 'Email*',
                'order_placeholder' => 'Order Number (optional)',
                'phone_placeholder' => 'Phone Number*',
                'city_placeholder' => 'City / Delivery Area*',
                'message_placeholder' => 'Tell us what you need help with. If this is a delivery issue, include landmarks or location clarification.',
                'note' => 'Admin will use your preferred contact method to reply or confirm order details.',
                'button_label' => 'Send Support Request',
                'submitting_label' => 'Sending...',
                'subject_options' => [
                    ['value' => 'general_inquiry', 'label' => 'General Inquiry'],
                    ['value' => 'order_support', 'label' => 'Order Support'],
                    ['value' => 'delivery_help', 'label' => 'Delivery Help'],
                    ['value' => 'plant_care', 'label' => 'Plant Care'],
                    ['value' => 'bulk_order', 'label' => 'Bulk Order'],
                ],
                'contact_method_options' => [
                    ['value' => 'phone', 'label' => 'Call Me'],
                    ['value' => 'whatsapp', 'label' => 'WhatsApp'],
                    ['value' => 'email', 'label' => 'Email'],
                ],
            ],
            'banner_images' => [
                ['image' => '/images/nepal-mountains.jpg', 'alt' => 'Nepal Mountains'],
                ['image' => '/images/nepal-stupa.jpg', 'alt' => 'Nepal Stupa'],
                ['image' => '/images/nepal-plane.jpg', 'alt' => 'Nepal Plane'],
                ['image' => '/images/nepal-landscape.jpg', 'alt' => 'Nepal Landscape'],
            ],
        ];
    }

    public static function shipping(): array
    {
        return [
            'hero' => [
                'background_image' => '/images/shipping-hero.jpg',
                'title_lines' => ['Welcome to', 'Delivery and', 'Shipping Services'],
                'button_label' => 'Read more',
                'button_path' => '/shipping#delivery-options',
            ],
            'about' => [
                'title' => 'How We Deliver',
                'description' => "We understand how precious your plants are. That's why we've developed a specialized packaging system using eco-friendly materials that protect your green friends during transit. Every plant is carefully secured, watered, and packed with love before leaving our greenhouse.",
                'button_label' => 'Our Packaging',
                'button_path' => '/shipping#delivery-options',
                'image' => '/images/plant-box.jpg',
                'image_alt' => 'Secure plant packaging',
            ],
            'delivery' => [
                'title' => 'Delivery Options',
                'image' => '/images/delivery-person.jpg',
                'image_alt' => 'Our delivery team',
                'options' => [
                    ['title' => 'Same-Day Delivery', 'description' => 'Order before 2 PM and get your plants delivered the same day within Kathmandu city limits.'],
                    ['title' => 'Valley-Wide Shipping', 'description' => 'We deliver to Lalitpur, Bhaktapur, and surrounding areas within 24-48 hours.'],
                ],
            ],
            'benefits' => [
                'title' => 'Why Choose Us',
                'image' => '/images/package-delivery.jpg',
                'image_alt' => 'Package delivery',
                'items' => [
                    ['title' => 'Safe Package', 'description' => 'Specialized plant-safe packaging protects leaves, soil, and pots during transport.'],
                    ['title' => 'Fast Delivery', 'description' => 'Reliable local delivery with clear timing and order updates.'],
                    ['title' => 'Helpful Support', 'description' => 'Contact our team for delivery updates, location checks, or plant-care questions.'],
                ],
            ],
            'testimonials' => [
                'title' => 'What Our Customers Say',
                'items' => [
                    ['name' => 'John Doe', 'role' => 'Customer', 'rating' => 5, 'quote' => 'My plants arrived healthy and securely packed. The delivery updates were clear and helpful.', 'image' => '/images/team-emily.jpg', 'image_alt' => 'Customer John Doe', 'featured' => false],
                    ['name' => 'Jane Smith', 'role' => 'Customer', 'rating' => 5, 'quote' => 'Exceptional service and a very professional team. Everything arrived safely and on time.', 'image' => '/images/team-sarah.jpg', 'image_alt' => 'Customer Jane Smith', 'featured' => true],
                ],
            ],
        ];
    }

    public static function blogs(): array
    {
        return [
            'hero' => [
                'kicker' => 'Nepal Cozy Care Botanical Journal & Care Stories',
                'title_main' => 'Stories from the Soil:',
                'title_highlight' => 'Cultivating Life & Serenity',
                'subtitle' => 'Deep-dive care handbooks, interior styling guides, Nepal seasonal secrets, and expert wisdom from our greenhouse botanists to your living room.',
                'search_placeholder' => 'Search plant species, care problems, monsoon advice, or hacks...',
                'search_button_text' => 'Find Guides',
                'background_image' => '/images/blog-hero-lush.jpg',
                'badge_1' => '60+ Deep-Dive Guides',
                'badge_2' => '12,000+ Readers in Nepal',
                'badge_3' => '100% Expert Botanist Verified',
            ],
            'newsletter' => [
                'title' => 'Join 15,000+ Nepal Plant Enthusiasts',
                'subtitle' => 'Receive Kathmandu seasonal potting alerts, urgent monsoon humidity warnings, and care guides directly to your inbox every Sunday morning.',
                'button_text' => 'Subscribe Free',
            ],
        ];
    }

    public static function helpCenter(): array
    {
        return [
            'name' => 'Help Center',
            'support_intro' => 'Still need help? Reach out to our support team and we will assist you quickly.',
            'contact_phone' => '+977 9876543211',
            'contact_email' => 'support@cozycare.com',
            'categories' => [
                ['key' => 'all', 'label' => 'All Topics'],
                ['key' => 'orders', 'label' => 'Orders & Shipping'],
                ['key' => 'care', 'label' => 'Plant Care & Guarantee'],
                ['key' => 'payment', 'label' => 'Payments & Returns'],
            ],
            'topic_cards' => [
                ['id' => 'card-orders', 'icon' => 'Truck', 'title' => 'Valley-Wide Safe Delivery', 'points' => ['Same-day delivery within Kathmandu for morning orders', 'Shock-absorbing protective plant boxing', 'Direct phone call before drop-off']],
                ['id' => 'card-returns', 'icon' => 'RotateCcw', 'title' => '30-Day Plant Guarantee', 'points' => ['Free plant replacement for transit issues', 'Live advice from our botanist team', 'Fast, friendly customer resolution']],
                ['id' => 'card-payment', 'icon' => 'CreditCard', 'title' => 'Flexible Payment Choices', 'points' => ['Cash on Delivery (COD) accepted', 'eSewa, Khalti, & mobile banking', 'Transparent invoicing']],
            ],
            'faq_items' => [
                ['id' => 1, 'category' => 'orders', 'question' => 'How long does delivery take inside Kathmandu?', 'answer' => 'Orders placed before 2 PM are typically delivered same-day or within 24 hours. Outside Kathmandu valley, delivery takes 2 to 3 business days.'],
                ['id' => 2, 'category' => 'care', 'question' => 'What if my plant arrives damaged or unhealthy?', 'answer' => 'We offer a 100% Transit Safe Guarantee. Just send us a photo within 48 hours of delivery and we will replace it free of charge.'],
                ['id' => 3, 'category' => 'payment', 'question' => 'What payment methods do you support in Nepal?', 'answer' => 'We accept Cash on Delivery (COD) across Kathmandu Valley, as well as digital wallets including eSewa, Khalti, and direct bank transfers.'],
                ['id' => 4, 'category' => 'care', 'question' => 'Do you provide care instructions with each plant?', 'answer' => 'Yes! Each plant comes with detailed sunlight, watering, humidity, and repotting guidelines crafted by our Kathmandu horticulturists.'],
            ],
        ];
    }

    public static function plantFinder(): array
    {
        return [
            'name' => 'Plant Finder Tool',
            'room_options' => [
                ['value' => 'living-room', 'label' => 'Living Room', 'desc' => 'Statement foliage & social space', 'icon' => '🛋️'],
                ['value' => 'bedroom', 'label' => 'Bedroom', 'desc' => 'Calm vibes & nighttime air purification', 'icon' => '🛏️'],
                ['value' => 'office', 'label' => 'Home Office', 'desc' => 'Desk companions that reduce stress', 'icon' => '💻'],
                ['value' => 'balcony', 'label' => 'Balcony / Terrace', 'desc' => 'Sun-loving greens & fresh air', 'icon' => '🌿'],
                ['value' => 'kitchen', 'label' => 'Kitchen', 'desc' => 'Compact plants that love warm ambient air', 'icon' => '🍳'],
                ['value' => 'bathroom', 'label' => 'Bathroom', 'desc' => 'Lush tropicals that adore shower humidity', 'icon' => '🚿'],
            ],
            'light_options' => [
                ['value' => 'bright-light', 'label' => 'Bright Indirect', 'desc' => 'Close to a sunny window without harsh burning rays', 'icon' => '☀️'],
                ['value' => 'medium-light', 'label' => 'Medium Light', 'desc' => 'A few feet away from a window; soft ambient light', 'icon' => '⛅'],
                ['value' => 'low-light', 'label' => 'Low Light', 'desc' => 'Dim inner room, corridor, or north-facing window', 'icon' => '🌙'],
                ['value' => 'indirect-light', 'label' => 'Direct Sunlight', 'desc' => 'Unobstructed rays on a sunny sill or open terrace', 'icon' => '🌤️'],
            ],
            'experience_options' => [
                ['value' => 'beginner', 'label' => 'Beginner Friendly', 'desc' => 'Nearly indestructible; forgives occasional neglect', 'icon' => '🌱'],
                ['value' => 'intermediate', 'label' => 'Moderate Care', 'desc' => 'Enjoys regular weekly watering and feeding', 'icon' => '🪴'],
                ['value' => 'expert', 'label' => 'Green Thumb Enthusiast', 'desc' => 'Excited to prune, train, and calibrate humidity', 'icon' => '🌿'],
            ],
            'location_options' => [
                ['value' => 'normal', 'label' => 'Normal Humidity', 'desc' => 'Typical Kathmandu room moisture levels', 'icon' => '🍃'],
                ['value' => 'humid', 'label' => 'High Humidity', 'desc' => 'Bathrooms, monsoon-heavy rooms, misted corners', 'icon' => '💧'],
                ['value' => 'dry', 'label' => 'Drier Air', 'desc' => 'Air-conditioned rooms or winter heaters', 'icon' => '🌵'],
            ],
            'light_map' => [
                'bright-light' => ['bright', 'direct', 'sun'],
                'medium-light' => ['medium', 'indirect'],
                'low-light' => ['low', 'shade'],
                'indirect-light' => ['indirect', 'filtered'],
            ],
            'difficulty_map' => [
                'beginner' => ['easy', 'beginner', 'low'],
                'intermediate' => ['moderate', 'medium'],
                'expert' => ['advanced', 'expert', 'high'],
            ],
            'humidity_map' => [
                'normal' => ['normal', 'moderate'],
                'humid' => ['high', 'humid'],
                'dry' => ['dry', 'arid'],
            ],
            'room_map' => [
                'living-room' => ['living room', 'living-room', 'living'],
                'bedroom' => ['bedroom'],
                'office' => ['office', 'workspace', 'desk'],
                'balcony' => ['balcony', 'terrace', 'patio', 'outdoor'],
                'kitchen' => ['kitchen'],
                'bathroom' => ['bathroom'],
            ],
            'non_plant_categories' => ['pots', 'tools', 'soil', 'fertilizers', 'accessories'],
            'preview_data' => [
                'room' => [
                    'living-room' => ['eyebrow' => 'Living Room', 'title' => 'Social Statement Plants', 'description' => 'Bright foliage for focal points.', 'image' => '/images/indoor-garden.jpg'],
                    'bedroom' => ['eyebrow' => 'Bedroom Sanctuary', 'title' => 'Calm & Restful Greens', 'description' => 'Air purifiers for deep sleep.', 'image' => '/images/snake.jpg'],
                ],
            ],
        ];
    }

    public static function plantHealth(): array
    {
        return [
            'name' => 'Plant Health Doctor',
            'symptom_categories' => [
                [
                    'id' => 'foliage',
                    'title' => 'Leaves & Foliage',
                    'description' => 'Discoloration, spots, or drooping on leaves',
                    'icon' => 'Leaf',
                    'symptoms' => [
                        ['id' => 'yellow_leaves', 'label' => 'Yellowing Leaves', 'description' => 'Lower leaves turning pale or yellow'],
                        ['id' => 'brown_tips', 'label' => 'Brown Crispy Tips', 'description' => 'Edges or tips drying out and turning brown'],
                        ['id' => 'black_spots', 'label' => 'Black or Dark Spots', 'description' => 'Target-like or dark fungal lesions on foliage'],
                        ['id' => 'drooping_leaves', 'label' => 'Drooping / Wilting', 'description' => 'Stems and foliage sagging downward'],
                    ],
                ],
                [
                    'id' => 'pests',
                    'title' => 'Bugs & Pests',
                    'description' => 'Visible insects, webbing, or sticky residue',
                    'icon' => 'Bug',
                    'symptoms' => [
                        ['id' => 'spider_mites', 'label' => 'Fine Webbing', 'description' => 'Silky micro-webs on undersides of leaves'],
                        ['id' => 'mealybugs', 'label' => 'White Cotton Fluff', 'description' => 'Fuzzy white clusters in leaf nodes'],
                        ['id' => 'scale', 'label' => 'Brown Shell Bumps', 'description' => 'Hard oval bumps attached to stems'],
                        ['id' => 'fungus_gnats', 'label' => 'Flying Soil Gnats', 'description' => 'Tiny flies swarming above the potting mix'],
                    ],
                ],
                [
                    'id' => 'soil',
                    'title' => 'Soil & Roots',
                    'description' => 'Drainage, moisture, or odor issues in pot',
                    'icon' => 'Droplets',
                    'symptoms' => [
                        ['id' => 'soggy_soil', 'label' => 'Soil Stays Wet Days', 'description' => 'Mix remains saturated long after watering'],
                        ['id' => 'foul_odor', 'label' => 'Musty / Sour Odor', 'description' => 'Rotting smell coming from drainage holes'],
                        ['id' => 'white_mold', 'label' => 'White Crust on Soil', 'description' => 'Fungal film or mineral salts on topsoil'],
                    ],
                ],
            ],
            'plant_type_options' => [
                ['value' => 'tropical', 'label' => 'Tropical Aroid (Monstera, Philodendron, Pothos)'],
                ['value' => 'succulent', 'label' => 'Succulent or Cactus (Sansevieria, Haworthia, Jade)'],
                ['value' => 'fern', 'label' => 'Fern or Palm (Boston Fern, Areca Palm)'],
                ['value' => 'ficus', 'label' => 'Ficus / Tree (Fiddle Leaf Fig, Rubber Plant)'],
            ],
            'environment_options' => [
                ['value' => 'indoor_low', 'label' => 'Indoor Low Light'],
                ['value' => 'indoor_bright', 'label' => 'Indoor Bright Indirect Sun'],
                ['value' => 'outdoor_shaded', 'label' => 'Balcony / Covered Shaded'],
                ['value' => 'direct_sun', 'label' => 'Open Rooftop / Direct Sunlight'],
            ],
            'soil_options' => [
                ['value' => 'wet', 'label' => 'Constantly Moist / Wet'],
                ['value' => 'dry', 'label' => 'Bone Dry / Pulling Away from Pot'],
                ['value' => 'normal', 'label' => 'Moderately Damp'],
            ],
            'season_options' => [
                ['value' => 'monsoon', 'label' => 'Monsoon (High humidity, cloudy)'],
                ['value' => 'winter', 'label' => 'Winter (Cold, dry, shorter days)'],
                ['value' => 'spring_summer', 'label' => 'Spring / Summer (Active growth)'],
            ],
            'diagnosis_profiles' => [],
            'default_diagnosis' => [
                'id' => 'overwatering_mild',
                'title' => 'Early Moisture Stress / Mild Overwatering',
                'summary' => 'Root hairs are saturated and struggling for oxygen.',
                'severity' => 'medium',
                'symptoms' => ['yellow_leaves', 'drooping_leaves'],
                'immediateActions' => [
                    'Pause watering immediately for 5-7 days.',
                    'Check pot drainage holes to ensure no standing water.',
                    'Move plant to a spot with gentle air circulation and indirect light.',
                ],
                'causes' => ['Potting mix too dense', 'Pot lacking drainage hole', 'Watering on schedule rather than checking soil'],
                'solutions' => ['Allow top 2 inches of soil to dry before next hydration.'],
                'prevention' => ['Always poke a wooden stick or finger into the potting mix before watering.'],
                'relatedCareTips' => ['How to master watering in Kathmandu monsoon'],
            ],
            'healthy_plant_habits' => [
                ['id' => 'habit_light', 'title' => 'Rotate for Even Growth', 'description' => 'Turn your pot 90 degrees weekly so all sides get sun.', 'icon' => 'Sun'],
                ['id' => 'habit_dust', 'title' => 'Wipe Foliage Clean', 'description' => 'Dust hinders photosynthesis; wipe leaves with a damp cloth monthly.', 'icon' => 'Leaf'],
                ['id' => 'habit_drain', 'title' => 'Empty Saucers Promptly', 'description' => 'Never leave your plant pot sitting in stagnant drain water.', 'icon' => 'Droplets'],
            ],
        ];
    }
}

