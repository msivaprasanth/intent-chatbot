import os 
from pathlib import Path
from dotenv import load_dotenv # type: ignore

BACKEND_DIR = Path(__file__).resolve().parent
load_dotenv(BACKEND_DIR / ".env")
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY").strip()
GROQ_MODEL = os.getenv("GROQ_MODEL").strip()


