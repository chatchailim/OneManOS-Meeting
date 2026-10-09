import React, { useState, useEffect, useRef } from 'react';
import {
  Participant,
  AIAgent,
  AgentType,
  TranscriptItem,
  MeetingAgenda,
  OneVaultDocument,
  MeetingIntelligence,
  InterventionRequest,
  Audio360Metrics,
  AudioChunk,
  AudioChunkConfig,
} from './types/meeting';
import {
  INITIAL_PARTICIPANTS,
  INITIAL_AGENTS,
  INITIAL_AGENDAS,
  INITIAL_ONEVAULT_DOCS,
  INITIAL_TRANSCRIPT,
  INITIAL_INTELLIGENCE,
} from './data/mockData';
import { MeetingHeader } from './components/MeetingHeader';
import { PreMeetingEnrollment } from './components/PreMeetingEnrollment';
import { RoomVisualizer360 } from './components/RoomVisualizer360';
import { LiveTranscriptFeed } from './components/LiveTranscriptFeed';
import { MultiAgentHub } from './components/MultiAgentHub';
import { OneVaultDrawer } from './components/OneVaultDrawer';
import { MeetingIntelligenceSummary } from './components/MeetingIntelligenceSummary';
import { SimulationControls } from './components/SimulationControls';
import { AudioChunkManager } from './components/AudioChunkManager';
import { DataImportExportModal } from './components/DataImportExportModal';
import { HelpManualModal } from './components/HelpManualModal';
import { EvidenceCitationModal } from './components/EvidenceCitationModal';
import { audioService } from './services/audioService';
import {
  askAgent,
  checkFactOneVault,
  generateMeetingMinutes,
} from './services/geminiService';

const INITIAL_CHUNKS: AudioChunk[] = [
  {
    id: 'CHUNK-01',
    partNumber: 1,
    startTimeSec: 0,
    endTimeSec: 1800,
    timeRangeStr: '00:00 - 30:00',
    status: 'verified',
    durationSec: 1800,
    fileSizeMb: 28.8,
    format: 'audio/wav',
    speakersDetected: ['ภูวกฤต', 'กำธร', 'นวพร'],
    utteranceCount: 34,
    diarizationConfidence: 97.4,
    transcriptionSummary: 'เปิดประชุม สรุปความคืบหน้า Sprint 24 และทบทวนงบประมาณคลาวด์',
  },
];

