<?php

use App\Models\User;

test('it can create, read, update, and delete a user', function () {
    $userModel = new User();
    $randomSuffix = time() . rand(100, 999);
    $email = "crudtestuser_{$randomSuffix}@example.com";

    // 1. CREATE
    $userData = [
        'email' => $email,
        'password' => 'secret_password',
        'first_name' => 'Crud',
        'last_name' => 'Tester',
        'role' => 'jobseeker'
    ];
    
    $userId = $userModel->register($userData);
    expect($userId)->not->toBeEmpty();

    // 2. READ
    $user = $userModel->getById($userId);
    expect($user)->not->toBeNull()
        ->and($user['email'])->toBe($email)
        ->and($user['first_name'])->toBe('Crud');

    // 3. UPDATE
    $updateResult = $userModel->updateUser($userId, [
        'first_name' => 'Updated Crud',
        'last_name' => 'Super Tester'
    ]);
    expect($updateResult)->toBeTrue();

    // Verify Update
    $updatedUser = $userModel->getById($userId);
    expect($updatedUser['first_name'])->toBe('Updated Crud')
        ->and($updatedUser['last_name'])->toBe('Super Tester');

    // 4. DELETE
    $deleteResult = $userModel->delete($userId);
    expect($deleteResult)->toBeTrue();

    // Verify Delete
    $deletedUser = $userModel->getById($userId);
    expect($deletedUser)->toBeNull();
});

test('it prevents creating a user without required fields', function () {
    $userModel = new User();
    
    // Missing 'password'
    $userData = [
        'email' => 'bad_data@example.com',
        'first_name' => 'Incomplete',
        'last_name' => 'User'
    ];

    expect(fn() => $userModel->register($userData))
        ->toThrow(Exception::class, 'Missing required field: password');
});
