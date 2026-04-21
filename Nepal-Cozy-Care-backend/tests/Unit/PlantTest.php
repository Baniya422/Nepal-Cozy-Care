<?php

namespace Tests\Unit;

use App\Models\Plant;
use Tests\TestCase;

class PlantTest extends TestCase
{
    public function test_is_accessory_returns_true_for_pots()
    {
        $plant = new Plant(['category' => 'Pots']);
        $this->assertTrue($plant->isAccessory());
    }

    public function test_is_accessory_returns_true_for_tools()
    {
        $plant = new Plant(['category' => 'Garden Tools']);
        $this->assertTrue($plant->isAccessory());
    }

    public function test_is_accessory_returns_false_for_plants()
    {
        $plant = new Plant(['category' => 'Outdoor Plants']);
        $this->assertFalse($plant->isAccessory());
    }

    public function test_is_accessory_is_case_insensitive()
    {
        $plant = new Plant(['category' => 'soil']);
        $this->assertTrue($plant->isAccessory());
    }
}
