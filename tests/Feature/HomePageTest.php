<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HomePageTest extends TestCase
{
    use RefreshDatabase;

    public function test_welcome_page_renders(): void
    {
        $this->get('/')->assertOk();
    }

    public function test_home_redirects_guests_to_login(): void
    {
        $this->get('/home')->assertRedirect('/login');
    }

    public function test_home_renders_for_authenticated_user(): void
    {
        $this->actingAs(User::factory()->create())
            ->get('/home')
            ->assertOk();
    }
}
