from functools import lru_cache
from os import getenv

from pydantic import BaseModel


class Settings(BaseModel):
	database_url: str | None = None
	clerk_secret_key: str | None = None
	google_maps_api_key: str | None = None


@lru_cache
def get_settings() -> Settings:
	return Settings(
		database_url=getenv("DATABASE_URL"),
		clerk_secret_key=getenv("CLERK_SECRET_KEY"),
		google_maps_api_key=getenv("GOOGLE_MAPS_API_KEY"),
	)
