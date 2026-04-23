<?php

namespace App\Models;

use PDO;
use Exception;

abstract class BaseModel
{
    protected PDO $db;
    protected string $table;

    public function __construct()
    {
        $this->db = \App\Database::getConnection();
    }

    /**
     * Create a new record
     */
    public function create(array $data): string
    {
        $columns = implode(', ', array_keys($data));
        $placeholders = implode(', ', array_fill(0, count($data), '?'));

        // Use RETURNING clause to get back the generated UUID
        $sql = "INSERT INTO {$this->table} ({$columns}) VALUES ({$placeholders}) RETURNING id";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute(array_values($data));

        // Fetch the returned ID (UUID)
        $result = $stmt->fetch(\PDO::FETCH_ASSOC);
        return $result['id'] ?? '';
    }

    /**
     * Get a single record by ID
     */
    public function getById(string $id): ?array
    {
        $sql = "SELECT * FROM {$this->table} WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$id]);

        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ?: null;
    }

    /**
     * Get all records with optional conditions
     */
    public function getAll(array $conditions = [], array $orderBy = [], int $limit = null): array
    {
        $sql = "SELECT * FROM {$this->table}";

        if (!empty($conditions)) {
            $whereClause = ' WHERE ' . implode(' AND ', array_map(fn($key) => "$key = ?", array_keys($conditions)));
            $sql .= $whereClause;
        }

        if (!empty($orderBy)) {
            $orderClause = ' ORDER BY ' . implode(', ', $orderBy);
            $sql .= $orderClause;
        }

        if ($limit) {
            $sql .= " LIMIT $limit";
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute(array_values($conditions));

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Update a record
     */
    public function update(string $id, array $data): bool
    {
        $columns = implode(', ', array_map(fn($key) => "$key = ?", array_keys($data)));
        $sql = "UPDATE {$this->table} SET {$columns}, updated_at = CURRENT_TIMESTAMP WHERE id = ?";

        $values = array_values($data);
        $values[] = $id;

        $stmt = $this->db->prepare($sql);
        return $stmt->execute($values);
    }

    /**
     * Delete a record
     */
    public function delete(string $id): bool
    {
        $sql = "DELETE FROM {$this->table} WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$id]);
    }

    /**
     * Count records
     */
    public function count(array $conditions = []): int
    {
        $sql = "SELECT COUNT(*) as count FROM {$this->table}";

        if (!empty($conditions)) {
            $whereClause = ' WHERE ' . implode(' AND ', array_map(fn($key) => "$key = ?", array_keys($conditions)));
            $sql .= $whereClause;
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute(array_values($conditions));

        return $stmt->fetch(PDO::FETCH_ASSOC)['count'] ?? 0;
    }

    /**
     * Check if a record exists
     */
    public function exists(string $id): bool
    {
        $sql = "SELECT 1 FROM {$this->table} WHERE id = ? LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$id]);
        return $stmt->fetch() !== false;
    }

    /**
     * Find records by conditions
     */
    public function findBy(array $conditions): array
    {
        return $this->getAll($conditions);
    }

    /**
     * Find one record by conditions
     */
    public function findOneBy(array $conditions): ?array
    {
        $results = $this->getAll($conditions, [], 1);
        return $results[0] ?? null;
    }
}
