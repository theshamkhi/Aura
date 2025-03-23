<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class OwnerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'name' => 'Mohammed Shamkhi',
            'email' => 'Shamkhi@Aura.com',
            'password' => Hash::make('Shamkhi@Aura'),
            'role' => 'Software Developer',
            'photo' => 'path_to_my_photo',
            'bio' => 'I’m an applied mathematics graduate with a strong programming background. I bring together my mathematical expertise, coding skills, and creativity to create unique and engaging works of art.',
            'cv' => 'path_to_my_cv',
            'country' => 'Morocco',
        ]);
    }
}
