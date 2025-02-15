from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from Routes import user_routes,graph,anomaly

load_dotenv()

app = FastAPI()

# Allow requests only from your Next.js frontend running on localhost:3000
origins = [
    "http://localhost:3000",
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


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
