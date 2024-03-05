from django.db import models
from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.template.loader import render_to_string
from .fields import OrderField

class Subject(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)

    class Meta:
        ordering = ['title']

    def __str__(self):
        return self.title

class Score(models.Model):
    player = models.ForeignKey(User, related_name='player_score', on_delete=models.CASCADE)
    score = models.IntegerField(null=False, default=0)

    def __str__(self):
        return f"{self.player.username}: {self.score}"

class PlayerGameInfo(models.Model):
    player = models.ForeignKey(User, related_name='games_info', on_delete=models.CASCADE)
    join_date = models.DateTimeField(auto_now_add=True)
    disconnected = models.BooleanField(null=False, default=False)
    avg_latency = models.IntegerField(default=0)
    max_latency = models.IntegerField(default=0)
    final_score = models.OneToOneField(Score, related_name='final_game_score', on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.player.username}"


class GameType(models.IntegerChoices):
    TYPE_ONE = 1, 'Type One'
    TYPE_TWO = 2, 'Type Two'
    TYPE_TREE = 3, 'Type Tree'

class Game(models.Model):
    owner = models.ForeignKey(User, related_name='games_owner', on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    created = models.DateTimeField(auto_now_add=True)
    players = models.ManyToManyField(PlayerGameInfo, related_name='game_players_info', blank=True)
    type = models.IntegerField(choices=GameType.choices, default=GameType.TYPE_ONE)
    max_rounds = models.IntegerField(null=False, default=3)
    num_balls = models.IntegerField(null=False, default=1)
    
    class Meta:
        ordering = ['-created']

    def __str__(self):
        return self.title
    
class Round(models.Model):
    game = models.ForeignKey(Game, related_name='game_rounds', on_delete=models.CASCADE)    
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    players_scores = models.ManyToManyField(Score, related_name='round_player_score', blank=True)
    

    # class Meta:

    def __str__(self):
        return self.title

class Module(models.Model):
    game = models.ForeignKey(Game, related_name='modules', on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    order = OrderField(blank=True, for_fields=['game'])

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f'{self.order}. {self.title}'

class Content(models.Model):
    module = models.ForeignKey(Module, related_name='contents', on_delete=models.CASCADE)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, limit_choices_to={'model__in':(
        'text',
        'video',
        'image',
        'file')})
    object_id = models.PositiveIntegerField()
    item = GenericForeignKey('content_type', 'object_id')
    order = OrderField(blank=True, for_fields=['module'])

    class Meta:
        ordering = ['order']

class ItemBase(models.Model):
    owner = models.ForeignKey(User, related_name='%(class)s_related', on_delete=models.CASCADE)
    title = models.CharField(max_length=250)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

    def __str__(self):
        return self.title

    def render(self):
        return render_to_string(
            f'games/content/{self._meta.model_name}.html',
            {'item': self})

class Text(ItemBase):
    content = models.TextField()

class File(ItemBase):
    file = models.FileField(upload_to='files')

class Image(ItemBase):
       file = models.FileField(upload_to='images')

class Video(ItemBase):
    url = models.URLField()
