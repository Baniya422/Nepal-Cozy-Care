<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderConfirmationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'confirmation_status' => ['nullable', 'in:pending,contacted,location_confirmed'],
            'confirmation_notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
