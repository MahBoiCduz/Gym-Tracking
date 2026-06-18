import React, { useState, useEffect } from 'react';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import {
  Activity, Zap, Salad, Target, AlertTriangle, Wrench, Check, KeyRound,
  RotateCcw, Pencil, Save, Printer, X, Plus, Trash2
} from 'lucide-react';

// Gọi trực tiếp cấu hình từ file firebase.js nằm cùng thư mục src
import { db, auth, appId } from './firebase';

// Khởi tạo dữ liệu mặc định ban đầu
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
    desc: "Mục đích: Cải thiện tư thế Kickboxing, tăng độ linh hoạt khớp và khả năng phối hợp chuyển động cơ bản. Giãn cơ lưng, mông, đùi và bắp chân.",
    blocks: [
      {
        name: "Block 1: Làm Quen Bộ Pháp & Kích Hoạt Cơ Bắp",
        sessions: "Buổi 1 - 5",
        target: "Học thủ chuẩn, di chuyển giữ thăng bằng và giải tỏa căng thẳng vùng thắt lưng.",
        exercises: [
          "Khởi động: Giãn cơ động (Xoay hông, ép dọc/ép ngang chủ động).",
          "Chuyên môn: Học tư thế thủ chuẩn (Stance) - Giữ trọng tâm, sửa tư thế đứng gù/ưỡn.",
          "Bộ pháp: Di chuyển căn bản (Footwork) - Tiến, lùi, sang trái, sang phải.",
          "Bổ trợ: Bodyweight Squat (Mở gối, thẳng lưng) + Dumbbell Row (Khỏe cơ traps/lưng trên).",
          "Hồi phục: Giãn cơ tĩnh sâu - Tư thế em bé (Child's pose) giãn lưng, kéo chân giãn đùi sau."
        ]
      },
      {
        name: "Block 2: Định Hình Đòn Đấm & Cải Thiện Linh Hoạt",
        sessions: "Buổi 6 - 10",
        target: "Kết hợp di chuyển với đòn đấm thẳng, tăng sức bền core và kéo giãn sâu chi dưới.",
        exercises: [
          "Chuyên môn: Học đòn đấm thẳng Jab (tay trước) và Cross (tay sau). Xoay hông, nhón gót chân sau phát lực.",
          "Combo di chuyển: Tiến - Jab, Lùi - Cross điều tốc.",
          "Bổ trợ: Dumbbell RDL (Romanian Deadlift) cảm nhận kéo căng, làm khỏe đùi sau và mông.",
          "Sửa tư thế: Band Pull-Apart với dây kháng lực (Khỏe vai sau, hạn chế mỏi lưng).",
          "Hồi phục: Giãn cơ mông sâu (Tư thế bồ câu - Pigeon pose) và giải tỏa căng cơ đùi trước."
        ]
      },
      {
        name: "Block 3: Phối Hợp Tổ Hợp Ngắn & Tăng Sức Chịu Đựng",
        sessions: "Buổi 11 - 15",
        target: "Hoàn thiện phối hợp chuyển động cơ bản, tăng sức bền chi dưới mà không gây mỏi lưng.",
        exercises: [
          "Chuyên môn: Học đòn đấm vòng Hook (Móc ngang). Ghép tổ hợp: Jab - Cross - Hook.",
          "Phòng thủ: Tập phản xạ né đòn (Duck/Weave) bằng cách hạ thấp trọng tâm từ hông và đùi (không gập lưng).",
          "Bổ trợ: Goblet Squat (Cầm tạ trước ngực giúp giữ thẳng lưng) + Plank Shoulder Taps (Ổn định thắt lưng).",
          "Hồi phục: Dùng Foam Roller giải mỏi bắp chân, đùi sau; giãn tĩnh sâu vùng mông."
        ]
      }
    ]
  },
  {
    id: 2,
    title: "PHASE 2: Tăng Cường Sức Bền & Đa Dạng Kỹ Thuật (20 Buổi)",
    desc: "Mục đích: Nâng cao kỹ thuật (bắt đầu kết hợp chân), tăng cường sức chịu đựng cơ bắp và đốt cháy calo phục vụ giảm mỡ.",
    blocks: [
      {
        name: "Block 1: Mở Khớp Háng & Kỹ Thuật Đá Cơ Bản",
        sessions: "Buổi 16 - 20",
        target: "Kích hoạt linh hoạt vùng chi dưới để làm quen biên độ đòn đá an toàn cho thắt lưng.",
        exercises: [
          "Kỹ thuật: Học kỹ thuật Low Kick (Đá tầm thấp) và Mid Kick (Đá tầm trung).",
          "Lưu ý quan trọng: Xoay trụ 180° trên ức bàn chân trước để mở hông và bảo vệ khớp gối.",
          "Bổ trợ thể lực: Kettlebell Sumo Squat (Ăn sâu mông đùi) + Inverted Row / Dumbbell Row khỏe lưng."
        ]
      },
      {
        name: "Block 2: Ghép Tổ Hợp Đấm - Đá & Tăng Tốc Độ",
        sessions: "Buổi 21 - 25",
        target: "Tăng phối hợp toàn thân, thúc đẩy đốt năng lượng và tăng sức bền tim mạch.",
        exercises: [
          "Combo liên hoàn: Jab - Cross - Left Mid Kick và Jab - Hook - Right Mid Kick.",
          "Di chuyển: Tập luyện giữ cự ly ổn định trước và sau khi tung đòn đá.",
          "Circuit Training: Dumbbell RDL -> Push-up (Sửa tư thế vai) -> Russian Twist (Xoay eo khỏe core)."
        ]
      },
      {
        name: "Block 3: Phản Xạ Phòng Thủ & Đánh Gối",
        sessions: "Buổi 26 - 30",
        target: "Đa dạng hóa đòn đánh với gối và tập các bài phòng thủ nâng cao thăng bằng 1 chân.",
        exercises: [
          "Kỹ thuật mới: Knee Strike (Đập gối thẳng phát lực hông) + Shin Block (Chắn đòn đá bằng ống quyển).",
          "Combo: Block - Jab - Cross - Knee. Bổ trợ: Bulgarian Split Squat phát triển mông & thăng bằng đơn chân."
        ]
      },
      {
        name: "Block 4: Đốt Mỡ Cường Độ Cao (Burn-out & Conditioning)",
        sessions: "Buổi 31 - 35",
        target: "Đạt đỉnh cao sức bền thể lực, tối ưu calo, làm cơ bắp săn chắc chuẩn bị cho Phase 3.",
        exercises: [
          "Pad work HIIT: Tập trung tốc độ ra đấm và độ nặng bộc phát của đòn đá.",
          "Burn-out kết buổi: 30 giây cuối mỗi hiệp đấm thẳng liên tục hoặc đá liên tục vào bao cát không nghỉ.",
          "AMRAP 10 phút: 10 Goblet Squat -> 10 Dumbbell Renegade Row -> 15 Plank Shoulder Taps."
        ]
      }
    ]
  },
  {
    id: 3,
    title: "PHASE 3: Tập Trung Giảm Mỡ, Linh Hoạt & Phát Triển Cơ Bắp (15 Buổi)",
    desc: "Mục đích: Thử thách thể lực tối đa, ép cơ thể dùng mỡ thừa làm năng lượng vận động phức tạp.",
    blocks: [
      {
        name: "Block 1: Phối Hợp Đa Cực & Ổn Định Trọng Tâm",
        sessions: "Buổi 36 - 40",
        target: "Phối hợp nhuần nhuyễn Đấm thẳng - Đấm vòng - Gối; tăng áp lực tạ phát triển mông đùi sau.",
        exercises: [
          "Combo nâng cao: Jab - Cross - Hook - Right Knee. Di chuyển cắt góc 90 độ sau khi ra đòn.",
          "Tăng tiến: Romanian Deadlift (RDL) tăng dần mức tạ để kích thích tối đa chuỗi cơ phía sau."
        ]
      },
      {
        name: "Block 2: Phản Xạ Nâng Cao & Tấn Công Toàn Diện",
        sessions: "Buổi 41 - 45",
        target: "Tập phản xạ né đòn và phản công tức thì; kích thích tăng cơ đùi và cơ cầu vai (traps).",
        exercises: [
          "Phản công: Đối phương đá -> Người tập Shin Block -> Phản công ngay bằng Cross - Hook - Low Kick.",
          "Tăng cơ cô lập: Goblet Squat nhịp chậm (Tempo 3-1-1) + Dumbbell Shrugs kết hợp Hold cô lập vùng vai traps."
        ]
      },
      {
        name: "Block 3: Mô Phỏng Đối Kháng & Thể Lực Đỉnh Cao",
        sessions: "Buổi 46 - 50",
        target: "Thử thách thể lực tối đa, ép cơ thể dùng mỡ thừa làm năng lượng vận động phức tạp.",
        exercises: [
          "Mô phỏng: Light Sparring với HLV hoặc Padwork liên hoàn dài 5-6 đòn di chuyển liên tục quanh thảm.",
          "Circuit Đốt mỡ cuối: Bulgarian Split Squat (10 lần/chân) -> Push-up (12 lần) -> Plank Shoulder Taps (20 lần)."
        ]
      }
    ]
  }
];

