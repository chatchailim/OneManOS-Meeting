import React, { useState } from 'react';
import {
  Shield,
  LineChart,
  Search,
  FileText,
  Hand,
  MessageSquare,
  Sparkles,
  Volume2,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  BrainCircuit,
  Bot,
} from 'lucide-react';
import {
  AIAgent,
  AgentType,
  InterventionRequest,
  MeetingAgenda,
} from '../types/meeting';

interface MultiAgentHubProps {
  agents: AIAgent[];
  pendingInterventions: InterventionRequest[];
  onApproveIntervention: (intervention: InterventionRequest) => void;
  onDismissIntervention: (interventionId: string) => void;
  onDeferIntervention: (interventionId: string) => void;
  onDirectPromptAgent: (agentType: AgentType, promptText: string) => void;
  isProcessing: boolean;
  agendas: MeetingAgenda[];
  onAdvanceAgenda: (agendaId: string) => void;
  onOpenCitation?: (oneVaultRef: string, claimantQuote?: string, reason?: string) => void;
}

export const MultiAgentHub: React.FC<MultiAgentHubProps> = ({
  agents,
  pendingInterventions,
  onApproveIntervention,
  onDismissIntervention,
  onDeferIntervention,
  onDirectPromptAgent,
  isProcessing,
  agendas,
  onAdvanceAgenda,
  onOpenCitation,
}) => {
  const [selectedAgentType, setSelectedAgentType] = useState<AgentType>('analyst');
  const [directPromptInput, setDirectPromptInput] = useState('');

  const handleAskAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directPromptInput.trim()) return;

    onDirectPromptAgent(selectedAgentType, directPromptInput.trim());
    setDirectPromptInput('');
  };

  const getAgentIcon = (type: AgentType) => {
    switch (type) {
      case 'moderator':
        return <Shield className="w-4 h-4 text-indigo-400" />;
      case 'analyst':
        return <LineChart className="w-4 h-4 text-purple-400" />;
      case 'fact_checker':
        return <Search className="w-4 h-4 text-amber-400" />;
      case 'secretary':
        return <FileText className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Pending Interventions (Chairman Floor Control) */}
      {pendingInterventions.length > 0 && (
        <div className="bg-amber-950/40 border-2 border-amber-500/80 rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                <Hand className="w-4 h-4 fill-current" />
              </div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>AI ยกมือขอแทรกแซง (Proactive Intervention)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                  {pendingInterventions.length} คำขอ
                </span>
              </h3>
            </div>
            <span className="text-xs text-amber-300/80">
              ประธานเป็นผู้มีอำนาจตัดสินใจให้พูดหรือไม่
            </span>
          </div>

          <div className="space-y-2.5">
            {pendingInterventions.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900/90 border border-amber-500/40 rounded-xl p-3.5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-300">
                      {item.agentName}
                    </span>
                    <span className="text-[10px] text-slate-400">• {item.timestamp}</span>
                    {item.oneVaultRef && (
                      <button
                        onClick={() =>
                          onOpenCitation &&
                          onOpenCitation(item.oneVaultRef!, item.content, item.reason)
                        }
                        className="text-[10px] bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-300 px-2 py-0.5 rounded font-mono flex items-center gap-1 cursor-pointer transition"
                        title="คลิกเพื่อตรวจสัญญาฉบับจริงใน OneVault"
                      >
                        <span>🔍 ตรวจหลักฐาน {item.oneVaultRef}</span>
                      </button>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      item.priority === 'critical'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {item.priority}
                  </span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  "{item.content}"
                </p>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400 italic">
                    เหตุผล: {item.reason}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onDismissIntervention(item.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-slate-400 hover:text-white bg-slate-800 transition cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>ข้ามไป</span>
                    </button>
                    <button
                      onClick={() => onDeferIntervention(item.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-amber-300 bg-amber-950/50 hover:bg-amber-900/60 border border-amber-500/30 transition cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>พักไว้ก่อน</span>
                    </button>
                    <button
                      onClick={() => onApproveIntervention(item)}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow transition cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>อนุญาตให้พูด</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agents Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {agents.map((agent) => {
          const isSelected = selectedAgentType === agent.type;

          return (
            <div
              key={agent.id}
              onClick={() => setSelectedAgentType(agent.type)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 border-indigo-500 ring-1 ring-indigo-500/50 shadow-lg'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center">
                    {getAgentIcon(agent.type)}
                  </div>
                  <span className="font-bold text-xs text-white">{agent.name}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {agent.status.toUpperCase()}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">
                {agent.description}
              </p>

              {agent.lastThought && (
                <div className="bg-slate-950/80 rounded p-2 border border-slate-800/80 text-[10px] text-indigo-300 leading-tight">
                  <span className="text-slate-500 uppercase mr-1">Thought:</span>
                  {agent.lastThought}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Direct Address & Quick Prompt to AI */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-indigo-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              เรียกถาม AI โดยตรง (Direct Address & Question)
            </h4>
          </div>
          <span className="text-xs text-indigo-300">
            ถาม {agents.find((a) => a.type === selectedAgentType)?.name}
          </span>
        </div>

        {/* Quick Question Chips */}
        <div className="flex flex-wrap gap-2 text-xs">
          {[
            'วิเคราะห์ผลกระทบด้านความเสี่ยงต่อ Milestone 2',
            'ตรวจสอบสัญญา SOW-2026 เรื่องค่าปรับส่งมอบล่าช้า',
            'สรุปมติที่เห็นชอบในประเด็นนี้ทันที',
            'สถาปัตยกรรม Multi-Region กระทบงบประมาณอย่างไร',
          ].map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onDirectPromptAgent(selectedAgentType, chip)}
              className="text-[11px] bg-slate-800/70 hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-200 border border-slate-700/80 hover:border-indigo-500/40 px-2.5 py-1 rounded-lg transition cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>

        <form onSubmit={handleAskAgent} className="flex items-center gap-2">
          <input
            type="text"
            value={directPromptInput}
            onChange={(e) => setDirectPromptInput(e.target.value)}
            placeholder={`ระบุคำถามหรือเชิญให้ ${
              agents.find((a) => a.type === selectedAgentType)?.name
            } ให้ความเห็น...`}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />

          <button
            type="submit"
            disabled={!directPromptInput.trim() || isProcessing}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow disabled:opacity-50 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isProcessing ? 'กำลังวิเคราะห์...' : 'เรียกให้ความเห็น'}</span>
          </button>
        </form>
      </div>

      {/* Agenda Tracker */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-white flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>วาระการประชุม (Agenda Floor Control)</span>
          </span>
        </div>

        <div className="space-y-2">
          {agendas.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-2.5 rounded-lg border text-xs transition ${
                item.status === 'in_progress'
                  ? 'bg-indigo-950/40 border-indigo-500/50 text-white'
                  : item.status === 'completed'
                  ? 'bg-slate-950/40 border-slate-800/80 text-slate-500 line-through'
                  : 'bg-slate-950/30 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    item.status === 'in_progress'
                      ? 'bg-cyan-400 animate-ping'
                      : item.status === 'completed'
                      ? 'bg-emerald-500'
                      : 'bg-slate-600'
                  }`}
                />
                <span className="font-medium">{item.title}</span>
                <span className="text-[10px] text-slate-500">
                  ({item.durationMinutes} นาที)
                </span>
              </div>

              {item.status === 'in_progress' && (
                <button
                  onClick={() => onAdvanceAgenda(item.id)}
                  className="px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-semibold transition cursor-pointer"
                >
                  จบวาระนี้ →
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
