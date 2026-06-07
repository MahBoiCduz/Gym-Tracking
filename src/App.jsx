import React, { useState, useEffect, useCallback } from 'react';
import { signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db, auth, googleProvider } from './firebase';
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
    return <DebugPage />;
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
                <span className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center text-[10px]">PT</span>
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
                <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-[10px]">HV</span>
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
            <a href="/debug" className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors">
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">Thêm Học Viên Mới</h2>
          <button onClick={handleCloseNewClientModal} className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-sm font-bold transition-all">✕</button>
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
                onClick={() => {
                  handleCloseNewClientModal();
                  // Chuyển sang client vừa tạo
                  const justCreated = ptClients[ptClients.length - 1];
                  if (justCreated) setSelectedClientId(justCreated.id);
                }}
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
                placeholder="VD: Nguyễn Sỹ Đức"
                value={newClientForm.name}
                onChange={(e) => setNewClientForm({ ...newClientForm, name: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              />
              {newClientForm.name.trim() && (
                <p className="text-[11px] text-slate-400 mt-1">
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
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16">

      {/* HEADER */}
      <header className="bg-slate-900 text-white shadow-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-blue-600 rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight">KICKBOXING TRACKER</h1>
              <p className="text-[11px] text-slate-400">
                {userRole === 'pt' ? `PT: ${user?.displayName || user?.email}` : `Học viên: ${currentClientName}`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">

            {/* PT: Dropdown chọn client */}
            {userRole === 'pt' && ptClients.length > 1 && (
              <select
                value={selectedClientId || ''}
                onChange={(e) => {
                  setSelectedClientId(e.target.value);
                  setIsEditing(false);
                  setClientData(null);
                }}
                className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
              >
                {ptClients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}

            {/* PT: Nút thêm học viên mới */}
            {userRole === 'pt' && (
              <button
                onClick={() => setShowNewClientModal(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-[11px] font-bold flex items-center gap-1 transition-all"
              >
                <span className="text-base leading-none">+</span> Thêm học viên
              </button>
            )}

            {/* PT: Nút chỉnh sửa / lưu */}
            {userRole === 'pt' && (
              <button
                onClick={() => {
                  if (isEditing) handleSaveEdit();
                  else setIsEditing(true);
                }}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1 transition-all ${
                  isEditing
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-900 animate-pulse'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {isEditing ? '💾 LƯU LÊN CLOUD' : '✏️ CHỈNH SỬA'}
              </button>
            )}

            {/* Save status */}
            {saveStatus === 'saving' && <span className="text-xs text-slate-400 animate-pulse">Đang lưu...</span>}
            {saveStatus === 'saved' && <span className="text-xs text-emerald-400">✓ Đã lưu</span>}
            {saveStatus === 'error' && <span className="text-xs text-rose-400">✗ Lỗi lưu</span>}

            {/* In PDF */}
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-[11px] font-bold text-slate-300 transition-all"
            >
              IN PDF
            </button>

            {/* Đăng xuất (PT) hoặc Thoát (Client) */}
            <button
              onClick={userRole === 'pt' ? handleSignOut : () => { setUserRole(null); setClientAccessCode(''); setClientData(null); }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-rose-900 border border-slate-700 rounded-full text-[11px] text-slate-400 hover:text-rose-300 transition-all"
            >
              {userRole === 'pt' ? 'Đăng xuất' : 'Thoát'}
            </button>
          </div>
        </div>
      </header>

      {/* STATUS BAR */}
      <div className="max-w-6xl mx-auto px-4 mt-4">
        {userRole === 'pt' ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <strong>Chế độ PT</strong> — Đang xem lộ trình của <strong>{currentClientName}</strong>.
            {isEditing && <span className="ml-1 text-amber-600 font-bold">Đang chỉnh sửa — nhớ bấm LƯU.</span>}
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
            </span>
            <strong>Chế độ Học Viên</strong> — Bạn có thể tích ✅ hoàn thành bài tập và bữa ăn.
          </div>
        )}
      </div>

      {/* HERO BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white py-8 px-4 mt-4 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/30 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              Học viên: {currentClientName}
            </span>
            <h2 className="text-2xl font-extrabold mt-2 tracking-tight">TIẾN ĐỘ THỰC HIỆN MỤC TIÊU</h2>
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-3 flex-1 md:flex-none md:w-40 border border-white/10">
              <div className="text-[10px] text-slate-300 font-medium">Hoàn thành Tập</div>
              <div className="text-xl font-black text-blue-400 mt-0.5">{workoutProgressPercentage}%</div>
              <div className="w-full bg-white/20 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-blue-400 h-full transition-all duration-500" style={{ width: `${workoutProgressPercentage}%` }} />
              </div>
              <div className="text-[9px] text-slate-400 mt-1">{completedWorkoutsCount}/{totalWorkoutsCount} bài</div>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-xl p-3 flex-1 md:flex-none md:w-40 border border-white/10">
              <div className="text-[10px] text-slate-300 font-medium">Calo hôm nay</div>
              <div className="text-xl font-black text-emerald-400 mt-0.5">{mealProgressPercentage}%</div>
              <div className="w-full bg-white/20 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-emerald-400 h-full transition-all duration-500" style={{ width: `${mealProgressPercentage}%` }} />
              </div>
              <div className="text-[9px] text-slate-400 mt-1">{Math.round(todayNutrition.kcal)}/{nutritionTargets.kcal} kcal</div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <main className="max-w-6xl mx-auto px-4">

        {/* TABS */}
        <div className="flex border-b border-slate-200 mb-6 overflow-x-auto whitespace-nowrap">
          {[
            { id: 'overview', label: '📊 Thể Trạng & Chỉ Số' },
            { id: 'workouts', label: '🥊 Lộ Trình Tập Luyện' },
            { id: 'nutrition', label: '🍽️ Nhật Ký Ăn Uống' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-5 font-semibold text-xs border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ======================================================
            TAB 1: THỂ TRẠNG
        ====================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {/* Họ tên */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Họ và Tên</span>
                  {isEditing && userRole === 'pt' ? (
                    <input type="text" value={profile.name} onChange={(e) => handleProfileChange('name', e.target.value)}
                      className="text-sm font-bold text-slate-800 w-full mt-1 border-b border-blue-500 focus:outline-none" />
                  ) : (
                    <h3 className="text-base font-bold text-slate-800 mt-1">{profile.name}</h3>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <span>Tuổi:</span>
                  {isEditing && userRole === 'pt' ? (
                    <input type="number" value={profile.age} onChange={(e) => handleProfileChange('age', e.target.value)}
                      className="w-12 text-right font-bold text-slate-800 border-b border-blue-500 focus:outline-none" />
                  ) : (
                    <span className="font-bold text-slate-700">{profile.age} tuổi</span>
                  )}
                </div>
              </div>

              {/* Cân nặng / chiều cao */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Chiều cao / Nặng</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    {isEditing && userRole === 'pt' ? (
                      <div className="flex gap-1 items-center">
                        <input type="number" step="0.1" value={profile.weight} onChange={(e) => handleProfileChange('weight', e.target.value)}
                          className="text-base font-black text-slate-800 w-16 border-b border-blue-500 focus:outline-none" />
                        <span className="text-xs text-slate-500">kg</span>
                      </div>
                    ) : (
                      <><span className="text-xl font-black text-slate-800">{profile.weight}</span><span className="text-xs text-slate-500">kg</span></>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <span>Cao:</span>
                  {isEditing && userRole === 'pt' ? (
                    <div className="flex items-center">
                      <input type="number" value={profile.height} onChange={(e) => handleProfileChange('height', e.target.value)}
                        className="w-12 text-right font-bold text-slate-800 border-b border-blue-500 focus:outline-none" />
                      <span>cm</span>
                    </div>
                  ) : (
                    <span className="font-bold text-slate-700">{profile.height} cm</span>
                  )}
                </div>
              </div>

              {/* BMI */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Chỉ số BMI</span>
                  <div className="text-xl font-black text-amber-600 mt-1">{calculateBMI(profile.weight, profile.height)}</div>
                </div>
                <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <span>Mục tiêu:</span>
                  {isEditing && userRole === 'pt' ? (
                    <div className="flex items-center">
                      <input type="number" value={profile.targetWeight} onChange={(e) => handleProfileChange('targetWeight', e.target.value)}
                        className="w-10 text-right font-bold text-slate-800 border-b border-blue-500 focus:outline-none" />
                      <span>kg</span>
                    </div>
                  ) : (
                    <span className="font-bold text-slate-700">{profile.targetWeight} kg</span>
                  )}
                </div>
              </div>

              {/* BMR */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">BMR cơ bản</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-black text-blue-600">{profile.bmr}</span>
                    <span className="text-xs text-slate-500">kcal</span>
                  </div>
                </div>
                <div className="mt-4 text-[9px] text-slate-400 pt-2 border-t border-slate-100">Năng lượng thô tối thiểu</div>
              </div>

              {/* TDEE */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">TDEE Tiêu thụ</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-black text-rose-500">{profile.tdee}</span>
                    <span className="text-xs text-slate-500">kcal</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-[9px] text-slate-400 pt-2 border-t border-slate-100">
                  <span>Hệ số vận động:</span>
                  <span className="font-bold text-slate-700">x1.3</span>
                </div>
              </div>
            </div>

            {/* Mục tiêu & Định hướng */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">🎯 Mục Tiêu Khách Hàng</h4>
                  <ul className="space-y-3">
                    {goals.map((goal, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="text-blue-500 mt-1">•</span>
                        {isEditing && userRole === 'pt' ? (
                          <div className="flex-1 flex gap-2">
                            <input type="text" value={goal} onChange={(e) => handleListChange(setGoals, goals, idx, e.target.value)}
                              className="flex-1 border-b border-slate-200 text-xs py-0.5 focus:border-blue-500 focus:outline-none" />
                            <button onClick={() => setGoals(goals.filter((_, i) => i !== idx))} className="text-rose-500 text-[10px]">Xóa</button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-700">{goal}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                  {isEditing && userRole === 'pt' && (
                    <button onClick={() => setGoals([...goals, "Mục tiêu mới"])} className="mt-3 text-[10px] text-blue-600 font-bold">+ Thêm</button>
                  )}
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">⚠️ Thể Trạng Hiện Tại (Yếu điểm)</h4>
                  <ul className="space-y-3">
                    {issues.map((issue, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="text-rose-500 mt-1">•</span>
                        {isEditing && userRole === 'pt' ? (
                          <div className="flex-1 flex gap-2">
                            <input type="text" value={issue} onChange={(e) => handleListChange(setIssues, issues, idx, e.target.value)}
                              className="flex-1 border-b border-slate-200 text-xs py-0.5 focus:border-blue-500 focus:outline-none" />
                            <button onClick={() => setIssues(issues.filter((_, i) => i !== idx))} className="text-rose-500 text-[10px]">Xóa</button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-700">{issue}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                  {isEditing && userRole === 'pt' && (
                    <button onClick={() => setIssues([...issues, "Yếu điểm mới"])} className="mt-3 text-[10px] text-rose-600 font-bold">+ Thêm</button>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">🛠️ Định Hướng Giải Quyết (HLV)</h4>
                <ul className="space-y-3">
                  {solutions.map((sol, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{idx + 1}</div>
                      {isEditing && userRole === 'pt' ? (
                        <div className="flex-1 flex gap-2">
                          <textarea value={sol} rows={2} onChange={(e) => handleListChange(setSolutions, solutions, idx, e.target.value)}
                            className="flex-1 border border-slate-200 text-xs p-1 rounded focus:border-blue-500 focus:outline-none" />
                          <button onClick={() => setSolutions(solutions.filter((_, i) => i !== idx))} className="text-rose-500 text-[10px] h-fit">Xóa</button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-700 leading-relaxed">{sol}</span>
                      )}
                    </li>
                  ))}
                </ul>
                {isEditing && userRole === 'pt' && (
                  <button onClick={() => setSolutions([...solutions, "Định hướng mới"])} className="mt-4 text-[10px] text-emerald-600 font-bold">+ Thêm</button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================
            TAB 2: LỘ TRÌNH TẬP LUYỆN
        ====================================================== */}
        {activeTab === 'workouts' && (
          <div className="space-y-8">
            {phases.map((phase, pIdx) => (
              <div key={phase.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="bg-slate-900 text-white p-4">
                  {isEditing && userRole === 'pt' ? (
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <input type="text" value={phase.title} placeholder="Tên giai đoạn (Phase)..."
                          onChange={(e) => { const n = [...phases]; n[pIdx].title = e.target.value; setPhases(n); }}
                          className="text-sm font-bold bg-transparent border-b border-blue-400 w-full focus:outline-none text-white placeholder-slate-500" />
                      </div>
                      <button onClick={() => { if (window.confirm('Xóa cả giai đoạn này?')) { const n = phases.filter((_, i) => i !== pIdx); setPhases(n); } }}
                        className="text-rose-400 hover:text-rose-300 text-[10px] font-bold border border-rose-800 rounded px-2 py-1 shrink-0">
                        Xóa Phase
                      </button>
                    </div>
                  ) : (
                    <h3 className="text-sm font-bold">{phase.title}</h3>
                  )}
                  {isEditing && userRole === 'pt' ? (
                    <textarea value={phase.desc} rows={2} placeholder="Mô tả mục đích giai đoạn..."
                      onChange={(e) => { const n = [...phases]; n[pIdx].desc = e.target.value; setPhases(n); }}
                      className="text-[11px] text-slate-300 bg-transparent border border-slate-700 rounded p-1 w-full mt-2 focus:outline-none placeholder-slate-500" />
                  ) : (
                    <p className="text-[11px] text-slate-300 mt-1">{phase.desc}</p>
                  )}
                </div>

                <div className="divide-y divide-slate-100">
                  {phase.blocks.map((block, bIdx) => (
                    <div key={bIdx} className="p-4 hover:bg-slate-50/50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-600" />
                          {isEditing && userRole === 'pt' ? (
                            <input type="text" value={block.name}
                              onChange={(e) => { const n = [...phases]; n[pIdx].blocks[bIdx].name = e.target.value; setPhases(n); }}
                              className="font-bold text-slate-800 text-xs border-b border-slate-300 focus:outline-none" />
                          ) : (
                            <h4 className="font-bold text-slate-800 text-xs">{block.name}</h4>
                          )}
                        </div>
                        {isEditing && userRole === 'pt' ? (
                          <div className="flex items-center gap-2">
                            <input type="text" value={block.sessions} placeholder="VD: Buổi 1-5"
                              onChange={(e) => { const n = [...phases]; n[pIdx].blocks[bIdx].sessions = e.target.value; setPhases(n); }}
                              className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-bold border border-blue-200 text-right focus:outline-none w-28" />
                            <button onClick={() => { if (window.confirm('Xóa block này?')) { const n = [...phases]; n[pIdx].blocks = n[pIdx].blocks.filter((_, i) => i !== bIdx); setPhases(n); } }}
                              className="text-rose-500 hover:text-rose-700 text-[10px] font-bold border border-rose-200 rounded px-2 py-0.5 shrink-0">
                              Xóa Block
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-bold">{block.sessions}</span>
                        )}
                      </div>

                      <div className="bg-slate-50 border-l-4 border-blue-400 p-2.5 rounded-r mb-3">
                        {isEditing && userRole === 'pt' ? (
                          <textarea value={block.target} rows={2}
                            onChange={(e) => { const n = [...phases]; n[pIdx].blocks[bIdx].target = e.target.value; setPhases(n); }}
                            className="text-xs text-slate-700 bg-white border border-slate-200 rounded p-1 w-full focus:outline-none" />
                        ) : (
                          <p className="text-xs text-slate-700 font-medium"><strong>Mục tiêu:</strong> {block.target}</p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        {block.exercises.map((ex, eIdx) => {
                          const uniqueId = `${pIdx}-${bIdx}-${eIdx}`;
                          const isDone = !!completedSessions[uniqueId];
                          return (
                            <div key={eIdx} className={`flex items-start gap-2.5 p-2 rounded transition-all border ${
                              isDone ? 'bg-emerald-50/50 border-emerald-100' : 'bg-white border-slate-100 hover:border-slate-200'
                            }`}>
                              <button onClick={() => toggleSessionComplete(uniqueId)} className="mt-0.5 shrink-0">
                                {isDone ? (
                                  <div className="w-4 h-4 bg-emerald-500 border border-emerald-500 rounded flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </div>
                                ) : (
                                  <div className="w-4 h-4 bg-white border border-slate-300 hover:border-blue-500 rounded" />
                                )}
                              </button>
                              {isEditing && userRole === 'pt' ? (
                                <div className="flex-1 flex gap-2">
                                  <input type="text" value={ex}
                                    onChange={(e) => { const n = [...phases]; n[pIdx].blocks[bIdx].exercises[eIdx] = e.target.value; setPhases(n); }}
                                    className="flex-1 border-b border-slate-200 text-xs py-0.5 focus:outline-none focus:border-blue-500" />
                                  <button onClick={() => { const n = [...phases]; n[pIdx].blocks[bIdx].exercises = n[pIdx].blocks[bIdx].exercises.filter((_, i) => i !== eIdx); setPhases(n); }}
                                    className="text-rose-500 text-xs px-1">Xóa</button>
                                </div>
                              ) : (
                                <span className={`text-xs ${isDone ? 'line-through text-slate-400' : 'text-slate-700'}`}>{ex}</span>
                              )}
                            </div>
                          );
                        })}
                        {isEditing && userRole === 'pt' && (
                          <button onClick={() => { const n = [...phases]; n[pIdx].blocks[bIdx].exercises.push("Bài tập mới"); setPhases(n); }}
                            className="mt-1 text-[10px] text-blue-600 font-bold">+ Thêm bài tập</button>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Nút thêm block */}
                  {isEditing && userRole === 'pt' && (
                    <div className="p-4">
                      <button
                        onClick={() => {
                          const n = [...phases];
                          n[pIdx].blocks.push({ name: 'Block mới', sessions: 'Buổi ...', target: '', exercises: [] });
                          setPhases(n);
                        }}
                        className="w-full border-2 border-dashed border-blue-200 hover:border-blue-400 text-blue-600 rounded-lg py-2 text-xs font-bold transition-all"
                      >
                        + Thêm Block vào giai đoạn này
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Nút thêm phase + trạng thái rỗng */}
            {isEditing && userRole === 'pt' && (
              <button
                onClick={() => {
                  const newId = phases.length > 0 ? Math.max(...phases.map(p => p.id || 0)) + 1 : 1;
                  setPhases([...phases, { id: newId, title: 'Giai đoạn mới', desc: '', blocks: [] }]);
                }}
                className="w-full border-2 border-dashed border-slate-300 hover:border-blue-400 text-slate-600 hover:text-blue-600 rounded-xl py-4 text-sm font-bold transition-all"
              >
                + Thêm Giai Đoạn (Phase) mới
              </button>
            )}

            {phases.length === 0 && !(isEditing && userRole === 'pt') && (
              <div className="bg-white border border-dashed border-slate-200 rounded-xl p-10 text-center">
                <div className="text-3xl mb-3">🥊</div>
                <p className="text-slate-500 text-sm">Chưa có lộ trình tập luyện.</p>
                {userRole === 'pt' && <p className="text-slate-400 text-xs mt-1">Bấm "Chỉnh sửa" để thêm giai đoạn và bài tập.</p>}
              </div>
            )}
          </div>
        )}

        {/* ======================================================
            TAB 3: NHẬT KÝ ĂN UỐNG
        ====================================================== */}
        {activeTab === 'nutrition' && (() => {
          const todayLog = nutritionLog[selectedDate] || [];
          const tot = todayLog.reduce((a, e) => ({
            kcal: a.kcal + (e.kcal || 0), p: a.p + (e.p || 0), c: a.c + (e.c || 0), f: a.f + (e.f || 0),
          }), { kcal: 0, p: 0, c: 0, f: 0 });
          const q = foodSearch.trim().toLowerCase();
          const filtered = foods.filter(f => !q || f.name.toLowerCase().includes(q));
          const pct = (v, t) => t > 0 ? Math.min(100, Math.round((v / t) * 100)) : 0;
          const diffKcal = nutritionTargets.kcal - tot.kcal;
          const metric = (label, val, target, color, unit) => (
            <div className="bg-white rounded-xl border border-slate-200 p-3 text-center shadow-sm">
              <div className="text-[10px] text-slate-500 font-medium">{label}</div>
              <div className="text-lg font-black mt-0.5" style={{ color }}>{Math.round(val)}</div>
              <div className="text-[9px] text-slate-400">/ {target}{unit}</div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div className="h-full transition-all duration-500" style={{ width: `${pct(val, target)}%`, background: color }} />
              </div>
            </div>
          );

          return (
            <div className="space-y-5">
              {/* Chọn ngày */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">📅 Ngày:</span>
                  <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
                    className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500" />
                  {selectedDate === new Date().toISOString().slice(0, 10) && (
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">Hôm nay</span>
                  )}
                </div>
                {/* PT đặt target */}
                {isEditing && userRole === 'pt' && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold text-amber-600">Mục tiêu/ngày:</span>
                    {[['kcal', 'kcal'], ['p', 'P'], ['c', 'C'], ['f', 'F']].map(([k, lbl]) => (
                      <div key={k} className="flex items-center gap-0.5">
                        <input type="number" value={nutritionTargets[k]}
                          onChange={(e) => setNutritionTargets({ ...nutritionTargets, [k]: parseFloat(e.target.value) || 0 })}
                          className="w-14 text-xs border border-amber-300 rounded px-1 py-0.5 text-right focus:outline-none" />
                        <span className="text-[9px] text-slate-500">{lbl}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Metric cards */}
              <div className="grid grid-cols-4 gap-3">
                {metric('Calo', tot.kcal, nutritionTargets.kcal, '#378ADD', '')}
                {metric('Đạm', tot.p, nutritionTargets.p, '#1D9E75', 'g')}
                {metric('Carb', tot.c, nutritionTargets.c, '#EF9F27', 'g')}
                {metric('Mỡ', tot.f, nutritionTargets.f, '#D85A30', 'g')}
              </div>

              {/* Dòng thiếu/thừa */}
              <div className={`rounded-xl px-4 py-2.5 text-sm font-medium ${
                diffKcal >= 0 ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {diffKcal >= 0
                  ? `🔥 Còn có thể nạp ${Math.round(diffKcal)} kcal · thiếu ${Math.max(0, Math.round(nutritionTargets.p - tot.p))}g đạm`
                  : `⚠️ Đã vượt ${Math.round(-diffKcal)} kcal so với mục tiêu`}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Món đã ăn */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Món đã ăn trong ngày</h4>
                  {todayLog.length === 0 ? (
                    <div className="bg-white border border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-400 text-sm">
                      Chưa ghi món nào cho ngày này.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {todayLog.map((e, i) => (
                        <div key={i} className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
                          <div>
                            <div className="text-sm text-slate-800">{e.name}</div>
                            <div className="text-[10px] text-slate-500">{Math.round(e.kcal)} kcal · {e.p}P {e.c}C {e.f}F</div>
                          </div>
                          <button onClick={() => removeFoodFromLog(i)}
                            className="text-rose-400 hover:text-rose-600 p-1" aria-label="Xóa">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Thêm món */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <h4 className="text-sm font-bold text-slate-700 mb-3">+ Thêm món</h4>

                  {/* Search */}
                  <div className="relative mb-3">
                    <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input type="text" placeholder="Gõ tên món... (vd: gà, cơm, trà)" value={foodSearch}
                      onChange={(e) => setFoodSearch(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                  </div>

                  {/* Kết quả */}
                  {foodsLoading ? (
                    <div className="text-center py-6 text-slate-400 text-sm">Đang tải thư viện món...</div>
                  ) : foods.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-sm">
                      Chưa tải được thư viện món. Kiểm tra kết nối hoặc link Sheet.
                    </div>
                  ) : (
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                      {filtered.length === 0 ? (
                        <div className="text-center py-6 text-slate-400 text-sm">Không tìm thấy món nào.</div>
                      ) : filtered.map((f) => (
                        <div key={f.id} className="flex items-center justify-between py-2">
                          <div>
                            <div className="text-sm text-slate-800">{f.name}</div>
                            <div className="text-[10px] text-slate-500">{f.cat} · {f.kcal} kcal · {f.p}P {f.c}C {f.f}F</div>
                          </div>
                          <button onClick={() => addFoodToLog(f)}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg p-1.5 transition-all" aria-label={`Thêm ${f.name}`}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] text-slate-400 mt-3">
                    Số liệu tham khảo từ thư viện món (Google Sheet), mang tính tương đối.
                  </p>
                </div>
              </div>
            </div>
          );
        })()}

      </main>

      {/* Modal tạo client mới */}
      {showNewClientModal && renderNewClientModal()}

    </div>
  );
}
