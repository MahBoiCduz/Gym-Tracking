// src/App.jsx
import React, { useState, useEffect } from 'react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

// Gọi trực tiếp cấu hình từ file firebase.js anh vừa tạo ở trên
import { db, auth, appId } from './firebase'; 

export default function App() {
  // Giao diện tự động nhận dữ liệu đám mây và hoạt động bình thường
}
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

  // 1. KÍCH HOẠT AUTHENTICATION (RULE 3)
  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Lỗi đăng nhập ẩn danh:", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // 2. LẮNG NGHE DỮ LIỆU ĐỒNG BỘ THỜI GIAN THỰC (RULE 1 & 2)
  useEffect(() => {
    if (!db || !user) return;

    // Đường dẫn chính xác theo Rule 1 dành cho dữ liệu chia sẻ công khai giữa PT & Học viên
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
  const mealProgressPercentage = Math.round((completedMealsCount / diet.length) * 100);

  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16">
      
      {/* 1. THANH TIÊU ĐỀ ĐIỀU KHIỂN PHÂN QUYỀN VÀ KHÓA CHỨC NĂNG */}
      <header className="bg-slate-900 text-white shadow-md sticky top-0 z-40 no-print">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-blue-600 rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight">KICKBOXING CLOUD SYNC</h1>
              <p className="text-[11px] text-slate-400">
                {cloudSynced ? '🟢 Đang đồng bộ thời gian thực với Cloud' : '🟡 Đang kết nối mạng...'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Bộ chuyển đổi Vai Trò */}
            <div className="bg-slate-800 p-0.5 rounded-lg flex border border-slate-700">
              <button 
                onClick={() => {
                  setCurrentRole('client');
                  setIsEditing(false);
                }}
                className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                  currentRole === 'client' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
                }`}
              >
                Học Viên
              </button>
              <button 
                onClick={() => {
                  if (currentRole === 'pt') {
                    setCurrentRole('client');
                    setIsEditing(false);
                  } else {
                    setShowPinModal(true);
                  }
                }}
                className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                  currentRole === 'pt' 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
                }`}
              >
                Huấn Luyện Viên (PT)
              </button>
            </div>

            {/* Các nút dành riêng cho PT */}
            {currentRole === 'pt' && (
              <div className="flex items-center gap-1.5 border-l border-slate-700 pl-3">
                <button 
                  onClick={() => {
                    if (isEditing) {
                      handleSaveEdit();
                    } else {
                      setIsEditing(true);
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 transition-all ${
                    isEditing 
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-900 animate-pulse' 
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {isEditing ? 'LƯU LÊN CLOUD' : 'CHỈNH SỬA TEXT'}
                </button>

                <button 
                  onClick={handleResetData}
                  className="p-1 bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 rounded-full transition-all"
                  title="Khôi phục gốc"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18" />
                  </svg>
                </button>
              </div>
            )}

            <button 
              onClick={() => window.print()}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-[11px] font-bold text-slate-300 transition-all"
            >
              IN PDF
            </button>
          </div>
        </div>
      </header>

      {/* 2. THÔNG BÁO CHẾ ĐỘ HIỆN TẠI */}
      <div className="max-w-6xl mx-auto px-4 mt-4 no-print">
        {currentRole === 'pt' ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between shadow-sm">
            <span className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <strong>Chế độ: PT (Huấn Luyện Viên)</strong> — Bạn có quyền sửa đổi nội dung bài tập, thông số thể trạng và chế độ ăn uống.
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">Mã PIN: OK</span>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between shadow-sm">
            <span className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <strong>Chế độ: Học Viên (Anh Đức)</strong> — Bạn chỉ có thể theo dõi tiến trình và tích chọn Hoàn thành. PT sẽ cập nhật lộ trình này cho bạn.
            </span>
            <button 
              onClick={() => setShowPinModal(true)} 
              className="text-[10px] text-blue-600 hover:underline font-bold"
            >
              Mở khóa PT 🔑
            </button>
          </div>
        )}
      </div>

      {/* Hero Banner Tiến độ */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white py-8 px-4 mt-4 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/30 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Học viên: Anh Đức</span>
            <h2 className="text-2xl font-extrabold mt-2 tracking-tight">TIẾN ĐỘ THỰC HIỆN MỤC TIÊU</h2>
            <p className="text-slate-300 mt-1 max-w-xl text-xs">
              Mọi cập nhật tích chọn hoàn thành bài tập hoặc bữa ăn sẽ ngay lập tức hiển thị đồng thời trên màn hình của PT và Học viên.
            </p>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-3 flex-1 md:flex-none md:w-40 border border-white/10">
              <div className="text-[10px] text-slate-300 font-medium">Hoàn thành Tập</div>
              <div className="text-xl font-black text-blue-400 mt-0.5">{workoutProgressPercentage}%</div>
              <div className="w-full bg-white/20 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-blue-400 h-full transition-all duration-500" style={{ width: `${workoutProgressPercentage}%` }} />
              </div>
              <div className="text-[9px] text-slate-400 mt-1">{completedWorkoutsCount}/{totalWorkoutsCount} bài tập</div>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-xl p-3 flex-1 md:flex-none md:w-40 border border-white/10">
              <div className="text-[10px] text-slate-300 font-medium">Kỷ luật Ăn uống</div>
              <div className="text-xl font-black text-emerald-400 mt-0.5">{mealProgressPercentage}%</div>
              <div className="w-full bg-white/20 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-emerald-400 h-full transition-all duration-500" style={{ width: `${mealProgressPercentage}%` }} />
              </div>
              <div className="text-[9px] text-slate-400 mt-1">{completedMealsCount}/{diet.length} ngày</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4">
        
        {/* Navigation Tabs no-print */}
        <div className="flex border-b border-slate-200 mb-6 no-print overflow-x-auto whitespace-nowrap">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-5 font-semibold text-xs border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'overview' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            📊 Thể Trạng & Chỉ Số
          </button>
          <button 
            onClick={() => setActiveTab('workouts')}
            className={`py-3 px-5 font-semibold text-xs border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'workouts' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            🥊 Lộ Trình Tập Luyện
          </button>
          <button 
            onClick={() => setActiveTab('diet')}
            className={`py-3 px-5 font-semibold text-xs border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'diet' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            🥗 Thực Đơn Dinh Dưỡng
          </button>
        </div>

        {/* TAB 1: THỂ TRẠNG VÀ CHỈ SỐ CƠ BẢN */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {/* Họ tên */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Họ và Tên</span>
                  {isEditing && currentRole === 'pt' ? (
                    <input 
                      type="text" 
                      value={profile.name} 
                      onChange={(e) => handleProfileChange('name', e.target.value)}
                      className="text-sm font-bold text-slate-800 w-full mt-1 border-b border-blue-500 focus:outline-none"
                    />
                  ) : (
                    <h3 className="text-base font-bold text-slate-800 mt-1">{profile.name}</h3>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <span>Tuổi:</span>
                  {isEditing && currentRole === 'pt' ? (
                    <input 
                      type="number" 
                      value={profile.age} 
                      onChange={(e) => handleProfileChange('age', e.target.value)}
                      className="w-12 text-right font-bold text-slate-800 border-b border-blue-500 focus:outline-none"
                    />
                  ) : (
                    <span className="font-bold text-slate-700">{profile.age} tuổi</span>
                  )}
                </div>
              </div>

              {/* Chiều cao / Cân nặng */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Chiều cao / Nặng</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    {isEditing && currentRole === 'pt' ? (
                      <div className="flex gap-1 items-center">
                        <input 
                          type="number" 
                          step="0.1"
                          value={profile.weight} 
                          onChange={(e) => handleProfileChange('weight', e.target.value)}
                          className="text-base font-black text-slate-800 w-16 border-b border-blue-500 focus:outline-none"
                        />
                        <span className="text-xs text-slate-500">kg</span>
                      </div>
                    ) : (
                      <>
                        <span className="text-xl font-black text-slate-800">{profile.weight}</span>
                        <span className="text-xs text-slate-500">kg</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <span>Cao:</span>
                  {isEditing && currentRole === 'pt' ? (
                    <div className="flex items-center">
                      <input 
                        type="number" 
                        value={profile.height} 
                        onChange={(e) => handleProfileChange('height', e.target.value)}
                        className="w-12 text-right font-bold text-slate-800 border-b border-blue-500 focus:outline-none"
                      />
                      <span>cm</span>
                    </div>
                  ) : (
                    <span className="font-bold text-slate-700">{profile.height} cm</span>
                  )}
                </div>
              </div>

              {/* Chỉ số BMI */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Chỉ số BMI</span>
                  <div className="text-xl font-black text-amber-600 mt-1">
                    {calculateBMI(profile.weight, profile.height)}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <span>Mục tiêu:</span>
                  {isEditing && currentRole === 'pt' ? (
                    <div className="flex items-center">
                      <input 
                        type="number" 
                        value={profile.targetWeight} 
                        onChange={(e) => handleProfileChange('targetWeight', e.target.value)}
                        className="w-10 text-right font-bold text-slate-800 border-b border-blue-500 focus:outline-none"
                      />
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
                <div className="mt-4 text-[9px] text-slate-400 pt-2 border-t border-slate-100">
                  Năng lượng thô tối thiểu
                </div>
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

            {/* Chi tiết mục tiêu & thể trạng */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Trái: Mục tiêu & Yếu điểm */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <span className="text-blue-500">🎯</span> Mục Tiêu Khách Hàng
                  </h4>
                  <ul className="space-y-3">
                    {goals.map((goal, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="text-blue-500 mt-1">•</span>
                        {isEditing && currentRole === 'pt' ? (
                          <div className="flex-1 flex gap-2">
                            <input 
                              type="text" 
                              value={goal} 
                              onChange={(e) => handleListChange(setGoals, goals, idx, e.target.value)}
                              className="flex-1 border-b border-slate-200 text-xs py-0.5 focus:border-blue-500 focus:outline-none"
                            />
                            <button 
                              onClick={() => handleRemoveListItem(setGoals, goals, idx)}
                              className="text-rose-500 hover:text-rose-700 text-[10px] px-1"
                            >
                              Xóa
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-700">{goal}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                  {isEditing && currentRole === 'pt' && (
                    <button 
                      onClick={() => handleAddListItem(setGoals, goals)}
                      className="mt-3 text-[10px] text-blue-600 hover:text-blue-700 font-bold"
                    >
                      + Thêm mục tiêu
                    </button>
                  )}
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <span className="text-rose-500">⚠️</span> Thể Trạng Hiện Tại (Yếu điểm)
                  </h4>
                  <ul className="space-y-3">
                    {issues.map((issue, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="text-rose-500 mt-1">•</span>
                        {isEditing && currentRole === 'pt' ? (
                          <div className="flex-1 flex gap-2">
                            <input 
                              type="text" 
                              value={issue} 
                              onChange={(e) => handleListChange(setIssues, issues, idx, e.target.value)}
                              className="flex-1 border-b border-slate-200 text-xs py-0.5 focus:border-blue-500 focus:outline-none"
                            />
                            <button 
                              onClick={() => handleRemoveListItem(setIssues, issues, idx)}
                              className="text-rose-500 hover:text-rose-700 text-[10px] px-1"
                            >
                              Xóa
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-700">{issue}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                  {isEditing && currentRole === 'pt' && (
                    <button 
                      onClick={() => handleAddListItem(setIssues, issues)}
                      className="mt-3 text-[10px] text-rose-600 hover:text-rose-700 font-bold"
                    >
                      + Thêm yếu điểm thể trạng
                    </button>
                  )}
                </div>

              </div>

              {/* Phải: Định hướng của HLV */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <span className="text-emerald-500">🛠️</span> Định Hướng Giải Quyết (HLV)
                </h4>
                <ul className="space-y-3">
                  {solutions.map((sol, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      {isEditing && currentRole === 'pt' ? (
                        <div className="flex-1 flex gap-2">
                          <textarea 
                            value={sol} 
                            rows={2}
                            onChange={(e) => handleListChange(setSolutions, solutions, idx, e.target.value)}
                            className="flex-1 border border-slate-200 text-xs p-1 rounded focus:border-blue-500 focus:outline-none"
                          />
                          <button 
                            onClick={() => handleRemoveListItem(setSolutions, solutions, idx)}
                            className="text-rose-500 hover:text-rose-700 text-[10px] px-1 h-fit"
                          >
                            Xóa
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-700 leading-relaxed">{sol}</span>
                      )}
                    </li>
                  ))}
                </ul>
                {isEditing && currentRole === 'pt' && (
                  <button 
                    onClick={() => handleAddListItem(setSolutions, solutions)}
                    className="mt-4 text-[10px] text-emerald-600 hover:text-emerald-700 font-bold"
                  >
                    + Thêm định hướng giải quyết
                  </button>
                )}
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: LỘ TRÌNH TẬP LUYỆN */}
        {activeTab === 'workouts' && (
          <div className="space-y-8">
            {phases.map((phase, pIdx) => (
              <div key={phase.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                
                <div className="bg-slate-900 text-white p-4">
                  {isEditing && currentRole === 'pt' ? (
                    <input 
                      type="text" 
                      value={phase.title} 
                      onChange={(e) => {
                        const newPhases = [...phases];
                        newPhases[pIdx].title = e.target.value;
                        setPhases(newPhases);
                      }}
                      className="text-sm font-bold bg-transparent border-b border-blue-400 w-full focus:outline-none text-white"
                    />
                  ) : (
                    <h3 className="text-sm font-bold">{phase.title}</h3>
                  )}
                  
                  {isEditing && currentRole === 'pt' ? (
                    <textarea 
                      value={phase.desc} 
                      onChange={(e) => {
                        const newPhases = [...phases];
                        newPhases[pIdx].desc = e.target.value;
                        setPhases(newPhases);
                      }}
                      rows={2}
                      className="text-[11px] text-slate-300 bg-transparent border border-slate-700 rounded p-1 w-full mt-2 focus:outline-none"
                    />
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
                          {isEditing && currentRole === 'pt' ? (
                            <input 
                              type="text" 
                              value={block.name} 
                              onChange={(e) => {
                                const newPhases = [...phases];
                                newPhases[pIdx].blocks[bIdx].name = e.target.value;
                                setPhases(newPhases);
                              }}
                              className="font-bold text-slate-800 text-xs border-b border-slate-300 focus:outline-none"
                            />
                          ) : (
                            <h4 className="font-bold text-slate-800 text-xs">{block.name}</h4>
                          )}
                        </div>
                        
                        {isEditing && currentRole === 'pt' ? (
                          <input 
                            type="text" 
                            value={block.sessions} 
                            onChange={(e) => {
                              const newPhases = [...phases];
                              newPhases[pIdx].blocks[bIdx].sessions = e.target.value;
                              setPhases(newPhases);
                            }}
                            className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-bold border border-blue-200 text-right focus:outline-none"
                          />
                        ) : (
                          <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-bold">
                            {block.sessions}
                          </span>
                        )}
                      </div>

                      <div className="bg-slate-50 border-l-4 border-blue-400 p-2.5 rounded-r mb-3">
                        {isEditing && currentRole === 'pt' ? (
                          <textarea 
                            value={block.target} 
                            onChange={(e) => {
                              const newPhases = [...phases];
                              newPhases[pIdx].blocks[bIdx].target = e.target.value;
                              setPhases(newPhases);
                            }}
                            rows={2}
                            className="text-xs text-slate-700 bg-white border border-slate-200 rounded p-1 w-full focus:outline-none"
                          />
                        ) : (
                          <p className="text-xs text-slate-700 font-medium"><strong>Mục tiêu:</strong> {block.target}</p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <div className="grid grid-cols-1 gap-1.5">
                          {block.exercises.map((ex, eIdx) => {
                            const uniqueId = `${pIdx}-${bIdx}-${eIdx}`;
                            const isDone = !!completedSessions[uniqueId];
                            
                            return (
                              <div 
                                key={eIdx} 
                                className={`flex items-start gap-2.5 p-2 rounded transition-all border ${
                                  isDone 
                                  ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800' 
                                  : 'bg-white border-slate-100 text-slate-700 hover:border-slate-200'
                                }`}
                              >
                                <button 
                                  onClick={() => toggleSessionComplete(uniqueId)}
                                  className="mt-0.5 shrink-0"
                                >
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

                                {isEditing && currentRole === 'pt' ? (
                                  <div className="flex-1 flex gap-2">
                                    <input 
                                      type="text" 
                                      value={ex} 
                                      onChange={(e) => {
                                        const newPhases = [...phases];
                                        newPhases[pIdx].blocks[bIdx].exercises[eIdx] = e.target.value;
                                        setPhases(newPhases);
                                      }}
                                      className="flex-1 border-b border-slate-200 text-xs py-0.5 focus:outline-none focus:border-blue-500"
                                    />
                                    <button 
                                      onClick={() => {
                                        const newPhases = [...phases];
                                        newPhases[pIdx].blocks[bIdx].exercises = newPhases[pIdx].blocks[bIdx].exercises.filter((_, i) => i !== eIdx);
                                        setPhases(newPhases);
                                      }}
                                      className="text-rose-500 hover:text-rose-700 text-xs px-1"
                                    >
                                      Xóa
                                    </button>
                                  </div>
                                ) : (
                                  <span className={`text-xs ${isDone ? 'line-through text-slate-400' : ''}`}>{ex}</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        
                        {isEditing && currentRole === 'pt' && (
                          <button 
                            onClick={() => {
                              const newPhases = [...phases];
                              newPhases[pIdx].blocks[bIdx].exercises.push("Bài tập mới (Sửa text tại đây)");
                              setPhases(newPhases);
                            }}
                            className="mt-1 text-[10px] text-blue-600 hover:text-blue-700 font-bold"
                          >
                            + Thêm bài tập mới
                          </button>
                        )}
                      </div>

                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>
        )}

        {/* TAB 3: THỰC ĐƠN DINH DƯỠNG */}
        {activeTab === 'diet' && (
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {diet.map((item, dIdx) => (
                <div 
                  key={item.day} 
                  className={`bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm transition-all duration-300 flex flex-col justify-between ${
                    item.done ? 'border-emerald-500 ring-1 ring-emerald-500/20' : ''
                  }`}
                >
                  
                  <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleDietDoneToggle(dIdx)}
                        className="focus:outline-none"
                      >
                        {item.done ? (
                          <div className="w-4 h-4 bg-emerald-500 text-white rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-4 h-4 bg-white border border-slate-300 hover:border-emerald-500 rounded-full" />
                        )}
                      </button>
                      <span className="font-bold text-slate-800 text-xs">Ngày {item.day}</span>
                    </div>

                    {isEditing && currentRole === 'pt' ? (
                      <select 
                        value={item.type} 
                        onChange={(e) => {
                          const newDiet = [...diet];
                          newDiet[dIdx].type = e.target.value;
                          setDiet(newDiet);
                        }}
                        className="text-[10px] bg-white border border-slate-200 rounded px-1.5 py-0.5 focus:outline-none"
                      >
                        <option value="Standard">Standard</option>
                        <option value="Cheat">Xả Nhẹ</option>
                        <option value="Half">Half-way</option>
                      </select>
                    ) : (
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        item.type === 'Cheat' 
                        ? 'bg-amber-100 text-amber-700' 
                        : item.type === 'Half' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {item.type === 'Cheat' ? 'Xả Nhẹ' : item.type === 'Half' ? 'Half-way!' : 'Standard'}
                      </span>
                    )}
                  </div>

                  <div className="p-3 space-y-3 flex-1">
                    {/* Sáng */}
                    <div className="text-[11px]">
                      <span className="font-bold text-slate-400 uppercase tracking-wider block text-[8px] mb-0.5">Sáng</span>
                      {isEditing && currentRole === 'pt' ? (
                        <textarea 
                          value={item.s} 
                          rows={2}
                          onChange={(e) => handleDietMealChange(dIdx, 's', e.target.value)}
                          className="w-full text-xs text-slate-700 border border-slate-200 p-1 rounded focus:outline-none focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-slate-700">{item.s}</p>
                      )}
                    </div>

                    {/* Trưa */}
                    <div className="text-[11px]">
                      <span className="font-bold text-slate-400 uppercase tracking-wider block text-[8px] mb-0.5">Trưa</span>
                      {isEditing && currentRole === 'pt' ? (
                        <textarea 
                          value={item.t} 
                          rows={2}
                          onChange={(e) => handleDietMealChange(dIdx, 't', e.target.value)}
                          className="w-full text-xs text-slate-700 border border-slate-200 p-1 rounded focus:outline-none focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-slate-700">{item.t}</p>
                      )}
                    </div>

                    {/* Xế */}
                    <div className="text-[11px]">
                      <span className="font-bold text-slate-400 uppercase tracking-wider block text-[8px] mb-0.5">Xế</span>
                      {isEditing && currentRole === 'pt' ? (
                        <textarea 
                          value={item.x} 
                          rows={2}
                          onChange={(e) => handleDietMealChange(dIdx, 'x', e.target.value)}
                          className="w-full text-xs text-slate-700 border border-slate-200 p-1 rounded focus:outline-none focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-slate-700">{item.x}</p>
                      )}
                    </div>

                    {/* Tối */}
                    <div className="text-[11px]">
                      <span className="font-bold text-slate-400 uppercase tracking-wider block text-[8px] mb-0.5">Tối</span>
                      {isEditing && currentRole === 'pt' ? (
                        <textarea 
                          value={item.to} 
                          rows={2}
                          onChange={(e) => handleDietMealChange(dIdx, 'to', e.target.value)}
                          className="w-full text-xs text-slate-700 border border-slate-200 p-1 rounded focus:outline-none focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-slate-700">{item.to}</p>
                      )}
                    </div>
                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

      </main>

      {/* 3. MODAL NHẬP MÃ PIN (PT AUTHENTICATION POPUP) */}
      {showPinModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full p-6 animate-scaleIn">
            <div className="text-center">
              <span className="text-3xl">🔑</span>
              <h3 className="text-base font-bold text-slate-800 mt-2">MỞ KHÓA QUYỀN PT</h3>
              <p className="text-xs text-slate-500 mt-1">Vui lòng nhập mã PIN bảo mật để kích hoạt giao diện quản lý và sửa đổi lộ trình của HLV.</p>
            </div>

            <form onSubmit={handleVerifyPIN} className="mt-5 space-y-4">
              <div>
                <input 
                  type="password" 
                  maxLength={6}
                  placeholder="Nhập mã PIN (Mặc định: 1234)"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full text-center tracking-widest text-lg font-bold border border-slate-300 rounded-lg py-2 focus:border-emerald-500 focus:outline-none"
                />
                {pinError && <p className="text-[11px] text-rose-500 font-bold mt-1 text-center">{pinError}</p>}
              </div>

              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowPinModal(false);
                    setPinError('');
                    setPinInput('');
                  }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 rounded-lg text-xs"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg text-xs"
                >
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