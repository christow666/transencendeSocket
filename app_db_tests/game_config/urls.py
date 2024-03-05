from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.auth import views as auth_views
from games.views import GameListView

urlpatterns = [
    path('accounts/login/', auth_views.LoginView.as_view(), name='login'),
    path('accounts/logout/', auth_views.LogoutView.as_view(),  name='logout'),
    path('admin/', admin.site.urls),
    path('game/', include('games.urls')),
    path('', GameListView.as_view(), name='game_list'),
    path('players/', include('players.urls')),
    path('api/', include('games.api.urls', namespace='api')),
    path('game_socket/', include('game_socket.urls', namespace='game_socket')),
    path('__debug__/', include('debug_toolbar.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)
