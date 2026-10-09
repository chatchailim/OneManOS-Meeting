import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  ListTodo,
  AlertCircle,
  Download,
  Share2,
  Sparkles,
  Database,
  Printer,
  Copy,
  Check,
  Shield,
  Layers,
  Link2,
} from 'lucide-react';
import {
  MeetingIntelligence,
  ApprovedResolution,
  ActionItem,
  UnresolvedItem,
  Participant,
} from '../types/meeting';

interface MeetingIntelligenceSummaryProps {
  intelligence: MeetingIntelligence;
  setIntelligence: React.Dispatch<React.SetStateAction<MeetingIntelligence>>;
  meetingTitle: string;
  meetingTimeStr: string;
  participants: Participant[];
  onRegenerateMinutes: () => void;
  isRegenerating: boolean;
  onSyncToOneVault?: () => void;
}

export const MeetingIntelligenceSummary: React.FC<MeetingIntelligenceSummaryProps> = ({
  intelligence,
  setIntelligence,
  meetingTitle,
  meetingTimeStr,
  participants,
  onRegenerateMinutes,
  isRegenerating,
  onSyncToOneVault,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedSlack, setCopiedSlack] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Filters for Action items
  const [ownerFilter, setOwnerFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Quick Add Action Item State
  const [isAddingTask, setIsAddingTask] = useState<boolean>(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskOwner, setNewTaskOwner] = useState(participants[0]?.name || 'ภูวกฤต');
  const [newTaskDeadline, setNewTaskDeadline] = useState('2 สัปดาห์');
  const [newTaskPriority, setNewTaskPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');

  // Toggle Action item status
  const handleToggleActionStatus = (id: string) => {
    setIntelligence((prev) => ({
      ...prev,
      actionItems: prev.actionItems.map((item) =>
        item.id === id
          ? {
              ...item,
              status:
                item.status === 'done'
                  ? 'in_progress'
                  : item.status === 'in_progress'
                  ? 'pending'
                  : 'done',
            }
          : item
      ),
    }));
  };

  // Export to Markdown
  const handleExportMarkdown = () => {
    const md = `# บันทึกการประชุม Nextwaver AI Meeting Team
**หัวข้อ:** ${meetingTitle}
**ระยะเวลา:** ${meetingTimeStr}
**ผู้เข้าร่วม:** ${participants.map((p) => `${p.name} (${p.role})`).join(', ')}

---

## 1. บทสรุปผู้บริหาร (Executive Summary)
${intelligence.executiveSummary}

---

## 2. มติที่ประชุมที่ได้รับอนุมัติ (Approved Resolutions)
${intelligence.approvedResolutions
  .map(
    (res, i) =>
      `### ${i + 1}. ${res.topic} (${res.consensus})\n- **สาระสำคัญ:** ${res.resolution}\n- **ผู้เกี่ยวข้อง:** ${res.stakeholders.join(
        ', '
      )}`
  )
  .join('\n\n')}

---

## 3. รายการงานและผู้รับผิดชอบ (Action Items)
${intelligence.actionItems
  .map(
    (item, i) =>
      `- [${item.status === 'done' ? 'x' : ' '}] **${item.task}**\n  - ผู้รับผิดชอบ: ${item.owner}\n  - กำหนดส่ง: ${item.deadline}\n  - ลำดับความสำคัญ: ${item.priority}`
  )
  .join('\n')}

---

## 4. ประเด็นที่ยังไม่ได้ข้อยุติ (Parking Lot / Unresolved Issues)
${intelligence.unresolvedItems
  .map((u, i) => `- **${u.issue}**\n  - แนวทางดำเนินการต่อ: ${u.nextStep}`)
  .join('\n')}

---
*จัดทำโดย Nextwaver Secretary Agent & Gemini 3.8 Intelligence*
`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Nextwaver-Minutes-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);

    setExportNotice('ดาวน์โหลดไฟล์ Markdown เรียบร้อยแล้ว');
    setTimeout(() => setExportNotice(null), 3000);
  };

  // Copy to clipboard
  const handleCopyClipboard = () => {
    const text = `Nextwaver Meeting Summary: ${meetingTitle}\n\n${intelligence.executiveSummary}\n\nมติที่ประชุม:\n${intelligence.approvedResolutions
      .map((r) => `- ${r.topic}: ${r.resolution}`)
      .join('\n')}\n\nAction Items:\n${intelligence.actionItems
      .map((a) => `- ${a.task} (${a.owner} - ${a.deadline})`)
      .join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Copy for Slack / Jira
  const handleCopySlackJira = () => {
    const text = `*Nextwaver Meeting Action Items: ${meetingTitle}*\n` +
      intelligence.actionItems
        .map(
          (a) =>
            `• [${a.priority}] *${a.task}* — Assignee: @${a.owner} | Due: ${a.deadline} | Status: ${
              a.status === 'done' ? 'Completed' : a.status === 'in_progress' ? 'In Progress' : 'Pending'
            }`
        )
        .join('\n');

    navigator.clipboard.writeText(text);
    setCopiedSlack(true);
    setTimeout(() => setCopiedSlack(false), 2000);
  };

  // Add new Action item
  const handleAddNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newItem: ActionItem = {
      id: `act-0${intelligence.actionItems.length + 1}`,
      task: newTaskTitle.trim(),
      owner: newTaskOwner,
      deadline: newTaskDeadline,
      priority: newTaskPriority,
      status: 'pending',
    };

    setIntelligence((prev) => ({
      ...prev,
      actionItems: [...prev.actionItems, newItem],
    }));

    setNewTaskTitle('');
    setIsAddingTask(false);
    setExportNotice('เพิ่มรายการงานใหม่เรียบร้อยแล้ว');
    setTimeout(() => setExportNotice(null), 2500);
  };

  // Filtered action items
  const filteredActionItems = intelligence.actionItems.filter((item) => {
    const matchOwner = ownerFilter === 'all' || item.owner.includes(ownerFilter);
    const matchPriority = priorityFilter === 'all' || item.priority === priorityFilter;
    const matchStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchOwner && matchPriority && matchStatus;
  });

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-semibold border border-emerald-500/20 mb-1">
            <FileText className="w-3.5 h-3.5" />
            <span>Nextwaver Meeting Intelligence Engine</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            สรุปมติที่ประชุม, รายการงาน และประเด็นคั่งค้าง
          </h2>
          <p className="text-xs text-slate-400">
            ระบบจัดทำรายงานการประชุมแบบมีโครงสร้าง โดย Secretary Agent และ Gemini
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onSyncToOneVault && (
            <button
              onClick={onSyncToOneVault}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs shadow transition cursor-pointer"
              title="บันทึกมติและ Action Items เข้าคลังสัญญา OneVault เป็นเอกสารอ้างอิงถาวร"
            >
              <Database className="w-3.5 h-3.5 fill-current" />
              <span>ซิงค์มติเข้า OneVault</span>
            </button>
          )}

          <button
            onClick={onRegenerateMinutes}
            disabled={isRegenerating}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow transition disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isRegenerating ? 'Gemini กำลังประมวลผล...' : 'AI สรุปมติสดใหม่'}</span>
          </button>

          <button
            onClick={handleCopyClipboard}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอกข้อความ'}</span>
          </button>

          <button
            onClick={handleExportMarkdown}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ส่งออก Markdown</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 text-center font-medium">
          {exportNotice}
        </div>
      )}

      {/* Executive Summary */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-400" />
          <span>1. บทสรุปผู้บริหาร (Executive Summary)</span>
        </h3>
        <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
          {intelligence.executiveSummary}
        </p>

        {/* Key Takeaways */}
        {intelligence.keyTakeaways && intelligence.keyTakeaways.length > 0 && (
          <div className="pt-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              ประเด็นสำคัญ (Key Takeaways):
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {intelligence.keyTakeaways.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800 text-xs text-slate-300"
                >
                  • {item}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Approved Resolutions */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>2. มติที่ประชุมที่ได้รับอนุมัติ (Approved Resolutions)</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {intelligence.approvedResolutions.length} มติ
          </span>
        </div>

        <div className="space-y-3">
          {intelligence.approvedResolutions.map((res) => (
            <div
              key={res.id}
              className="bg-slate-950/80 border border-emerald-500/30 rounded-xl p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    {res.id}
                  </span>
                  <h4 className="text-sm font-bold text-white">{res.topic}</h4>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  มติ: {res.consensus}
                </span>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed">{res.resolution}</p>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
                <span className="font-semibold text-slate-300">ผู้เกี่ยวข้อง:</span>
                <span>{res.stakeholders.join(', ')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Items Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-cyan-400" />
              <span>3. รายการงานและผู้รับผิดชอบ (Action Items)</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              ({filteredActionItems.length}/{intelligence.actionItems.length} งาน)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopySlackJira}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 cursor-pointer transition"
              title="คัดลอกรายการงานสำหรับส่งลง Slack หรือนำเข้า Jira"
            >
              {copiedSlack ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-cyan-400" />
              )}
              <span>{copiedSlack ? 'คัดลอก Slack แล้ว' : 'คัดลอก Jira / Slack'}</span>
            </button>

            <button
              onClick={() => setIsAddingTask(!isAddingTask)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 text-xs font-semibold border border-indigo-500/40 cursor-pointer transition"
            >
              <span>+ เพิ่มงานใหม่</span>
            </button>
          </div>
        </div>

        {/* Action Items Filters */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-xs">
          <span className="text-slate-400 text-[11px]">ตัวกรอง:</span>

          {/* Owner filter */}
          <select
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 text-xs focus:outline-none"
          >
            <option value="all">ผู้รับผิดชอบทั้งหมด</option>
            {participants.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 text-xs focus:outline-none"
          >
            <option value="all">ความสำคัญทั้งหมด</option>
            <option value="HIGH">HIGH (ด่วนมาก)</option>
            <option value="MEDIUM">MEDIUM (ปานกลาง)</option>
            <option value="LOW">LOW (ทั่วไป)</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 text-xs focus:outline-none"
          >
            <option value="all">สถานะทั้งหมด</option>
            <option value="pending">รอดำเนินการ</option>
            <option value="in_progress">กำลังทำ</option>
            <option value="done">เสร็จแล้ว</option>
          </select>

          {(ownerFilter !== 'all' || priorityFilter !== 'all' || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setOwnerFilter('all');
                setPriorityFilter('all');
                setStatusFilter('all');
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 underline ml-auto"
            >
              ล้างตัวกรอง
            </button>
          )}
        </div>

        {/* Quick Add Task Form */}
        {isAddingTask && (
          <form
            onSubmit={handleAddNewTask}
            className="bg-slate-950 border border-indigo-500/40 rounded-xl p-3.5 space-y-3 animate-fadeIn"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs">เพิ่ม Action Item ใหม่</span>
              <button
                type="button"
                onClick={() => setIsAddingTask(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <div className="md:col-span-2">
                <input
                  type="text"
                  placeholder="ชื่องานหรือข้อตกลงที่ต้องทำ..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <select
                  value={newTaskOwner}
                  onChange={(e) => setNewTaskOwner(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                >
                  {participants.map((p) => (
                    <option key={p.id} value={p.name}>
                      👤 {p.name} ({p.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as any)}
                  className="w-1/2 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
                <input
                  type="text"
                  placeholder="กำหนดส่ง"
                  value={newTaskDeadline}
                  onChange={(e) => setNewTaskDeadline(e.target.value)}
                  className="w-1/2 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingTask(false)}
                className="px-3 py-1 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-4 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
              >
                บันทึกงาน
              </button>
            </div>
          </form>
        )}

        {/* Task Dependency & Past Meeting Memory Radar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-300">
            <Shield className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              <strong>Past Meeting Alignment:</strong> 95% — สอดคล้องกับมติการประชุมครั้งก่อน (ไม่พบการกลับมติ)
            </span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-300">
            <Link2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Dependency Radar:</strong> AI Secretary ตรวจสอบลำดับการส่งมอบ API ก่อนเริ่มงาน QA
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-2.5 font-semibold">สถานะ</th>
                <th className="pb-2.5 font-semibold">รายการงาน (Task)</th>
                <th className="pb-2.5 font-semibold">ผู้รับผิดชอบ (Owner)</th>
                <th className="pb-2.5 font-semibold">กำหนดส่ง (Deadline)</th>
                <th className="pb-2.5 font-semibold">ลำดับความสำคัญ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredActionItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-950/40 transition">
                  <td className="py-3">
                    <button
                      onClick={() => handleToggleActionStatus(item.id)}
                      className={`px-2 py-1 rounded text-[10px] font-bold transition cursor-pointer ${
                        item.status === 'done'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : item.status === 'in_progress'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {item.status === 'done'
                        ? 'เสร็จแล้ว'
                        : item.status === 'in_progress'
                        ? 'กำลังทำ'
                        : 'รอดำเนินการ'}
                    </button>
                  </td>
                  <td className="py-3 pr-3 font-medium text-slate-200">
                    <div>{item.task}</div>
                    {item.dependencyWarning && (
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30 w-fit">
                        <AlertCircle className="w-3 h-3 text-amber-400" />
                        <span>ลำดับงาน: {item.dependencyWarning}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-3 whitespace-nowrap text-indigo-300 font-semibold">
                    👤 {item.owner}
                  </td>
                  <td className="py-3 whitespace-nowrap font-mono text-slate-400">
                    {item.deadline}
                  </td>
                  <td className="py-3 whitespace-nowrap">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        item.priority === 'HIGH'
                          ? 'bg-rose-500/20 text-rose-300'
                          : item.priority === 'MEDIUM'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.priority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unresolved Items (Parking Lot) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          <span>4. ประเด็นที่ยังไม่ได้ข้อยุติ (Parking Lot / Unresolved Issues)</span>
        </h3>

        <div className="space-y-2.5">
          {intelligence.unresolvedItems.map((u) => (
            <div
              key={u.id}
              className="bg-slate-950/70 border border-amber-500/20 rounded-xl p-3.5 space-y-1.5 text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-amber-400 font-bold">{u.id}:</span>
                <span className="font-bold text-slate-200">{u.issue}</span>
              </div>
              <p className="text-slate-400 pl-6">
                <strong className="text-slate-300">แนวทางดำเนินการ:</strong> {u.nextStep}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
