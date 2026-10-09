export type AgentType = 'moderator' | 'analyst' | 'fact_checker' | 'secretary';

export interface VoiceProfile {
  pitchBand: string;
  cadence: string;
  acousticConfidence: number; // 0 - 100
  snrDb: number;
  speakerFingerprintId: string;
  enrolledAt: string;
  sampleAudioDurationSec: number;
}

export interface Participant {
  id: string;
  name: string;
  role: string;
  isConfirmed: boolean;
  isChairman?: boolean;
  avatarColor: string;
  seatAngle: number; // 0 - 360 degrees on the round conference table
  voiceProfile?: VoiceProfile;
  isSpeaking?: boolean;
  speechCount: number;
  introSampleText?: string;
}

export interface TranscriptItem {
  id: string;
  timestamp: string;
  speakerId: string;
  speakerName: string;
  speakerRole: string;
  text: string;
  confidence: number;
  isAI?: boolean;
  agentType?: AgentType;
  sentiment?: 'positive' | 'neutral' | 'caution' | 'critical';
  isCorrected?: boolean;
  isVerified?: boolean;
  originalSpeakerName?: string;
  tags?: string[];
  audioWave?: number[];
}

export interface AIAgent {
  id: string;
  type: AgentType;
  name: string;
  roleTitle: string;
  avatar: string;
  status: 'idle' | 'listening' | 'analyzing' | 'speaking' | 'raising_hand';
  description: string;
  voiceName: string;
  lastThought?: string;
  iconName: string;
  color: string;
}

export interface InterventionRequest {
  id: string;
  agentType: AgentType;
  agentName: string;
  title: string;
  content: string;
  reason: string;
  priority: 'critical' | 'moderate' | 'observation';
  timestamp: string;
  status: 'pending' | 'approved' | 'dismissed' | 'deferred';
  oneVaultRef?: string;
  evidenceSnippet?: string;
  documentId?: string;
  highlightedClause?: string;
}

export interface MeetingAgenda {
  id: string;
  title: string;
  durationMinutes: number;
  status: 'pending' | 'in_progress' | 'completed';
  notes?: string;
}

export interface OneVaultDocument {
  id: string;
  title: string;
  category: 'Contract' | 'Architecture' | 'Policy' | 'Roadmap' | 'Financial';
  lastUpdated: string;
  snippet: string;
  content: string;
  tags: string[];
}

export interface ActionItem {
  id: string;
  task: string;
  owner: string;
  deadline: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'pending' | 'in_progress' | 'done';
  dependencies?: string[];
  dependencyWarning?: string;
  estimatedHours?: number;
}

export interface AirtimeMetric {
  participantId: string;
  name: string;
  percentage: number;
  seconds: number;
  isUnderrepresented?: boolean;
}

export interface MeetingHealth {
  consensusScore: number; // 0 - 100%
  consensusLabel: string;
  airtimeDistribution: AirtimeMetric[];
  inclusivityWarning?: string;
  pastMeetingAlignmentScore: number; // 0 - 100%
}

export interface ApprovedResolution {
  id: string;
  topic: string;
  resolution: string;
  consensus: string;
  stakeholders: string[];
  timestamp?: string;
}

export interface UnresolvedItem {
  id: string;
  issue: string;
  nextStep: string;
}

export interface MeetingIntelligence {
  executiveSummary: string;
  approvedResolutions: ApprovedResolution[];
  actionItems: ActionItem[];
  unresolvedItems: UnresolvedItem[];
  keyTakeaways: string[];
}

export interface Audio360Metrics {
  isListening: boolean;
  activeMicAngle: number; // 0 - 360
  ambientNoiseDb: number;
  echoCancelled: boolean;
  vadDetected: boolean;
  beamformingStrength: number; // 0 - 100%
  audioLevel: number; // 0 - 100
}

export interface AudioChunk {
  id: string;
  partNumber: number;
  startTimeSec: number;
  endTimeSec: number;
  timeRangeStr: string;
  status: 'recording' | 'completed' | 'transcribing' | 'verified';
  durationSec: number;
  fileSizeMb: number;
  format: 'audio/wav' | 'audio/webm';
  speakersDetected: string[];
  utteranceCount: number;
  diarizationConfidence: number;
  audioBlobUrl?: string;
  transcriptionSummary?: string;
}

export interface AudioChunkConfig {
  chunkDurationMinutes: number; // e.g. 30 (default), 15, 45, 60
  autoRotate: boolean;
  format: 'audio/wav' | 'audio/webm';
}

