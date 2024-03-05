from django.urls import path
from . import views

app_name = 'game_socket'

urlpatterns = [
    path('room/<int:game_id>/', views.game_game_socket_room, name='game_game_socket_room'),
]