from django.urls import reverse_lazy
from django.views.generic.edit import CreateView
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import authenticate, login
from django.views.generic.edit import FormView
from django.views.generic.list import ListView
from django.views.generic.detail import DetailView
from django.contrib.auth.mixins import LoginRequiredMixin
from games.models import Game
from .forms import GameJoinForm

class GamerRegistrationView(CreateView):
    template_name = 'players/gamer/registration.html'
    form_class = UserCreationForm
    success_url = reverse_lazy('gamer_game_list')
    def form_valid(self, form):
        result = super().form_valid(form)
        cd = form.cleaned_data
        user = authenticate(username=cd['username'], password=cd['password1'])
        login(self.request, user)
        return result

class GamerJoinGameView(LoginRequiredMixin, FormView):
    game = None
    form_class = GameJoinForm
    def form_valid(self, form):
        self.game = form.cleaned_data['game']
        self.game.players.add(self.request.user)
        return super().form_valid(form)
    def get_success_url(self):
        return reverse_lazy('gamer_game_detail',
                            args=[self.game.id])


class GamerGameListView(LoginRequiredMixin, ListView):
    model = Game
    template_name = 'players/game/list.html'
    def get_queryset(self):
        qs = super().get_queryset()
        return qs.filter(players__in=[self.request.user])

class GamerGameDetailView(DetailView):
    model = Game
    template_name = 'players/game/detail.html'

    def get_queryset(self):
        qs = super().get_queryset()
        return qs.filter(players__in=[self.request.user])

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        game = self.get_object()
        if 'module_id' in self.kwargs:
            context['module'] = game.modules.get(
                                    id=self.kwargs['module_id'])
        else:
            context['module'] = game.modules.all()[0]
        return context
