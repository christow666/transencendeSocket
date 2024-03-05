#!/bin/bash
# python3 -m venv .venv
source ./.venv/bin/activate
pip install django-embed-video
pip install python-memcached
pip install pymemcache
pip install uwsgi
pip install python-dotenv
pip install daphne
pip install gunicorn
pip install twisted
pip install "Twisted[http2,tls]"
