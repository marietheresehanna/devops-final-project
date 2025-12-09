#!/bin/bash
set -e

echo "Configuring PostgreSQL to require password authentication..."

# Update pg_hba.conf to require scram-sha-256 authentication
cat > /var/lib/postgresql/data/pg_hba.conf << EOF
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             all                                     scram-sha-256
host    all             all             0.0.0.0/0               scram-sha-256
host    all             all             ::0/0                   scram-sha-256
EOF

# Reload PostgreSQL configuration
pg_ctl reload -D /var/lib/postgresql/data

echo "PostgreSQL configured to require passwords!"