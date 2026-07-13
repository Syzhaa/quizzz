#!/bin/bash

# Fungsi untuk mematikan proses di port tertentu
kill_port() {
  local port=$1
  local pid=$(lsof -t -i:$port 2>/dev/null)
  if [ -n "$pid" ]; then
    echo "Mematikan proses yang menggunakan port $port (PID: $pid)..."
    kill -9 $pid
  fi
}

echo "Memeriksa port yang mungkin masih aktif..."
kill_port 3001 # Port backend
kill_port 5173 # Port frontend

echo "Memulai Backend (Server)..."
npm -w server run dev &
SERVER_PID=$!

echo "Memulai Frontend (Client)..."
npm -w client run dev &
CLIENT_PID=$!

# Menangani SIGINT (Ctrl+C) agar proses anak ikut berhenti
trap "kill -9 $SERVER_PID $CLIENT_PID 2>/dev/null" SIGINT EXIT

echo "Menunggu proses selesai. Tekan Ctrl+C untuk berhenti."
wait $SERVER_PID $CLIENT_PID
