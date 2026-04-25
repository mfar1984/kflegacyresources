# Startup wrapper for cPanel with memory limit (PowerShell version)
# This ensures NODE_OPTIONS is properly set before starting Node.js

$env:NODE_OPTIONS = "--max-old-space-size=1024"
node server.js
