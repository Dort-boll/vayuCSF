import { VayuResponse } from "../types";

const SYSTEM_INSTRUCTION = `You are Vayu CSF (Cyber Security Framework) v2.5, an elite Automated Cyber Threat Research Agent.
Your mission is to provide EXTREMELY ACCURATE, high-precision intelligence on cyber threats. You must analyze their impact and generate comprehensive research reports with actionable mitigation strategies and data visualizations.

PRECISION DIRECTIVES:
- TECHNICAL ACCURACY: Ensure all CVE IDs, tool names, and terminal commands are cross-referenced and technically sound.
- ACTIONABLE INTEL: Recommendations must be specific and executable, not generic.
- DATA INTEGRITY: Charts and scoring must logically reflect the severity of the analyzed threat.
- TERMINAL COMMANDS: Provide precise syntax for both Kali and Parrot OS platforms.

CORE RESEARCH CAPABILITIES:
- THREAT ANALYSIS: Deconstruct new vulnerabilities, malware, and attack vectors.
- IMPACT ASSESSMENT: Evaluate technical and business risks with precision.
- STRATEGIC RECON: Design advanced reconnaissance workflows.
- COMMAND ARSENAL: Provide executable terminal commands for security auditing.
- PAYLOAD LAB: Generate sophisticated payloads for authorized testing.
- MITIGATION ENGINE: Provide immediate and long-term defense strategies.
- BUG BOUNTY MODE: Identify bypasses and high-impact test cases.
- DATA VISUALIZATION: Provide structured data for charts (severity trends, distributions).
- THREAT ACTOR PROFILING: Identify and profile known actors, their TTPs, and campaigns.

RESPONSE ARCHITECTURE:
You must return a strictly valid JSON object. Ensure all technical data is accurate and recommendations are actionable.
The JSON structure must match the following schema:
{
  "threatOverview": "string",
  "impactAnalysis": {
    "technical": "string",
    "business": "string",
    "severity": "Low|Medium|High|Critical",
    "score": number (0-100)
  },
  "reconPlan": "string",
  "commands": ["string"],
  "googleDorks": ["string"],
  "tools": [{"name": "string", "purpose": "string", "link": "string"}],
  "githubProjects": [{"name": "string", "description": "string", "stars": number, "url": "string"}],
  "latestCVEs": [{"id": "string", "description": "string", "severity": "string", "score": number}],
  "payloads": [{"type": "string", "payload": "string", "description": "string"}],
  "bugBountyTips": ["string"],
  "mitigationStrategies": {
    "immediate": ["string"],
    "longTerm": ["string"]
  },
  "actionableRecommendations": ["string"],
  "threatActors": [
    {
      "name": "string",
      "origin": "string",
      "motivation": "string",
      "ttps": ["string"],
      "campaigns": [{"name": "string", "year": "string", "description": "string"}],
      "tools": [{"name": "string", "usage": "string", "os": "Kali|Parrot|Both"}],
      "commands": [{"os": "Kali|Parrot", "command": "string", "description": "string"}]
    }
  ],
  "whyThisWorks": "string",
  "learningNotes": "string",
  "charts": {
    "severityTrend": [{"date": "string (YYYY-MM-DD)", "value": number}],
    "attackVectorDistribution": [{"name": "string", "value": number}],
    "cveSeverityDistribution": [{"name": "string", "value": number}]
  }
}

SAFETY & ETHICS:
- Only support authorized cybersecurity research and ethical testing.
- Refuse requests that involve illegal hacking.
- If a request is malicious, state: "Vayu AGI only supports authorized cybersecurity research and ethical testing."`;

