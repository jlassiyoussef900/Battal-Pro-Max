<?php

namespace App\Models;

class Badge extends BaseModel
{
    protected string $table = 'badges';

    /**
     * Award a badge to a user
     */
    public function awardBadge(string $userId, array $badgeData): string
    {
        $required = ['name', 'category', 'level'];
        foreach ($required as $field) {
            if (!isset($badgeData[$field])) {
                throw new \Exception("Missing required field: $field");
            }
        }

        $data = [
            'user_id' => $userId,
            'name' => $badgeData['name'],
            'category' => $badgeData['category'],
            'level' => $badgeData['level'],
            'score' => $badgeData['score'] ?? 0,
            'earned_at' => $badgeData['earned_at'] ?? date('Y-m-d H:i:s'),
            'icon' => $badgeData['icon'] ?? null
        ];

        return $this->create($data);
    }

    /**
     * Get badges by user
     */
    public function getByUser(string $userId): array
    {
        return $this->getAll(['user_id' => $userId], ['earned_at DESC']);
    }

    /**
     * Get badges by level
     */
    public function getByLevel(string $level): array
    {
        return $this->findBy(['level' => $level]);
    }

    /**
     * Get badges by category
     */
    public function getByCategory(string $category): array
    {
        return $this->findBy(['category' => $category]);
    }

    /**
     * Calculate badge statistics for user
     */
    public function getUserBadgeStats(string $userId): array
    {
        $badges = $this->getByUser($userId);
        $stats = [
            'total' => count($badges),
            'by_level' => [
                'bronze' => 0,
                'silver' => 0,
                'gold' => 0,
                'platinum' => 0
            ],
            'average_score' => 0
        ];

        $totalScore = 0;
        foreach ($badges as $badge) {
            $stats['by_level'][$badge['level']]++;
            $totalScore += $badge['score'];
        }

        $stats['average_score'] = count($badges) > 0 ? round($totalScore / count($badges), 2) : 0;

        return $stats;
    }
}
