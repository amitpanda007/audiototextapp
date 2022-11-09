from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from .library.helpers import *
from app.routers import twoforms, unsplash, accordion

from fastapi import FastAPI, File, UploadFile
import aiofiles


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
    data = openfile(page_name+".html")
    title = page_name.title() + " - "
    return templates.TemplateResponse("page.html", {"request": request, "data": data, "title": title})

@app.post("/upload/")
async def create_upload_files(file: UploadFile):
    async with aiofiles.open(f'upload/{file.filename}', 'wb') as out_file:
        while content := await file.read(1024):  # async read chunk
            await out_file.write(content)  # async write chunk

    return {"Result": "OK"}