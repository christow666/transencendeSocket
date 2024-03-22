import json
from django_redis import get_redis_connection
from asgiref.sync import sync_to_async
from asyncio import sleep
from urllib.parse import parse_qs
from channels.generic.websocket import AsyncWebsocketConsumer
from django.utils import timezone
import time
import re
from django.core.cache import cache
import asyncio


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
    DISCONNECT_COUNTDOWN = 9
    TOURNAMENT_FULL = 10
    GAME_FULL = 11
    ADDED_TO_TOURNAMENT = 12
    GAME_ALREADY_STARTED = 13


class GameSocketConsumer(AsyncWebsocketConsumer):

    # read only message handlesr is safe.
    message_handlers = [None] * 100
    pattern = r"\"type\"\s*:\s*(\d+)"

    async def is_host(self, user_id):
        get_user_id = await self.get_key(user_id)
        if get_user_id is None:
            return False
        return True

    async def add_id_to_set(self, set_name, id):
        con = get_redis_connection("default")
        value = await sync_to_async(con.sadd)(set_name, id)
        return value

    async def remove_id_from_set(self, set_name, id):
        con = get_redis_connection("default")
        value = await sync_to_async(con.srem)(set_name, id)
        return value

    async def is_id_in_set(self, set_name, id):
        con = get_redis_connection("default")
        value = await sync_to_async(con.sismember)(set_name, id)
        return value

    async def count_ids_in_set(self, set_name):
        con = get_redis_connection("default")
        value = await sync_to_async(con.scard)(set_name)
        return value

    async def get_key(self, key):
        value = await sync_to_async(cache.get)(key)
        return value

    async def set_key(self, key, value):
        value = await sync_to_async(cache.set)(key, value)
        return value

    async def remove_key(self, key):
        value = await sync_to_async(cache.delete)(key)
        return value

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
        self.max_user_in_tournament = 10
        self.max_user_in_game = 2
        self.pong_received = True
        self.user = self.scope["user"]
        self.user_channel_name = self.channel_name
        query_string = parse_qs(self.scope["query_string"].decode())
        self.user_id = query_string.get("userID", [""])[0]

        self.id = self.scope["url_route"]["kwargs"]["game_id"]

        self.key_game_started = f"game_id_{self.id}_started"
        self.key_game_host = f"game_id_{self.id}_host"
        self.key_game_room = f"game_{self.id}"
        self.key_tournament_room = f"tournament_{self.id}"

        self.key_disconnect = f"game_id_{self.id}_disconnects_user_ids"
        self.key_game_room_user_ids = self.key_game_room + "_user_ids"
        self.key_tournament_room_user_ids = self.key_tournament_room + "_user_ids"

        await self.channel_layer.group_add(self.key_game_room, self.channel_name)
        await self.channel_layer.group_add(self.key_tournament_room, self.channel_name)

        have_been_disconnected = await self.is_id_in_set(
            self.key_disconnect, self.user_id
        )

        game_user_count = await self.count_ids_in_set(self.key_game_room_user_ids)
        tournament_user_count = await self.count_ids_in_set(
            self.key_tournament_room_user_ids
        )

        print(self.key_game_started)
        print(self.key_game_host)
        print(self.key_game_room)
        print(self.key_tournament_room)
        print(self.key_disconnect)
        print(self.key_game_room_user_ids)
        print(self.key_tournament_room_user_ids)
        print("disconnected")
        print(have_been_disconnected)

        if have_been_disconnected:
            print("have_been_disconnected")
            await self.accept()
            user_is_host = await self.is_host(self.user_id)
            if user_is_host:
                await self.send(
                    text_data=json.dumps(
                        {"type": MessageType.CLIENT_TYPE, "msg": "host"}
                    )
                )
            # implement spactators
            else:
                await self.send(
                    text_data=json.dumps(
                        {"type": MessageType.CLIENT_TYPE, "msg": "guest"}
                    )
                )
            await self.remove_id_from_set(self.key_disconnect, self.user_id)
            return

        game_started = await self.get_key(self.key_game_started)
        if game_started:
            print("Game started")
            await self.accept()
            await self.send(
                text_data=json.dumps(
                    {
                        "type": MessageType.GAME_ALREADY_STARTED,
                        "msg": "Game have been started, you cannot join the game!",
                    }
                )
            )
            await self.close()
            return

        if tournament_user_count == self.max_user_in_tournament:
            print("Tournament user count")
            await self.accept()
            await self.send(
                text_data=json.dumps(
                    {
                        "type": MessageType.TOURNAMENT_FULL,
                        "msg": "Tournament is full, sorry!",
                    }
                )
            )
            await self.close()
            return

        if game_user_count is None:
            game_user_count = 0

        if game_user_count == self.max_user_in_game:

            await self.accept()
            await self.add_id_to_set(self.key_tournament_room_user_ids, self.user_id)
            await self.send(
                text_data=json.dumps(
                    {"type": MessageType.GAME_FULL, "msg": "The game is full!"}
                )
            )
            await self.send(
                text_data=json.dumps(
                    {
                        "type": MessageType.ADDED_TO_TOURNAMENT,
                        "msg": "You have been added to the tournament",
                    }
                )
            )

        elif game_user_count == 0:
            print("game_user_count")
            await self.accept()
            await self.set_key(self.key_game_host, self.user_id)
            await self.add_id_to_set(self.key_tournament_room_user_ids, self.user_id)
            await self.add_id_to_set(self.key_game_room_user_ids, self.user_id)
            await self.send(
                text_data=json.dumps({"type": MessageType.CLIENT_TYPE, "msg": "host"})
            )
        elif game_user_count == 1:
            await self.accept()
            await self.add_id_to_set(self.key_tournament_room_user_ids, self.user_id)
            await self.add_id_to_set(self.key_game_room_user_ids, self.user_id)
            await self.send(
                text_data=json.dumps({"type": MessageType.CLIENT_TYPE, "msg": "guest"})
            )
        else:
            await self.accept()
            await self.add_id_to_set(self.key_tournament_room_user_ids, self.user_id)
            await self.send(
                text_data=json.dumps(
                    {"type": MessageType.CLIENT_TYPE, "msg": "spectator"}
                )
            )
            # await self.send(
            #     text_data=json.dumps(
            #         {
            #             "type": MessageType.CLIENT_TYPE,
            #             "msg": "Already two players connected!",
            #         }
            #     )
            # )
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

    async def start_disconnect_countdown(self, user_id, user_in_game):
        countdown_time = 10
        for i in range(countdown_time, 0, -1):
            disconnected = await self.is_id_in_set(self.key_disconnect, self.user_id)
            if not disconnected:
                return
            await self.channel_layer.group_send(
                self.key_tournament_room,
                {
                    "type": "process_disconnect_countdown",
                    "message": json.dumps(
                        {
                            "type": MessageType.DISCONNECT_COUNTDOWN,
                            "msg": "User {user_id} will be disconnected in {i} seconds.",
                        }
                    ),
                },
            )
            await asyncio.sleep(1)
        await self.channel_layer.group_send(
            self.key_tournament_room,
            {
                "type": "broadcast_message",
                "message": json.dumps(
                    {
                        "type": MessageType.DISCONNECT,
                        "msg": "User {user_id} have been disconnected.",
                    }
                ),
            },
        )
        await self.remove_id_from_set(self.key_disconnect, self.user_id)

        # await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def disconnect(self, close_code):
        await self.add_id_to_set(self.key_disconnect, self.user_id)
        await self.channel_layer.group_discard(self.key_game_room, self.channel_name)
        await self.channel_layer.group_discard(
            self.key_tournament_room, self.channel_name
        )
        user_in_game = await self.is_id_in_set(self.key_game_room, self.user_id)
        asyncio.create_task(self.start_disconnect_countdown(self.user_id, user_in_game))
        # await self.send(text_data="{'type':6,'msg':'Disconnection successfull.'}")

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
        user_is_host = self.is_host(self.user_id)
        if user_is_host:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "process_game_start",
                    "message": data,
                    "sender_channel_name": self.channel_name,
                },
            )
            self.set_key(self.key_game_started, True)
        else:
            await self.send(
                text_data=json.dumps(
                    {
                        "type": 8,
                        "msg": "Unauthorized operation, only host can send a start signal.",
                    }
                )
            )

    async def handle_game_counter(self, data):
        user_is_host = self.is_host(self.user_id)
        if user_is_host:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "process_game_counter",
                    "message": data,
                    "sender_channel_name": self.channel_name,
                },
            )
        else:
            await self.send(
                text_data=json.dumps({"type": 8, "msg": "Unauthorized operation."})
            )

    async def handle_positions(self, jsonDict):
        await self.channel_layer.group_send(
            self.key_game_room,
            {
                "type": "process_game_postion",
                "message": jsonDict,
                "sender_channel_name": self.channel_name,
            },
        )

    async def handle_game_end(self, data):
        user_is_host = self.is_host(self.user_id)
        if user_is_host:
            await self.channel_layer.group_send(
                self.key_game_room,
                {
                    "type": "process_game_end",
                    "message": data,
                    "sender_channel_name": self.channel_name,
                },
            )
        else:
            await self.send(
                text_data=json.dumps({"type": 8, "msg": "Unauthorized operation."})
            )

    async def disconnect_all(self, event):
        cache.delete(self.key_game_host)
        cache.delete(self.game_users_count_key)
        await self.send(
            text_data=json.dumps({"type": -1, "msg": "disconnected all players"})
        )

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

    async def process_disconnect_countdown(self, event):
        data = event["message"]
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
