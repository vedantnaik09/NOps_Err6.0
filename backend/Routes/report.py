# Routes/report.py
from fastapi import APIRouter, UploadFile, Form, File, HTTPException
from fastapi.responses import FileResponse
from typing import List
import tempfile
import os
import aiohttp
from Functions.report import ReportGenerator
from bson import ObjectId

router = APIRouter()


async def fetch_structured_json(files: List[UploadFile], user_id: str, conversation_id: str):
    """Fetch structured JSON with visualizations"""
    async with aiohttp.ClientSession() as session:
        form_data = aiohttp.FormData()
        for file in files:
            await file.seek(0)
            content = await file.read()
            form_data.add_field('files', content, filename=file.filename)
        form_data.add_field('user_id', user_id)
        form_data.add_field('conversation_id', conversation_id)

        try:
            async with session.post(
                    'http://localhost:8000/api/analysis/structured_json/',
                    data=form_data
            ) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    error_text = await response.text()
                    print(f"Structured JSON API error: {error_text}")
                    return None
        except Exception as e:
            print(f"Error fetching structured JSON: {str(e)}")
            return None


async def fetch_anomaly_data(files: List[UploadFile], user_id: str, conversation_id: str):
    """Fetch anomaly detection results"""
    async with aiohttp.ClientSession() as session:
        form_data = aiohttp.FormData()
        for file in files:
            await file.seek(0)
            content = await file.read()
            form_data.add_field('files', content, filename=file.filename)
        form_data.add_field('user_id', user_id)
        form_data.add_field('conversation_id', conversation_id)

        try:
            async with session.post(
                    'http://localhost:8000/api/anomaly/anomaly-processing',
                    data=form_data
            ) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    error_text = await response.text()
                    print(f"Anomaly API error: {error_text}")
                    return None
        except Exception as e:
            print(f"Error fetching anomaly data: {str(e)}")
            return None


@router.post("/generate-report")
async def generate_report(
        files: List[UploadFile] = File(...),
        user_id: str = Form(...),
        conversation_id: str = Form(...)
):
    """Generate comprehensive financial report"""
    try:
        # Validate input
        if not files:
            raise HTTPException(400, "No files provided")

        # Validate conversation_id if provided
        if conversation_id and conversation_id != "string":
            if not ObjectId.is_valid(conversation_id):
                raise HTTPException(400, "Invalid conversation ID format")

        # Get structured JSON with visualizations
        print("Fetching structured JSON data...")
        analysis_data = await fetch_structured_json(files, user_id, conversation_id)
        if not analysis_data:
            raise HTTPException(500, "Failed to fetch structured JSON data")

        # Get anomaly detection results
        print("Fetching anomaly data...")
        anomaly_data = await fetch_anomaly_data(files, user_id, conversation_id)
        if not anomaly_data:
            raise HTTPException(500, "Failed to fetch anomaly data")

        print("Generating report...")
        # Generate report
        report_generator = ReportGenerator()
        report_path = report_generator.create_word_report(
            analysis_data=analysis_data,
            anomaly_data=anomaly_data,
            file_names=[f.filename for f in files],
            conversation_id=conversation_id
        )

        return FileResponse(
            path=report_path,
            filename=f"financial_report_{conversation_id}.docx",
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )

    except Exception as e:
        print(f"Report generation error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate report: {str(e)}"
        )