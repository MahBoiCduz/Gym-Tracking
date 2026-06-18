import React, { useState, useEffect, useCallback } from 'react';
import { signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth, googleProvider } from './firebase';
import {
  Activity, Zap, Utensils, Target, AlertTriangle, Wrench, Check,
  Plus, Trash2, Pencil, Save, LogOut, UserPlus, Search, Calendar, Lightbulb, Flame, X
} from 'lucide-react';
import DebugPage from './DebugPage';
import { logInfo, logWarn, logError, logSuccess, getSessionId, installGlobalErrorHandlers } from './logger';

// ============================================================
// DATA MẶC ĐỊNH
// ============================================================
const INITIAL_PROFILE = {
  name: "Anh Đức",
  age: 26,
  gender: "Nam",
  height: 168,
  weight: 77.4,
  targetWeight: 72,
  bmr: 1699,
  tdee: 2208,
  activeFactor: 1.3
};

const INITIAL_GOALS = [
  "Cải thiện sức khỏe chung toàn diện",
  "Học kỹ thuật Kickboxing bài bản, chuẩn phom",
  "Đốt cháy mỡ thừa, giảm cân khoa học"
];

const INITIAL_ISSUES = [
  "Vùng thắt lưng thường xuyên căng mỏi do ngồi làm việc nhiều",
  "Mông và đùi sau bị căng cứng, biên độ chuyển động kém linh hoạt"
];

const INITIAL_SOLUTIONS = [
  "Tần suất tập luyện: Duy trì đều đặn 3 buổi / tuần",
  "Tập trung chi dưới: Kéo giãn sâu cơ lưng, cơ mông nhằm giải tỏa áp lực đĩa đệm",
  "Làm khỏe chuỗi cơ sau: Tăng cường nhóm cơ Mông, Đùi sau, Traps (cầu vai) và Core",
  "Sức bền thể lực: Hỗ trợ tăng cơ nạc, sửa tư thế đứng thẳng, giảm gù vai còng"
];

const INITIAL_PHASES = [
  {
    id: 1,
    title: "PHASE 1: Làm Quen Kỹ Thuật Cơ Bản & Giãn Cơ (15 Buổi)",
    desc: "Mục đích: Cải thiện tư thế Kickboxing, tăng độ linh hoạt khớp và khả năng phối hợp chuyển động cơ bản.",
    blocks: [
      {
        name: "Block 1: Làm Quen Bộ Pháp & Kích Hoạt Cơ Bắp",
        sessions: "Buổi 1 - 5",
        target: "Học thủ chuẩn, di chuyển giữ thăng bằng và giải tỏa căng thẳng vùng thắt lưng.",
        exercises: [
          "Khởi động: Giãn cơ động (Xoay hông, ép dọc/ép ngang chủ động).",
          "Chuyên môn: Học tư thế thủ chuẩn (Stance) - Giữ trọng tâm, sửa tư thế đứng.",
          "Bộ pháp: Di chuyển căn bản (Footwork) - Tiến, lùi, sang trái, sang phải.",
          "Bổ trợ: Bodyweight Squat + Dumbbell Row (Khỏe cơ traps/lưng trên).",
          "Hồi phục: Giãn cơ tĩnh sâu - Tư thế em bé (Child's pose) giãn lưng."
        ]
      },
      {
        name: "Block 2: Định Hình Đòn Đấm & Cải Thiện Linh Hoạt",
        sessions: "Buổi 6 - 10",
        target: "Kết hợp di chuyển với đòn đấm thẳng, tăng sức bền core và kéo giãn sâu chi dưới.",
        exercises: [
          "Chuyên môn: Học đòn đấm thẳng Jab (tay trước) và Cross (tay sau).",
          "Combo di chuyển: Tiến - Jab, Lùi - Cross điều tốc.",
          "Bổ trợ: Dumbbell RDL cảm nhận kéo căng, làm khỏe đùi sau và mông.",
          "Sửa tư thế: Band Pull-Apart với dây kháng lực.",
          "Hồi phục: Giãn cơ mông sâu (Tư thế bồ câu - Pigeon pose)."
        ]
      },
      {
        name: "Block 3: Phối Hợp Tổ Hợp Ngắn & Tăng Sức Chịu Đựng",
        sessions: "Buổi 11 - 15",
        target: "Hoàn thiện phối hợp chuyển động cơ bản, tăng sức bền chi dưới.",
        exercises: [
          "Chuyên môn: Học đòn đấm vòng Hook. Ghép tổ hợp: Jab - Cross - Hook.",
          "Phòng thủ: Tập phản xạ né đòn (Duck/Weave).",
          "Bổ trợ: Goblet Squat + Plank Shoulder Taps.",
          "Hồi phục: Dùng Foam Roller giải mỏi bắp chân, đùi sau."
        ]
      }
    ]
  },
  {
    id: 2,
    title: "PHASE 2: Tăng Cường Sức Bền & Đa Dạng Kỹ Thuật (20 Buổi)",
    desc: "Mục đích: Nâng cao kỹ thuật (bắt đầu kết hợp chân), tăng cường sức chịu đựng cơ bắp và đốt cháy calo.",
    blocks: [
      {
        name: "Block 1: Mở Khớp Háng & Kỹ Thuật Đá Cơ Bản",
        sessions: "Buổi 16 - 20",
        target: "Kích hoạt linh hoạt vùng chi dưới để làm quen biên độ đòn đá an toàn.",
        exercises: [
          "Kỹ thuật: Học kỹ thuật Low Kick và Mid Kick.",
          "Lưu ý: Xoay trụ 180° trên ức bàn chân trước để mở hông và bảo vệ khớp gối.",
          "Bổ trợ: Kettlebell Sumo Squat + Inverted Row / Dumbbell Row."
        ]
      },
      {
        name: "Block 2: Ghép Tổ Hợp Đấm - Đá & Tăng Tốc Độ",
        sessions: "Buổi 21 - 25",
        target: "Tăng phối hợp toàn thân, thúc đẩy đốt năng lượng và tăng sức bền tim mạch.",
        exercises: [
          "Combo: Jab - Cross - Left Mid Kick và Jab - Hook - Right Mid Kick.",
          "Di chuyển: Tập luyện giữ cự ly ổn định trước và sau khi tung đòn đá.",
          "Circuit Training: Dumbbell RDL -> Push-up -> Russian Twist."
        ]
      },
      {
        name: "Block 3: Phản Xạ Phòng Thủ & Đánh Gối",
        sessions: "Buổi 26 - 30",
        target: "Đa dạng hóa đòn đánh với gối và tập các bài phòng thủ nâng cao.",
        exercises: [
          "Kỹ thuật mới: Knee Strike + Shin Block.",
          "Combo: Block - Jab - Cross - Knee.",
          "Bổ trợ: Bulgarian Split Squat phát triển mông & thăng bằng đơn chân."
        ]
      },
      {
        name: "Block 4: Đốt Mỡ Cường Độ Cao",
        sessions: "Buổi 31 - 35",
        target: "Đạt đỉnh cao sức bền thể lực, tối ưu calo.",
        exercises: [
          "Pad work HIIT: Tập trung tốc độ ra đấm và độ nặng bộc phát của đòn đá.",
          "Burn-out: 30 giây cuối mỗi hiệp đấm/đá liên tục không nghỉ.",
          "AMRAP 10 phút: 10 Goblet Squat -> 10 Dumbbell Renegade Row -> 15 Plank Shoulder Taps."
        ]
      }
    ]
  },
  {
    id: 3,
    title: "PHASE 3: Tập Trung Giảm Mỡ, Linh Hoạt & Phát Triển Cơ Bắp (15 Buổi)",
    desc: "Mục đích: Thử thách thể lực tối đa, ép cơ thể dùng mỡ thừa làm năng lượng.",
    blocks: [
      {
        name: "Block 1: Phối Hợp Đa Cực & Ổn Định Trọng Tâm",
        sessions: "Buổi 36 - 40",
        target: "Phối hợp nhuần nhuyễn Đấm thẳng - Đấm vòng - Gối.",
        exercises: [
          "Combo nâng cao: Jab - Cross - Hook - Right Knee. Di chuyển cắt góc 90 độ sau khi ra đòn.",
          "Tăng tiến: Romanian Deadlift tăng dần mức tạ."
        ]
      },
      {
        name: "Block 2: Phản Xạ Nâng Cao & Tấn Công Toàn Diện",
        sessions: "Buổi 41 - 45",
        target: "Tập phản xạ né đòn và phản công tức thì.",
        exercises: [
          "Phản công: Shin Block -> Cross - Hook - Low Kick.",
          "Tăng cơ: Goblet Squat tempo chậm (3-1-1) + Dumbbell Shrugs."
        ]
      },
      {
        name: "Block 3: Mô Phỏng Đối Kháng & Thể Lực Đỉnh Cao",
        sessions: "Buổi 46 - 50",
        target: "Thử thách thể lực tối đa, ép cơ thể dùng mỡ thừa làm năng lượng.",
        exercises: [
          "Mô phỏng: Light Sparring / Padwork liên hoàn 5-6 đòn di chuyển liên tục.",
          "Circuit Đốt mỡ: Bulgarian Split Squat (10/chân) -> Push-up (12) -> Plank Shoulder Taps (20)."
        ]
      }
    ]
  }
];

