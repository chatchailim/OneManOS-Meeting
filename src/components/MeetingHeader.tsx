import React from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  Sparkles,
  Users,
  FileText,
  Database,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Scissors,
  ArrowUpDown,
  FileAudio,
  HelpCircle,
} from 'lucide-react';
import { Audio360Metrics } from '../types/meeting';

interface MeetingHeaderProps {
  meetingTitle: string;
  meetingState: 'pre_meeting' | 'in_progress' | 'adjourned';
  activeTab: 'room' | 'enrollment' | 'chunks' | 'intelligence' | 'onevault';
  setActiveTab: (tab: 'room' | 'enrollment' | 'chunks' | 'intelligence' | 'onevault') => void;
  audioMetrics: Audio360Metrics;
  isTtsEnabled: boolean;
  setIsTtsEnabled: (val: boolean) => void;
  isMicActive: boolean;
  toggleMicrophone: () => void;
  confirmedCount: number;
  totalParticipants: number;
  pendingInterventionsCount: number;
  onStartMeeting: () => void;
  onEndMeeting: () => void;
  onResetMeeting: () => void;
  meetingTimeStr: string;
  onOpenDataModal: () => void;
  onOpenHelpModal: () => void;
  ttsLiveStatus?: { active: boolean; engine: string; voice: string } | null;
  chunkCount: number;
}

export const MeetingHeader: React.FC<MeetingHeaderProps> = ({
  meetingTitle,
  meetingState,
  activeTab,
  setActiveTab,
  audioMetrics,
  isTtsEnabled,
  setIsTtsEnabled,
  isMicActive,
  toggleMicrophone,
  confirmedCount,
  totalParticipants,
  pendingInterventionsCount,
  onStartMeeting,
  onEndMeeting,
  onResetMeeting,
  meetingTimeStr,
  onOpenDataModal,
  onOpenHelpModal,
  ttsLiveStatus,
  chunkCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-6 py-3 text-slate-100">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand & Meeting Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 shadow-lg shadow-indigo-500/20 text-white font-black tracking-wider">
            NW
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base md:text-lg tracking-tight text-white flex items-center gap-2">
                Nextwaver AI Meeting Team
                <span className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                  Gemini Live 3.8
                </span>
              </h1>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="text-slate-200 font-medium">{meetingTitle}</span>
              <span>•</span>
              <span className="flex items-center gap-1 font-mono text-indigo-300 bg-slate-800/80 px-2 py-0.5 rounded">
                ⏱ {meetingTimeStr}
              </span>
              <span>•</span>
              <span
                className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                  meetingState === 'in_progress'
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                    : meetingState === 'pre_meeting'
                    ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                {meetingState === 'in_progress' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                )}
                {meetingState === 'in_progress'
                  ? 'กำลังประชุมสด (Live 360°)'
                  : meetingState === 'pre_meeting'
                  ? `ลงทะเบียนเสียง (${confirmedCount}/${totalParticipants})`
                  : 'ปิดการประชุมแล้ว'}
              </span>

              {/* Real-time Gemini TTS Pill */}
              {ttsLiveStatus?.active && (
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-500/40 animate-pulse">
                  <Volume2 className="w-3 h-3 text-purple-400 animate-bounce" />
                  Gemini TTS ({ttsLiveStatus.voice})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center bg-slate-950/70 p-1 rounded-xl border border-slate-800/80 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('room')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all font-medium whitespace-nowrap ${
              activeTab === 'room'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>ห้องประชุม 360°</span>
            {pendingInterventionsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold animate-bounce">
                {pendingInterventionsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('enrollment')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all font-medium whitespace-nowrap ${
              activeTab === 'enrollment'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Check-in ({confirmedCount}/{totalParticipants})</span>
          </button>

          <button
            onClick={() => setActiveTab('chunks')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all font-medium whitespace-nowrap ${
              activeTab === 'chunks'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
            title="จัดการการแบ่งช่วงไฟล์เสียงบันทึก (ช่วงละ 30 นาที)"
          >
            <Scissors className="w-3.5 h-3.5 text-cyan-400" />
            <span>แบ่งช่วงเสียง 30m</span>
            {chunkCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded bg-slate-800 text-[10px] font-mono text-cyan-300">
                {chunkCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('intelligence')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all font-medium whitespace-nowrap ${
              activeTab === 'intelligence'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>มติ & สรุปผล</span>
          </button>

          <button
            onClick={() => setActiveTab('onevault')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all font-medium whitespace-nowrap ${
              activeTab === 'onevault'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>OneVault</span>
          </button>
        </div>

        {/* Global Controls & Audio Hardware Status */}
        <div className="flex items-center gap-2">
          {/* Data Hub: Import & Export Trigger */}
          <button
            onClick={onOpenDataModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/40 text-indigo-300 text-xs font-semibold shadow transition cursor-pointer"
            title="นำเข้า / ส่งออก ข้อมูลบทสนทนาและรายงาน"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" />
            <span>Data Hub (นำเข้า/ส่งออก)</span>
          </button>

          {/* In-App Help & Manual Viewer */}
          <button
            onClick={onOpenHelpModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-semibold shadow transition cursor-pointer"
            title="เปิดคู่มือการใช้งานระบบและแผนผัง Mermaid"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>Help (คู่มือ)</span>
          </button>

          {/* AI Voice Toggle */}
          <button
            onClick={() => setIsTtsEnabled(!isTtsEnabled)}
            title={isTtsEnabled ? 'ปิดเสียงตอบกลับ AI' : 'เปิดเสียงตอบกลับ AI (Gemini TTS)'}
            className={`p-2 rounded-lg border transition-colors ${
              isTtsEnabled
                ? 'bg-indigo-950/60 border-indigo-500/40 text-indigo-300 hover:bg-indigo-900/60'
                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            {isTtsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Physical Mic Live Toggle */}
          <button
            onClick={toggleMicrophone}
            title={isMicActive ? 'ปิดไมโครโฟนจริง' : 'เปิดไมโครโฟนห้องประชุมจริง'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              isMicActive
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 hover:bg-rose-500/30'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {isMicActive ? (
              <>
                <Mic className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span>ไมค์สด ON</span>
              </>
            ) : (
              <>
                <MicOff className="w-3.5 h-3.5 text-slate-400" />
                <span>ไมค์สด</span>
              </>
            )}
          </button>

          {/* Start / End Meeting Trigger */}
          {meetingState === 'pre_meeting' ? (
            <button
              onClick={onStartMeeting}
              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>เริ่มการประชุม</span>
            </button>
          ) : meetingState === 'in_progress' ? (
            <button
              onClick={onEndMeeting}
              className="flex items-center gap-1.5 bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow transition-all cursor-pointer"
            >
              <span>ปิดประชุม / สรุปมติ</span>
            </button>
          ) : (
            <button
              onClick={onResetMeeting}
              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-2.5 py-1.5 rounded-lg transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>เริ่มใหม่</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
