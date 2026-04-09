<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('content_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('key')->unique();
            $table->boolean('is_active')->default(true);
            $table->json('payload');
            $table->timestamps();
        });

        DB::table('content_templates')->insert([
            [
                'name' => 'Our Mission Page',
                'key' => 'our_mission',
                'is_active' => true,
                'payload' => json_encode([
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
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'About Page',
                'key' => 'about_page',
                'is_active' => true,
                'payload' => json_encode([
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
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('content_templates');
    }
};
