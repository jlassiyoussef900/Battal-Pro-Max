<?php

namespace App;

use PDO;
use PDOException;

class Database
{
    private static ?PDO $connection = null;

    public static function connect()
    {
        if (self::$connection !== null) {
            return self::$connection;
        }

        $host = $_ENV['DB_HOST'] ?? 'localhost';
        $dbname = $_ENV['DB_NAME'] ?? 'battal_db';
        $user = $_ENV['DB_USER'] ?? 'azer';
        $password = $_ENV['DB_PASSWORD'] ?? '';
        $port = $_ENV['DB_PORT'] ?? 5432;

        try {
            self::$connection = new PDO(
                "pgsql:host={$host};port={$port};dbname={$dbname}",
                $user,
                $password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                ]
            );
            return self::$connection;
        } catch (PDOException $e) {
            header('Content-Type: application/json');
            http_response_code(500);
            echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
            exit;
        }
    }

    public static function getConnection(): PDO
    {
        return self::connect();
    }

    public static function testConnection(): bool
    {
        try {
            $pdo = self::connect();
            $pdo->query("SELECT 1");
            return true;
        } catch (PDOException $e) {
            return false;
        }
    }
}
