<?php

namespace App\Http\Controllers;

use App\Services\WalletService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WalletController extends Controller
{
    public function __construct(
        private WalletService $walletService
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
}
