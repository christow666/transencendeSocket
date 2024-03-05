from .base import *

DEBUG = True
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}

WSGI_APPLICATION = 'game_config.wsgi.application'
ASGI_APPLICATION = 'game_config.asgi.application'
