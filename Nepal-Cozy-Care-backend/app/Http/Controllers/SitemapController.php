<?php

namespace App\Http\Controllers;

use App\Models\AdminSetting;
use App\Models\Blog;
use App\Models\CareTip;
use App\Models\Plant;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function index(): Response
    {
        $settings = AdminSetting::current();
        $isMarketplaceEnabled = $settings->vendor_marketplace_enabled;

        // Determine base URL: AdminSetting site_production_url > first FRONTEND_URL > APP_URL
        $baseUrl = $settings->site_production_url;
        if (! $baseUrl) {
            $frontendUrls = explode(',', (string) env('FRONTEND_URL', ''));
            $baseUrl = trim($frontendUrls[0] ?? '');
        }
        if (! $baseUrl) {
            $baseUrl = rtrim((string) config('app.url', 'https://nepal-cozy-care.onrender.com'), '/');
        }
        $baseUrl = rtrim($baseUrl, '/');

        $staticPages = [
            ['loc' => '/', 'changefreq' => 'daily', 'priority' => '1.0'],
            ['loc' => '/plants', 'changefreq' => 'daily', 'priority' => '0.9'],
            ['loc' => '/pots', 'changefreq' => 'weekly', 'priority' => '0.8'],
            ['loc' => '/popular-items', 'changefreq' => 'weekly', 'priority' => '0.8'],
            ['loc' => '/best-sellers', 'changefreq' => 'weekly', 'priority' => '0.8'],
            ['loc' => '/plant-finder', 'changefreq' => 'monthly', 'priority' => '0.7'],
            ['loc' => '/plant-health-checker', 'changefreq' => 'monthly', 'priority' => '0.7'],
            ['loc' => '/room-designer', 'changefreq' => 'monthly', 'priority' => '0.7'],
            ['loc' => '/care-tips', 'changefreq' => 'weekly', 'priority' => '0.8'],
            ['loc' => '/blogs', 'changefreq' => 'weekly', 'priority' => '0.8'],
            ['loc' => '/about', 'changefreq' => 'monthly', 'priority' => '0.6'],
            ['loc' => '/mission', 'changefreq' => 'monthly', 'priority' => '0.6'],
            ['loc' => '/shipping', 'changefreq' => 'monthly', 'priority' => '0.6'],
            ['loc' => '/contact', 'changefreq' => 'monthly', 'priority' => '0.6'],
            ['loc' => '/help-center', 'changefreq' => 'monthly', 'priority' => '0.6'],
        ];

        // Active plants
        $plants = Plant::marketplaceApproved()
            ->select(['id', 'updated_at'])
            ->get();

        // Published blogs
        $blogs = Blog::where('is_published', true)
            ->select(['id', 'slug', 'updated_at'])
            ->get();

        // Published care tips
        $careTips = CareTip::where('is_published', true)
            ->select(['id', 'slug', 'updated_at'])
            ->get();

        $xml = '<?xml version="1.0" encoding="UTF-8"?>'."\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'."\n";

        foreach ($staticPages as $page) {
            $xml .= "  <url>\n";
            $xml .= "    <loc>{$baseUrl}{$page['loc']}</loc>\n";
            $xml .= "    <changefreq>{$page['changefreq']}</changefreq>\n";
            $xml .= "    <priority>{$page['priority']}</priority>\n";
            $xml .= "  </url>\n";
        }

        foreach ($plants as $plant) {
            $lastmod = $plant->updated_at ? $plant->updated_at->toAtomString() : now()->toAtomString();
            $xml .= "  <url>\n";
            $xml .= "    <loc>{$baseUrl}/plants/{$plant->id}</loc>\n";
            $xml .= "    <lastmod>{$lastmod}</lastmod>\n";
            $xml .= "    <changefreq>weekly</changefreq>\n";
            $xml .= "    <priority>0.8</priority>\n";
            $xml .= "  </url>\n";
        }

        foreach ($blogs as $blog) {
            $lastmod = $blog->updated_at ? $blog->updated_at->toAtomString() : now()->toAtomString();
            $xml .= "  <url>\n";
            $xml .= "    <loc>{$baseUrl}/blogs/{$blog->id}</loc>\n";
            $xml .= "    <lastmod>{$lastmod}</lastmod>\n";
            $xml .= "    <changefreq>monthly</changefreq>\n";
            $xml .= "    <priority>0.7</priority>\n";
            $xml .= "  </url>\n";
        }

        foreach ($careTips as $tip) {
            $lastmod = $tip->updated_at ? $tip->updated_at->toAtomString() : now()->toAtomString();
            $xml .= "  <url>\n";
            $xml .= "    <loc>{$baseUrl}/care-tips/{$tip->id}</loc>\n";
            $xml .= "    <lastmod>{$lastmod}</lastmod>\n";
            $xml .= "    <changefreq>monthly</changefreq>\n";
            $xml .= "    <priority>0.7</priority>\n";
            $xml .= "  </url>\n";
        }

        $xml .= '</urlset>';

        return response($xml, 200, [
            'Content-Type' => 'application/xml',
        ]);
    }
}
