from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import generics
from rest_framework.authentication import BasicAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from games.models import Subject, Game
from games.api.serializers import SubjectSerializer, GameSerializer
from games.api.permissions import IsJoined
from games.api.serializers import GameWithContentsSerializer

class SubjectListView(generics.ListAPIView):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer

class SubjectDetailView(generics.RetrieveAPIView):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer

# class GameJoinView(APIView):
#    authentication_classes = [BasicAuthentication]
#    permission_classes = [IsAuthenticated]

#    def post(self, request, pk, format=None):
#        game = get_object_or_404(Game, pk=pk)
#        game.players.add(request.user)
#        return Response({'joined': True})


class GameViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Game.objects.all()
    serializer_class = GameSerializer

    @action(detail=True,
            methods=['post'],
            authentication_classes=[BasicAuthentication],
            permission_classes=[IsAuthenticated])
    def join(self, request, *args, **kwargs):
        game = self.get_object()
        game.players.add(request.user)
        return Response({'joined': True})

    @action(detail=True,
            methods=['get'],
            serializer_class=GameWithContentsSerializer,
            authentication_classes=[BasicAuthentication],
            permission_classes=[IsAuthenticated, IsJoined])
    def contents(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)
