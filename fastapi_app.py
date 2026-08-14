#!/usr/bin/env python3
"""
CTS HealthGuard AI - FastAPI Backend

Phase 6: FastAPI backend integration exposing the investigation engine
- Uses existing combined investigation engine from Phase 5
- Provides clean API interface for frontend applications
- Implements proper validation, error handling, and security
"""

import sys
import os
import logging
from contextlib import asynccontextmanager
from typing import List, Dict, Any, Optional

import uvicorn
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator

# Add project root to path
sys.path.append('.')

# RAG V2 chat router (optional — requires Bedrock to be configured)
_chat_router_available = False
try:
    from Rag_v2.chat_api import chat_router as _chat_router
    _chat_router_available = True
except Exception as _e:
    logger = __import__('logging').getLogger(__name__)
    logger.warning("RAG V2 chat router not loaded: %s", _e)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Global investigation engine instance (loaded once on startup)
investigation_engine = None


def get_investigation_engine():
    """Get or initialize the investigation engine instance."""
    global investigation_engine
    if investigation_engine is None:
        try:
            from scripts.combined_investigation_engine import CombinedInvestigationEngine
            investigation_engine = CombinedInvestigationEngine()
            logger.info("Investigation engine initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize investigation engine: {e}")
            raise RuntimeError("Cannot initialize investigation engine")
    return investigation_engine


# Pydantic Models for Request/Response Validation
class ClaimExplainRequest(BaseModel):
    """Request model for claim explanation."""
    claim_id: str = Field(..., description="Claim ID to investigate")
    claim_type: str = Field(..., description="Type of claim: Carrier, Inpatient, or Outpatient")
    
    @validator('claim_type')
    def validate_claim_type(cls, v):
        valid_types = ['Carrier', 'Inpatient', 'Outpatient']
        if v not in valid_types:
            raise ValueError(f'claim_type must be one of {valid_types}')
        return v


class HealthResponse(BaseModel):
    """Health check response model."""
    status: str
    service: str


class XAIDriver(BaseModel):
    """Model for SHAP feature driver."""
    feature: str
    value: float
    shap_value: float
    direction: str


class XAIResponse(BaseModel):
    """XAI-only response model."""
    claim_id: str
    claim_type: str
    anomaly_score: float
    top_drivers: List[XAIDriver]


class SupportingContextResult(BaseModel):
    """Model for individual RAG result."""
    document: Optional[str]
    section: Optional[str]
    source: Optional[str]
    relevance_score: Optional[float]
    text: Optional[str]


class SupportingContextResponse(BaseModel):
    """Supporting context response model."""
    claim_id: str
    claim_type: str
    query: Optional[str]
    grounded: bool
    results: List[SupportingContextResult]


