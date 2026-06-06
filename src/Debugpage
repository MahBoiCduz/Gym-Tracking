// src/DebugPage.jsx
// Trang xem log từ xa: truy cập qua URL /debug hoặc ?debug=1
import React, { useState, useEffect, useCallback } from 'react';
import { fetchLogs, clearLogs, getSessionId } from './logger';

const LEVEL_STYLES = {
  error:   { bg: 'bg-rose-950/40',    border: 'border-rose-800',    text: 'text-rose-300',    label: 'bg-rose-600' },
  warn:    { bg: 'bg-amber-950/40',   border: 'border-amber-800',   text: 'text-amber-300',   label: 'bg-amber-600' },
  success: { bg: 'bg-emerald-950/40', border: 'border-emerald-800', text: 'text-emerald-300', label: 'bg-emerald-600' },
  info:    { bg: 'bg-slate-800/60',   border: 'border-slate-700',   text: 'text-slate-300',   label: 'bg-slate-600' },
};

export default function DebugPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filter, setFilter] = useState('all'); // all | error | warn | info | success
  const [sessionFilter, setSessionFilter] = useState('');
  const [lastRefresh, setLastRefresh] = useState(null);

  const loadLogs = useCallback(async () => {
    try {
      const data = await fetchLogs(300);
      setLogs(data);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Lỗi tải log:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Auto refresh mỗi 3 giây
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(loadLogs, 3000);
    return () => clearInterval(interval);
  }, [autoRefresh, loadLogs]);

  const handleClear = async () => {
    if (!window.confirm('Xóa toàn bộ log? Không thể hoàn tác.')) return;
    setLoading(true);
    await clearLogs();
    await loadLogs();
  };

  // Danh sách session để filter nhanh
  const sessions = [...new Set(logs.map((l) => l.sessionId).filter(Boolean))];

  const filteredLogs = logs.filter((l) => {
    if (filter !== 'all' && l.level !== filter) return false;
    if (sessionFilter && l.sessionId !== sessionFilter) return false;
    return true;
  });

  const counts = {
    error: logs.filter((l) => l.level === 'error').length,
    warn: logs.filter((l) => l.level === 'warn').length,
    info: logs.filter((l) => l.level === 'info').length,
    success: logs.filter((l) => l.level === 'success').length,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-mono text-sm">
      {/* Header */}
      <div className="sticky top-0 bg-slate-900 border-b border-slate-800 px-4 py-3 z-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <h1 className="text-base font-bold text-white">🐞 Debug Logs</h1>
              <span className="text-[11px] text-slate-500">
                Session hiện tại: <span className="text-blue-400 font-bold">{getSessionId()}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadLogs}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs font-bold transition-colors"
              >
                ↻ Tải lại
              </button>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                  autoRefresh ? 'bg-emerald-700 hover:bg-emerald-600 text-white' : 'bg-slate-800 hover:bg-slate-700'
                }`}
              >
                {autoRefresh ? '● Auto' : '○ Auto'}
              </button>
              <button
                onClick={handleClear}
                className="px-3 py-1.5 bg-rose-900 hover:bg-rose-800 text-rose-200 rounded text-xs font-bold transition-colors"
              >
                🗑 Xóa hết
              </button>
              <a
                href="/"
                className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white rounded text-xs font-bold transition-colors"
              >
                ← Về app
              </a>
            </div>
          </div>

          {/* Filter levels */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {[
              ['all', `Tất cả (${logs.length})`],
              ['error', `Lỗi (${counts.error})`],
              ['warn', `Cảnh báo (${counts.warn})`],
              ['success', `Thành công (${counts.success})`],
              ['info', `Info (${counts.info})`],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                  filter === key ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {label}
              </button>
            ))}

            {sessions.length > 0 && (
              <select
                value={sessionFilter}
                onChange={(e) => setSessionFilter(e.target.value)}
                className="ml-auto bg-slate-800 border border-slate-700 rounded px-2 py-1 text-[11px] focus:outline-none"
              >
                <option value="">Mọi session</option>
                {sessions.map((s) => (
                  <option key={s} value={s}>Session {s}</option>
                ))}
              </select>
            )}
          </div>

          {lastRefresh && (
            <p className="text-[10px] text-slate-600 mt-2">
              Cập nhật lúc {lastRefresh.toLocaleTimeString('vi-VN')} · {filteredLogs.length} dòng hiển thị
            </p>
          )}
        </div>
      </div>

      {/* Log list */}
      <div className="max-w-5xl mx-auto px-4 py-4 space-y-1.5">
        {loading && logs.length === 0 ? (
          <div className="text-center py-12 text-slate-500">Đang tải log...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-slate-600">
            Chưa có log nào. Hãy thao tác trên app rồi quay lại đây.
          </div>
        ) : (
          filteredLogs.map((entry) => {
            const style = LEVEL_STYLES[entry.level] || LEVEL_STYLES.info;
            return (
              <div key={entry.id} className={`${style.bg} border ${style.border} rounded-lg px-3 py-2`}>
                <div className="flex items-start gap-2">
                  <span className={`${style.label} text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0 mt-0.5`}>
                    {entry.level}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className={`${style.text} break-words`}>{entry.msg}</div>
                    {entry.data && (
                      <pre className="mt-1 text-[10px] text-slate-500 bg-black/30 rounded p-2 overflow-x-auto whitespace-pre-wrap break-words">
                        {entry.data}
                      </pre>
                    )}
                    <div className="flex items-center gap-3 mt-1 text-[9px] text-slate-600">
                      <span>{entry.ts ? new Date(entry.ts).toLocaleTimeString('vi-VN') : ''}</span>
                      <span className="text-blue-500/70">#{entry.sessionId}</span>
                      {entry.url && <span className="truncate max-w-[200px]">{entry.url.replace(/^https?:\/\//, '')}</span>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
