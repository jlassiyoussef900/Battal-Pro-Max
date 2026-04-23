<?php

namespace App\Models;

use Exception;

class Company extends BaseModel
{
    protected string $table = 'companies';

    /**
     * Create a new company
     */
    public function createCompany(array $companyData): string
    {
        $required = ['name', 'industry'];
        foreach ($required as $field) {
            if (!isset($companyData[$field])) {
                throw new Exception("Missing required field: $field");
            }
        }

        $data = [
            'name' => $companyData['name'],
            'description' => $companyData['description'] ?? null,
            'industry' => $companyData['industry'],
            'company_size' => $companyData['size'] ?? null,
            'location' => $companyData['city'] ?? null,
            'country' => $companyData['country'] ?? null,
            'website' => $companyData['website'] ?? null,
            'logo_url' => $companyData['logo_url'] ?? null,
            'founded' => $companyData['founded'] ?? null,
            'benefits' => isset($companyData['benefits']) ? '{' . implode(',', $companyData['benefits']) . '}' : null
        ];

        return $this->create($data);
    }

    /**
     * Get companies by industry
     */
    public function getByIndustry(string $industry): array
    {
        return $this->findBy(['industry' => $industry]);
    }

    /**
     * Get companies by size
     */
    public function getBySize(string $size): array
    {
        return $this->findBy(['size' => $size]);
    }

    /**
     * Search companies
     */
    public function search(string $query): array
    {
        $sql = "SELECT * FROM {$this->table} 
                WHERE name ILIKE ? OR description ILIKE ?
                ORDER BY name ASC";
        
        $searchTerm = "%$query%";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$searchTerm, $searchTerm]);

        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Get company with jobs count
     */
    public function getWithJobCount(string $companyId): ?array
    {
        $sql = "SELECT c.*, COUNT(j.id) as job_count
                FROM {$this->table} c
                LEFT JOIN jobs j ON c.id = j.company_id AND j.status = 'active'
                WHERE c.id = ?
                GROUP BY c.id";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$companyId]);

        return $stmt->fetch(\PDO::FETCH_ASSOC) ?: null;
    }

    /**
     * Get all companies with job counts
     */
    public function getAllWithJobCounts(): array
    {
        $sql = "SELECT c.*, COUNT(j.id) as job_count
                FROM {$this->table} c
                LEFT JOIN jobs j ON c.id = j.company_id AND j.status = 'active'
                GROUP BY c.id
                ORDER BY c.name ASC";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Update company info
     */
    public function updateCompany(string $id, array $data): bool
    {
        // Handle array fields
        if (isset($data['benefits']) && is_array($data['benefits'])) {
            $data['benefits'] = '{' . implode(',', $data['benefits']) . '}';
        }

        return $this->update($id, $data);
    }
}
