import React, { useState } from 'react';
import {
  Users,
  Mic,
  CheckCircle2,
  AlertCircle,
  Play,
  Volume2,
  Plus,
  Edit2,
  Trash2,
  Activity,
  Fingerprint,
  Radio,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Info,
} from 'lucide-react';
import { Participant } from '../types/meeting';
import { enrollVoiceSample } from '../services/geminiService';
import { audioService } from '../services/audioService';

interface PreMeetingEnrollmentProps {
  participants: Participant[];
  setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>;
  onStartMeeting: () => void;
  isTtsEnabled: boolean;
}

export const PreMeetingEnrollment: React.FC<PreMeetingEnrollmentProps> = ({
  participants,
  setParticipants,
  onStartMeeting,
  isTtsEnabled,
}) => {
  const [activeEnrollingId, setActiveEnrollingId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [newParticipantModal, setNewParticipantModal] = useState<boolean>(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [aiGreetingActive, setAiGreetingActive] = useState(false);

  const confirmedCount = participants.filter((p) => p.isConfirmed).length;
  const allConfirmed = confirmedCount === participants.length && participants.length > 0;

  // AI Moderator Announcement
  const triggerAiModeratorIntro = async () => {
    setAiGreetingActive(true);
    const greetingText =
      'สวัสดีครับ ยินดีต้อนรับสู่การประชุม Nextwaver วันนี้ผมจะช่วยรับฟัง จับประเด็น และบันทึกมติ ก่อนเริ่มประชุมขออนุญาตตรวจสอบรายชื่อและเสียงผู้เข้าร่วมทีละท่านครับ';

    audioService.playTone('raise_hand');
    if (isTtsEnabled) {
      await audioService.speakText(greetingText);
    }
    setAiGreetingActive(false);
  };

  // Prompt individual participant to speak
  const promptParticipantEnrollment = async (participant: Participant) => {
    setActiveEnrollingId(participant.id);
    const promptText = `ขอเชิญคุณ${participant.name} แนะนำตัว และบอกหน้าที่ในการประชุมวันนี้ครับ`;

    audioService.playTone('mic_ping');
    if (isTtsEnabled) {
      await audioService.speakText(promptText);
    }
  };

  // Perform Enrollment with Voice Sample
  const handleRecordOrSimulateVoice = async (participant: Participant, isRealMic: boolean) => {
    setIsRecording(true);
    setRecordingSeconds(0);

    let micStarted = false;
    if (isRealMic) {
      micStarted = await audioService.startMicrophone();
    }

    const interval = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);

    // Record for 3.5 seconds
    setTimeout(async () => {
      clearInterval(interval);
      if (micStarted) {
        audioService.stopMicrophone();
      }
      setIsRecording(false);
      setIsProcessing(true);

      const enrollResult = await enrollVoiceSample({
        participantName: participant.name,
        role: participant.role,
        introText: participant.introSampleText || 'สวัสดีครับ พร้อมร่วมประชุมครับ',
      });

      // Update participant with voice profile
      setParticipants((prev) =>
        prev.map((p) =>
          p.id === participant.id
            ? {
                ...p,
                isConfirmed: true,
                voiceProfile: {
                  ...enrollResult.voiceProfile,
                  enrolledAt: new Date().toLocaleTimeString('th-TH'),
                  sampleAudioDurationSec: 3.5,
                },
              }
            : p
        )
      );

      setIsProcessing(false);
      audioService.playTone('enroll_success');

      // AI acknowledges enrollment
      if (isTtsEnabled) {
        await audioService.speakText(
          `ขอบคุณครับ ระบบบันทึกชื่อคุณ${participant.name}เป็นผู้เข้าร่วมแล้ว`
        );
      }
    }, 3500);
  };

  // Add Custom Participant
  const handleAddParticipant = () => {
    if (!newName.trim()) return;

    const newId = `spk-${Date.now().toString().slice(-4)}`;
    const angle = (participants.length * 75) % 360;

    const colors = [
      'from-blue-600 to-indigo-600',
      'from-emerald-600 to-teal-600',
      'from-amber-500 to-orange-600',
      'from-purple-600 to-pink-600',
      'from-cyan-600 to-blue-600',
    ];
    const avatarColor = colors[participants.length % colors.length];

    const newP: Participant = {
      id: newId,
      name: newName.trim(),
      role: newRole.trim() || 'Team Member',
      isConfirmed: false,
      isChairman: false,
      avatarColor,
      seatAngle: angle,
      speechCount: 0,
      introSampleText: `สวัสดีครับ ผม${newName.trim()} พร้อมเข้าร่วมประชุมครับ`,
    };

    setParticipants((prev) => [...prev, newP]);
    setNewName('');
    setNewRole('');
    setNewParticipantModal(false);
  };

  const handleRemoveParticipant = (id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
    if (activeEnrollingId === id) setActiveEnrollingId(null);
  };

  const handleToggleConfirmed = (id: string) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isConfirmed: !p.isConfirmed } : p))
    );
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      {/* Top Banner / Concept Explainer */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Meeting Check-in & Voice Enrollment Workflow</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              ขั้นตอนก่อนเริ่มประชุม: AI ต้องรู้จักและแยกเสียงทุกคนก่อน
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              เพื่อให้ AI และระบบ 360° Conference Diarization สามารถระบุชื่อผู้พูดและผู้รับผิดชอบงานได้อย่างแม่นยำ
              ระบบจะทำการทักทายและลงทะเบียนตัวอย่างเสียงของผู้เข้าร่วมทีละคนเพื่อจับคู่ Speaker ID กับชื่อที่ได้รับการยืนยันแล้ว
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={triggerAiModeratorIntro}
              disabled={aiGreetingActive}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                aiGreetingActive
                  ? 'bg-indigo-600/50 border-indigo-500 text-white animate-pulse'
                  : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200'
              }`}
            >
              <Volume2 className="w-4 h-4 text-indigo-400" />
              <span>{aiGreetingActive ? 'AI กำลังกล่าวทักทาย...' : 'AI ทักทายห้องประชุม'}</span>
            </button>

            <button
              onClick={onStartMeeting}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-lg ${
                allConfirmed
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-emerald-500/25 ring-2 ring-emerald-400/40 cursor-pointer'
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20 cursor-pointer'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{allConfirmed ? 'ประธานยืนยันและเริ่มประชุม' : 'เริ่มประชุม (ข้ามการลงทะเบียน)'}</span>
            </button>
          </div>
        </div>

        {/* 6-Step Workflow Breadcrumb */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-6 gap-2 text-xs">
          {[
            { step: '1', title: 'โหลดรายชื่อ', desc: 'Pre-Meeting Roster' },
            { step: '2', title: 'AI ทักทาย', desc: 'Greeting & Consent' },
            { step: '3', title: 'เรียกขานทีละท่าน', desc: 'Name Callout' },
            { step: '4', title: 'บันทึกเสียง', desc: 'Voice Embedding' },
            { step: '5', title: 'ตรวจสอบ & แก้ไข', desc: 'Review & Edit' },
            { step: '6', title: 'ประธานเริ่มประชุม', desc: 'Active Diarization' },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2 bg-slate-950/50 p-2 rounded-lg border border-slate-800/60"
            >
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-[10px]">
                {item.step}
              </span>
              <div className="truncate">
                <p className="font-medium text-slate-200 truncate">{item.title}</p>
                <p className="text-[10px] text-slate-400 truncate">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Roster & Check-in Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              <span>รายชื่อผู้เข้าร่วมประชุม</span>
            </h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              ยืนยันแล้ว {confirmedCount}/{participants.length} ท่าน
            </span>
          </div>

          <button
            onClick={() => setNewParticipantModal(true)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>เพิ่มผู้เข้าร่วม</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {participants.map((p) => {
            const isEnrolling = activeEnrollingId === p.id;
            return (
              <div
                key={p.id}
                className={`relative rounded-xl p-5 border transition-all ${
                  p.isConfirmed
                    ? 'bg-slate-900/90 border-emerald-500/40 shadow-lg shadow-emerald-950/20'
                    : isEnrolling
                    ? 'bg-slate-900/95 border-indigo-500 shadow-lg shadow-indigo-950/30 ring-1 ring-indigo-500/40'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                      p.isConfirmed
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {p.isConfirmed ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>ยืนยันเสียงแล้ว</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3 text-amber-400" />
                        <span>รอยืนยันเสียง</span>
                      </>
                    )}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleConfirmed(p.id)}
                      title={p.isConfirmed ? 'เปลี่ยนเป็นรอยืนยัน' : 'ยืนยันแบบแมนนวล'}
                      className="p-1 text-slate-400 hover:text-slate-200 transition"
                    >
                      <ShieldCheck className="w-4 h-4" />
                    </button>
                    {participants.length > 1 && (
                      <button
                        onClick={() => handleRemoveParticipant(p.id)}
                        title="ลบผู้เข้าร่วม"
                        className="p-1 text-slate-400 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Participant Info */}
                <div className="flex items-center gap-3.5 mb-4">
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr ${p.avatarColor} text-white font-bold text-lg shadow-md`}
                  >
                    {p.name.slice(0, 1)}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white leading-tight">{p.name}</h4>
                    <p className="text-xs text-slate-400">{p.role}</p>
                    <p className="text-[11px] text-indigo-300 font-mono mt-0.5">
                      มุมโต๊ะประชุม: {p.seatAngle}°
                    </p>
                  </div>
                </div>

                {/* Intro script hint */}
                <div className="bg-slate-950/70 rounded-lg p-2.5 border border-slate-800/80 mb-4 text-xs text-slate-300">
                  <p className="text-[10px] text-slate-400 font-medium uppercase mb-1">
                    ประโยคแนะนำตัว (Sample Script):
                  </p>
                  <p className="italic text-slate-200">
                    "{p.introSampleText || `ผม/ดิฉัน ${p.name} รับผิดชอบตำแหน่ง ${p.role}`}"
                  </p>
                </div>

                {/* Acoustic Profile Result Card */}
                {p.voiceProfile ? (
                  <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-lg p-3 space-y-1.5 text-xs text-slate-300 mb-4">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                        <Fingerprint className="w-3.5 h-3.5" />
                        {p.voiceProfile.speakerFingerprintId}
                      </span>
                      <span className="text-slate-400">
                        แม่นยำ {p.voiceProfile.acousticConfidence}%
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-400">
                      <div>
                        โทนเสียง: <span className="text-slate-200">{p.voiceProfile.pitchBand}</span>
                      </div>
                      <div>
                        SNR: <span className="text-slate-200">{p.voiceProfile.snrDb} dB</span>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Enrollment Action Buttons */}
                <div className="space-y-2">
                  {!isEnrolling ? (
                    <button
                      onClick={() => promptParticipantEnrollment(p)}
                      className="w-full flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700/80 text-indigo-300 text-xs font-semibold py-2 rounded-lg border border-slate-700 transition cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>AI เชิญให้คุณ{p.name}แนะนำตัว</span>
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="p-2 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-indigo-400 animate-spin" />
                        <span>กำลังพร้อมบันทึกเสียงคุณ {p.name}...</span>
                      </div>

                      {isRecording ? (
                        <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/50 text-center space-y-2">
                          <div className="flex items-center justify-center gap-2 text-rose-300 font-semibold text-xs">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                            <span>กำลังฟังและจับคลื่นเสียง ({recordingSeconds}s)...</span>
                          </div>
                          {/* Simulated Waveform bars */}
                          <div className="flex items-center justify-center gap-1 h-6">
                            {[30, 60, 90, 45, 80, 100, 70, 50, 85, 40].map((h, i) => (
                              <div
                                key={i}
                                className="w-1 bg-rose-500 rounded-full transition-all duration-75 animate-pulse"
                                style={{ height: `${Math.max(15, (h * (recordingSeconds + 1)) % 100)}%` }}
                              />
                            ))}
                          </div>
                        </div>
                      ) : isProcessing ? (
                        <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/40 text-center space-y-1">
                          <p className="text-xs text-indigo-300 font-semibold animate-pulse">
                            Gemini กำลังสร้าง Voice Embedding & Fingerprint...
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleRecordOrSimulateVoice(p, true)}
                            className="flex items-center justify-center gap-1 px-2 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow transition cursor-pointer"
                          >
                            <Mic className="w-3.5 h-3.5" />
                            <span>บันทึกไมค์จริง</span>
                          </button>
                          <button
                            onClick={() => handleRecordOrSimulateVoice(p, false)}
                            className="flex items-center justify-center gap-1 px-2 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>ทดสอบเสียงจำลอง</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Participant Modal */}
      {newParticipantModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>เพิ่มผู้เข้าร่วมประชุมใหม่</span>
              </h3>
              <button
                onClick={() => setNewParticipantModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ชื่อ - นามสกุล (หรือชื่อเล่น):
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="เช่น ชัชชัย, อรวรรณ"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ตำแหน่ง / หน้าที่ในการประชุม:
                </label>
                <input
                  type="text"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  placeholder="เช่น Product Owner, Security Officer"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setNewParticipantModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleAddParticipant}
                disabled={!newName.trim()}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition cursor-pointer"
              >
                บันทึกรายชื่อ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
