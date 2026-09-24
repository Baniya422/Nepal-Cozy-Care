<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBlogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $blogId = $this->route('id');

        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:blogs,slug,'.$blogId],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'content' => ['sometimes', 'required', 'string'],
            'image' => ['nullable'],
            'author_role' => ['nullable', 'string', 'max:150'],
            'author_bio' => ['nullable', 'string', 'max:2000'],
            'author_image' => ['nullable', 'string', 'max:2048'],
            'read_time' => ['nullable', 'string', 'max:50'],
            'tags' => ['nullable', 'array', 'max:30'],
            'tags.*' => ['string', 'max:100'],
            'tips' => ['nullable', 'array', 'max:30'],
            'tips.*' => ['string', 'max:1000'],
            'takeaways' => ['nullable', 'array', 'max:30'],
            'takeaways.*' => ['string', 'max:1000'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'author' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'string', 'max:50'],
            'is_published' => ['nullable', 'boolean'],
            'is_top_trend' => ['nullable', 'boolean'],
            'is_top_story' => ['nullable', 'boolean'],
        ];
    }
}
