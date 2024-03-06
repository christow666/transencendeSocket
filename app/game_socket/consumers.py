import json
from asyncio import sleep
from channels.generic.websocket import AsyncWebsocketConsumer
from django.utils import timezone
import time
import re
from django.core.cache import cache


class MessageType:
    PING = 0
    PONG = 1
    GAME_POSITION = 2
    GAME_START = 3
    GAME_END = 4
    CLIENT_TYPE = 5
    DISCONNECT = 6


class GameSocketConsumer(AsyncWebsocketConsumer):

    message_handlers = [None] * 100
    pattern = r"\"type\"\s*:\s*(\d+)"

    async def process_msg(self, msgType, message):
        if 0 <= msgType < len(self.message_handlers):
            handler = self.message_handlers[msgType]
            if handler:
                await handler(self, message)
            else:
                print(f"No handler for message type: {msgType}")
        else:
            print(f"Invalid message type: {msgType}")

    async def connect(self):
        print("connection established!")
        self.pong_received = True
        self.user = self.scope["user"]
        self.id = self.scope["url_route"]["kwargs"]["game_id"]
        self.room_group_name = f"game_socket_{self.id}"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        key = f"game_id_{self.id}"
        value = cache.get(key)
        if value is None:
            cache.set(key, self.user)
            await self.send(
                text_data=json.dumps({"type": MessageType.CLIENT_TYPE, "msg": "host"})
            )
            return
        await self.send(
            text_data=json.dumps({"type": MessageType.CLIENT_TYPE, "msg": "guest"})
        )
        # self.channel_layer.create_task(self.ping_loop())

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "trigger_disconnect",
            },
        )

    def searchType(self, json_string):
        match = re.search(self.pattern, json_string)
        if match:
            type_value = int(match.group(1))
        else:
            type_value = -1
        return type_value

    async def receive(self, text_data):
        # print(text_data)
        msgType = self.searchType(text_data)
        await self.process_msg(msgType, text_data)

    # async def ping_loop(self):
    #     while True:
    #         wait = 5
    #         await sleep(wait)
    #         while True:
    #             if not self.pong_received:
    #                 await self.close()
    #                 break
    #             self.pong_received = False
    #             message_type = MessageType.PONG.to_bytes(1, "big", True)
    #             await self.send(text_data=message_type)
    #             wait += 5
    #             if wait == 60:
    #                 await self.close()
    #                 break
    #             await sleep(5)

    async def handle_ping(self, event):
        await self.send(text_data=json.dumps({"type": MessageType.PONG}))

    async def handle_pong(self, event):
        await self.send(text_data=json.dumps({"type": MessageType.PING}))

    async def handle_game_start(self, jsonDict):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "process_game_postion",
                "message": jsonDict,
                "sender_channel_name": self.channel_name,
            },
        )

    async def handle_positions(self, jsonDict):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "process_game_postion",
                "message": jsonDict,
                "sender_channel_name": self.channel_name,
            },
        )

    async def handle_game_end(self, jsonDict):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "process_game_postion",
                "message": jsonDict,
                "sender_channel_name": self.channel_name,
            },
        )

    async def trigger_disconnect(self, event):
        await self.send(text_data="all user disconected")

    async def process_game_postion(self, event):
        data = event["message"]
        sender_channel_name = event["sender_channel_name"]
        if sender_channel_name != self.channel_name:
            # current_time_millis = time.time() * 1000
            await self.send(text_data=data)


GameSocketConsumer.message_handlers[MessageType.PING] = GameSocketConsumer.handle_ping
GameSocketConsumer.message_handlers[MessageType.PONG] = GameSocketConsumer.handle_pong
GameSocketConsumer.message_handlers[MessageType.GAME_POSITION] = (
    GameSocketConsumer.handle_positions
)