const INITIAL_DIET = [
  { day: 1, type: "Standard", s: "2 quả trứng ốp la + 1 lát bánh mì đen + 1 quả dưa chuột.", t: "1 bát cơm gạo lứt + 150g ức gà áp chảo + Cải ngọt luộc.", x: "1 quả ổi tươi.", to: "1 củ khoai lang luộc + 150g cá rô phi sốt cà chua + Canh bí đao.", done: false },
  { day: 2, type: "Standard", s: "Cháo yến mạch thịt băm (40g yến mạch + 50g thịt thăn băm).", t: "1 bát cơm trắng + 150g thịt lợn thăn luộc + Bông cải xanh luộc.", x: "1 hũ sữa chua ít đường.", to: "Canh đậu phụ nấu cà chua thịt băm + 1 khúc ngô ngọt luộc.", done: false },
  { day: 3, type: "Standard", s: "1 củ khoai lang luộc + 1 quả trứng luộc + 1 ly sữa đậu nành không đường.", t: "Bún lứt trộn (100g bún + 120g thịt bò xào + nhiều rau sống).", x: "1 quả táo.", to: "1 bát cơm lứt + 150g tôm hấp sả + Bí xanh luộc.", done: false },
  { day: 4, type: "Standard", s: "2 lát bánh mì gối + 1 muỗng bơ đậu phộng + 1 quả chuối.", t: "1 bát cơm lứt + 150g ức gà xé phay trộn hành tây rau răm + Canh rau ngót.", x: "1 nắm nhỏ hạt hạnh nhân.", to: "1 củ khoai lang + 150g mực hấp hành gừng + Xà lách.", done: false },
  { day: 5, type: "Standard", s: "1 bát miến gà (nhiều rau, ức gà, ít miến).", t: "1 bát cơm trắng + 150g cá ngừ sốt cà + Đậu cô ve luộc.", x: "1 miếng đu đủ chín.", to: "Salad ức gà (100g ức + xà lách, cà chua bi, dưa chuột + sốt sữa chua).", done: false },
  { day: 6, type: "Standard", s: "1 củ khoai lang luộc + 2 quả trứng luộc lòng đào.", t: "1 bát cơm lứt + 150g thịt bò xào bông cải xanh.", x: "1 quả cam hoặc 3 múi bưởi.", to: "Canh khoai tây cà rốt nấu sườn + Đậu phụ luộc.", done: false },
  { day: 7, type: "Cheat", s: "1 đĩa bánh cuốn (ít bánh, nhiều mộc nhĩ thịt băm).", t: "Ăn cùng gia đình tự do (ưu tiên món luộc, hấp, ăn nhiều rau trước).", x: "Không ăn xế.", to: "1 củ khoai lang + 1 khúc cá lóc hấp dưa cuốn bánh tráng.", done: false },
  { day: 8, type: "Standard", s: "3 muỗng yến mạch ngâm sữa tươi không đường + nửa quả chuối.", t: "1 bát cơm lứt + 150g tôm rim tỏi + Cải thảo luộc.", x: "1 hũ sữa chua Hy Lạp không đường.", to: "2 quả trứng đúc thịt băm nướng nồi chiên không dầu + Canh cải cúc.", done: false },
  { day: 9, type: "Standard", s: "Bánh mì kẹp trứng ốp la + dưa chuột, cà chua.", t: "1 bát cơm trắng + 150g ức gà nướng mật ong + Rau muống luộc.", x: "1 quả ổi giòn.", to: "1 củ khoai lang + 150g thịt thăn áp chảo + Salad xà lách dầu giấm.", done: false },
  { day: 10, type: "Standard", s: "1 bát bún sườn chua nấu tại nhà (nhiều dọc mùng, ít bún).", t: "1 bát cơm lứt + 150g cá hồi áp chảo + Bí ngòi xào tỏi.", x: "1 quả táo mọng.", to: "Canh rong biển đậu phụ thịt băm + 1 củ khoai tây luộc nhỏ.", done: false },
  { day: 11, type: "Standard", s: "2 quả trứng luộc + 1 bắp ngô ngọt luộc.", t: "1 bát cơm lứt + 150g ức gà xào nấm + Rau cải chíp luộc.", x: "1 hũ sữa chua ít đường.", to: "1 củ khoai lang + 150g tôm hấp + Canh bầu nấu tôm.", done: false },
  { day: 12, type: "Standard", s: "Smoothie chuối yến mạch (1 chuối + 3 muỗng yến mạch + 200ml sữa ko đường).", t: "1 bát cơm trắng + 150g thịt thăn rim tiêu + Bông cải xanh luộc.", x: "2 múi bưởi da xanh.", to: "Canh kim chi nấu đậu phụ, nấm và thịt bò + 1 củ khoai lang nhỏ.", done: false },
  { day: 13, type: "Standard", s: "1 bát hủ tiếu gà (thịt ức gà xé, thêm nhiều giá đỗ).", t: "Bún lứt chấm thịt chân giò luộc + Đậu phụ nướng + Rau kinh giới.", x: "1 quả dưa chuột.", to: "1 bát cơm lứt + 150g cá rô phi nướng sả + Canh rau ngót.", done: false },
  { day: 14, type: "Standard", s: "2 lát bánh mì đen + 1 quả trứng ốp la + 1/2 quả bơ chín.", t: "1 bát cơm lứt + 150g thịt ức gà sốt tiêu xanh + Su su luộc.", x: "1 nắm hạt điều nguyên vị.", to: "Salad bò áp chảo (120g bò + rau mầm, cà chua bi + sốt dầu giấm nhạt).", done: false },
  { day: 15, type: "Half", s: "1 bát cháo đỗ xanh nấu loãng ăn kèm chút ruốc heo sạch.", t: "1 bát cơm trắng + 150g mực xào cần tỏi ít dầu + Canh cải ngọt.", x: "1 quả táo xanh.", to: "1 củ khoai lang + 150g phi lê cá lóc nướng + 1 đĩa rau muống luộc.", done: false }
];

const BLANK_PROFILE = {
  name: '', age: '', gender: 'Nam', height: '', weight: '',
  targetWeight: '', bmr: 0, tdee: 0, activeFactor: 1.3
};

const DEFAULT_CLIENT_DATA = {
  profile: BLANK_PROFILE,
  goals: [],
  issues: [],
  solutions: [],
  phases: [],
  diet: [],
  completedSessions: {},
  nutritionTargets: { kcal: 1700, p: 130, c: 150, f: 50 },
  nutritionLog: {}
};

// Link Google Sheet (publish CSV) chứa thư viện món ăn
const FOODS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRxbtEfs3waw0ihSqeZhcgLDtgaFeorx662dErOyQ4bZBRMypbQe8ir81-7BJ47fmHCyhnUO4fb2UAz/pub?output=csv';

// Parser CSV đơn giản, xử lý được ô có dấu phẩy trong ngoặc kép
const parseCSV = (text) => {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') inQuotes = false;
      else field += ch;
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ',') { row.push(field); field = ''; }
      else if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else if (ch === '\r') { /* skip */ }
      else field += ch;
    }
  }
  if (field !== '' || row.length > 0) { row.push(field); rows.push(row); }
  return rows;
};

// Chuyển CSV thành danh sách món
// Header thực tế: Danh mục | Món ăn / Thành phần | Calorie | Protein | Fat | Carb
const parseFoodsFromCSV = (text) => {
  const rows = parseCSV(text).filter(r => r.some(c => c && c.trim() !== ''));
  if (rows.length < 2) return [];
  const num = (v) => {
    const n = parseFloat(String(v || '').replace(',', '.').replace(/[^\d.-]/g, ''));
    return isNaN(n) ? 0 : n;
  };
  return rows.slice(1).map((r, i) => ({
    id: `f${i}`,
    cat: (r[0] || 'Khác').trim(),
    name: (r[1] || '').trim(),
    kcal: num(r[2]),
    p: num(r[3]),
    f: num(r[4]),
    c: num(r[5]),
  })).filter(f => f.name);
};

// ============================================================
// ACCESS CODE GENERATOR
// Nguyễn Sỹ Đức → DucNS, nếu trùng → DucNS2, DucNS3, ...
// ============================================================

// Bảng chuyển ký tự tiếng Việt có dấu → không dấu
const VI_MAP = {
  à:'a',á:'a',â:'a',ã:'a',ä:'a',å:'a',ă:'a',ắ:'a',ặ:'a',ằ:'a',ẳ:'a',ẵ:'a',ấ:'a',ầ:'a',ẩ:'a',ẫ:'a',ậ:'a',
  è:'e',é:'e',ê:'e',ế:'e',ề:'e',ể:'e',ễ:'e',ệ:'e',
  ì:'i',í:'i',ỉ:'i',ĩ:'i',ị:'i',
  ò:'o',ó:'o',ô:'o',ố:'o',ồ:'o',ổ:'o',ỗ:'o',ộ:'o',ơ:'o',ớ:'o',ờ:'o',ở:'o',ỡ:'o',ợ:'o',
  ù:'u',ú:'u',ư:'u',ứ:'u',ừ:'u',ử:'u',ữ:'u',ự:'u',ủ:'u',ũ:'u',ụ:'u',
  ỳ:'y',ý:'y',ỷ:'y',ỹ:'y',ỵ:'y',
  đ:'d',
  À:'A',Á:'A',Â:'A',Ã:'A',Ä:'A',Å:'A',Ă:'A',Ắ:'A',Ặ:'A',Ằ:'A',Ẳ:'A',Ẵ:'A',Ấ:'A',Ầ:'A',Ẩ:'A',Ẫ:'A',Ậ:'A',
  È:'E',É:'E',Ê:'E',Ế:'E',Ề:'E',Ể:'E',Ễ:'E',Ệ:'E',
  Ì:'I',Í:'I',Ỉ:'I',Ĩ:'I',Ị:'I',
  Ò:'O',Ó:'O',Ô:'O',Ố:'O',Ồ:'O',Ổ:'O',Ỗ:'O',Ộ:'O',Ơ:'O',Ớ:'O',Ờ:'O',Ở:'O',Ỡ:'O',Ợ:'O',
  Ù:'U',Ú:'U',Ư:'U',Ứ:'U',Ừ:'U',Ử:'U',Ữ:'U',Ự:'U',Ủ:'U',Ũ:'U',Ụ:'U',
  Ỳ:'Y',Ý:'Y',Ỷ:'Y',Ỹ:'Y',Ỵ:'Y',
  Đ:'D',
};

