from fastapi import APIRouter

from app.models.schemas import GeocodeRequest, GeocodeResponse
from app.services.google_maps import GoogleMapsService


router = APIRouter(prefix="/geocoding", tags=["Geocoding"])
google_maps_service = GoogleMapsService()


@router.post("", response_model=GeocodeResponse)
async def geocode_address(payload: GeocodeRequest) -> GeocodeResponse:
	return await google_maps_service.geocode_address(payload.address)
