<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;

class ImageCompressionService
{
    /**
     * Compress and resize an uploaded image file using PHP GD.
     *
     * @param UploadedFile $file
     * @param int $maxWidth
     * @param int $maxHeight
     * @param int $quality
     * @return string Temporary path to compressed file, or original path if compression skipped
     */
    public function compress(
        UploadedFile $file,
        int $maxWidth = 1600,
        int $maxHeight = 1600,
        int $quality = 82
    ): string {
        $mime = $file->getMimeType();

        // Only compress supported raster images (skip gif animations and svgs)
        if (!in_array($mime, ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'], true)) {
            return $file->getRealPath();
        }

        if (!extension_loaded('gd')) {
            return $file->getRealPath();
        }

        $sourcePath = $file->getRealPath();
        $image = match ($mime) {
            'image/jpeg', 'image/jpg' => @imagecreatefromjpeg($sourcePath),
            'image/png' => @imagecreatefrompng($sourcePath),
            'image/webp' => @imagecreatefromwebp($sourcePath),
            default => null,
        };

        if (!$image) {
            return $sourcePath;
        }

        $origWidth = imagesx($image);
        $origHeight = imagesy($image);

        // Calculate target dimensions
        $targetWidth = $origWidth;
        $targetHeight = $origHeight;

        if ($origWidth > $maxWidth || $origHeight > $maxHeight) {
            if ($origWidth > $origHeight) {
                $targetHeight = (int) round(($origHeight * $maxWidth) / $origWidth);
                $targetWidth = $maxWidth;
            } else {
                $targetWidth = (int) round(($origWidth * $maxHeight) / $origHeight);
                $targetHeight = $maxHeight;
            }
        }

        // Create new truecolor canvas
        $canvas = imagecreatetruecolor($targetWidth, $targetHeight);

        // Handle transparency for PNG/WebP
        if ($mime === 'image/png' || $mime === 'image/webp') {
            imagealphablending($canvas, false);
            imagesavealpha($canvas, true);
            $transparent = imagecolorallocatealpha($canvas, 255, 255, 255, 127);
            imagefilledrectangle($canvas, 0, 0, $targetWidth, $targetHeight, $transparent);
        }

        imagecopyresampled(
            $canvas,
            $image,
            0,
            0,
            0,
            0,
            $targetWidth,
            $targetHeight,
            $origWidth,
            $origHeight
        );

        $tempPath = tempnam(sys_get_temp_dir(), 'cozy_img_');

        $saved = false;
        if (function_exists('imagewebp')) {
            $tempPathWithExt = $tempPath . '.webp';
            $saved = @imagewebp($canvas, $tempPathWithExt, $quality);
            if ($saved) {
                @unlink($tempPath);
                $tempPath = $tempPathWithExt;
            }
        }

        if (!$saved) {
            $tempPathWithExt = $tempPath . '.jpg';
            $saved = @imagejpeg($canvas, $tempPathWithExt, $quality);
            if ($saved) {
                @unlink($tempPath);
                $tempPath = $tempPathWithExt;
            }
        }

        imagedestroy($image);
        imagedestroy($canvas);

        // If compressed file is smaller, return it; otherwise return original
        if ($saved && file_exists($tempPath)) {
            if (filesize($tempPath) < $file->getSize()) {
                return $tempPath;
            }
            @unlink($tempPath);
        }

        return $sourcePath;
    }
}
