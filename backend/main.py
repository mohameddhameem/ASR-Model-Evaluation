from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import asr_router, datasets_router, analytics_router, operations_router

app = FastAPI(
    title="ASR Model Evaluation API",
    description="Mock API for evaluating ASR models",
    version="1.0.0"
)

# Add CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(asr_router)
app.include_router(datasets_router)
app.include_router(analytics_router)
app.include_router(operations_router)

@app.get("/")
async def root():
    return {
        "message": "ASR Model Evaluation API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
