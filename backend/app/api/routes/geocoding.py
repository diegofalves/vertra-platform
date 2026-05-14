from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.google_maps import get_coordinates

router = APIRouter()

class AddressRequest(BaseModel):
    address: str

@router.post("/geocode")
async def geocode(request: AddressRequest):
    result = await get_coordinates(request.address)
    if not result:
        raise HTTPException(status_code=404, detail="Endereço não encontrado")
    return result