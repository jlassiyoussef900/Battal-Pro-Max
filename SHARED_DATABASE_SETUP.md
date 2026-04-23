# Shared Database Setup Guide

## Option 1: Configure Local PostgreSQL for Remote Access (Development)

### Step 1: Edit PostgreSQL Configuration Files

**Location:** `C:\Program Files\PostgreSQL\17\data\`

#### 1.1 Edit `postgresql.conf`
```bash
# Open with administrator privileges
notepad "C:\Program Files\PostgreSQL\17\data\postgresql.conf"
```

Find and change:
```conf
# Change from:
#listen_addresses = 'localhost'

# To:
listen_addresses = '*'
```

#### 1.2 Edit `pg_hba.conf`
```bash
# Open with administrator privileges
notepad "C:\Program Files\PostgreSQL\17\data\pg_hba.conf"
```

Add this line at the end:
```conf
# Allow remote connections (replace 0.0.0.0/0 with specific IP for better security)
host    all             all             0.0.0.0/0               md5
```

### Step 2: Restart PostgreSQL Service
```bash
# Open Services (Win + R, type: services.msc)
# Find "postgresql-x64-17" service
# Right-click -> Restart
```

Or via command line (as Administrator):
```bash
net stop postgresql-x64-17
net start postgresql-x64-17
```

### Step 3: Configure Windows Firewall
```bash
# Open Windows Firewall with Advanced Security
# Create new Inbound Rule:
# - Rule Type: Port
# - Protocol: TCP
# - Port: 5432
# - Action: Allow the connection
# - Profile: All
# - Name: PostgreSQL Remote Access
```

Or via PowerShell (as Administrator):
```powershell
New-NetFirewallRule -DisplayName "PostgreSQL" -Direction Inbound -LocalPort 5432 -Protocol TCP -Action Allow
```

### Step 4: Get Your IP Address
```bash
ipconfig
```
Look for "IPv4 Address" (e.g., 192.168.1.100)

### Step 5: Update .env Files for Remote Users

**Your .env (host machine):**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=battal
DB_USER=azer
DB_PASSWORD=your_password
```

**Friends' .env (remote machines):**
```env
DB_HOST=YOUR_IP_ADDRESS  # e.g., 192.168.1.100
DB_PORT=5432
DB_NAME=battal
DB_USER=azer
DB_PASSWORD=your_password
```

### Step 6: Test Remote Connection

From friend's machine:
```bash
psql -h YOUR_IP_ADDRESS -p 5432 -U azer -d battal
```

---

## Option 2: Use Cloud Database (Production - Recommended)

### A. ElephantSQL (Free Tier Available)
1. Go to https://www.elephantsql.com/
2. Sign up and create a free instance
3. Get connection details
4. Update everyone's .env:
```env
DB_HOST=<elephantsql-host>.db.elephantsql.com
DB_PORT=5432
DB_NAME=<your-db-name>
DB_USER=<your-username>
DB_PASSWORD=<your-password>
```

### B. Supabase (Free Tier Available)
1. Go to https://supabase.com/
2. Create new project
3. Get connection string from Settings -> Database
4. Update everyone's .env with Supabase credentials

### C. AWS RDS (Paid)
1. Create PostgreSQL instance on AWS RDS
2. Configure security groups for access
3. Share connection details with team

### D. Heroku Postgres (Free Tier Available)
1. Create Heroku app
2. Add Heroku Postgres addon
3. Get DATABASE_URL from config vars
4. Parse and use in .env

---

## Security Considerations

### For Local Network Sharing:
- ⚠️ Only use on trusted networks (home/office)
- Change default passwords
- Use specific IP ranges in pg_hba.conf instead of 0.0.0.0/0

### For Internet Sharing:
- 🚫 **NOT RECOMMENDED** to expose local PostgreSQL to internet
- Use VPN or SSH tunneling
- Or use cloud database services instead

### Better Security with pg_hba.conf:
```conf
# Instead of allowing all IPs:
host    all             all             0.0.0.0/0               md5

# Allow specific IPs only:
host    all             all             192.168.1.0/24          md5  # Local network
host    all             all             10.0.0.50/32            md5  # Specific friend's IP
```

---

## Recommended Approach

**For Development/Testing:**
- Use **Option 1** if all team members are on same local network
- Use **ElephantSQL** or **Supabase** free tier for remote collaboration

**For Production:**
- Use **AWS RDS**, **Google Cloud SQL**, or **Azure Database for PostgreSQL**
- Implement proper authentication and SSL connections
- Set up database backups and monitoring

---

## Quick Start for Team (Using ElephantSQL)

1. **You (Host):**
   - Create ElephantSQL free account
   - Create database instance
   - Run schema.sql and seed.sql on ElephantSQL
   - Share credentials with team

2. **Team Members:**
   - Update their .env with shared credentials
   - No need to install PostgreSQL locally
   - Everyone connects to same database

3. **Update .env for everyone:**
```env
DB_HOST=<elephantsql-host>.db.elephantsql.com
DB_PORT=5432
DB_NAME=<db-name>
DB_USER=<username>
DB_PASSWORD=<password>
```

4. **Commit .env.example with instructions:**
```env
# .env.example
DB_HOST=<ask-team-lead>
DB_PORT=5432
DB_NAME=<ask-team-lead>
DB_USER=<ask-team-lead>
DB_PASSWORD=<ask-team-lead>
```

---

## Testing the Connection

### From PHP (Backend):
```php
<?php
$host = getenv('DB_HOST');
$port = getenv('DB_PORT');
$dbname = getenv('DB_NAME');
$user = getenv('DB_USER');
$password = getenv('DB_PASSWORD');

try {
    $pdo = new PDO("pgsql:host=$host;port=$port;dbname=$dbname", $user, $password);
    echo "Connected successfully!";
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
?>
```

### From Command Line:
```bash
psql -h <host> -p <port> -U <user> -d <dbname>
```

---

## Troubleshooting

### Connection Refused:
- Check PostgreSQL is running
- Verify firewall rules
- Check listen_addresses in postgresql.conf

### Authentication Failed:
- Verify username/password
- Check pg_hba.conf settings
- Ensure user has proper permissions

### Timeout:
- Check network connectivity
- Verify IP address is correct
- Check if port 5432 is open

---

## Next Steps

1. Choose your approach (local network vs cloud)
2. Follow the setup steps
3. Test connection from your machine
4. Share credentials with team (securely!)
5. Have team members test their connections
6. Update documentation with final connection details
