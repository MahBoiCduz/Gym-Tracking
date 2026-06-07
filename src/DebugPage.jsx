// src/DebugPage.jsx
// Trang xem log từ xa: truy cập qua URL /debug hoặc ?debug=1
import React, { useState, useEffect, useCallback } from 'react';
import { fetchLogs, clearLogs, getSessionId, isLoggingEnabled, setLoggingEnabled } from './logger';

const LEVEL_STYLES = {
  error:   { bg: 'bg-rose-950/40',    border: 'border-rose-800',    text: 'text-rose-300',    label: 'bg-rose-600' },
  warn:    { bg: 'bg-amber-950/40',   border: 'border-amber-800',   text: 'text-amber-300',   label: 'bg-amber-600' },
  success: { bg: 'bg-emerald-950/40', border: 'border-emerald-800', text: 'text-emerald-300', label: 'bg-emerald-600' },
  info:    { bg: 'bg-slate-800/60',   border: 'border-slate-700',   text: 'text-slate-300',   label: 'bg-slate-600' },
};

// Chỉ email này mới được vào trang debug
const ADMIN_EMAIL = 'ngsduc2000@gmail.com';

export default function DebugPage({ user, authLoading, onGoogleSignIn }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filter, setFilter] = useState('all'); // all | error | warn | info | success
  const [sessionFilter, setSessionFilter] = useState('');
  const [lastRefresh, setLastRefresh] = useState(null);
  const [loggingOn, setLoggingOn] = useState(isLoggingEnabled());

  const toggleLogging = () => {
    const next = !loggingOn;
    setLoggingEnabled(next);
    setLoggingOn(next);
  };

  const isAdmin = user && user.email === ADMIN_EMAIL;

  const loadLogs = useCallback(async () => {
    if (!isAdmin) { setLoading(false); return; }
    try {
      const data = await fetchLogs(300);
      setLogs(data);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Lỗi tải log:', err);
    }
    setLoading(false);
  }, [isAdmin]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Auto refresh mỗi 3 giây
  useEffect(() => {
    if (!autoRefresh || !isAdmin) return;
    const interval = setInterval(loadLogs, 3000);
    return () => clearInterval(interval);
  }, [autoRefresh, loadLogs, isAdmin]);

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

  // ============================================================
  // GUARD: chỉ admin (ADMIN_EMAIL) mới được xem trang debug
  // ============================================================
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400 text-sm">Đang kiểm tra quyền truy cập...</div>
      </div>
    );
  }

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-sm w-full text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h1 className="text-white text-lg font-bold mb-2">Trang dành riêng cho Admin</h1>
          <p className="text-slate-400 text-sm mb-6">
            {user
              ? `Tài khoản ${user.email} không có quyền xem nhật ký hệ thống.`
              : 'Bạn cần đăng nhập bằng tài khoản admin để xem trang này.'}
          </p>
          {!user ? (
            <button
              onClick={onGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-800 font-semibold py-2.5 rounded-xl text-sm transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Đăng nhập với Google
            </button>
          ) : (
            <a href="/" className="inline-block bg-blue-700 hover:bg-blue-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
              ← Về app
            </a>
          )}
        </div>
      </div>
    );
  }

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
                onClick={toggleLogging}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                  loggingOn ? 'bg-emerald-700 hover:bg-emerald-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`}
                title="Bật/tắt ghi log lên Firestore"
              >
                {loggingOn ? '🟢 Đang ghi log' : '⚪ Đã tắt log'}
              </button>
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
