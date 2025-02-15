# import os
# import json
# import google.generativeai as genai
# from dotenv import load_dotenv
# load_dotenv()

# def detect(extracted_text_list):
#     # Configure API key
#     genai.configure(api_key=os.environ['GOOGLE_API_KEY'])
    
#     # Initialize the latest model
#     model = genai.GenerativeModel(
#         model_name='gemini-2.0-flash',
#         generation_config={
#             "temperature": 0.1,
#             "response_mime_type": "application/json",
#         }
#     )

#     # Prepare document context with indexes
#     document_context = "\n\n".join(
#         [f"--- DOCUMENT {idx} ---\n{text}\n--- END DOCUMENT {idx} ---"
#          for idx, text in enumerate(extracted_text_list)]
#     )

#     prompt = f"""Analyze these documents comprehensively to detect:
# 1. Individual document anomalies
# 2. Cross-document inconsistencies
# 3. Statistical patterns across documents
# 4. Logical contradictions between documents
# 5. Temporal/geographical mismatches
# 6. Formatting/style anomalies

# Consider these document relationships:
# - Sequential documents (date ordered)
# - Versioned documents
# - Complementary/supplementary materials
# - Potentially conflicting sources

# Documents:
# {document_context}

# Return findings in this JSON structure:
# {{
#   "analysis_summary": {{
#     "total_anomalies": int,
#     "cross_document_issues": int,
#     "severity_distribution": {{
#       "critical": int,
#       "high": int,
#       "medium": int,
#       "low": int
#     }}
#   }},
#   "anomalies": [
#     {{
#       "id": "unique-identifier",
#       "description": "Detailed anomaly description",
#       "type": "data|logic|temporal|formatting|statistical|context",
#       "severity": "critical|high|medium|low",
#       "affected_documents": [int],
#       "evidence": {{
#         "excerpts": [str],
#         "document_references": [int]
#       }},
#       "cross_document": bool,
#       "confidence_score": float
#     }}
#   ]
# }}"""

#     try:
#         if len(document_context) > 900000:
#             return {"error": "Total document size exceeds model capacity"}
            
#         response = model.generate_content(prompt)
#         print(response)
#         result = json.loads(response.text)
        
#         # Add document indexes to evidence references
#         for anomaly in result.get('anomalies', []):
#             anomaly['evidence']['document_references'] = [
#                 int(ref) for ref in anomaly['evidence'].get('document_references', [])
#             ]
        
#         return result
        
#     except json.JSONDecodeError:
#         return {"error": "Failed to parse model response"}
#     except Exception as e:
#         return {"error": f"Analysis failed: {str(e)}"}


import os
import json
import google.generativeai as genai
from dotenv import load_dotenv
load_dotenv()

def detect(extracted_text_list):
    # Configure API key
    genai.configure(api_key=os.environ['GOOGLE_API_KEY'])
    
    # Initialize the latest model
    model = genai.GenerativeModel(
        model_name='gemini-2.0-flash-thinking-exp',
        generation_config={
            "temperature": 0.1,
            # "response_mime_type": "application/json",
        }
    )

    # Prepare document context with indexes
    document_context = "\n\n".join(
        [f"--- DOCUMENT {idx} ---\n{text}\n--- END DOCUMENT {idx} ---"
         for idx, text in enumerate(extracted_text_list)]
    )

    prompt = f"""Analyze these documents comprehensively to detect:
1. Individual document anomalies
2. Cross-document inconsistencies
3. Statistical patterns across documents
4. Logical contradictions between documents
5. Temporal/geographical mismatches
6. Formatting/style anomalies

Consider these document relationships:
- Sequential documents (date ordered)
- Versioned documents
- Complementary/supplementary materials
- Potentially conflicting sources

Documents:
{document_context}

Return findings in this JSON structure:
{{
  "analysis_summary": {{
    "total_anomalies": int,
    "cross_document_issues": int,
    "severity_distribution": {{
      "critical": int,
      "high": int,
      "medium": int,
      "low": int
    }}
  }},
  "anomalies": [
    {{
      "id": "unique-identifier",
      "description": "Detailed anomaly description",
      "type": "data|logic|temporal|formatting|statistical|context",
      "severity": "critical|high|medium|low",
      "affected_documents": [int],
      "evidence": {{
        "excerpts": [str],
        "document_references": [int]
      }},
      "cross_document": bool,
      "confidence_score": float
    }}
  ]
}}"""

    try:
        if len(document_context) > 900000:
            return {"error": "Total document size exceeds model capacity"}
            
        response = model.generate_content(prompt)
        print(response.text)
        response_text = response.text.strip("`json").strip("`") 
        result = json.loads(response_text)
        
        # Add document indexes to evidence references
        for anomaly in result.get('anomalies', []):
            anomaly['evidence']['document_references'] = [
                int(ref) for ref in anomaly['evidence'].get('document_references', [])
            ]
        
        return result
        
    except json.JSONDecodeError:
        return {"error": "Failed to parse model response"}
    except Exception as e:
        return {"error": f"Analysis failed: {str(e)}"}