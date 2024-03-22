from .base import *

DEBUG = True

# CHANNEL_LAYERS = {
#     'default': {
#         'BACKEND': 'channels_redis.core.RedisChannelLayer',
#         'CONFIG': {
#             "hosts": [('redis', 6379)],
#         },
#     },
# }

ALLOWED_HOSTS = ['*']

ASGI_APPLICATION = 'game_config.asgi.application'
