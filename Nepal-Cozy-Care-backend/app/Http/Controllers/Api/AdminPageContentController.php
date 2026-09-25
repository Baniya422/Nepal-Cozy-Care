<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContentTemplate;
use App\Models\HelpCenterTemplate;
use App\Models\PlantFinderTemplate;
use App\Models\PlantHealthTemplate;
use App\Support\PageContentDefaults;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AdminPageContentController extends Controller
{
    private const CONTENT_PAGES = [
        'about_page' => ['name' => 'About', 'url' => '/about'],
        'our_mission' => ['name' => 'Our Mission', 'url' => '/mission'],
        'contact_page' => ['name' => 'Contact', 'url' => '/contact'],
        'shipping_page' => ['name' => 'Shipping & Delivery', 'url' => '/shipping'],
        'blogs_page' => ['name' => 'Care Blogs Hub', 'url' => '/blogs'],
        'navigation_menu' => ['name' => 'Navigation & Dropdown Menus', 'url' => '/'],
        'category_bubbles' => ['name' => 'Catalog Category Circles', 'url' => '/plants'],
        'site_branding' => ['name' => 'Website Logo & Branding', 'url' => '/'],
    ];

    public function index()
    {
        $pages = [];
        foreach (self::CONTENT_PAGES as $key => $meta) {
            $template = ContentTemplate::query()->where('key', $key)->first();
            $default = self::defaultPayload($key);
            $payload = (! empty($template?->payload) && is_array($template->payload))
                ? array_replace_recursive($default, $template->payload)
                : $default;
            $pages[] = $this->pageResponse(
                $key,
                $meta['name'],
                $meta['url'],
                $payload,
                $template?->updated_at
            );
        }

        $help = HelpCenterTemplate::query()->where('is_active', true)->latest('id')->first();
        $finder = PlantFinderTemplate::query()->where('is_active', true)->latest('id')->first();
        $health = PlantHealthTemplate::query()->where('is_active', true)->latest('id')->first();
        $pages[] = $this->pageResponse('help_center', 'Help Center', '/help-center', $this->helpPayload($help), $help?->updated_at);
        $pages[] = $this->pageResponse('plant_finder', 'Plant Finder', '/plant-finder', $this->finderPayload($finder), $finder?->updated_at, true);
        $pages[] = $this->pageResponse('plant_health', 'Plant Health Checker', '/plant-health-checker', $this->healthPayload($health), $health?->updated_at, true);

        return response()->json([
            'message' => 'Page content loaded successfully.',
            'data' => ['pages' => $pages],
        ]);
    }

    public function update(Request $request, string $key)
    {
        $validated = $request->validate([
            'payload' => ['required', 'array'],
        ]);
        $encoded = json_encode($validated['payload']);
        if ($encoded === false || strlen($encoded) > 800000) {
            throw ValidationException::withMessages([
                'payload' => ['Page content must be valid and smaller than 800 KB.'],
            ]);
        }

        if (isset(self::CONTENT_PAGES[$key])) {
            $meta = self::CONTENT_PAGES[$key];
            $template = ContentTemplate::query()->updateOrCreate(
                ['key' => $key],
                ['name' => $meta['name'].' Page', 'is_active' => true, 'payload' => $validated['payload']]
            );

            return $this->updatedResponse($key, $meta['name'], $meta['url'], $template->payload, $template->updated_at);
        }

        [$model, $fields, $name, $url, $technical] = match ($key) {
            'help_center' => [HelpCenterTemplate::query()->where('is_active', true)->latest('id')->first(), $this->helpFields(), 'Help Center', '/help-center', false],
            'plant_finder' => [PlantFinderTemplate::query()->where('is_active', true)->latest('id')->first(), $this->finderFields(), 'Plant Finder', '/plant-finder', true],
            'plant_health' => [PlantHealthTemplate::query()->where('is_active', true)->latest('id')->first(), $this->healthFields(), 'Plant Health Checker', '/plant-health-checker', true],
            default => [null, [], '', '', false],
        };
        if (! $model) {
            $model = match ($key) {
                'help_center' => new HelpCenterTemplate(['name' => 'Help Center', 'is_active' => true]),
                'plant_finder' => new PlantFinderTemplate(['name' => 'Plant Finder', 'is_active' => true]),
                'plant_health' => new PlantHealthTemplate(['name' => 'Plant Health Checker', 'is_active' => true]),
                default => null,
            };
            if (! $model) {
                abort(404, 'Page content template not found.');
            }
        }
        $changes = array_intersect_key($validated['payload'], array_flip($fields));
        $this->ensureCompatibleTypes($model, $changes);
        $model->fill($changes)->save();
        $payload = match ($key) {
            'help_center' => $this->helpPayload($model),
            'plant_finder' => $this->finderPayload($model),
            'plant_health' => $this->healthPayload($model),
        };

        return $this->updatedResponse($key, $name, $url, $payload, $model->updated_at, $technical);
    }

    private function updatedResponse(string $key, string $name, string $url, array $payload, mixed $updatedAt, bool $technical = false)
    {
        return response()->json([
            'message' => $name.' content updated successfully.',
            'data' => ['page' => $this->pageResponse($key, $name, $url, $payload, $updatedAt, $technical)],
        ]);
    }

    private function pageResponse(string $key, string $name, string $url, array $payload, mixed $updatedAt, bool $technical = false): array
    {
        return [
            'key' => $key,
            'name' => $name,
            'url' => $url,
            'payload' => $payload,
            'updated_at' => $updatedAt,
            'technical' => $technical,
        ];
    }

    private function ensureCompatibleTypes(Model $model, array $changes): void
    {
        foreach ($changes as $field => $value) {
            if (is_array($model->getAttribute($field)) && ! is_array($value)) {
                throw ValidationException::withMessages([
                    'payload.'.$field => [str($field)->replace('_', ' ')->title().' must remain a list or group.'],
                ]);
            }
        }
    }

    private function helpFields(): array
    {
        return ['categories', 'faq_items', 'topic_cards', 'support_intro', 'contact_phone', 'contact_email'];
    }

    private function finderFields(): array
    {
        return ['room_options', 'light_options', 'experience_options', 'location_options', 'light_map', 'difficulty_map', 'humidity_map', 'room_map', 'non_plant_categories', 'preview_data'];
    }

    private function healthFields(): array
    {
        return ['symptom_categories', 'plant_type_options', 'environment_options', 'soil_options', 'season_options', 'diagnosis_profiles', 'default_diagnosis', 'healthy_plant_habits'];
    }

    private function modelPayload(?Model $model, array $fields): array
    {
        if (! $model) {
            return [];
        }

        return collect($fields)->mapWithKeys(fn (string $field) => [$field => $model->getAttribute($field)])->all();
    }

    private function helpPayload(?Model $model): array
    {
        $payload = $this->modelPayload($model, $this->helpFields());
        $default = PageContentDefaults::helpCenter();
        return array_replace_recursive($default, array_filter($payload));
    }

    private function finderPayload(?Model $model): array
    {
        $payload = $this->modelPayload($model, $this->finderFields());
        $default = PageContentDefaults::plantFinder();
        return array_replace_recursive($default, array_filter($payload));
    }

    private function healthPayload(?Model $model): array
    {
        $payload = $this->modelPayload($model, $this->healthFields());
        $default = PageContentDefaults::plantHealth();
        return array_replace_recursive($default, array_filter($payload));
    }

    public static function defaultPayload(string $key): array
    {
        return match ($key) {
            'navigation_menu' => [
                'plants_dropdown' => [
                    ['id' => 'indoor', 'label' => 'Indoor Plants', 'path' => '/plants?type=indoor', 'is_active' => true],
                    ['id' => 'xl_plants', 'label' => 'XL plants', 'path' => '/plants?size=xl', 'is_active' => true],
                    ['id' => 'bundles', 'label' => 'Bundles', 'path' => '/plants?type=bundles', 'is_active' => true],
                    ['id' => 'low_light', 'label' => 'Low Light Plants', 'path' => '/plants?light=low-light', 'is_active' => true],
                    ['id' => 'cacti_succulents', 'label' => 'Cacti and Succulents', 'path' => '/plants?type=succulents', 'is_active' => true],
                    ['id' => 'hanging', 'label' => 'Hanging Plants', 'path' => '/plants?type=hanging', 'is_active' => true],
                    ['id' => 'fruit', 'label' => 'Fruit Plants', 'path' => '/plants?type=fruit', 'is_active' => true],
                ],
                'location_dropdown' => [
                    ['id' => 'balcony', 'label' => 'Balcony', 'path' => '/plants?location=balcony', 'is_active' => true],
                    ['id' => 'workspace', 'label' => 'Workspace', 'path' => '/plants?location=workspace', 'is_active' => true],
                    ['id' => 'living_room', 'label' => 'Living Room', 'path' => '/plants?location=living-room', 'is_active' => true],
                    ['id' => 'bedroom', 'label' => 'Bedroom', 'path' => '/plants?location=bedroom', 'is_active' => true],
                    ['id' => 'kitchen', 'label' => 'Kitchen', 'path' => '/plants?location=kitchen', 'is_active' => true],
                    ['id' => 'bathroom', 'label' => 'Bathroom', 'path' => '/plants?location=bathroom', 'is_active' => true],
                ],
                'care_tips_dropdown' => [
                    ['id' => 'potting_soil', 'label' => 'Potting Mix & Fertilizers', 'path' => '/pots?category=soil', 'is_active' => true],
                    ['id' => 'tools', 'label' => 'Garden Tools', 'path' => '/pots?category=tools', 'is_active' => true],
                    ['id' => 'watering', 'label' => 'Watering Tools and Accessories', 'path' => '/pots?category=watering', 'is_active' => true],
                    ['id' => 'decor', 'label' => 'Garden Decor & Accessories', 'path' => '/pots?category=pots', 'is_active' => true],
                    ['id' => 'pest_control', 'label' => 'Pest Control', 'path' => '/care-tips', 'is_active' => true],
                    ['id' => 'doctor_green', 'label' => 'Video Consultation - Doctor Green', 'path' => '/plant-health-checker', 'is_active' => true],
                ],
                'accessories_dropdown' => [
                    ['id' => 'pots_planters', 'label' => 'Pots & Planters', 'path' => '/pots?category=pots', 'is_active' => true],
                    ['id' => 'soil_media', 'label' => 'Soil & Media', 'path' => '/pots?category=soil', 'is_active' => true],
                    ['id' => 'watering_tools', 'label' => 'Watering Tools', 'path' => '/pots?category=watering', 'is_active' => true],
                    ['id' => 'garden_tools', 'label' => 'Garden Tools', 'path' => '/pots?category=tools', 'is_active' => true],
                    ['id' => 'garden_decor', 'label' => 'Garden Decor', 'path' => '/pots?category=decor', 'is_active' => true],
                    ['id' => 'plant_care_acc', 'label' => 'Plant Care', 'path' => '/pots?category=care', 'is_active' => true],
                ],
            ],
            'category_bubbles' => [
                'title' => 'Plants',
                'subtitle' => 'Transform your living spaces with hand-nurtured houseplants and outdoor flora',
                'categories' => [
                    ['id' => 'plants', 'label' => 'Plants', 'path' => '/plants', 'image' => 'plants', 'is_active' => true],
                    ['id' => 'pots', 'label' => 'Pots & Planters', 'path' => '/pots', 'image' => 'pots', 'is_active' => true],
                    ['id' => 'soil', 'label' => 'Soil & Media', 'path' => '/pots?category=soil', 'image' => 'soil', 'is_active' => true],
                    ['id' => 'fertiliser', 'label' => 'Fertilisers', 'path' => '/pots?category=fertilizer', 'image' => 'fertiliser', 'is_active' => true],
                    ['id' => 'seeds', 'label' => 'Seeds', 'path' => '/pots?category=seeds', 'image' => 'seeds', 'is_active' => true],
                    ['id' => 'tools', 'label' => 'Garden Tools', 'path' => '/pots?category=tools', 'image' => 'tools', 'is_active' => true],
                    ['id' => 'watering', 'label' => 'Watering', 'path' => '/pots?category=watering', 'image' => 'watering', 'is_active' => true],
                    ['id' => 'care', 'label' => 'Care Tips', 'path' => '/care-tips', 'image' => 'care', 'is_active' => true],
                    ['id' => 'decor', 'label' => 'Gardening Decor', 'path' => '/pots?category=decor', 'image' => 'decor', 'is_active' => true],
                ],
            ],
            'site_branding' => [
                'site_name' => 'Cozy Care',
                'site_tagline' => 'Nepal Plant Studio',
                'logo_url' => '',
                'admin_dashboard_title' => 'Cozy Care admin dashboard',
                'footer_description' => 'A smart plant care & e-commerce platform that helps you track watering, get expert tips, and shop plants & accessories.',
            ],
            'blogs_page' => PageContentDefaults::blogs(),
            'contact_page' => [
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
            ],
            'shipping_page' => [
                'hero' => [
                    'background_image' => '/images/shipping-hero.jpg',
                    'title_lines' => ['Welcome to', 'Delivery and', 'Shipping Services'],
                    'button_label' => 'Read more',
                    'button_path' => '/shipping#delivery-options',
                ],
                'about' => [
                    'title' => 'How We Deliver',
                    'description' => 'We understand how precious your plants are. That\'s why we\'ve developed a specialized packaging system using eco-friendly materials that protect your green friends during transit. Every plant is carefully secured, watered, and packed with love before leaving our greenhouse.',
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
            ],
            'about_page' => [
                'hero' => [
                    'title' => 'Our Plant Journey',
                    'subtitle' => 'Started in 2023 from a small greenhouse in Kathmandu, Nepal Cozy Care began with a simple mission: make plant parenting easy for everyone. Today, we\'ve helped over 5,000 homes bring life to their spaces.',
                    'primary_cta' => ['label' => 'Browse Plants', 'path' => '/plants'],
                    'secondary_cta' => ['label' => 'Get in Touch', 'path' => '/contact'],
                ],
                'stats' => [
                    ['value' => '10,000+', 'label' => 'Happy Customers'],
                    ['value' => '500+', 'label' => 'Plant Varieties'],
                    ['value' => '15', 'label' => 'Years Experience'],
                    ['value' => '98%', 'label' => 'Satisfaction Rate'],
                ],
                'story' => [
                    'label' => 'Our Story',
                    'title' => 'Growing Green Dreams Since 2010',
                    'paragraphs' => [
                        'What started as a small passion project in a backyard greenhouse has blossomed into a thriving business dedicated to bringing the beauty and benefits of plants to homes and offices across the country.',
                        'Our founder, Sarah Johnson, began with just 50 plant varieties and a dream to make plant care accessible to everyone. Today, we offer over 500 carefully selected plant species, each chosen for its unique beauty and easy care needs.',
                        'We believe that everyone deserves to experience the joy of nurturing plants, and we\'re here to guide you every step of the way with expert advice, quality products, and a passionate community of plant lovers.',
                    ],
                    'button' => ['label' => 'Learn More', 'path' => '/plants'],
                    'image' => '/images/about-story.jpg',
                    'image_alt' => 'Plant care',
                    'quote_text' => '"We\'re not just selling plants; we\'re nurturing a greener, healthier future for everyone."',
                    'quote_author' => '- Sarah Johnson, Founder',
                ],
                'mission' => [
                    'title' => 'Our Mission & Vision',
                    'subtitle' => 'We\'re committed to making the world greener, one plant at a time.',
                    'cards' => [
                        [
                            'icon' => 'Leaf',
                            'title' => 'Our Mission',
                            'text' => 'To inspire and empower people to connect with nature by providing high-quality plants, expert guidance, and sustainable practices that make plant ownership a joyful, accessible, enjoyable, and rewarding for everybody, from beginners to experienced gardeners.',
                        ],
                        [
                            'icon' => 'Globe',
                            'title' => 'Our Vision',
                            'text' => 'To become the leading platform for plant enthusiasts worldwide, fostering a global community where people learn, share, and grow together. We envision a future where every home and workspace is enhanced with living plants, contributing to healthier environments and happier lives.',
                        ],
                    ],
                ],
                'values' => [
                    'title' => 'Our Core Values',
                    'subtitle' => 'These principles guide everything we do at Cozy Care.',
                    'items' => [
                        [
                            'icon' => 'Leaf',
                            'title' => 'Sustainability',
                            'description' => 'We\'re committed to eco-friendly practices and sustainable sourcing for all our plants.',
                        ],
                        [
                            'icon' => 'Heart',
                            'title' => 'Quality Care',
                            'description' => 'Every plant receives expert care and attention from propagation to your home.',
                        ],
                        [
                            'icon' => 'Users',
                            'title' => 'Community',
                            'description' => 'Building a community of plant lovers who share knowledge and friendship.',
                        ],
                        [
                            'icon' => 'Award',
                            'title' => 'Excellence',
                            'description' => 'We strive for excellence in every aspect of our business and plant quality.',
                        ],
                    ],
                ],
                'why_choose_us' => [
                    'title' => 'Why Choose Cozy Care?',
                    'image' => '/images/about-plants.jpg',
                    'image_alt' => 'Beautiful plants',
                    'items' => [
                        [
                            'icon' => 'CheckCircle',
                            'title' => 'Quality Guarantee',
                            'description' => 'Every plant is carefully inspected and comes with a 30-day health guarantee.',
                        ],
                        [
                            'icon' => 'HeadphonesIcon',
                            'title' => 'Expert Support',
                            'description' => 'Our team of horticulturists is available to answer all your plant care questions.',
                        ],
                        [
                            'icon' => 'Leaf',
                            'title' => 'Sustainable Practices',
                            'description' => 'We use eco-friendly packaging and source from responsible growers.',
                        ],
                        [
                            'icon' => 'Globe',
                            'title' => 'Wide Selection',
                            'description' => 'Over 500 varieties of indoor and outdoor plants to suit every space and style.',
                        ],
                    ],
                ],
                'team' => [
                    'title' => 'Meet Our Team',
                    'subtitle' => 'The passionate people behind Cozy Care who make it all possible.',
                    'members' => [
                        [
                            'name' => 'Sarah Johnson',
                            'role' => 'Founder & CEO',
                            'bio' => 'Plant enthusiast with 15+ years of experience in horticulture.',
                            'image' => '/images/team-sarah.jpg',
                        ],
                        [
                            'name' => 'Michael Chen',
                            'role' => 'Head of Operations',
                            'bio' => 'Expert in supply chain and nursery management.',
                            'image' => '/images/team-michael.jpg',
                        ],
                        [
                            'name' => 'Emily Rodriguez',
                            'role' => 'Plant Care Specialist',
                            'bio' => 'Botanist passionate about helping plants thrive in any environment.',
                            'image' => '/images/team-emily.jpg',
                        ],
                        [
                            'name' => 'David Thompson',
                            'role' => 'Customer Experience',
                            'bio' => 'Dedicated to ensuring every customer finds their perfect plant.',
                            'image' => '/images/team-david.jpg',
                        ],
                    ],
                ],
                'cta' => [
                    'title' => 'Ready to Start Your Plant Journey?',
                    'subtitle' => 'Join thousands of happy customers and bring nature into your home today.',
                    'primary_cta' => ['label' => 'Shop Plants', 'path' => '/plants'],
                    'secondary_cta' => ['label' => 'Contact Us', 'path' => '/contact'],
                ],
            ],
            'our_mission' => [
                'hero' => [
                    'eyebrow' => 'Our Purpose',
                    'title' => 'Growing Better Plant Habits, One Home at a Time',
                    'lead' => 'Cozy Care exists to make plant parenting simple, rewarding, and sustainable. We combine care knowledge, thoughtful products, and everyday support so anyone can build a thriving indoor garden without feeling overwhelmed.',
                    'image' => '/images/mission-hero.jpg',
                    'image_alt' => 'Indoor plants arranged in a calm, cozy home setting',
                    'floating_note_top' => 'Plant care should feel calm, not confusing.',
                    'floating_note_bottom' => 'Designed for real homes, real routines, and long-term care.',
                    'primary_cta' => [
                        'label' => 'Explore Plants',
                        'path' => '/plants',
                    ],
                    'secondary_cta' => [
                        'label' => 'Read Care Tips',
                        'path' => '/care-tips',
                    ],
                    'highlights' => [
                        ['label' => 'Beginner-first guidance', 'value' => 'Simple care advice'],
                        ['label' => 'Thoughtful shopping', 'value' => 'Plants that fit real homes'],
                        ['label' => 'Long-term support', 'value' => 'Tips that continue after checkout'],
                    ],
                ],
                'story' => [
                    'kicker' => 'Why We Built Cozy Care',
                    'title' => 'We are designing a friendlier plant experience from the start.',
                    'description' => 'Many people love the idea of plants but feel unsure once they bring one home. Our mission is to remove that friction through better guidance, better product choices, and a more supportive journey after someone buys.',
                    'bullets' => [
                        'Less guesswork when choosing plants',
                        'More confidence in everyday care',
                        'Support that continues beyond checkout',
                    ],
                    'quote_text' => 'A plant should feel like a long-term companion, not a short-term risk.',
                    'quote_caption' => 'The Cozy Care approach',
                ],
                'pillars_section' => [
                    'kicker' => 'What Drives Us',
                    'title' => 'The principles behind every recommendation we make',
                    'pillars' => [
                        [
                            'eyebrow' => 'Learn',
                            'title' => 'Care Education',
                            'description' => 'Teach practical plant care in simple language so beginners and enthusiasts can grow with confidence.',
                        ],
                        [
                            'eyebrow' => 'Live Better',
                            'title' => 'Healthy Homes',
                            'description' => 'Help more families create greener, healthier spaces with the right plants, routines, and support.',
                        ],
                        [
                            'eyebrow' => 'Choose Wisely',
                            'title' => 'Responsible Growth',
                            'description' => 'Promote mindful shopping and better long-term care so plants thrive instead of being replaced.',
                        ],
                    ],
                ],
                'support_section' => [
                    'kicker' => 'How We Deliver It',
                    'title' => 'A clearer journey for plant parents at every stage',
                    'steps' => [
                        [
                            'step' => '01',
                            'title' => 'Discover plants that fit your lifestyle',
                            'description' => 'We want customers to choose plants based on light, time, and space, not only appearance.',
                        ],
                        [
                            'step' => '02',
                            'title' => 'Get clear help before problems grow',
                            'description' => 'Care tips, product guidance, and practical advice should be easy to understand and easy to use.',
                        ],
                        [
                            'step' => '03',
                            'title' => 'Build routines that last',
                            'description' => 'Our goal is not one good delivery. It is helping people keep their plants healthy long after purchase.',
                        ],
                    ],
                ],
                'vision' => [
                    'kicker' => 'Our Vision',
                    'title' => 'Make greenery feel accessible, personal, and lasting.',
                    'description' => 'We envision a future where caring for plants becomes part of daily wellness. A home where greenery is accessible to everyone, and people feel confident nurturing what they grow.',
                ],
                'impact' => [
                    'kicker' => 'How We Measure Impact',
                    'title' => 'We care about outcomes, not just orders.',
                    'goals' => [
                        'Guided care journeys for first-time plant parents',
                        'Reliable product recommendations based on lifestyle',
                        'Seasonal tips tailored for local conditions',
                        'A friendly support experience from browsing to delivery',
                    ],
                ],
            ],
            default => [],
        };
    }
}
