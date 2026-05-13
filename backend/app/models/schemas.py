from pydantic import BaseModel, Field


class GeocodeRequest(BaseModel):
	address: str = Field(..., min_length=1, description="Endereço em texto livre")


class GeocodeResponse(BaseModel):
	latitude: float
	longitude: float
	formatted_address: str