const removeAccents = (str) =>
  str.split('').map(c => VI_MAP[c] || c).join('');

// "Nguyễn Sỹ Đức" → "DucNS"
const buildBaseCode = (fullName) => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'client';
  // Tên riêng (phần cuối) viết hoa chữ đầu
  const lastName = removeAccents(parts[parts.length - 1]);
  const lastCapitalized = lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();
  // Các chữ cái đầu của phần còn lại (họ + đệm), viết hoa
  const initials = parts
    .slice(0, parts.length - 1)
    .map(p => removeAccents(p).charAt(0).toUpperCase())
    .join('');
  return lastCapitalized + initials;
};

// Kiểm tra trùng và thêm số nếu cần
const generateUniqueCode = async (fullName, existingIds = []) => {
  const base = buildBaseCode(fullName);
  if (!existingIds.includes(base.toLowerCase())) return base;
  let n = 2;
  while (existingIds.includes((base + n).toLowerCase())) n++;
  return base + n;
};

// ============================================================
// FIRESTORE HELPERS
// ============================================================

// Đường dẫn document cho từng client
const clientDocRef = (clientId) =>
  doc(db, 'roadmaps', clientId);

// Load dữ liệu 1 client
const loadClientData = async (clientId) => {
  const snap = await getDoc(clientDocRef(clientId));
  if (snap.exists()) return snap.data();
  return null;
};

// Lưu dữ liệu 1 client
const saveClientData = async (clientId, data) => {
  await setDoc(clientDocRef(clientId), {
    ...data,
    lastUpdated: new Date().toISOString()
  }, { merge: true });
};

// Load danh sách clients được assign cho PT
const loadPTClients = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid));
  if (snap.exists()) return snap.data();
  return null;
};

// Cập nhật assignedClients của PT
const updatePTClients = async (uid, clients) => {
  await setDoc(doc(db, 'users', uid), { role: 'pt', assignedClients: clients }, { merge: true });
};

