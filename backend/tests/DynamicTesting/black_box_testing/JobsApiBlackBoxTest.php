<?php

test('black box: fetching jobs returns a valid JSON structure', function () {
    $context = stream_context_create(['http' => ['ignore_errors' => true]]);
    $response = @file_get_contents('http://127.0.0.1:8002/jobs', false, $context);
    
    if ($response === false) {
        $this->markTestSkipped('PHP built-in server is not running on 127.0.0.1:8002');
    }
    
    $statusLine = $http_response_header[0];
    expect(strpos($statusLine, '200'))->not->toBeFalse();
    
    $data = json_decode($response, true);
    expect($data)->toBeArray();
    expect(isset($data['jobs']))->toBeTrue();
});

test('black box: invalid endpoint returns 404', function () {
    $context = stream_context_create(['http' => ['ignore_errors' => true]]);
    $response = @file_get_contents('http://127.0.0.1:8002/non_existent_random_route', false, $context);
    
    if ($response === false) {
        $this->markTestSkipped('PHP built-in server is not running on 127.0.0.1:8002');
    }
    
    $statusLine = $http_response_header[0];
    expect(strpos($statusLine, '404'))->not->toBeFalse();
});
