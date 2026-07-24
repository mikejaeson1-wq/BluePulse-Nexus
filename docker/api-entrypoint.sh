#!/bin/sh

set -eu

echo ""
echo "BluePulse Nexus: Datenbankmigrationen werden geprüft."

node src/database/migrate.js

echo ""
echo "BluePulse Nexus: API wird gestartet."

exec node src/server.js
