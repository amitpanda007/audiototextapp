from fastapi import FastAPI, File, UploadFile
from fastapi.responses import HTMLResponse
import aiofiles

app = FastAPI()


@app.get("/heartbeat")
async def root():
    return {"message": "Alive"}

@app.post("/upload/")
async def create_upload_files(file: UploadFile):
    async with aiofiles.open(f'upload/{file.filename}', 'wb') as out_file:
        while content := await file.read(1024):  # async read chunk
            await out_file.write(content)  # async write chunk

    return {"Result": "OK"}


@app.get("/")
async def main():
    content = """
        <body>
            </form>
                <form action="/upload/" enctype="multipart/form-data" method="post">
                <input name="file" type="file" multiple>
                <input type="submit">
            </form>
        </body>
    """
    return HTMLResponse(content=content)