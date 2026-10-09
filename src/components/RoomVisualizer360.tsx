import React from 'react';
import {
  Mic,
  Activity,
  Shield,
  Search,
  FileText,
  LineChart,
  Radio,
  Hand,
  Volume2,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import {
  Participant,
  AIAgent,
  Audio360Metrics,
  InterventionRequest,
} from '../types/meeting';

interface RoomVisualizer360Props {
  participants: Participant[];
  agents: AIAgent[];
  activeSpeakerId: string | null;
  audioMetrics: Audio360Metrics;
  pendingInterventions: InterventionRequest[];
  onParticipantClickToSpeak: (p: Participant) => void;
  onApproveIntervention: (intervention: InterventionRequest) => void;
  currentAgendaTitle: string;
  onOpenCitation?: (oneVaultRef: string, claimantQuote?: string, reason?: string) => void;
  consensusScore?: number;
}

export const RoomVisualizer360: React.FC<RoomVisualizer360Props> = ({
  participants,
  agents,
  activeSpeakerId,
  audioMetrics,
  pendingInterventions,
  onParticipantClickToSpeak,
  onApproveIntervention,
  currentAgendaTitle,
  onOpenCitation,
  consensusScore = 85,
}) => {
  // Find currently active speaker
  const activeSpeaker = participants.find((p) => p.id === activeSpeakerId);
  const activeAgentSpeaker = agents.find((a) => a.id === activeSpeakerId);

  // Calculate total speech count for airtime distribution
  const totalTurns = participants.reduce((sum, p) => sum + Math.max(1, p.speechCount || 0), 0);

  // Underrepresented participant check
  const underrepresented = participants.find((p) => {
    const share = Math.round((Math.max(1, p.speechCount || 0) / totalTurns) * 100);
    return share < 20;
  });

  // Calculate beam angle based on active speaker
  const [manualSteerAngle, setManualSteerAngle] = React.useState<number | null>(null);

  const beamAngle =
    manualSteerAngle !== null
      ? manualSteerAngle
      : activeSpeaker
      ? activeSpeaker.seatAngle
      : activeAgentSpeaker
      ? 180
      : audioMetrics.activeMicAngle;

  const pendingIntervention = pendingInterventions[0];

  return (
    <div className="relative bg-slate-900/80 rounded-2xl border border-slate-800 p-6 overflow-hidden shadow-2xl flex flex-col items-center justify-center min-h-[460px]">
      {/* Background Radial Grid and Acoustic Waves */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-950/20 via-slate-950/80 to-slate-950 pointer-events-none" />
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Top Header inside visualizer */}
      <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3 relative z-10 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 font-semibold border border-indigo-500/20">
            <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            360° Conference Table & Beamforming Array
          </span>
          <span className="text-slate-400 hidden sm:inline">
            DOA Beam: <strong className="text-indigo-200">{Math.round(beamAngle)}°</strong>
          </span>

          {/* Consensus Gauge Indicator */}
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-[10px]">
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            <span>ฉันทามติ: {consensusScore}% (ใกล้ได้ข้อสรุป)</span>
          </span>
        </div>

        {/* Current Agenda Pill */}
        <div className="text-slate-300 bg-slate-950/80 border border-slate-800/80 px-3 py-1 rounded-lg truncate max-w-[280px]">
          <span className="text-[10px] text-slate-500 uppercase mr-1">วาระ:</span>
          <span className="font-medium text-xs text-indigo-200">{currentAgendaTitle}</span>
        </div>
      </div>

      {/* Interactive 360° DOA Beam Direction Controller */}
      <div className="w-full mb-3 bg-slate-950/70 border border-slate-800/80 rounded-xl px-3 py-2 flex flex-wrap items-center justify-between gap-2 z-10 text-[11px]">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold flex items-center gap-1">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>หมุนลำคลื่นไมค์ (Steer DOA Beam):</span>
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setManualSteerAngle(0)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition cursor-pointer ${
                Math.round(beamAngle) === 0
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              0° เหนือ (ภูวกฤต)
            </button>
            <button
              onClick={() => setManualSteerAngle(120)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition cursor-pointer ${
                Math.round(beamAngle) === 120
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              120° ตะวันออก (กำธร)
            </button>
            <button
              onClick={() => setManualSteerAngle(240)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition cursor-pointer ${
                Math.round(beamAngle) === 240
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              240° ตะวันตก (นวพร)
            </button>
            <button
              onClick={() => setManualSteerAngle(180)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition cursor-pointer ${
                Math.round(beamAngle) === 180
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              180° ใต้ (AI Hub)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="360"
            value={Math.round(beamAngle)}
            onChange={(e) => setManualSteerAngle(parseInt(e.target.value))}
            className="w-24 accent-indigo-500 cursor-pointer"
            title="ปรับหมุนมุมรับเสียง 0-360 องศา"
          />
          <span className="font-mono text-cyan-300 font-bold min-w-[38px] text-right">
            {Math.round(beamAngle)}°
          </span>
          {manualSteerAngle !== null && (
            <button
              onClick={() => setManualSteerAngle(null)}
              className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
            >
              รีเซ็ตออโต้
            </button>
          )}
        </div>
      </div>

      {/* Inclusivity & Airtime Balance Hint */}
      {underrepresented && (
        <div className="w-full mb-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl px-3 py-1.5 flex items-center justify-between text-[11px] text-indigo-300">
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>
              <strong>Airtime Balance:</strong> คุณ{underrepresented.name} มีสัดส่วนการพูดน้อยกว่า 20%
              — AI Moderator แนะนำให้ประธานเปิดโอกาสให้แสดงความคิดเห็น
            </span>
          </span>
          <button
            onClick={() => onParticipantClickToSpeak(underrepresented)}
            className="text-[10px] bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 px-2 py-0.5 rounded border border-indigo-500/40 font-semibold transition cursor-pointer"
          >
            เชิญคุณ{underrepresented.name}พูด
          </button>
        </div>
      )}

      {/* Floating Chairman Alert for AI Hand Raising */}
      {pendingIntervention && (
        <div className="relative z-30 mb-4 w-full max-w-lg bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/90 border-2 border-amber-500/80 rounded-xl p-3 shadow-2xl animate-bounce">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                <Hand className="w-5 h-5 fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-amber-300">
                    {pendingIntervention.agentName} ขออนุญาตเสนอความคิดเห็น
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-200 font-mono">
                    {pendingIntervention.priority.toUpperCase()}
                  </span>
                  {pendingIntervention.oneVaultRef && (
                    <button
                      onClick={() =>
                        onOpenCitation &&
                        onOpenCitation(
                          pendingIntervention.oneVaultRef!,
                          pendingIntervention.content,
                          pendingIntervention.reason
                        )
                      }
                      className="text-[9px] bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 px-1.5 py-0.2 rounded font-mono border border-amber-400/30 underline cursor-pointer"
                      title="คลิกเพื่อตรวจหลักฐานสัญญาฉบับจริงใน OneVault"
                    >
                      🔍 ตรวจสัญญา {pendingIntervention.oneVaultRef}
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-200 line-clamp-1">
                  "{pendingIntervention.content}"
                </p>
              </div>
            </div>

            <button
              onClick={() => onApproveIntervention(pendingIntervention)}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow transition cursor-pointer shrink-0"
            >
              ประธานอนุญาตให้พูด
            </button>
          </div>
        </div>
      )}

      {/* 360° Circular Conference Table Area */}
      <div className="relative w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center z-10">
        {/* Outer Circular Rim */}
        <div className="absolute inset-0 rounded-full border border-slate-800/80 bg-slate-900/40 shadow-inner" />
        <div className="absolute inset-4 rounded-full border border-dashed border-slate-700/50" />
        <div className="absolute inset-14 rounded-full border border-indigo-500/20 bg-slate-950/60" />

        {/* Direction of Arrival (DOA) Radar Beam Sweep */}
        <div
          className="absolute w-full h-full pointer-events-none transition-transform duration-700 ease-out"
          style={{ transform: `rotate(${beamAngle}deg)` }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-40 bg-gradient-to-t from-indigo-500/0 via-indigo-500/10 to-indigo-400/30 rounded-t-full blur-md" />
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-0.5 h-36 bg-gradient-to-t from-indigo-500/20 to-indigo-400 shadow-[0_0_8px_#818cf8]" />
        </div>

        {/* Center 360° Microphone Array Unit */}
        <div className="relative z-20 flex flex-col items-center justify-center w-28 h-28 rounded-full bg-gradient-to-b from-slate-800 to-slate-950 border-2 border-indigo-500/40 shadow-2xl shadow-indigo-950/60 p-2 text-center group">
          {/* Active Audio Pulse Indicator */}
          {audioMetrics.vadDetected && (
            <div className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-ping opacity-60 pointer-events-none" />
          )}

          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
              audioMetrics.vadDetected
                ? 'bg-cyan-500/20 text-cyan-300 ring-2 ring-cyan-400'
                : 'bg-indigo-600/20 text-indigo-400'
            }`}
          >
            <Mic className="w-5 h-5" />
          </div>

          <span className="text-[10px] font-bold text-white tracking-wider mt-1 uppercase">
            360° ARRAY
          </span>
          <span className="text-[9px] font-mono text-cyan-300">
            {audioMetrics.vadDetected ? 'VAD ACTIVE' : 'LISTENING'}
          </span>
        </div>

        {/* Participant Seats around the 360° circle */}
        {participants.map((p, index) => {
          const total = participants.length;
          // Calculate angle for seat on circle (offset by -90 to start top)
          const angleDeg = p.seatAngle !== undefined ? p.seatAngle : (index * 360) / total;
          const angleRad = ((angleDeg - 90) * Math.PI) / 180;
          const radius = 145; // distance from center in px
          const x = Math.cos(angleRad) * radius;
          const y = Math.sin(angleRad) * radius;

          const isSpeaking = activeSpeakerId === p.id;

          return (
            <div
              key={p.id}
              style={{
                transform: `translate(${x}px, ${y}px)`,
              }}
              className="absolute z-20 flex flex-col items-center group cursor-pointer"
              onClick={() => onParticipantClickToSpeak(p)}
              title={`คลิกเพื่อจำลองให้คุณ ${p.name} พูด`}
            >
              {/* Audio glow ring when speaking */}
              {isSpeaking && (
                <div className="absolute -inset-2 rounded-full border-2 border-emerald-400 animate-ping opacity-75" />
              )}

              {/* Avatar Button */}
              <div
                className={`relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr ${p.avatarColor} text-white font-bold text-sm shadow-lg transition-transform transform group-hover:scale-110 ${
                  isSpeaking
                    ? 'ring-4 ring-emerald-400 shadow-emerald-500/50'
                    : 'ring-2 ring-slate-700'
                }`}
              >
                {p.name.slice(0, 1)}

                {/* Verified badge */}
                {p.isConfirmed && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border border-slate-900 rounded-full flex items-center justify-center text-[9px] text-white">
                    ✓
                  </span>
                )}
              </div>

              {/* Name Tag */}
              <div className="mt-1 bg-slate-950/90 border border-slate-800 px-2 py-0.5 rounded text-center whitespace-nowrap shadow-md">
                <p className="text-[11px] font-bold text-white leading-tight">{p.name}</p>
                <div className="flex items-center justify-center gap-1 text-[9px] text-slate-400">
                  <span>{p.role}</span>
                  <span>•</span>
                  <span className="text-cyan-300 font-mono font-semibold">
                    {Math.round((Math.max(1, p.speechCount || 0) / totalTurns) * 100)}% airtime
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Agents Orbit Bar underneath */}
      <div className="w-full mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-around gap-2 z-10 text-xs">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Activity className="w-3.5 h-3.5 text-indigo-400" />
          AI Team Members:
        </span>

        {agents.map((agent) => {
          const isAgentSpeaking = activeSpeakerId === agent.id;
          const isRaisingHand = agent.status === 'raising_hand';

          return (
            <div
              key={agent.id}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
                isAgentSpeaking
                  ? 'bg-indigo-600/30 border-indigo-400 ring-2 ring-indigo-400 shadow-md'
                  : isRaisingHand
                  ? 'bg-amber-500/20 border-amber-500 animate-pulse'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                  agent.type === 'moderator'
                    ? 'bg-indigo-600 text-white'
                    : agent.type === 'analyst'
                    ? 'bg-purple-600 text-white'
                    : agent.type === 'fact_checker'
                    ? 'bg-amber-600 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {agent.avatar}
              </div>

              <div>
                <span className="font-semibold text-white text-xs">{agent.name}</span>
                <span className="text-[10px] text-slate-400 ml-1.5 font-mono">
                  {isAgentSpeaking ? '• SPEAKING' : isRaisingHand ? '• RAISED HAND' : '• ACTIVE'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
