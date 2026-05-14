from dotenv import load_dotenv
import os

load_dotenv()

GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")