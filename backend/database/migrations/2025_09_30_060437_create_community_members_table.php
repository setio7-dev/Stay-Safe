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
        Schema::create('community_members', function (Blueprint $table) {
            $table->id();
            $table->bigInteger("community_id")->unsigned();
            $table->bigInteger("user_id")->unsigned();
            $table->timestamps();

            $table->foreign("community_id")->references("id")->on("communities")->onDelete("CASCADE");
            $table->foreign("user_id")->references("id")->on("users")->onDelete("CASCADE");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('community_members');
    }
};
