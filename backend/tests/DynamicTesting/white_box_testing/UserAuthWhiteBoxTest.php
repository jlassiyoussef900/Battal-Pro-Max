<?php

use App\Models\User;
use App\Database;

test('white box: user registration hashes password and inserts into database correctly', function () {
    $userModel = new User();
    
    $email = 'whiteboxtest_' . time() . '_' . rand(100,999) . '@example.com';
    $rawPassword = 'SuperSecretPassword123!';
    
    $userData = [
        'email' => $email,
        'password' => $rawPassword,
        'first_name' => 'White',
        'last_name' => 'Boxer',
        'role' => 'jobseeker'
    ];
    
    // Trigger the internal method we are testing
    $userId = $userModel->register($userData);
    expect($userId)->not->toBeEmpty();
    
    // Inspect the internal database state explicitly to verify internal behavior
    $pdo = Database::getConnection();
    $stmt = $pdo->prepare('SELECT password_hash FROM users WHERE id = :id');
    $stmt->execute(['id' => $userId]);
    $dbRecord = $stmt->fetch();
    
    // Assert the password was not stored as plaintext
    expect($dbRecord)->not->toBeFalse();
    expect($dbRecord['password_hash'])->not->toBe($rawPassword);
    
    // Assert the hash verifies against the plaintext password
    expect(password_verify($rawPassword, $dbRecord['password_hash']))->toBeTrue();
    
    // Cleanup internal state
    $userModel->delete($userId);
});
