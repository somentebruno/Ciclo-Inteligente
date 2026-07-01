<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HomePageTest extends TestCase
{
    use RefreshDatabase;

    public function test_welcome_page_renders(): void
    {
        $this->get('/')->assertOk();
    }

    public function test_dashboard_page_renders(): void
    {
        $this->get('/dashboard')->assertOk();
    }
}
