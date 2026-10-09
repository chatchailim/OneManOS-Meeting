import React, { useState } from 'react';
import {
  Database,
  FileText,
  Search,
  Plus,
  Tag,
  ShieldCheck,
  Calendar,
  ExternalLink,
  Lock,
  Layers,
} from 'lucide-react';
import { OneVaultDocument } from '../types/meeting';

interface OneVaultDrawerProps {
  documents: OneVaultDocument[];
  onAddDocument: (doc: OneVaultDocument) => void;
}

export const OneVaultDrawer: React.FC<OneVaultDrawerProps> = ({
  documents,
  onAddDocument,
}) => {
  const [selectedDoc, setSelectedDoc] = useState<OneVaultDocument | null>(documents[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<OneVaultDocument['category']>('Contract');
  const [newContent, setNewContent] = useState('');
  const [newSnippet, setNewSnippet] = useState('');

  const filteredDocs = documents.filter(
    (d) =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreateDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newDoc: OneVaultDocument = {
      id: `OV-DOC-${Date.now().toString().slice(-4)}`,
      title: newTitle.trim(),
      category: newCategory,
      lastUpdated: new Date().toISOString().slice(0, 10),
      snippet: newSnippet.trim() || newContent.slice(0, 90) + '...',
      content: newContent.trim(),
      tags: ['Custom', newCategory],
    };

    onAddDocument(newDoc);
    setSelectedDoc(newDoc);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewContent('');
    setNewSnippet('');
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 text-xs font-semibold border border-cyan-500/20">
            <Lock className="w-3.5 h-3.5" />
            <span>OneVault Knowledge Repository (Role-Based Access)</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            คลังความรู้และสัญญาโครงการ OneVault
          </h2>
          <p className="text-xs text-slate-400 max-w-xl">
            AI Fact-Check และ Analyst เชื่อมโยงข้อมูลจาก OneVault เพื่อตรวจสอบข้อเท็จจริงในที่ประชุม
            ป้องกันการให้ข้อมูลคลาดเคลื่อนเรื่องสัญญา กำหนดการ และงบประมาณ
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มเอกสารอ้างอิง</span>
        </button>
      </div>

      {/* Main Grid: List on Left, Viewer on Right */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Document List */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาเอกสารสัญญา หรือ นโยบาย..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-2">
            {filteredDocs.map((doc) => {
              const isSelected = selectedDoc?.id === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-indigo-500 ring-1 ring-indigo-500/50 shadow-lg'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300">
                      {doc.id}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {doc.lastUpdated}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white leading-snug mb-1">
                    {doc.title}
                  </h4>

                  <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">
                    {doc.snippet}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {doc.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-[9px] px-1.5 py-0.2 rounded bg-slate-950 text-slate-400 border border-slate-800"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Document Full View */}
        <div className="md:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          {selectedDoc ? (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {selectedDoc.id} • หมวด: {selectedDoc.category}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    อัปเดตล่าสุด: {selectedDoc.lastUpdated}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">{selectedDoc.title}</h3>
              </div>

              {/* Verified OneVault Seal */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-xs">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>
                  เอกสารนี้ได้รับอนุมัติในคลัง OneVault สิทธิระดับ Executive / Core Team
                  พร้อมใช้ตรวจสอบข้อเท็จจริงในที่ประชุม
                </span>
              </div>

              {/* Full Content */}
              <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 font-sans text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                {selectedDoc.content}
              </div>

              {/* Tags */}
              <div className="flex items-center gap-2 pt-2">
                <Tag className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs text-slate-400">ป้ายกำกับ:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDoc.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-indigo-300 border border-slate-700 font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
              กรุณาเลือกเอกสารเพื่อดูรายละเอียด
            </div>
          )}
        </div>
      </div>

      {/* Add Document Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateDoc}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-400" />
                <span>เพิ่มเอกสาร OneVault ใหม่</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ชื่อเอกสาร:
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="เช่น ข้อกำหนดการปรับปรุง SLA และ Security"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  หมวดหมู่:
                </label>
                <select
                  value={newCategory}
                  onChange={(e) =>
                    setNewCategory(e.target.value as OneVaultDocument['category'])
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Contract">Contract (สัญญา & เงื่อนไข)</option>
                  <option value="Architecture">Architecture (สถาปัตยกรรม & เทคนิค)</option>
                  <option value="Policy">Policy (นโยบาย & กฎระเบียบ)</option>
                  <option value="Roadmap">Roadmap (แผนงาน & Milestone)</option>
                  <option value="Financial">Financial (งบประมาณ)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ใจความสำคัญ (Snippet):
                </label>
                <input
                  type="text"
                  value={newSnippet}
                  onChange={(e) => setNewSnippet(e.target.value)}
                  placeholder="สรุปสั้น 1 ประโยค"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  เนื้อหาฉบับเต็ม:
                </label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={4}
                  placeholder="รายละเอียดข้อกำหนด ตัวเลข หรือเงื่อนไขที่ AI ต้องนำไปใช้เทียบ..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer"
              >
                บันทึกลง OneVault
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
