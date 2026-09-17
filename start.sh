#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# CyberTrace — Unix/macOS 1-Command Startup Script
# Automatically verifies dependencies, environment config, and launches servers
# ─────────────────────────────────────────────────────────────────────────────

set -e

# Detect Node / NPM environment (incorporate NVM if present)
if ! command -v node >/dev/null 2>&1; then
  if [ -d "$HOME/.nvm/versions/node" ]; then
    LATEST_NVM_NODE=$(ls -d "$HOME/.nvm/versions/node/"* 2>/dev/null | tail -n 1)
    if [ -n "$LATEST_NVM_NODE" ] && [ -d "$LATEST_NVM_NODE/bin" ]; then
      export PATH="$LATEST_NVM_NODE/bin:$PATH"
    fi
  fi
fi

if ! command -v node >/dev/null 2>&1; then
  echo -e "\033[0;31m[ERROR] Node.js is not found in PATH. Please install Node v18+.\033[0m"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "\033[1;34m=====================================================================\033[0m"
echo -e "\033[1;36m CyberTrace — Digital Forensic Case & Incident Management System\033[0m"
echo -e "\033[1;34m=====================================================================\033[0m"
echo ""

# 1. Ensure Environment Files
if [ ! -f "backend/.env" ]; then
  if [ -f "backend/.env.example" ]; then
    echo -e "\033[0;33m[INFO] Generating backend/.env from backend/.env.example...\033[0m"
    cp "backend/.env.example" "backend/.env"
  fi
fi

if [ ! -f ".env" ]; then
  if [ -f "backend/.env.example" ]; then
    echo -e "\033[0;33m[INFO] Generating root .env from backend/.env.example...\033[0m"
    cp "backend/.env.example" ".env"
  fi
fi

# 2. Check and Install Dependencies
if [ ! -d "node_modules" ] || [ ! -d "backend/node_modules" ] || [ ! -d "frontend/node_modules" ]; then
  echo -e "\033[0;33m[INFO] Installing workspace dependencies (root, backend, frontend)...\033[0m"
  npm run install:all
fi

# 3. Check MongoDB Availability
echo -e "\033[0;34m[INFO] Checking MongoDB status on port 27017...\033[0m"
if node -e "const net=require('net'); const s=net.createConnection(27017, '127.0.0.1'); s.on('connect', ()=>{s.end(); process.exit(0);}); s.on('error', ()=>{process.exit(1);});" 2>/dev/null; then
  echo -e "\033[0;32m[OK] MongoDB is running.\033[0m"
  
  # Run database seed if needed or requested
  if [ "$1" == "--seed" ] || [ "$SEED" == "true" ]; then
    echo -e "\033[0;33m[INFO] Running database seed script...\033[0m"
    npm run seed
  fi
else
  echo -e "\033[0;33m[WARNING] MongoDB service does not appear to be active on 127.0.0.1:27017.\033[0m"
  echo -e "Please ensure MongoDB is running (e.g. \033[1msudo systemctl start mongod\033[0m or \033[1mbrew services start mongodb-community\033[0m)."
  echo -e "Continuing launch...\n"
fi

# 4. Open Default Web Browser in the Background after 2.5 seconds
(
  sleep 2.5
  if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "http://localhost:5173" >/dev/null 2>&1 || true
  elif command -v open >/dev/null 2>&1; then
    open "http://localhost:5173" >/dev/null 2>&1 || true
  fi
) &

# 5. Launch Full Stack
echo -e "\033[0;32m[INFO] Launching CyberTrace API Gateway (:5000) and Web Console (:5173)...\033[0m"
echo -e "\033[0;36m[INFO] Access the portal at: http://localhost:5173\033[0m\n"

npm run dev
