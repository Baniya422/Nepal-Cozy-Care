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
}

