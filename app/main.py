import asyncio

from fastapi import FastAPI, Request, HTTPException, BackgroundTasks
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import JSONResponse

from .library.helpers import *
from app.routers import twoforms, unsplash, accordion

from fastapi import FastAPI, File, UploadFile
import aiofiles
CHUNK_SIZE = 4096 * 4096

import whisper

app = FastAPI()

templates = Jinja2Templates(directory="templates")

app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(unsplash.router)
app.include_router(twoforms.router)
app.include_router(accordion.router)


@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    data = openfile("home.html")
    title = "Home" + " - "
    return templates.TemplateResponse("page.html", {"request": request, "data": data, "title": title})


@app.get("/page/{page_name}", response_class=HTMLResponse)
async def show_page(request: Request, page_name: str):
    data = openfile(page_name + ".html")
    title = page_name.title() + " - "
    return templates.TemplateResponse("page.html", {"request": request, "data": data, "title": title})


@app.post("/upload/")
async def create_upload_files(file: UploadFile):
    try:
        async with aiofiles.open(f'upload/{file.filename}', 'wb') as out_file:
            while content := await file.read(CHUNK_SIZE):  # async read chunk
                await out_file.write(content)  # async write chunk
        return JSONResponse(
            status_code=200,
            content={"message": f"File uploaded successfully."},
        )
    except Exception:
        return JSONResponse(
            status_code=500,
            content={"message": f"Oops! Something went wrong..."},
        )


async def transcribe_data(filename: str):
    # Start Transcribe with Whisper
    model = whisper.load_model('medium')

    # To run only on CPU set fp16=False. eg. model.transcribe(f'./input/{filename}', fp16=False)
    out = model.transcribe(f'./upload/{filename}', fp16=False)
    transcribed_text = out["text"]
    print(transcribed_text)
    return transcribed_text


async def transcribe_wrapper(filename: str):
    loop = asyncio.get_event_loop()
    loop.create_task(transcribe_data(filename))


@app.post("/transcribe-upload/")
async def transcribe_upload_files(file: UploadFile, background_tasks: BackgroundTasks):
    file_mask = ["mp3", "mp4", "mkv", "m4a", "wav", "flac"]
    filename = file.filename
    file_ext = filename.rsplit(".", 1)[1]
    if file_ext.lower() in file_mask:
        try:
            async with aiofiles.open(f'upload/{file.filename}', 'wb') as out_file:
                print("Starting file upload")
                while content := await file.read(1024):  # async read chunk
                    await out_file.write(content)  # async write chunk

            print("File upload done. starting transcription.")
            background_tasks.add_task(transcribe_wrapper, filename)

            transcribed_text = ""
            return JSONResponse(
                status_code=200,
                content={"message": f"Transcription Completed.", "transcription": transcribed_text},
            )
        except Exception:
            return JSONResponse(
                status_code=500,
                content={"message": f"Oops! Something went wrong..."},
            )
    else:
        return JSONResponse(
            status_code=403,
            content={"message": f"Unsupported filetype uploaded. Please upload {file_mask} files."},
        )

