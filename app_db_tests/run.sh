#!/bin/bash
source ./.venv/bin/activate

# Make migrations
echo "Making migrations..."
python3 manage.py makemigrations

# Migrate the database
echo "Migrating..."
python3 manage.py migrate

# Collect static files
echo "Collecting static files..."
python3 manage.py collectstatic --noinput

echo "Starting the server..."
python3 manage.py runserver 0.0.0.0:8080

#daphne -u /tmp/daphne.sock game_config.asgi:application
