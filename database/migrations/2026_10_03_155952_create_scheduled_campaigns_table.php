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
        Schema::create('scheduled_campaigns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('target_audience')->default('all');
            $table->integer('total_recipients')->default(0);
            $table->text('message');
            $table->string('device')->nullable();
            $table->date('scheduled_date');
            $table->string('scheduled_time', 10); // e.g. "10:00"
            $table->dateTime('scheduled_at');
            $table->string('status', 20)->default('scheduled'); // 'scheduled' | 'running' | 'completed' | 'cancelled'
            $table->timestamps();

            // Index to quickly search/check occupied slots
            $table->index(['user_id', 'scheduled_date', 'scheduled_time']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scheduled_campaigns');
    }
};
