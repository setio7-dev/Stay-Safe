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
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->bigInteger("sender")->unsigned();
            $table->bigInteger("receiver")->unsigned();
            $table->timestamps();

            $table->foreign("sender")->references("id")->on("users")->onDelete("CASCADE");
            $table->foreign("receiver")->references("id")->on("users")->onDelete("CASCADE");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};
