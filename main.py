import boto3
import json
import io
from PyPDF2 import PdfReader
import requests
import logging

from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def send_to_wealth_calculator(data):
    function_url = "https://2736slpk4j.execute-api.us-west-2.amazonaws.com/WealthScoreCalculator"
    response = requests.post(function_url, json=data)
    if response.status_code == 200:
        print("Data successfully sent to Wealth Calculator")
        print("Response: ", response.json())
        return response.json()
    else:
        print("Error:", response.status_code, response.text)
        return None

# Initialize Bedrock client once
session = boto3.Session()
bedrock_runtime = session.client('bedrock-runtime', region_name='us-west-2')

logging.basicConfig(level=logging.INFO)

@app.post("/upload-bank-statement")
async def upload_bank_statement(
    file: UploadFile = File(...),
    investment_strategy: str = "Aggressive Investing"
):
    logging.info("Received upload-bank-statement request")
    """
    Accepts a PDF file in-memory from the frontend,
    parses text, calls Bedrock, then sends data to
    the Wealth Calculator.
    """
    try:
        # 1) Read file bytes
        file_bytes = await file.read()

        # 2) Extract text from PDF
        reader = PdfReader(io.BytesIO(file_bytes))
        text = ""
        for page in reader.pages:
            text += page.extract_text()

        # 3) Build prompt
        prompt = f"""
        I want to use the strategy {investment_strategy}. Based on my bank statement:
        {text}

        Please provide:
        1) A unique user ID (alphanumeric) as a string
        2) A timestamp (ISO 8601 format) as a string
        3) How much money I should save monthly (numerical)
        4) A Wealth Health score (0–100), considering spending habits and savings
        5) Investment advice

        Format your response strictly as valid JSON, e.g.:
        {{
          "user_id": "user123",
          "timestamp": "2025-01-25T18:00:00Z",
          "monthly_savings": 1234,
          "wealth_health": 99,
          "investment_advice": "Invest in diversified ETFs."
        }}

        Do not include any extra text.
        """

        # 4) Bedrock request
        kwargs = {
            "modelId": "anthropic.claude-3-5-sonnet-20241022-v2:0",
            "contentType": "application/json",
            "accept": "application/json",
            "body": json.dumps({
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 200,
                "temperature": 0.3,
                "top_p": 0.95,
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": prompt
                            }
                        ]
                    }
                ]
            })
        }

        response = bedrock_runtime.invoke_model(**kwargs)
        response_body = json.loads(response["body"].read())

        # 5) Parse the LLM response
        llm_output = response_body["content"][0]["text"]
        llm_data = json.loads(llm_output)

        print("LLM Output:", llm_data)

        # 6) Send extracted data to the Wealth Calculator
        wc_response = send_to_wealth_calculator(llm_data)

        # 7) Return combined results to the client
        return JSONResponse({
            "llm_data": llm_data,
            "wealth_calc_response": wc_response
        })

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=400)

@app.get("/")
def read_root():
    return {"message": "Upload your bank statement to /upload-bank-statement"}