// ============================================================
// COMPONENT CHÍNH
// ============================================================
export default function App() {
  // Routing đơn giản: nếu URL là /debug hoặc ?debug=1 → hiện trang Debug
  const isDebugRoute =
    typeof window !== 'undefined' &&
    (window.location.pathname === '/debug' || window.location.search.includes('debug=1'));

  // Phát hiện in-app browser (Zalo, Messenger, Facebook, Instagram...)
  // vì các trình duyệt này chặn đăng nhập Google
  const detectInAppBrowser = () => {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent || '';
    return /Zalo|FBAN|FBAV|FB_IAB|Instagram|Line|MicroMessenger|TikTok/i.test(ua);
  };
  const isInAppBrowser = detectInAppBrowser();

  // Auth state
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'pt' | 'client' | null
  const [authLoading, setAuthLoading] = useState(true);

  // PT state
  const [ptClients, setPtClients] = useState([]); // [{id, name}]
  const [selectedClientId, setSelectedClientId] = useState(null);

  // Client access (không login)
  const [clientAccessCode, setClientAccessCode] = useState('');
  const [clientCodeInput, setClientCodeInput] = useState('');
  const [clientCodeError, setClientCodeError] = useState('');

  // Data state
  const [clientData, setClientData] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'

  // UI state
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);

  // Modal tạo client mới
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [newClientForm, setNewClientForm] = useState({ name: '', age: '', gender: 'Nam', height: '', weight: '', targetWeight: '' });
  const [newClientCode, setNewClientCode] = useState(''); // code vừa được tạo để hiển thị
  const [creatingClient, setCreatingClient] = useState(false);
  const [newClientError, setNewClientError] = useState('');

  // Local editable copies
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [goals, setGoals] = useState(INITIAL_GOALS);
  const [issues, setIssues] = useState(INITIAL_ISSUES);
  const [solutions, setSolutions] = useState(INITIAL_SOLUTIONS);
  const [phases, setPhases] = useState(INITIAL_PHASES);
  const [diet, setDiet] = useState(INITIAL_DIET);
  const [completedSessions, setCompletedSessions] = useState({});

  // Nutrition state
  const [nutritionTargets, setNutritionTargets] = useState({ kcal: 1700, p: 130, c: 150, f: 50 });
  const [nutritionLog, setNutritionLog] = useState({}); // { "2026-06-07": [ {name,kcal,p,c,f} ] }
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [foods, setFoods] = useState([]); // thư viện món từ Google Sheet
  const [foodsLoading, setFoodsLoading] = useState(false);
  const [foodSearch, setFoodSearch] = useState('');

  // Modal góp ý món ăn
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [suggestForm, setSuggestForm] = useState({ name: '', note: '' });
  const [suggestStatus, setSuggestStatus] = useState('idle'); // idle | sending | sent | error

  // Theo dõi trạng thái mạng
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // ============================================================
  // AUTH: Lắng nghe trạng thái đăng nhập
  // ============================================================
  useEffect(() => {
    installGlobalErrorHandlers();
    logInfo('App khởi động', { route: window.location.pathname, session: getSessionId() });

    // Xử lý kết quả sau khi redirect về từ Google
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          logSuccess('Redirect login thành công', { uid: result.user.uid, email: result.user.email });
        }
      })
      .catch((err) => {
        logError('Lỗi redirect result', { code: err.code, message: err.message });
      });

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        logInfo('onAuthStateChanged: có user', { uid: firebaseUser.uid, email: firebaseUser.email });
        setUser(firebaseUser);
        // Check role trong Firestore
        try {
          const ptData = await loadPTClients(firebaseUser.uid);
          if (ptData && ptData.role === 'pt') {
            logSuccess('Xác định role = PT', { clients: (ptData.assignedClients || []).length });
            setUserRole('pt');
            const clients = ptData.assignedClients || [];
            setPtClients(clients);
            if (clients.length > 0) {
              setSelectedClientId(clients[0].id);
            }
          } else {
            logWarn('User đăng nhập nhưng KHÔNG phải PT', {
              uid: firebaseUser.uid,
              docTồnTại: !!ptData,
              roleĐọcĐược: ptData?.role || 'không có document',
            });
            setUserRole('unauthorized');
          }
        } catch (err) {
          logError('Lỗi đọc document users', { code: err.code, message: err.message });
          setUserRole('unauthorized');
        }
      } else {
        logInfo('onAuthStateChanged: chưa có user (chưa đăng nhập)');
        setUser(null);
        setUserRole(null);
      }
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  // ============================================================
  // Theo dõi kết nối mạng
  // ============================================================
  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // ============================================================
  // Đóng modal bằng phím Escape (a11y)
  // ============================================================
  useEffect(() => {
    if (!showNewClientModal && !showSuggestModal) return;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (showNewClientModal) {
        setShowNewClientModal(false);
        setNewClientCode('');
        setNewClientForm({ name: '', age: '', gender: 'Nam', height: '', weight: '', targetWeight: '' });
        setNewClientError('');
      }
      if (showSuggestModal) {
        setShowSuggestModal(false);
        setSuggestStatus('idle');
        setSuggestForm({ name: '', note: '' });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showNewClientModal, showSuggestModal]);

  // ============================================================
  // Load thư viện món ăn từ Google Sheet (1 lần khi app mở)
  // ============================================================
  useEffect(() => {
    const loadFoods = async () => {
      setFoodsLoading(true);
      try {
        const res = await fetch(FOODS_CSV_URL);
        const text = await res.text();
        const parsed = parseFoodsFromCSV(text);
        if (parsed.length > 0) {
          setFoods(parsed);
          logSuccess('Đã tải thư viện món ăn', { count: parsed.length });
        } else {
          logWarn('Thư viện món ăn rỗng hoặc sai định dạng');
        }
      } catch (err) {
        logError('Lỗi tải thư viện món ăn từ Sheet', { message: err.message });
      }
      setFoodsLoading(false);
    };
    loadFoods();
  }, []);

  // ============================================================
  // Load dữ liệu khi PT chọn client
  // ============================================================
  useEffect(() => {
    if (!selectedClientId || userRole !== 'pt') return;
    loadData(selectedClientId);
  }, [selectedClientId, userRole]);

  // ============================================================
  // Load dữ liệu khi client dùng access code
  // ============================================================
  useEffect(() => {
    if (!clientAccessCode) return;
    loadData(clientAccessCode);
  }, [clientAccessCode]);

  const loadData = async (clientId) => {
    setDataLoading(true);
    logInfo('Load dữ liệu client', { clientId });
    try {
      const data = await loadClientData(clientId);
      if (data) {
        logSuccess('Đã load dữ liệu client', { clientId });
        applyData(data);
      } else {
        logWarn('Client chưa có dữ liệu, tạo mặc định', { clientId });
        await saveClientData(clientId, DEFAULT_CLIENT_DATA);
        applyData(DEFAULT_CLIENT_DATA);
      }
    } catch (err) {
      logError('Lỗi load dữ liệu', { clientId, code: err.code, message: err.message });
    }
    setDataLoading(false);
  };

  const applyData = (data) => {
    if (data.profile) setProfile(data.profile);
    if (data.goals) setGoals(data.goals);
    if (data.issues) setIssues(data.issues);
    if (data.solutions) setSolutions(data.solutions);
    if (data.phases) setPhases(data.phases);
    if (data.diet) setDiet(data.diet);
    if (data.completedSessions) setCompletedSessions(data.completedSessions);
    if (data.nutritionTargets) setNutritionTargets(data.nutritionTargets);
    setNutritionLog(data.nutritionLog || {});
    setClientData(data);
  };

  // ============================================================
  // SAVE: PT lưu thay đổi lên Cloud
  // ============================================================
  const handleSaveEdit = async () => {
    const clientId = userRole === 'pt' ? selectedClientId : clientAccessCode;
    if (!clientId) return;
    setIsEditing(false);
    setSaveStatus('saving');
    try {
      await saveClientData(clientId, { profile, goals, issues, solutions, phases, diet, completedSessions, nutritionTargets });
      logSuccess('Lưu lộ trình lên Cloud thành công', { clientId });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      logError('Lỗi lưu lộ trình', { clientId, code: err.code, message: err.message });
      setSaveStatus('error');
    }
  };

  // ============================================================
  // NUTRITION: Thêm / xóa món trong nhật ký theo ngày
  // ============================================================
  const addFoodToLog = async (food) => {
    const clientId = userRole === 'pt' ? selectedClientId : clientAccessCode;
    if (!clientId) return;
    const dayList = nutritionLog[selectedDate] || [];
    const entry = { name: food.name, kcal: food.kcal, p: food.p, c: food.c, f: food.f };
    const newLog = { ...nutritionLog, [selectedDate]: [...dayList, entry] };
    setNutritionLog(newLog);
    await saveClientData(clientId, { nutritionLog: newLog });
  };

  const removeFoodFromLog = async (idx) => {
    const clientId = userRole === 'pt' ? selectedClientId : clientAccessCode;
    if (!clientId) return;
    const dayList = [...(nutritionLog[selectedDate] || [])];
    dayList.splice(idx, 1);
    const newLog = { ...nutritionLog, [selectedDate]: dayList };
    setNutritionLog(newLog);
    await saveClientData(clientId, { nutritionLog: newLog });
  };

  // ============================================================
  // GÓP Ý MÓN ĂN
  // ============================================================
  const handleSubmitSuggestion = async () => {
    if (!suggestForm.name.trim()) return;
    setSuggestStatus('sending');
    try {
      const clientId = userRole === 'pt' ? selectedClientId : clientAccessCode;
      await addDoc(collection(db, 'food_suggestions'), {
        name: suggestForm.name.trim(),
        note: suggestForm.note.trim(),
        submittedBy: clientId || 'unknown',
        submittedByRole: userRole,
        createdAt: serverTimestamp(),
      });
      setSuggestStatus('sent');
      setSuggestForm({ name: '', note: '' });
      logInfo('Góp ý món ăn', { name: suggestForm.name.trim() });
    } catch (err) {
      logError('Lỗi gửi góp ý', { message: err.message });
      setSuggestStatus('error');
    }
  };

  // ============================================================
  // CLIENT: Tích hoàn thành bài tập
  // ============================================================
  const toggleSessionComplete = async (uniqueId) => {
    const clientId = userRole === 'pt' ? selectedClientId : clientAccessCode;
    if (!clientId) return;
    const newCompleted = { ...completedSessions, [uniqueId]: !completedSessions[uniqueId] };
    setCompletedSessions(newCompleted);
    await saveClientData(clientId, { completedSessions: newCompleted });
  };

  // ============================================================
  // CLIENT ACCESS CODE
  // ============================================================
  const handleClientCodeSubmit = async (e) => {
    e.preventDefault();
    if (!clientCodeInput.trim()) return;
    setClientCodeError('');
    setDataLoading(true);
    try {
      // Kiểm tra xem clientId này có tồn tại không
      const snap = await getDoc(doc(db, 'roadmaps', clientCodeInput.trim()));
      if (snap.exists()) {
        setClientAccessCode(clientCodeInput.trim());
        setUserRole('client');
      } else {
        setClientCodeError('Mã truy cập không tồn tại. Vui lòng kiểm tra lại.');
      }
    } catch (err) {
      setClientCodeError('Lỗi kết nối. Thử lại sau.');
    }
    setDataLoading(false);
  };

  // ============================================================
  // GOOGLE SIGN IN / OUT
  // ============================================================
  const handleGoogleSignIn = async () => {
    try {
      logInfo('Bắt đầu đăng nhập Google (popup)...');
      const result = await signInWithPopup(auth, googleProvider);
      logSuccess('Popup login thành công', { uid: result.user.uid, email: result.user.email });
    } catch (err) {
      logError('Lỗi đăng nhập Google (popup)', { code: err.code, message: err.message });
      // Nếu popup thực sự bị chặn → thử redirect
      if (err.code === 'auth/popup-blocked') {
        logWarn('Popup bị chặn, chuyển sang redirect');
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (e2) {
          logError('Redirect cũng lỗi', { code: e2.code, message: e2.message });
        }
      }
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setUserRole(null);
    setUser(null);
    setPtClients([]);
    setSelectedClientId(null);
    setClientData(null);
    setClientAccessCode('');
  };

  // ============================================================
  // TẠO CLIENT MỚI
  // ============================================================
  const handleCreateClient = async () => {
    if (!newClientForm.name.trim()) {
      setNewClientError('Vui lòng nhập tên học viên.');
      return;
    }
    setCreatingClient(true);
    setNewClientError('');
    try {
      // Lấy danh sách ID hiện có để tránh trùng
      const existingIds = ptClients.map(c => c.id.toLowerCase());
      const code = await generateUniqueCode(newClientForm.name, existingIds);

      // Tính BMR nếu có đủ thông tin
      const w = parseFloat(newClientForm.weight) || 70;
      const h = parseFloat(newClientForm.height) || 170;
      const age = parseFloat(newClientForm.age) || 25;
      const bmr = Math.round(66.5 + 13.75 * w + 5.003 * h - 6.755 * age);
      const tdee = Math.round(bmr * 1.3);

      const newProfile = {
        name: newClientForm.name.trim(),
        age,
        gender: newClientForm.gender,
        height: h,
        weight: w,
        targetWeight: parseFloat(newClientForm.targetWeight) || w - 5,
        bmr,
        tdee,
        activeFactor: 1.3,
      };

      // Tạo document roadmap cho client với dữ liệu mặc định
      const clientInitData = {
        ...DEFAULT_CLIENT_DATA,
        profile: newProfile,
      };
      await saveClientData(code, clientInitData);

      // Cập nhật assignedClients của PT
      const updatedClients = [...ptClients, { id: code, name: newClientForm.name.trim() }];
      await updatePTClients(user.uid, updatedClients);
      setPtClients(updatedClients);
      logSuccess('Tạo client mới thành công', { code, name: newClientForm.name.trim() });

      // Tự động chuyển sang client mới (dù PT đóng modal kiểu nào cũng đúng client)
      setIsEditing(false);
      setClientData(null);
      setSelectedClientId(code);

      // Hiển thị code để PT copy
      setNewClientCode(code);
      setNewClientForm({ name: '', age: '', gender: 'Nam', height: '', weight: '', targetWeight: '' });
    } catch (err) {
      logError('Lỗi tạo client', { code: err.code, message: err.message });
      setNewClientError('Có lỗi xảy ra. Thử lại sau.');
    }
    setCreatingClient(false);
  };

  const handleCloseNewClientModal = () => {
    setShowNewClientModal(false);
    setNewClientCode('');
    setNewClientForm({ name: '', age: '', gender: 'Nam', height: '', weight: '', targetWeight: '' });
    setNewClientError('');
  };

  // ============================================================
  // EDIT HELPERS
  // ============================================================
  const calculateBMI = (w, h) => {
    if (!w || !h) return 0;
    return (w / ((h / 100) ** 2)).toFixed(1);
  };

  const handleProfileChange = (key, val) => {
    const updated = { ...profile, [key]: val };
    if (key === 'weight' || key === 'height') {
      const w = key === 'weight' ? parseFloat(val) : parseFloat(profile.weight);
      const h = key === 'height' ? parseFloat(val) : parseFloat(profile.height);
      const age = parseFloat(profile.age);
      if (w && h && age) {
        const bmrCalc = Math.round(66.5 + (13.75 * w) + (5.003 * h) - (6.755 * age));
        updated.bmr = bmrCalc;
        updated.tdee = Math.round(bmrCalc * profile.activeFactor);
      }
    }
    setProfile(updated);
  };

  const handleListChange = (setter, list, index, value) => {
    const newList = [...list];
    newList[index] = value;
    setter(newList);
  };

  // ============================================================
  // STATS
  // ============================================================
  const completedWorkoutsCount = Object.values(completedSessions).filter(Boolean).length;
  const totalWorkoutsCount = phases.reduce((acc, p) => acc + p.blocks.reduce((bAcc, b) => bAcc + b.exercises.length, 0), 0);
  const workoutProgressPercentage = totalWorkoutsCount ? Math.round((completedWorkoutsCount / totalWorkoutsCount) * 100) : 0;
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayNutrition = (nutritionLog[todayKey] || []).reduce((a, e) => ({
    kcal: a.kcal + (e.kcal || 0), p: a.p + (e.p || 0),
  }), { kcal: 0, p: 0 });
  const mealProgressPercentage = nutritionTargets.kcal > 0
    ? Math.min(100, Math.round((todayNutrition.kcal / nutritionTargets.kcal) * 100)) : 0;

  const currentClientName = userRole === 'pt'
    ? (ptClients.find(c => c.id === selectedClientId)?.name || selectedClientId)
    : (profile?.name || clientAccessCode);

  // ============================================================
  // RENDER: Trang Debug (/debug)
  // ============================================================
  if (isDebugRoute) {
    return <DebugPage user={user} authLoading={authLoading} onGoogleSignIn={handleGoogleSignIn} />;
  }

  // ============================================================
  // RENDER: Loading
  // ============================================================
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER: Trang chọn vai trò (chưa đăng nhập, chưa có access code)
  // ============================================================
  if (!userRole || userRole === 'unauthorized') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 bg-blue-600 rounded-2xl mb-4">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">KICKBOXING TRACKER</h1>
            <p className="text-slate-400 text-sm mt-1">Chọn cách truy cập</p>
          </div>

          {userRole === 'unauthorized' && (
            <div className="bg-rose-900/30 border border-rose-700 text-rose-300 px-4 py-3 rounded-xl text-sm mb-4 text-center">
              Tài khoản Google này chưa được phân quyền PT.<br />
              <span className="text-xs text-rose-400">Liên hệ admin để được cấp quyền.</span>
              <button onClick={handleSignOut} className="block mx-auto mt-2 text-xs text-rose-400 underline">
                Đăng xuất
              </button>
            </div>
          )}

          <div className="space-y-4">
            {/* PT Login */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
              <h2 className="text-white font-bold text-sm mb-1 flex items-center gap-2">
                <span className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center text-[11px]">PT</span>
                Huấn Luyện Viên
              </h2>
              <p className="text-slate-400 text-xs mb-4">Đăng nhập bằng tài khoản Google được phân quyền</p>

              {isInAppBrowser ? (
                <div className="bg-amber-950/40 border border-amber-700 rounded-xl p-4">
                  <p className="text-amber-300 text-xs font-bold mb-2">⚠️ Không đăng nhập được trong Zalo/Messenger</p>
                  <p className="text-amber-200/80 text-[11px] leading-relaxed mb-3">
                    Google chặn đăng nhập từ trình duyệt trong ứng dụng. Vui lòng mở bằng <strong>Safari</strong> hoặc <strong>Chrome</strong>:
                  </p>
                  <ol className="text-amber-200/80 text-[11px] leading-relaxed space-y-1 list-decimal list-inside mb-3">
                    <li>Bấm nút <strong>•••</strong> hoặc biểu tượng chia sẻ ở góc màn hình</li>
                    <li>Chọn <strong>"Mở trong Safari"</strong> / <strong>"Mở trong trình duyệt"</strong></li>
                    <li>Đăng nhập Google lại ở đó</li>
                  </ol>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(window.location.href);
                    }}
                    className="w-full bg-amber-700 hover:bg-amber-600 text-white font-semibold py-2 rounded-lg text-xs transition-all"
                  >
                    📋 Copy link để dán vào trình duyệt
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGoogleSignIn}
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
              )}
            </div>

            {/* Client Access */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
              <h2 className="text-white font-bold text-sm mb-1 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-[11px]">HV</span>
                Học Viên
              </h2>
              <p className="text-slate-400 text-xs mb-4">Nhập mã truy cập do PT cung cấp</p>
              <form onSubmit={handleClientCodeSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="VD: anh-duc"
                  value={clientCodeInput}
                  onChange={(e) => setClientCodeInput(e.target.value)}
                  className="flex-1 bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={dataLoading}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all disabled:opacity-50"
                >
                  {dataLoading ? '...' : 'Vào'}
                </button>
              </form>
              {clientCodeError && (
                <p className="text-rose-400 text-xs mt-2">{clientCodeError}</p>
              )}
            </div>
          </div>

          {/* Link debug */}
          <p className="text-center mt-6">
            <a href="/debug" className="text-[11px] text-slate-600 hover:text-slate-400 transition-colors">
              🐞 Xem nhật ký hệ thống (debug)
            </a>
          </p>
        </div>
      </div>
    );
  }
  if (dataLoading || !clientData && (userRole === 'pt' && selectedClientId)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER: PT chưa có client nào
  // ============================================================
  if (userRole === 'pt' && ptClients.length === 0 && !showNewClientModal) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-4">📋</div>
          <h2 className="text-lg font-bold text-slate-800">Chưa có học viên nào</h2>
          <p className="text-slate-500 text-sm mt-2">Tạo học viên đầu tiên để bắt đầu.</p>
          <button
            onClick={() => setShowNewClientModal(true)}
            className="mt-5 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-all"
          >
            + Tạo học viên đầu tiên
          </button>
          <button onClick={handleSignOut} className="mt-4 block mx-auto text-sm text-slate-400 underline">
            Đăng xuất
          </button>
        </div>
        {showNewClientModal && renderNewClientModal()}
      </div>
    );
  }

  // ============================================================
  // RENDER: Modal tạo client mới
  // ============================================================
  const renderNewClientModal = () => (
    <div onClick={handleCloseNewClientModal} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-modal flex items-center justify-center p-4">
      <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="new-client-title" className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 id="new-client-title" className="text-base font-bold text-slate-800">Thêm Học Viên Mới</h2>
          <button onClick={handleCloseNewClientModal} aria-label="Đóng" className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-sm font-bold transition-all">✕</button>
        </div>

        {/* Nếu đã tạo xong → hiển thị mã truy cập */}
        {newClientCode ? (
          <div className="px-6 py-6 text-center">
            <div className="text-3xl mb-3">🎉</div>
            <h3 className="font-bold text-slate-800 text-base mb-1">Tạo thành công!</h3>
            <p className="text-slate-500 text-sm mb-4">Gửi mã này cho học viên để họ truy cập lộ trình:</p>
            <div className="bg-slate-900 text-white font-mono text-xl font-black px-6 py-3 rounded-xl inline-block tracking-wider mb-4">
              {newClientCode}
            </div>
            <p className="text-slate-400 text-xs mb-6">Học viên mở app → chọn "Học Viên" → nhập mã này</p>
            <div className="flex gap-3">
              <button
                onClick={() => navigator.clipboard.writeText(newClientCode)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-all"
              >
                📋 Copy mã
              </button>
              <button
                onClick={handleCloseNewClientModal}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-all"
              >
                Xem lộ trình →
              </button>
            </div>
          </div>
        ) : (
          <div className="px-6 py-5 space-y-4">
            {/* Tên */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Tên học viên <span className="text-rose-500">*</span></label>
              <input
                type="text"
                autoFocus
                placeholder="VD: Nguyễn Sỹ Đức"
                value={newClientForm.name}
                onChange={(e) => setNewClientForm({ ...newClientForm, name: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              />
              {newClientForm.name.trim() && (
                <p className="text-[11px] text-slate-500 mt-1">
                  Mã dự kiến: <span className="font-mono font-bold text-blue-600">{buildBaseCode(newClientForm.name)}</span>
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Tuổi</label>
                <input type="number" placeholder="25" value={newClientForm.age}
                  onChange={(e) => setNewClientForm({ ...newClientForm, age: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Giới tính</label>
                <select value={newClientForm.gender}
                  onChange={(e) => setNewClientForm({ ...newClientForm, gender: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 bg-white">
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Cao (cm)</label>
                <input type="number" placeholder="170" value={newClientForm.height}
                  onChange={(e) => setNewClientForm({ ...newClientForm, height: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Nặng (kg)</label>
                <input type="number" placeholder="70" value={newClientForm.weight}
                  onChange={(e) => setNewClientForm({ ...newClientForm, weight: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Mục tiêu (kg)</label>
                <input type="number" placeholder="65" value={newClientForm.targetWeight}
                  onChange={(e) => setNewClientForm({ ...newClientForm, targetWeight: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
              </div>
            </div>

            {newClientError && (
              <p className="text-rose-500 text-xs">{newClientError}</p>
            )}

            <button
              onClick={handleCreateClient}
              disabled={creatingClient}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
            >
              {creatingClient ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang tạo...</>
              ) : (
                '✓ Tạo học viên'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // ============================================================
  // RENDER: App chính
  // ============================================================
  const NAV = [
    { id: 'overview', label: 'Thể trạng', Icon: Activity },
    { id: 'workouts', label: 'Lộ trình', Icon: Zap },
    { id: 'nutrition', label: 'Nhật ký ăn', Icon: Utensils },
  ];
  const remainingKg = (parseFloat(profile.weight) - parseFloat(profile.targetWeight));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans md:flex">

      {/* ===== SIDEBAR (desktop) ===== */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-slate-900 text-white z-sticky">
        <div className="p-5 flex items-center gap-3 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
            <Zap size={20} className="text-white" />
          </div>
          <div className="leading-tight min-w-0">
            <div className="text-[13px] font-extrabold tracking-tight">KICKBOXING</div>
            <div className="text-[11px] text-slate-500 font-semibold truncate">
              {userRole === 'pt' ? (user?.displayName || user?.email) : currentClientName}
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-1">
          {NAV.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold transition-colors ${
                activeTab === id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}>
              <Icon size={19} strokeWidth={2} /> {label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-800 space-y-2">
          {userRole === 'pt' && ptClients.length > 1 && (
            <select value={selectedClientId || ''}
              onChange={(e) => { setSelectedClientId(e.target.value); setIsEditing(false); setClientData(null); }}
              className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500">
              {ptClients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
          {userRole === 'pt' && (
            <button onClick={() => setShowNewClientModal(true)}
              className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2 text-xs font-bold transition-colors">
              <UserPlus size={15} /> Thêm học viên
            </button>
          )}
          {userRole === 'pt' && (
            <button onClick={() => { if (isEditing) handleSaveEdit(); else setIsEditing(true); }}
              className={`w-full flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-colors ${
                isEditing ? 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}>
              {isEditing ? <Save size={15} /> : <Pencil size={15} />}
              {isEditing ? 'Lưu lên Cloud' : 'Chỉnh sửa'}
            </button>
          )}
          {saveStatus === 'saving' && <p className="text-[11px] text-slate-400 text-center">Đang lưu...</p>}
          {saveStatus === 'saved' && <p className="text-[11px] text-emerald-400 text-center">✓ Đã lưu</p>}
          {saveStatus === 'error' && <p className="text-[11px] text-rose-400 text-center">✗ Lỗi lưu</p>}
          <button
            onClick={userRole === 'pt' ? handleSignOut : () => { setUserRole(null); setClientAccessCode(''); setClientData(null); }}
            className="w-full flex items-center justify-center gap-1.5 text-[11px] text-slate-400 hover:text-rose-300 py-1.5 transition-colors">
            <LogOut size={14} /> {userRole === 'pt' ? 'Đăng xuất' : 'Thoát'}
          </button>
          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 font-semibold pt-1">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-rose-500'}`} />
            {isOnline ? 'Trực tuyến' : 'Mất kết nối'}
          </div>
        </div>
      </aside>

      {/* ===== CỘT NỘI DUNG ===== */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">

        {/* TOP BAR (mobile) */}
        <header className="md:hidden sticky top-0 z-sticky bg-slate-900 text-white">
          <div className="px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                <Zap size={18} className="text-white" />
              </div>
              <div className="leading-tight min-w-0">
                <div className="text-[13px] font-extrabold tracking-tight">KICKBOXING</div>
                <div className="text-[11px] text-slate-400 truncate">
                  {userRole === 'pt' ? `PT: ${user?.displayName || user?.email}` : currentClientName}
                </div>
              </div>
            </div>
            <button
              onClick={userRole === 'pt' ? handleSignOut : () => { setUserRole(null); setClientAccessCode(''); setClientData(null); }}
              className="shrink-0 flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-300 px-2 py-1.5">
              <LogOut size={14} /> {userRole === 'pt' ? 'Đăng xuất' : 'Thoát'}
            </button>
          </div>
          {userRole === 'pt' && (
            <div className="px-4 pb-3 flex flex-wrap items-center gap-2 border-t border-slate-800 pt-2.5">
              {ptClients.length > 1 && (
                <select value={selectedClientId || ''}
                  onChange={(e) => { setSelectedClientId(e.target.value); setIsEditing(false); setClientData(null); }}
                  className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-500">
                  {ptClients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              )}
              <button onClick={() => setShowNewClientModal(true)}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white rounded-full px-3 py-1.5 text-[11px] font-bold">
                <UserPlus size={13} /> Thêm
              </button>
              <button onClick={() => { if (isEditing) handleSaveEdit(); else setIsEditing(true); }}
                className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold ${
                  isEditing ? 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}>
                {isEditing ? <Save size={13} /> : <Pencil size={13} />}
                {isEditing ? 'Lưu' : 'Sửa'}
              </button>
              {saveStatus === 'saving' && <span className="text-[11px] text-slate-400">Đang lưu...</span>}
              {saveStatus === 'saved' && <span className="text-[11px] text-emerald-400">✓ Đã lưu</span>}
              {saveStatus === 'error' && <span className="text-[11px] text-rose-400">✗ Lỗi</span>}
            </div>
          )}
        </header>

        {/* Banner mất mạng */}
        {!isOnline && (
          <div className="bg-rose-600 text-white text-center text-xs font-bold py-2 px-4">
            Mất kết nối mạng — các thay đổi có thể không được lưu.
          </div>
        )}

        <main className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-8 py-6 pb-28 md:pb-10">

          {/* Dải báo chế độ */}
          <div className={`mb-5 rounded-xl px-4 py-2.5 text-xs flex items-center gap-2 border ${
            userRole === 'pt' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <span className={`w-2 h-2 rounded-full shrink-0 ${userRole === 'pt' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
            {userRole === 'pt' ? (
              <span><strong>Chế độ PT</strong> — Đang xem lộ trình của <strong>{currentClientName}</strong>.{isEditing && <strong className="text-amber-700"> Đang sửa, nhớ Lưu.</strong>}</span>
            ) : (
              <span><strong>Chế độ Học Viên</strong> — Bạn có thể tích hoàn thành bài tập và ghi nhật ký ăn.</span>
            )}
          </div>

          {/* ===== TAB: THỂ TRẠNG ===== */}
          {activeTab === 'overview' && (
            <div className="space-y-6">

              {/* Dải chỉ số chủ đạo */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 md:p-6">
                <div className="text-[11px] font-bold uppercase tracking-wider text-blue-400">{profile.name || currentClientName}{profile.age ? ` · ${profile.age} tuổi` : ''}</div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mt-3">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-extrabold tabular-nums tracking-tight leading-none">{profile.weight || '--'}</span>
                      <span className="text-sm text-slate-400 font-semibold">kg</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-2 font-medium">
                      Mục tiêu <span className="text-slate-200 font-bold tabular-nums">{profile.targetWeight || '--'} kg</span>
                      {!isNaN(remainingKg) && <> · còn <span className="text-orange-400 font-bold tabular-nums">{remainingKg.toFixed(1)}</span></>}
                    </div>
                  </div>
                  <div className="flex border-t md:border-t-0 border-slate-800 pt-4 md:pt-0">
                    <div className="flex-1 md:w-24 md:text-center md:border-l border-slate-800 md:px-4">
                      <div className="text-[11px] font-bold tracking-wide text-slate-400">BMI</div>
                      <div className="text-xl font-extrabold text-amber-400 tabular-nums mt-1">{calculateBMI(profile.weight, profile.height)}</div>
                    </div>
                    <div className="flex-1 md:w-24 md:text-center border-l border-slate-800 px-4">
                      <div className="text-[11px] font-bold tracking-wide text-slate-400">BMR</div>
                      <div className="text-xl font-extrabold text-blue-400 tabular-nums mt-1">{profile.bmr}</div>
                    </div>
                    <div className="flex-1 md:w-24 md:text-center border-l border-slate-800 px-4">
                      <div className="text-[11px] font-bold tracking-wide text-slate-400">TDEE</div>
                      <div className="text-xl font-extrabold text-rose-400 tabular-nums mt-1">{profile.tdee}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hai thanh tiến độ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Hoàn thành tập</span>
                    <span className="text-lg font-extrabold text-blue-600 tabular-nums">{workoutProgressPercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full transition-all duration-500 motion-reduce:transition-none" style={{ width: `${workoutProgressPercentage}%` }} />
                  </div>
                  <div className="text-[11px] text-slate-500 mt-2 tabular-nums">{completedWorkoutsCount}/{totalWorkoutsCount} bài tập</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Calo hôm nay</span>
                    <span className="text-lg font-extrabold text-emerald-600 tabular-nums">{mealProgressPercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-500 motion-reduce:transition-none" style={{ width: `${mealProgressPercentage}%` }} />
                  </div>
                  <div className="text-[11px] text-slate-500 mt-2 tabular-nums">{Math.round(todayNutrition.kcal)}/{nutritionTargets.kcal} kcal</div>
                </div>
              </div>

              {/* PT chỉnh sửa thông số cơ thể */}
              {isEditing && userRole === 'pt' && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm grid grid-cols-2 sm:grid-cols-5 gap-4">
                  <label className="text-xs">
                    <span className="block font-bold text-slate-500 mb-1">Họ tên</span>
                    <input type="text" value={profile.name} onChange={(e) => handleProfileChange('name', e.target.value)}
                      className="w-full border-b border-slate-300 py-1 focus:border-blue-500 focus:outline-none" />
                  </label>
                  <label className="text-xs">
                    <span className="block font-bold text-slate-500 mb-1">Tuổi</span>
                    <input type="number" value={profile.age} onChange={(e) => handleProfileChange('age', e.target.value)}
                      className="w-full border-b border-slate-300 py-1 focus:border-blue-500 focus:outline-none" />
                  </label>
                  <label className="text-xs">
                    <span className="block font-bold text-slate-500 mb-1">Cao (cm)</span>
                    <input type="number" value={profile.height} onChange={(e) => handleProfileChange('height', e.target.value)}
                      className="w-full border-b border-slate-300 py-1 focus:border-blue-500 focus:outline-none" />
                  </label>
                  <label className="text-xs">
                    <span className="block font-bold text-slate-500 mb-1">Nặng (kg)</span>
                    <input type="number" step="0.1" value={profile.weight} onChange={(e) => handleProfileChange('weight', e.target.value)}
                      className="w-full border-b border-slate-300 py-1 focus:border-blue-500 focus:outline-none" />
                  </label>
                  <label className="text-xs">
                    <span className="block font-bold text-slate-500 mb-1">Mục tiêu (kg)</span>
                    <input type="number" value={profile.targetWeight} onChange={(e) => handleProfileChange('targetWeight', e.target.value)}
                      className="w-full border-b border-slate-300 py-1 focus:border-blue-500 focus:outline-none" />
                  </label>
                </div>
              )}

              {/* Mục tiêu / Yếu điểm / Định hướng */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-5">
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <Target size={17} className="text-blue-600" />
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">Mục tiêu khách hàng</h3>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm divide-y divide-slate-100">
                      {goals.map((goal, idx) => (
                        <div key={idx} className="px-4 py-3 flex items-start gap-3">
                          <span className="text-blue-600 font-extrabold text-xs tabular-nums mt-0.5">{String(idx + 1).padStart(2, '0')}</span>
                          {isEditing && userRole === 'pt' ? (
                            <div className="flex-1 flex gap-2">
                              <input type="text" value={goal} onChange={(e) => handleListChange(setGoals, goals, idx, e.target.value)}
                                className="flex-1 border-b border-slate-200 text-[13px] py-0.5 focus:border-blue-500 focus:outline-none" />
                              <button onClick={() => setGoals(goals.filter((_, i) => i !== idx))} className="text-rose-500 hover:text-rose-700"><Trash2 size={14} /></button>
                            </div>
                          ) : (
                            <span className="text-[13px] text-slate-700 leading-relaxed">{goal}</span>
                          )}
                        </div>
                      ))}
                    </div>
                    {isEditing && userRole === 'pt' && (
                      <button onClick={() => setGoals([...goals, "Mục tiêu mới"])} className="mt-2 flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700"><Plus size={13} /> Thêm mục tiêu</button>
                    )}
                  </section>

                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle size={17} className="text-rose-500" />
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">Thể trạng cần lưu ý</h3>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm divide-y divide-slate-100">
                      {issues.map((issue, idx) => (
                        <div key={idx} className="px-4 py-3 flex items-start gap-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                          {isEditing && userRole === 'pt' ? (
                            <div className="flex-1 flex gap-2">
                              <input type="text" value={issue} onChange={(e) => handleListChange(setIssues, issues, idx, e.target.value)}
                                className="flex-1 border-b border-slate-200 text-[13px] py-0.5 focus:border-blue-500 focus:outline-none" />
                              <button onClick={() => setIssues(issues.filter((_, i) => i !== idx))} className="text-rose-500 hover:text-rose-700"><Trash2 size={14} /></button>
                            </div>
                          ) : (
                            <span className="text-[13px] text-slate-700 leading-relaxed">{issue}</span>
                          )}
                        </div>
                      ))}
                    </div>
                    {isEditing && userRole === 'pt' && (
                      <button onClick={() => setIssues([...issues, "Yếu điểm mới"])} className="mt-2 flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700"><Plus size={13} /> Thêm yếu điểm</button>
                    )}
                  </section>
                </div>

                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Wrench size={17} className="text-emerald-600" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">Định hướng của HLV</h3>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm divide-y divide-slate-100">
                    {solutions.map((sol, idx) => (
                      <div key={idx} className="px-4 py-3 flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-[11px] font-extrabold shrink-0 mt-0.5">{idx + 1}</div>
                        {isEditing && userRole === 'pt' ? (
                          <div className="flex-1 flex gap-2">
                            <textarea value={sol} rows={2} onChange={(e) => handleListChange(setSolutions, solutions, idx, e.target.value)}
                              className="flex-1 border border-slate-200 rounded-lg text-[13px] p-1.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none" />
                            <button onClick={() => setSolutions(solutions.filter((_, i) => i !== idx))} className="text-rose-500 hover:text-rose-700 h-fit"><Trash2 size={14} /></button>
                          </div>
                        ) : (
                          <span className="text-[13px] text-slate-700 leading-relaxed">{sol}</span>
                        )}
                      </div>
                    ))}
                  </div>
                  {isEditing && userRole === 'pt' && (
                    <button onClick={() => setSolutions([...solutions, "Định hướng mới"])} className="mt-2 flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700"><Plus size={13} /> Thêm định hướng</button>
                  )}
                </section>
              </div>
            </div>
          )}

          {/* ===== TAB: LỘ TRÌNH ===== */}
          {activeTab === 'workouts' && (
            <div className="space-y-6">
              {phases.map((phase, pIdx) => {
                const phaseTotal = phase.blocks.reduce((a, b) => a + b.exercises.length, 0);
                let phaseDone = 0;
                phase.blocks.forEach((b, bIdx) => { b.exercises.forEach((_, eIdx) => { if (completedSessions[`${pIdx}-${bIdx}-${eIdx}`]) phaseDone++; }); });
                return (
                  <div key={phase.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-slate-900 text-white p-4">
                      {isEditing && userRole === 'pt' ? (
                        <div className="flex items-start gap-2">
                          <input type="text" value={phase.title} placeholder="Tên giai đoạn (Phase)..."
                            onChange={(e) => { const n = [...phases]; n[pIdx].title = e.target.value; setPhases(n); }}
                            className="flex-1 text-base font-bold bg-transparent border-b border-blue-400 focus:outline-none text-white placeholder-slate-500" />
                          <button onClick={() => { if (window.confirm('Xóa cả giai đoạn này?')) setPhases(phases.filter((_, i) => i !== pIdx)); }}
                            className="text-rose-400 hover:text-rose-300 text-[11px] font-bold border border-rose-800 rounded px-2 py-1 shrink-0">Xóa Phase</button>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-base font-bold leading-snug">{phase.title}</h3>
                          {phaseTotal > 0 && <span className="shrink-0 text-[11px] font-bold text-slate-900 bg-emerald-400 px-2.5 py-1 rounded-full tabular-nums">{phaseDone}/{phaseTotal}</span>}
                        </div>
                      )}
                      {isEditing && userRole === 'pt' ? (
                        <textarea value={phase.desc} rows={2} placeholder="Mô tả mục đích giai đoạn..."
                          onChange={(e) => { const n = [...phases]; n[pIdx].desc = e.target.value; setPhases(n); }}
                          className="w-full mt-2 text-xs text-slate-300 bg-transparent border border-slate-700 rounded-lg p-1.5 focus:outline-none placeholder-slate-500" />
                      ) : (
                        <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{phase.desc}</p>
                      )}
                    </div>

                    <div className="divide-y divide-slate-100">
                      {phase.blocks.map((block, bIdx) => (
                        <div key={bIdx} className="p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                              {isEditing && userRole === 'pt' ? (
                                <input type="text" value={block.name}
                                  onChange={(e) => { const n = [...phases]; n[pIdx].blocks[bIdx].name = e.target.value; setPhases(n); }}
                                  className="flex-1 font-bold text-slate-800 text-sm border-b border-slate-300 focus:border-blue-500 focus:outline-none" />
                              ) : (
                                <h4 className="font-bold text-slate-800 text-sm truncate">{block.name}</h4>
                              )}
                            </div>
                            {isEditing && userRole === 'pt' ? (
                              <div className="flex items-center gap-2">
                                <input type="text" value={block.sessions} placeholder="VD: Buổi 1-5"
                                  onChange={(e) => { const n = [...phases]; n[pIdx].blocks[bIdx].sessions = e.target.value; setPhases(n); }}
                                  className="w-28 text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-bold border border-blue-200 text-right focus:outline-none" />
                                <button onClick={() => { if (window.confirm('Xóa block này?')) { const n = [...phases]; n[pIdx].blocks = n[pIdx].blocks.filter((_, i) => i !== bIdx); setPhases(n); } }}
                                  className="text-rose-500 hover:text-rose-700 text-[11px] font-bold border border-rose-200 rounded px-2 py-0.5 shrink-0">Xóa Block</button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full font-bold whitespace-nowrap shrink-0">{block.sessions}</span>
                            )}
                          </div>

                          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-3">
                            {isEditing && userRole === 'pt' ? (
                              <textarea value={block.target} rows={2}
                                onChange={(e) => { const n = [...phases]; n[pIdx].blocks[bIdx].target = e.target.value; setPhases(n); }}
                                className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded-lg p-1.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none" />
                            ) : (
                              <p className="text-xs text-slate-700 leading-relaxed"><strong className="text-blue-700">Mục tiêu:</strong> {block.target}</p>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            {block.exercises.map((ex, eIdx) => {
                              const uniqueId = `${pIdx}-${bIdx}-${eIdx}`;
                              const isDone = !!completedSessions[uniqueId];
                              return (
                                <div key={eIdx} className={`flex items-start gap-3 p-2.5 rounded-lg border transition-colors ${
                                  isDone ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-100 hover:border-slate-200'
                                }`}>
                                  <button onClick={() => toggleSessionComplete(uniqueId)} role="checkbox" aria-checked={isDone} aria-label={ex} className="mt-0.5 shrink-0">
                                    {isDone ? (
                                      <span className="w-4 h-4 rounded bg-emerald-600 flex items-center justify-center"><Check size={12} className="text-white" strokeWidth={3} /></span>
                                    ) : (
                                      <span className="block w-4 h-4 rounded border border-slate-300 hover:border-blue-500" />
                                    )}
                                  </button>
                                  {isEditing && userRole === 'pt' ? (
                                    <div className="flex-1 flex gap-2">
                                      <input type="text" value={ex}
                                        onChange={(e) => { const n = [...phases]; n[pIdx].blocks[bIdx].exercises[eIdx] = e.target.value; setPhases(n); }}
                                        className="flex-1 border-b border-slate-200 text-xs py-0.5 focus:outline-none focus:border-blue-500" />
                                      <button onClick={() => { const n = [...phases]; n[pIdx].blocks[bIdx].exercises = n[pIdx].blocks[bIdx].exercises.filter((_, i) => i !== eIdx); setPhases(n); }}
                                        className="text-rose-500 hover:text-rose-700"><Trash2 size={14} /></button>
                                    </div>
                                  ) : (
                                    <span className={`text-xs leading-relaxed ${isDone ? 'line-through text-slate-400' : 'text-slate-700'}`}>{ex}</span>
                                  )}
                                </div>
                              );
                            })}
                            {isEditing && userRole === 'pt' && (
                              <button onClick={() => { const n = [...phases]; n[pIdx].blocks[bIdx].exercises.push("Bài tập mới"); setPhases(n); }}
                                className="mt-1 flex items-center gap-1 text-[11px] text-blue-600 font-bold hover:text-blue-700"><Plus size={13} /> Thêm bài tập</button>
                            )}
                          </div>
                        </div>
                      ))}

                      {isEditing && userRole === 'pt' && (
                        <div className="p-4">
                          <button onClick={() => { const n = [...phases]; n[pIdx].blocks.push({ name: 'Block mới', sessions: 'Buổi ...', target: '', exercises: [] }); setPhases(n); }}
                            className="w-full border-2 border-dashed border-blue-200 hover:border-blue-400 text-blue-600 rounded-lg py-2 text-xs font-bold transition-colors">+ Thêm Block vào giai đoạn này</button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isEditing && userRole === 'pt' && (
                <button onClick={() => { const newId = phases.length > 0 ? Math.max(...phases.map(p => p.id || 0)) + 1 : 1; setPhases([...phases, { id: newId, title: 'Giai đoạn mới', desc: '', blocks: [] }]); }}
                  className="w-full border-2 border-dashed border-slate-300 hover:border-blue-400 text-slate-600 hover:text-blue-600 rounded-xl py-4 text-sm font-bold transition-colors">+ Thêm Giai Đoạn (Phase) mới</button>
              )}

              {phases.length === 0 && !(isEditing && userRole === 'pt') && (
                <div className="bg-white border border-dashed border-slate-200 rounded-xl p-10 text-center">
                  <Zap size={28} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500 text-sm">Chưa có lộ trình tập luyện.</p>
                  {userRole === 'pt' && <p className="text-slate-500 text-xs mt-1">Bấm "Chỉnh sửa" để thêm giai đoạn và bài tập.</p>}
                </div>
              )}
            </div>
          )}

          {/* ===== TAB: NHẬT KÝ ĂN UỐNG ===== */}
          {activeTab === 'nutrition' && (() => {
            const todayLog = nutritionLog[selectedDate] || [];
            const tot = todayLog.reduce((a, e) => ({ kcal: a.kcal + (e.kcal || 0), p: a.p + (e.p || 0), c: a.c + (e.c || 0), f: a.f + (e.f || 0) }), { kcal: 0, p: 0, c: 0, f: 0 });
            const q = foodSearch.trim().toLowerCase();
            const filtered = foods.filter(f => !q || f.name.toLowerCase().includes(q));
            const pct = (v, t) => t > 0 ? Math.min(100, Math.round((v / t) * 100)) : 0;
            const diffKcal = nutritionTargets.kcal - tot.kcal;
            const metric = (label, val, target, color, unit) => (
              <div className="bg-white rounded-xl border border-slate-200 p-3 text-center shadow-sm">
                <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wide">{label}</div>
                <div className="text-lg font-extrabold tabular-nums mt-0.5" style={{ color }}>{Math.round(val)}</div>
                <div className="text-[11px] text-slate-500 tabular-nums">/ {target}{unit}</div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full transition-all duration-500 motion-reduce:transition-none" style={{ width: `${pct(val, target)}%`, background: color }} />
                </div>
              </div>
            );
            return (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-slate-500" />
                    <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
                      className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500" />
                    {selectedDate === new Date().toISOString().slice(0, 10) && (
                      <span className="text-[11px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">Hôm nay</span>
                    )}
                  </div>
                  {isEditing && userRole === 'pt' && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold text-amber-600">Mục tiêu/ngày:</span>
                      {[['kcal', 'kcal'], ['p', 'P'], ['c', 'C'], ['f', 'F']].map(([k, lbl]) => (
                        <div key={k} className="flex items-center gap-0.5">
                          <input type="number" value={nutritionTargets[k]}
                            onChange={(e) => setNutritionTargets({ ...nutritionTargets, [k]: parseFloat(e.target.value) || 0 })}
                            className="w-14 text-xs border border-amber-300 rounded px-1 py-0.5 text-right focus:outline-none" />
                          <span className="text-[11px] text-slate-500">{lbl}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {metric('Calo', tot.kcal, nutritionTargets.kcal, '#2563eb', '')}
                  {metric('Đạm', tot.p, nutritionTargets.p, '#059669', 'g')}
                  {metric('Carb', tot.c, nutritionTargets.c, '#d97706', 'g')}
                  {metric('Mỡ', tot.f, nutritionTargets.f, '#e11d48', 'g')}
                </div>

                <div className={`rounded-xl px-4 py-2.5 text-sm font-medium flex items-center gap-2 ${
                  diffKcal >= 0 ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {diffKcal >= 0 ? <Flame size={16} /> : <AlertTriangle size={16} />}
                  {diffKcal >= 0
                    ? `Còn có thể nạp ${Math.round(diffKcal)} kcal · thiếu ${Math.max(0, Math.round(nutritionTargets.p - tot.p))}g đạm`
                    : `Đã vượt ${Math.round(-diffKcal)} kcal so với mục tiêu`}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Món đã ăn trong ngày</h4>
                    {todayLog.length === 0 ? (
                      <div className="bg-white border border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-500 text-sm">Chưa ghi món nào cho ngày này.</div>
                    ) : (
                      <div className="space-y-2">
                        {todayLog.map((e, i) => (
                          <div key={i} className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
                            <div>
                              <div className="text-sm text-slate-800">{e.name}</div>
                              <div className="text-[11px] text-slate-500 tabular-nums">{Math.round(e.kcal)} kcal · {e.p}P {e.c}C {e.f}F</div>
                            </div>
                            <button onClick={() => removeFoodFromLog(i)} className="text-rose-400 hover:text-rose-600 p-1" aria-label="Xóa"><Trash2 size={16} /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-700 mb-3">Thêm món</h4>
                    <div className="relative mb-3">
                      <Search size={16} className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input type="text" placeholder="Gõ tên món... (vd: gà, cơm, trà)" value={foodSearch}
                        onChange={(e) => setFoodSearch(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                    </div>
                    {foodsLoading ? (
                      <div className="text-center py-6 text-slate-500 text-sm">Đang tải thư viện món...</div>
                    ) : foods.length === 0 ? (
                      <div className="text-center py-6 text-slate-500 text-sm">Chưa tải được thư viện món. Kiểm tra kết nối hoặc link Sheet.</div>
                    ) : (
                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                        {filtered.length === 0 ? (
                          <div className="text-center py-6 text-slate-500 text-sm">Không tìm thấy món nào.</div>
                        ) : filtered.map((f) => (
                          <div key={f.id} className="flex items-center justify-between py-2">
                            <div>
                              <div className="text-sm text-slate-800">{f.name}</div>
                              <div className="text-[11px] text-slate-500 tabular-nums">{f.cat} · {f.kcal} kcal · {f.p}P {f.c}C {f.f}F</div>
                            </div>
                            <button onClick={() => addFoodToLog(f)} className="bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg p-1.5 transition-colors" aria-label={`Thêm ${f.name}`}><Plus size={16} /></button>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-[11px] text-slate-500 mt-3">Số liệu tham khảo từ thư viện món (Google Sheet), mang tính tương đối.</p>
                    <button onClick={() => { setShowSuggestModal(true); setSuggestStatus('idle'); }}
                      className="mt-3 w-full flex items-center justify-center gap-1.5 border border-dashed border-slate-300 hover:border-blue-400 text-slate-500 hover:text-blue-600 rounded-lg py-2 text-xs font-medium transition-colors">
                      <Lightbulb size={14} /> Không tìm thấy món? Góp ý bổ sung
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

        </main>
      </div>

      {/* ===== BOTTOM NAV (mobile) ===== */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-sticky bg-white border-t border-slate-200">
        <div className="flex">
          {NAV.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex-1 flex flex-col items-center gap-1 py-2 transition-colors ${activeTab === id ? 'text-blue-600' : 'text-slate-400'}`}>
              <Icon size={22} strokeWidth={2} />
              <span className="text-[11px] font-bold">{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Modal tạo client mới */}
      {showNewClientModal && renderNewClientModal()}

      {/* Modal góp ý món ăn */}
      {showSuggestModal && (
        <div onClick={() => { setShowSuggestModal(false); setSuggestStatus('idle'); setSuggestForm({ name: '', note: '' }); }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-modal flex items-center justify-center p-4">
          <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="suggest-title" className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 id="suggest-title" className="text-sm font-bold text-slate-800 flex items-center gap-1.5"><Lightbulb size={16} className="text-amber-500" /> Góp ý món ăn</h2>
              <button onClick={() => { setShowSuggestModal(false); setSuggestStatus('idle'); setSuggestForm({ name: '', note: '' }); }} aria-label="Đóng"
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"><X size={16} /></button>
            </div>
            {suggestStatus === 'sent' ? (
              <div className="px-5 py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3"><Check size={24} className="text-emerald-600" /></div>
                <p className="font-bold text-slate-800 mb-1">Cảm ơn bạn!</p>
                <p className="text-slate-500 text-sm">Góp ý đã được ghi nhận. PT sẽ xem xét bổ sung sớm.</p>
                <button onClick={() => { setShowSuggestModal(false); setSuggestStatus('idle'); setSuggestForm({ name: '', note: '' }); }}
                  className="mt-5 w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">Đóng</button>
              </div>
            ) : (
              <div className="px-5 py-5 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Tên món <span className="text-rose-500">*</span></label>
                  <input type="text" placeholder="VD: Bún bò Huế, Pizza Margherita..." value={suggestForm.name}
                    onChange={(e) => setSuggestForm({ ...suggestForm, name: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Ghi chú thêm</label>
                  <textarea placeholder="VD: Mua ở Highlands, loại có đường, size L..." value={suggestForm.note}
                    onChange={(e) => setSuggestForm({ ...suggestForm, note: e.target.value })} rows={3}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 resize-none" />
                </div>
                {suggestStatus === 'error' && <p className="text-rose-500 text-xs">Có lỗi xảy ra. Vui lòng thử lại.</p>}
                <button onClick={handleSubmitSuggestion} disabled={!suggestForm.name.trim() || suggestStatus === 'sending'}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                  {suggestStatus === 'sending' ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang gửi...</>) : 'Gửi góp ý'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
