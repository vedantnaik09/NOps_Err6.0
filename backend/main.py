from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import os

from Routes import user_routes,graph,anomaly,analysis,report

load_dotenv()

# Initialize MongoDB
mongo_client = AsyncIOMotorClient(os.getenv("MONGO_URI"))
db = mongo_client.chatbot_db

app = FastAPI()

# Allow requests only from your Next.js frontend running on localhost:3000
origins = [
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Only allow these origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include your user routes
app.include_router(user_routes.router, prefix="/api/users")
app.include_router(graph.router, prefix="/api/users")
app.include_router(anomaly.router, prefix="/api/anomaly")
app.include_router(analysis.router, prefix="/api/analysis")
app.include_router(report.router, prefix="/api/report", tags=["Report"])

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
