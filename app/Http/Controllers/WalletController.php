<?php

namespace App\Http\Controllers;

use App\Services\WalletService;
use App\Services\PaypalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WalletController extends Controller
{
    public function __construct(
        private WalletService $walletService,
        private PaypalService $paypalService
    ) {}

    /**
     * Display wallet page
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        if (!$user->isClient()) {
            abort(403, 'Only clients can access this page');
        }

        $wallet = $this->walletService->getWalletBalance($user);
        $walletStats = $this->walletService->getWalletStatistics($user);
        
        $walletData = [
            'balance' => $wallet,
            'formatted_balance' => '$' . number_format($wallet, 2),
            'statistics' => $walletStats,
        ];

        return Inertia::render('client/wallet', [
            'wallet' => $walletData,
        ]);
    }

    /**
     * Initiate wallet top-up via PayPal
     */
    public function initiateTopUp(Request $request): RedirectResponse
    {
        $user = $request->user();

        if (!$user->isClient()) {
            return redirect()->back()->with('error', 'Only clients can top up their wallet');
        }

        $request->validate([
            'amount' => 'required|numeric|min:1|max:1000',
        ]);

        // Create PayPal payment
        $returnUrl = route('wallet.paypal.success');
        $cancelUrl = route('wallet.paypal.cancel');
        
        $payment = $this->paypalService->createWalletTopUpPayment(
            $request->amount,
            $user->id,
            $returnUrl,
            $cancelUrl
        );

        if ($payment['success']) {
            // Store payment info in session
            session([
                'wallet_topup_amount' => $request->amount,
                'wallet_topup_token' => $payment['token'],
            ]);

            return redirect($payment['paypal_link']);
        }

        return redirect()->back()->with('error', $payment['message'] ?? 'Failed to create PayPal payment');
    }

    /**
     * Handle PayPal success callback
     */
    public function paypalSuccess(Request $request)
    {
        $user = $request->user();
        $token = $request->query('token');
        $payerId = $request->query('PayerID');

        $amount = session('wallet_topup_amount');
        $storedToken = session('wallet_topup_token');

        if (!$token || !$payerId || !$amount || $token !== $storedToken) {
            return redirect()->route('wallet')->with('error', 'Invalid payment response');
        }

        // Get payment details
        $details = $this->paypalService->getExpressCheckoutDetails($token);

        if (!$details['success']) {
            return redirect()->route('wallet')->with('error', 'Failed to verify payment');
        }

        // Complete the payment
        $paymentData = [
            'items' => [
                [
                    'name' => 'Wallet Top-Up',
                    'price' => $amount,
                    'qty' => 1,
                ]
            ],
            'total' => $amount,
        ];

        $completion = $this->paypalService->doExpressCheckoutPayment($paymentData, $token, $payerId);

        if ($completion['success']) {
            // Add funds to wallet
            $result = $this->walletService->topUpWallet(
                $user,
                $amount,
                $completion['transaction_id']
            );

            if ($result['success']) {
                // Clear session data
                session()->forget(['wallet_topup_amount', 'wallet_topup_token']);

                return redirect()->route('wallet')->with('success', 'Wallet topped up successfully!');
            }
        }

        return redirect()->route('wallet')->with('error', 'Failed to complete payment');
    }

    /**
     * Handle PayPal cancel callback
     */
    public function paypalCancel(Request $request)
    {
        session()->forget(['wallet_topup_amount', 'wallet_topup_token']);
        
        return redirect()->route('wallet')->with('info', 'Payment cancelled');
    }
}