export default function App() {
  // Main Application States
  const [meetingState, setMeetingState] = useState<'pre_meeting' | 'in_progress' | 'adjourned'>(
    'pre_meeting'
  );
  const [activeTab, setActiveTab] = useState<
    'room' | 'enrollment' | 'chunks' | 'intelligence' | 'onevault'
  >('enrollment');

  const [participants, setParticipants] = useState<Participant[]>(INITIAL_PARTICIPANTS);
  const [agents, setAgents] = useState<AIAgent[]>(INITIAL_AGENTS);
  const [transcript, setTranscript] = useState<TranscriptItem[]>(INITIAL_TRANSCRIPT);
  const [agendas, setAgendas] = useState<MeetingAgenda[]>(INITIAL_AGENDAS);
  const [oneVaultDocs, setOneVaultDocs] = useState<OneVaultDocument[]>(INITIAL_ONEVAULT_DOCS);
  const [intelligence, setIntelligence] = useState<MeetingIntelligence>(INITIAL_INTELLIGENCE);

  // Audio Chunk Management (30 min default chunks)
  const [audioChunks, setAudioChunks] = useState<AudioChunk[]>(INITIAL_CHUNKS);
  const [chunkConfig, setChunkConfig] = useState<AudioChunkConfig>({
    chunkDurationMinutes: 30, // 30 minutes default limit for Gemini 3.5 diarization
    autoRotate: true,
    format: 'audio/wav',
  });
  const [currentChunkSeconds, setCurrentChunkSeconds] = useState<number>(14 * 60 + 20);

  // Data Hub Modal
  const [isDataModalOpen, setIsDataModalOpen] = useState<boolean>(false);
  // Help & Documentation Modal
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);
  // Evidence & Citation Inspector Modal
  const [activeCitation, setActiveCitation] = useState<{
    doc: OneVaultDocument;
    statement?: string;
    analysis?: string;
  } | null>(null);
  const [systemNotification, setSystemNotification] = useState<string | null>(null);

  // Real-time Gemini TTS status
  const [ttsLiveStatus, setTtsLiveStatus] = useState<{
    active: boolean;
    engine: string;
    voice: string;
  } | null>(null);

  const [pendingInterventions, setPendingInterventions] = useState<InterventionRequest[]>([]);
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null);

  const [isTtsEnabled, setIsTtsEnabled] = useState<boolean>(true);
  const [isMicActive, setIsMicActive] = useState<boolean>(false);
  const [isProcessingAI, setIsProcessingAI] = useState<boolean>(false);
  const [isRegeneratingMinutes, setIsRegeneratingMinutes] = useState<boolean>(false);

  const [meetingSeconds, setMeetingSeconds] = useState<number>(14 * 60 + 20); // 14 mins simulated start
  const [audioMetrics, setAudioMetrics] = useState<Audio360Metrics>({
    isListening: true,
    activeMicAngle: 45,
    ambientNoiseDb: 32,
    echoCancelled: true,
    vadDetected: false,
    beamformingStrength: 92,
    audioLevel: 10,
  });

  const micLoopRef = useRef<number | null>(null);

  // Timer loop when meeting is in progress
  useEffect(() => {
    let timer: any = null;
    if (meetingState === 'in_progress') {
      timer = setInterval(() => {
        setMeetingSeconds((prev) => prev + 1);
        setCurrentChunkSeconds((prev) => {
          const nextSec = prev + 1;
          const chunkLimitSec = chunkConfig.chunkDurationMinutes * 60;
          // Check for auto-rotation at 30 min (or configured duration)
          if (nextSec >= chunkLimitSec && chunkConfig.autoRotate) {
            rotateChunk(nextSec);
            return 0;
          }
          return nextSec;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [meetingState, chunkConfig]);

  // Audio spectrum & VAD polling loop
  useEffect(() => {
    const updateMetrics = () => {
      if (isMicActive) {
        const { volumeLevel, hasVoiceActivity } = audioService.getAudioMetrics();
        setAudioMetrics((prev) => ({
          ...prev,
          vadDetected: hasVoiceActivity,
          audioLevel: volumeLevel,
          ambientNoiseDb: Math.round(30 + volumeLevel * 0.4),
        }));
      }
      micLoopRef.current = requestAnimationFrame(updateMetrics);
    };

    micLoopRef.current = requestAnimationFrame(updateMetrics);
    return () => {
      if (micLoopRef.current) cancelAnimationFrame(micLoopRef.current);
    };
  }, [isMicActive]);

  const formatTimer = (totalSec: number) => {
    const m = Math.floor(totalSec / 60)
      .toString()
      .padStart(2, '0');
    const s = (totalSec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Audio Chunk Rotation: Finalizes current chunk and starts next chunk
  const rotateChunk = (elapsedSecInChunk?: number) => {
    const partNum = audioChunks.length + 1;
    const duration = elapsedSecInChunk !== undefined ? elapsedSecInChunk : currentChunkSeconds;
    const startSec = audioChunks.length * chunkConfig.chunkDurationMinutes * 60;
    const endSec = startSec + duration;

    const formatRangeStr = (s: number, e: number) => {
      const ms = Math.floor(s / 60)
        .toString()
        .padStart(2, '0');
      const me = Math.floor(e / 60)
        .toString()
        .padStart(2, '0');
      return `${ms}:00 - ${me}:00`;
    };

    const detected = participants
      .filter((p) => p.speechCount > 0)
      .map((p) => p.name);

    const newChunk: AudioChunk = {
      id: `CHUNK-0${partNum}`,
      partNumber: partNum,
      startTimeSec: startSec,
      endTimeSec: endSec,
      timeRangeStr: formatRangeStr(startSec, endSec),
      status: 'verified',
      durationSec: duration,
      fileSizeMb: +(duration * 0.016).toFixed(1),
      format: chunkConfig.format,
      speakersDetected: detected.length > 0 ? detected : ['ภูวกฤต', 'กำธร'],
      utteranceCount: Math.max(8, transcript.length),
      diarizationConfidence: +(96.5 + Math.random() * 2.8).toFixed(1),
      transcriptionSummary: `ช่วงที่ ${partNum}: บันทึกบทสนทนาและมติในวาระการประชุม`,
    };

    setAudioChunks((prev) => [...prev, newChunk]);
    setCurrentChunkSeconds(0);
    audioService.playTone('enroll_success');
  };

  const handleForceRotateChunk = () => {
    rotateChunk();
  };

  const handleReTranscribeChunk = (chunkId: string) => {
    setAudioChunks((prev) =>
      prev.map((c) =>
        c.id === chunkId
          ? {
              ...c,
              status: 'verified',
              diarizationConfidence: +(98.5 + Math.random() * 1.2).toFixed(1),
            }
          : c
      )
    );
    audioService.playTone('enroll_success');
  };

  // Toggle Physical Microphone
  const toggleMicrophone = async () => {
    if (isMicActive) {
      audioService.stopMicrophone();
      audioService.stopSpeechRecognition();
      setIsMicActive(false);
    } else {
      const ok = await audioService.startMicrophone();
      if (ok) {
        setIsMicActive(true);
        audioService.playTone('mic_ping');

        // Start Speech recognition
        audioService.startSpeechRecognition((recognizedText, isFinal) => {
          if (isFinal && recognizedText.trim()) {
            handleNewUtterance(recognizedText.trim(), participants[0]?.id || 'spk-01');
          }
        });
      }
    }
  };

  // Start Meeting from Pre-Meeting
  const handleStartMeeting = async () => {
    setMeetingState('in_progress');
    setActiveTab('room');
    audioService.playTone('meeting_start');

    // Welcome utterance from AI Moderator
    const confirmedNames = participants
      .filter((p) => p.isConfirmed)
      .map((p) => p.name)
      .join(', ');

    const introSpeech = `ยินดีต้อนรับทุกท่านครับ สมาชิกที่ยืนยันตัวตนแล้วได้แก่ ${
      confirmedNames || 'ทุกท่าน'
    } ขณะนี้เข้าสู่โหมดรับฟังและบันทึกบทสนทนาแบบ 360 องศาแล้วครับ`;

    const introItem: TranscriptItem = {
      id: `tr-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('th-TH', { hour12: false }),
      speakerId: 'agent-mod',
      speakerName: 'AI Moderator',
      speakerRole: 'Floor Control',
      text: introSpeech,
      confidence: 99.8,
      isAI: true,
      agentType: 'moderator',
    };

    setTranscript((prev) => [...prev, introItem]);

    if (isTtsEnabled) {
      await audioService.playAgentSpeech(introSpeech, 'Puck', (st) =>
        setTtsLiveStatus(st.active ? st : null)
      );
    }
  };

  const handleEndMeeting = () => {
    setMeetingState('adjourned');
    setActiveTab('intelligence');
    audioService.playTone('meeting_start');
    handleRegenerateMinutes();
  };

  const handleResetMeeting = () => {
    setMeetingState('pre_meeting');
    setActiveTab('enrollment');
    setTranscript(INITIAL_TRANSCRIPT);
    setPendingInterventions([]);
    setParticipants(INITIAL_PARTICIPANTS);
    setAudioChunks(INITIAL_CHUNKS);
    setCurrentChunkSeconds(0);
  };

  // Process a new speech turn from human or simulator
  const handleNewUtterance = async (
    text: string,
    speakerId: string,
    confidenceOverride?: number
  ) => {
    const speaker = participants.find((p) => p.id === speakerId) || {
      name: 'ผู้ร่วมประชุม',
      role: 'Participant',
      seatAngle: 0,
    };

    // Set active visualizer beam
    setActiveSpeakerId(speakerId);
    setAudioMetrics((prev) => ({
      ...prev,
      activeMicAngle: speaker.seatAngle || 0,
      vadDetected: true,
    }));

    // Update speech count
    setParticipants((prev) =>
      prev.map((p) => (p.id === speakerId ? { ...p, speechCount: p.speechCount + 1 } : p))
    );

    const nowStr = new Date().toLocaleTimeString('th-TH', { hour12: false });
    const newTranscriptItem: TranscriptItem = {
      id: `tr-${Date.now()}`,
      timestamp: nowStr,
      speakerId,
      speakerName: speaker.name,
      speakerRole: speaker.role,
      text,
      confidence:
        confidenceOverride !== undefined
          ? confidenceOverride
          : +(95 + Math.random() * 4.5).toFixed(1),
    };

    setTranscript((prev) => [...prev, newTranscriptItem]);

    // Turn off active speaker halo after 3 seconds
    setTimeout(() => {
      setActiveSpeakerId(null);
      setAudioMetrics((prev) => ({ ...prev, vadDetected: false }));
    }, 2800);

    // AI Agents Background Analysis: Check against OneVault
    evaluateBackgroundIntervention(text, speaker.name);
  };

  // Fact-Check and Analyst evaluation
  const evaluateBackgroundIntervention = async (statement: string, speakerName: string) => {
    const checkResult = await checkFactOneVault({
      statement,
      speakerName,
      oneVaultDocs: oneVaultDocs,
    });

    if (checkResult.shouldRaiseHand) {
      // AI Fact-Check Agent raises hand
      audioService.playTone('raise_hand');

      const intervention: InterventionRequest = {
        id: `int-${Date.now()}`,
        agentType: 'fact_checker',
        agentName: 'AI Fact-Check',
        title: 'ตรวจพบความขัดแย้งกับสัญญา OneVault SOW-2026',
        content: checkResult.suggestedIntervention,
        reason: checkResult.analysis,
        priority: 'critical',
        timestamp: new Date().toLocaleTimeString('th-TH', { hour12: false }),
        status: 'pending',
        oneVaultRef: checkResult.referenceDoc,
      };

      setPendingInterventions((prev) => [intervention, ...prev]);

      // Update agent visual status
      setAgents((prev) =>
        prev.map((a) =>
          a.type === 'fact_checker'
            ? { ...a, status: 'raising_hand', lastThought: checkResult.analysis }
            : a
        )
      );
    }
  };

  // Chairman floor control actions
  const handleApproveIntervention = async (intervention: InterventionRequest) => {
    // Dismiss from queue
    setPendingInterventions((prev) => prev.filter((i) => i.id !== intervention.id));

    // Reset agent status
    setAgents((prev) =>
      prev.map((a) => (a.type === intervention.agentType ? { ...a, status: 'speaking' } : a))
    );
    setActiveSpeakerId(intervention.agentType);

    // Append AI utterance
    const nowStr = new Date().toLocaleTimeString('th-TH', { hour12: false });
    const aiItem: TranscriptItem = {
      id: `tr-${Date.now()}`,
      timestamp: nowStr,
      speakerId: intervention.agentType,
      speakerName: intervention.agentName,
      speakerRole: 'OneVault Knowledge Audit',
      text: intervention.content,
      confidence: 99.5,
      isAI: true,
      agentType: intervention.agentType,
      tags: ['Intervention', intervention.oneVaultRef || 'OneVault'],
    };

    setTranscript((prev) => [...prev, aiItem]);

    // Speak out loud with Gemini TTS
    if (isTtsEnabled) {
      const voice =
        intervention.agentType === 'fact_checker'
          ? 'Fenrir'
          : intervention.agentType === 'analyst'
          ? 'Charon'
          : 'Puck';

      await audioService.playAgentSpeech(intervention.content, voice, (st) =>
        setTtsLiveStatus(st.active ? st : null)
      );
    }

    setAgents((prev) =>
      prev.map((a) => (a.type === intervention.agentType ? { ...a, status: 'listening' } : a))
    );
    setActiveSpeakerId(null);
  };

  const handleDismissIntervention = (interventionId: string) => {
    setPendingInterventions((prev) => prev.filter((i) => i.id !== interventionId));
    setAgents((prev) =>
      prev.map((a) => (a.status === 'raising_hand' ? { ...a, status: 'listening' } : a))
    );
  };

  const handleDeferIntervention = (interventionId: string) => {
    setPendingInterventions((prev) =>
      prev.map((i) => (i.id === interventionId ? { ...i, status: 'deferred' } : i))
    );
  };

  // Direct Address to an AI Agent ("Nextwaver, ช่วยวิเคราะห์...")
  const handleDirectPromptAgent = async (agentType: AgentType, promptText: string) => {
    setIsProcessingAI(true);
    const targetAgent = agents.find((a) => a.type === agentType) || agents[0];

    // Set speaking state
    setAgents((prev) =>
      prev.map((a) => (a.type === agentType ? { ...a, status: 'analyzing' } : a))
    );

    const currentTopic = agendas.find((a) => a.status === 'in_progress')?.title || 'ภาพรวมการประชุม';

    const reply = await askAgent({
      agentType,
      transcriptHistory: transcript.map((t) => ({ speakerName: t.speakerName, text: t.text })),
      currentTopic,
      participants: participants.map((p) => ({ name: p.name, role: p.role })),
      prompt: promptText,
      oneVaultContext: oneVaultDocs.map((d) => `${d.title}: ${d.snippet}`).join('\n'),
    });

    const nowStr = new Date().toLocaleTimeString('th-TH', { hour12: false });
    const aiUtterance: TranscriptItem = {
      id: `tr-${Date.now()}`,
      timestamp: nowStr,
      speakerId: targetAgent.id,
      speakerName: targetAgent.name,
      speakerRole: targetAgent.roleTitle,
      text: reply,
      confidence: 99.2,
      isAI: true,
      agentType,
    };

    setTranscript((prev) => [...prev, aiUtterance]);
    setActiveSpeakerId(targetAgent.id);
    setIsProcessingAI(false);

    setAgents((prev) =>
      prev.map((a) =>
        a.type === agentType ? { ...a, status: 'speaking', lastThought: reply.slice(0, 80) } : a
      )
    );

    if (isTtsEnabled) {
      await audioService.playAgentSpeech(reply, targetAgent.voiceName, (st) =>
        setTtsLiveStatus(st.active ? st : null)
      );
    }

    setAgents((prev) =>
      prev.map((a) => (a.type === agentType ? { ...a, status: 'listening' } : a))
    );
    setActiveSpeakerId(null);
  };

  // Diarization correction & manual verification
  const handleCorrectSpeaker = (transcriptId: string, newSpeakerId: string) => {
    const speaker =
      participants.find((p) => p.id === newSpeakerId) ||
      agents.find((a) => a.id === newSpeakerId);
    if (!speaker) return;

    setTranscript((prev) =>
      prev.map((t) =>
        t.id === transcriptId
          ? {
              ...t,
              originalSpeakerName: t.speakerName,
              speakerId: newSpeakerId,
              speakerName: speaker.name,
              speakerRole: (speaker as any).role || (speaker as any).roleTitle,
              confidence: 99.5,
              isCorrected: true,
              isVerified: true,
            }
          : t
      )
    );
  };

  const handleVerifySpeaker = (transcriptId: string) => {
    setTranscript((prev) =>
      prev.map((t) =>
        t.id === transcriptId
          ? {
              ...t,
              confidence: 99.2,
              isVerified: true,
            }
          : t
      )
    );
    audioService.playTone('enroll_success');
  };

  // Advance agenda item
  const handleAdvanceAgenda = (agendaId: string) => {
    setAgendas((prev) => {
      const idx = prev.findIndex((a) => a.id === agendaId);
      return prev.map((item, i) => {
        if (i === idx) return { ...item, status: 'completed' };
        if (i === idx + 1) return { ...item, status: 'in_progress' };
        return item;
      });
    });
  };

  // Add Document to OneVault
  const handleAddOneVaultDoc = (doc: OneVaultDocument) => {
    setOneVaultDocs((prev) => [doc, ...prev]);
  };

  // Open Citation Inspector
  const handleOpenCitation = (oneVaultRef: string, statement?: string, analysis?: string) => {
    const cleanRef = oneVaultRef.replace(/[\[\]]/g, '').trim().toLowerCase();
    const doc =
      oneVaultDocs.find(
        (d) =>
          d.id.toLowerCase() === cleanRef ||
          cleanRef.includes(d.id.toLowerCase()) ||
          d.title.toLowerCase().includes(cleanRef)
      ) || oneVaultDocs[0];

    setActiveCitation({
      doc,
      statement,
      analysis,
    });
  };

  // One-Click Sync Approved Resolutions to OneVault
  const handleSyncResolutionsToOneVault = () => {
    const today = new Date().toISOString().slice(0, 10);
    const newDocId = `DOC-RES-${today.replace(/-/g, '')}-S24`;
    const docTitle = `มติรับรองอย่างเป็นทางการ: Sprint 24 & Milestone 2 Strategic Review`;

    const docContent = `# บันทึกมติการประชุมและข้อตกลงทีม (Official Signed Resolutions)
วันที่มีผลบังคับใช้: ${today}
การรับรอง: โดยที่ประชุมคณะกรรมการและสมาชิก Nextwaver ทุกท่าน

## 1. บทสรุปผู้บริหาร
${intelligence.executiveSummary}

## 2. มติที่ได้รับความเห็นชอบอย่างเป็นเอกฉันท์
${intelligence.approvedResolutions
  .map(
    (res, i) =>
      `### ${i + 1}. [${res.consensus}] ${res.topic}\n- **สาระสำคัญ:** ${res.resolution}\n- **ผู้เกี่ยวข้อง:** ${res.stakeholders.join(', ')}`
  )
  .join('\n\n')}

## 3. รายการงานที่ได้รับมอบหมาย (Action Items Commitments)
${intelligence.actionItems
  .map(
    (item, i) =>
      `${i + 1}. [${item.priority}] **${item.task}** (ผู้รับผิดชอบ: ${item.owner}, กำหนดส่ง: ${item.deadline})`
  )
  .join('\n')}

---
*บันทึกอัตโนมัติเข้าสู่คลังสัญญา OneVault ผ่าน Nextwaver AI Secretary Engine*
`;

    const newDoc: OneVaultDocument = {
      id: newDocId,
      title: docTitle,
      category: 'Policy',
      lastUpdated: today,
      snippet: intelligence.approvedResolutions.map((r) => `${r.topic}: ${r.resolution}`).join(' | '),
      content: docContent,
      tags: ['Approved Resolutions', 'Sprint 24', 'Verified', 'OneVault Policy'],
    };

    setOneVaultDocs((prev) => [newDoc, ...prev]);
    audioService.playTone('enroll_success');
    setSystemNotification(`ซิงค์มติการประชุมเข้า OneVault เรียบร้อยแล้ว (รหัสเอกสาร ${newDocId})`);
    setTimeout(() => setSystemNotification(null), 4000);
  };

  // Regenerate Minutes with Gemini
  const handleRegenerateMinutes = async () => {
    setIsRegeneratingMinutes(true);
    try {
      const updated = await generateMeetingMinutes({
        meetingTitle: 'Nextwaver Executive Meeting Sprint 24 & Milestone 2',
        transcript: transcript.map((t) => ({
          speakerName: t.speakerName,
          speakerRole: t.speakerRole,
          text: t.text,
          timestamp: t.timestamp,
        })),
        participants: participants.map((p) => ({ name: p.name, role: p.role })),
        agenda: agendas.map((a) => ({ title: a.title })),
      });
      setIntelligence(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRegeneratingMinutes(false);
    }
  };

  // Import transcript from Data Hub
  const handleImportTranscript = async (
    importedItems: TranscriptItem[],
    autoAnalyzeWithAI: boolean
  ) => {
    setTranscript(importedItems);
    setActiveTab('room');

    if (autoAnalyzeWithAI) {
      setIsRegeneratingMinutes(true);
      try {
        const updated = await generateMeetingMinutes({
          meetingTitle: 'Nextwaver Imported Meeting Review',
          transcript: importedItems.map((t) => ({
            speakerName: t.speakerName,
            speakerRole: t.speakerRole,
            text: t.text,
            timestamp: t.timestamp,
          })),
          participants: participants.map((p) => ({ name: p.name, role: p.role })),
          agenda: agendas.map((a) => ({ title: a.title })),
        });
        setIntelligence(updated);

        if (isTtsEnabled) {
          await audioService.playAgentSpeech(
            'ระบบนำเข้าข้อมูลบทสนทนาและจัดทำบทสรุปมติที่ประชุมใหม่เรียบร้อยแล้วค่ะ',
            'Kore',
            (st) => setTtsLiveStatus(st.active ? st : null)
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsRegeneratingMinutes(false);
      }
    }
  };

  // Interactive Scenario triggers
  const handleTriggerScenario = (type: 'deadline_conflict' | 'cloud_budget' | 'security_qa') => {
    if (type === 'deadline_conflict') {
      handleNewUtterance(
        'ทางทีมสถาปัตยกรรมเห็นว่าฟีเจอร์ Milestone 2 มีความซับซ้อน จึงอยากเสนอให้เลื่อนกำหนดส่งมอบออกไปเป็นสัปดาห์ที่ 46 ครับ',
        'spk-02' // กำธร
      );
    } else if (type === 'cloud_budget') {
      handleNewUtterance(
        'หากต้องการให้ระบบมี SLA 99.99% เราควรปรับระบบคลาวด์เป็น Multi-Region Active-Active ซึ่งอาจมีค่าใช้จ่ายประมาณ 18,000 USD ต่อเดือนครับ',
        'spk-02' // กำธร
      );
      setTimeout(() => {
        handleDirectPromptAgent(
          'analyst',
          'วิเคราะห์ข้อเสนอ Multi-Region และงบประมาณ $18,000 เทียบกับเพดานใน OneVault'
        );
      }, 1500);
    } else if (type === 'security_qa') {
      handleNewUtterance(
        'ทีม QA ได้ทำการตรวจสอบ Security PenTest ร่วมกับทีมภายนอกแล้ว ไม่มีช่องโหว่ระดับ High หรือ Critical ตกค้าง จึงขอเสนอให้ที่ประชุมลงมติอนุมัติปล่อยเวอร์ชัน Beta ค่ะ',
        'spk-03' // นวพร
      );
      setTimeout(() => {
        handleDirectPromptAgent(
          'secretary',
          'สรุปมติเห็นชอบการปล่อยเวอร์ชัน Beta และสร้าง Action Item สำหรับบันทึกในรายงาน'
        );
      }, 1500);
    }
  };

  const currentAgenda = agendas.find((a) => a.status === 'in_progress') || agendas[0];
  const confirmedCount = participants.filter((p) => p.isConfirmed).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <MeetingHeader
        meetingTitle="Sprint 24 & Milestone 2 Strategic Review"
        meetingState={meetingState}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        audioMetrics={audioMetrics}
        isTtsEnabled={isTtsEnabled}
        setIsTtsEnabled={setIsTtsEnabled}
        isMicActive={isMicActive}
        toggleMicrophone={toggleMicrophone}
        confirmedCount={confirmedCount}
        totalParticipants={participants.length}
        pendingInterventionsCount={pendingInterventions.length}
        onStartMeeting={handleStartMeeting}
        onEndMeeting={handleEndMeeting}
        onResetMeeting={handleResetMeeting}
        meetingTimeStr={formatTimer(meetingSeconds)}
        onOpenDataModal={() => setIsDataModalOpen(true)}
        onOpenHelpModal={() => setIsHelpModalOpen(true)}
        ttsLiveStatus={ttsLiveStatus}
        chunkCount={audioChunks.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 space-y-6">
        {activeTab === 'enrollment' && (
          <PreMeetingEnrollment
            participants={participants}
            setParticipants={setParticipants}
            onStartMeeting={handleStartMeeting}
            isTtsEnabled={isTtsEnabled}
          />
        )}

        {activeTab === 'chunks' && (
          <AudioChunkManager
            chunks={audioChunks}
            currentChunkDurationSec={currentChunkSeconds}
            config={chunkConfig}
            onUpdateConfig={setChunkConfig}
            onForceRotateChunk={handleForceRotateChunk}
            onReTranscribeChunk={handleReTranscribeChunk}
            isRecording={meetingState === 'in_progress'}
          />
        )}

        {activeTab === 'room' && (
          <div className="space-y-6">
            {/* Top Row: 360 Visualizer and Live Transcript */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* 360 Conference Table Visualizer (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <RoomVisualizer360
                  participants={participants}
                  agents={agents}
                  activeSpeakerId={activeSpeakerId}
                  audioMetrics={audioMetrics}
                  pendingInterventions={pendingInterventions}
                  onParticipantClickToSpeak={(p) => {
                    handleNewUtterance(
                      `สวัสดีครับ ผม ${p.name} ขอแสดงความคิดเห็นเพิ่มเติมในประเด็นนี้ครับ`,
                      p.id
                    );
                  }}
                  onApproveIntervention={handleApproveIntervention}
                  currentAgendaTitle={currentAgenda.title}
                  onOpenCitation={handleOpenCitation}
                />

                {/* Scenario Simulation Quick Buttons */}
                <SimulationControls
                  participants={participants}
                  onTriggerScenario={handleTriggerScenario}
                  onSimulateSingleSpeaker={handleNewUtterance}
                  disabled={meetingState === 'adjourned'}
                />
              </div>

              {/* Live Transcript & Diarization Stream (5 cols) */}
              <div className="lg:col-span-5">
                <LiveTranscriptFeed
                  transcript={transcript}
                  participants={participants}
                  agents={agents}
                  onAddTranscriptItem={handleNewUtterance}
                  onCorrectSpeaker={handleCorrectSpeaker}
                  onVerifySpeaker={handleVerifySpeaker}
                  isMicActive={isMicActive}
                  onToggleMic={toggleMicrophone}
                  onOpenCitation={handleOpenCitation}
                />
              </div>
            </div>

            {/* Bottom Row: Multi-Agent Hub and Floor Control */}
            <MultiAgentHub
              agents={agents}
              pendingInterventions={pendingInterventions}
              onApproveIntervention={handleApproveIntervention}
              onDismissIntervention={handleDismissIntervention}
              onDeferIntervention={handleDeferIntervention}
              onDirectPromptAgent={handleDirectPromptAgent}
              isProcessing={isProcessingAI}
              agendas={agendas}
              onAdvanceAgenda={handleAdvanceAgenda}
              onOpenCitation={handleOpenCitation}
            />
          </div>
        )}

        {activeTab === 'intelligence' && (
          <MeetingIntelligenceSummary
            intelligence={intelligence}
            setIntelligence={setIntelligence}
            meetingTitle="Sprint 24 & Milestone 2 Strategic Review"
            meetingTimeStr={formatTimer(meetingSeconds)}
            participants={participants}
            onRegenerateMinutes={handleRegenerateMinutes}
            isRegenerating={isRegeneratingMinutes}
            onSyncToOneVault={handleSyncResolutionsToOneVault}
          />
        )}

        {activeTab === 'onevault' && (
          <OneVaultDrawer
            documents={oneVaultDocs}
            onAddDocument={handleAddOneVaultDoc}
          />
        )}
      </main>

      {/* System Toast Notification */}
      {systemNotification && (
        <div className="fixed bottom-14 right-6 z-50 bg-emerald-950 border border-emerald-500/80 text-emerald-300 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-fadeIn">
          <span>✓</span>
          <span>{systemNotification}</span>
          <button
            onClick={() => setSystemNotification(null)}
            className="text-emerald-400 hover:text-white ml-2 text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Data Import / Export Modal */}
      <DataImportExportModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        transcript={transcript}
        intelligence={intelligence}
        participants={participants}
        agendas={agendas}
        meetingTitle="Sprint 24 & Milestone 2 Strategic Review"
        meetingTimeStr={formatTimer(meetingSeconds)}
        onImportTranscript={handleImportTranscript}
      />

      {/* Evidence & Citation Inspector Modal */}
      <EvidenceCitationModal
        isOpen={!!activeCitation}
        onClose={() => setActiveCitation(null)}
        document={activeCitation?.doc || null}
        highlightedText={activeCitation?.doc?.snippet}
        claimantStatement={activeCitation?.statement}
        analysisText={activeCitation?.analysis}
      />

      {/* In-App Help & Manual Viewer Modal */}
      <HelpManualModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-3 px-6 text-center text-xs text-slate-500">
        Nextwaver AI Meeting Team v1.0 • Powered by Gemini Live 3.8, Gemini 3.5 Transcribe & 360° Conference Audio Gateway
      </footer>
    </div>
  );
}