# Application lifespan management
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize and cleanup application resources."""
    # Startup: Load investigation engine once
    logger.info("Starting CTS HealthGuard AI Backend...")
    try:
        # Initialize engine when app starts
        get_investigation_engine()
        logger.info("Application startup complete")
    except Exception as e:
        logger.error(f"Failed to initialize during startup: {e}")
        # Continue anyway - lazy loading will handle this
    
    yield  # Application runs here
    
    # Cleanup: Nothing to cleanup for now
    logger.info("Shutting down CTS HealthGuard AI Backend...")


# Create FastAPI application
app = FastAPI(
    title="CTS HealthGuard AI API",
    description="AI-Powered Medicare Claims Fraud & Anomaly Intelligence API",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React development server
        "http://127.0.0.1:3000",
        "http://localhost:8080",  # Alternative development port
        "http://127.0.0.1:8080"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# RAG V2 — Investigator Chatbot (POST /chat)
if _chat_router_available:
    app.include_router(_chat_router, tags=["chat"])


# API Endpoints
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="ok",
        service="CTS HealthGuard AI"
    )


@app.get("/claims/{claim_id}/explanation")
async def get_claim_explanation(
    claim_id: str,
    claim_type: str = Query(..., description="Claim type: Carrier, Inpatient, or Outpatient")
):
    """Get complete investigation explanation for a claim."""
    try:
        engine = get_investigation_engine()
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    # Validate claim type
    valid_types = ['Carrier', 'Inpatient', 'Outpatient']
    if claim_type not in valid_types:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid claim_type. Must be one of: {', '.join(valid_types)}"
        )
    
    try:
        logger.info(f"Processing explanation request for {claim_type} claim {claim_id}")
        result = engine.explain_claim_with_context(claim_id, claim_type)
        
        # Handle errors from investigation engine
        if 'error' in result:
            error_msg = result['error']
            if 'not found' in error_msg.lower():
                raise HTTPException(status_code=404, detail=f"Claim {claim_id} not found")
            else:
                raise HTTPException(status_code=500, detail="Investigation failed")
        
        # Remove internal/sensitive information
        sanitized_result = _sanitize_response(result)
        
        return sanitized_result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing claim {claim_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/claims/{claim_id}/xai", response_model=XAIResponse)
async def get_claim_xai(
    claim_id: str,
    claim_type: str = Query(..., description="Claim type: Carrier, Inpatient, or Outpatient")
):
    """Get XAI/SHAP explanation only for a claim."""
    try:
        engine = get_investigation_engine()
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    # Validate claim type
    valid_types = ['Carrier', 'Inpatient', 'Outpatient']
    if claim_type not in valid_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid claim_type. Must be one of: {', '.join(valid_types)}"
        )
    
    try:
        logger.info(f"Processing XAI request for {claim_type} claim {claim_id}")
        result = engine.explain_claim_with_context(claim_id, claim_type)
        
        # Handle errors
        if 'error' in result:
            error_msg = result['error']
            if 'not found' in error_msg.lower():
                raise HTTPException(status_code=404, detail=f"Claim {claim_id} not found")
            else:
                raise HTTPException(status_code=500, detail="Investigation failed")
        
        # Extract XAI information only
        xai_data = result.get('xai', {})
        anomaly_score = result.get('model_risk_assessment', {}).get('anomaly_score', 0.0)
        top_drivers = xai_data.get('top_drivers', [])
        
        # Format drivers for response
        formatted_drivers = []
        for driver in top_drivers:
            formatted_drivers.append(XAIDriver(
                feature=driver.get('feature', ''),
                value=driver.get('value', 0.0),
                shap_value=driver.get('shap_value', 0.0),
                direction=driver.get('direction', 'unknown')
            ))
        
        return XAIResponse(
            claim_id=claim_id,
            claim_type=claim_type,
            anomaly_score=anomaly_score,
            top_drivers=formatted_drivers
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing XAI for claim {claim_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/claims/{claim_id}/supporting-context", response_model=SupportingContextResponse)
async def get_supporting_context(
    claim_id: str,
    claim_type: str = Query(..., description="Claim type: Carrier, Inpatient, or Outpatient")
):
    """Get RAG supporting context only for a claim."""
    try:
        engine = get_investigation_engine()
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    # Validate claim type
    valid_types = ['Carrier', 'Inpatient', 'Outpatient']
    if claim_type not in valid_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid claim_type. Must be one of: {', '.join(valid_types)}"
        )
    
    try:
        logger.info(f"Processing supporting context request for {claim_type} claim {claim_id}")
        result = engine.explain_claim_with_context(claim_id, claim_type)
        
        # Handle errors
        if 'error' in result:
            error_msg = result['error']
            if 'not found' in error_msg.lower():
                raise HTTPException(status_code=404, detail=f"Claim {claim_id} not found")
            else:
                raise HTTPException(status_code=500, detail="Investigation failed")
        
        # Extract supporting context information
        context_data = result.get('supporting_context', {})
        
        # Format results
        formatted_results = []
        for res in context_data.get('results', []):
            formatted_results.append(SupportingContextResult(
                document=res.get('document'),
                section=res.get('section'),
                source=res.get('source'),
                relevance_score=res.get('relevance_score'),
                text=res.get('text')
            ))
        
        return SupportingContextResponse(
            claim_id=claim_id,
            claim_type=claim_type,
            query=context_data.get('query'),
            grounded=context_data.get('grounded', False),
            results=formatted_results
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing supporting context for claim {claim_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.post("/claims/explain")
async def explain_claim(request: ClaimExplainRequest):
    """Explain claim via POST request."""
    try:
        engine = get_investigation_engine()
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    try:
        logger.info(f"Processing POST explanation request for {request.claim_type} claim {request.claim_id}")
        result = engine.explain_claim_with_context(request.claim_id, request.claim_type)
        
        # Handle errors from investigation engine
        if 'error' in result:
            error_msg = result['error']
            if 'not found' in error_msg.lower():
                raise HTTPException(status_code=404, detail=f"Claim {request.claim_id} not found")
            else:
                raise HTTPException(status_code=500, detail="Investigation failed")
        
        # Remove internal/sensitive information
        sanitized_result = _sanitize_response(result)
        
        return sanitized_result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing POST request for claim {request.claim_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


def _sanitize_response(response: Dict[str, Any]) -> Dict[str, Any]:
    """Remove sensitive/internal information from API responses."""
    sanitized = response.copy()
    
    # Remove or sanitize sensitive fields
    claim_section = sanitized.get('claim', {})
    if 'desynpuf_id' in claim_section:
        # Keep DESYNPUF_ID as it may be useful for frontend, but could be removed if sensitive
        pass
    
    # Ensure disclaimer is present
    if 'disclaimer' not in sanitized:
        sanitized['disclaimer'] = "This assessment is an AI-generated risk signal intended to support investigation. It does not establish fraud."
    
    return sanitized


# Development server runner
if __name__ == "__main__":
    uvicorn.run(
        "fastapi_app:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )