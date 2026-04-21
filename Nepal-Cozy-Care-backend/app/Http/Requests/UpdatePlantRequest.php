<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePlantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'scientific_name' => ['nullable', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:255'],
            'size' => ['nullable', 'string', 'max:50'],
            'difficulty' => ['nullable', 'string', 'max:50'],
            'light' => ['nullable', 'string', 'max:100'],
            'water' => ['nullable', 'string', 'max:100'],
            'temperature' => ['nullable', 'string', 'max:50'],
            'humidity' => ['nullable', 'string', 'max:50'],
            'rooms' => ['nullable', 'array'],
            'rooms.*' => ['string', 'max:100'],
            'fertilizer' => ['nullable', 'string', 'max:100'],
            'soil' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'survival_guide' => ['nullable', 'string'],
            'care_instructions' => ['nullable', 'string'],
            'price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'stock' => ['sometimes', 'required', 'integer', 'min:0'],
            'image' => ['nullable', 'file', 'image', 'max:2048'], // 2MB max
            'is_active' => ['nullable'],
            'is_popular_item' => ['nullable', 'boolean'],
            'is_best_seller' => ['nullable', 'boolean'],
        ];
    }
}
