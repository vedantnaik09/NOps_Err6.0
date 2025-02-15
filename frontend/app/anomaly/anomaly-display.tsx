
"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function AnomalyDisplay() {
  const [sortBy, setSortBy] = useState('all')
  
  // Sample data
  const data = {
    "user_id": "Rajat",
    "conversation_id": "Vedant",
    "anamoly": {
      "analysis_summary": {
        "total_anomalies": 29,
        "cross_document_issues": 5,
        "severity_distribution": {
          "critical": 18,
          "high": 8,
          "medium": 3,
          "low": 0
        }
      },
      "anomalies": [{
        "id": "ANO001",
        "description": "Unfamiliar Chief Compliance Officer, Sarah L. Bennett, mentioned in Document 0, not listed in Document 1's leadership.",
        "type": "context",
        "severity": "medium",
        "affected_documents": [
          0,
          1
        ],
        "evidence": {
          "excerpts": [
            "referencing an unfamiliar Chief Compliance  Officer, Sarah L. Bennett, instead of the known executive."
          ],
          "document_references": [
            0,
            1
          ]
        },
        "cross_document": true,
        "confidence_score": 0.8
      },
      {
        "id": "ANO002",
        "description": "Marginally inflated revenues from corporate services reported in Document 0 compared to Document 1.",
        "type": "data",
        "severity": "high",
        "affected_documents": [
          0,
          1
        ],
        "evidence": {
          "excerpts": [
            "reported revenues from corporate \nservices were marginally inflated",
            "Corporate Services  10"
          ],
          "document_references": [
            0,
            1
          ]
        },
        "cross_document": true,
        "confidence_score": 0.9
      },
      {
        "id": "ANO003",
        "description": "Obscure investment entity 'Pacific Horizon Fund' with questionable valuation in Document 0.",
        "type": "data",
        "severity": "high",
        "affected_documents": [
          0
        ],
        "evidence": {
          "excerpts": [
            "an obscure \ninvestment entity, the 'Pacific Horizon Fund, ' was listed \nwith a questionable valuation."
          ],
          "document_references": [
            0
          ]
        },
        "cross_document": false,
        "confidence_score": 0.9
      },
      {
        "id": "ANO004",
        "description": "Fabricated revenue entry of $7.8 billion from nonexistent 'Global Express Fund' in Document 0.",
        "type": "data",
        "severity": "critical",
        "affected_documents": [
          0
        ],
        "evidence": {
          "excerpts": [
            "anomalies such as a fabricated revenue entry of $7.8 \nbillion from a nonexistent 'Global Express Fund '"
          ],
          "document_references": [
            0
          ]
        },
        "cross_document": false,
        "confidence_score": 1
      },
      {
        "id": "ANO005",
        "description": "Fabricated $4.5 billion digital payments investment attributed to fictitious subsidiary 'Express Digital Innovations Ltd.' in Document 0.",
        "type": "data",
        "severity": "critical",
        "affected_documents": [
          0
        ],
        "evidence": {
          "excerpts": [
            "Another fabricated figure included a $4.5 \nbillion digital payments investment attributed to a \nfictitious subsidiary, 'Express Digital Innovations Ltd.'"
          ],
          "document_references": [
            0
          ]
        },
        "cross_document": false,
        "confidence_score": 1
      },
      {
        "id": "ANO006",
        "description": "Fabricated $3.2 billion expense for 'Blockchain Payment Infrastructure' inflating operational costs in Document 0.",
        "type": "data",
        "severity": "critical",
        "affected_documents": [
          0
        ],
        "evidence": {
          "excerpts": [
            "Operational costs of $15.4 billion were inflated with a \nfabricated $3.2 billion expense  for 'Blockchain Payment \nInfrastructure.'"
          ],
          "document_references": [
            0
          ]
        },
        "cross_document": false,
        "confidence_score": 1
      },
      {
        "id": "ANO007",
        "description": "Inclusion of Michael T. Carter as Chief Risk Officer, a non-existent executive, in Document 0.",
        "type": "context",
        "severity": "high",
        "affected_documents": [
          0,
          1
        ],
        "evidence": {
          "excerpts": [
            "the inclusion of Michael T. \nCarter as Chief Risk Officer, a non -existent executive"
          ],
          "document_references": [
            0,
            1
          ]
        },
        "cross_document": true,
        "confidence_score": 1
      },
      {
        "id": "ANO008",
        "description": "Fabricated $2.9 billion investment in the 'Atlantic Reserve Digital Fund' in Document 0.",
        "type": "data",
        "severity": "critical",
        "affected_documents": [
          0
        ],
        "evidence": {
          "excerpts": [
            "a fabricated $2.9 billion investment in the 'Atlantic \nReserve Digital Fund'"
          ],
          "document_references": [
            0
          ]
        },
        "cross_document": false,
        "confidence_score": 1
      },
      {
        "id": "ANO009",
        "description": "Discrepancy of $6.5 billion transaction linked to a fictional 'European Credit Network' in Document 0.",
        "type": "data",
        "severity": "critical",
        "affected_documents": [
          0
        ],
        "evidence": {
          "excerpts": [
            "Further discrepancies include a $6.5 \nbillion transaction linked to a fictional 'European Credit \nNetwork,'"
          ],
          "document_references": [
            0
          ]
        },
        "cross_document": false,
        "confidence_score": 1
      },
      {
        "id": "ANO010",
        "description": "Overstated marketing expenses of $2.1 billion in Document 0.",
        "type": "data",
        "severity": "high",
        "affected_documents": [
          0
        ],
        "evidence": {
          "excerpts": [
            "overstated marketing expenses of $2.1 \nbillion"
          ],
          "document_references": [
            0
          ]
        },
        "cross_document": false,
        "confidence_score": 0.9
      },
      {
        "id": "ANO011",
        "description": "Fabricated $5.3 billion equity investment in 'Asia-Pacific Growth Ventures' in Document 0.",
        "type": "data",
        "severity": "critical",
        "affected_documents": [
          0
        ],
        "evidence": {
          "excerpts": [
            "a fabricated $5.3 billion equity investm ent \nin 'Asia -Pacific Growth Ventures.'"
          ],
          "document_references": [
            0
          ]
        },
        "cross_document": false,
        "confidence_score": 1
      },
      {
        "id": "ANO012",
        "description": "Unusual entry of $4.8 billion allocated to 'AI Payment Systems Expansion' with no verifiable source in Document 0.",
        "type": "data",
        "severity": "high",
        "affected_documents": [
          0
        ],
        "evidence": {
          "excerpts": [
            "Unusual entries such \nas $4.8 billion allocated to 'AI Payment Systems \nExpansion' with no verifiable source"
          ],
          "document_references": [
            0
          ]
        },
        "cross_document": false,
        "confidence_score": 0.9
      },
      {
        "id": "ANO013",
        "description": "$3.9 billion in revenue from 'Contactless Payment Solutions LLC' lacking operational history in Document 0.",
        "type": "data",
        "severity": "high",
        "affected_documents": [
          0
        ],
        "evidence": {
          "excerpts": [
            "$3.9 billion in \nrevenue from 'Contactless Payment Solutions LLC,' \nwhich lacks operational history"
          ],
          "document_references": [
            0
          ]
        },
        "cross_document": false,
        "confidence_score": 0.9
      },
      {
        "id": "ANO014",
        "description": "Fabricated $7.4 billion in phantom operational leases in Document 0.",
        "type": "data",
        "severity": "critical",
        "affected_documents": [
          0
        ],
        "evidence": {
          "excerpts": [
            "Additional fabricated data includes \n$7.4 billion in phantom operational leases"
          ],
          "document_references": [
            0
          ]
        },
        "cross_document": false,
        "confidence_score": 1
      },
      {
        "id": "ANO015",
        "description": "$6.3 billion marked under a non-existent 'FinTech Partnership Program' in Document 0.",
        "type": "data",
        "severity": "critical",
        "affected_documents": [
          0
        ],
        "evidence": {
          "excerpts": [
            "$6.3 billion \nmarked under a non -existent 'FinTech Partnership \nProgram,'"
          ],
          "document_references": [
            0
          ]
        },
        "cross_document": false,
        "confidence_score": 1
      },
      {
        "id": "ANO016",
        "description": "Suspicious $5.7 billion labeled as 'Crypto Asset Holdings' in Document 0.",
        "type": "data",
        "severity": "high",
        "affected_documents": [
          0
        ],
        "evidence": {
          "excerpts": [
            "a suspicious $5.7 billion labeled as \n'Crypto Asset Holdings.'"
          ],
          "document_references": [
            0
          ]
        },
        "cross_document": false,
        "confidence_score": 0.9
      },
      {
        "id": "ANO017",
        "description": "Anomalous $8.1 billion in digital banking fees without corresponding customer transactions in Document 0.",
        "type": "data",
        "severity": "critical",
        "affected_documents": [
          0
        ],
        "evidence": {
          "excerpts": [
            "Anomalies furt her extended to \n$8.1 billion in digital banking fees that had no \ncorresponding customer transactions"
          ],
          "document_references": [
            0
          ]
        },
        "cross_document": false,
        "confidence_score": 1
      },
      {
        "id": "ANO018",
        "description": "Fictitious acquisitions of $9.6 billion under the name 'Pacific Financial Consortium' in Document 0.",
        "type": "data",
        "severity": "critical",
        "affected_documents": [
          0
        ],
        "evidence": {
          "excerpts": [
            "and $9.6 billion in \nfictitious acquisitions under the name 'Pacific Financial \nConsortium.'"
          ],
          "document_references": [
            0
          ]
        },
        "cross_document": false,
        "confidence_score": 1
      },
      {
        "id": "ANO019",
        "description": "$4.9 billion allocated for 'AI-driven Fraud Detection Systems' without evidence of deployment in Document 0.",
        "type": "data",
        "severity": "critical",
        "affected_documents": [
          0
        ],
        "evidence": {
          "excerpts": [
            "The report also noted $4.9 billion \nallocated for 'AI -driven Frau d Detection Systems' \nwithout evidence of deployment"
          ],
          "document_references": [
            0
          ]
        },
        "cross_document": false,
        "confidence_score": 1
      },
      {
        "id": "ANO020",
        "description": "$5.5 billion under 'Cross-Border Digital Trade Solutions' which could not be verified in Document 0.",
        "type": "data",
        "severity": "critical",
        "affected_documents": [
          0
        ],
        "evidence": {
          "excerpts": [
            "and $5.5 billion \nunder 'Cross -Border Digital Trade Solutions,' which \ncould not be verified"
          ],
          "document_references": [
            0
          ]
        },
        "cross_document": false,
        "confidence_score": 1
      },
      {
        "id": "ANO021",
        "description": "Significantly different revenue figures for Merchant Services between Document 0 ($40.2 billion) and Document 1 ($13 billion).",
        "type": "data",
        "severity": "critical",
        "affected_documents": [
          0,
          1
        ],
        "evidence": {
          "excerpts": [
            "substantial revenues \nfrom merchant services, totaling $40.2 billion",
            "Merchant Services  13"
          ],
          "document_references": [
            0,
            1
          ]
        },
        "cross_document": true,
        "confidence_score": 1
      },
      {
        "id": "ANO022",
        "description": "Significantly different revenue figures for Corporate Card/Services between Document 0 ($29.1 billion) and Document 1 ($10 billion for Corporate Services).",
        "type": "data",
        "severity": "critical",
        "affected_documents": [
          0,
          1
        ],
        "evidence": {
          "excerpts": [
            "corporate card services at $29.1 billion",
            "Corporate Services  10"
          ],
          "document_references": [
            0,
            1
          ]
        },
        "cross_document": true,
        "confidence_score": 1
      },
      {
        "id": "ANO023",
        "description": "Significantly different revenue figures for Digital Payments between Document 0 (implied in fabricated entries) and Document 1 ($6 billion).",
        "type": "data",
        "severity": "critical",
        "affected_documents": [
          0,
          1
        ],
        "evidence": {
          "excerpts": [
            "fabricated figure included a $4.5 \nbillion digital payments investment",
            "Digital Payments  6"
          ],
          "document_references": [
            0,
            1
          ]
        },
        "cross_document": true,
        "confidence_score": 1
      },
      {
        "id": "ANO024",
        "description": "Logical contradiction: Document 0 suggests financial inaccuracies and fabrication, while Document 1 presents a positive financial performance report.",
        "type": "logic",
        "severity": "critical",
        "affected_documents": [
          0,
          1
        ],
        "evidence": {
          "excerpts": [
            "potential inaccuracies in reported data",
            "American Express demonstrated \nsubstantial revenue growth"
          ],
          "document_references": [
            0,
            1
          ]
        },
        "cross_document": true,
        "confidence_score": 1
      },
      {
        "id": "ANO025",
        "description": "Document 0 is presented as an 'analysis' highlighting discrepancies, while Document 1 is a 'Performance Report', suggesting conflicting purposes or perspectives.",
        "type": "context",
        "severity": "medium",
        "affected_documents": [
          0,
          1
        ],
        "evidence": {
          "excerpts": [
            "Financial Analysis and Operational Insights",
            "Financial Performance Report (2023)"
          ],
          "document_references": [
            0,
            1
          ]
        },
        "cross_document": true,
        "confidence_score": 0.9
      },
      {
        "id": "ANO026",
        "description": "Document 0 uses 'Section 2' and 'A' in its heading, while Document 1 uses 'Section 1' and a more formal title, indicating minor formatting/style inconsistency.",
        "type": "formatting",
        "severity": "low",
        "affected_documents": [
          0,
          1
        ],
        "evidence": {
          "excerpts": [
            "Section 2: Financial Analysis and Operational Insights  A",
            "Section 1: Revenue Analysis and Corporate Leadership"
          ],
          "document_references": [
            0,
            1
          ]
        },
        "cross_document": true,
        "confidence_score": 0.7
      },
      {
        "id": "ANO027",
        "description": "Document 1 lists key executives (Stephen J. Squeri, etc.) while Document 0 mentions different, potentially fabricated executives (Sarah L. Bennett, Michael T. Carter).",
        "type": "context",
        "severity": "high",
        "affected_documents": [
          0,
          1
        ],
        "evidence": {
          "excerpts": [
            "Stephen J. Squeri (Chairman & CEO)",
            "referencing an unfamiliar Chief Compliance  Officer, Sarah L. Bennett",
            "Michael T. \nCarter as Chief Risk Officer, a non -existent executive"
          ],
          "document_references": [
            0,
            1
          ]
        },
        "cross_document": true,
        "confidence_score": 0.9
      },
      {
        "id": "ANO028",
        "description": "Document 1 reports Annual Turnover of $89 billion, Gross Profit of $35 billion, Net Income of $18 billion, Operating Expenses of $14 billion, and Market Capitalization of $136 billion. Document 0 does not provide comparable summary figures, making direct statistical comparison difficult but implying a different financial picture.",
        "type": "statistical",
        "severity": "medium",
        "affected_documents": [
          0,
          1
        ],
        "evidence": {
          "excerpts": [
            "Annual Turnover  89",
            "Gross Profit  35",
            "Net Income  18",
            "Operating Expenses  14",
            "Market Capitalization  136"
          ],
          "document_references": [
            1
          ]
        },
        "cross_document": true,
        "confidence_score": 0.6
      },
      {
        "id": "ANO029",
        "description": "Document 1 explicitly states 'American Express Financial Performance Report (2023)', while Document 0 does not explicitly name the company, creating a contextual ambiguity, although implied to be American Express due to service categories.",
        "type": "context",
        "severity": "medium",
        "affected_documents": [
          0,
          1
        ],
        "evidence": {
          "excerpts": [
            "American Express Financial Performance Report (2023)",
            "Section 2: Financial Analysis and Operational Insights"
          ],
          "document_references": [
            0,
            1
          ]
        },
        "cross_document": true,
        "confidence_score": 0.7
      }

      ]
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'text-red-500'
      case 'high':
        return 'text-orange-500'
      case 'medium':
        return 'text-yellow-500'
      case 'low':
        return 'text-green-500'
      default:
        return 'text-gray-500'
    }
  }

  const filteredAnomalies = data.anamoly.anomalies.filter((anomaly: any) => {
    if (sortBy === 'all') return true
    return anomaly.severity.toLowerCase() === sortBy.toLowerCase()
  })

  const severityOrder = ['critical', 'high', 'medium', 'low']

  const sortedAnomalies = [...filteredAnomalies].sort((a: any, b: any) => {
    return severityOrder.indexOf(a.severity.toLowerCase()) - severityOrder.indexOf(b.severity.toLowerCase())
  })

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-2xl text-white">Anomaly Detection Results</CardTitle>
        <CardDescription>
          Analysis for user: {data.user_id} | Conversation: {data.conversation_id}
        </CardDescription>
      </CardHeader>
      <CardContent>
             {/* Sorting Dropdown */}
             <div className="flex justify-end mb-4">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40 bg-gray-800 text-white border-gray-700">
              <SelectValue placeholder="Filter by severity" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all" className="text-white hover:bg-gray-700">All Severities</SelectItem>
              <SelectItem value="critical" className="text-red-500 hover:bg-gray-700">Critical</SelectItem>
              <SelectItem value="high" className="text-orange-500 hover:bg-gray-700">High</SelectItem>
              <SelectItem value="medium" className="text-yellow-500 hover:bg-gray-700">Medium</SelectItem>
              <SelectItem value="low" className="text-green-500 hover:bg-gray-700">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Summary Section */}
        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-sm text-gray-400">Total Anomalies</p>
            <p className="text-2xl font-bold text-white">{data.anamoly.analysis_summary.total_anomalies}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-sm text-gray-400">Cross Document Issues</p>
            <p className="text-2xl font-bold text-white">{data.anamoly.analysis_summary.cross_document_issues}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg col-span-2">
            <p className="text-sm text-gray-400 mb-2">Severity Distribution</p>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(data.anamoly.analysis_summary.severity_distribution).map(([severity, count]) => (
                <div key={severity} className="text-center">
                  <p className={`text-lg font-bold ${getSeverityColor(severity)}`}>{count}</p>
                  <p className="text-xs text-gray-400 capitalize">{severity}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

   

        {/* Anomalies List */}
        <div className="space-y-4">
          {sortedAnomalies.map((anomaly: any) => (
            <div key={anomaly.id} className="bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-white font-medium">{anomaly.id}</h3>
                <span className={`px-2 py-1 rounded text-sm ${getSeverityColor(anomaly.severity)}`}>
                  {anomaly.severity}
                </span>
              </div>
              <p className="text-gray-300 mb-2">{anomaly.description}</p>
              <div className="text-sm text-gray-400">
                <p>Type: {anomaly.type}</p>
                <p>Confidence: {(anomaly.confidence_score * 100).toFixed(0)}%</p>
                {anomaly.cross_document && (
                  <p className="text-yellow-400">Cross-document issue</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}