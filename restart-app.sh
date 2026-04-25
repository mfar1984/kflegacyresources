#!/bin/bash
# Auto-restart script for KF-Next application
# This script restarts the Node.js app via cPanel Passenger

# Configuration
APP_ROOT="/home/kflegacy/public_html/v9"
LOG_FILE="$APP_ROOT/logs/restart.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Create logs and tmp directories if not exist
mkdir -p "$APP_ROOT/logs"
mkdir -p "$APP_ROOT/tmp"

# Log restart attempt
echo "[$TIMESTAMP] Starting application restart..." >> "$LOG_FILE"

# CRITICAL: Kill all existing Node.js processes first
# This prevents process accumulation
echo "[$TIMESTAMP] Killing existing Node.js processes..." >> "$LOG_FILE"
pkill -f "lsnode.*public_html/v9" 2>/dev/null
pkill -f "node.*server.js" 2>/dev/null

# Wait for processes to die
sleep 2

# Count remaining processes
REMAINING=$(pgrep -f "lsnode.*public_html/v9" | wc -l)
echo "[$TIMESTAMP] Remaining processes: $REMAINING" >> "$LOG_FILE"

# Force kill if still running
if [ $REMAINING -gt 0 ]; then
    echo "[$TIMESTAMP] Force killing remaining processes..." >> "$LOG_FILE"
    pkill -9 -f "lsnode.*public_html/v9" 2>/dev/null
    sleep 1
fi

# Method 1: Touch restart.txt (Passenger standard restart method)
touch "$APP_ROOT/tmp/restart.txt"
echo "[$TIMESTAMP] Created restart.txt for Passenger" >> "$LOG_FILE"

# Method 2: Also touch the parent tmp/restart.txt if exists
if [ -d "$APP_ROOT/../tmp" ]; then
    touch "$APP_ROOT/../tmp/restart.txt" 2>/dev/null
fi

# Wait for Passenger to detect restart file
sleep 3

# Log completion
echo "[$TIMESTAMP] Restart signal sent to Passenger" >> "$LOG_FILE"

# Check if restart.txt was created successfully
if [ -f "$APP_ROOT/tmp/restart.txt" ]; then
    echo "[$TIMESTAMP] Restart file exists - Passenger will restart on next request" >> "$LOG_FILE"
else
    echo "[$TIMESTAMP] ERROR: Failed to create restart file" >> "$LOG_FILE"
fi

# Final process count
FINAL_COUNT=$(pgrep -f "lsnode.*public_html/v9" | wc -l)
echo "[$TIMESTAMP] Final process count: $FINAL_COUNT" >> "$LOG_FILE"
echo "[$TIMESTAMP] Application will restart on next HTTP request" >> "$LOG_FILE"
