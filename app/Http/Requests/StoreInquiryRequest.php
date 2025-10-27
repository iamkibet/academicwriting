<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInquiryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->isClient() ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'title' => ['nullable', 'string', 'max:255'],
            'topic' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'academic_level_id' => ['nullable', 'exists:academic_levels,id'],
            'paper_type' => ['nullable', 'string', 'max:255'],
            'discipline_id' => ['nullable', 'exists:subjects,id'],
            'service_type_id' => ['nullable', 'exists:subjects,id'],
            'deadline_hours' => ['nullable', 'integer', 'min:1'],
            'language_id' => ['nullable', 'exists:languages,id'],
            'deadline_date' => ['nullable', 'date', 'after:now'],
            'pages' => ['nullable', 'integer', 'min:1', 'max:100'],
            'words' => ['nullable', 'integer', 'min:250'],
            'spacing' => ['nullable', 'in:single,double'],
            'paper_format' => ['nullable', 'string', 'max:50'],
            'number_of_sources' => ['nullable', 'integer', 'min:0', 'max:50'],
            'additional_features' => ['nullable', 'string'], // JSON string
            'client_notes' => ['nullable', 'string'],
            'estimated_price' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
