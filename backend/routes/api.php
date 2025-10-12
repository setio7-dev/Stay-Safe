<?php

use App\Http\Controllers\CommunityController;
use App\Http\Controllers\CommunityMemberController;
use App\Http\Controllers\CommunityPostController;
use App\Http\Controllers\ConversationController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\EventTransactionController;
use App\Http\Controllers\FactDetectionController;
use App\Http\Controllers\MeditationController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\MusicController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ZoneController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Auth
Route::post('/register', [UserController::class, 'register']);
Route::post('/login', [UserController::class, 'login']);

Route::middleware('auth')->group(function() {
    // Auth
    Route::post('/logout', [UserController::class, 'logout']);
    Route::get('/me', [UserController::class, 'me']);
    Route::get('/user/{id}', [UserController::class, 'show']);
    Route::put('/user/{id}', [UserController::class, 'update']);
    
    Route::middleware('role:admin')->group(function() {
        // User
        Route::get('/user', [UserController::class, 'allUser']);
        Route::delete('/user/{id}', [UserController::class, 'destroy']);

        // Admin
        Route::post("/news", [NewsController::class, 'store']);
        Route::put("/news/{id}", [NewsController::class, 'update']);
        Route::delete("/news/{id}", [NewsController::class, 'destroy']);

        // Report
        Route::get("/report", [ReportController::class, "index"]);
        
        // Fact Detection
        Route::resource('/fact', FactDetectionController::class);

        // Zone
        Route::resource("/zone", ZoneController::class);

        // Music
        Route::resource("/music", MusicController::class);

        // Meditation
        Route::resource("/meditation", MeditationController::class);

        // Doctor
        Route::resource("/doctor", DoctorController::class);
        
        // Event
        Route::resource("/event", EventController::class);
        
        // Community
        // Route::resource("/community", CommunityController::class);
    }); 
    
    Route::middleware('role:guest')->group(function() {
        // News
        Route::get("/guest/news", [NewsController::class, 'index']);
        Route::get("/guest/news/{id}", [NewsController::class, 'show']);

        // Report
        Route::post("/guest/report", [ReportController::class, "store"]);
        
        // Fact Detection
        Route::get("/guest/fact", [FactDetectionController::class, "index"]);
        Route::get("/guest/fact/{id}", [FactDetectionController::class, "show"]);        

        // Zone
        Route::get("/guest/zone", [ZoneController::class, "index"]);
        
        // Music
        Route::get("/guest/music", [MusicController::class, "index"]);
        Route::get("/guest/music/{id}", [MusicController::class, "show"]);
        
        // Meditation
        Route::get("/guest/meditation", [MeditationController::class, "index"]);
        Route::get("/guest/meditation/{id}", [MeditationController::class, "show"]);
        
        // Doctor
        Route::get("/guest/doctor", [DoctorController::class, "index"]);
        Route::get("/guest/doctor/{id}", [DoctorController::class, "show"]);

        // Event
        Route::get("/guest/event", [EventController::class, "index"]);
        Route::get("/guest/event/{id}", [EventController::class, "show"]);

        // Community
        Route::get("/guest/community", [CommunityController::class, "index"]);
        Route::get("/guest/community/{id}", [CommunityController::class, "show"]);

        // Community Member
        Route::post("/member/community", [CommunityMemberController::class, "store"]);
        Route::delete("/member/community", [CommunityMemberController::class, "destroy"]);
    });

    // Report
    Route::get("/report/{id}", [ReportController::class, "show"]);

    // Event Transaction
    Route::resource("/events/transaction", EventTransactionController::class);
    
    // Conversation
    Route::resource("/conversation", ConversationController::class);

    // Message
    Route::get("/conversations/message/{conversationID}", [MessageController::class, "index"]);
    Route::post("/conversations/message", [MessageController::class, "store"]);

    // Community Post
    Route::resource("/communities/post", CommunityPostController::class);
});

Route::resource("/community", CommunityController::class);