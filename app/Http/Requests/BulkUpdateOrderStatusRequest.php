<?php

namespace App\Http\Requests;

use App\Enums\OrderStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BulkUpdateOrderStatusRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->isAdmin();
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'order_ids' => [
                'required',
                'array',
                'min:1',
                'max:50', // Limit bulk operations
            ],
            'order_ids.*' => [
                'required',
                'integer',
                'exists:orders,id',
            ],
            'status' => [
                'required',
                'string',
                Rule::in(OrderStatus::values()),
            ],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'order_ids.required' => 'At least one order must be selected.',
            'order_ids.array' => 'Order IDs must be an array.',
            'order_ids.min' => 'At least one order must be selected.',
            'order_ids.max' => 'Cannot update more than 50 orders at once.',
            'order_ids.*.required' => 'Order ID is required.',
            'order_ids.*.integer' => 'Order ID must be an integer.',
            'order_ids.*.exists' => 'One or more selected orders do not exist.',
            'status.required' => 'Status is required.',
            'status.in' => 'Invalid status selected.',
            'notes.max' => 'Notes must not exceed 500 characters.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'order_ids' => 'selected orders',
            'order_ids.*' => 'order ID',
            'status' => 'new status',
            'notes' => 'status change notes',
        ];
    }
}
