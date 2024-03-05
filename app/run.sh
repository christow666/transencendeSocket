#!/bin/bash

# cd /app/
# . ./.venv/bin/activate
rm /app/game_config/daphne.sock
rm /app/game_config/daphne.sock.lock
daphne -u /app/game_config/daphne.sock game_config.asgi:application
