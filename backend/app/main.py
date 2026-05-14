from fastapi import FastAPI
from app.api.routes.geocoding import router as geocoding_router

app = FastAPI(title="Vertra API")

app.include_router(geocoding_router, prefix="/api/v1", tags=["geocoding"])

@app.get("/")
async def root():
    return {"message": "Vertra API rodando"}