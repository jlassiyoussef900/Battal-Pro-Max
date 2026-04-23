<?php

namespace App\Models;

use PDO;
use Exception;

class CompanyDashboard extends BaseModel
{
    protected string $table = 'companies';

    // ── Dashboard Metrics ──────────────────────────────────────────────────────

    public function getMetrics(string $companyId): array
    {
        $db = $this->db;

        // Active jobs
        $stmt = $db->prepare("SELECT COUNT(*) as count FROM jobs WHERE company_id = ? AND status = 'active'");
        $stmt->execute([$companyId]);
        $activeJobs = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];

        // Total views
        $stmt = $db->prepare("SELECT COALESCE(SUM(views), 0) as total FROM jobs WHERE company_id = ?");
        $stmt->execute([$companyId]);
        $totalViews = (int)$stmt->fetch(PDO::FETCH_ASSOC)['total'];

        // Total applications
        $stmt = $db->prepare("
            SELECT COUNT(*) as count FROM applications a
            JOIN jobs j ON a.job_id = j.id
            WHERE j.company_id = ?
        ");
        $stmt->execute([$companyId]);
        $totalApplications = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];

        // Interviews (status = 'interview')
        $stmt = $db->prepare("
            SELECT COUNT(*) as count FROM applications a
            JOIN jobs j ON a.job_id = j.id
            WHERE j.company_id = ? AND a.status = 'interview'
        ");
        $stmt->execute([$companyId]);
        $interviews = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];

        // Hires (status = 'hired')
        $stmt = $db->prepare("
            SELECT COUNT(*) as count FROM applications a
            JOIN jobs j ON a.job_id = j.id
            WHERE j.company_id = ? AND a.status = 'hired'
        ");
        $stmt->execute([$companyId]);
        $hires = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];

        // Average time to hire (days between applied_at and updated_at for hired)
        $stmt = $db->prepare("
            SELECT COALESCE(AVG(EXTRACT(DAY FROM (a.updated_at - a.applied_at))), 0) as avg_days
            FROM applications a
            JOIN jobs j ON a.job_id = j.id
            WHERE j.company_id = ? AND a.status = 'hired'
        ");
        $stmt->execute([$companyId]);
        $timeToHire = (int)round($stmt->fetch(PDO::FETCH_ASSOC)['avg_days']);

        return [
            'activeJobs'    => $activeJobs,
            'totalViews'    => $totalViews,
            'applications'  => $totalApplications,
            'interviews'    => $interviews,
            'hires'         => $hires,
            'timeToHire'    => $timeToHire ?: 0,
        ];
    }

    // ── Analytics ─────────────────────────────────────────────────────────────

