
import time
import asyncio
import websocket
import json
import websockets


state = 'disconnected'
amount_str = {}
fine_amount_str = {}
amount = {}
async def serve(websocket, path):
    try:
        global state
        async for message in websocket:
            data = json.loads(message)
            if(state=='disconnected' and data["state"]=='connected'):
                state = 'read_state'
                plaza_name = data["data"]["plaza"]["name"]
                for i in data["data"]["charges"]:
                    amount[i["vehicle_type"]] = i["amount"]
                    amount_str[i["vehicle_type"]] = f'Total:{i["amount"]}'
                    fine_amount_str[i["vehicle_type"]] = f'Total:{i["amount"] + i["fine"]} (Fine:{i["fine"]})'
            if(state=='read_state' or data["state"] == 'start_read'):
                vehicle_id = input('Enter Vehicle ID: ');
                state='read_complete_state'
                await websocket.send(json.dumps({"state": "read_complete_state", "vehicle_id": vehicle_id}))
            
            if(state=='read_complete_state' and data["state"]=='read_complete_state'):
                state = 'deduct_balance'
            if(state=='deduct_balance' and data["state"]=='deducted_balance'):
            	await asyncio.sleep(5)
            	await websocket.send(json.dumps({"state": "end_state"}))
            	state='read_state'
                
            
    finally:
        print('Disconnected')

async def webs():
    async with websockets.serve(serve, "192.168.43.165", 6789):
        await asyncio.Future()
loop = asyncio.run(webs())

