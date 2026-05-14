import httpx
from app.core.config import GOOGLE_MAPS_API_KEY

async def get_coordinates(address: str):
    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        "address": address,
        "key": GOOGLE_MAPS_API_KEY
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        data = response.json()

    if data["status"] != "OK":
        return None

    result = data["results"][0]
    location = result["geometry"]["location"]

    return {
        "latitude": location["lat"],
        "longitude": location["lng"],
        "formatted_address": result["formatted_address"]
    }