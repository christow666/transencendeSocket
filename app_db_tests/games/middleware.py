from django.urls import reverse
from django.shortcuts import get_object_or_404, redirect
from .models import Game

def subdomain_game_middleware(get_response):

    def middleware(request):
        host_parts = request.get_host().split('.')
        if len(host_parts) > 2 and host_parts[0] != 'www':
            game = get_object_or_404(Game, slug=host_parts[0])
            game_url = reverse('game_detail',
                                 args=[game.slug])
            url = '{}://{}{}'.format(request.scheme,
                                     '.'.join(host_parts[1:]),
                                     game_url)
            return redirect(url)
        response = get_response(request)
        return response
    return middleware
