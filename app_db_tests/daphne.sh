#!/bin/bash
source ./.venv/bin/activate

daphne -u /tmp/daphne.sock game_config.asgi:application