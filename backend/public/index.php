<?php
// Load environment variables
if (file_exists(__DIR__ . '/../.env')) {
    $lines = file(__DIR__ . '/../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($key, $value) = explode('=', $line, 2);
        $_ENV[trim($key)] = trim($value);
    }
}

// API Entry Point
require_once __DIR__ . '/../src/Database.php';
require_once __DIR__ . '/../src/Schema.php';
require_once __DIR__ . '/../src/ApiRouter.php';
require_once __DIR__ . '/../src/Models/BaseModel.php';
require_once __DIR__ . '/../src/Models/User.php';
require_once __DIR__ . '/../src/Models/Profile.php';
require_once __DIR__ . '/../src/Models/Job.php';
require_once __DIR__ . '/../src/Models/Company.php';
require_once __DIR__ . '/../src/Models/Skill.php';
require_once __DIR__ . '/../src/Models/WorkExperience.php';
require_once __DIR__ . '/../src/Models/Education.php';
require_once __DIR__ . '/../src/Models/Badge.php';
require_once __DIR__ . '/../src/Models/JobMatch.php';

// Enable CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Initialize and dispatch router
try {
    $router = new \App\ApiRouter();
    $router->dispatch();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal Server Error: ' . $e->getMessage()]);
}

