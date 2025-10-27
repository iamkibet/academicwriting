<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInquiryRequest;
use App\Http\Requests\UpdateInquiryRequest;
use App\Models\Inquiry;
use App\Services\PricingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class InquiryController extends Controller
{
    public function __construct(
        private PricingService $pricingService
    ) {}

    /**
     * Display a listing of the user's inquiries
     */
    public function index(Request $request): InertiaResponse
    {
        $user = $request->user();
        
        $status = $request->query('status', 'draft');
        
        $inquiries = $user->inquiries()
            ->with(['academicLevel', 'serviceType', 'discipline', 'language'])
            ->when($status !== 'all', function ($query) use ($status) {
                return $query->where('status', $status);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('inquiries/index', [
            'inquiries' => $inquiries,
            'filter' => $status,
        ]);
    }

    /**
     * Show the form for creating a new inquiry
     */
    public function create(): InertiaResponse
    {
        $pricingOptions = [
            'academic_levels' => $this->pricingService->getAcademicLevels(),
            'service_types' => $this->pricingService->getServiceTypes(),
            'deadline_types' => $this->pricingService->getDeadlineTypes(),
            'languages' => $this->pricingService->getLanguages(),
        ];

        return Inertia::render('inquiries/create', [
            'pricingOptions' => $pricingOptions,
        ]);
    }

    /**
     * Store a newly created inquiry
     */
    public function store(StoreInquiryRequest $request): RedirectResponse
    {
        $user = $request->user();

        $data = $request->validated();
        
        // Map topic to title if not set
        if (!isset($data['title']) && isset($data['topic'])) {
            $data['title'] = $data['topic'];
            unset($data['topic']);
        }
        
        $data['client_id'] = $user->id;
        $data['status'] = Inquiry::STATUS_DRAFT;

        // Process additional features if provided
        if (isset($data['additional_features']) && is_string($data['additional_features'])) {
            $data['additional_features'] = json_decode($data['additional_features'], true);
        }

        $inquiry = Inquiry::create($data);

        return redirect()->route('inquiries.show', $inquiry)
            ->with('success', 'Free inquiry created successfully!');
    }

    /**
     * Display the specified inquiry
     */
    public function show(Inquiry $inquiry, Request $request): InertiaResponse
    {
        $user = $request->user();

        // Check if user can view this inquiry
        if ($inquiry->client_id !== $user->id) {
            abort(403, 'Unauthorized to view this inquiry');
        }

        $inquiry->load(['academicLevel', 'serviceType', 'discipline', 'language', 'convertedOrder']);

        return Inertia::render('inquiries/show', [
            'inquiry' => $inquiry,
        ]);
    }

    /**
     * Show the form for editing the specified inquiry
     */
    public function edit(Inquiry $inquiry, Request $request): InertiaResponse
    {
        $user = $request->user();

        // Check if user can edit this inquiry
        if ($inquiry->client_id !== $user->id) {
            abort(403, 'Unauthorized to edit this inquiry');
        }

        // Can only edit draft inquiries
        if (!$inquiry->isDraft()) {
            return redirect()->route('inquiries.show', $inquiry)
                ->with('error', 'Only draft inquiries can be edited');
        }

        $pricingOptions = [
            'academic_levels' => $this->pricingService->getAcademicLevels(),
            'service_types' => $this->pricingService->getServiceTypes(),
            'deadline_types' => $this->pricingService->getDeadlineTypes(),
            'languages' => $this->pricingService->getLanguages(),
        ];

        return Inertia::render('inquiries/edit', [
            'inquiry' => $inquiry,
            'pricingOptions' => $pricingOptions,
        ]);
    }

    /**
     * Update the specified inquiry
     */
    public function update(UpdateInquiryRequest $request, Inquiry $inquiry): RedirectResponse
    {
        $user = $request->user();

        // Check if user can update this inquiry
        if ($inquiry->client_id !== $user->id) {
            abort(403, 'Unauthorized to update this inquiry');
        }

        // Can only update draft inquiries
        if (!$inquiry->isDraft()) {
            return redirect()->route('inquiries.show', $inquiry)
                ->with('error', 'Only draft inquiries can be updated');
        }

        $data = $request->validated();
        
        // Map topic to title if not set
        if (!isset($data['title']) && isset($data['topic'])) {
            $data['title'] = $data['topic'];
            unset($data['topic']);
        }

        // Process additional features if provided
        if (isset($data['additional_features']) && is_string($data['additional_features'])) {
            $data['additional_features'] = json_decode($data['additional_features'], true);
        }

        $inquiry->update($data);

        return redirect()->route('inquiries.show', $inquiry)
            ->with('success', 'Inquiry updated successfully!');
    }

    /**
     * Convert inquiry to order
     */
    public function convertToOrder(Inquiry $inquiry, Request $request): RedirectResponse
    {
        $user = $request->user();

        // Check if user can convert this inquiry
        if ($inquiry->client_id !== $user->id) {
            abort(403, 'Unauthorized to convert this inquiry');
        }

        // Can only convert draft or submitted inquiries
        if ($inquiry->isConverted()) {
            return redirect()->route('inquiries.show', $inquiry)
                ->with('error', 'This inquiry has already been converted to an order');
        }

        $order = $inquiry->convertToOrder();

        return redirect()->route('orders.show', $order)
            ->with('success', 'Inquiry converted to order successfully!');
    }

    /**
     * Remove the specified inquiry
     */
    public function destroy(Inquiry $inquiry, Request $request): RedirectResponse
    {
        $user = $request->user();

        // Check if user can delete this inquiry
        if ($inquiry->client_id !== $user->id) {
            abort(403, 'Unauthorized to delete this inquiry');
        }

        // Can only delete draft inquiries
        if (!$inquiry->isDraft()) {
            return redirect()->route('inquiries.index')
                ->with('error', 'Only draft inquiries can be deleted');
        }

        $inquiry->delete();

        return redirect()->route('inquiries.index')
            ->with('success', 'Inquiry deleted successfully!');
    }
}
