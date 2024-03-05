#!/bin/bash

python3 -m venv .venv
source ./.venv/bin/activate

echo "Building the project..."
python3 -m pip install -r requirements.txt
