from django.urls import path
from django.views.decorators.cache import cache_page
from . import views

urlpatterns = [
    path('register/', views.GamerRegistrationView.as_view(), name='gamer_registration'),
    path('join-game/', views.GamerJoinGameView.as_view(), name='gamer_join_game'),
    path('games/', views.GamerGameListView.as_view(), name='gamer_game_list'),
    path('game/<pk>/', cache_page(60 * 15)(views.GamerGameDetailView.as_view()), name='gamer_game_detail'),
    path('game/<pk>/<module_id>/', cache_page(60 * 15)(views.GamerGameDetailView.as_view()), name='gamer_game_detail_module'),
]
