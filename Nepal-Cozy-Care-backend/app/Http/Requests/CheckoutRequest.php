<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'shipping_name' => ['required', 'string', 'max:255'],
            'shipping_phone' => ['required', 'string', 'max:30'],
            'shipping_city' => ['required', 'string', 'max:120'],
            'shipping_address' => ['required', 'string', 'max:255'],
            'location_notes' => ['nullable', 'string', 'max:1000'],
            'preferred_contact_method' => ['required', 'in:phone,whatsapp,email'],
        ];
    }
}

