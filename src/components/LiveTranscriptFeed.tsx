import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Send,
  Edit2,
  Check,
  Search,
  Filter,
  Sparkles,
  Volume2,
  AlertTriangle,
  UserCheck,
  ChevronDown,
  Flame,
  Activity,
  CheckCircle2,
  HelpCircle,
  Eye,
} from 'lucide-react';
import { TranscriptItem, Participant, AIAgent } from '../types/meeting';
import { audioService } from '../services/audioService';

interface LiveTranscriptFeedProps {
  transcript: TranscriptItem[];
  participants: Participant[];
  agents: AIAgent[];
  onAddTranscriptItem: (text: string, speakerId: string) => void;
  onCorrectSpeaker: (transcriptId: string, newSpeakerId: string) => void;
  onVerifySpeaker?: (transcriptId: string) => void;
  isMicActive: boolean;
  onToggleMic: () => void;
  onOpenCitation?: (oneVaultRef: string, claimantQuote?: string, reason?: string) => void;
}

export const LiveTranscriptFeed: React.FC<LiveTranscriptFeedProps> = ({
  transcript,
  participants,
  agents,
  onAddTranscriptItem,
  onCorrectSpeaker,
  onVerifySpeaker,
  isMicActive,
  onToggleMic,
  onOpenCitation,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<string>(
    participants[0]?.id || 'spk-01'
  );
  const [editingTranscriptId, setEditingTranscriptId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSpeaker, setFilterSpeaker] = useState<string>('all');
  const [filterLowConfidenceOnly, setFilterLowConfidenceOnly] = useState<boolean>(false);
  const [hoveredHeatmapIndex, setHoveredHeatmapIndex] = useState<number | null>(null);
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);
  const [calibrationToast, setCalibrationToast] = useState<string | null>(null);
  const feedEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of live stream if not manually navigating
  useEffect(() => {
    if (!highlightedItemId) {
      feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcript.length, highlightedItemId]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    onAddTranscriptItem(inputText.trim(), selectedSpeakerId);
    setInputText('');
  };

  // Identify low-confidence items (<90% and not yet manually verified/corrected)
  const lowConfidenceItems = transcript.filter(
    (item) => item.confidence < 90 && !item.isVerified && !item.isCorrected
  );

  const avgConfidence =
    transcript.length > 0
      ? (
          transcript.reduce((acc, item) => acc + (item.confidence || 95), 0) / transcript.length
        ).toFixed(1)
      : '100';

  const filteredTranscript = transcript.filter((item) => {
    const matchesSearch =
      item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.speakerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpeaker =
      filterSpeaker === 'all'
        ? true
        : filterSpeaker === 'ai'
        ? item.isAI
        : item.speakerId === filterSpeaker;
    const matchesLowConfidence = filterLowConfidenceOnly
      ? item.confidence < 90 && !item.isVerified && !item.isCorrected
      : true;

    return matchesSearch && matchesSpeaker && matchesLowConfidence;
  });

  const allPossibleSpeakers = [
    ...participants.map((p) => ({ id: p.id, name: p.name, role: p.role, isAI: false })),
    ...agents.map((a) => ({ id: a.id, name: a.name, role: a.roleTitle, isAI: true })),
  ];

  const handleHeatmapItemClick = (item: TranscriptItem) => {
    setHighlightedItemId(item.id);
    const element = document.getElementById(`transcript-item-${item.id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setTimeout(() => {
      setHighlightedItemId(null);
    }, 2800);
  };

  return (
    <div className="bg-slate-900/80 rounded-2xl border border-slate-800 flex flex-col h-[540px] shadow-2xl overflow-hidden">
      {/* Feed Header */}
      <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white text-sm flex items-center gap-2">
            <span>บทสนทนาสด & ถอดเสียงระบุผู้พูด</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              Gemini 3.5 Transcribe Live
            </span>
          </span>
          <span className="text-slate-400">({transcript.length} ข้อความ)</span>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาข้อความ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 rounded-lg pl-8 pr-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-28 sm:w-36"
            />
          </div>

          <select
            value={filterSpeaker}
            onChange={(e) => setFilterSpeaker(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">ผู้พูดทั้งหมด</option>
            <option value="ai">AI Agents</option>
            {participants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Confidence Heatmap Visualization Bar */}
      <div className="bg-slate-950/90 border-b border-slate-800/80 px-3.5 py-2.5">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-slate-200 font-semibold text-xs">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Confidence Heatmap (Diarization Precision)</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
              เฉลี่ย {avgConfidence}%
            </span>
          </div>

          {/* Quick Heatmap Status & Low-Confidence Filter Toggle */}
          <div className="flex items-center gap-2">
            {lowConfidenceItems.length > 0 ? (
              <button
                onClick={() => setFilterLowConfidenceOnly(!filterLowConfidenceOnly)}
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border transition flex items-center gap-1 cursor-pointer ${
                  filterLowConfidenceOnly
                    ? 'bg-rose-500 text-white border-rose-400 shadow-sm shadow-rose-500/50'
                    : 'bg-rose-950/60 text-rose-300 border-rose-500/50 hover:bg-rose-900/60 animate-pulse'
                }`}
                title="คลิกเพื่อสลับแสดงเฉพาะข้อความที่ความมั่นใจต่ำกว่า 90%"
              >
                <AlertTriangle className="w-3 h-3 text-rose-400" />
                <span>
                  {filterLowConfidenceOnly
                    ? `แสดงทั้งหมด (ล้างตัวกรอง)`
                    : `⚠️ พบ ${lowConfidenceItems.length} รายการ <90% (คลิกเพื่อกรอง)`}
                </span>
              </button>
            ) : (
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>ความแม่นยำทุกช่วง ≥90%</span>
              </span>
            )}
          </div>
        </div>

        {/* Heatmap Continuous Timeline Strip */}
        <div className="relative">
          <div className="flex items-center gap-1 h-3.5 w-full bg-slate-900/90 p-0.5 rounded-md border border-slate-800 overflow-hidden">
            {transcript.length === 0 ? (
              <div className="w-full text-[10px] text-slate-500 text-center leading-none">
                รอข้อมูลเสียงสำหรับการคำนวณ Heatmap
              </div>
            ) : (
              transcript.map((item, idx) => {
                const isLow = item.confidence < 90 && !item.isVerified && !item.isCorrected;
                const isVerified = item.isVerified || item.isCorrected;
                const isSelected = highlightedItemId === item.id;

                let colorClasses = 'bg-emerald-500/80 hover:bg-emerald-400 border-emerald-600';
                if (isLow) {
                  colorClasses =
                    'bg-rose-500 hover:bg-rose-400 border-rose-300 shadow-sm shadow-rose-500 animate-pulse';
                } else if (isVerified) {
                  colorClasses = 'bg-teal-400 hover:bg-teal-300 border-teal-200';
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => handleHeatmapItemClick(item)}
                    onMouseEnter={() => setHoveredHeatmapIndex(idx)}
                    onMouseLeave={() => setHoveredHeatmapIndex(null)}
                    title={`#${idx + 1} ${item.speakerName} (${item.confidence}%) - ${item.timestamp}`}
                    className={`h-full flex-1 min-w-[8px] max-w-[32px] rounded-xs border transition-all duration-200 cursor-pointer ${colorClasses} ${
                      isSelected ? 'ring-2 ring-white scale-110 z-10' : ''
                    }`}
                  />
                );
              })
            )}
          </div>

          {/* Heatmap Tooltip info display */}
          {hoveredHeatmapIndex !== null && transcript[hoveredHeatmapIndex] && (
            <div className="absolute top-5 left-1/2 -translate-x-1/2 z-20 bg-slate-900 border border-slate-700 shadow-xl rounded-lg px-2.5 py-1 text-[11px] text-white flex items-center gap-2 pointer-events-none whitespace-nowrap">
              <span className="font-semibold text-slate-200">
                {transcript[hoveredHeatmapIndex].speakerName}
              </span>
              <span className="text-slate-400">({transcript[hoveredHeatmapIndex].timestamp})</span>
              <span
                className={`font-mono font-bold px-1.5 py-0.2 rounded text-[10px] ${
                  transcript[hoveredHeatmapIndex].confidence < 90 &&
                  !transcript[hoveredHeatmapIndex].isVerified &&
                  !transcript[hoveredHeatmapIndex].isCorrected
                    ? 'bg-rose-950 text-rose-300 border border-rose-500'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-500'
                }`}
              >
                {transcript[hoveredHeatmapIndex].confidence}% match
              </span>
              <span className="text-slate-400 text-[10px]">
                {transcript[hoveredHeatmapIndex].confidence < 90 &&
                !transcript[hoveredHeatmapIndex].isVerified &&
                !transcript[hoveredHeatmapIndex].isCorrected
                  ? '⚠️ ต้องยืนยันผู้พูด (คลิกเพื่อกระโดดไปดู)'
                  : '✓ คลิกเพื่อไปยังข้อความ'}
              </span>
            </div>
          )}
        </div>

        {/* Heatmap Legend */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-xs bg-emerald-500 inline-block"></span>
              <span>≥ 90% แม่นยำสูง (เขียว)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-xs bg-rose-500 inline-block animate-pulse"></span>
              <span className="text-rose-300 font-semibold">&lt; 90% เสี่ยงระบุผิด (ไฮไลต์แดง)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-xs bg-teal-400 inline-block"></span>
              <span>ยืนยัน/แก้ไขแล้ว</span>
            </span>
          </div>
          <span className="text-slate-500 italic hidden sm:inline">
            คลิกที่ช่องเพื่อเลื่อนไปยังจุดที่ต้องตรวจสอบ
          </span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 divide-y divide-slate-800/40">
        {filteredTranscript.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs py-8">
            <AlertTriangle className="w-6 h-6 text-slate-600 mb-2" />
            <p>ไม่พบข้อความในเงื่อนไขการค้นหา/ตัวกรองปัจจุบัน</p>
            {filterLowConfidenceOnly && (
              <button
                onClick={() => setFilterLowConfidenceOnly(false)}
                className="mt-2 text-indigo-400 underline hover:text-indigo-300 cursor-pointer"
              >
                แสดงข้อความทั้งหมด
              </button>
            )}
          </div>
        ) : (
          filteredTranscript.map((item) => {
            const isEditing = editingTranscriptId === item.id;
            const isLowConfidence =
              item.confidence < 90 && !item.isVerified && !item.isCorrected;
            const isHighlighted = highlightedItemId === item.id;

            return (
              <div
                key={item.id}
                id={`transcript-item-${item.id}`}
                className={`pt-3.5 first:pt-0 group transition-all duration-300 ${
                  isHighlighted ? 'ring-2 ring-amber-400 rounded-xl p-3 bg-amber-950/20' : ''
                } ${
                  isLowConfidence
                    ? 'border-2 border-rose-500/70 bg-gradient-to-r from-rose-950/40 via-rose-950/20 to-slate-900/50 shadow-lg shadow-rose-950/40 rounded-xl p-3 my-2'
                    : item.isAI
                    ? 'bg-indigo-950/20 -mx-2 px-3 py-2.5 rounded-xl border border-indigo-500/20'
                    : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Speaker Avatar / Badge */}
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white shadow-sm ${
                        isLowConfidence
                          ? 'bg-rose-600 shadow-rose-600/50'
                          : item.isAI
                          ? 'bg-indigo-600 shadow-indigo-500/50'
                          : 'bg-slate-700'
                      }`}
                    >
                      {item.speakerName.slice(0, 1)}
                    </div>

                    <span className="font-bold text-xs text-white">
                      {item.speakerName}
                    </span>

                    <span className="text-[10px] text-slate-400 font-mono">
                      {item.speakerRole}
                    </span>

                    {/* Diarization Confidence Badge - Highlighted in RED if <90% */}
                    {isLowConfidence ? (
                      <span className="text-[10px] text-rose-200 bg-rose-950 border border-rose-500 px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1 shadow-sm shadow-rose-900/50">
                        <AlertTriangle className="w-3 h-3 text-rose-400 animate-pulse" />
                        <span>⚠️ Diarization: {item.confidence}% (&lt;90%)</span>
                      </span>
                    ) : item.isVerified ? (
                      <span className="text-[10px] text-teal-300 bg-teal-950/50 border border-teal-600/50 px-2 py-0.5 rounded font-mono flex items-center gap-1">
                        <Check className="w-3 h-3 text-teal-400" />
                        <span>ยืนยันผู้พูดแล้ว ({item.confidence}%)</span>
                      </span>
                    ) : item.isCorrected ? (
                      <span className="text-[10px] text-amber-300 bg-amber-950/50 border border-amber-600/50 px-2 py-0.5 rounded font-mono flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-amber-400" />
                        <span>แก้ไขผู้พูดแล้ว ({item.confidence}%)</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-1.5 py-0.2 rounded font-mono">
                        {item.confidence}% match
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-mono">{item.timestamp}</span>

                    {/* Speaker Re-assign / Correction button */}
                    <button
                      onClick={() =>
                        setEditingTranscriptId(isEditing ? null : item.id)
                      }
                      title="แก้ไขผู้พูด (Correct Speaker Diarization)"
                      className="opacity-0 group-hover:opacity-100 transition text-[11px] text-slate-400 hover:text-indigo-300 flex items-center gap-1 bg-slate-800 px-1.5 py-0.5 rounded cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>แก้ชื่อผู้พูด</span>
                    </button>
                  </div>
                </div>

                {/* Speaker reassignment picker dropdown */}
                {isEditing && (
                  <div className="mb-2 p-2 bg-slate-950 border border-indigo-500/50 rounded-lg flex items-center gap-2 text-xs">
                    <span className="text-slate-400 text-[11px]">เปลี่ยนเป็น:</span>
                    <select
                      onChange={(e) => {
                        onCorrectSpeaker(item.id, e.target.value);
                        setEditingTranscriptId(null);
                        const newSpk = allPossibleSpeakers.find((s) => s.id === e.target.value);
                        setCalibrationToast(
                          `แก้ไขผู้พูดเป็น "${newSpk?.name || 'ผู้พูด'}" และปรับเทียบชีวมิติเสียงอัตโนมัติ (+4.2%)`
                        );
                        setTimeout(() => setCalibrationToast(null), 3000);
                      }}
                      defaultValue={item.speakerId}
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                    >
                      {allPossibleSpeakers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.role})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => setEditingTranscriptId(null)}
                      className="text-slate-400 hover:text-white text-xs ml-auto cursor-pointer"
                    >
                      ยกเลิก
                    </button>
                  </div>
                )}

                {/* Utterance Text */}
                <p
                  className={`text-sm leading-relaxed pl-8 ${
                    isLowConfidence ? 'text-rose-100 font-medium' : 'text-slate-200'
                  }`}
                >
                  {item.text}
                </p>

                {/* PROMPT CALLOUT FOR LOW CONFIDENCE (<90%): Prompt users to manually verify */}
                {isLowConfidence && (
                  <div className="mt-2.5 ml-8 p-2.5 rounded-lg bg-rose-950/80 border border-rose-500/60 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-sm">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-rose-200 flex items-center gap-1.5">
                          <span>ความเชื่อมั่นต่ำกว่าเกณฑ์ 90% (ตรวจพบ {item.confidence}%)</span>
                          <span className="text-[10px] bg-rose-900 text-rose-300 px-1 rounded">
                            ต้องตรวจสอบ
                          </span>
                        </div>
                        <p className="text-[11px] text-rose-300/80 mt-0.5">
                          เสียงผู้พูดอาจมีการทับซ้อนหรือระยะไมค์ไม่ชัดเจน โปรดยืนยันผู้พูดด้วยตนเองเพื่อความถูกต้องของรายงาน
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => {
                          if (onVerifySpeaker) {
                            onVerifySpeaker(item.id);
                          } else {
                            onCorrectSpeaker(item.id, item.speakerId);
                          }
                          setCalibrationToast(
                            `ยืนยันผู้พูด "${item.speakerName}" สำเร็จ — อัปเดตความมั่นใจเป็น 99.2%`
                          );
                          setTimeout(() => setCalibrationToast(null), 3000);
                        }}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-[11px] font-bold flex items-center gap-1 shadow transition cursor-pointer"
                        title="ยืนยันว่าผู้พูดนี้ถูกต้องตามระบบตรวจจับ"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>ยืนยันผู้พูดนี้</span>
                      </button>
                      <button
                        onClick={() => setEditingTranscriptId(isEditing ? null : item.id)}
                        className="px-2.5 py-1 bg-rose-900/80 hover:bg-rose-800 border border-rose-400 text-rose-100 rounded-md text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                        title="เปลี่ยนเป็นผู้พูดท่านอื่น"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>เปลี่ยนผู้พูด</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* OneVault Citation Tags */}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pl-8 pt-1.5">
                    {item.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-[10px] bg-indigo-950/50 border border-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-md font-mono"
                      >
                        <span>{tag}</span>
                        {tag.includes('DOC-') && (
                          <button
                            onClick={() =>
                              onOpenCitation &&
                              onOpenCitation(tag, item.text)
                            }
                            className="underline text-indigo-200 hover:text-white cursor-pointer ml-1 font-sans"
                            title="เปิดตรวจเอกสารใน OneVault"
                          >
                            [ตรวจสัญญา]
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={feedEndRef} />
      </div>

      {/* Adaptive Voice Calibration Toast Notification */}
      {calibrationToast && (
        <div className="mx-3 mb-2 p-2 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center justify-between animate-fadeIn">
          <span className="flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{calibrationToast}</span>
          </span>
          <button
            onClick={() => setCalibrationToast(null)}
            className="text-emerald-400 hover:text-white text-xs px-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Input & Control Bar */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 bg-slate-950/90 border-t border-slate-800 flex items-center gap-2"
      >
        {/* Speaker Selector */}
        <div className="relative shrink-0">
          <select
            value={selectedSpeakerId}
            onChange={(e) => setSelectedSpeakerId(e.target.value)}
            className="appearance-none bg-slate-900 border border-slate-700 rounded-xl pl-3 pr-7 py-2 text-xs font-semibold text-indigo-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            {participants.map((p) => (
              <option key={p.id} value={p.id}>
                👤 {p.name} ({p.role})
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Text Input */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="พิมพ์ข้อความในที่ประชุม (หรือเปิดไมค์พูดสด)..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />

        {/* Real Mic speech trigger */}
        <button
          type="button"
          onClick={onToggleMic}
          title={isMicActive ? 'ปิดไมค์สด' : 'เปิดไมค์สดเพื่อพูด'}
          className={`p-2.5 rounded-xl border transition cursor-pointer ${
            isMicActive
              ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse'
              : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
          }`}
        >
          <Mic className="w-4 h-4" />
        </button>

        {/* Send message button */}
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition shadow-md cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
