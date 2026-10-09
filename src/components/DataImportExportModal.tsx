import React, { useState } from 'react';
import {
  Download,
  Upload,
  FileText,
  FileSpreadsheet,
  FileCode,
  Printer,
  Sparkles,
  CheckCircle2,
  X,
  Copy,
  Check,
  Database,
  ArrowRight,
  BookOpen,
  Mail,
  Calendar,
} from 'lucide-react';
import {
  TranscriptItem,
  MeetingIntelligence,
  Participant,
  MeetingAgenda,
} from '../types/meeting';

interface DataImportExportModalProps {
  transcript: TranscriptItem[];
  intelligence: MeetingIntelligence;
  participants: Participant[];
  agendas: MeetingAgenda[];
  meetingTitle: string;
  meetingTimeStr: string;
  isOpen: boolean;
  onClose: () => void;
  onImportTranscript: (imported: TranscriptItem[], autoAnalyzeWithAI: boolean) => void;
}

export const DataImportExportModal: React.FC<DataImportExportModalProps> = ({
  isOpen,
  onClose,
  transcript,
  intelligence,
  participants,
  agendas,
  meetingTitle,
  meetingTimeStr,
  onImportTranscript,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'email_draft'>('export');
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [emailCopied, setEmailCopied] = useState(false);
  const [importText, setImportText] = useState('');
  const [autoAnalyze, setAutoAnalyze] = useState(true);
  const [importStatusMessage, setImportStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // EXPORT: JSON
  const handleExportJson = () => {
    const data = {
      meetingTitle,
      meetingTimeStr,
      exportedAt: new Date().toISOString(),
      participants,
      agendas,
      intelligence,
      transcript,
    };
    downloadFile(
      JSON.stringify(data, null, 2),
      `Nextwaver-${meetingTitle.replace(/\s+/g, '_')}-FullPackage.json`,
      'application/json'
    );
  };

  // EXPORT: Transcript CSV
  const handleExportTranscriptCsv = () => {
    const headers = ['Timestamp', 'Speaker', 'Role', 'Confidence', 'IsAI', 'Text'];
    const rows = transcript.map((t) => [
      `"${t.timestamp}"`,
      `"${t.speakerName.replace(/"/g, '""')}"`,
      `"${(t.speakerRole || '').replace(/"/g, '""')}"`,
      `"${t.confidence}%"`,
      `"${t.isAI ? 'YES' : 'NO'}"`,
      `"${t.text.replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadFile(
      csvContent,
      `Nextwaver-Transcript-${new Date().toISOString().slice(0, 10)}.csv`,
      'text/csv;charset=utf-8;'
    );
  };

  // EXPORT: Action Items CSV
  const handleExportActionsCsv = () => {
    const headers = ['ID', 'Task', 'Owner', 'Deadline', 'Priority', 'Status'];
    const rows = intelligence.actionItems.map((a) => [
      `"${a.id}"`,
      `"${a.task.replace(/"/g, '""')}"`,
      `"${a.owner.replace(/"/g, '""')}"`,
      `"${a.deadline.replace(/"/g, '""')}"`,
      `"${a.priority}"`,
      `"${a.status}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadFile(
      csvContent,
      `Nextwaver-ActionItems-${new Date().toISOString().slice(0, 10)}.csv`,
      'text/csv;charset=utf-8;'
    );
  };

  // EXPORT: Subtitle SRT / TXT
  const handleExportSrt = () => {
    const srtLines = transcript.map((t, idx) => {
      return `${idx + 1}\n00:${t.timestamp},000 --> 00:${t.timestamp},999\n[${t.speakerName} (${t.speakerRole})]: ${t.text}\n`;
    });
    downloadFile(srtLines.join('\n'), `Nextwaver-Subtitles.srt`, 'text/plain;charset=utf-8;');
  };

  // EXPORT: Markdown Report
  const handleExportMarkdown = () => {
    const md = `# รายงานมติและผลการวิเคราะห์การประชุม Nextwaver AI Meeting Team
**หัวข้อ:** ${meetingTitle}
**ระยะเวลาการประชุม:** ${meetingTimeStr}
**วันที่:** ${new Date().toLocaleDateString('th-TH')}
**ผู้เข้าร่วมที่ได้รับการยืนยัน:** ${participants.map((p) => `${p.name} (${p.role})`).join(', ')}

---

## 1. บทสรุปผู้บริหาร (Executive Summary)
${intelligence.executiveSummary}

### ประเด็นสำคัญ (Key Takeaways):
${intelligence.keyTakeaways.map((k) => `- ${k}`).join('\n')}

---

## 2. มติที่ประชุมที่ได้รับอนุมัติ (Approved Resolutions)
${intelligence.approvedResolutions
  .map(
    (res, i) =>
      `### ${i + 1}. [${res.id}] ${res.topic} (${res.consensus})\n- **สาระสำคัญ:** ${res.resolution}\n- **ผู้เกี่ยวข้อง:** ${res.stakeholders.join(', ')}`
  )
  .join('\n\n')}

---

## 3. รายการงานและผู้รับผิดชอบ (Action Items)
| ลำดับ | รายการงาน | ผู้รับผิดชอบ | กำหนดส่ง | ความสำคัญ | สถานะ |
|---|---|---|---|---|---|
${intelligence.actionItems
  .map(
    (a) =>
      `| ${a.id} | ${a.task} | ${a.owner} | ${a.deadline} | ${a.priority} | ${a.status} |`
  )
  .join('\n')}

---

## 4. ประเด็นคั่งค้าง / ข้อโต้แย้ง (Parking Lot & Unresolved Issues)
${intelligence.unresolvedItems
  .map((u) => `- **[${u.id}] ${u.issue}**\n  - แนวทางดำเนินการต่อ: ${u.nextStep}`)
  .join('\n')}

---

## 5. บันทึกบทสนทนาฉบับเต็ม (Full Annotated Transcript)
${transcript
  .map((t) => `- **[${t.timestamp}] ${t.speakerName} (${t.speakerRole}):** ${t.text}`)
  .join('\n')}

---
*จัดทำโดย Nextwaver Secretary Agent & Gemini 3.8 Intelligence*
`;

    downloadFile(
      md,
      `Nextwaver-ExecutiveReport-${new Date().toISOString().slice(0, 10)}.md`,
      'text/markdown;charset=utf-8;'
    );
  };

  // Helper download file
  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Trigger HTML Print View
  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printHtml = `
      <!DOCTYPE html>
      <html lang="th">
      <head>
        <meta charset="UTF-8">
        <title>รายงานผลการประชุม - ${meetingTitle}</title>
        <style>
          body { font-family: 'Prompt', -apple-system, sans-serif; line-height: 1.6; padding: 40px; color: #1e293b; }
          h1 { color: #0f172a; border-bottom: 2px solid #6366f1; padding-bottom: 8px; }
          h2 { color: #334155; margin-top: 24px; }
          .meta { color: #64748b; font-size: 13px; margin-bottom: 24px; }
          .box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; font-size: 13px; }
          th { background: #f1f5f9; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; background: #e0e7ff; color: #4338ca; }
        </style>
      </head>
      <body>
        <h1>Nextwaver AI Meeting Team — Executive Minutes</h1>
        <div class="meta">
          <strong>หัวข้อ:</strong> ${meetingTitle} | <strong>ระยะเวลา:</strong> ${meetingTimeStr} | <strong>ผู้เข้าร่วม:</strong> ${participants.map((p) => p.name).join(', ')}
        </div>

        <h2>1. บทสรุปผู้บริหาร (Executive Summary)</h2>
        <div class="box">${intelligence.executiveSummary}</div>

        <h2>2. มติที่ประชุมที่ได้รับอนุมัติ (Approved Resolutions)</h2>
        ${intelligence.approvedResolutions
          .map(
            (r) => `<div class="box">
            <strong>${r.id}: ${r.topic}</strong> (${r.consensus})<br/>
            ${r.resolution}<br/>
            <small>ผู้เกี่ยวข้อง: ${r.stakeholders.join(', ')}</small>
          </div>`
          )
          .join('')}

        <h2>3. รายการงานที่ต้องปฏิบัติ (Action Items)</h2>
        <table>
          <tr><th>ID</th><th>งาน</th><th>ผู้รับผิดชอบ</th><th>กำหนดส่ง</th><th>ความสำคัญ</th></tr>
          ${intelligence.actionItems
            .map(
              (a) =>
                `<tr><td>${a.id}</td><td>${a.task}</td><td>${a.owner}</td><td>${a.deadline}</td><td>${a.priority}</td></tr>`
            )
            .join('')}
        </table>

        <h2>4. ประเด็นคั่งค้าง (Parking Lot)</h2>
        ${intelligence.unresolvedItems
          .map((u) => `<div class="box"><strong>${u.id}: ${u.issue}</strong><br/>${u.nextStep}</div>`)
          .join('')}
      </body>
      </html>
    `;

    printWindow.document.write(printHtml);
    printWindow.document.close();
    printWindow.print();
  };

  // Preset Sample Scenarios for 1-Click Import
  const handleLoadSampleScenario = (sampleType: 'sprint24' | 'incident' | 'budget') => {
    let sampleTranscript: TranscriptItem[] = [];

    if (sampleType === 'sprint24') {
      sampleTranscript = [
        {
          id: 'imp-01',
          timestamp: '10:00:10',
          speakerId: 'spk-01',
          speakerName: 'ภูวกฤต',
          speakerRole: 'Project Manager',
          text: 'ยินดีต้อนรับทุกท่านครับ วันนี้เราจะมาสรุปความพร้อมส่งมอบ Milestone 2 และการทดสอบระบบก่อนขึ้น Pilot',
          confidence: 98.4,
        },
        {
          id: 'imp-02',
          timestamp: '10:02:15',
          speakerId: 'spk-02',
          speakerName: 'กำธร',
          speakerRole: 'Architect',
          text: 'ส่วนของ API Microservices เสร็จสมบูรณ์แล้ว แต่เราพบข้อจำกัดเรื่อง Cloud Budget จึงขอเสนอเลื่อนไปส่งมอบในสัปดาห์ที่ 46',
          confidence: 96.1,
        },
        {
          id: 'imp-03',
          timestamp: '10:03:40',
          speakerId: 'agent-fact',
          speakerName: 'AI Fact-Check',
          speakerRole: 'OneVault Knowledge Audit',
          text: 'ขออนุญาตประธานครับ เอกสาร OneVault SOW-2026 ระบุว่าเดดไลน์สิ้นสุดสัปดาห์ที่ 42 การเลื่อนไปสัปดาห์ที่ 46 จะมีเงื่อนไขปรับตามสัญญาครับ',
          confidence: 99.8,
          isAI: true,
        },
        {
          id: 'imp-04',
          timestamp: '10:05:00',
          speakerId: 'spk-03',
          speakerName: 'นวพร',
          speakerRole: 'QA / Documentation',
          text: 'ทีม QA พร้อมเร่งทดสอบ Penetration Test ให้จบภายในสัปดาห์ที่ 41 เพื่อให้ส่งมอบทันสัปดาห์ที่ 42 ตามสัญญาเดิมค่ะ',
          confidence: 97.5,
        },
      ];
    } else if (sampleType === 'incident') {
      sampleTranscript = [
        {
          id: 'imp-11',
          timestamp: '14:00:00',
          speakerId: 'spk-02',
          speakerName: 'กำธร',
          speakerRole: 'Architect',
          text: 'สรุปเหตุการณ์ Incident เมื่อวานนี้ สาเหตุเกิดจาก Database Connection Pool เต็ม ทำให้ Response Time พุ่งสูง',
          confidence: 97.8,
        },
        {
          id: 'imp-12',
          timestamp: '14:02:30',
          speakerId: 'spk-01',
          speakerName: 'ภูวกฤต',
          speakerRole: 'Project Manager',
          text: 'เราได้ทำการขยาย Pool Size ชั่วคราวแล้ว แต่ต้องมีมาตรการถาวรเพื่อป้องกันไม่ให้เกิดซ้ำใน Production',
          confidence: 96.5,
        },
        {
          id: 'imp-13',
          timestamp: '14:04:10',
          speakerId: 'agent-ana',
          speakerName: 'AI Analyst',
          speakerRole: 'Strategic & Risk Evaluation',
          text: 'จากการวิเคราะห์เชิงเทคนิค แนะนำให้เพิ่ม Redis Caching Layer ด้านหน้าเพื่อลด Query โหลดลง 60% โดยใช้งบประมาณคลาวด์เพิ่มเพียง $400 ต่อเดือนครับ',
          confidence: 99.1,
          isAI: true,
        },
        {
          id: 'imp-14',
          timestamp: '14:06:00',
          speakerId: 'spk-03',
          speakerName: 'นวพร',
          speakerRole: 'QA / Documentation',
          text: 'เห็นชอบค่ะ และทีม QA จะจัดทำ Stress Test script จำลอง Concurrent User 10,000 คน ก่อนปล่อยอัปเดตค่ะ',
          confidence: 98.2,
        },
      ];
    } else {
      sampleTranscript = [
        {
          id: 'imp-21',
          timestamp: '11:00:00',
          speakerId: 'spk-01',
          speakerName: 'ภูวกฤต',
          speakerRole: 'Project Manager',
          text: 'พิจารณาการจัดสรรงบประมาณไตรมาสถัดไปสำหรับระบบ AI Live Meeting และ OneVault Storage',
          confidence: 97.0,
        },
        {
          id: 'imp-22',
          timestamp: '11:03:00',
          speakerId: 'spk-02',
          speakerName: 'กำธร',
          speakerRole: 'Architect',
          text: 'ขอเสนอตั้งงบสำรองสำหรับการประมวลผล Gemini 3.8 Live API จำนวน $2,500/เดือน เพื่อรองรับการประชุม 100 ชั่วโมง',
          confidence: 96.4,
        },
        {
          id: 'imp-23',
          timestamp: '11:05:00',
          speakerId: 'spk-03',
          speakerName: 'นวพร',
          speakerRole: 'QA / Documentation',
          text: 'สนับสนุนข้อเสนอนี้ค่ะ เนื่องจากช่วยลดเวลาการจัดทำรายงานการประชุมของทีมลงได้กว่า 80%',
          confidence: 98.9,
        },
      ];
    }

    onImportTranscript(sampleTranscript, autoAnalyze);
    setImportStatusMessage(`นำเข้าบทสนทนาตัวอย่างสำเร็จ (${sampleTranscript.length} ข้อความ)`);
    setTimeout(() => {
      setImportStatusMessage(null);
      onClose();
    }, 1200);
  };

  // Parse Text or File upload
  const handleParseAndImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importText.trim()) return;

    try {
      // Check if JSON
      if (importText.trim().startsWith('{') || importText.trim().startsWith('[')) {
        const parsed = JSON.parse(importText);
        const transcriptArray = Array.isArray(parsed)
          ? parsed
          : parsed.transcript || [];

        if (transcriptArray.length > 0) {
          onImportTranscript(transcriptArray, autoAnalyze);
          setImportStatusMessage(`นำเข้าข้อมูล JSON สำเร็จ (${transcriptArray.length} ข้อความ)`);
          setTimeout(() => {
            setImportStatusMessage(null);
            onClose();
          }, 1200);
          return;
        }
      }

      // Plain Text parser (e.g. "ภูวกฤต: ข้อความ...")
      const lines = importText.split('\n').filter((l) => l.trim().length > 0);
      const parsedItems: TranscriptItem[] = lines.map((line, idx) => {
        const parts = line.split(':');
        const speakerName = parts.length > 1 ? parts[0].trim() : 'ผู้เข้าร่วม';
        const text = parts.length > 1 ? parts.slice(1).join(':').trim() : line.trim();

        return {
          id: `imp-${Date.now()}-${idx}`,
          timestamp: new Date().toLocaleTimeString('th-TH', { hour12: false }),
          speakerId: `spk-imp-${idx}`,
          speakerName,
          speakerRole: 'Participant',
          text,
          confidence: 95.0,
        };
      });

      onImportTranscript(parsedItems, autoAnalyze);
      setImportStatusMessage(`นำเข้าบทสนทนาแบบข้อความสำเร็จ (${parsedItems.length} ข้อความ)`);
      setTimeout(() => {
        setImportStatusMessage(null);
        onClose();
      }, 1200);
    } catch (err: any) {
      alert('รูปแบบไฟล์ไม่ถูกต้อง: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                การนำเข้า & ส่งออกเนื้อหาและรายงานการประชุม (Data Hub)
              </h3>
              <p className="text-[11px] text-slate-400">
                รองรับ JSON, Markdown, CSV (Excel), Subtitles และพิมพ์รายงานสรุปผล
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-4 pt-2">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition ${
              activeTab === 'export'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>ส่งออกรายงานและข้อมูล (Export Reports)</span>
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition ${
              activeTab === 'import'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>นำเข้าบทสนทนา & วิเคราะห์มติ (Import & Analyze)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {importStatusMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs text-center font-bold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{importStatusMessage}</span>
            </div>
          )}

          {activeTab === 'export' ? (
            <div className="space-y-4">
              <p className="text-xs text-slate-300">
                เลือกรูปแบบรายงานที่ต้องการดาวน์โหลดหรือส่งต่อไปยังระบบอื่น:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* 1. Markdown Minutes */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-indigo-500/40 transition">
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center gap-2 font-bold text-white">
                      <FileText className="w-4 h-4 text-indigo-400" />
                      <span>1. รายงานมติ Markdown (.md)</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      สรุปผู้บริหาร, มติที่ได้รับอนุมัติ, ตาราง Action Items และ Parking Lot ฉบับเต็ม
                    </p>
                  </div>
                  <button
                    onClick={handleExportMarkdown}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ดาวน์โหลด Markdown</span>
                  </button>
                </div>

                {/* 2. CSV Transcript for Excel */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-indigo-500/40 transition">
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center gap-2 font-bold text-white">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                      <span>2. ตารางบทสนทนา CSV (.csv)</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      เหมาะสำหรับเปิดใน Excel / Google Sheets พร้อม Timestamp, Speaker Name, Role
                    </p>
                  </div>
                  <button
                    onClick={handleExportTranscriptCsv}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ดาวน์โหลด Transcript CSV</span>
                  </button>
                </div>

                {/* 3. Action Items CSV */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-indigo-500/40 transition">
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center gap-2 font-bold text-white">
                      <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                      <span>3. ตาราง Action Items (.csv)</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      รายการงานที่ได้รับมอบหมาย, ผู้รับผิดชอบ, กำหนดส่ง และสถานะ
                    </p>
                  </div>
                  <button
                    onClick={handleExportActionsCsv}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ดาวน์โหลด Action Items CSV</span>
                  </button>
                </div>

                {/* 4. Full JSON Package */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-indigo-500/40 transition">
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center gap-2 font-bold text-white">
                      <FileCode className="w-4 h-4 text-amber-400" />
                      <span>4. แพ็กเกจ OneVault JSON (.json)</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      ข้อมูลครบทุกองค์ประกอบสำหรับการจัดเก็บบน OneVault หรือนำเข้าย้อนหลัง
                    </p>
                  </div>
                  <button
                    onClick={handleExportJson}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ดาวน์โหลด OneVault JSON</span>
                  </button>
                </div>
              </div>

              {/* Print / Subtitle bar */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800">
                <button
                  onClick={handleExportSrt}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ส่งออก Subtitles (.srt)</span>
                </button>

                <button
                  onClick={handlePrintReport}
                  className="flex items-center gap-1.5 text-xs text-indigo-300 hover:text-white px-3 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-500/40 font-bold transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>พิมพ์รายงานผู้บริหาร (Print / PDF)</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Presets */}
              <div className="space-y-2">
                <span className="font-bold text-xs text-slate-300">
                  เลือกบทสนทนาตัวอย่างสำหรับการทดสอบด่วน (1-Click Sample Scenarios):
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleLoadSampleScenario('sprint24')}
                    className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/40 text-left transition cursor-pointer"
                  >
                    <p className="font-bold text-amber-300 text-xs">ตัวอย่าง 1: Sprint 24 & SOW</p>
                    <p className="text-[10px] text-slate-400">
                      มีประเด็นขอเลื่อนส่งมอบขัดแย้งกับสัญญา
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLoadSampleScenario('incident')}
                    className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800/90 border border-slate-800 hover:border-purple-500/40 text-left transition cursor-pointer"
                  >
                    <p className="font-bold text-purple-300 text-xs">ตัวอย่าง 2: Cloud Incident</p>
                    <p className="text-[10px] text-slate-400">
                      ถอดบทเรียน Connection Pool & Redis
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLoadSampleScenario('budget')}
                    className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/40 text-left transition cursor-pointer"
                  >
                    <p className="font-bold text-emerald-300 text-xs">ตัวอย่าง 3: Budget Planning</p>
                    <p className="text-[10px] text-slate-400">
                      การจัดสรรงบประมาณ Gemini 3.8
                    </p>
                  </button>
                </div>
              </div>

              {/* Paste or Custom Input */}
              <form onSubmit={handleParseAndImport} className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">
                    หรือวางข้อความบทสนทนา / ข้อมูล JSON:
                  </label>
                  <textarea
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    rows={5}
                    placeholder={`ตัวอย่าง:\nภูวกฤต: สวัสดีครับทุกคน เริ่มประชุมเรื่องแผนงานไตรมาสนี้\nกำธร: ทางสถาปัตยกรรมระบบพร้อมแล้วครับ\nนวพร: เอกสารการทดสอบเตรียมไว้เรียบร้อยค่ะ`}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoAnalyze}
                      onChange={(e) => setAutoAnalyze(e.target.checked)}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-0"
                    />
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>ให้ AI สรุปมติและสร้างรายงานอัตโนมัติทันทีหลังนำเข้า</span>
                  </label>

                  <button
                    type="submit"
                    disabled={!importText.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow disabled:opacity-50 transition cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>นำเข้าข้อมูลบทสนทนา</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
