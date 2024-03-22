import json
from django_redis import get_redis_connection
from asgiref.sync import async_to_sync
from asyncio import sleep
from urllib.parse import parse_qs
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
    GAME_COUNTER = 7
    UNAUTHORIZED = 8

class GameSocketConsumer(AsyncWebsocketConsumer):

    # read only message handlesr is safe.
    message_handlers = [None] * 100
    pattern = r"\"type\"\s*:\s*(\d+)"

    async def add_id_to_set(set_name, id):
        con = get_redis_connection("default")
        con.sadd(set_name, id)

    def remove_id_from_set(set_name, id):
        con = get_redis_connection("default")
        con.srem(set_name, id)

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
        self.pong_received = True
        self.user = self.scope["user"]
        self.user_channel_name = self.channel_name
        query_string = parse_qs(self.scope["query_string"].decode())
        self.user_id = query_string.get("userID", [""])[0]
        cache.set(f"user_channel:{self.user_id}", self.channel_name, timeout=None)

        self.id = self.scope["url_route"]["kwargs"]["game_id"]
        self.room_group_name = f"game_socket_{self.id}"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        
        self.host_key = f"game_id_{self.id}_host"
        self.game_users_count_key = f"game_id_{self.id}_connection"
        self.connected_users = cache.get(self.game_users_count_key)

        if self.connected_users is None:
            self.connected_users = 0
            cache.set(self.game_users_count_key, self.connected_users)

        if self.connected_users == 0:
            await self.accept()
            cache.incr(self.game_users_count_key)
            cache.set(self.host_key, self.user_id)
            await self.send(
                text_data=json.dumps({"type": MessageType.CLIENT_TYPE, "msg": "host"})
            )
        # elif connected_users == 1:
        #     await self.accept()
        #     cache.incr(self.game_users_count_key)
        #     await self.send(
        #         text_data=json.dumps({"type": MessageType.CLIENT_TYPE, "msg": "guest"})
        #     )
        else:
            await self.accept()
            cache.incr(self.game_users_count_key)
            await self.send(
                text_data=json.dumps({"type": MessageType.CLIENT_TYPE, "msg": "guest"})
            )
            await self.send(
                text_data=json.dumps(
                    {
                        "type": MessageType.CLIENT_TYPE,
                        "msg": "Already two players connected!",
                    }
                )
            )
            # await self.close()
        # self.channel_layer.create_task(self.ping_loop())

    # async def send_message_to_specific_user(self, message):
    #     other_users = [uid for uid in self.user_channel_names if uid != self.user_id]

    #     if not other_users:
    #         print("No other users to send a message to.")
    #         return

    #     # Select a random user ID from the list
    #     target_user_id = random.choice(other_users)
    #     target_channel_name = self.user_channel_names[target_user_id]

    #     # Send a message directly to the chosen user's channel
    #     await self.channel_layer.send(
    #         target_channel_name,
    #         {
    #             "type": "chat.message",
    #             "message": message,
    #         }
    #     )

    async def disconnect(self, close_code):
        cache.delete(f"user_channel:{self.user_id}")
        if self.user_id == cache.get(self.host_key):
            cache.delete(self.host_key)
            cache.delete(self.game_users_count_key)
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        await self.send(text_data="{'type':6,'msg':'Disconnection successfull.'}")
        # await self.channel_layer.group_send(
        #     self.room_group_name,
        #     {
        #         "type": "disconnect_all",
        #     },
        # )

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

    async def handle_game_start(self, data):
        if self.user_id == cache.get(self.host_key):
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "process_game_start",
                    "message": data,
                    "sender_channel_name": self.channel_name,
                },
            )
        else:
            await self.send(text_data='{"type":8, "msg":"Unauthorized operation."}')

    async def handle_game_counter(self, data):
        if self.user_id == cache.get(self.host_key):
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "process_game_counter",
                    "message": data,
                    "sender_channel_name": self.channel_name,
                },
            )
        else:
            await self.send(text_data='{"type":8, "msg":"Unauthorized operation."}')

    async def handle_positions(self, jsonDict):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "process_game_postion",
                "message": jsonDict,
                "sender_channel_name": self.channel_name,
            },
        )

    async def handle_game_end(self, data):
        if self.user_id == cache.get(self.host_key):
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "process_game_end",
                    "message": data,
                    "sender_channel_name": self.channel_name,
                },
            )
        else:
            await self.send(text_data='{"type":8, "msg":"Unauthorized operation."}')

    async def disconnect_all(self, event):
        cache.delete(self.host_key)
        cache.delete(self.game_users_count_key)
        await self.send(text_data="{msg:'disconnected all players'.}")

    async def process_game_postion(self, event):
        data = event["message"]
        sender_channel_name = event["sender_channel_name"]
        if sender_channel_name != self.channel_name:
            # current_time_millis = time.time() * 1000
            await self.send(text_data=data)

    async def process_game_end(self, event):
        data = event["message"]
        sender_channel_name = event["sender_channel_name"]
        if sender_channel_name != self.channel_name:
            await self.send(text_data=data)

    async def process_game_start(self, event):
        data = event["message"]
        sender_channel_name = event["sender_channel_name"]
        if sender_channel_name != self.channel_name:
            await self.send(text_data=data)

    async def process_game_counter(self, event):
        data = event["message"]
        sender_channel_name = event["sender_channel_name"]
        if sender_channel_name != self.channel_name:
            await self.send(text_data=data)


GameSocketConsumer.message_handlers[MessageType.PING] = GameSocketConsumer.handle_ping
GameSocketConsumer.message_handlers[MessageType.PONG] = GameSocketConsumer.handle_pong
GameSocketConsumer.message_handlers[MessageType.GAME_POSITION] = (
    GameSocketConsumer.handle_positions
)
GameSocketConsumer.message_handlers[MessageType.GAME_END] = (
    GameSocketConsumer.handle_game_end
)
GameSocketConsumer.message_handlers[MessageType.GAME_START] = (
    GameSocketConsumer.handle_game_start
)
GameSocketConsumer.message_handlers[MessageType.GAME_COUNTER] = (
    GameSocketConsumer.handle_game_counter
)
