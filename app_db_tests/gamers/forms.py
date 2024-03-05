from django import forms
from games.models import Game

class GameJoinForm(forms.Form):
    game = forms.ModelChoiceField(queryset=Game.objects.all(), widget=forms.HiddenInput)