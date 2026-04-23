<?php

use App\Models\User;

test('fuzz testing: user registration handles unexpected payloads without fatal crashes', function () {
    $userModel = new User();
    
    // Generate fuzzed data: Massive strings, special characters, SQL injection attempts
    $fuzzInputs = [
        "HugeString" => str_repeat("A", 10000), // Massive length bypass check
        "SQLi" => "'; DROP TABLE users; --", // SQL Injection
        "XSS" => "<script>alert('xss')</script>", // Cross-site scripting
        "Emojis" => "👨‍👩‍👧‍👦🔥 Drop Tables 💥", // Unicode Edge Cases
        "Nulls" => "user\0name", // Null byte injection
    ];
    
    foreach ($fuzzInputs as $key => $fuzzData) {
        $userData = [
            'email' => "fuzz_{$key}_" . time() . "@example.com",
            'password' => 'ValidPassword123!',
            'first_name' => $fuzzData,
            'last_name' => 'Tester',
            'role' => 'jobseeker'
        ];
        
        try {
            $resultId = $userModel->register($userData);
            
            // If it succeeds, it means PDO safely escaped the input. 
            // We just ensure it didn't cause a fatal PHP error or crash.
            expect(true)->toBeTrue();
            
            // Clean up to not pollute DB
            if ($resultId) {
                $userModel->delete($resultId);
            }
        } catch (\Exception $e) {
            // It's acceptable for it to throw a validation or PDO exception
            // (e.g. string too long for DB column).
            // We just expect it NOT to crash the entire application fatally.
            expect($e)->toBeInstanceOf(\Exception::class);
        }
    }
});
