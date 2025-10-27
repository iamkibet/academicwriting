<?php

namespace App\Http\Requests;

use App\Enums\OrderStatus;
use App\Models\Order;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOrderStatusRequest extends FormRequest
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
        $order = $this->route('order');
        
        return [
            'status' => [
                'required',
                'string',
                Rule::in(OrderStatus::values()),
                function ($attribute, $value, $fail) use ($order) {
                    if ($order && !$order->status->canTransitionTo(OrderStatus::from($value))) {
                        $fail("Cannot transition from {$order->status->value} to {$value}");
                    }
                },
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
            'status' => 'order status',
            'notes' => 'status change notes',
        ];
    }
}
