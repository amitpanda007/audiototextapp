from fastapi import FastAPI, APIRouter, Query, HTTPException, Request
from fastapi.templating import Jinja2Templates

from typing import Optional, Any
from pathlib import Path

from starlette.templating import _TemplateResponse

from schemas import RecipeSearchResults, Recipe, RecipeCreate

# 1
BASE_PATH = Path(__file__).resolve().parent
TEMPLATES = Jinja2Templates(directory=str(BASE_PATH / "templates"))

app = FastAPI(title="Recipe API", openapi_url="/openapi.json")
api_router = APIRouter()


# Updated to serve a Jinja2 template
# https://www.starlette.io/templates/
# https://jinja.palletsprojects.com/en/3.0.x/templates/#synopsis
@app.get("/", status_code=200)
def root(request: Request) -> _TemplateResponse:  # 2
    """
    Root GET
    """

    # 3
    return TEMPLATES.TemplateResponse("index.html", {"request": request})

