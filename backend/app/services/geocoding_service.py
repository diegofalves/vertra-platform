import asyncio
from app.services.google_maps import get_coordinates
from app.services.database import fetch_one, execute


async def geocode_address(address: str) -> dict | None:
    normalized = address.strip()

    cached = await fetch_one(
        "SELECT latitude, longitude, normalized_address FROM address_cache WHERE raw_address = $1",
        normalized,
    )
    if cached:
        return {
            "latitude": float(cached["latitude"]),
            "longitude": float(cached["longitude"]),
            "formatted_address": cached["normalized_address"] or normalized,
            "source": "cached",
        }

    result = await get_coordinates(normalized)
    if not result:
        return None

    await execute(
        """
        INSERT INTO address_cache (raw_address, normalized_address, latitude, longitude, source)
        VALUES ($1, $2, $3, $4, 'google_api')
        ON CONFLICT (raw_address) DO NOTHING
        """,
        normalized,
        result["formatted_address"],
        result["latitude"],
        result["longitude"],
    )

    return {
        "latitude": result["latitude"],
        "longitude": result["longitude"],
        "formatted_address": result["formatted_address"],
        "source": "api",
    }


async def geocode_batch(addresses: list[str]) -> dict[str, dict | None]:
    unique = list(dict.fromkeys(a.strip() for a in addresses if a and a.strip()))
    results = await asyncio.gather(*[geocode_address(addr) for addr in unique])
    return dict(zip(unique, results))
