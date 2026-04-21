<?php

namespace Tests\Unit;

use App\Models\CareTip;
use Tests\TestCase;

class CareTipTest extends TestCase
{
    public function test_get_category_label_returns_correct_value()
    {
        $tip = new CareTip(['category' => 'watering']);
        $this->assertEquals('Watering', $tip->getCategoryLabel());
        
        $tip2 = new CareTip(['category' => 'unknown']);
        $this->assertEquals('unknown', $tip2->getCategoryLabel());
    }

    public function test_get_difficulty_label_returns_correct_value()
    {
        $tip = new CareTip(['difficulty' => 'beginner']);
        $this->assertEquals('Beginner', $tip->getDifficultyLabel());
    }
}
