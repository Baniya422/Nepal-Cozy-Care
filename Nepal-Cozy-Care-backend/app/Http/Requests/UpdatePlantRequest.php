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
        $rules = [
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
            'is_active' => ['nullable'],
            'is_popular_item' => ['nullable'],
            'is_best_seller' => ['nullable'],
            'supplier_id' => ['nullable', 'exists:suppliers,id'],
            'wholesale_price' => ['nullable', 'numeric', 'min:0'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
        ];

        if ($this->hasFile('image')) {
            $rules['image'] = ['nullable', 'file', 'image', 'max:8192'];
        } else {
            $rules['image'] = ['nullable', 'string'];
        }

        return $rules;
    }
}
