from django.contrib import admin
from .models import Subject, Game, Module

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ['title']
    prepopulated_fields = {'slug': ('title',)}

class ModuleInline(admin.StackedInline):
    model = Module

@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    list_display = ['title', 'created']
    list_filter = ['created']
    search_fields = ['title']
    prepopulated_fields = {'slug': ('title',)}
    inlines = [ModuleInline]
