import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import async_to_sync
from django.utils import timezone

class GameSocketConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        self.id = self.scope['url_route']['kwargs']['game_id']
        self.room_group_name = f'game_socket_{self.id}'
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        now = timezone.now()
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_socket_message',
                'message': message,
                'user': self.user.username,
                'datetime': now.isoformat(),
            }
        )

    async def game_socket_message(self, event):
        await self.send(text_data=json.dumps(event))
