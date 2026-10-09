import React, { useState } from 'react';
import {
  HelpCircle,
  X,
  BookOpen,
  GitBranch,
  Layers,
  Sparkles,
  Shield,
  FileText,
  Search,
  CheckCircle2,
  Clock,
  Mic,
  Scissors,
  ArrowRight,
  Database,
  ExternalLink,
} from 'lucide-react';

interface HelpManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartDemoTour?: () => void;
}

export const HelpManualModal: React.FC<HelpManualModalProps> = ({
  isOpen,
  onClose,
  onStartDemoTour,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'steps' | 'diagrams' | 'glossary' | 'faq'
  >('overview');
  const [glossarySearch, setGlossarySearch] = useState('');

  if (!isOpen) return null;

  const glossaryItems = [
    {
      term: 'Gemini Live API',
      category: 'AI Engine',
      desc: 'บริการปัญญาประดิษฐ์สนทนาเสียงสดสองทางแบบ Low-latency ทำให้ AI สามารถรับฟังและโต้ตอบด้วยเสียงแบบเป็นธรรมชาติ',
    },
    {
      term: 'Gemini 3.5 Transcribe',
      category: 'Audio Processing',
      desc: 'โมเดลแปลงเสียงเป็นข้อความที่รองรับการแยกแยะผู้พูด (Speaker Diarization) สูงสุด 8 คน พร้อมสร้าง Timestamps ช่วงเวลา',
    },
    {
      term: 'Gemini 3.8 Flash Lite TTS',
      category: 'Speech Synthesis',
      desc: 'โมเดลสร้างเสียงสังเคราะห์ AI แบบ Real-time ที่ส่งคืนไฟล์เสียง WAV 24kHz คุณภาพสูงกลับมาเล่นผ่านเบราว์เซอร์ทันที',
    },
    {
      term: '360° Array Microphone',
      category: 'Hardware',
      desc: 'ชุดไมโครโฟนประชุมรอบทิศทางที่สามารถจับคลื่นเสียงได้ 360 องศา และคำนวณตำแหน่งที่นั่งของผู้พูดในห้องประชุม',
    },
    {
      term: 'Beamforming & DOA',
      category: 'Acoustics',
      desc: 'Direction of Arrival (DOA) คำนวณมุมองศา (0°–360°) ของเสียงผู้พูด เพื่อหันลำคลื่นการรับเสียง (Beamforming) ไปหาผู้พูดและตัดเสียงรบกวน',
    },
    {
      term: 'AEC (Acoustic Echo Cancellation)',
      category: 'Acoustics',
      desc: 'ระบบตัดเสียงสะท้อน ป้องกันไม่ให้เสียงตอบกลับของ AI จากลำโพง วนกลับเข้าไปในไมโครโฟนจนเกิดเสียงหวีดหรือเสียงวนซ้ำ',
    },
    {
      term: 'VAD (Voice Activity Detection)',
      category: 'Acoustics',
      desc: 'ระบบตรวจจับคลื่นเสียงมนุษย์ เพื่อแยกแยะว่าช่วงเวลาใดมีคนกำลังพูดอยู่จริง และช่วงเวลาใดเป็นความเงียบหรือเสียงรบกวน',
    },
    {
      term: 'Speaker Diarization',
      category: 'AI Engine',
      desc: 'กระบวนการจำแนกผู้พูดว่า "ใครพูดประโยคใด ในเวลาใด" (Who spoke when) โดยเชื่อมโยงเสียงเข้ากับตัวตนผู้เข้าร่วมประชุม',
    },
    {
      term: 'Speaker Fingerprint ID',
      category: 'Biometrics',
      desc: 'รหัสชีวมิติเสียงเฉพาะบุคคล (เช่น SPK-TH-8421) ที่สกัดจาก Pitch Band, Cadence และ SNR เพื่อใช้จดจำเสียงตลอดการประชุม',
    },
    {
      term: 'Floor Control & Hand-Raising',
      category: 'Policy Engine',
      desc: 'กฎควบคุมสิทธิ์การพูดในห้องประชุม เพื่อป้องกันไม่ให้ AI พูดแทรกมนุษย์ โดย AI ต้องยกมือขออนุญาตประธานก่อนพูดเสมอ',
    },
    {
      term: 'Audio Chunking (30 นาที)',
      category: 'Data Management',
      desc: 'การแบ่งไฟล์เสียงออกเป็นช่วงๆ ละ 30 นาที เพื่อป้องกันข้อมูลสูญหาย และสอดคล้องกับข้อจำกัดความยาวไฟล์ของโมเดลถอดเสียง',
    },
    {
      term: 'Confidence Heatmap & Manual Verification',
      category: 'Quality Assurance',
      desc: 'แถบสีจำลองระดับความเชื่อมั่น Diarization ตลอดการประชุม โดยไฮไลต์ส่วนที่มีความแม่นยำต่ำกว่า 90% เป็นสีแดง พร้อมกล่องแจ้งเตือนให้ผู้ใช้กด "ยืนยันผู้พูด" หรือ "เปลี่ยนผู้พูด" ด้วยตนเอง เพื่อความถูกต้อง 100% ของรายงานการประชุม',
    },
    {
      term: 'OneVault Knowledge Base',
      category: 'Knowledge Repository',
      desc: 'คลังเก็บเอกสารสัญญา แผนงานสถาปัตยกรรม และมติที่ประชุมที่ได้รับอนุมัติ ซึ่ง AI Fact-Check ใช้เป็นแหล่งอ้างอิงความจริง',
    },
  ];

  const filteredGlossary = glossaryItems.filter(
    (item) =>
      item.term.toLowerCase().includes(glossarySearch.toLowerCase()) ||
      item.desc.toLowerCase().includes(glossarySearch.toLowerCase()) ||
      item.category.toLowerCase().includes(glossarySearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <span>คู่มือการใช้งานระบบ Nextwaver AI Meeting Team</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  Beginner Guide & Architecture Manual
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                เรียนรู้ขั้นตอนการทำงาน แผนผังระบบ Mermaid และพจนานุกรมคำศัพท์เทคนิค
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-4 pt-2 text-xs font-bold overflow-x-auto">
          {[
            { id: 'overview', label: '1. แนะนำระบบ', icon: BookOpen },
            { id: 'steps', label: '2. ขั้นตอนใช้งานทีละก้าว', icon: ArrowRight },
            { id: 'diagrams', label: '3. แผนผังระบบ (Mermaid)', icon: GitBranch },
            { id: 'glossary', label: '4. คำศัพท์เทคนิค (Glossary)', icon: Layers },
            { id: 'faq', label: '5. คำถามที่พบบ่อย (FAQ)', icon: HelpCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6 text-xs text-slate-300 leading-relaxed">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900 to-indigo-950/40 border border-indigo-500/30 rounded-2xl p-5 space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">
                  Concept & Value Proposition
                </span>
                <h4 className="text-base font-bold text-white">
                  เปลี่ยน AI จาก "ผู้ถอดเทปเงียบๆ" ให้เป็น "สมาชิกทีมร่วมประชุมจริง"
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  Nextwaver AI Meeting Team พัฒนาขึ้นบนแนวคิดที่ว่า AI ต้องรู้ว่า{' '}
                  <strong>ใครกำลังพูด</strong>, <strong>พูดเรื่องอะไร</strong>, และ{' '}
                  <strong>เมื่อไรควรมีส่วนร่วม</strong> โดยไม่พูดสอดแทรกมนุษย์
                  และคอยปกป้องผลประโยชน์ขององค์กรโดยเทียบข้อมูลกับสัญญาใน <strong>OneVault</strong> แบบเรียลไทม์
                </p>
              </div>

              <div className="space-y-3">
                <h5 className="font-bold text-sm text-white">ทีม AI Multi-Agent ทั้ง 4 บทบาท:</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-indigo-300">
                      <Shield className="w-4 h-4 text-indigo-400" />
                      <span>1. AI Moderator (Agenda & Floor Control)</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      ดูแลระเบียบวาระการประชุม รักษาเวลา และจัดสรรคิวผู้พูด (เสียงสังเคราะห์ Puck)
                    </p>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-purple-300">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span>2. AI Analyst (Strategic & Risk Evaluation)</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      วิเคราะห์ผลกระทบเชิงกลยุทธ์ ชั่งน้ำหนักข้อดี-ข้อเสีย และความคุ้มค่าด้านงบประมาณ (เสียง Charon)
                    </p>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-amber-300">
                      <Search className="w-4 h-4 text-amber-400" />
                      <span>3. AI Fact-Check (OneVault Truth Audit)</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      ตรวจจับข้อความที่ขัดแย้งกับสัญญา SOW หรือตัวเลขงบประมาณ แล้วยกมือทักท้วง (เสียง Fenrir)
                    </p>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-emerald-300">
                      <FileText className="w-4 h-4 text-emerald-400" />
                      <span>4. AI Secretary (Resolutions & Action Items)</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      สกัดมติที่ประชุม มอบหมาย Action Items พร้อมระบุผู้รับผิดชอบ และประเด็นคั่งค้าง (เสียง Kore)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STEPS */}
          {activeTab === 'steps' && (
            <div className="space-y-4">
              <h5 className="font-bold text-sm text-white">
                ขั้นตอนการใช้งาน 6 สเต็ปสำหรับผู้ใช้งาน:
              </h5>

              <div className="space-y-3">
                {[
                  {
                    step: '1',
                    title: 'ลงทะเบียนเสียง (Voice Check-in)',
                    desc: 'เข้าแท็บ Check-in ให้สมาชิกแต่ละคนพูดแนะนำตัวสั้นๆ 3.5 วินาที เพื่อให้ AI สกัด Voice Profile และ Fingerprint ID ป้องกันการระบุชื่อผิด',
                  },
                  {
                    step: '2',
                    title: 'เริ่มประชุมและรับฟังรอบทิศทาง 360°',
                    desc: 'ประธานกดยืนยันเริ่มประชุม โต๊ะ 360° จะเริ่มหมุนเรดาร์ Beamforming หันไปหาผู้ที่กำลังพูดอัตโนมัติ พร้อมระบบตัดเสียงสะท้อน AEC',
                  },
                  {
                    step: '3',
                    title: 'เรียกถาม AI โดยตรง (Direct Address)',
                    desc: 'หากต้องการความเห็น สามารถเรียกถามชื่อ AI หรือกดปุ่มคำถามด่วนด้านล่าง AI จะตอบกลับเป็นข้อความและส่งเสียงพูดสด Gemini TTS ทันที',
                  },
                  {
                    step: '4',
                    title: 'การควบคุมการยกมือทักท้วงของ AI (Floor Control)',
                    desc: 'หากมีคนเสนอข้อมูลขัดแย้งกับสัญญา OneVault เช่น ขอเลื่อนส่งมอบ AI จะยกมือพร้อมเสียง Chime ประธานสามารถกด [อนุญาตให้พูด] หรือ [พักไว้ก่อน] ได้',
                  },
                  {
                    step: '5',
                    title: 'การแบ่งช่วงไฟล์เสียง 30 นาที (Audio Chunk Gateway)',
                    desc: 'ระบบจะตัดรอบบันทึกไฟล์เสียงทุก 30 นาทีอัตโนมัติ เพื่อรองรับข้อจำกัดของโมเดลถอดเสียง และมีปุ่มตัดรอบทันทีเพื่อดาวน์โหลด',
                  },
                  {
                    step: '6',
                    title: 'สรุปมติและส่งออกรายงาน (Data Hub)',
                    desc: 'เมื่อปิดประชุม ระบบจะสรุป Executive Summary, มติเอกฉันท์, ตาราง Action Items และสามารถส่งออกเป็น Markdown, CSV, JSON หรือสั่งพิมพ์ PDF ได้',
                  },
                ].map((item) => (
                  <div
                    key={item.step}
                    className="flex items-start gap-3.5 bg-slate-950/70 border border-slate-800 rounded-xl p-3.5"
                  >
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                      {item.step}
                    </span>
                    <div>
                      <h6 className="font-bold text-white text-xs mb-0.5">{item.title}</h6>
                      <p className="text-[11px] text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: MERMAID DIAGRAMS */}
          {activeTab === 'diagrams' && (
            <div className="space-y-6">
              <div>
                <h5 className="font-bold text-sm text-white mb-2">
                  1. แผนผังสถาปัตยกรรมระบบ (System Architecture)
                </h5>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[11px] text-indigo-300 overflow-x-auto space-y-2">
                  <p className="text-slate-400 font-sans font-semibold">
                    โครงสร้างการไหลของข้อมูลจากห้องประชุมไปยัง Gemini และ OneVault:
                  </p>
                  <pre className="text-slate-300">
{`[ห้องประชุม & ไมค์ 360°] ──> [AEC ตัดเสียงสะท้อน + VAD + DOA Beam 0°-360°]
                                       │
        ┌──────────────────────────────┴─────────────────────────────┐
        ▼                                                            ▼
[Gemini 3.5 Transcribe Live]                                [Audio Chunker 30 นาที]
        │                                                            │
        ▼                                                            ▼
[Diarization & ถอดข้อความ]                                  [ประวัติช่วงไฟล์เสียง]
        │
        ▼
[Multi-Agent Orchestrator] <─── เทียบสัญญา ───> [OneVault Repository]
  ├── Moderator (คุมเวลา)
  ├── Analyst (วิเคราะห์ความเสี่ยง)
  ├── Fact-Check (ตรวจข้อเท็จจริง) ──> [ยกมือขอประธานพูด]
  └── Secretary (บันทึกมติ)
        │
        ▼
[Gemini 3.8 Flash Lite TTS] ──> [ส่งเสียง AI ตอบกลับห้องประชุม]`}
                  </pre>
                </div>
              </div>

              <div>
                <h5 className="font-bold text-sm text-white mb-2">
                  2. ลำดับขั้นตอนการตัดสินใจเมื่อ AI ยกมือขอพูด (Floor Control Logic)
                </h5>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[11px] text-cyan-300 overflow-x-auto space-y-2">
                  <pre className="text-slate-300">
{`ผู้เข้าร่วมพูดข้อความ
        │
        ├── มีคนเรียกชื่อ AI? ──> [ใช่] ──> AI ตอบกลับทันทีด้วยเสียงสังเคราะห์
        │
        └── ไม่ได้เรียก AI
                │
                ▼
        [AI Fact-Check ตรวจกับ OneVault ในเบื้องหลัง]
                │
                ├── ข้อมูลถูกต้อง ──> [AI นิ่งเงียบ ไม่พูดแทรก]
                │
                └── ข้อมูลขัดแย้งสัญญา ──> [AI ยกมือเตือน + เสียง Chime สองโทน]
                                                │
                                                ▼
                                    [ประธานตัดสินใจบนหน้าจอ]
                                       ├── อนุญาต ──> AI พูดเตือนสัญญา
                                       ├── พักไว้ ──> เก็บลง Parking Lot
                                       └── ข้ามไป ──> ปิดการแจ้งเตือน`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GLOSSARY */}
          {activeTab === 'glossary' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h5 className="font-bold text-sm text-white">
                  พจนานุกรมคำศัพท์เทคนิคภายในระบบ (Technical Glossary)
                </h5>
                <div className="relative w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={glossarySearch}
                    onChange={(e) => setGlossarySearch(e.target.value)}
                    placeholder="ค้นหาคำศัพท์..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredGlossary.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{item.term}</span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-900 text-indigo-300 border border-slate-800">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: FAQ */}
          {activeTab === 'faq' && (
            <div className="space-y-3">
              <h5 className="font-bold text-sm text-white">คำถามที่พบบ่อย (FAQ):</h5>

              <div className="space-y-2.5">
                {[
                  {
                    q: 'ทำไมต้องเช็คอินเสียงทีละคนก่อนเริ่มประชุม?',
                    a: 'เนื่องจากไมโครโฟนประชุมไม่สามารถรู้ชื่อผู้พูดได้อัตโนมัติ การแนะนำตัวสั้นๆ 3.5 วินาที ทำให้ระบบสร้าง Speaker Profile เพื่อจับคู่เสียงกับชื่อได้อย่างแม่นยำ ป้องกันการบันทึกมติหรือมอบหมายงานผิดคน',
                  },
                  {
                    q: 'หากระบบระบุชื่อคนพูดผิดในระหว่างประชุม สามารถแก้ไขได้หรือไม่?',
                    a: 'แก้ไขได้ทันทีครับ ในทุกข้อความบน Live Transcript จะมีปุ่ม "แก้ชื่อผู้พูด" ให้คลิกเปลี่ยนชื่อเป็นผู้เข้าร่วมท่านอื่นได้ทันที',
                  },
                  {
                    q: 'ทำไมจึงต้องแบ่งไฟล์เสียงเป็นช่วงละ 30 นาที?',
                    a: 'เนื่องจากโมเดลแยกผู้พูด Gemini 3.5 Transcribe Diarization มีข้อกำหนดจำกัดความยาวไฟล์ไม่เกิน 30 นาทีต่อหนึ่งคำขอ การแบ่งช่วงละ 30 นาทีจึงช่วยให้ระบบประมวลผลได้ถูกต้อง ไม่ติด Error และป้องกันข้อมูลสูญหาย',
                  },
                  {
                    q: 'หากไม่มีไมโครโฟนจริง สามารถทดสอบระบบได้อย่างไร?',
                    a: 'ระบบมีปุ่ม "จำลองสถานการณ์การประชุม (Interactive Scenarios)" และปุ่มจำลองคำพูดของแต่ละท่าน ให้คุณคลิกเพื่อทดสอบกระบวนการทั้งหมดของ AI ได้ทันทีโดยไม่ต้องใช้ไมค์จริงครับ',
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-1"
                  >
                    <p className="font-bold text-white text-xs flex items-center gap-1.5">
                      <span className="text-indigo-400">Q:</span> {item.q}
                    </p>
                    <p className="text-[11px] text-slate-400 pl-4">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            ดูเอกสารฉบับเต็มเพิ่มเติมได้ที่ไฟล์ <code>README.md</code> และ <code>designspec.md</code>
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer"
          >
            เข้าใจแล้ว เข้าสู่การประชุม
          </button>
        </div>
      </div>
    </div>
  );
};
