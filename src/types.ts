export enum Type {
  TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED",
  STRING = "STRING",
  NUMBER = "NUMBER",
  INTEGER = "INTEGER",
  BOOLEAN = "BOOLEAN",
  ARRAY = "ARRAY",
  OBJECT = "OBJECT",
  NULL = "NULL",
}

export interface VayuResponse {
  threatOverview: string;
  impactAnalysis: {
    technical: string;
    business: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    score: number; // 0-100
  };
  reconPlan: string;
  commands: string[];
  googleDorks: string[];
  tools: { name: string; purpose: string; link?: string }[];
  githubProjects: { name: string; description: string; stars?: number; url: string }[];
  latestCVEs: { id: string; description: string; severity: string; score?: number }[];
  payloads: { type: string; payload: string; description: string }[];
  bugBountyTips: string[];
  mitigationStrategies: {
    immediate: string[];
    longTerm: string[];
  };
  actionableRecommendations: string[];
  whyThisWorks: string;
  learningNotes: string;
  threatActors?: {
    name: string;
    origin?: string;
    motivation: string;
    ttps: string[];
    campaigns: { name: string; year: string; description: string }[];
    tools: { name: string; usage: string; os: 'Kali' | 'Parrot' | 'Both' }[];
    commands: { os: 'Kali' | 'Parrot'; command: string; description: string }[];
  }[];
  charts?: {
    severityTrend?: { date: string; value: number }[];
    attackVectorDistribution?: { name: string; value: number }[];
    cveSeverityDistribution?: { name: string; value: number }[];
  };
}
