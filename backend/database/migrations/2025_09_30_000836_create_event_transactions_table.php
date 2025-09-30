<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('event_transactions', function (Blueprint $table) {
            $table->id();
            $table->bigInteger("user_id")->unsigned();
            $table->bigInteger("event_id")->unsigned();
            $table->timestamps();

            $table->foreign("user_id")->references("id")->on("users")->onDelete("CASCADE");
            $table->foreign("event_id")->references("id")->on("events")->onDelete("CASCADE");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_transactions');
    }
};
