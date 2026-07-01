<?php

namespace Tests\Unit;

use App\Services\CycleGeneratorService;
use PHPUnit\Framework\TestCase;

class CycleGeneratorServiceTest extends TestCase
{
    public function test_one_task_equals_ninety_minutes(): void
    {
        $this->assertSame(90, CycleGeneratorService::MINUTES_PER_TASK);
    }
}
