#!/bin/bash
# Startup wrapper for cPanel with memory limit
# This ensures NODE_OPTIONS is properly set before starting Node.js

export NODE_OPTIONS="--max-old-space-size=1024"
exec node server.js
