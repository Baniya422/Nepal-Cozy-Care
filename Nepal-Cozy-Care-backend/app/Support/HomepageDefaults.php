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
        ];
    }
}
