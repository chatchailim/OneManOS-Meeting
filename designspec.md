# Nextwaver AI Meeting Team
## Requirement & System Design Specification (v1.0)
### Framework & Reusable Blueprint สำหรับการพัฒนาต้นแบบและระบบประชุมอัจฉริยะ (Gemini Live API + Multi-Agent + 360° Conference Audio)

---

## สารบัญ (Table of Contents)
1. [บทนำและวิสัยทัศน์ของระบบ (Executive Summary & Vision)](#1-บทนำและวิสัยทัศน์ของระบบ)
2. [ผู้มีส่วนได้ส่วนเสียและบทบาทหน้าที่ (Stakeholders & Roles Matrix)](#2-ผู้มีส่วนได้ส่วนเสียและบทบาทหน้าที่)
3. [กระบวนการทำงานแบบครบวงจร (End-to-End Workflow Architecture)](#3-กระบวนการทำงานแบบครบวงจร)
4. [สถาปัตยกรรมทางเทคนิคและโมเดล Gemini (Technical & AI Architecture)](#4-สถาปัตยกรรมทางเทคนิคและโมเดล-gemini)
5. [ระบบจัดการไฟล์เสียงแบบแบ่งช่วง 30 นาที (Audio Chunking Gateway)](#5-ระบบจัดการไฟล์เสียงแบบแบ่งช่วง-30-นาที)
6. [ข้อกำหนดการออกแบบ UX/UI (UX/UI Design Specification)](#6-ข้อกำหนดการออกแบบ-uxui)
7. [การเชื่อมต่อคลังความรู้ OneVault (OneVault Knowledge & Fact-Check)](#7-การเชื่อมต่อคลังความรู้-onevault)
8. [ระบบนำเข้าและส่งออกข้อมูล (Data Hub: Import & Export Specification)](#8-ระบบนำเข้าและส่งออกข้อมูล)
9. [คู่มือการนำ Framework ไปพัฒนาซ้ำ (Reusable Framework & Implementation Guide)](#9-คู่มือการนำ-framework-ไปพัฒนาซ้ำ)
10. [ความปลอดภัย การคุ้มครองข้อมูลชีวมิติเสียง และจริยธรรม (Security & Biometric Compliance)](#10-ความปลอดภัย-การคุ้มครองข้อมูลชีวมิติเสียง)

---

## 1. บทนำและวิสัยทัศน์ของระบบ

### 1.1 วิสัยทัศน์ (Vision)
**Nextwaver AI Meeting Team** เปลี่ยนนิยามของ AI ในห้องประชุม จากเดิมที่เป็นเพียง *"เครื่องมือบันทึกเสียงและถอดเทปแบบ Passive"* ให้กลายเป็น **"สมาชิกทีม AI ร่วมประชุมจริง (Active AI Team Member)"** ที่สามารถ:
- รับฟังเสียง 360 องศาภายในห้องประชุม
- ระบุตัวผู้พูดได้อย่างแม่นยำ (Speaker Identification & Diarization)
- เชื่อมโยงบริบท วาระการประชุม (Agenda) แผนงาน (Milestones) และสัญญาข้อตกลงใน **OneVault**
- เข้าร่วมสนทนาเมื่อถูกเรียกถาม (Direct Address)
- **ยกมือขออนุญาตเสนอความคิดเห็นเชิงรุก (Proactive Hand-Raising Intervention)** เมื่อพบความเสี่ยงหรือข้อมูลขัดแย้ง โดยอยู่ภายใต้การควบคุมสิทธิ์ของประธานการประชุม (Floor Control) อย่างเคร่งครัด

### 1.2 ปัญหาหลักที่ระบบแก้ไข (Core Problems Solved)
1. **ปัญหาการระบุผู้พูดผิดพลาด (Misattribution Problem)**: หาก AI ไม่รู้จักเสียงของสมาชิกแต่ละคนตั้งแต่ก่อนเริ่มประชุม จะทำให้การสรุปมติ มอบหมายงาน และวิเคราะห์ความรับผิดชอบผิดพลาดทั้งระบบ
2. **ปัญหาข้อจำกัดของไฟล์เสียงยาว (Long-audio Diarization Limitation)**: บริการ Audio Diarization (เช่น Gemini 3.5 Transcribe) มีข้อจำกัดความยาวไฟล์ต่อคำขอที่ 30 นาที ระบบจึงต้องมีกลไก Chunking อัตโนมัติ
3. **ปัญหา AI แทรกแซงตามอำเภอใจ (Uncontrolled AI Chatter)**: ป้องกันไม่ให้ AI พูดสอดแทรกมนุษย์ด้วยระบบ Policy Engine และ Floor Control ที่ต้องได้รับการอนุมัติจากประธาน

---

## 2. ผู้มีส่วนได้ส่วนเสียและบทบาทหน้าที่

### 2.1 มนุษย์ในห้องประชุม (Human Stakeholders)
| บทบาท | หน้าที่หลัก | อำนาจในระบบ |
|---|---|---|
| **Chairman (ประธานในที่ประชุม)** | ควบคุมการประชุม เปิด-ปิดวาระ ขอมติ | มีสิทธิ์อนุมัติ/พัก/ปฏิเสธคำขอยกมือพูดของ AI (Intervention Floor Control) และยืนยันมติสุดท้าย |
| **Project Manager (เช่น คุณภูวกฤต)** | รายงานความคืบหน้า แผนงาน กำหนดส่งมอบ (Milestones) | ให้ข้อมูลความคืบหน้า รับมอบหมาย Action Items |
| **System Architect (เช่น คุณกำธร)** | เสนอสถาปัตยกรรมระบบ โครงสร้างคลาวด์ เทคนิควิศวกรรม | ประเมิน Feasibility, SLA และต้นทุนโครงสร้างพื้นฐาน |
| **QA / Documentation (เช่น คุณนวพร)** | รายงานผลทดสอบ คุณภาพ ความปลอดภัย และเอกสารรับรอง | ยืนยันผล Security Audit, PenTest และรับรองเอกสาร |
| **Meeting Administrator** | ดูแลอุปกรณ์ไมค์ 360°, ตรวจสอบผล Diarization | แก้ไขชื่อผู้พูดหากระบบระบุผิด (Diarization Correction) |

### 2.2 บทบาทของทีม AI Multi-Agent (AI Personas)
| Agent Name | บทบาทและหน้าที่ | โมเดล Gemini | เสียงสังเคราะห์ (TTS Voice) |
|---|---|---|---|
| **AI Moderator** | ควบคุมระเบียบวาระ รักษาเวลา จัดสรรคิวผู้พูด เตือนเมื่อเวลาใกล้หมด | `gemini-3.8-flash` / `gemini-3.8-live` | `Puck` (ทางการ มั่นคง ชัดเจน) |
| **AI Analyst** | วิเคราะห์ผลกระทบเชิงกลยุทธ์ ประเมินความเสี่ยง ชั่งน้ำหนักข้อดี-ข้อเสีย (Trade-offs) | `gemini-3.8-flash` | `Charon` (สุขุม นุ่มลึก มีหลักการ) |
| **AI Fact-Check** | ตรวจสอบข้อเท็จจริง ตัวเลข และสัญญาเทียบกับคลัง **OneVault** แบบเรียลไทม์ | `gemini-3.8-flash` | `Fenrir` (แม่นยำ เด็ดขาด ตรงประเด็น) |
| **AI Secretary** | บันทึกประเด็นสำคัญ สรุปมติที่เห็นชอบ แจกแจง Action Items และ Parking Lot | `gemini-3.8-flash` | `Kore` (สุภาพ อ่อนโยน มีโครงสร้าง) |

### 2.3 RACI Matrix สำหรับการประชุม Nextwaver
| กิจกรรม / หน้าที่ | ประธาน | ผู้เข้าร่วมประชุม | AI Moderator | AI Analyst / Fact-Check | AI Secretary |
|---|---|---|---|---|---|
| เช็คอินและลงทะเบียนเสียง (Voice Enrollment) | **A** | **R** | **R** | **I** | **I** |
| การอนุญาตให้ AI ยกมือพูด (Floor Control) | **A** | **C** | **C** | **R** | **I** |
| การถอดเสียงและจับคู่ผู้พูด (Diarization) | **I** | **C** (แก้ชื่อได้) | **I** | **I** | **A/R** |
| การตรวจสอบข้อเท็จจริงกับ OneVault | **I** | **I** | **I** | **A/R** | **I** |
| การรับรองมติและส่งออกรายงาน | **A** | **C** | **C** | **I** | **R** |

*(R = Responsible, A = Accountable, C = Consulted, I = Informed)*

---

## 3. กระบวนการทำงานแบบครบวงจร (End-to-End Workflow)

```
[Phase 1: Pre-Meeting]
  ├── 1. โหลดรายชื่อผู้เข้าร่วมประชุม (Pre-Meeting Roster)
  ├── 2. AI Moderator ทักทายห้องประชุม & ขอความยินยอมไมโครโฟน
  ├── 3. Name Callout: เรียกชื่อทีละท่านแนะนำตัว
  ├── 4. Voice Sample Capture: บันทึกเสียงสั้น 3.5 วินาที
  ├── 5. Voice Embedding: สกัด Pitch, Cadence, SNR, Fingerprint ID
  └── 6. Review & Edit: ประธานยืนยันรายชื่อครบถ้วน
            │
            ▼
[Phase 2: Live Meeting & 360° Listening]
  ├── 360° Array Audio Capture + AEC + VAD + Noise Reduction
  ├── Direction of Arrival (DOA Beam 0° - 360°) หันหาผู้พูด
  ├── Gemini 3.5 Live Stream Diarization & Transcription
  ├── Audio Chunk Gateway: บันทึกแบ่งช่วงละ 30 นาทีอัตโนมัติ
  └── Real-time Diarization Correction (ผู้ใช้กดแก้ชื่อผู้พูดได้)
            │
            ▼
[Phase 3: Multi-Agent Analysis & Intelligent Participation]
  ├── Case A: Direct Address (มีผู้เรียกถาม AI) ──> AI ตอบกลับด้วยเสียง Gemini TTS ทันที
  └── Case B: Proactive Hand-Raising ──> Fact-Check ตรวจพบข้อมูลขัดแย้ง OneVault
        ├── เล่นเสียง Chime ยกมือ + ส่งคำขอไปยังประธาน
        ├── ประธานตัดสินใจ: [อนุญาตให้พูด] / [พักไว้ก่อน] / [ข้ามไป]
        └── หากอนุญาต ──> AI เสนอข้อสังเกตด้วยเสียง Gemini TTS + บันทึกลง Feed
            │
            ▼
[Phase 4: Post-Meeting & Intelligence Synthesis]
  ├── AI Secretary & Gemini สร้างมติการประชุม (Minutes Extraction)
  │     ├── Executive Summary
  │     ├── Approved Resolutions
  │     ├── Action Items (Owner, Deadline, Priority)
  │     └── Parking Lot / Unresolved Issues
  └── Data Hub: ส่งออก Markdown (.md), CSV, JSON, SRT และสั่งพิมพ์รายงาน
```

---

## 4. สถาปัตยกรรมทางเทคนิคและโมเดล Gemini

### 4.1 ตารางการคัดเลือกโมเดล (Gemini Model Selection Architecture)
| งานในระบบ | โมเดลที่เลือกใช้ | ช่องทางการเรียกใช้ | เหตุผล |
|---|---|---|---|
| **สนทนาสดและตอบคำถาม** | `gemini-3.8-flash` / `gemini-3.8-live` | Server-Side Express API (`/api/gemini/chat`) | ตอบสนองรวดเร็ว ภาษาไทยสละสลวย ควบคุม System Prompt ได้เสถียร |
| **ถอดเสียงแบบสตรีม** | `gemini-3.5-transcribe-live` | Audio Gateway WebSocket / MediaStream | ถอดเสียงข้อความแบบ Real-time พร้อม Timestamps |
| **แยกผู้พูดจากไฟล์เสียง (Diarization)** | `gemini-3.5-transcribe` | Batch Chunk API (จำกัด 30 นาที/ไฟล์) | แยกผู้พูดได้สูงสุด 8 คน พร้อมสร้าง Timestamps ช่วงเวลา |
| **เสียงสังเคราะห์ AI (TTS)** | `gemini-3.8-flash-lite-tts` | Server-Side Express API (`/api/gemini/tts`) | ส่งคืนไฟล์เสียง WAV 24kHz Mono คุณภาพสูงแบบ Real-time |
| **สรุปมติและถอด Action Items** | `gemini-3.8-flash` | Structured JSON Schema (`/api/gemini/minutes`) | สกัดข้อมูลตาม Type Schema ที่แม่นยำ ไม่หลุดโครงสร้าง |

### 4.2 สถาปัตยกรรมเซิร์ฟเวอร์แบบ Full-Stack
- **Runtime**: Node.js + Express (ทำงานผ่าน `server.ts` และรันด้วย `tsx server.ts`)
- **Vite Dev Middleware**: เมาท์ Vite dev server เข้ากับ Express ในโหมดพัฒนา เพื่อความรวดเร็วและเป็นไปตามข้อกำหนดความปลอดภัยของ AI Studio
- **API Security**: คีย์ `GEMINI_API_KEY` ถูกเก็บเป็นความลับบน Server-Side เท่านั้น ไม่มีการเปิดเผยไปยัง Frontend Bundle
- **User-Agent Header**: กำหนด `User-Agent: aistudio-build` ในการเรียกใช้ `@google/genai` ตามมาตรฐาน telemetry

---

## 5. ระบบจัดการไฟล์เสียงแบบแบ่งช่วง 30 นาที (Audio Chunking Gateway)

### 5.1 ปัญหาและข้อจำกัด (Constraints)
- โมเดลถอดเสียงแบบแยกผู้พูด (`gemini-3.5-transcribe`) มีข้อจำกัดทางสถาปัตยกรรม: **จำกัดความยาวไฟล์เสียงไม่เกิน 30 นาทีต่อหนึ่งคำขอ**
- หากไฟล์เสียงยาวต่อเนื่องหลายชั่วโมง เสี่ยงต่อการสูญหายเมื่อเครือข่ายขัดข้อง และมีภาระหน่วยความจำสูง

### 5.2 การออกแบบระบบ Chunking
```
[00:00:00] ──> บันทึก Chunk 1 ──> [00:30:00] ครบ 30 นาที
                                     ├── บันทึก Part 1 (CHUNK-01.wav ~ 28.8 MB)
                                     ├── ส่ง Diarization & Transcription
                                     └── Auto-Rotate เริ่ม Chunk 2 (CHUNK-02.wav) ทันที
```
- **ค่าเริ่มต้น (Default Threshold)**: 30 นาที (1,800 วินาที)
- **ตัวเลือกการปรับตั้งค่า**: 5 นาที (สำหรับทดสอบ), 15 นาที, 30 นาที, 45 นาที, 60 นาที
- **ปุ่มบังคับตัดช่วง (Force Rotate Now)**: สำหรับกรณีที่ประธานต้องการจบวาระและตัดรอบบันทึกเสียงทันที
- **Metadata ที่บันทึกต่อ Chunk**:
  - `id`: รหัสช่วงเสียง (เช่น `CHUNK-01`, `CHUNK-02`)
  - `timeRangeStr`: ช่วงเวลา (เช่น `00:00 - 30:00`)
  - `fileSizeMb`: ขนาดไฟล์ประมาณการ
  - `diarizationConfidence`: ค่าความแม่นยำเฉลี่ยของการระบุผู้พูด (%)
  - `speakersDetected`: รายชื่อผู้พูดที่ตรวจพบในรอบนั้น
  - `utteranceCount`: จำนวนประโยคที่บันทึกได้
  - ปุ่ม **Download Chunk** และปุ่ม **Re-Diarize** สำหรับตรวจสอบซ้ำ

---

## 6. ข้อกำหนดการออกแบบ UX/UI (UX/UI Design Specification)

### 6.1 Design Constitution & Anti-AI Slop Rules
- **Executive Dark Palette**: เน้นพื้นหลัง Dark Slate (`#020617`, `#0f172a`, `#1e293b`) พร้อมเส้นขอบคมชัดแบบ Sub-surface (`border-slate-800/80`)
- **Zero Generic Pills**: หลีกเลี่ยงปุ่มลูกกวาดมนกลมไร้ความหมาย ทุก Element มีกรอบโครงสร้างและหน้าที่การใช้งานที่ชัดเจน
- **ความแม่นยำเชิงตัวเลข (High Data Density)**: หน้าจอต้องแสดงสถานะเทคโนโลยีอย่างโปร่งใส เช่น องศา Beamforming (0°–360°), ค่า SNR dB, ความแม่นยำ % Match, เวลาจับเวลา Chunk

### 6.2 ชุดสีมาตรฐาน (Color Palette System)
| สี | รหัส HEX | ความหมาย / การใช้งาน |
|---|---|---|
| **Primary Accent (Indigo)** | `#6366f1` / `#4f46e5` | ตัวตนระบบ Nextwaver, ปุ่มหลัก, แถบสถานะระบบ |
| **Acoustic & VAD (Cyan)** | `#06b6d4` / `#22d3ee` | สัญญาณเสียงไมค์สด, Beamforming Radar, Diarization % |
| **Approval & Verified (Emerald)** | `#10b981` / `#059669` | ผู้เข้าร่วมที่ยืนยันเสียงแล้ว, มติที่ผ่านการเห็นชอบ, สถานะ AEC |
| **Intervention & Floor Control (Amber)** | `#f59e0b` / `#d97706` | สัญญาณ AI ยกมือขอพูด, ประเด็นที่ยังไม่ได้ข้อยุติ (Parking Lot) |
| **Mic Live & Critical Alert (Rose)** | `#f43f5e` / `#e11d48` | ไมโครโฟนจริงกำลังบันทึกสด, ข้อขัดแย้งสัญญาขั้นวิกฤต |

### 6.3 ระบบตัวพิมพ์ (Typography Hierarchy)
- **ฟอนต์หลัก**: `Plus Jakarta Sans` (สำหรับ UI ภาษาอังกฤษ ตัวเลข และสัญลักษณ์เทคนิค)
- **ฟอนต์ภาษาไทย**: `Prompt` (สระลอยคมชัด อ่านง่าย เป็นทางการและทันสมัย)
- **ฟอนต์โค้ดและตัวเลข**: `JetBrains Mono` (สำหรับ Timestamp, Fingerprint ID, องศา DOA, ตัวเลขงบประมาณ)

### 6.4 รายละเอียดหน้าจอหลัก 5 ส่วน (Component Hierarchy)

#### 1. Meeting Header (แถบควบคุมระดับบน)
- แสดงชื่อแอป Nextwaver AI Meeting Team พร้อม Badge `Gemini Live 3.8`
- นาฬิกาจับเวลาการประชุมแบบ Real-time
- สวิตช์สลับแท็บ 5 มุมมอง: `ห้องประชุม 360°`, `Check-in เสียง`, `แบ่งช่วงเสียง 30m`, `มติ & สรุปผล`, `OneVault`
- ปุ่มลัด **Data Hub (นำเข้า/ส่งออก)**
- สัญญาณไฟแสดงสถานะ Gemini TTS แบบสด (`🔊 Gemini TTS: Puck`)
- ปุ่มเปิด-ปิดไมโครโฟนจริง (Physical Mic Live with AEC)

#### 2. Pre-Meeting Check-in & Voice Enrollment
- แถบสรุป 6 ขั้นตอนของ Workflow
- การ์ดรายชื่อผู้เข้าร่วมประชุม (0/3 ยืนยัน) พร้อมประโยคแนะนำตัวจำลอง
- ปุ่ม **"AI ทักทายห้องประชุม"** และปุ่ม **"AI เชิญแนะนำตัวทีละท่าน"**
- สเปกตรัมแสดงคลื่นเสียงขณะบันทึก (Audio Waveform Visualizer)
- การ์ดแสดงผล Voice Profile (Pitch Band, Cadence, SNR dB, Fingerprint ID)
- กล่อง Modal สำหรับเพิ่มผู้เข้าร่วมใหม่และแก้ไขชื่อ

#### 3. 360° Room Listening Visualizer
- โต๊ะประชุมวงกลม 360° แสดงมุมที่นั่งของผู้เข้าร่วมแต่ละท่าน
- หน่วยประมวลผลไมโครโฟนตรงกลาง (360° Array Unit) พร้อม Radar Beam Sweep หมุนชี้ไปยังองศาของผู้พูดอัตโนมัติ
- วงแหวนเสียงเรืองแสง (Audio Glow Halo) กระพริบรอบตัวผู้ที่กำลังพูด
- แถบแสดงสถานะทีม AI 4 ตน (Moderator, Analyst, Fact-Check, Secretary)
- **แถบแจ้งเตือนประธาน (Chairman Alert Banner)**: เด้งขึ้นอัตโนมัติเมื่อ AI ยกมือ พร้อมปุ่ม `[ประธานอนุญาตให้พูด]`

#### 4. Live Transcript Stream & Diarization Feed
- สตรีมบทสนทนาแสดงชื่อผู้พูด ตำแหน่ง เวลา และคะแนน % Diarization Match
- ปุ่ม **"แก้ชื่อผู้พูด (Correct Speaker)"** ในทุกข้อความ เพื่อให้ผู้ใช้สลับผู้พูดได้ทันทีหากระบบจำแนกผิด
- ช่องค้นหาข้อความ และตัวกรองแยกตามผู้พูดหรือ AI
- ช่องพิมพ์ข้อความร่วมประชุม พร้อมปุ่มไมโครโฟนพูดสด (Web Speech API Recognition)

#### 5. Audio Chunk Gateway Manager
- แสดงแถบ Progress Bar ความยาวช่วงเสียงปัจจุบันเทียบกับเป้าหมาย 30 นาที
- สวิตช์ตั้งค่าความยาวช่วงเสียง (5, 15, 30, 45, 60 นาที)
- ปุ่ม **"ตัดช่วงบันทึกตอนนี้"** สำหรับทดสอบการตัดช่วงทันที
- ประวัติการแบ่งไฟล์ (Part 1, Part 2, ...) พร้อมขนาดไฟล์ MB และปุ่มดาวน์โหลด

#### 6. Meeting Intelligence Summary & Data Hub Modal
- **Executive Summary**: สรุปภาพรวมและประเด็นสำคัญ
- **Approved Resolutions**: การ์ดแสดงมติที่ได้รับอนุมัติพร้อมประธานรับรอง
- **Action Items Table**: ตารางงาน ผู้รับผิดชอบ กำหนดส่ง ระดับความสำคัญ และปุ่มสลับสถานะ
- **Parking Lot**: รายการประเด็นที่ยังถกเถียงไม่จบ
- ปุ่ม **"AI สรุปมติสดใหม่"** วิเคราะห์บทสนทนาปัจจุบันผ่าน Gemini
- หน้าต่าง **Data Hub Modal**: รองรับ Export (Markdown, CSV, JSON, SRT, Print HTML) และ Import (ข้อความ, JSON, หรือ 1-Click Scenario ตัวอย่าง)

---

## 7. การเชื่อมต่อคลังความรู้ OneVault (OneVault Knowledge & Fact-Check)

### 7.1 โครงสร้างข้อมูลเอกสารใน OneVault
```json
{
  "id": "OV-SOW-2026",
  "title": "SOW-2026: Statement of Work & Project Milestones",
  "category": "Contract",
  "lastUpdated": "2026-09-28",
  "snippet": "ข้อตกลงการส่งมอบ Milestone 2 ระบุวันที่สิ้นสุดภายในสัปดาห์ที่ 42",
  "content": "เอกสารสัญญาว่าจ้างพัฒนาแพลตฟอร์ม... เงื่อนไขปรับล่าช้าวันละ 0.1%...",
  "tags": ["สัญญา", "Milestone", "กำหนดส่งมอบ", "SOW"]
}
```

### 7.2 กลไกการตรวจสอบข้อเท็จจริง (Fact-Checking Logic)
1. เมื่อมีผู้พูดในที่ประชุม AI จะส่งข้อความไปยัง Endpoint `/api/gemini/fact-check`
2. ระบบดึงเอกสารที่เกี่ยวข้องใน OneVault มาเป็น Grounding Context
3. หากผู้พูดกล่าวข้อมูลที่ขัดแย้ง (เช่น เสนอเลื่อนส่งมอบเกินสัปดาห์ที่ 42):
   - ระบบตั้งสถานะ `status: "CONFLICT"`
   - กำหนด `shouldRaiseHand: true`
   - สร้างข้อความทักท้วงที่สุภาพ: *"ขออนุญาตเตือนที่ประชุมครับ เอกสารสัญญา SOW-2026 ใน OneVault ระบุส่งมอบสัปดาห์ที่ 42..."*
   - ส่งเสียง Chime สองโทน (Soft Marimba D5 -> A5)
   - ส่งคำขอไปยังประธานเพื่อรอการอนุมัติให้พูด

---

## 8. ระบบนำเข้าและส่งออกข้อมูล (Data Hub Specification)

### 8.1 รูปแบบไฟล์ที่รองรับการส่งออก (Export Matrix)
| รูปแบบ | นามสกุล | การใช้งานหลัก | ข้อมูลที่รวมอยู่ |
|---|---|---|---|
| **Executive Markdown** | `.md` | นำขึ้น GitHub / GitLab / Notion / Wiki | บทสรุป, มติทั้งหมด, ตารางงาน, Parking Lot, บทสนทนาเต็ม |
| **Transcript CSV** | `.csv` | เปิดใน Excel หรือ Google Sheets | Timestamp, Speaker Name, Role, % Match, IsAI, Utterance Text |
| **Action Items CSV** | `.csv` | นำเข้า Jira / Asana / ClickUp | Task ID, Description, Assignee, Due Date, Priority, Status |
| **OneVault Package** | `.json` | จัดเก็บถาวรในฐานข้อมูล OneVault | โครงสร้างสมบูรณ์รวม Participants, Agendas, Minutes, Chunks |
| **Subtitles** | `.srt` | ใช้ตัดต่อวิดีโอหรือเสียงบันทึกการประชุม | Timestamps ช่วงเวลา และคำบรรยายระบุชื่อผู้พูด |
| **Printable Report** | `.html` | สั่งพิมพ์กระดาษหรือบันทึกเป็น PDF ทางการ | หน้าเอกสารมีหัวกระดาษบริษัท ตารางทางการ และเส้นลงนามประธาน |

### 8.2 รูปแบบการนำเข้า (Import Specification)
- **JSON File Import**: รับไฟล์ `.json` ที่มีโครงสร้าง `transcript` หรืออาเรย์ข้อความ
- **Text File / Paste Import**: รองรับข้อความธรรมดาในรูปแบบ:
  ```text
  ภูวกฤต: สวัสดีครับทุกคน วันนี้เริ่มพิจารณา Sprint 24
  กำธร: สถาปัตยกรรมพร้อมแล้วครับ แต่อยากเสนอเรื่องงบประมาณ
  นวพร: ทีม QA รายงานผลการทดสอบเรียบร้อยค่ะ
  ```
- **1-Click Sample Scenarios**:
  - *Scenario 1: Sprint 24 & Milestone 2 SOW Dispute*
  - *Scenario 2: Cloud Infrastructure & Incident Post-Mortem*
  - *Scenario 3: Budget Planning & Gemini Live Allocation*
- **Auto-Analyze Checkbox**: เมื่อติ๊กเลือก ระบบจะส่งบทสนทนาที่เพิ่งนำเข้าไปประมวลผลผ่าน `generateMeetingMinutes()` เพื่อสร้างมติและแจกแจงงานอัตโนมัติทันที

---

## 9. คู่มือการนำ Framework ไปพัฒนาซ้ำ (Reusable Framework Guide)

### 9.1 โครงสร้างโฟลเดอร์สำหรับโครงการใหม่ (Clean Architecture)
```
/
├── server.ts                       # Backend Express & Gemini Proxy Endpoints
├── index.html                      # HTML Entry point พร้อมฟอนต์และ Meta Tags
├── package.json                    # Dependencies & Scripts ("dev": "tsx server.ts")
├── metadata.json                   # Metadata & Server-side Gemini API capability
├── vite.config.ts                  # Vite build tool configuration
└── src/
    ├── main.tsx                    # React Root bootstrap
    ├── App.tsx                     # Main Meeting Orchestrator Container
    ├── index.css                   # Tailwind CSS global styles
    ├── types/
    │   └── meeting.ts              # Type definitions (Participants, Chunks, Agents, Minutes)
    ├── data/
    │   └── mockData.ts             # Initial personas, agendas, OneVault documents
    ├── services/
    │   ├── audioService.ts         # Web Audio API, Chimes, Mic capture, TTS player
    │   └── geminiService.ts        # Client calls to server /api/gemini endpoints
    └── components/
        ├── MeetingHeader.tsx       # Navigation bar, timers, global mic & TTS toggles
        ├── PreMeetingEnrollment.tsx# 6-step Check-in & Voice Enrollment flow
        ├── RoomVisualizer360.tsx   # 360° Conference table, DOA radar beam, table seats
        ├── LiveTranscriptFeed.tsx  # Streaming transcript with Confidence Heatmap (<90% red highlight) and manual speaker verification
        ├── MultiAgentHub.tsx       # 4 Agent personas, floor control, agenda manager
        ├── AudioChunkManager.tsx   # 30-min chunk rotation, status, chunk downloads
        ├── OneVaultDrawer.tsx      # OneVault repository search & document viewer
        ├── MeetingIntelligenceSummary.tsx # Resolutions, Action Items table, Parking Lot
        ├── SimulationControls.tsx  # Quick interactive scenario buttons
        ├── EvidenceCitationModal.tsx # Side-by-side OneVault clause comparison
        ├── HelpManualModal.tsx     # In-app user manual & mermaid architecture viewer
        └── DataImportExportModal.tsx # Multi-format export & import data hub
```

### 9.2 ขั้นตอนการนำไปปรับใช้ในระบบจริง (Production Deployment)
1. **การเชื่อมต่อไมโครโฟนฮาร์ดแวร์จริง (Physical Hardware Deployment)**:
   - เสียบไมโครโฟนประชุมรอบทิศทาง USB (เช่น Jabra Speak, Yealink, หรือ ReSpeaker Array) เข้ากับเครื่องคอมพิวเตอร์ในห้องประชุม
   - ระบบของเบราว์เซอร์จะขอสิทธิ์เข้าถึงไมโครโฟนผ่าน `AudioContext` พร้อมเปิด `echoCancellation: true` และ `noiseSuppression: true` อัตโนมัติ
2. **การรันในสภาพแวดล้อม Docker LAN**:
   - สามารถแปลง `server.ts` เป็น Node.js Container เพื่อรันในเครือข่ายภายในองค์กรหรือ Edge Server (เช่น DGX Spark / Linux Server)
   - กำหนดค่าสิ่งแวดล้อม `GEMINI_API_KEY` ใน Environment Secret ของเซิร์ฟเวอร์
3. **การเปลี่ยนชื่อโครงการและผู้เข้าร่วม**:
   - แก้ไขรายชื่อใน `src/data/mockData.ts` หรือนำเข้ารายชื่อผ่านหน้าจอ Check-in UI ได้โดยตรงโดยไม่ต้องแก้โค้ด

---

## 10. ความปลอดภัย การคุ้มครองข้อมูลชีวมิติเสียง และจริยธรรม

1. **การยินยอมการประมวลผลเสียง (Biometric Audio Consent)**:
   - ในขั้นตอนที่ 2 ของการเช็คอิน AI Moderator ต้องกล่าวแจ้งต่อที่ประชุมอย่างชัดเจนว่าจะมีการประมวลผลเสียงและแยกแยะผู้พูด
2. **การจัดเก็บข้อมูลเสียง (Data Retention Policy)**:
   - ค่า Voice Profile และ Fingerprint ID (`SPK-TH-xxxx`) ที่สร้างขึ้นในขั้นตอนเช็คอิน ถูกกำหนดให้เป็น **โปรไฟล์ชั่วคราวประจำรอบการประชุม (Session-scoped Profile)** เพื่อไม่ให้เก็บข้อมูลชีวมิติเสียงถาวรโดยไม่จำเป็น
3. **การรักษาความลับของสัญญา OneVault**:
   - เอกสารสัญญาทั้งหมดถูกประมวลผลผ่านโมเดล Gemini ฝั่งเซิร์ฟเวอร์ที่มีการเข้ารหัส Transit & Rest
4. **ความโปร่งใสของ AI (AI Transparency)**:
   - ทุกครั้งที่ AI พูดหรือยกมือ จะต้องแสดงชื่อ Agent และระบุเหตุผลหรือเอกสารอ้างอิงทุกครั้ง เพื่อให้ประธานและมนุษย์ในห้องประชุมสามารถตรวจสอบย้อนกลับได้เสมอ

---
*เอกสารนี้จัดทำขึ้นสำหรับโครงการ **Nextwaver AI Meeting Team** เวอร์ชัน 1.0 เพื่อใช้เป็นมาตรฐานทางวิศวกรรมและการออกแบบ UI/UX สำหรับการพัฒนาและต่อยอดระบบในอนาคต*
