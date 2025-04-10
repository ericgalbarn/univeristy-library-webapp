#!/bin/sh
set -e

# Print environment information
echo "Starting application with the following configuration:"
echo "PORT=${PORT:-5000}"
echo "RAILWAY_ENVIRONMENT=${RAILWAY_ENVIRONMENT:-local}"

# Set default port if not provided
PORT="${PORT:-5000}"

# Run the debug application first (will be removed in production)
python debug_app.py &

# Run the main application
exec gunicorn --bind 0.0.0.0:$PORT --log-level=debug app:app 