const INITIAL_DIET = [
  { day: 1, type: "Standard", s: "2 quả trứng ốp la + 1 lát bánh mì đen + 1 quả dưa chuột.", t: "1 bát cơm gạo lứt + 150g ức gà áp chảo (dầu ô liu) + Cải ngọt luộc.", x: "1 quả ổi tươi.", to: "1 củ khoai lang luộc + 150g cá rô phi sốt cà chua (ít dầu) + Canh bí đao.", done: false },
  { day: 2, type: "Standard", s: "Cháo yến mạch thịt băm (40g yến mạch + 50g thịt thăn băm).", t: "1 bát cơm trắng + 150g thịt lợn thăn luộc + Bông cải xanh luộc.", x: "1 hũ sữa chua ít đường.", to: "Canh đậu phụ nấu cà chua thịt băm + 1 khúc ngô ngọt luộc.", done: false },
  { day: 3, type: "Standard", s: "1 củ khoai lang luộc + 1 quả trứng luộc + 1 ly sữa đậu nành không đường.", t: "Bún lứt trộn (100g bún + 120g thịt bò xào + nhiều rau sống, nước mắm nhạt).", x: "1 quả táo tổ.", to: "1 bát cơm lứt + 150g tôm hấp sả + Bí xanh luộc.", done: false },
  { day: 4, type: "Standard", s: "2 lát bánh mì gối + 1 muỗng bơ đậu phộng + 1 quả chuối.", t: "1 bát cơm lứt + 150g ức gà xé phay trộn hành tây rau răm + Canh rau ngót.", x: "1 nắm nhỏ hạt hạnh nhân (khoảng 10 hạt).", to: "1 củ khoai lang + 150g mực hấp hành gừng + Xà lách ăn sống.", done: false },
  { day: 5, type: "Standard", s: "1 bát miến gà (nhiều rau, ăn thịt ức gà, ít miến, không húp nước béo).", t: "1 bát cơm trắng + 150g cá ngừ/cá thu sốt cà + Đậu cô ve luộc.", x: "1 miếng đu đủ chín.", to: "Salad ức gà (100g ức + xà lách, cà chua bi, dưa chuột + sốt sữa chua).", done: false },
  { day: 6, type: "Standard", s: "1 củ khoai lang luộc + 2 quả trứng luộc lòng đào.", t: "1 bát cơm lứt + 150g thịt bò xào bông cải xanh (ít dầu).", x: "1 quả cam hoặc 3 múi bưởi.", to: "Canh khoai tây cà rốt nấu sườn (ăn 2 miếng sườn nhỏ, nhiều rau) + Đậu phụ luộc.", done: false },
  { day: 7, type: "Cheat", s: "1 đĩa bánh cuốn (ít bánh, nhiều mộc nhĩ thịt băm, không hành phi dầu).", t: "Ăn cùng gia đình tự do (Ưu tiên món luộc, hấp, ăn nhiều rau trước).", x: "Không ăn xế.", to: "1 củ khoai lang + 1 khúc cá lóc hấp dưa cuốn bánh tráng đại mạch.", done: false },
  { day: 8, type: "Standard", s: "3 muỗng yến mạch ngâm sữa tươi không đường + nửa quả chuối cắt lát.", t: "1 bát cơm lứt + 150g tôm rim tỏi (ít dầu) + Cải thảo luộc.", x: "1 hũ sữa chua Hy Lạp không đường.", to: "2 quả trứng đúc thịt băm nướng nồi chiên không dầu + Canh cải cúc.", done: false },
  { day: 9, type: "Standard", s: "Bánh mì kẹp trứng ốp la + dưa chuột, cà chua (không sốt tương cà/mayo).", t: "1 bát cơm trắng + 150g ức gà nướng mật ong + Rau muống luộc.", x: "1 quả ổi giòn.", to: "1 củ khoai lang + 150g thịt thăn áp chảo + Salad xà lách dầu giấm.", done: false },
  { day: 10, type: "Standard", s: "1 bát bún sườn chua nấu tại nhà (nhiều dọc mùng, ít bún).", t: "1 bát cơm lứt + 150g cá hồi áp chảo + Bí ngòi xào tỏi ít dầu.", x: "1 quả táo mọng.", to: "Canh rong biển đậu phụ thịt băm + 1 củ khoai tây luộc nhỏ.", done: false },
  { day: 11, type: "Standard", s: "2 quả trứng luộc + 1 bắp ngô ngọt luộc vừa chín.", t: "1 bát cơm lứt + 150g ức gà xào nấm + Rau cải chíp luộc.", x: "1 hũ sữa chua ít đường.", to: "1 củ khoai lang + 150g tôm hấp + Canh bầu nấu tôm.", done: false },
  { day: 12, type: "Standard", s: "Smoothie chuối yến mạch (1 chuối + 3 muỗng yến mạch + 200ml sữa tươi ko đường).", t: "1 bát cơm trắng + 150g thịt thăn rim tiêu + Bông cải xanh luộc.", x: "2 múi bưởi da xanh.", to: "Canh kim chi nấu đậu phụ, nấm và thịt bò + 1 củ khoai lang nhỏ.", done: false },
  { day: 13, type: "Standard", s: "1 bát hủ tiếu gà (thịt ức gà xé, thêm nhiều giá đỗ).", t: "Bún lứt chấm thịt chân giò luộc (bỏ mỡ) + Đậu phụ nướng NCKD + Rau kinh giới.", x: "1 quả dưa chuột.", to: "1 bát cơm lứt + 150g cá rô phi nướng sả + Canh rau ngót.", done: false },
  { day: 14, type: "Standard", s: "2 lát bánh mì đen + 1 quả trứng ốp la + 1/2 quả bơ chín.", t: "1 bát cơm lứt + 150g thịt ức gà sốt tiêu xanh + Su su luộc.", x: "1 nắm hạt điều nguyên vị.", to: "Salad bò áp chảo (120g bò + rau mầm, cà chua bi + sốt dầu giấm nhạt).", done: false },
  { day: 15, type: "Half", s: "1 bát cháo đỗ xanh nấu loãng ăn kèm chút ruốc heo sạch tại nhà.", t: "1 bát cơm trắng + 150g mực xào cần tỏi ít dầu + Canh cải ngọt.", x: "1 quả táo xanh.", to: "1 củ khoai lang + 150g phi lê cá lóc nướng + 1 đĩa rau muống luộc.", done: false }
];

