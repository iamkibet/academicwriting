<?php

namespace App\Http\Controllers;

use App\Models\AcademicLevel;
use App\Models\AcademicRate;
use App\Models\Subject;
use App\Models\OrderRate;
use App\Models\Language;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        return Inertia::render('settings/index');
    }

    public function academicLevels()
    {
        $academicLevels = AcademicLevel::with('activeRates')->get();

        return Inertia::render('settings/academic-levels', [
            'academicLevels' => $academicLevels,
        ]);
    }

    public function storeAcademicLevel(Request $request)
    {
        $request->validate([
            'level' => 'required|string|max:255',
        ]);

        AcademicLevel::create($request->only('level'));

        return redirect()->back()->with('success', 'Academic level created successfully.');
    }

    public function updateAcademicLevel(Request $request, AcademicLevel $academicLevel)
    {
        $request->validate([
            'level' => 'required|string|max:255',
        ]);

        $academicLevel->update($request->only('level'));

        return redirect()->back()->with('success', 'Academic level updated successfully.');
    }

    public function deleteAcademicLevel(AcademicLevel $academicLevel)
    {
        $academicLevel->delete();

        return redirect()->back()->with('success', 'Academic level deleted successfully.');
    }

    public function addAcademicRate(Request $request, AcademicLevel $academicLevel)
    {
        $request->validate([
            'hours' => 'required|integer|min:1',
            'label' => 'required|string|max:255',
            'cost' => 'required|numeric|min:0',
        ]);

        $academicLevel->rates()->create($request->only(['hours', 'label', 'cost']));

        return redirect()->back()->with('success', 'Rate added successfully.');
    }

    public function updateAcademicRate(Request $request, AcademicRate $academicRate)
    {
        $request->validate([
            'hours' => 'required|integer|min:1',
            'label' => 'required|string|max:255',
            'cost' => 'required|numeric|min:0',
        ]);

        $academicRate->update($request->only(['hours', 'label', 'cost']));

        return redirect()->back()->with('success', 'Rate updated successfully.');
    }

    public function deleteAcademicRate(AcademicRate $academicRate)
    {
        $academicRate->update(['deleted' => true]);

        return redirect()->back()->with('success', 'Rate deleted successfully.');
    }

    public function subjects()
    {
        $subjects = Subject::where('is_active', true)->get();

        return Inertia::render('settings/subjects', [
            'subjects' => $subjects,
        ]);
    }

    public function storeSubject(Request $request)
    {
        $request->validate([
            'label' => 'required|string|max:255',
            'inc_type' => 'required|in:percent,money',
            'amount' => 'required|numeric|min:0',
        ]);

        Subject::create($request->only(['label', 'inc_type', 'amount']));

        return redirect()->back()->with('success', 'Subject created successfully.');
    }

    public function updateSubject(Request $request, Subject $subject)
    {
        $request->validate([
            'label' => 'required|string|max:255',
            'inc_type' => 'required|in:percent,money',
            'amount' => 'required|numeric|min:0',
        ]);

        $subject->update($request->only(['label', 'inc_type', 'amount']));

        return redirect()->back()->with('success', 'Subject updated successfully.');
    }

    public function deleteSubject(Subject $subject)
    {
        $subject->update(['is_active' => false]);

        return redirect()->back()->with('success', 'Subject deleted successfully.');
    }

    public function orderRates()
    {
        $orderRates = OrderRate::where('is_active', true)->get();

        return Inertia::render('settings/order-rates', [
            'orderRates' => $orderRates,
        ]);
    }

    public function storeOrderRate(Request $request)
    {
        $request->validate([
            'hours' => 'required|integer|min:1',
            'label' => 'required|string|max:255',
            'high_school' => 'required|numeric|min:0',
            'under_graduate' => 'required|numeric|min:0',
            'masters' => 'required|numeric|min:0',
            'phd' => 'required|numeric|min:0',
        ]);

        OrderRate::create($request->only([
            'hours', 'label', 'high_school', 'under_graduate', 'masters', 'phd'
        ]));

        return redirect()->back()->with('success', 'Order rate created successfully.');
    }

    public function updateOrderRate(Request $request, OrderRate $orderRate)
    {
        $request->validate([
            'hours' => 'required|integer|min:1',
            'label' => 'required|string|max:255',
            'high_school' => 'required|numeric|min:0',
            'under_graduate' => 'required|numeric|min:0',
            'masters' => 'required|numeric|min:0',
            'phd' => 'required|numeric|min:0',
        ]);

        $orderRate->update($request->only([
            'hours', 'label', 'high_school', 'under_graduate', 'masters', 'phd'
        ]));

        return redirect()->back()->with('success', 'Order rate updated successfully.');
    }

    public function deleteOrderRate(OrderRate $orderRate)
    {
        $orderRate->update(['is_active' => false]);

        return redirect()->back()->with('success', 'Order rate deleted successfully.');
    }

    public function adjustAllRates(Request $request)
    {
        $request->validate([
            'type' => 'required|in:percent,money',
            'amount' => 'required|numeric|min:0',
        ]);

        $rates = AcademicRate::where('deleted', false)->get();

        foreach ($rates as $rate) {
            if ($request->type === 'percent') {
                $newCost = $rate->cost * (1 + $request->amount / 100);
            } else {
                $newCost = $rate->cost + $request->amount;
            }
            
            $rate->update(['cost' => max(0, $newCost)]);
        }

        return redirect()->back()->with('success', 'All rates adjusted successfully.');
    }

    public function languages()
    {
        $languages = Language::where('is_active', true)->get();

        return Inertia::render('settings/languages', [
            'languages' => $languages,
        ]);
    }

    public function storeLanguage(Request $request)
    {
        $request->validate([
            'label' => 'required|string|max:255',
            'inc_type' => 'required|in:percent,money',
            'amount' => 'required|numeric|min:0',
        ]);

        Language::create($request->only(['label', 'inc_type', 'amount']));

        return redirect()->back()->with('success', 'Language created successfully.');
    }

    public function updateLanguage(Request $request, Language $language)
    {
        $request->validate([
            'label' => 'required|string|max:255',
            'inc_type' => 'required|in:percent,money',
            'amount' => 'required|numeric|min:0',
        ]);

        $language->update($request->only(['label', 'inc_type', 'amount']));

        return redirect()->back()->with('success', 'Language updated successfully.');
    }

    public function deleteLanguage(Language $language)
    {
        $language->update(['is_active' => false]);

        return redirect()->back()->with('success', 'Language deleted successfully.');
    }
}