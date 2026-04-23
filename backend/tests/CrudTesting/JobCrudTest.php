<?php

use App\Models\Job;

test('it can create, read, update, and close a job', function () {
    $jobModel = new Job();
    $companyId = 'demo-company-1'; // Mock company ID if FKs aren't strictly checked, or use a known one.

    // 1. CREATE
    $jobData = [
        'company_id' => $companyId,
        'title' => 'Pest PHP Developer',
        'description' => 'Test driven development for the win.',
        'location' => 'Remote',
        'salary_min' => 90000,
        'salary_max' => 120000
    ];
    
    $jobId = $jobModel->createJob($jobData);
    expect($jobId)->not->toBeEmpty();

    // 2. READ
    $job = $jobModel->getById($jobId);
    expect($job)->not->toBeNull()
        ->and($job['title'])->toBe('Pest PHP Developer')
        ->and($job['status'])->toBe('active');

    // 3. UPDATE
    $updateResult = $jobModel->update($jobId, [
        'title' => 'Senior Pest PHP Developer',
        'salary_min' => 100000
    ]);
    expect($updateResult)->toBeTrue();

    // Verify Update
    $updatedJob = $jobModel->getById($jobId);
    expect($updatedJob['title'])->toBe('Senior Pest PHP Developer')
        ->and($updatedJob['salary_min'])->toEqual(100000);

    // 4. CLOSING JOB (Alternative to Delete in this implementation)
    $closeResult = $jobModel->closeJob($jobId);
    expect($closeResult)->toBeTrue();

    // Verify Closed
    $closedJob = $jobModel->getById($jobId);
    expect($closedJob['status'])->toBe('closed');

    // 5. Hard DELETE to clean up
    $jobModel->delete($jobId);
    $deletedJob = $jobModel->getById($jobId);
    expect($deletedJob)->toBeNull();
});

test('it prevents creating a job without required fields', function () {
    $jobModel = new Job();
    
    // Missing 'description'
    $jobData = [
        'company_id' => '1234',
        'title' => 'Incomplete Job'
    ];

    expect(fn() => $jobModel->createJob($jobData))
        ->toThrow(Exception::class, 'Missing required field: description');
});
