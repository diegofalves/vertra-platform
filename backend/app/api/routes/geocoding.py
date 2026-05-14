from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    BulkGeocodeRequest,
    BulkGeocodeResponse,
    GeocodeRequest,
    GeocodeResponse,
)
from app.services.geocoding_service import geocode_address, geocode_batch

router = APIRouter()


@router.post("/geocode", response_model=GeocodeResponse)
async def geocode(request: GeocodeRequest):
    result = await geocode_address(request.address)
    if not result:
        raise HTTPException(status_code=404, detail="Endereço não encontrado")
    return result


@router.post("/geocode/batch", response_model=BulkGeocodeResponse)
async def geocode_batch_endpoint(request: BulkGeocodeRequest):
    results = await geocode_batch(request.addresses)
    return {"results": results}
