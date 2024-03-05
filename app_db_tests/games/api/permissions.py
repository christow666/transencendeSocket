from rest_framework.permissions import BasePermission

class IsJoined(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.players.filter(id=request.user.id).exists()
