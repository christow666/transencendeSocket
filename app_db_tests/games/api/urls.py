from django.urls import path, include
from rest_framework import routers
from . import views

app_name = 'games'

router = routers.DefaultRouter()
router.register('games', views.GameViewSet)

urlpatterns = [
    # path('subjects/', views.SubjectListView.as_view(), name='subject_list'),
    # path('subjects/<pk>/', views.SubjectDetailView.as_view(), name='subject_detail'),
    # path('games/<pk>/join/', views.GameJoinView.as_view(), name='game_join'),
    path('', include(router.urls)),
]
