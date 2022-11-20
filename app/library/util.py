import asyncio
import logging as logger

'''
Get status as an event generator
'''
status_stream_delay = 5  # second
status_stream_retry_timeout = 30000  # milisecond


async def compute_status(param1):
    return "DONE"


async def status_event_generator(request, param1):
    previous_status = None
    while True:
        if await request.is_disconnected():
            print('Request disconnected')
            break

        if previous_status and previous_status == "DONE":
            print('Request completed. Disconnecting now')
            yield {
                "event": "end",
                "data": ''
            }
            break

        current_status = await compute_status(param1)
        if previous_status != current_status:
            yield {
                "event": "update",
                "retry": status_stream_retry_timeout,
                "data": current_status
            }
            previous_status = current_status
            print('Current status :', current_status)
        else:
            print('No change in status...')

        await asyncio.sleep(status_stream_delay)