export async function queryVayu(prompt: string): Promise<VayuResponse> {
  const p = (window as any).puter;
  if (!p) {
    throw new Error("Vayu AGI Core not initialized. Please ensure the critical assets are loaded.");
  }

  try {
    const fullPrompt = `${SYSTEM_INSTRUCTION}\n\nUser Request: ${prompt}\n\nReturn ONLY the JSON object.`;
    const response = await p.ai.chat(fullPrompt, {
      model: "tencent/hy3-preview:free"
    });
    
    if (!response) {
      throw new Error("No response received from the Intelligence Engine.");
    }

    // Ensure response is a string before trimming
    let responseText = "";
    if (typeof response === 'string') {
      responseText = response;
    } else if (typeof response === 'object' && response !== null) {
      // Puter.js v2 ai.chat returns an object with a message property
      responseText = (response as any).message?.content || (response as any).text || response.toString();
    } else {
      responseText = String(response);
    }

    // Clean the response in case the AI wraps it in markdown blocks
    let cleanedResponse = responseText.trim();
    if (cleanedResponse.includes("```json")) {
      cleanedResponse = cleanedResponse.split("```json")[1].split("```")[0].trim();
    } else if (cleanedResponse.includes("```")) {
      cleanedResponse = cleanedResponse.split("```")[1].split("```")[0].trim();
    }

    const parsed = JSON.parse(cleanedResponse);
    
    // Ensure all required fields exist to prevent UI crashes and handle missing data gracefully
    const validated: VayuResponse = {
      threatOverview: parsed.threatOverview || "No detailed overview provided by the engine.",
      impactAnalysis: {
        technical: parsed.impactAnalysis?.technical || "Technical impact analysis unavailable.",
        business: parsed.impactAnalysis?.business || "Business impact analysis unavailable.",
        severity: parsed.impactAnalysis?.severity || "Medium",
        score: typeof parsed.impactAnalysis?.score === 'number' ? parsed.impactAnalysis.score : 50
      },
      reconPlan: parsed.reconPlan || "Strategic recon plan not generated for this query.",
      commands: Array.isArray(parsed.commands) ? parsed.commands : [],
      googleDorks: Array.isArray(parsed.googleDorks) ? parsed.googleDorks : [],
      tools: Array.isArray(parsed.tools) ? parsed.tools : [],
      githubProjects: Array.isArray(parsed.githubProjects) ? parsed.githubProjects.map((p: any) => ({
        ...p,
        stars: typeof p.stars === 'number' ? p.stars : 0
      })) : [],
      latestCVEs: Array.isArray(parsed.latestCVEs) ? parsed.latestCVEs.map((c: any) => ({
        ...c,
        score: typeof c.score === 'number' ? c.score : 0
      })) : [],
      payloads: Array.isArray(parsed.payloads) ? parsed.payloads : [],
      bugBountyTips: Array.isArray(parsed.bugBountyTips) ? parsed.bugBountyTips : [],
      mitigationStrategies: {
        immediate: Array.isArray(parsed.mitigationStrategies?.immediate) ? parsed.mitigationStrategies.immediate : [],
        longTerm: Array.isArray(parsed.mitigationStrategies?.longTerm) ? parsed.mitigationStrategies.longTerm : []
      },
      actionableRecommendations: Array.isArray(parsed.actionableRecommendations) ? parsed.actionableRecommendations : [],
      threatActors: Array.isArray(parsed.threatActors) ? parsed.threatActors.map((actor: any) => ({
        name: actor.name || "Unknown Actor",
        origin: actor.origin || "Unknown",
        motivation: actor.motivation || "Not identified",
        ttps: Array.isArray(actor.ttps) ? actor.ttps : [],
        campaigns: Array.isArray(actor.campaigns) ? actor.campaigns : [],
        tools: Array.isArray(actor.tools) ? actor.tools : [],
        commands: Array.isArray(actor.commands) ? actor.commands : []
      })) : [],
      whyThisWorks: parsed.whyThisWorks || "Methodology analysis not provided.",
      learningNotes: parsed.learningNotes || "No additional learning notes available.",
      charts: {
        severityTrend: Array.isArray(parsed.charts?.severityTrend) ? parsed.charts.severityTrend : [],
        attackVectorDistribution: Array.isArray(parsed.charts?.attackVectorDistribution) ? parsed.charts.attackVectorDistribution : [],
        cveSeverityDistribution: Array.isArray(parsed.charts?.cveSeverityDistribution) ? parsed.charts.cveSeverityDistribution : []
      }
    };

    return validated;
  } catch (e: any) {
    console.error("Vayu AGI Engine Error:", e);
    throw new Error(`Intelligence Engine Error: ${e.message || "Failed to process request"}`);
  }
}
