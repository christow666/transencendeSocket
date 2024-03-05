from django.urls import path
from . import views

urlpatterns = [
    path('mine/', views.ManageGameListView.as_view(), name='manage_game_list'),
    path('create/', views.GameCreateView.as_view(), name='game_create'),
    path('<pk>/edit/', views.GameUpdateView.as_view(), name='game_edit'),
    path('<pk>/delete/', views.GameDeleteView.as_view(), name='game_delete'),
    path('<pk>/module/', views.GameModuleUpdateView.as_view(), name='game_module_update'),
    path('module/<int:module_id>/content/<model_name>/create/', views.ContentCreateUpdateView.as_view(), name='module_content_create'),
    path('module/<int:module_id>/content/<model_name>/<id>/', views.ContentCreateUpdateView.as_view(), name='module_content_update'),
    path('content/<int:id>/delete/', views.ContentDeleteView.as_view(), name='module_content_delete'),
    path('module/<int:module_id>/', views.ModuleContentListView.as_view(), name='module_content_list'),
    path('module/order/', views.ModuleOrderView.as_view(), name='module_order'),
    path('content/order/', views.ContentOrderView.as_view(), name='content_order'),
    # path('subject/<slug:subject>/', views.GameListView.as_view(), name='game_list_subject'),
    path('<slug:slug>/', views.GameDetailView.as_view(), name='game_detail'),
]