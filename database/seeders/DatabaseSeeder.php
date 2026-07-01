<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'aluno@ciclointeligente.test'],
            ['name' => 'Aluno Demonstração', 'password' => 'password']
        );

        // Catálogo de planos disponíveis (agrupados por órgão em /planos).
        $this->call(IbgeCensoSeeder::class);
        $this->call(IbgeAnalistaTiSeeder::class);
    }
}
