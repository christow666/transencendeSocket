from django.shortcuts import redirect, get_object_or_404
from django.views.generic.base import TemplateResponseMixin, View
from django.views.generic.list import ListView
from django.views.generic.edit import CreateView, UpdateView, DeleteView
from django.views.generic.detail import DetailView
from django.contrib.auth.mixins import LoginRequiredMixin, PermissionRequiredMixin
from django.urls import reverse_lazy
from django.forms.models import modelform_factory
from django.apps import apps
from django.db.models import Count
from django.core.cache import cache
from braces.views import CsrfExemptMixin, JsonRequestResponseMixin
from players.forms import GameJoinForm
from .forms import ModuleFormSet
from .models import Game
from .models import Module, Content
from django import forms


class ManageGameListView(ListView):
    model = Game
    template_name = 'games/manage/game/list.html'

    def get_queryset(self):
        qs = super().get_queryset()
        return qs.filter(owner=self.request.user)

class OwnerMixin:
    def get_queryset(self):
        qs = super().get_queryset()
        return qs.filter(owner=self.request.user)

class OwnerEditMixin:
    def form_valid(self, form):
        form.instance.owner = self.request.user
        return super().form_valid(form)
    
class GameForm(forms.ModelForm):
    class Meta:
        model = Game
        fields = ['title', 'slug']
        labels = {
            'title': 'Name',
            'slug': 'Slug',
        }
    
class OwnerGameFormMixin(OwnerMixin, LoginRequiredMixin, PermissionRequiredMixin):
    model = Game
    form_class = GameForm
    # fields = ['title', 'slug']
    success_url = reverse_lazy('manage_game_list')

class OwnerGameMixin(OwnerMixin, LoginRequiredMixin, PermissionRequiredMixin):
    model = Game
    form_class = GameForm
    # fields = ['title', 'slug']
    success_url = reverse_lazy('manage_game_list')

class OwnerGameEditMixin(OwnerGameMixin, OwnerEditMixin):
    template_name = 'games/manage/game/form.html'

class ManageGameListView(OwnerGameMixin, ListView):
    template_name = 'games/manage/game/list.html'
    permission_required = 'games.view_game'

class GameCreateView(OwnerGameEditMixin, CreateView):
    permission_required = 'games.add_game'

class GameUpdateView(OwnerGameEditMixin, UpdateView):
    permission_required = 'games.change_game'

class GameDeleteView(OwnerGameMixin, DeleteView):
    template_name = 'games/manage/game/delete.html'
    permission_required = 'games.delete_game'

class GameModuleUpdateView(TemplateResponseMixin, View):
    template_name = 'games/manage/module/formset.html'
    game = None

    def get_formset(self, data=None):
        return ModuleFormSet(instance=self.game, data=data)

    def dispatch(self, request, pk):
        self.game = get_object_or_404(Game, id=pk, owner=request.user)
        return super().dispatch(request, pk)

    def get(self, request, *args, **kwargs):
        formset = self.get_formset()
        return self.render_to_response({'game': self.game,
                                        'formset': formset})

    def post(self, request, *args, **kwargs):
        formset = self.get_formset(data=request.POST)
        if formset.is_valid():
            formset.save()
            return redirect('manage_game_list')
        return self.render_to_response({'game': self.game,
                                        'formset': formset})

class ContentCreateUpdateView(TemplateResponseMixin, View):
    module = None
    model = None
    obj = None
    template_name = 'games/manage/content/form.html'

    def get_model(self, model_name):
        if model_name in ['text', 'video', 'image', 'file']:
            return apps.get_model(app_label='games', model_name=model_name)
        return None

    def get_form(self, model, *args, **kwargs):
        Form = modelform_factory(model, exclude=['owner',
                                                 'order',
                                                 'created',
                                                 'updated'])
        return Form(*args, **kwargs)

    def dispatch(self, request, module_id, model_name, id=None):
        self.module = get_object_or_404(Module, id=module_id, game__owner=request.user)
        self.model = self.get_model(model_name)
        if id:
            self.obj = get_object_or_404(self.model, id=id, owner=request.user)
        return super().dispatch(request, module_id, model_name, id)

    def get(self, request, module_id, model_name, id=None):
        form = self.get_form(self.model, instance=self.obj)
        return self.render_to_response({'form': form,
                                        'object': self.obj})

    def post(self, request, module_id, model_name, id=None):
        form = self.get_form(self.model, instance=self.obj, data=request.POST, files=request.FILES)
        if form.is_valid():
            obj = form.save(commit=False)
            obj.owner = request.user
            obj.save()
            if not id:
                Content.objects.create(module=self.module, item=obj)
            return redirect('module_content_list', self.module.id)
        return self.render_to_response({'form': form,
                                        'object': self.obj})

class ContentDeleteView(View):
    def post(self, request, id):
        content = get_object_or_404(Content, id=id, module__game__owner=request.user)
        module = content.module
        content.item.delete()
        content.delete()
        return redirect('module_content_list', module.id)

class ModuleContentListView(TemplateResponseMixin, View):
    template_name = 'games/manage/module/content_list.html'

    def get(self, request, module_id):
        module = get_object_or_404(Module, id=module_id, game__owner=request.user)
        return self.render_to_response({'module': module})

class ModuleOrderView(CsrfExemptMixin, JsonRequestResponseMixin, View):
    def post(self, request):
        for id, order in self.request_json.items():
            Module.objects.filter(id=id, game__owner=request.user).update(order=order)
        return self.render_json_response({'saved': 'OK'})

class ContentOrderView(CsrfExemptMixin, JsonRequestResponseMixin, View):
    def post(self, request):
        for id, order in self.request_json.items():
            Content.objects.filter(id=id, module__game__owner=request.user).update(order=order)
        return self.render_json_response({'saved': 'OK'})

class GameListView(TemplateResponseMixin, View):
    model = Game
    template_name = 'games/game/list.html'

    def get(self, request):
        all_games = Game.objects.annotate(total_modules=Count('modules'))
        games = cache.get('all_games')
        if not games:
            games = all_games
            cache.set('all_games', games)
        return self.render_to_response({'games': games})

class GameDetailView(DetailView):
    model = Game
    template_name = 'games/game/detail.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['join_form'] = GameJoinForm(initial={'game':self.object})
        return context
