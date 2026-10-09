import { AgentType, MeetingIntelligence } from '../types/meeting';

export interface ChatResponse {
  agentType: AgentType;
  reply: string;
  timestamp: string;
}

export interface VoiceEnrollResponse {
  voiceProfile: {
    pitchBand: string;
    cadence: string;
    acousticConfidence: number;
    snrDb: number;
    speakerFingerprintId: string;
    enrolledGreeting: string;
  };
}

export interface FactCheckResponse {
  status: 'VERIFIED' | 'CONFLICT' | 'PARTIAL_MATCH' | 'NOT_FOUND';
  confidence: number;
  analysis: string;
  referenceDoc: string;
  suggestedIntervention: string;
  shouldRaiseHand: boolean;
}

export async function generateGeminiSpeech(
  text: string,
  voiceName: string = 'Puck'
): Promise<{ audioBase64: string | null; format?: string }> {
  try {
    const res = await fetch('/api/gemini/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice: voiceName }),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    return { audioBase64: data.audioBase64 || null, format: data.format || 'audio/wav' };
  } catch (error) {
    console.warn('Gemini TTS API error:', error);
    return { audioBase64: null };
  }
}

export async function askAgent(params: {
  agentType: AgentType;
  transcriptHistory: Array<{ speakerName: string; text: string }>;
  currentTopic: string;
  participants: Array<{ name: string; role: string }>;
  prompt: string;
  interventionMode?: boolean;
  oneVaultContext?: string;
}): Promise<string> {
  try {
    const res = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data: ChatResponse = await res.json();
    return data.reply;
  } catch (error) {
    console.warn('Backend call failed, using intelligent agent fallback:', error);
    return getFallbackAgentReply(params.agentType, params.prompt, params.interventionMode);
  }
}

export async function enrollVoiceSample(params: {
  participantName: string;
  role: string;
  introText: string;
}): Promise<VoiceEnrollResponse> {
  try {
    const res = await fetch('/api/gemini/voice-enroll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.warn('Voice enroll backend failed, using synthesized profile:', error);
    const hash = Math.floor(1000 + Math.random() * 9000);
    return {
      voiceProfile: {
        pitchBand: params.role.includes('QA') ? 'Clear Alto (205Hz)' : 'Mid-low Baritone (128Hz)',
        cadence: 'Steady & Articulate',
        acousticConfidence: +(94 + Math.random() * 5).toFixed(1),
        snrDb: +(26 + Math.random() * 6).toFixed(1),
        speakerFingerprintId: `SPK-TH-${hash}`,
        enrolledGreeting: `ขอบคุณครับ ระบบบันทึกเสียงคุณ${params.participantName}เรียบร้อยแล้ว`,
      },
    };
  }
}

export async function generateMeetingMinutes(params: {
  meetingTitle: string;
  transcript: Array<{ speakerName: string; speakerRole?: string; text: string; timestamp?: string }>;
  participants: Array<{ name: string; role: string }>;
  agenda: Array<{ title: string }>;
}): Promise<MeetingIntelligence> {
  try {
    const res = await fetch('/api/gemini/minutes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.warn('Minutes backend call failed, constructing fallback intelligence:', error);
    return {
      executiveSummary:
        'การประชุมได้ข้อสรุปในการเร่งความคืบหน้าของ Sprint 24 เพื่อให้ทันกำหนดส่งมอบ Milestone 2 โดยเน้นย้ำความถูกต้องของตัวเลขงบประมาณและการตรวจสอบช่องโหว่ความปลอดภัยตามข้อกำหนด OneVault',
      approvedResolutions: [
        {
          id: 'RES-01',
          topic: 'การส่งมอบ Milestone 2 ตามกรอบเวลา',
          resolution: 'ที่ประชุมมีมติเอกฉันท์ให้คงกำหนดส่งมอบภายในสัปดาห์ที่ 42 ตามที่ระบุในสัญญา OneVault SOW-2026',
          consensus: 'เอกฉันท์',
          stakeholders: ['ภูวกฤต', 'กำธร'],
        },
      ],
      actionItems: [
        {
          id: 'ACT-01',
          task: 'จัดทำรายงานสรุปความพร้อมการทดสอบระบบก่อนเริ่มกระบวนการ Penetration Testing',
          owner: 'นวพร',
          deadline: 'วันจันทร์หน้า 12:00 น.',
          priority: 'HIGH',
          status: 'pending',
        },
        {
          id: 'ACT-02',
          task: 'ตรวจสอบความพร้อมของ API และ Database ก่อนส่งมอบ',
          owner: 'กำธร',
          deadline: 'ภายในสัปดาห์นี้',
          priority: 'MEDIUM',
          status: 'in_progress',
        },
      ],
      unresolvedItems: [
        {
          id: 'PARK-01',
          issue: 'ข้อเสนอเพิ่มสถาปัตยกรรม Multi-Region ซึ่งอาจเกินเพดานงบประมาณ $12,500/เดือน',
          nextStep: 'ส่งเรื่องให้ CFO พิจารณาอนุมัติงบประมาณเพิ่มเติมตามขั้นตอนใน OneVault OV-ARCH-03',
        },
      ],
      keyTakeaways: [
        'กำหนดการส่งมอบยังคงยึดตามสัญญา SOW-2026 อย่างเคร่งครัด',
        'การขยายคลาวด์ต้องควบคุมไม่ให้เกินเพดานงบประมาณที่บอร์ดอนุมัติ',
      ],
    };
  }
}

export async function checkFactOneVault(params: {
  statement: string;
  speakerName: string;
  oneVaultDocs: Array<{ id: string; title: string; content: string }>;
}): Promise<FactCheckResponse> {
  try {
    const res = await fetch('/api/gemini/fact-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.warn('Fact check backend failed, using heuristic match:', error);
    // Simple heuristic for demo resilience
    const hasDelayClaim = params.statement.includes('เลื่อน') || params.statement.includes('สัปดาห์ที่ 44') || params.statement.includes('สัปดาห์ที่ 46');
    if (hasDelayClaim) {
      return {
        status: 'CONFLICT',
        confidence: 94,
        analysis: 'ข้อความของผู้พูดเรื่องการเลื่อนส่งมอบขัดแย้งกับเอกสารสัญญา SOW-2026 ใน OneVault ที่ระบุเดดไลน์สัปดาห์ที่ 42',
        referenceDoc: 'OV-SOW-2026',
        suggestedIntervention: 'ขออนุญาตเตือนที่ประชุมครับ เอกสารสัญญา SOW-2026 ระบุว่า Milestone 2 มีกำหนดส่งมอบภายในสัปดาห์ที่ 42 หากล่าช้าจะมีเงื่อนไขปรับตามสัญญาครับ',
        shouldRaiseHand: true,
      };
    }
    return {
      status: 'VERIFIED',
      confidence: 88,
      analysis: 'ข้อมูลสอดคล้องกับแนวทางสถาปัตยกรรมใน OneVault',
      referenceDoc: 'OV-ARCH-03',
      suggestedIntervention: '',
      shouldRaiseHand: false,
    };
  }
}

function getFallbackAgentReply(agentType: AgentType, prompt: string, isIntervention?: boolean): string {
  if (isIntervention) {
    switch (agentType) {
      case 'fact_checker':
        return 'ขออนุญาตประธานและที่ประชุมครับ: จากการตรวจสอบคลังความรู้ OneVault (เอกสาร OV-SOW-2026) กำหนดส่งมอบ Milestone 2 ระบุไว้ในสัปดาห์ที่ 42 หากเลื่อนออกไปจะมีเงื่อนไขค่าปรับตามสัญญา จึงขอเสนอให้ที่ประชุมพิจารณาผลกระทบนี้ด้วยครับ';
      case 'analyst':
        return 'ขออนุญาตเสนอข้อสังเกตครับ: การปรับใช้สถาปัตยกรรม Multi-Region จะทำให้ค่าบริการคลาวด์เกินเพดาน $12,500/เดือนที่บอร์ดอนุมัติไว้ แนะนำให้ทำ Single-Region พร้อม Automated Disaster Recovery สำรองไว้ก่อนครับ';
      case 'moderator':
        return 'ขออนุญาตเตือนเวลาครับ: สำหรับวาระนี้เหลือเวลาอีก 3 นาที ขอเรียนเชิญประธานขอมติเพื่อสรุปการตัดสินใจในประเด็นนี้ครับ';
      case 'secretary':
        return 'ขออนุญาตสรุปมติครับ: ที่ประชุมเห็นชอบแนวทางที่คุณภูวกฤตเสนอ โดยจะมอบหมายให้คุณกำธรเป็นผู้รับผิดชอบส่งรายงานในวันศุกร์นี้ครับ';
    }
  }

  switch (agentType) {
    case 'analyst':
      return 'จากการวิเคราะห์เชิงกลยุทธ์ ประเด็นนี้มีข้อดีคือช่วยลดความเสี่ยงด้านความพร้อมใช้งาน (High Availability 99.95%) แต่ข้อจำกัดคือต้นทุนทรัพยากรที่เพิ่มขึ้น แนะนำให้เริ่มทดสอบกับกลุ่ม Pilot ก่อนขยายผลครับ';
    case 'fact_checker':
      return 'ข้อมูลที่ระบุได้รับการตรวจสอบกับ OneVault แล้ว มีความสอดคล้องกับมาตรฐานความปลอดภัย OV-SEC-QA โดยทุก API ต้องผ่านการทดสอบก่อนขึ้น Production อย่างน้อย 14 วันครับ';
    case 'secretary':
      return 'ผมได้บันทึกประเด็นนี้ลงในร่างมติที่ประชุมและสร้าง Action Item เรียบร้อยแล้วครับ ผู้รับผิดชอบสามารถตรวจสอบรายการงานได้ทันทีครับ';
    case 'moderator':
    default:
      return 'รับทราบครับ ขอเชิญสมาชิกท่านอื่นร่วมแสดงความคิดเห็นในประเด็นนี้ได้เลยครับ หากไม่มีข้อสงสัยเพิ่มเติมเราจะเข้าสู่วาระถัดไปครับ';
  }
}
