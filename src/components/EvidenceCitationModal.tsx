import React from 'react';
import { ShieldCheck, FileText, X, AlertTriangle, ExternalLink, Copy, Check } from 'lucide-react';
import { OneVaultDocument } from '../types/meeting';

interface EvidenceCitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: OneVaultDocument | null;
  highlightedText?: string;
  claimantStatement?: string;
  analysisText?: string;
}

export const EvidenceCitationModal: React.FC<EvidenceCitationModalProps> = ({
  isOpen,
  onClose,
  document,
  highlightedText,
  claimantStatement,
  analysisText,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !document) return null;

  const handleCopyClause = () => {
    navigator.clipboard.writeText(highlightedText || document.snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <span>OneVault Smart Citation & Evidence Audit</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {document.id}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                หลักฐานสัญญาและข้อกำหนดที่ AI Fact-Check ตรวจพบความขัดแย้ง
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

        {/* Body */}
        <div className="p-5 space-y-4 text-xs overflow-y-auto max-h-[70vh]">
          {/* Claimant Comparison Box */}
          {claimantStatement && (
            <div className="bg-rose-950/30 border border-rose-500/40 rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center gap-1.5 text-rose-300 font-bold text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>คำพูดในที่ประชุมที่มีข้อขัดแย้ง (Claimant Statement):</span>
              </div>
              <p className="text-slate-200 italic pl-5">"{claimantStatement}"</p>
              {analysisText && (
                <p className="text-[11px] text-rose-200/90 pl-5 pt-1">
                  <strong>ข้อสังเกตของ AI:</strong> {analysisText}
                </p>
              )}
            </div>
          )}

          {/* Official Document Details */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div>
                <span className="text-[10px] text-indigo-400 font-mono font-semibold uppercase">
                  {document.category} Document
                </span>
                <h4 className="text-sm font-bold text-white">{document.title}</h4>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                แก้ไขล่าสุด: {document.lastUpdated}
              </span>
            </div>

            {/* Document Content with Highlighted Clause */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                ข้อความในสัญญาที่มีผลผูกพัน (Verified OneVault Clause):
              </span>
              <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-lg text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                {document.content.split('\n').map((line, idx) => {
                  const isTargetLine =
                    highlightedText && line.toLowerCase().includes(highlightedText.toLowerCase());
                  const isMilestoneOrPenalty =
                    line.includes('Milestone 2') ||
                    line.includes('สัปดาห์ที่ 42') ||
                    line.includes('ค่าปรับ') ||
                    line.includes('$12,500');

                  if (isTargetLine || isMilestoneOrPenalty) {
                    return (
                      <div
                        key={idx}
                        className="bg-amber-500/20 text-amber-200 font-semibold px-2 py-1 rounded border-l-4 border-amber-400 my-1"
                      >
                        {line}
                      </div>
                    );
                  }
                  return <div key={idx}>{line}</div>;
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleCopyClause}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'คัดลอกข้อความแล้ว' : 'คัดลอกข้อสัญญา'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
