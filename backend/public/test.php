<?php
// Simple test file to verify router functionality
header('Content-Type: application/json');
echo json_encode(['status' => 'Router is working', 'timestamp' => date('Y-m-d H:i:s')]);