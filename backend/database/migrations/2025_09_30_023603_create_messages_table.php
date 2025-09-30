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
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->bigInteger("conversation_id")->unsigned();
            $table->bigInteger("sender")->unsigned();
            $table->text("message");
            $table->string("image")->nullable();
            $table->enum("isread", ["false", "true"]);
            $table->timestamps();

            $table->foreign("conversation_id")->references("id")->on("conversations")->onDelete("CASCADE");
            $table->foreign("sender")->references("id")->on("users")->onDelete("CASCADE");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
