import {
  Participant,
  AIAgent,
  MeetingAgenda,
  OneVaultDocument,
  TranscriptItem,
  MeetingIntelligence,
} from '../types/meeting';

export const INITIAL_PARTICIPANTS: Participant[] = [
  {
    id: 'spk-01',
    name: 'ภูวกฤต',
    role: 'Project Manager',
    isConfirmed: false,
    isChairman: false,
    avatarColor: 'from-blue-600 to-indigo-600',
    seatAngle: 0,
    speechCount: 0,
    introSampleText: 'ผมภูวกฤตครับ วันนี้รับผิดชอบเรื่องแผนงานและติดตามความคืบหน้าของโครงการ',
  },
  {
    id: 'spk-02',
    name: 'กำธร',
    role: 'Architect',
    isConfirmed: false,
    isChairman: false,
    avatarColor: 'from-emerald-600 to-teal-600',
    seatAngle: 120,
    speechCount: 0,
    introSampleText: 'ผมกำธรครับ รับผิดชอบด้านสถาปัตยกรรมระบบ คลาวด์ และการเชื่อมโยง Microservices',
  },
  {
    id: 'spk-03',
    name: 'นวพร',
    role: 'QA / Documentation',
    isConfirmed: false,
    isChairman: false,
    avatarColor: 'from-amber-500 to-orange-600',
    seatAngle: 240,
    speechCount: 0,
    introSampleText: 'สวัสดีค่ะ นวพรค่ะ ดูแลเรื่องมาตรฐานคุณภาพ ซอฟต์แวร์ และเอกสารรายงานการทดสอบ',
  },
];

export const INITIAL_AGENTS: AIAgent[] = [
  {
    id: 'agent-mod',
    type: 'moderator',
    name: 'AI Moderator',
    roleTitle: 'Agenda & Floor Control',
    avatar: 'M',
    status: 'listening',
    description: 'ควบคุมระเบียบวาระ บริหารเวลา และจัดสรรลำดับการพูดของผู้เข้าประชุม',
    voiceName: 'Puck',
    lastThought: 'กำลังติดตามวาระการประชุมที่ 1 และคอยสังเกตสัญญาณการสลับผู้พูด',
    iconName: 'Shield',
    color: 'indigo',
  },
  {
    id: 'agent-ana',
    type: 'analyst',
    name: 'AI Analyst',
    roleTitle: 'Strategic & Risk Evaluation',
    avatar: 'A',
    status: 'idle',
    description: 'วิเคราะห์ผลกระทบเชิงกลยุทธ์ ประเมินความเสี่ยง และเปรียบเทียบข้อดีข้อเสีย',
    voiceName: 'Charon',
    lastThought: 'เตรียมข้อมูลวิเคราะห์ผลกระทบกรณีขยายขอบเขตงาน Sprint',
    iconName: 'LineChart',
    color: 'purple',
  },
  {
    id: 'agent-fact',
    type: 'fact_checker',
    name: 'AI Fact-Check',
    roleTitle: 'OneVault Knowledge Audit',
    avatar: 'F',
    status: 'listening',
    description: 'ตรวจสอบความถูกต้องของข้อมูล สัญญา และสถิติเทียบกับคลัง OneVault',
    voiceName: 'Fenrir',
    lastThought: 'เชื่อมต่อฐานข้อมูล OneVault สัญญา SOW-2026 พร้อมเทียบตัวเลขข้อเท็จจริง',
    iconName: 'SearchCheck',
    color: 'amber',
  },
  {
    id: 'agent-sec',
    type: 'secretary',
    name: 'AI Secretary',
    roleTitle: 'Resolutions & Action Items',
    avatar: 'S',
    status: 'idle',
    description: 'บันทึกมติที่ประชุม มอบหมาย Action Items และจับประเด็นค้างคา (Parking Lot)',
    voiceName: 'Kore',
    lastThought: 'บันทึกประเด็นที่ตกลงกันได้และเตรียมจัดทำสรุปมติ',
    iconName: 'FileCheck',
    color: 'emerald',
  },
];

