#!/bin/bash
# Wait for database to be ready

echo "Waiting for database to be ready..."
until pg_isready -h postgres -U postgres -d salon_appointment_db; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "Database is ready!"

# Start the application
exec "$@"