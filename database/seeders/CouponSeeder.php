<?php

namespace Database\Seeders;

use App\Models\Coupon;
use Illuminate\Database\Seeder;

class CouponSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $coupons = [
            [
                'code' => 'WELCOME10',
                'name' => 'Welcome Discount',
                'description' => 'Get 10% off your first order',
                'discount_type' => 'percentage',
                'discount_amount' => 10,
                'minimum_order_amount' => 50,
                'usage_limit' => 1000,
                'is_active' => true,
            ],
            [
                'code' => 'SAVE20',
                'name' => 'Save $20',
                'description' => 'Save $20 on orders over $100',
                'discount_type' => 'fixed',
                'discount_amount' => 20,
                'minimum_order_amount' => 100,
                'usage_limit' => 500,
                'is_active' => true,
            ],
            [
                'code' => 'STUDENT15',
                'name' => 'Student Discount',
                'description' => '15% off for all students',
                'discount_type' => 'percentage',
                'discount_amount' => 15,
                'minimum_order_amount' => 75,
                'usage_limit' => null, // unlimited
                'is_active' => true,
            ],
        ];

        foreach ($coupons as $coupon) {
            Coupon::create($coupon);
        }
    }
}