export const INITIAL_AGENDAS: MeetingAgenda[] = [
  {
    id: 'ag-01',
    title: '1. รายงานความคืบหน้า Sprint 24 & กำหนดส่งมอบ Milestone 2',
    durationMinutes: 15,
    status: 'in_progress',
    notes: 'ติดตามงานฝั่ง Backend API และการทดสอบระบบก่อนส่งมอบลูกค้า',
  },
  {
    id: 'ag-02',
    title: '2. พิจารณาสถาปัตยกรรมคลาวด์และงบประมาณโครงสร้างพื้นฐาน',
    durationMinutes: 20,
    status: 'pending',
    notes: 'ประเมินค่าใช้จ่าย Multi-region Database และ Kubernetes Cluster',
  },
  {
    id: 'ag-03',
    title: '3. อนุมัติแผนการทดสอบ UAT และขอมติปล่อยเวอร์ชัน Beta',
    durationMinutes: 15,
    status: 'pending',
    notes: 'ตรวจสอบผล Security Audit และรับรองผลจาก QA',
  },
];

export const INITIAL_ONEVAULT_DOCS: OneVaultDocument[] = [
  {
    id: 'OV-SOW-2026',
    title: 'SOW-2026: Statement of Work & Project Milestones',
    category: 'Contract',
    lastUpdated: '2026-09-28',
    snippet: 'ข้อตกลงการส่งมอบ Milestone 2 ระบุวันที่สิ้นสุดภายในสัปดาห์ที่ 42 (ไม่เกิน 24 ตุลาคม 2026)',
    content: `เอกสารสัญญาว่าจ้างพัฒนาแพลตฟอร์ม Nextwaver Core v2.0
- Milestone 1: Requirement & UI/UX Sign-off (เสร็จสิ้น)
- Milestone 2: Core Microservices & Security Gate ส่งมอบภายในสัปดาห์ที่ 42 โดยมีเงื่อนไขปรับล่าช้าวันละ 0.1% ของมูลค่าสัญญา
- Milestone 3: End-to-End Pilot Testing ในสภาพแวดล้อมจริง`,
    tags: ['สัญญา', 'Milestone', 'กำหนดส่งมอบ', 'SOW'],
  },
  {
    id: 'OV-ARCH-03',
    title: 'Cloud Infrastructure & Budget Baseline v3.1',
    category: 'Architecture',
    lastUpdated: '2026-10-01',
    snippet: 'เพดานงบประมาณคลาวด์ได้รับอนุมัติไม่เกิน $12,500/เดือน สถาปัตยกรรมกำหนด SLA 99.95%',
    content: `กรอบงบประมาณโครงสร้างพื้นฐานคลาวด์ประจำปี 2026:
- งบประมาณสูงสุดที่บอร์ดอนุมัติ: ไม่เกิน $12,500 USD ต่อเดือน
- มาตรฐานความพร้อมใช้งาน: SLA 99.95%
- หากสถาปัตยกรรมปรับเป็น Multi-region จะต้องขออนุมัติงบประมาณเพิ่มเติมจาก CFO ล่วงหน้าอย่างน้อย 30 วัน`,
    tags: ['Architecture', 'Cloud', 'Budget', 'SLA'],
  },
  {
    id: 'OV-SEC-QA',
    title: 'Security Compliance & QA Testing Policy',
    category: 'Policy',
    lastUpdated: '2026-09-15',
    snippet: 'การปล่อย Beta ต้องผ่าน Penetration Testing โดยไม่มีช่องโหว่ระดับ High/Critical ตกค้าง',
    content: `นโยบายความมั่นคงปลอดภัยและการควบคุมคุณภาพ:
1. การปล่อยระบบสู่การทดสอบระดับ Beta หรือ Production ต้องผ่านการทดสอบ Penetration Test อย่างน้อย 14 วันก่อนกำหนดปล่อย
2. ช่องโหว่ระดับ Critical และ High ต้องได้รับการแก้ไข 100%
3. ผลการทดสอบต้องลงนามรับรองโดย QA Lead (นวพร) และ Head of Security`,
    tags: ['Security', 'QA', 'PenTest', 'Compliance'],
  },
];

