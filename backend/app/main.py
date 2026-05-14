from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.routes.clients import router as clients_router
from app.api.routes.geocoding import router as geocoding_router
from app.api.routes.projects import router as projects_router
from app.api.routes.shipments import router as shipments_router
from app.services.database import close_pool, create_pool


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_pool()
    yield
    await close_pool()


app = FastAPI(title="Vertra API", lifespan=lifespan)

app.include_router(geocoding_router, prefix="/api/v1", tags=["geocoding"])
app.include_router(clients_router, prefix="/api/v1", tags=["clients"])
app.include_router(projects_router, prefix="/api/v1", tags=["projects"])
app.include_router(shipments_router, prefix="/api/v1", tags=["shipments"])


@app.get("/")
async def root():
    return {"message": "Vertra API rodando"}