const NAV_ITEMS = [
  { id: 'overview', label: 'Thể trạng', Icon: Activity },
  { id: 'workouts', label: 'Lộ trình', Icon: Zap },
  { id: 'diet', label: 'Dinh dưỡng', Icon: Salad }
];

export default function App() {
  const [user, setUser] = useState(null);
  const [cloudSynced, setCloudSynced] = useState(false);
  const [currentRole, setCurrentRole] = useState('client'); // 'client' hoặc 'pt'
  const [pinInput, setPinInput] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinError, setPinError] = useState('');

  // States Dữ liệu
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [goals, setGoals] = useState(INITIAL_GOALS);
  const [issues, setIssues] = useState(INITIAL_ISSUES);
  const [solutions, setSolutions] = useState(INITIAL_SOLUTIONS);
  const [phases, setPhases] = useState(INITIAL_PHASES);
  const [diet, setDiet] = useState(INITIAL_DIET);
  const [isEditing, setIsEditing] = useState(false);
  const [completedSessions, setCompletedSessions] = useState({});
  const [activeTab, setActiveTab] = useState('overview');

  // 1. KÍCH HOẠT AUTHENTICATION (đăng nhập ẩn danh)
  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error("Lỗi đăng nhập ẩn danh:", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // 2. LẮNG NGHE DỮ LIỆU ĐỒNG BỘ THỜI GIAN THỰC
  useEffect(() => {
    if (!db || !user) return;

    // Đường dẫn dành cho dữ liệu chia sẻ công khai giữa PT & Học viên
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'roadmaps', 'anh_duc');

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.profile) setProfile(data.profile);
        if (data.goals) setGoals(data.goals);
        if (data.issues) setIssues(data.issues);
        if (data.solutions) setSolutions(data.solutions);
        if (data.phases) setPhases(data.phases);
        if (data.diet) setDiet(data.diet);
        if (data.completedSessions) setCompletedSessions(data.completedSessions);
        setCloudSynced(true);
      } else {
        // Tạo dữ liệu khởi tạo ban đầu trên Cloud nếu rỗng
        pushStateToCloud({
          profile: INITIAL_PROFILE,
          goals: INITIAL_GOALS,
          issues: INITIAL_ISSUES,
          solutions: INITIAL_SOLUTIONS,
          phases: INITIAL_PHASES,
          diet: INITIAL_DIET,
          completedSessions: {}
        });
      }
    }, (error) => {
      console.error("Lỗi tải dữ liệu Cloud:", error);
    });

    return () => unsubscribe();
  }, [user]);

  // Đẩy dữ liệu trực tiếp lên Firebase
  const pushStateToCloud = async (updatedFields) => {
    if (!db || !user) return;
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'roadmaps', 'anh_duc');
    try {
      await setDoc(docRef, {
        ...updatedFields,
        lastUpdated: new Date().toISOString(),
        updatedBy: user.uid
      }, { merge: true });
    } catch (err) {
      console.error("Lỗi đồng bộ Cloud:", err);
    }
  };

  // Tính toán BMI tự động
  const calculateBMI = (w, h) => {
    if (!w || !h) return 0;
    const heightInMeters = h / 100;
    return (w / (heightInMeters * heightInMeters)).toFixed(1);
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

  const handleAddListItem = (setter, list) => {
    setter([...list, "Dòng thông tin mới (Nhấp để sửa)"]);
  };

  const handleRemoveListItem = (setter, list, index) => {
    setter(list.filter((_, i) => i !== index));
  };

  const handleDietMealChange = (dayIdx, mealKey, newVal) => {
    const newDiet = [...diet];
    newDiet[dayIdx][mealKey] = newVal;
    setDiet(newDiet);
  };

  // Học viên được phép tích chọn và thay đổi trạng thái hoàn thành trực tiếp lên Cloud
  const handleDietDoneToggle = (dayIdx) => {
    const newDiet = [...diet];
    newDiet[dayIdx].done = !newDiet[dayIdx].done;
    setDiet(newDiet);
    pushStateToCloud({ diet: newDiet });
  };

  const toggleSessionComplete = (uniqueId) => {
    const newCompleted = {
      ...completedSessions,
      [uniqueId]: !completedSessions[uniqueId]
    };
    setCompletedSessions(newCompleted);
    pushStateToCloud({ completedSessions: newCompleted });
  };

  // PT Lưu toàn bộ chỉnh sửa văn bản lên Cloud
  const handleSaveEdit = () => {
    setIsEditing(false);
    pushStateToCloud({
      profile,
      goals,
      issues,
      solutions,
      phases,
      diet
    });
  };

  // Khôi phục dữ liệu gốc
  const handleResetData = () => {
    if (window.confirm("Đặt lại toàn bộ dữ liệu gốc? Việc này sẽ đồng bộ lại trạng thái từ đầu lên đám mây.")) {
      setProfile(INITIAL_PROFILE);
      setGoals(INITIAL_GOALS);
      setIssues(INITIAL_ISSUES);
      setSolutions(INITIAL_SOLUTIONS);
      setPhases(INITIAL_PHASES);
      setDiet(INITIAL_DIET);
      setCompletedSessions({});
      pushStateToCloud({
        profile: INITIAL_PROFILE,
        goals: INITIAL_GOALS,
        issues: INITIAL_ISSUES,
        solutions: INITIAL_SOLUTIONS,
        phases: INITIAL_PHASES,
        diet: INITIAL_DIET,
        completedSessions: {}
      });
    }
  };

  // Xác thực mã PIN PT
  const handleVerifyPIN = (e) => {
    e.preventDefault();
    if (pinInput === '1234') {
      setCurrentRole('pt');
      setShowPinModal(false);
      setPinError('');
      setPinInput('');
    } else {
      setPinError('Mã PIN không chính xác. Thử lại (Gợi ý: 1234)');
    }
  };

  // Thống kê tiến độ
  const completedWorkoutsCount = Object.values(completedSessions).filter(Boolean).length;
  const totalWorkoutsCount = phases.reduce((acc, p) => acc + p.blocks.reduce((bAcc, b) => bAcc + b.exercises.length, 0), 0);
  const workoutProgressPercentage = totalWorkoutsCount ? Math.round((completedWorkoutsCount / totalWorkoutsCount) * 100) : 0;

  const completedMealsCount = diet.filter(d => d.done).length;
  const mealProgressPercentage = diet.length ? Math.round((completedMealsCount / diet.length) * 100) : 0;

  const isPT = currentRole === 'pt';
  const canEdit = isEditing && isPT;
  const remainingKg = (parseFloat(profile.weight) - parseFloat(profile.targetWeight)).toFixed(1);

  // Đếm số bài đã hoàn thành trong 1 block (cho kiểu "sổ tay HLV")
  const blockProgress = (pIdx, bIdx, total) => {
    let done = 0;
    for (let e = 0; e < total; e++) {
      if (completedSessions[`${pIdx}-${bIdx}-${e}`]) done++;
    }
    return done;
  };

  // ---- Các mảnh giao diện dùng chung ----

  const NavList = ({ orientation }) => {
    if (orientation === 'sidebar') {
      return (
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold transition-colors ${
                activeTab === id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon size={19} strokeWidth={2} />
              {label}
            </button>
          ))}
        </nav>
      );
    }
    // bottom bar
    return (
      <nav className="flex">
        {NAV_ITEMS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex flex-col items-center gap-1 py-1.5 transition-colors ${
              activeTab === id ? 'text-blue-600' : 'text-slate-400'
            }`}
          >
            <Icon size={22} strokeWidth={2} />
            <span className="text-[11px] font-bold">{label}</span>
          </button>
        ))}
      </nav>
    );
  };

  const RoleSwitch = () => (
    <div className="flex bg-slate-800 border border-slate-700 rounded-full p-0.5">
      <button
        onClick={() => { setCurrentRole('client'); setIsEditing(false); }}
        className={`flex-1 text-[11px] font-bold px-3 py-1.5 rounded-full transition-colors ${
          !isPT ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
        }`}
      >
        Học viên
      </button>
      <button
        onClick={() => { if (isPT) { setCurrentRole('client'); setIsEditing(false); } else { setShowPinModal(true); } }}
        className={`flex-1 text-[11px] font-bold px-3 py-1.5 rounded-full transition-colors ${
          isPT ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
        }`}
      >
        PT
      </button>
    </div>
  );

  const PTActions = ({ showPrint }) => (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => { if (isEditing) handleSaveEdit(); else setIsEditing(true); }}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors ${
          isEditing
            ? 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse motion-reduce:animate-none'
            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
        }`}
      >
        {isEditing ? <Save size={14} /> : <Pencil size={14} />}
        {isEditing ? 'Lưu lên Cloud' : 'Chỉnh sửa'}
      </button>
      <button
        onClick={handleResetData}
        title="Khôi phục dữ liệu gốc"
        className="p-1.5 rounded-full text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
      >
        <RotateCcw size={15} />
      </button>
      {showPrint && (
        <button
          onClick={() => window.print()}
          title="In PDF"
          className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Printer size={15} />
        </button>
      )}
    </div>
  );

  const SyncStatus = () => (
    <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
      <span className={`w-2 h-2 rounded-full ${cloudSynced ? 'bg-emerald-400' : 'bg-amber-400'}`} />
      {cloudSynced ? 'Đã đồng bộ Cloud' : 'Đang kết nối...'}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans md:flex">

      {/* ===== SIDEBAR (chỉ desktop) ===== */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-slate-900 text-white no-print z-40">
        <div className="p-5 flex items-center gap-3 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <div className="leading-tight">
            <div className="text-[13px] font-extrabold tracking-tight">KICKBOXING</div>
            <div className="text-[11px] text-slate-500 font-semibold">Cloud Sync</div>
          </div>
        </div>

        <div className="flex-1 p-3">
          <NavList orientation="sidebar" />
        </div>

        <div className="p-3 border-t border-slate-800 space-y-3">
          {isPT && <PTActions showPrint />}
          <RoleSwitch />
          <SyncStatus />
        </div>
      </aside>

      {/* ===== KHUNG NỘI DUNG ===== */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">

        {/* TOP APP BAR (chỉ mobile) */}
        <header className="md:hidden sticky top-0 z-40 bg-slate-900 text-white no-print">
          <div className="px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Zap size={18} className="text-white" />
              </div>
              <div className="leading-tight">
                <div className="text-[13px] font-extrabold tracking-tight">KICKBOXING</div>
                <SyncStatus />
              </div>
            </div>
            <div className="w-32"><RoleSwitch /></div>
          </div>
          {isPT && (
            <div className="px-4 pb-3 flex justify-end border-t border-slate-800 pt-2.5">
              <PTActions showPrint={false} />
            </div>
          )}
        </header>

        <main className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-8 py-6 pb-28 md:pb-10">

          {/* Dải thông báo chế độ */}
          <div className={`mb-5 rounded-xl px-4 py-2.5 text-xs flex items-center gap-2 border no-print ${
            isPT ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <span className={`w-2 h-2 rounded-full shrink-0 ${isPT ? 'bg-emerald-500' : 'bg-blue-500'}`} />
            {isPT ? (
              <span><strong>Chế độ PT</strong> — Bạn có thể chỉnh sửa bài tập, thông số và thực đơn. {isEditing && <strong className="text-amber-700">Đang sửa, nhớ Lưu lên Cloud.</strong>}</span>
            ) : (
              <span><strong>Chế độ Học viên (Anh Đức)</strong> — Bạn có thể tích hoàn thành; PT sẽ cập nhật lộ trình.</span>
            )}
          </div>

          {/* ===== TAB: THỂ TRẠNG ===== */}
          {activeTab === 'overview' && (
            <div className="space-y-6">

              {/* Dải chỉ số chủ đạo (Night Gym) */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 md:p-6">
                <div className="text-[11px] font-bold uppercase tracking-wider text-blue-400">{profile.name} · {profile.age} tuổi</div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mt-3">
                  <div>
                    <div className="flex items-baseline gap-2">
                      {canEdit ? (
                        <input type="number" step="0.1" value={profile.weight}
                          onChange={(e) => handleProfileChange('weight', e.target.value)}
                          className="w-28 bg-transparent border-b border-blue-400 text-4xl font-extrabold tabular-nums tracking-tight focus:outline-none" />
                      ) : (
                        <span className="text-4xl font-extrabold tabular-nums tracking-tight leading-none">{profile.weight}</span>
                      )}
                      <span className="text-sm text-slate-400 font-semibold">kg</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-2 font-medium">
                      Mục tiêu <span className="text-slate-200 font-bold tabular-nums">{profile.targetWeight} kg</span>
                      {!isNaN(remainingKg) && <> · còn <span className="text-orange-400 font-bold tabular-nums">{remainingKg}</span></>}
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

              {/* Hai thanh tiến độ thật */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Hoàn thành tập</span>
                    <span className="text-lg font-extrabold text-blue-600 tabular-nums">{workoutProgressPercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${workoutProgressPercentage}%` }} />
                  </div>
                  <div className="text-[11px] text-slate-500 mt-2 tabular-nums">{completedWorkoutsCount}/{totalWorkoutsCount} bài tập</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Kỷ luật ăn uống</span>
                    <span className="text-lg font-extrabold text-emerald-600 tabular-nums">{mealProgressPercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${mealProgressPercentage}%` }} />
                  </div>
                  <div className="text-[11px] text-slate-500 mt-2 tabular-nums">{completedMealsCount}/{diet.length} ngày</div>
                </div>
              </div>

              {/* Thông tin cá nhân khi sửa */}
              {canEdit && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-4">
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
                    <span className="block font-bold text-slate-500 mb-1">Chiều cao (cm)</span>
                    <input type="number" value={profile.height} onChange={(e) => handleProfileChange('height', e.target.value)}
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
                  {/* Mục tiêu */}
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <Target size={17} className="text-blue-600" />
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">Mục tiêu khách hàng</h3>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm divide-y divide-slate-100">
                      {goals.map((goal, idx) => (
                        <div key={idx} className="px-4 py-3 flex items-start gap-3">
                          <span className="text-blue-600 font-extrabold text-xs tabular-nums mt-0.5">{String(idx + 1).padStart(2, '0')}</span>
                          {canEdit ? (
                            <div className="flex-1 flex gap-2">
                              <input type="text" value={goal} onChange={(e) => handleListChange(setGoals, goals, idx, e.target.value)}
                                className="flex-1 border-b border-slate-200 text-[13px] py-0.5 focus:border-blue-500 focus:outline-none" />
                              <button onClick={() => handleRemoveListItem(setGoals, goals, idx)} className="text-rose-500 hover:text-rose-700"><Trash2 size={14} /></button>
                            </div>
                          ) : (
                            <span className="text-[13px] text-slate-700 leading-relaxed">{goal}</span>
                          )}
                        </div>
                      ))}
                    </div>
                    {canEdit && (
                      <button onClick={() => handleAddListItem(setGoals, goals)} className="mt-2 flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700">
                        <Plus size={13} /> Thêm mục tiêu
                      </button>
                    )}
                  </section>

                  {/* Yếu điểm */}
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle size={17} className="text-rose-500" />
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">Thể trạng cần lưu ý</h3>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm divide-y divide-slate-100">
                      {issues.map((issue, idx) => (
                        <div key={idx} className="px-4 py-3 flex items-start gap-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                          {canEdit ? (
                            <div className="flex-1 flex gap-2">
                              <input type="text" value={issue} onChange={(e) => handleListChange(setIssues, issues, idx, e.target.value)}
                                className="flex-1 border-b border-slate-200 text-[13px] py-0.5 focus:border-blue-500 focus:outline-none" />
                              <button onClick={() => handleRemoveListItem(setIssues, issues, idx)} className="text-rose-500 hover:text-rose-700"><Trash2 size={14} /></button>
                            </div>
                          ) : (
                            <span className="text-[13px] text-slate-700 leading-relaxed">{issue}</span>
                          )}
                        </div>
                      ))}
                    </div>
                    {canEdit && (
                      <button onClick={() => handleAddListItem(setIssues, issues)} className="mt-2 flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700">
                        <Plus size={13} /> Thêm yếu điểm
                      </button>
                    )}
                  </section>
                </div>

                {/* Định hướng HLV */}
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Wrench size={17} className="text-emerald-600" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">Định hướng của HLV</h3>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm divide-y divide-slate-100">
                    {solutions.map((sol, idx) => (
                      <div key={idx} className="px-4 py-3 flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-[11px] font-extrabold shrink-0 mt-0.5">{idx + 1}</div>
                        {canEdit ? (
                          <div className="flex-1 flex gap-2">
                            <textarea value={sol} rows={2} onChange={(e) => handleListChange(setSolutions, solutions, idx, e.target.value)}
                              className="flex-1 border border-slate-200 rounded-lg text-[13px] p-1.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none" />
                            <button onClick={() => handleRemoveListItem(setSolutions, solutions, idx)} className="text-rose-500 hover:text-rose-700 h-fit"><Trash2 size={14} /></button>
                          </div>
                        ) : (
                          <span className="text-[13px] text-slate-700 leading-relaxed">{sol}</span>
                        )}
                      </div>
                    ))}
                  </div>
                  {canEdit && (
                    <button onClick={() => handleAddListItem(setSolutions, solutions)} className="mt-2 flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700">
                      <Plus size={13} /> Thêm định hướng
                    </button>
                  )}
                </section>

              </div>
            </div>
          )}

          {/* ===== TAB: LỘ TRÌNH TẬP LUYỆN ===== */}
          {activeTab === 'workouts' && (
            <div className="space-y-6">
              {phases.map((phase, pIdx) => {
                const phaseTotal = phase.blocks.reduce((a, b) => a + b.exercises.length, 0);
                let phaseDone = 0;
                phase.blocks.forEach((b, bIdx) => { phaseDone += blockProgress(pIdx, bIdx, b.exercises.length); });
                return (
                  <div key={phase.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-slate-900 text-white p-4">
                      <div className="flex items-start justify-between gap-3">
                        {canEdit ? (
                          <input type="text" value={phase.title}
                            onChange={(e) => { const np = [...phases]; np[pIdx].title = e.target.value; setPhases(np); }}
                            className="flex-1 bg-transparent border-b border-blue-400 text-base font-bold focus:outline-none text-white" />
                        ) : (
                          <h3 className="text-base font-bold leading-snug">{phase.title}</h3>
                        )}
                        <span className="shrink-0 text-[11px] font-bold text-slate-900 bg-emerald-400 px-2.5 py-1 rounded-full tabular-nums">{phaseDone}/{phaseTotal}</span>
                      </div>
                      {canEdit ? (
                        <textarea value={phase.desc} rows={2}
                          onChange={(e) => { const np = [...phases]; np[pIdx].desc = e.target.value; setPhases(np); }}
                          className="w-full mt-2 bg-transparent border border-slate-700 rounded-lg p-1.5 text-xs text-slate-300 focus:outline-none" />
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
                              {canEdit ? (
                                <input type="text" value={block.name}
                                  onChange={(e) => { const np = [...phases]; np[pIdx].blocks[bIdx].name = e.target.value; setPhases(np); }}
                                  className="flex-1 text-sm font-bold text-slate-800 border-b border-slate-300 focus:border-blue-500 focus:outline-none" />
                              ) : (
                                <h4 className="text-sm font-bold text-slate-800 truncate">{block.name}</h4>
                              )}
                            </div>
                            {canEdit ? (
                              <input type="text" value={block.sessions}
                                onChange={(e) => { const np = [...phases]; np[pIdx].blocks[bIdx].sessions = e.target.value; setPhases(np); }}
                                className="text-[11px] text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full font-bold text-right focus:outline-none" />
                            ) : (
                              <span className="text-[11px] text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full font-bold whitespace-nowrap shrink-0">{block.sessions}</span>
                            )}
                          </div>

                          {/* Ô mục tiêu — nền tint, viền đầy */}
                          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-3">
                            {canEdit ? (
                              <textarea value={block.target} rows={2}
                                onChange={(e) => { const np = [...phases]; np[pIdx].blocks[bIdx].target = e.target.value; setPhases(np); }}
                                className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none" />
                            ) : (
                              <p className="text-xs text-slate-700 leading-relaxed"><strong className="text-blue-700">Mục tiêu:</strong> {block.target}</p>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            {block.exercises.map((ex, eIdx) => {
                              const uniqueId = `${pIdx}-${bIdx}-${eIdx}`;
                              const isDone = !!completedSessions[uniqueId];
                              return (
                                <div key={eIdx}
                                  className={`flex items-start gap-3 p-2.5 rounded-lg border transition-colors ${
                                    isDone ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-100 hover:border-slate-200'
                                  }`}>
                                  <button onClick={() => toggleSessionComplete(uniqueId)} className="mt-0.5 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">
                                    {isDone ? (
                                      <span className="w-4 h-4 rounded bg-emerald-600 flex items-center justify-center"><Check size={12} className="text-white" strokeWidth={3} /></span>
                                    ) : (
                                      <span className="block w-4 h-4 rounded border border-slate-300 hover:border-blue-500" />
                                    )}
                                  </button>
                                  {canEdit ? (
                                    <div className="flex-1 flex gap-2">
                                      <input type="text" value={ex}
                                        onChange={(e) => { const np = [...phases]; np[pIdx].blocks[bIdx].exercises[eIdx] = e.target.value; setPhases(np); }}
                                        className="flex-1 border-b border-slate-200 text-xs py-0.5 focus:border-blue-500 focus:outline-none" />
                                      <button onClick={() => { const np = [...phases]; np[pIdx].blocks[bIdx].exercises = np[pIdx].blocks[bIdx].exercises.filter((_, i) => i !== eIdx); setPhases(np); }}
                                        className="text-rose-500 hover:text-rose-700"><Trash2 size={14} /></button>
                                    </div>
                                  ) : (
                                    <span className={`text-xs leading-relaxed ${isDone ? 'line-through text-slate-400' : 'text-slate-700'}`}>{ex}</span>
                                  )}
                                </div>
                              );
                            })}
                            {canEdit && (
                              <button onClick={() => { const np = [...phases]; np[pIdx].blocks[bIdx].exercises.push("Bài tập mới (Sửa text tại đây)"); setPhases(np); }}
                                className="mt-1 flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700">
                                <Plus size={13} /> Thêm bài tập
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ===== TAB: THỰC ĐƠN DINH DƯỠNG ===== */}
          {activeTab === 'diet' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {diet.map((item, dIdx) => (
                <div key={item.day}
                  className={`bg-white border rounded-2xl overflow-hidden shadow-sm flex flex-col ${
                    item.done ? 'border-emerald-500 ring-1 ring-emerald-500/20' : 'border-slate-200'
                  }`}>
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <button onClick={() => handleDietDoneToggle(dIdx)} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-full">
                        {item.done ? (
                          <span className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center"><Check size={12} className="text-white" strokeWidth={3} /></span>
                        ) : (
                          <span className="block w-5 h-5 rounded-full border border-slate-300 hover:border-emerald-500" />
                        )}
                      </button>
                      <span className="text-sm font-extrabold text-slate-900">Ngày {item.day}</span>
                    </div>
                    {canEdit ? (
                      <select value={item.type}
                        onChange={(e) => { const nd = [...diet]; nd[dIdx].type = e.target.value; setDiet(nd); }}
                        className="text-[11px] bg-white border border-slate-200 rounded-lg px-1.5 py-0.5 focus:outline-none focus:border-blue-500">
                        <option value="Standard">Standard</option>
                        <option value="Cheat">Xả Nhẹ</option>
                        <option value="Half">Half-way</option>
                      </select>
                    ) : (
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        item.type === 'Cheat' ? 'bg-amber-100 text-amber-700' : item.type === 'Half' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {item.type === 'Cheat' ? 'Xả Nhẹ' : item.type === 'Half' ? 'Half-way' : 'Standard'}
                      </span>
                    )}
                  </div>
                  <div className="p-4 space-y-3 flex-1">
                    {[['Sáng', 's'], ['Trưa', 't'], ['Xế', 'x'], ['Tối', 'to']].map(([label, key]) => (
                      <div key={key}>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">{label}</div>
                        {canEdit ? (
                          <textarea value={item[key]} rows={2}
                            onChange={(e) => handleDietMealChange(dIdx, key, e.target.value)}
                            className="w-full text-xs text-slate-700 border border-slate-200 rounded-lg p-1.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none" />
                        ) : (
                          <p className="text-[13px] text-slate-700 leading-relaxed">{item[key]}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

        </main>
      </div>

      {/* ===== BOTTOM NAV (chỉ mobile) ===== */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 no-print">
        <NavList orientation="bottom" />
      </nav>

      {/* ===== MODAL NHẬP MÃ PIN ===== */}
      {showPinModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
                <KeyRound size={22} className="text-emerald-600" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mt-3">Mở khóa quyền PT</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">Nhập mã PIN bảo mật để kích hoạt giao diện quản lý và sửa đổi lộ trình của HLV.</p>
            </div>
            <form onSubmit={handleVerifyPIN} className="mt-5 space-y-4">
              <input type="password" maxLength={6} placeholder="Nhập mã PIN (Mặc định: 1234)"
                value={pinInput} onChange={(e) => setPinInput(e.target.value)}
                className="w-full text-center tracking-widest text-lg font-bold border border-slate-300 rounded-xl py-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 focus:outline-none" />
              {pinError && <p className="text-[11px] text-rose-500 font-bold text-center">{pinError}</p>}
              <div className="flex gap-2">
                <button type="button" onClick={() => { setShowPinModal(false); setPinError(''); setPinInput(''); }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5">
                  <X size={14} /> Hủy bỏ
                </button>
                <button type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-xl text-xs">
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}