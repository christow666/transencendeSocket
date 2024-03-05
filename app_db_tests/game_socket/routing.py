from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/game_socket/room/(?P<game_id>\d+)/$', consumers.GameSocketConsumer.as_asgi()),
]
