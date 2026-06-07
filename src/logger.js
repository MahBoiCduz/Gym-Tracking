// src/logger.js
// Hệ thống log: ghi ra console + đẩy lên Firestore để xem từ xa qua trang /debug
import { db } from './firebase';
import {
  collection, addDoc, query, orderBy, limit, getDocs, deleteDoc, doc, serverTimestamp,
} from 'firebase/firestore';

// Mỗi lần mở app sinh 1 sessionId để nhóm log
const SESSION_ID = Math.random().toString(36).slice(2, 8).toUpperCase();

const LOGS_COLLECTION = 'debug_logs';

// ============================================================
// CÔNG TẮC GHI LOG
// - Mặc định: bật (true). Đổi thành false để tắt hẳn từ code.
// - Có thể bật/tắt ngay trên trang /debug mà không cần sửa code
//   (lưu trong localStorage, ưu tiên hơn hằng số này).
// ============================================================
const LOGGING_DEFAULT = true;

export const isLoggingEnabled = () => {
  try {
    const v = localStorage.getItem('debug_logging');
    if (v === 'off') return false;
    if (v === 'on') return true;
  } catch (e) { /* localStorage không khả dụng */ }
  return LOGGING_DEFAULT;
};

export const setLoggingEnabled = (enabled) => {
  try {
    localStorage.setItem('debug_logging', enabled ? 'on' : 'off');
  } catch (e) { /* bỏ qua */ }
};

// Lấy thông tin môi trường gọn
const getEnvInfo = () => ({
  url: typeof window !== 'undefined' ? window.location.href : '',
  ua: typeof navigator !== 'undefined' ? navigator.userAgent : '',
});

// Hàm log chính. level: 'info' | 'warn' | 'error' | 'success'
export const log = async (level, msg, data = null) => {
  const entry = {
    ts: new Date().toISOString(),
    level,
    msg,
    data: data ? JSON.stringify(data, null, 2).slice(0, 2000) : null,
    sessionId: SESSION_ID,
    ...getEnvInfo(),
  };

  // 1. Ghi ra console (vẫn giữ để dev xem nhanh)
  const tag = `[${level.toUpperCase()}]`;
  if (level === 'error') console.error(tag, msg, data || '');
  else if (level === 'warn') console.warn(tag, msg, data || '');
  else console.log(tag, msg, data || '');

  // Nếu tắt logging → không ghi lên Firestore (tiết kiệm quota)
  if (!isLoggingEnabled()) return;

  // 2. Đẩy lên Firestore (không chặn luồng chính nếu lỗi)
  try {
    await addDoc(collection(db, LOGS_COLLECTION), {
      ...entry,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Không ghi được log lên Firestore:', err.message);
  }
};

// Các shortcut tiện dùng
export const logInfo = (msg, data) => log('info', msg, data);
export const logWarn = (msg, data) => log('warn', msg, data);
export const logError = (msg, data) => log('error', msg, data);
export const logSuccess = (msg, data) => log('success', msg, data);

export const getSessionId = () => SESSION_ID;

// Đọc log gần nhất (cho trang /debug)
export const fetchLogs = async (max = 200) => {
  const q = query(collection(db, LOGS_COLLECTION), orderBy('ts', 'desc'), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// Xóa toàn bộ log (nút clear trên trang /debug)
export const clearLogs = async () => {
  const snap = await getDocs(collection(db, LOGS_COLLECTION));
  await Promise.all(snap.docs.map((d) => deleteDoc(doc(db, LOGS_COLLECTION, d.id))));
};

// Bắt lỗi toàn cục (uncaught error + promise rejection)
let globalHandlersInstalled = false;
export const installGlobalErrorHandlers = () => {
  if (globalHandlersInstalled || typeof window === 'undefined') return;
  globalHandlersInstalled = true;

  window.addEventListener('error', (e) => {
    log('error', `Uncaught: ${e.message}`, {
      filename: e.filename,
      lineno: e.lineno,
      colno: e.colno,
    });
  });

  window.addEventListener('unhandledrejection', (e) => {
    const reason = e.reason;
    log('error', `Unhandled promise rejection: ${reason?.message || reason}`, {
      code: reason?.code || null,
    });
  });
};
