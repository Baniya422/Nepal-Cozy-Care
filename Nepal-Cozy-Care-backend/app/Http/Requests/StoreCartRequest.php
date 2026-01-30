<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCartRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'plant_id' => ['required', 'exists:plants,id'],
            'quantity' => ['nullable', 'integer', 'min:1'],
        ];
    }
}

