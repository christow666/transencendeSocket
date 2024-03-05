from django.shortcuts import render, get_object_or_404
from django.http import HttpResponseForbidden
from django.contrib.auth.decorators import login_required

@login_required
def game_game_socket_room(request, game_id):
    try:
        game = request.user.games_joined.get(id=game_id)
    except:
        return HttpResponseForbidden()
    return render(request, 'game_socket/room.html', {'game': game})
