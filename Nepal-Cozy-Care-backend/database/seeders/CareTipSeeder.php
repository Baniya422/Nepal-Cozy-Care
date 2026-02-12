<?php

namespace Database\Seeders;

use App\Models\CareTip;
use App\Models\User;
use Illuminate\Database\Seeder;

class CareTipSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::where('email', 'admin@cozycare.com')->first() 
            ?? User::first();

        if (!$admin) {
            $this->command->warn('No user found. Please run UserSeeder first.');
            return;
        }

        $careTips = [
            [
                'title' => 'How to Water Your Cactus: A Complete Guide',
                'slug' => 'how-to-water-your-cactus',
                'excerpt' => 'Learn the essential techniques for watering cacti to keep them healthy and thriving.',
                'content' => '<h2>Understanding Cactus Watering Needs</h2>
<p>Cacti are desert plants that have adapted to survive in arid conditions. Overwatering is the most common cause of cactus death.</p>

<h3>How Often to Water</h3>
<ul>
<li><strong>Spring/Summer:</strong> Water every 2-3 weeks when soil is completely dry</li>
<li><strong>Fall/Winter:</strong> Water once a month or less</li>
<li><strong>Always check soil moisture</strong> before watering</li>
</ul>

<h3>Watering Technique</h3>
<ol>
<li>Use room temperature water</li>
<li>Water deeply until it drains from bottom</li>
<li>Never let cactus sit in water</li>
<li>Ensure pot has drainage holes</li>
</ol>

<h3>Signs of Overwatering</h3>
<p>Yellowing, mushy stems, or black spots indicate overwatering. Stop watering immediately if you see these signs.</p>',
                'category' => 'watering',
                'difficulty' => 'beginner',
                'plant_ids' => [],
                'views_count' => 1250,
            ],
            [
                'title' => 'Fixing Yellow Leaves on Houseplants',
                'slug' => 'fixing-yellow-leaves-houseplants',
                'excerpt' => 'Yellow leaves are a common problem. Learn to diagnose and fix the underlying causes.',
                'content' => '<h2>Why Are My Plant Leaves Turning Yellow?</h2>
<p>Yellow leaves are your plant\'s way of telling you something is wrong. Here are the most common causes and solutions.</p>

<h3>1. Overwatering</h3>
<p>The #1 cause of yellow leaves. Check if soil is soggy and let it dry out completely before watering again.</p>

<h3>2. Underwatering</h3>
<p>If leaves are yellow AND crispy, your plant needs more water. Increase watering frequency gradually.</p>

<h3>3. Nutrient Deficiency</h3>
<p>Yellowing between leaf veins often indicates lack of nitrogen. Use a balanced fertilizer monthly.</p>

<h3>4. Poor Drainage</h3>
<p>Ensure your pot has drainage holes and use well-draining potting mix.</p>

<h3>5. Natural Aging</h3>
<p>Older leaves naturally yellow and drop. This is normal if only bottom leaves are affected.</p>',
                'category' => 'pest_control',
                'difficulty' => 'beginner',
                'plant_ids' => [],
                'views_count' => 2100,
            ],
            [
                'title' => 'Indoor Plant Fertilizing Schedule',
                'slug' => 'indoor-plant-fertilizing-schedule',
                'excerpt' => 'Master the art of feeding your indoor plants with this comprehensive fertilizing guide.',
                'content' => '<h2>When and How to Fertilize Indoor Plants</h2>
<p>Feeding your plants properly is essential for healthy growth and vibrant foliage.</p>

<h3>Best Fertilizers for Indoor Plants</h3>
<ul>
<li><strong>Liquid fertilizers:</strong> Easy to apply and control dosage</li>
<li><strong>Slow-release granules:</strong> Set-and-forget option</li>
<li><strong>Organic options:</strong> Compost tea, worm castings, fish emulsion</li>
</ul>

<h3>Fertilizing Schedule</h3>
<table>
<tr><td>Spring</td><td>Every 2 weeks</td></tr>
<tr><td>Summer</td><td>Every 2-3 weeks</td></tr>
<tr><td>Fall</td><td>Monthly</td></tr>
<tr><td>Winter</td><td>Pause fertilizing</td></tr>
</table>

<h3>Tips for Success</h3>
<p>Always water before fertilizing, never fertilize dry soil. Use half-strength for sensitive plants.</p>',
                'category' => 'fertilizing',
                'difficulty' => 'intermediate',
                'plant_ids' => [],
                'views_count' => 890,
            ],
            [
                'title' => 'Winter Plant Care: Protecting Your Plants',
                'slug' => 'winter-plant-care-guide',
                'excerpt' => 'Essential tips for keeping your plants healthy during the cold winter months.',
                'content' => '<h2>Winter Plant Care Essentials</h2>
<p>Winter brings challenges like low light, dry air, and temperature fluctuations. Here\'s how to help your plants thrive.</p>

<h3>Light Requirements</h3>
<p>Move plants closer to windows. Clean windows to maximize light. Consider grow lights for high-light plants.</p>

<h3>Humidity Solutions</h3>
<ul>
<li>Use a humidifier near plants</li>
<li>Group plants together</li>
<li>Place pots on pebble trays with water</li>
<li>Mist tropical plants regularly</li>
</ul>

<h3>Watering Adjustments</h3>
<p>Reduce watering frequency by 30-50%. Plants grow slower in winter and need less water.</p>

<h3>Temperature Tips</h3>
<p>Keep plants away from cold drafts and heating vents. Most indoor plants prefer 65-75°F (18-24°C).</p>',
                'category' => 'seasonal',
                'difficulty' => 'beginner',
                'plant_ids' => [],
                'views_count' => 1560,
            ],
            [
                'title' => 'Snake Plant Care: The Ultimate Guide',
                'slug' => 'snake-plant-care-guide',
                'excerpt' => 'Everything you need to know about growing and caring for snake plants (Sansevieria).',
                'content' => '<h2>Snake Plant Care 101</h2>
<p>Snake plants are perfect for beginners - they\'re nearly indestructible and thrive on neglect!</p>

<h3>Quick Care Summary</h3>
<div style="background:#f0fdf4;padding:15px;border-radius:8px;margin:15px 0;">
<strong>Water:</strong> Every 2-6 weeks<br>
<strong>Light:</strong> Low to bright indirect<br>
<strong>Difficulty:</strong> Very Easy<br>
<strong>Temperature:</strong> 55-85°F (13-29°C)
</div>

<h3>Watering</h3>
<p>Let soil dry completely between waterings. In winter, water once a month. Overwatering causes root rot.</p>

<h3>Light Requirements</h3>
<p>Snake plants tolerate low light but grow faster in bright, indirect light. Avoid harsh direct sun.</p>

<h3>Propagation</h3>
<p>Easily propagate by leaf cuttings or division. Cut a healthy leaf into 3-inch sections and plant in soil.</p>',
                'category' => 'indoor',
                'difficulty' => 'beginner',
                'plant_ids' => [],
                'views_count' => 3200,
            ],
            [
                'title' => 'Getting Rid of Fungus Gnats',
                'slug' => 'getting-rid-of-fungus-gnats',
                'excerpt' => 'Effective methods to eliminate fungus gnats and prevent them from returning.',
                'content' => '<h2>Fungus Gnat Control Guide</h2>
<p>Those tiny flying insects around your plants are fungus gnats. They\'re annoying but relatively harmless to healthy plants.</p>

<h3>Why You Have Fungus Gnats</h3>
<p>They thrive in moist soil with organic matter. Overwatering is the main cause of infestations.</p>

<h3>Immediate Solutions</h3>
<ol>
<li><strong>Let soil dry out:</strong> Gnat larvae need moisture to survive</li>
<li><strong>Yellow sticky traps:</strong> Catch adult gnats</li>
<li><strong>Top dress with sand:</strong> Prevents adults from laying eggs</li>
<li><strong>Hydrogen peroxide drench:</strong> 1:4 ratio with water kills larvae</li>
</ol>

<h3>Long-term Prevention</h3>
<ul>
<li>Water only when top inch of soil is dry</li>
<li>Use well-draining potting mix</li>
<li>Remove dead leaves and debris</li>
<li>Consider bottom watering</li>
</ul>',
                'category' => 'pest_control',
                'difficulty' => 'intermediate',
                'plant_ids' => [],
                'views_count' => 1850,
            ],
            [
                'title' => 'Outdoor Plant Watering Guide',
                'slug' => 'outdoor-plant-watering-guide',
                'excerpt' => 'Learn the best practices for watering outdoor plants, gardens, and container plants.',
                'content' => '<h2>Outdoor Plant Watering Best Practices</h2>
<p>Outdoor plants have different watering needs than indoor plants due to weather exposure and soil conditions.</p>

<h3>Watering Schedule by Season</h3>
<ul>
<li><strong>Spring:</strong> 2-3 times per week</li>
<li><strong>Summer:</strong> Daily or every other day</li>
<li><strong>Fall:</strong> 1-2 times per week</li>
<li><strong>Winter:</strong> Minimal watering (dormant season)</li>
</ul>

<h3>Best Time to Water</h3>
<p>Early morning (6-10 AM) is ideal. Avoid evening watering which can promote fungal diseases.</p>

<h3>Watering Techniques</h3>
<p>Water deeply and less frequently to encourage deep root growth. Light, frequent watering creates shallow roots.</p>

<h3>Container Plants</h3>
<p>Pots dry out faster than garden soil. Check daily in hot weather. Use mulch to retain moisture.</p>',
                'category' => 'outdoor',
                'difficulty' => 'beginner',
                'plant_ids' => [],
                'views_count' => 720,
            ],
            [
                'title' => 'Monstera Deliciosa Advanced Care',
                'slug' => 'monstera-deliciosa-advanced-care',
                'excerpt' => 'Take your Monstera care to the next level with these expert tips and techniques.',
                'content' => '<h2>Advanced Monstera Care</h2>
<p>Ready to become a Monstera master? These advanced techniques will help your Swiss Cheese Plant thrive.</p>

<h3>Achieving Fenestration</h3>
<p>Those iconic splits only appear on mature plants. To encourage fenestration:</p>
<ul>
<li>Provide bright, indirect light</li>
<li>Ensure adequate humidity (60%+)</li>
<li>Allow plant to mature (2+ years old)</li>
<li>Use moss poles for climbing support</li>
</ul>

<h3>Pruning for Shape</h3>
<p>Prune in spring to control size and encourage bushier growth. Cut just above a node at a 45-degree angle.</p>

<h3>Advanced Propagation</h3>
<p>Air layering is the most reliable method for large cuttings. Wrap a node with damp sphagnum moss and plastic wrap until roots form.</p>

<h3>Common Advanced Issues</h3>
<p>Brown edges: Low humidity or salt buildup. Flush soil monthly.<br>
No fenestration: Insufficient light or immature plant.<br>
Leggy growth: Increase light exposure gradually.</p>',
                'category' => 'indoor',
                'difficulty' => 'advanced',
                'plant_ids' => [],
                'views_count' => 2450,
            ],
        ];

        foreach ($careTips as $tip) {
            CareTip::create([
                'user_id' => $admin->id,
                'title' => $tip['title'],
                'slug' => $tip['slug'],
                'excerpt' => $tip['excerpt'],
                'content' => $tip['content'],
                'category' => $tip['category'],
                'difficulty' => $tip['difficulty'],
                'plant_ids' => $tip['plant_ids'],
                'views_count' => $tip['views_count'],
                'is_published' => true,
                'published_at' => now(),
            ]);
        }

        $this->command->info('Care tips seeded successfully!');
    }
}
