import os
from .base import *

DEBUG = False

ADMINS = [
    ('Mathieu Roy'),
]

ALLOWED_HOSTS = ['127.0.0.1']

REDIS_URL = 'redis://cache:6379'

# CHANNEL_LAYERS = {
#     'default': {
#         'BACKEND': 'channels_redis.core.RedisChannelLayer',
#         'CONFIG': {
#             "hosts": [('redis', 6379)],
#         },
#     },
# }
# CACHES['default']['LOCATION'] = REDIS_URL
# CHANNEL_LAYERS['default']['CONFIG']['hosts'] = [REDIS_URL]

CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True
SECURE_SSL_REDIRECT = True
