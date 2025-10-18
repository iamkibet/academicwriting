<?php

use App\Http\Controllers\SettingsController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'admin'])->group(function () {
    Route::get('settings', [SettingsController::class, 'index'])->name('settings.index');
    
    // Academic Levels
    Route::get('settings/academic-levels', [SettingsController::class, 'academicLevels'])->name('settings.academic-levels');
    Route::post('settings/academic-levels', [SettingsController::class, 'storeAcademicLevel'])->name('settings.academic-levels.store');
    Route::patch('settings/academic-levels/{academicLevel}', [SettingsController::class, 'updateAcademicLevel'])->name('settings.academic-levels.update');
    Route::delete('settings/academic-levels/{academicLevel}', [SettingsController::class, 'deleteAcademicLevel'])->name('settings.academic-levels.delete');
    
    // Academic Rates
    Route::post('settings/academic-levels/{academicLevel}/rates', [SettingsController::class, 'addAcademicRate'])->name('settings.academic-rates.store');
    Route::patch('settings/academic-rates/{academicRate}', [SettingsController::class, 'updateAcademicRate'])->name('settings.academic-rates.update');
    Route::delete('settings/academic-rates/{academicRate}', [SettingsController::class, 'deleteAcademicRate'])->name('settings.academic-rates.delete');
    Route::post('settings/academic-levels/adjust-all', [SettingsController::class, 'adjustAllRates'])->name('settings.academic-rates.adjust-all');
    
    // Subjects
    Route::get('settings/subjects', [SettingsController::class, 'subjects'])->name('settings.subjects');
    Route::post('settings/subjects', [SettingsController::class, 'storeSubject'])->name('settings.subjects.store');
    Route::patch('settings/subjects/{subject}', [SettingsController::class, 'updateSubject'])->name('settings.subjects.update');
    Route::delete('settings/subjects/{subject}', [SettingsController::class, 'deleteSubject'])->name('settings.subjects.delete');
    
    // Order Rates
    Route::get('settings/order-rates', [SettingsController::class, 'orderRates'])->name('settings.order-rates');
    Route::post('settings/order-rates', [SettingsController::class, 'storeOrderRate'])->name('settings.order-rates.store');
    Route::patch('settings/order-rates/{orderRate}', [SettingsController::class, 'updateOrderRate'])->name('settings.order-rates.update');
    Route::delete('settings/order-rates/{orderRate}', [SettingsController::class, 'deleteOrderRate'])->name('settings.order-rates.delete');
    
    // Languages
    Route::get('settings/languages', [SettingsController::class, 'languages'])->name('settings.languages');
    Route::post('settings/languages', [SettingsController::class, 'storeLanguage'])->name('settings.languages.store');
    Route::patch('settings/languages/{language}', [SettingsController::class, 'updateLanguage'])->name('settings.languages.update');
    Route::delete('settings/languages/{language}', [SettingsController::class, 'deleteLanguage'])->name('settings.languages.delete');
});