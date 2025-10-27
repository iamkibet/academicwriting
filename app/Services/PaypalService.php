<?php

namespace App\Services;

use Srmklive\PayPal\Services\PayPal as PayPalClient;
use Exception;

class PaypalService
{
    private ?PayPalClient $provider = null;

    /**
     * Get PayPal provider instance
     */
    private function getProvider(): PayPalClient
    {
        if ($this->provider === null) {
            $this->provider = new PayPalClient();
            
            // Set PayPal configuration
            $mode = config('paypal.mode', 'sandbox');
            
            $config = [
                'mode' => $mode,
                'sandbox' => [
                    'client_id' => config('paypal.sandbox.client_id'),
                    'client_secret' => config('paypal.sandbox.client_secret'),
                    'app_id' => config('paypal.sandbox.app_id'),
                ],
                'live' => [
                    'client_id' => config('paypal.live.client_id'),
                    'client_secret' => config('paypal.live.client_secret'),
                    'app_id' => config('paypal.live.app_id'),
                ],
                'payment_action' => config('paypal.payment_action', 'Sale'),
                'currency' => config('paypal.currency', 'USD'),
                'notify_url' => config('paypal.notify_url', ''),
                'locale' => config('paypal.locale', 'en_US'),
                'validate_ssl' => config('paypal.validate_ssl', true),
            ];

            $this->provider->setApiCredentials($config);
        }

        return $this->provider;
    }

    /**
     * Check if PayPal is configured
     */
    private function isConfigured(): bool
    {
        $mode = config('paypal.mode', 'sandbox');
        return !empty(config("paypal.{$mode}.client_id")) && 
               !empty(config("paypal.{$mode}.client_secret"));
    }

    /**
     * Create payment for wallet top-up
     */
    public function createWalletTopUpPayment(float $amount, int $userId, string $returnUrl, string $cancelUrl): array
    {
        try {
            // Check if PayPal is configured
            if (!$this->isConfigured()) {
                return [
                    'success' => false,
                    'message' => 'PayPal is not configured. Please contact support.',
                ];
            }

            $data = [
                'items' => [
                    [
                        'name' => 'Wallet Top-Up',
                        'price' => $amount,
                        'desc' => "Wallet top-up of $amount USD",
                        'qty' => 1
                    ]
                ],
                'invoice_id' => 'WALLET-' . $userId . '-' . time(),
                'invoice_description' => "Wallet top-up #{$userId}",
                'return_url' => $returnUrl,
                'cancel_url' => $cancelUrl,
                'total' => $amount,
            ];

            $response = $this->getProvider()->setExpressCheckout($data);

            if (isset($response['paypal_link'])) {
                return [
                    'success' => true,
                    'paypal_link' => $response['paypal_link'],
                    'token' => $response['TOKEN'] ?? null,
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to create PayPal payment',
                'error' => $response,
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Create payment for order
     */
    public function createOrderPayment(array $orderData, string $returnUrl, string $cancelUrl): array
    {
        try {
            // Check if PayPal is configured
            if (!$this->isConfigured()) {
                return [
                    'success' => false,
                    'message' => 'PayPal is not configured. Please contact support.',
                ];
            }

            $total = 0;
            $items = [];

            // Convert order data to PayPal format
            if (isset($orderData['items'])) {
                foreach ($orderData['items'] as $item) {
                    $items[] = [
                        'name' => $item['name'] ?? 'Order Item',
                        'price' => $item['price'] ?? 0,
                        'desc' => $item['description'] ?? '',
                        'qty' => $item['quantity'] ?? 1,
                    ];
                    $total += ($item['price'] ?? 0) * ($item['quantity'] ?? 1);
                }
            } else {
                // Simple single item format
                $items[] = [
                    'name' => $orderData['title'] ?? 'Order',
                    'price' => $orderData['total'] ?? $orderData['price'] ?? 0,
                    'desc' => $orderData['description'] ?? '',
                    'qty' => 1,
                ];
                $total = $orderData['total'] ?? $orderData['price'] ?? 0;
            }

            $data = [
                'items' => $items,
                'invoice_id' => 'ORDER-' . ($orderData['order_id'] ?? time()),
                'invoice_description' => "Order #{$orderData['order_id']}",
                'return_url' => $returnUrl,
                'cancel_url' => $cancelUrl,
                'total' => $total,
            ];

            // Apply discount if available
            if (isset($orderData['discount']) && $orderData['discount'] > 0) {
                $data['shipping_discount'] = round($orderData['discount'], 2);
            }

            $response = $this->getProvider()->setExpressCheckout($data);

            if (isset($response['paypal_link'])) {
                return [
                    'success' => true,
                    'paypal_link' => $response['paypal_link'],
                    'token' => $response['TOKEN'] ?? null,
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to create PayPal payment',
                'error' => $response,
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get express checkout details
     */
    public function getExpressCheckoutDetails(string $token): array
    {
        try {
            $response = $this->getProvider()->getExpressCheckoutDetails($token);
            return [
                'success' => true,
                'data' => $response,
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Complete express checkout payment
     */
    public function doExpressCheckoutPayment(array $data, string $token, string $payerId): array
    {
        try {
            $response = $this->getProvider()->doExpressCheckoutPayment($data, $token, $payerId);

            if (isset($response['PAYMENTINFO_0_PAYMENTSTATUS']) && $response['PAYMENTINFO_0_PAYMENTSTATUS'] === 'Completed') {
                return [
                    'success' => true,
                    'transaction_id' => $response['PAYMENTINFO_0_TRANSACTIONID'] ?? null,
                    'amount' => $response['PAYMENTINFO_0_AMT'] ?? null,
                    'currency' => $response['PAYMENTINFO_0_CURRENCYCODE'] ?? null,
                    'data' => $response,
                ];
            }

            return [
                'success' => false,
                'message' => 'Payment not completed',
                'data' => $response,
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Refund a transaction
     */
    public function refundTransaction(string $transactionId, ?float $amount = null): array
    {
        try {
            $response = $this->getProvider()->refundTransaction($transactionId, $amount);

            if (isset($response['ACK']) && $response['ACK'] === 'Success') {
                return [
                    'success' => true,
                    'refund_transaction_id' => $response['REFUNDTRANSACTIONID'] ?? null,
                    'refund_amount' => $response['GROSSREFUNDAMT'] ?? null,
                    'data' => $response,
                ];
            }

            return [
                'success' => false,
                'message' => 'Refund failed',
                'data' => $response,
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }
}
