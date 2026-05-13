from __future__ import annotations

from typing import Any

import httpx
from fastapi import HTTPException, status

from app.core.config import get_settings
from app.models.schemas import GeocodeResponse


class GoogleMapsService:
	def __init__(self, api_key: str | None = None) -> None:
		settings = get_settings()
		self.api_key = api_key or settings.google_maps_api_key

	async def geocode_address(self, address: str) -> GeocodeResponse:
		normalized_address = address.strip()
		if not normalized_address:
			raise HTTPException(
				status_code=status.HTTP_400_BAD_REQUEST,
				detail="O endereço não pode estar vazio.",
			)

		if not self.api_key:
			raise HTTPException(
				status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
				detail="Variável de ambiente GOOGLE_MAPS_API_KEY não configurada.",
			)

		params = {"address": normalized_address, "key": self.api_key}

		try:
			async with httpx.AsyncClient(timeout=20.0) as client:
				response = await client.get(
					"https://maps.googleapis.com/maps/api/geocode/json",
					params=params,
				)
				response.raise_for_status()
		except httpx.HTTPError as exc:
			raise HTTPException(
				status_code=status.HTTP_502_BAD_GATEWAY,
				detail="Não foi possível consultar a Google Maps Geocoding API.",
			) from exc

		payload: dict[str, Any] = response.json()
		api_status = payload.get("status")

		if api_status == "ZERO_RESULTS":
			raise HTTPException(
				status_code=status.HTTP_404_NOT_FOUND,
				detail="Endereço não encontrado.",
			)

		if api_status != "OK":
			error_message = payload.get("error_message")
			detail = "A Google Maps Geocoding API retornou um erro."
			if error_message:
				detail = f"{detail} {error_message}"
			raise HTTPException(
				status_code=status.HTTP_502_BAD_GATEWAY,
				detail=detail,
			)

		results = payload.get("results") or []
		if not results:
			raise HTTPException(
				status_code=status.HTTP_404_NOT_FOUND,
				detail="Endereço não encontrado.",
			)

		first_result = results[0]
		location = first_result["geometry"]["location"]

		return GeocodeResponse(
			latitude=location["lat"],
			longitude=location["lng"],
			formatted_address=first_result["formatted_address"],
		)
