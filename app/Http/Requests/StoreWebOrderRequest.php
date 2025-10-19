<?php

namespace App\Http\Requests;

use App\Models\Order;
use App\Models\AcademicRate;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreWebOrderRequest extends FormRequest
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
            'topic' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'academic_level_id' => ['required', 'exists:academic_levels,id'],
            'service_type_id' => ['required', 'exists:service_types,id'],
            'deadline_hours' => [
                'required', 
                'integer', 
                'min:1',
                Rule::exists('academic_rates', 'hours')->where(function ($query) {
                    return $query->where('academic_level_id', $this->input('academic_level_id'))
                                 ->where('deleted', false);
                })
            ],
            'language_id' => ['required', 'exists:languages,id'],
            'deadline_date' => ['required', 'date', 'after:now'],
            'pages' => ['required', 'integer', 'min:1', 'max:100'],
            'words' => ['required', 'integer', 'min:250'],
            'spacing' => ['required', 'in:single,double'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'topic.required' => 'The order topic is required.',
            'topic.max' => 'The order topic may not be greater than 255 characters.',
            'description.required' => 'The order description is required.',
            'academic_level_id.required' => 'Please select an academic level.',
            'academic_level_id.exists' => 'The selected academic level is invalid.',
            'service_type_id.required' => 'Please select a service type.',
            'service_type_id.exists' => 'The selected service type is invalid.',
            'deadline_hours.required' => 'Please select a deadline.',
            'deadline_hours.exists' => 'The selected deadline is not available for this academic level.',
            'language_id.required' => 'Please select a language.',
            'language_id.exists' => 'The selected language is invalid.',
            'deadline_date.required' => 'Please select a deadline date.',
            'deadline_date.after' => 'The deadline date must be in the future.',
            'pages.required' => 'Please specify the number of pages.',
            'pages.integer' => 'The number of pages must be a whole number.',
            'pages.min' => 'The order must be at least 1 page.',
            'pages.max' => 'The order cannot exceed 100 pages.',
            'words.required' => 'Please specify the number of words.',
            'words.integer' => 'The number of words must be a whole number.',
            'words.min' => 'The order must be at least 250 words.',
            'spacing.required' => 'Please select a spacing option.',
            'spacing.in' => 'The spacing must be either single or double.',
        ];
    }
}