export const INITIAL_TRANSCRIPT: TranscriptItem[] = [
  {
    id: 'tr-01',
    timestamp: '10:00:15',
    speakerId: 'agent-mod',
    speakerName: 'AI Moderator',
    speakerRole: 'Floor Control',
    text: 'สวัสดีครับทุกท่าน การประชุม Nextwaver AI Meeting Team เริ่มต้นขึ้นแล้ว ขณะนี้เข้าสู่วาระที่ 1: รายงานความคืบหน้า Sprint 24 ขอเชิญคุณภูวกฤตเปิดประเด็นครับ',
    confidence: 99.4,
    isAI: true,
    agentType: 'moderator',
    sentiment: 'positive',
  },
  {
    id: 'tr-02',
    timestamp: '10:01:05',
    speakerId: 'spk-01',
    speakerName: 'ภูวกฤต',
    speakerRole: 'Project Manager',
    text: 'ขอบคุณครับ สำหรับ Sprint 24 ภาพรวมการทำงานเสร็จสิ้นไปแล้วประมาณ 85% ทีมพัฒนาสามารถปิดฟีเจอร์หลักได้ตามแผน แต่มีประเด็นเรื่องการทดสอบความปลอดภัยที่อาจต้องใช้เวลาเพิ่ม',
    confidence: 97.2,
    sentiment: 'neutral',
  },
  {
    id: 'tr-03',
    timestamp: '10:01:48',
    speakerId: 'spk-02',
    speakerName: 'กำธร',
    speakerRole: 'Architect',
    text: 'เรื่องการขยายคลัสเตอร์ Kubernetes สำหรับรองรับโหลด UAT เราอาจต้องคุยเรื่องงบประมาณโครงสร้างพื้นฐานเพิ่มเติมด้วยครับ',
    confidence: 84.8,
    sentiment: 'caution',
    tags: ['OV-ARCH-03'],
  },
  {
    id: 'tr-04',
    timestamp: '10:02:22',
    speakerId: 'spk-03',
    speakerName: 'นวพร',
    speakerRole: 'QA / Documentation',
    text: 'ทีม QA พร้อมทดสอบรอบระบบภายในแล้วค่ะ แต่ต้องการความชัดเจนเรื่องเกณฑ์ประเมินความปลอดภัยตามมาตรฐาน OneVault',
    confidence: 95.8,
    sentiment: 'neutral',
    tags: ['OV-SEC-QA'],
  },
  {
    id: 'tr-05',
    timestamp: '10:03:05',
    speakerId: 'spk-03',
    speakerName: 'นวพร',
    speakerRole: 'QA / Documentation',
    text: 'หนูแนะนำว่าควรทดสอบ Penetration Testing ล่วงหน้าอย่างน้อย 14 วันก่อนกำหนดส่งมอบตามเงื่อนไขสัญญาค่ะ',
    confidence: 87.5,
    sentiment: 'caution',
    tags: ['OV-SEC-QA', 'PenTest'],
  },
];

export const INITIAL_INTELLIGENCE: MeetingIntelligence = {
  executiveSummary:
    'ที่ประชุมได้เริ่มต้นพิจารณาวาระความคืบหน้าโครงการ Sprint 24 และเตรียมความพร้อมสำหรับ Milestone 2 โดยทีมงานให้ความสำคัญกับมาตรฐานความปลอดภัยและกรอบงบประมาณคลาวด์',
  approvedResolutions: [
    {
      id: 'RES-01',
      topic: 'การจัดลำดับความสำคัญของ Sprint 24',
      resolution: 'เห็นชอบให้ทีมมุ่งเน้นการปิดฟีเจอร์หลักของ API ก่อนวันที่ 15 เพื่อส่งต่อให้ QA',
      consensus: 'เอกฉันท์',
      stakeholders: ['ภูวกฤต', 'กำธร'],
      timestamp: '10:05',
    },
  ],
  actionItems: [
    {
      id: 'ACT-01',
      task: 'รวบรวมรายงานความพร้อม API สำหรับส่งมอบให้ทีม QA ทดสอบ',
      owner: 'ภูวกฤต',
      deadline: 'วันศุกร์นี้ 17:00 น.',
      priority: 'HIGH',
      status: 'in_progress',
    },
    {
      id: 'ACT-02',
      task: 'สรุปตัวเลขเปรียบเทียบค่าใช้จ่ายคลาวด์ Single vs Multi-Region',
      owner: 'กำธร',
      deadline: 'สัปดาห์หน้า',
      priority: 'MEDIUM',
      status: 'pending',
    },
  ],
  unresolvedItems: [
    {
      id: 'PARK-01',
      issue: 'การขยับกำหนดส่งมอบ Milestone 2 ไปยังสัปดาห์ที่ 44 อาจกระทบเงื่อนไขสัญญา',
      nextStep: 'รอให้ AI Fact-Check ยืนยันเงื่อนไขสัญญา SOW-2026 จาก OneVault',
    },
  ],
  keyTakeaways: [
    'ความคืบหน้า Sprint 24 อยู่ที่ 85%',
    'ต้องคงระดับความปลอดภัยตามมาตรฐาน OneVault ก่อนเริ่ม UAT',
    'AI Fact-Check คอยติดตามกรอบงบประมาณและกำหนดส่งมอบสัญญาอย่างใกล้ชิด',
  ],
};
