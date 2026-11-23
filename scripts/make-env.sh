#!/usr/bin/env bash
set -e

read -rp "Admin email: " ADMIN_EMAIL
read -rsp "Admin password (min 12 chars): " ADMIN_PASSWORD; echo
[ ${#ADMIN_PASSWORD} -ge 12 ] || { echo "Password too short"; exit 1; }
read -rp "Frontend URL, no trailing slash: " CLIENT_ORIGIN
read -rp "DB path on persistent disk [/data/zeal.db]: " DB_PATH
DB_PATH=${DB_PATH:-/data/zeal.db}
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")

OUT=server/.env.production.local
umask 077
{
  echo "JWT_SECRET=$JWT_SECRET"
  echo "ADMIN_EMAIL=$ADMIN_EMAIL"
  echo "ADMIN_PASSWORD=$ADMIN_PASSWORD"
  echo "CLIENT_ORIGIN=$CLIENT_ORIGIN"
  echo "DB_PATH=$DB_PATH"
} > "$OUT"

echo "Wrote $OUT. Paste its lines into your backend host's env settings."