    public function getAnalytics(string $companyId): array
    {
        $db = $this->db;

        // Job posting stats
        $stmt = $db->prepare("
            SELECT
                COUNT(*) FILTER (WHERE status = 'active')  as active,
                COUNT(*) FILTER (WHERE status = 'expired') as expired,
                COUNT(*) FILTER (WHERE status = 'draft')   as draft
            FROM jobs WHERE company_id = ?
        ");
        $stmt->execute([$companyId]);
        $jobStats = $stmt->fetch(PDO::FETCH_ASSOC);

        // Application funnel
        $stmt = $db->prepare("
            SELECT
                COALESCE(SUM(j.views), 0) as views,
                COUNT(a.id) as applications,
                COUNT(a.id) FILTER (WHERE a.status = 'interview') as interviews,
                COUNT(a.id) FILTER (WHERE a.status = 'hired')     as hires
            FROM jobs j
            LEFT JOIN applications a ON a.job_id = j.id
            WHERE j.company_id = ?
        ");
        $stmt->execute([$companyId]);
        $funnel = $stmt->fetch(PDO::FETCH_ASSOC);

        // Top performing jobs
        $stmt = $db->prepare("
            SELECT j.id, j.title, j.views, COUNT(a.id) as application_count
            FROM jobs j
            LEFT JOIN applications a ON a.job_id = j.id
            WHERE j.company_id = ?
            GROUP BY j.id, j.title, j.views
            ORDER BY j.views DESC
            LIMIT 5
        ");
        $stmt->execute([$companyId]);
        $topJobs = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Skill gap: most requested skills across company's jobs
        $stmt = $db->prepare("
            SELECT unnest(skills) as skill, COUNT(*) as demand
            FROM jobs WHERE company_id = ? AND skills IS NOT NULL
            GROUP BY skill ORDER BY demand DESC LIMIT 8
        ");
        $stmt->execute([$companyId]);
        $skillRows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $skillGap = [];
        foreach ($skillRows as $row) {
            $skillGap[$row['skill']] = (int)$row['demand'];
        }

        // Time to hire trend (last 6 months)
        $stmt = $db->prepare("
            SELECT
                TO_CHAR(DATE_TRUNC('month', a.updated_at), 'YYYY-MM') as month,
                ROUND(AVG(EXTRACT(DAY FROM (a.updated_at - a.applied_at)))) as avg_days
            FROM applications a
            JOIN jobs j ON a.job_id = j.id
            WHERE j.company_id = ? AND a.status = 'hired'
              AND a.updated_at >= NOW() - INTERVAL '6 months'
            GROUP BY month ORDER BY month ASC
        ");
        $stmt->execute([$companyId]);
        $trends = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return [
            'jobPostingStats' => [
                'active'  => (int)$jobStats['active'],
                'expired' => (int)$jobStats['expired'],
                'draft'   => (int)$jobStats['draft'],
            ],
            'applicationFunnel' => [
                'views'        => (int)$funnel['views'],
                'applications' => (int)$funnel['applications'],
                'interviews'   => (int)$funnel['interviews'],
                'hires'        => (int)$funnel['hires'],
            ],
            'topPerformingJobs' => array_map(fn($j) => [
                'jobId'        => $j['id'],
                'title'        => $j['title'],
                'views'        => (int)$j['views'],
                'applications' => (int)$j['application_count'],
            ], $topJobs),
            'skillGapAnalysis'  => $skillGap,
            'timeToHireTrends'  => array_map(fn($t) => [
                'date' => $t['month'],
                'days' => (int)$t['avg_days'],
            ], $trends),
            'candidateSources'  => ['Direct' => 45, 'LinkedIn' => 35, 'Indeed' => 20, 'Referral' => 15],
        ];
    }

    // ── Candidates (applications for a company) ────────────────────────────────

    public function getCandidates(string $companyId, array $filters = []): array
    {
        $sql = "
            SELECT
                a.id, a.status, a.applied_at, a.updated_at, a.cover_letter, a.notes,
                j.id as job_id, j.title as job_title,
                u.id as user_id, u.first_name, u.last_name, u.email,
                p.headline, p.city, p.country
            FROM applications a
            JOIN jobs j ON a.job_id = j.id
            JOIN users u ON a.user_id = u.id
            LEFT JOIN profiles p ON p.user_id = u.id
            WHERE j.company_id = ?
        ";
        $params = [$companyId];

        if (!empty($filters['status'])) {
            $sql .= " AND a.status = ?";
            $params[] = $filters['status'];
        }
        if (!empty($filters['job_id'])) {
            $sql .= " AND j.id = ?";
            $params[] = $filters['job_id'];
        }

        $sql .= " ORDER BY a.applied_at DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getCandidateDetail(string $applicationId): ?array
    {
        $stmt = $this->db->prepare("
            SELECT
                a.*,
                j.title as job_title, j.company_id,
                u.first_name, u.last_name, u.email,
                p.headline, p.summary, p.city, p.country, p.phone, p.linkedin, p.portfolio,
                p.salary_min, p.salary_max, p.salary_currency
            FROM applications a
            JOIN jobs j ON a.job_id = j.id
            JOIN users u ON a.user_id = u.id
            LEFT JOIN profiles p ON p.user_id = u.id
            WHERE a.id = ?
        ");
        $stmt->execute([$applicationId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) return null;

        // Attach skills, experience, education, badges
        $userId = $row['user_id'];

        $stmt = $this->db->prepare("SELECT * FROM skills WHERE user_id = ?");
        $stmt->execute([$userId]);
        $row['skills'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $stmt = $this->db->prepare("SELECT * FROM work_experience WHERE user_id = ? ORDER BY start_date DESC");
        $stmt->execute([$userId]);
        $row['experience'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $stmt = $this->db->prepare("SELECT * FROM education WHERE user_id = ? ORDER BY start_date DESC");
        $stmt->execute([$userId]);
        $row['education'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $stmt = $this->db->prepare("SELECT * FROM badges WHERE user_id = ?");
        $stmt->execute([$userId]);
        $row['badges'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return $row;
    }

    public function updateCandidateStatus(string $applicationId, string $status, ?string $notes = null): bool
    {
        $sql = "UPDATE applications SET status = ?, updated_at = NOW()";
        $params = [$status];

        if ($notes !== null) {
            $sql .= ", notes = ?";
            $params[] = $notes;
        }

        $sql .= " WHERE id = ?";
        $params[] = $applicationId;

        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    // ── Company Jobs (with applicant counts) ──────────────────────────────────

    public function getCompanyJobs(string $companyId): array
    {
        $stmt = $this->db->prepare("
            SELECT j.*,
                COUNT(a.id) as application_count,
                COUNT(a.id) FILTER (WHERE a.status = 'new')       as new_count,
                COUNT(a.id) FILTER (WHERE a.status = 'interview') as interview_count,
                COUNT(a.id) FILTER (WHERE a.status = 'hired')     as hired_count
            FROM jobs j
            LEFT JOIN applications a ON a.job_id = j.id
            WHERE j.company_id = ?
            GROUP BY j.id
            ORDER BY j.created_at DESC
        ");
        $stmt->execute([$companyId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ── Company Members ───────────────────────────────────────────────────────

    public function getMembers(string $companyId): array
    {
        $stmt = $this->db->prepare("
            SELECT cm.*, u.first_name, u.last_name, u.email, u.avatar_url
            FROM company_members cm
            JOIN users u ON cm.user_id = u.id
            WHERE cm.company_id = ?
            ORDER BY cm.joined_at ASC
        ");
        $stmt->execute([$companyId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function addMember(string $companyId, string $userId, string $role = 'recruiter'): string
    {
        $stmt = $this->db->prepare("
            INSERT INTO company_members (company_id, user_id, role, joined_at)
            VALUES (?, ?, ?, NOW())
            ON CONFLICT (company_id, user_id) DO UPDATE SET role = EXCLUDED.role
            RETURNING id
        ");
        $stmt->execute([$companyId, $userId, $role]);
        return $stmt->fetch(PDO::FETCH_ASSOC)['id'];
    }

    public function removeMember(string $companyId, string $userId): bool
    {
        $stmt = $this->db->prepare("DELETE FROM company_members WHERE company_id = ? AND user_id = ?");
        return $stmt->execute([$companyId, $userId]);
    }
}
