import React from 'react';
import { Play, Sparkles, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { Participant } from '../types/meeting';

interface SimulationControlsProps {
  participants: Participant[];
  onTriggerScenario: (scenarioType: 'deadline_conflict' | 'cloud_budget' | 'security_qa') => void;
  onSimulateSingleSpeaker: (participantId: string, statement: string, confidenceOverride?: number) => void;
  disabled?: boolean;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  participants,
  onTriggerScenario,
  onSimulateSingleSpeaker,
  disabled = false,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <h4 className="font-bold text-white uppercase tracking-wider">
            จำลองสถานการณ์การประชุม (Interactive Meeting Scenarios)
          </h4>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
          คลิกเพื่อดูการทำงานของ AI Team แบบเรียลไทม์
        </span>
      </div>

      {/* Scenario Triggers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        <button
          onClick={() => onTriggerScenario('deadline_conflict')}
          disabled={disabled}
          className="flex flex-col items-start p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/40 text-left transition group cursor-pointer disabled:opacity-50"
        >
          <div className="flex items-center gap-1.5 font-bold text-amber-300 mb-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>1. ข้อเสนอเลื่อนส่งมอบ (ตรวจพบขัดแย้งสัญญา)</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            กำธรเสนอเลื่อน Milestone 2 → Fact-Check ตรวจพบขัดแย้งกับ OneVault SOW-2026 และยกมือทักท้วง
          </p>
        </button>

        <button
          onClick={() => onTriggerScenario('cloud_budget')}
          disabled={disabled}
          className="flex flex-col items-start p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800/90 border border-slate-800 hover:border-purple-500/40 text-left transition group cursor-pointer disabled:opacity-50"
        >
          <div className="flex items-center gap-1.5 font-bold text-purple-300 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>2. ขยายคลัสเตอร์ Multi-Region (วิเคราะห์งบ)</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            ประเมินขยายระบบคลาวด์ → Analyst วิเคราะห์เพดานงบประมาณ $12,500/เดือน และเสนอ DR สำรอง
          </p>
        </button>

        <button
          onClick={() => onTriggerScenario('security_qa')}
          disabled={disabled}
          className="flex flex-col items-start p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/40 text-left transition group cursor-pointer disabled:opacity-50"
        >
          <div className="flex items-center gap-1.5 font-bold text-emerald-300 mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>3. ขอมติรับรองผล PenTest & ปล่อย Beta</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            นวพรสรุปผลการทดสอบ QA → Moderator รวบรวมความคิดเห็น และ Secretary บันทึกมติเอกฉันท์
          </p>
        </button>
      </div>

      {/* Single Speaker Turn Simulators */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-slate-400 font-medium">จำลองคำพูดเฉพาะบุคคล:</span>

        {participants.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              const sampleQuotes: Record<string, string> = {
                'spk-01':
                  'ในฐานะ PM ผมเห็นว่าเราต้องปิดงาน Sprint นี้ให้ได้ภายในวันศุกร์เพื่อไม่ให้แผนงานสะดุดครับ',
                'spk-02':
                  'ฝั่งสถาปัตยกรรมระบบพร้อมรองรับ Microservices แล้ว แต่อยากขอเวลาทดสอบ Load Test อีกสัก 2 วันครับ',
                'spk-03':
                  'ทีม QA ทำการทดสอบ Automated Test ไปแล้ว 92% โดยพบข้อบกพร่องเล็กน้อยที่ทีม Dev กำลังแก้ไขอยู่ค่ะ',
              };
              const quote =
                sampleQuotes[p.id] ||
                `ผม/ดิฉัน ${p.name} ขอสนับสนุนแนวทางที่ทีมได้ร่วมกันเสนอครับ`;
              onSimulateSingleSpeaker(p.id, quote);
            }}
            disabled={disabled}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold border border-slate-700 transition cursor-pointer disabled:opacity-50"
          >
            <Play className="w-3 h-3 fill-current text-indigo-400" />
            <span>{p.name} พูด</span>
          </button>
        ))}

        {/* Test Low Confidence Diarization (<90%) Button */}
        <button
          onClick={() =>
            onSimulateSingleSpeaker(
              'spk-02',
              'อาจมีเสียงสะท้อนจากไมโครโฟนรอบทิศทาง ทำให้การจำแนกผู้พูดมีความไม่แน่นอนครับ',
              82.4
            )
          }
          disabled={disabled}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 text-[11px] font-bold border border-rose-500/50 transition cursor-pointer disabled:opacity-50 ml-auto shadow-sm"
          title="จำลองกรณีคลื่นเสียงทับซ้อน เพื่อทดสอบ Confidence Heatmap (<90%) และการยืนยันผู้พูด"
        >
          <AlertTriangle className="w-3 h-3 text-rose-400 animate-pulse" />
          <span>จำลองเสียงซ้อน (&lt;90% Heatmap Alert)</span>
        </button>
      </div>
    </div>
  );
};
