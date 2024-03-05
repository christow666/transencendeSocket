from django import forms
from django.forms.models import inlineformset_factory
from .models import Game, Module

ModuleFormSet = inlineformset_factory(Game, Module, fields=['title', 'description'], extra=2, can_delete=True)