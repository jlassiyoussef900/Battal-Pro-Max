<?php

test('basic assertion is true', function () {
    expect(true)->toBeTrue();
});

test('api endpoint structure contains expected message', function () {
    $expectedResponse = ['message' => 'Hello from PHP Backend!'];
    
    expect($expectedResponse)
        ->toHaveKey('message')
        ->and($expectedResponse['message'])->toBe('Hello from PHP Backend!');
});
