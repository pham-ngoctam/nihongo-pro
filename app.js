/* Nihongo Pro Ultimate — client app. Supabase Auth + per-user cloud progress. */
const SUPABASE_URL = ""; // Paste Project URL from Supabase
const SUPABASE_ANON_KEY = ""; // Paste anon/public key from Supabase (never service_role)
const hasSupabase = !!(SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase);
const sb = hasSupabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const $ = (s) => document.querySelector(s);
const state = {
  user:null, profileName:"Khách học", view:"home", authMode:"login",
  progress: loadLocal(), kanaType:"hiragana", selectedLevel:"N5",
  currentListening:0, currentQuiz:0, quizAnswer:null
};
function freshProgress(){return {xp:0,completed:[],known:[],streak:0,lastStudy:"",level:"Bắt đầu"}}
function loadLocal(){try{return {...freshProgress(),...JSON.parse(localStorage.getItem("nihongoProProgress")||"{}")}}catch{return freshProgress()}}
function saveLocal(){localStorage.setItem("nihongoProProgress",JSON.stringify(state.progress));renderStats()}
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2600)}
const levels=[
 {id:"START",name:"Bắt đầu từ số 0",sub:"Làm quen tiếng Nhật",desc:"Hiragana, Katakana, phát âm, chào hỏi và câu cơ bản.",units:["Hiragana – hàng nguyên âm","Hiragana – hàng K/S/T/N","Hiragana – hàng H/M/Y/R/W","Âm đục, âm bán đục và âm ghép","Katakana – bảng chữ cái","Trường âm, âm ngắt và âm mũi","Chào hỏi và giới thiệu bản thân","Số đếm, ngày tháng và giờ","Câu khẳng định, phủ định, câu hỏi","Ôn tập nền tảng"]},
 {id:"N5",name:"JLPT N5",sub:"Sơ cấp 1",desc:"Ngữ pháp và từ vựng nền tảng, giao tiếp đời sống.",units:["Danh từ và です／じゃありません","Trợ từ は・が・を・に・で","Động từ thể ます","Tính từ い và な","Thể て và yêu cầu","Thể quá khứ và phủ định","Tồn tại あります／います","So sánh và mong muốn","Thể từ điển và khả năng","Ôn tập N5"]},
 {id:"N4",name:"JLPT N4",sub:"Sơ cấp 2",desc:"Mở rộng cấu trúc câu và giao tiếp thường ngày.",units:["Thể thông thường","と思います・と言います","Thể ない và なくてもいい","Thể điều kiện と・たら・ば","Thể khả năng","受身 cơ bản","使役 cơ bản","Cho và nhận あげる・くれる・もらう","Mục đích và dự định","Ôn tập N4"]},
 {id:"N3",name:"JLPT N3",sub:"Trung cấp",desc:"Đọc hiểu, nghe hiểu và diễn đạt tự nhiên hơn.",units:["原因・理由 – nguyên nhân","逆接 – nhượng bộ","条件 – điều kiện","推量・様子 – suy đoán","判断・評価 – đánh giá","敬語の基礎 – kính ngữ cơ bản","複合動詞 – động từ kép","文章表現 – biểu đạt văn viết","会話表現 – hội thoại","Ôn tập N3"]},
 {id:"N2",name:"JLPT N2",sub:"Trung cao cấp",desc:"Văn bản báo chí, công sở và cấu trúc học thuật.",units:["対比・逆接 – đối chiếu","限定・強調 – giới hạn, nhấn mạnh","判断・主張 – nhận định","傾向・変化 – xu hướng","敬語・ビジネス – kính ngữ công việc","抽象語彙 – từ vựng trừu tượng","新聞読解 – đọc báo","長文読解 – đọc dài","聴解応答 – phản hồi nghe","Ôn tập N2"]},
 {id:"N1",name:"JLPT N1",sub:"Cao cấp",desc:"Sắc thái tinh tế, văn phong trang trọng và văn bản chuyên sâu.",units:["高度な文法 – ngữ pháp nâng cao","文語・硬い表現 – văn phong trang trọng","慣用表現 – thành ngữ","類義語の使い分け – phân biệt từ gần nghĩa","論説文読解 – đọc nghị luận","専門的語彙 – từ chuyên ngành","抽象的な聴解 – nghe trừu tượng","敬語の運用 – vận dụng kính ngữ","要旨・意図理解 – nắm ý và hàm ý","Ôn tập N1"]}
];
const kana={
 hiragana:[["あ","a"],["い","i"],["う","u"],["え","e"],["お","o"],["か","ka"],["き","ki"],["く","ku"],["け","ke"],["こ","ko"],["さ","sa"],["し","shi"],["す","su"],["せ","se"],["そ","so"],["た","ta"],["ち","chi"],["つ","tsu"],["て","te"],["と","to"],["な","na"],["に","ni"],["ぬ","nu"],["ね","ne"],["の","no"],["は","ha"],["ひ","hi"],["ふ","fu"],["へ","he"],["ほ","ho"],["ま","ma"],["み","mi"],["む","mu"],["め","me"],["も","mo"],["や","ya"],["ゆ","yu"],["よ","yo"],["ら","ra"],["り","ri"],["る","ru"],["れ","re"],["ろ","ro"],["わ","wa"],["を","wo"],["ん","n"]],
 katakana:[["ア","a"],["イ","i"],["ウ","u"],["エ","e"],["オ","o"],["カ","ka"],["キ","ki"],["ク","ku"],["ケ","ke"],["コ","ko"],["サ","sa"],["シ","shi"],["ス","su"],["セ","se"],["ソ","so"],["タ","ta"],["チ","chi"],["ツ","tsu"],["テ","te"],["ト","to"],["ナ","na"],["ニ","ni"],["ヌ","nu"],["ネ","ne"],["ノ","no"],["ハ","ha"],["ヒ","hi"],["フ","fu"],["ヘ","he"],["ホ","ho"],["マ","ma"],["ミ","mi"],["ム","mu"],["メ","me"],["モ","mo"],["ヤ","ya"],["ユ","yu"],["ヨ","yo"],["ラ","ra"],["リ","ri"],["ル","ru"],["レ","re"],["ロ","ro"],["ワ","wa"],["ヲ","wo"],["ン","n"]]
};
const vocab={
 START:[["学生","がくせい","học sinh, sinh viên"],["先生","せんせい","giáo viên"],["日本","にほん","Nhật Bản"],["水","みず","nước"],["本","ほん","sách"],["友達","ともだち","bạn bè"]],
 N5:[["食べる","たべる","ăn"],["飲む","のむ","uống"],["学校","がっこう","trường học"],["毎日","まいにち","mỗi ngày"],["時間","じかん","thời gian"],["会社","かいしゃ","công ty"]],
 N4:[["経験","けいけん","kinh nghiệm"],["必要","ひつよう","cần thiết"],["準備","じゅんび","chuẩn bị"],["連絡","れんらく","liên lạc"],["説明","せつめい","giải thích"],["約束","やくそく","lời hứa, cuộc hẹn"]],
 N3:[["環境","かんきょう","môi trường"],["影響","えいきょう","ảnh hưởng"],["確認","かくにん","xác nhận"],["結果","けっか","kết quả"],["予定","よてい","dự định, lịch trình"],["原因","げんいん","nguyên nhân"]],
 N2:[["傾向","けいこう","xu hướng"],["維持","いじ","duy trì"],["適切","てきせつ","thích hợp"],["対象","たいしょう","đối tượng"],["判断","はんだん","phán đoán"],["貢献","こうけん","đóng góp"]],
 N1:[["促進","そくしん","thúc đẩy"],["懸念","けねん","lo ngại"],["顕著","けんちょ","rõ rệt"],["趣旨","しゅし","chủ旨, ý chính"],["打開","だかい","phá vỡ bế tắc"],["遂行","すいこう","thực hiện, hoàn thành"]]
};
const grammar={
 START:[["A は B です","A là B.","私は学生です。— Tôi là sinh viên."],["これ／それ／あれ","Cái này / cái đó / cái kia.","これは本です。— Đây là quyển sách."],["N の N","N sở hữu hoặc bổ nghĩa cho N.","私の本です。— Sách của tôi."]],
 N5:[["～ています","Đang làm một hành động hoặc trạng thái tiếp diễn.","今、日本語を勉強しています。— Bây giờ tôi đang học tiếng Nhật."],["～たいです","Muốn làm gì.","日本へ行きたいです。— Tôi muốn đi Nhật."],["～てもいいです","Được phép làm gì.","ここに座ってもいいですか。— Tôi ngồi đây được không?"]],
 N4:[["～ながら","Vừa làm A vừa làm B.","音楽を聞きながら勉強します。— Vừa nghe nhạc vừa học."],["～そうです","Trông có vẻ… (dựa trên quan sát).","雨が降りそうです。— Có vẻ sắp mưa."],["～てしまう","Lỡ/hoàn tất hẳn hành động.","財布を忘れてしまいました。— Tôi lỡ quên ví."]],
 N3:[["～わけではない","Không hẳn là…","嫌いなわけではありません。— Không hẳn là tôi ghét."],["～おかげで","Nhờ có… (kết quả tốt).","先生のおかげで合格しました。— Nhờ thầy cô mà tôi đã đỗ."],["～一方で","Mặt khác, đồng thời có khía cạnh đối lập.","便利な一方で、危険もあります。— Một mặt tiện lợi, mặt khác cũng có nguy hiểm."]],
 N2:[["～に伴って","Cùng với sự thay đổi của…","人口の増加に伴って、問題も増えた。— Cùng với dân số tăng, vấn đề cũng tăng."],["～ものの","Mặc dù… nhưng…","説明を聞いたものの、まだ分からない。— Dù đã nghe giải thích nhưng vẫn chưa hiểu."],["～に違いない","Chắc chắn là… (suy luận mạnh).","彼は知っているに違いない。— Anh ấy chắc chắn biết."]],
 N1:[["～を禁じ得ない","Không thể kìm nén (cảm xúc).","その話を聞いて、怒りを禁じ得なかった。— Nghe chuyện đó, tôi không thể kìm nén cơn giận."],["～に即して","Dựa theo, phù hợp với…","現状に即して判断する。— Đánh giá dựa theo tình hình thực tế."],["～を余儀なくされる","Bị buộc phải…","計画の変更を余儀なくされた。— Bị buộc phải thay đổi kế hoạch."]]
};
const listening=[
 ["N5","駅での案内","電車は三番線から出発します。","Tàu điện sẽ khởi hành từ sân ga số 3.","Tàu khởi hành ở sân ga nào?",["1","2","3","4"],2],
 ["N5","日常会話","今日は暑いですね。水を飲みましょう。","Hôm nay nóng nhỉ. Chúng ta uống nước nhé.","Hôm nay thời tiết thế nào?",["Lạnh","Nóng","Mưa","Tuyết"],1],
 ["N4","約束","明日の午後三時に駅の前で会いましょう。","Ngày mai chúng ta gặp trước nhà ga lúc 3 giờ chiều nhé.","Hai người gặp lúc mấy giờ?",["2 giờ","3 giờ","4 giờ","5 giờ"],1],
 ["N4","買い物","このシャツは少し高いですが、デザインがいいです。","Chiếc áo này hơi đắt nhưng thiết kế đẹp.","Chiếc áo được nhận xét thế nào?",["Rẻ","Xấu","Hơi đắt và thiết kế đẹp","Không vừa"],2],
 ["N3","会社の連絡","会議の資料は、今日の五時までにメールで送ってください。","Hãy gửi tài liệu cuộc họp qua email trước 5 giờ hôm nay.","Cần gửi tài liệu bằng cách nào?",["Bưu điện","Email","Trực tiếp","Tin nhắn"],1],
 ["N3","予定の変更","台風のため、明日の出張は来週に延期になりました。","Do bão, chuyến công tác ngày mai đã được hoãn sang tuần sau.","Vì sao chuyến công tác bị hoãn?",["Thiếu tài liệu","Bị bão","Người nghỉ phép","Tàu muộn"],1],
 ["N2","業務改善","作業の効率を上げるには、手順を見直すだけでなく、情報共有の方法も改善する必要があります。","Để nâng cao hiệu suất công việc, không chỉ cần xem lại quy trình mà còn phải cải thiện cách chia sẻ thông tin.","Ngoài xem lại quy trình, cần làm gì?",["Tăng giờ làm","Cải thiện chia sẻ thông tin","Giảm nhân sự","Đổi văn phòng"],1],
 ["N2","会議の判断","現時点では結論を出すのは難しいため、追加のデータを確認したうえで、改めて検討することになりました。","Ở thời điểm hiện tại khó đưa ra kết luận, vì vậy sau khi kiểm tra dữ liệu bổ sung sẽ xem xét lại.","Quyết định hiện tại là gì?",["Kết luận ngay","Hủy dự án","Kiểm tra dữ liệu rồi xem xét lại","Chuyển giao việc"],2],
 ["N1","社会的な課題","制度の reform は、理念を掲げるだけでは十分ではない。現場の実情を踏まえ、継続的に検証しながら運用を調整していく姿勢が不可欠だ。","Cải cách một hệ thống không chỉ dừng ở việc nêu khẩu hiệu; cần dựa vào thực tế hiện trường, liên tục kiểm chứng và điều chỉnh vận hành.","Điều gì được nhấn mạnh là không thể thiếu?",["Chỉ đặt mục tiêu","Điều chỉnh dựa trên kiểm chứng thực tế liên tục","Giảm ngân sách","Tránh thay đổi"],1],
 ["N1","論説","一見すると合理的に思える判断であっても、前提条件が変化すれば、その妥当性は根本から問い直されなければならない。","Dù một phán đoán thoạt nhìn có vẻ hợp lý, nếu điều kiện tiền đề thay đổi thì tính xác đáng của nó phải được xem xét lại từ căn bản.","Khi điều kiện tiền đề thay đổi thì cần làm gì?",["Giữ nguyên phán đoán","Bỏ qua thay đổi","Xem xét lại tính xác đáng","Trì hoãn vô thời hạn"],2]
];
const quizBank=[
 {level:"START",q:"「あ」の cách đọc là gì?",opts:["a","i","u","e"],a:0,why:"あ là âm a trong bảng Hiragana."},
 {level:"N5",q:"私は毎朝コーヒー（　）飲みます。",opts:["が","を","に","で"],a:1,why:"を đánh dấu tân ngữ trực tiếp của động từ 飲みます."},
 {level:"N4",q:"雨が降っている（　）、出かけました。",opts:["のに","ので","ために","ように"],a:0,why:"のに diễn tả sự trái ngược: dù trời đang mưa nhưng vẫn ra ngoài."},
 {level:"N3",q:"彼が来る（　）ありません。",opts:["わけでは","はずが","ことには","ものなら"],a:1,why:"はずがありません diễn tả chắc chắn không thể/không có lý do để xảy ra."},
 {level:"N2",q:"十分に検討した（　）、今回は見送ることにした。",opts:["あげく","末に","最中に","次第"],a:1,why:"末に diễn tả kết quả sau một quá trình cân nhắc."},
 {level:"N1",q:"彼の説明は事実（　）おり、説得力があった。",opts:["に即して","を問わず","に先立って","と相まって"],a:0,why:"に即して nghĩa là dựa sát theo, phù hợp với thực tế."}
];
function renderStats(){
 const p=state.progress;$("#xpPill").textContent=`⭐ ${p.xp||0} XP`;$("#streakPill").textContent=`🔥 ${p.streak||0} ngày`;
 $("#homeXP").textContent=p.xp||0;$("#homeLessons").textContent=(p.completed||[]).length;$("#homeWords").textContent=(p.known||[]).length;$("#homeLevel").textContent=p.level||"Bắt đầu";
}
function renderHome(){
 const host=$("#main");host.innerHTML=`
 <section class="hero"><div><span class="eyebrow">JAPANESE LEARNING JOURNEY</span><h1>Từ chữ cái đầu tiên<br>đến JLPT N1 🇯🇵</h1><p>Học tiếng Nhật theo lộ trình rõ ràng, giải thích bằng tiếng Việt, luyện tập mỗi ngày và lưu tiến độ riêng cho từng tài khoản.</p><button class="primary-btn" data-view="path">Bắt đầu học →</button></div><div class="hero-art">あ<br><span>日</span></div></section>
 <section class="stats-grid"><article class="stat-card"><span>⭐</span><b id="homeXP">${state.progress.xp}</b><small>XP tích lũy</small></article><article class="stat-card"><span>📚</span><b>${state.progress.completed.length}</b><small>Bài đã hoàn thành</small></article><article class="stat-card"><span>🧠</span><b>${state.progress.known.length}</b><small>Từ đã nhớ</small></article><article class="stat-card"><span>🎯</span><b>${state.progress.level||"Bắt đầu"}</b><small>Cấp độ hiện tại</small></article></section>
 <div class="section-head"><div><span class="eyebrow">YOUR LEARNING PATH</span><h2>Lộ trình từ số 0 đến N1</h2></div></div><section class="level-grid">${levels.map(l=>`<article class="level-card"><span class="level-tag">${l.id==="START"?"BEGINNER":l.id}</span><h3>${l.name}</h3><b>${l.sub}</b><p>${l.desc}</p><div class="progress-track"><div class="progress-fill" style="width:${Math.min(100,state.progress.completed.filter(x=>x.startsWith(l.id)).length*10)}%"></div></div><button class="secondary-btn" data-level="${l.id}">Mở lộ trình →</button></article>`).join("")}</section>
 <div class="section-head"><div><span class="eyebrow">DAILY PRACTICE</span><h2>Luyện tập nhanh</h2></div></div><section class="quick-grid"><button class="quick-card" data-view="kana"><span>あ</span><b>Bảng chữ cái</b><small>Hiragana & Katakana</small></button><button class="quick-card" data-view="vocab"><span>語</span><b>Từ vựng & Kanji</b><small>Học theo cấp độ</small></button><button class="quick-card" data-view="listening"><span>🎧</span><b>Luyện nghe</b><small>Nghe và hiểu</small></button><button class="quick-card" data-view="quiz"><span>✍️</span><b>Kiểm tra</b><small>Ôn tập JLPT</small></button></section>`;
 bindViewButtons();renderStats();
}
function page(title,lead,body){$("#main").innerHTML=`<span class="eyebrow">NIHONGO PRO LEARNING</span><h1 class="page-title">${title}</h1><p class="page-lead">${lead}</p>${body}`}
function renderKana(){
 page("Bảng chữ cái tiếng Nhật","Bắt đầu bằng Hiragana và Katakana. Chạm vào từng chữ để nghe cách phát âm.",`
 <div class="toolbar"><button class="chip ${state.kanaType==="hiragana"?"active":""}" data-kana="hiragana">Hiragana ひらがな</button><button class="chip ${state.kanaType==="katakana"?"active":""}" data-kana="katakana">Katakana カタカナ</button></div>
 <div class="content-card"><h3>${state.kanaType==="hiragana"?"Hiragana":"Katakana"}</h3><p class="muted">Chạm vào một chữ để nghe phát âm bằng giọng đọc tiếng Nhật trên thiết bị.</p><div class="kana-grid">${kana[state.kanaType].map(([c,r])=>`<button class="kana-cell" data-speak="${c}"><b>${c}</b><small>${r}</small></button>`).join("")}</div></div>
 <div class="content-card" style="margin-top:16px"><h3>Mẹo học</h3><p class="muted">Học 5 chữ mỗi lần, đọc thành tiếng, viết lại nhiều lần và ôn tập sau một ngày. Hiragana thường dùng cho từ thuần Nhật và phần ngữ pháp; Katakana thường dùng cho từ mượn và tên nước ngoài.</p></div>`);
 document.querySelectorAll("[data-kana]").forEach(b=>b.onclick=()=>{state.kanaType=b.dataset.kana;renderKana()});
 document.querySelectorAll("[data-speak]").forEach(b=>b.onclick=()=>speak(b.dataset.speak));
}
function renderPath(){
 page("Lộ trình học","Đi theo thứ tự từ nền tảng đến nâng cao. Mỗi cấp độ gồm 10 chủ đề học mẫu để bạn bắt đầu.",`<div class="lesson-list">${levels.map((l,i)=>`<div class="content-card"><span class="eyebrow">${l.id}</span><h2>${l.name}</h2><p class="muted">${l.desc}</p><div class="lesson-list">${l.units.map((u,j)=>`<div class="lesson-row"><div class="lesson-num">${j+1}</div><div><b>${u}</b><small>${l.sub} · Bài học ${j+1}</small></div><button class="secondary-btn" data-lesson="${l.id}|${j}">Học bài</button></div>`).join("")}</div></div>`).join("")}</div>`);
 document.querySelectorAll("[data-lesson]").forEach(b=>b.onclick=()=>openLesson(...b.dataset.lesson.split("|")));
}
function openLesson(level,index){
 const l=levels.find(x=>x.id===level),unit=l.units[+index],g=(grammar[level]||grammar.N5)[+index%(grammar[level]||grammar.N5).length];
 page(unit,`${l.name} · Bài ${+index+1}/10 · Giải thích bằng tiếng Việt`,`
 <article class="study-card"><span class="eyebrow">LESSON ${String(+index+1).padStart(2,"0")}</span><h2>${unit}</h2><h3>Ngữ pháp trọng tâm</h3><div class="jp">${g[0]}</div><p><b>${g[1]}</b></p><div class="answer">${g[2]}</div><h3>Hãy luyện tập</h3><p class="muted">Đọc cấu trúc, đọc ví dụ thành tiếng và tự đặt một câu tương tự. Sau đó đánh dấu hoàn thành để lưu tiến độ.</p><button class="primary-btn" id="completeLesson">Hoàn thành bài học +20 XP</button></article>`);
 $("#completeLesson").onclick=()=>{const id=level+"-"+index;if(!state.progress.completed.includes(id)){state.progress.completed.push(id);state.progress.xp+=20;state.progress.level=level==="START"?"Nhập môn":level;saveProgress();toast("Đã lưu bài học! +20 XP")}else toast("Bài này đã hoàn thành rồi.");};
}
function renderVocab(){
 const lv=state.selectedLevel,words=vocab[lv]||vocab.N5;
 page("Từ vựng & Kanji","Học từ theo cấp độ. Chạm biểu tượng loa để nghe, đánh dấu từ đã nhớ để lưu vào hồ sơ.",`
 <div class="toolbar">${levels.map(l=>`<button class="chip ${lv===l.id?"active":""}" data-vlevel="${l.id}">${l.id}</button>`).join("")}</div>
 <div class="lesson-list">${words.map((w,i)=>`<div class="lesson-row"><div class="lesson-num">${i+1}</div><div><b class="jp" style="font-size:23px">${w[0]}</b><small>${w[1]} · ${w[2]}</small></div><button class="icon-btn" data-speak="${w[1]}">🔊</button><button class="secondary-btn" data-known="${lv}-${i}">${state.progress.known.includes(lv+"-"+i)?"Đã nhớ":"Đánh dấu nhớ"}</button></div>`).join("")}</div>`);
 document.querySelectorAll("[data-vlevel]").forEach(b=>b.onclick=()=>{state.selectedLevel=b.dataset.vlevel;renderVocab()});
 document.querySelectorAll("[data-speak]").forEach(b=>b.onclick=()=>speak(b.dataset.speak));
 document.querySelectorAll("[data-known]").forEach(b=>b.onclick=()=>{const id=b.dataset.known;if(!state.progress.known.includes(id)){state.progress.known.push(id);state.progress.xp+=2;saveProgress();toast("+2 XP · Đã lưu từ vựng")}renderVocab()});
}
function renderGrammar(){
 const lv=state.selectedLevel,items=grammar[lv]||grammar.N5;
 page("Ngữ pháp","Mỗi cấu trúc gồm ý nghĩa, ví dụ tiếng Nhật và bản dịch tiếng Việt.",`<div class="toolbar">${levels.map(l=>`<button class="chip ${lv===l.id?"active":""}" data-glevel="${l.id}">${l.id}</button>`).join("")}</div><div class="lesson-list">${items.map((g,i)=>`<article class="content-card"><span class="eyebrow">${lv} · GRAMMAR ${i+1}</span><h2 class="jp">${g[0]}</h2><b>${g[1]}</b><div class="answer">${g[2]}</div></article>`).join("")}</div>`);
 document.querySelectorAll("[data-glevel]").forEach(b=>b.onclick=()=>{state.selectedLevel=b.dataset.glevel;renderGrammar()});
}
function renderListening(){
 const lv=state.selectedLevel,items=listening.filter(x=>x[0]===lv),item=items[state.currentListening%Math.max(1,items.length)]||listening[0];
 page("Luyện nghe tiếng Nhật","Chọn cấp độ, nghe câu thoại, nghe chậm và trả lời câu hỏi. Thiết bị cần hỗ trợ giọng đọc tiếng Nhật.",`
 <div class="toolbar">${["N5","N4","N3","N2","N1"].map(x=>`<button class="chip ${lv===x?"active":""}" data-llevel="${x}">${x}</button>`).join("")}</div>
 <article class="listening-panel"><span class="eyebrow">LISTENING · ${item[0]}</span><h2>${item[1]}</h2><div class="jp-large">${item[2]}</div><div class="inline-actions"><button class="primary-btn" id="playListen">▶ Phát tiếng Nhật</button><button class="secondary-btn" id="slowListen">🐢 Phát chậm</button><button class="secondary-btn" id="showListenTranslation">Hiện bản dịch</button></div><p id="listenTranslation" hidden>${item[3]}</p></article>
 <article class="study-card" style="margin-top:16px"><span class="eyebrow">LISTENING CHECK</span><h3>${item[4]}</h3>${item[5].map((o,i)=>`<button class="quiz-option" data-listen-answer="${i}">${String.fromCharCode(65+i)}. ${o}</button>`).join("")}<p id="listenFeedback" class="muted"></p><button class="primary-btn" id="nextListen">Câu nghe tiếp theo →</button></article>
 <p class="tiny muted">Bộ nghe hiện là bài mẫu minh họa, dùng Speech Synthesis của trình duyệt để đọc câu tiếng Nhật; không phải file thu âm người bản xứ.</p>`);
 document.querySelectorAll("[data-llevel]").forEach(b=>b.onclick=()=>{state.selectedLevel=b.dataset.llevel;state.currentListening=0;renderListening()});
 $("#playListen").onclick=()=>speak(item[2],1);$("#slowListen").onclick=()=>speak(item[2],.72);
 $("#showListenTranslation").onclick=()=>{$("#listenTranslation").hidden=!$("#listenTranslation").hidden;$("#showListenTranslation").textContent=$("#listenTranslation").hidden?"Hiện bản dịch":"Ẩn bản dịch"};
 document.querySelectorAll("[data-listen-answer]").forEach(b=>b.onclick=()=>{const ok=+b.dataset.listenAnswer===item[6];$("#listenFeedback").textContent=ok?"Chính xác! +5 XP":"Chưa đúng. Hãy nghe lại và thử lần nữa.";if(ok){state.progress.xp+=5;saveProgress()}});
 $("#nextListen").onclick=()=>{state.currentListening++;renderListening()};
}
function renderQuiz(){
 const q=quizBank[state.currentQuiz%quizBank.length];
 page("Kiểm tra kiến thức JLPT","Bài kiểm tra ngắn theo cấp độ. Chọn đáp án để xem giải thích.",`
 <div class="toolbar">${quizBank.map((x,i)=>`<button class="chip ${i===state.currentQuiz?"active":""}" data-q="${i}">${x.level}</button>`).join("")}</div>
 <article class="study-card"><span class="eyebrow">QUESTION ${state.currentQuiz+1} / ${quizBank.length} · ${q.level}</span><h2>${q.q}</h2>${q.opts.map((o,i)=>`<button class="quiz-option" data-answer="${i}">${String.fromCharCode(65+i)}. ${o}</button>`).join("")}<p id="quizFeedback" class="muted"></p><button class="primary-btn" id="nextQuiz">Câu tiếp theo →</button></article>`);
 document.querySelectorAll("[data-q]").forEach(b=>b.onclick=()=>{state.currentQuiz=+b.dataset.q;renderQuiz()});
 document.querySelectorAll("[data-answer]").forEach(b=>b.onclick=()=>{if(state.quizAnswer===state.currentQuiz)return;const ok=+b.dataset.answer===q.a;document.querySelectorAll("[data-answer]").forEach((x,i)=>{if(i===q.a)x.classList.add("correct");else if(i===+b.dataset.answer)x.classList.add("wrong")});$("#quizFeedback").textContent=(ok?"Chính xác! ":"Chưa đúng. ")+q.why;if(ok){state.progress.xp+=10;saveProgress()}state.quizAnswer=state.currentQuiz});
 $("#nextQuiz").onclick=()=>{state.currentQuiz=(state.currentQuiz+1)%quizBank.length;state.quizAnswer=null;renderQuiz()};
}
function renderProgress(){
 page("Tiến độ cá nhân","Dữ liệu khách được lưu trên trình duyệt này. Khi đăng nhập Supabase, dữ liệu được đồng bộ theo tài khoản.",`
 <div class="stats-grid"><article class="stat-card"><span>⭐</span><b>${state.progress.xp}</b><small>XP</small></article><article class="stat-card"><span>📚</span><b>${state.progress.completed.length}</b><small>Bài hoàn thành</small></article><article class="stat-card"><span>🧠</span><b>${state.progress.known.length}</b><small>Từ đã nhớ</small></article><article class="stat-card"><span>🔥</span><b>${state.progress.streak}</b><small>Ngày liên tiếp</small></article></div>
 <article class="content-card"><h2>Hồ sơ học tập</h2><p><b>Tên:</b> ${escapeHTML(state.profileName)}</p><p><b>Tài khoản:</b> ${state.user?escapeHTML(state.user.email):"Chưa đăng nhập – chế độ khách"}</p><p><b>Đồng bộ:</b> ${state.user&&sb?"Đã đăng nhập; tiến độ có thể đồng bộ":"Chưa bật đồng bộ đám mây"}</p><button class="primary-btn" data-view="account">Quản lý tài khoản</button></article>`);
}
function renderAccount(){
 page("Tài khoản & đồng bộ","Tạo tài khoản riêng cho bạn và em bạn. Mỗi email có tiến độ riêng, không dùng chung dữ liệu.",`
 <article class="content-card"><div class="modal-icon">👥</div><h2>${state.user?"Xin chào, "+escapeHTML(state.profileName):"Học cùng gia đình"}</h2><p class="muted">${state.user?escapeHTML(state.user.email):"Bạn đang học ở chế độ khách. Đăng ký tài khoản để lưu tiến độ trên đám mây và đăng nhập trên thiết bị khác."}</p>
 ${!hasSupabase?`<div class="answer"><b>Chưa cấu hình đăng nhập đám mây.</b><br>Để bật tài khoản thật, tạo một dự án Supabase miễn phí, chạy file supabase-schema.sql, rồi điền Project URL và anon key vào đầu app.js. Hướng dẫn chi tiết có trong README.</div>`:""}
 <div class="inline-actions">${state.user?'<button class="secondary-btn" id="logoutBtn">Đăng xuất</button>':'<button class="primary-btn" id="openAuth">Đăng nhập / Tạo tài khoản</button>'}</div></article>
 <article class="content-card" style="margin-top:15px"><h3>Chế độ khách</h3><p class="muted">Nếu chưa cấu hình Supabase, dữ liệu chỉ lưu trên trình duyệt và thiết bị hiện tại. Không dùng chế độ khách để chia sẻ iPhone nếu muốn tách hồ sơ.</p><button class="secondary-btn" id="resetLocal">Xóa dữ liệu học trên thiết bị này</button></article>`);
 $("#openAuth")?.addEventListener("click",()=>openAuth());$("#logoutBtn")?.addEventListener("click",logout);
 $("#resetLocal")?.addEventListener("click",()=>{if(confirm("Xóa toàn bộ tiến độ lưu trên thiết bị này?")){localStorage.removeItem("nihongoProProgress");state.progress=loadLocal();renderAccount();renderStats();toast("Đã xóa dữ liệu trên thiết bị")}});
}
function escapeHTML(s){return String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function speak(text,rate=1){if(!("speechSynthesis"in window)){toast("Trình duyệt không hỗ trợ đọc văn bản.");return}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang="ja-JP";u.rate=rate;speechSynthesis.speak(u)}
function saveProgress(){saveLocal();if(sb&&state.user){sb.from("learning_progress").upsert({user_id:state.user.id,progress:state.progress,updated_at:new Date().toISOString()},{onConflict:"user_id"}).then(({error})=>{if(error)toast("Đã lưu trên máy; đồng bộ gặp lỗi.")})}}
async function loadCloudProgress(){if(!sb||!state.user)return;const {data,error}=await sb.from("learning_progress").select("progress").eq("user_id",state.user.id).maybeSingle();if(error){toast("Không tải được dữ liệu đám mây.");return}if(data?.progress){state.progress={...freshProgress(),...data.progress};saveLocal()}else{state.progress=freshProgress();saveLocal();await sb.from("learning_progress").upsert({user_id:state.user.id,progress:state.progress})}}
function openAuth(){if(!hasSupabase){toast("Cần cấu hình Supabase trước khi đăng nhập.");renderAccount();return}$("#authDialog").showModal()}
function setAuthMode(mode){state.authMode=mode;$("#authTitle").textContent=mode==="signup"?"Tạo tài khoản mới":"Đăng nhập Nihongo Pro";$("#authSubmit").textContent=mode==="signup"?"Đăng ký":"Đăng nhập";$("#toggleAuth").textContent=mode==="signup"?"Đã có tài khoản? Đăng nhập":"Tạo tài khoản mới";$("#nameField").hidden=mode!=="signup";$("#authMessage").textContent=mode==="signup"?"Mỗi người nên dùng email riêng để lưu tiến độ riêng.":"Đăng nhập để tiếp tục lộ trình học của bạn."}
async function submitAuth(){const email=$("#authEmail").value.trim(),password=$("#authPassword").value,name=$("#authName").value.trim();if(!email||!password){toast("Nhập email và mật khẩu.");return}$("#authSubmit").disabled=true;try{let result;if(state.authMode==="signup")result=await sb.auth.signUp({email,password,options:{data:{display_name:name||email.split("@")[0]}}});else result=await sb.auth.signInWithPassword({email,password});if(result.error)throw result.error;if(state.authMode==="signup"&&!result.data.session){toast("Đã gửi email xác nhận. Hãy kiểm tra hộp thư.");return}state.user=result.data.user;state.profileName=state.user.user_metadata?.display_name||email.split("@")[0];await loadCloudProgress();$("#authDialog").close();updateIdentity();renderAccount();toast("Đăng nhập thành công!")}catch(e){toast(e.message||"Không thể đăng nhập.")}finally{$("#authSubmit").disabled=false}}
async function logout(){if(sb)await sb.auth.signOut();state.user=null;state.profileName="Khách học";state.progress=freshProgress();saveLocal();updateIdentity();renderAccount();toast("Đã đăng xuất. Hồ sơ khách đã được tách riêng.")}
function updateIdentity(){$("#sideName").textContent=state.profileName;$("#sideStatus").textContent=state.user?"Đã đăng nhập · Đồng bộ":"Đang học trên thiết bị này";$("#sideAvatar").textContent=(state.profileName||"学").slice(0,1).toUpperCase();$("#accountBtn").textContent=state.user?"✓":"👤";renderStats()}
function bindViewButtons(){document.querySelectorAll("[data-view]").forEach(b=>b.onclick=()=>navigate(b.dataset.view));document.querySelectorAll("[data-level]").forEach(b=>b.onclick=()=>{state.selectedLevel=b.dataset.level;navigate("path")})}
function navigate(view){state.view=view;$("#sidebar").classList.remove("open");document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.view===view));({home:renderHome,kana:renderKana,path:renderPath,vocab:renderVocab,grammar:renderGrammar,listening:renderListening,quiz:renderQuiz,progress:renderProgress,account:renderAccount}[view]||renderHome)();window.scrollTo(0,0)}
document.addEventListener("click",e=>{const b=e.target.closest("[data-view]");if(b&&b.closest("#main")){e.preventDefault();navigate(b.dataset.view)}});
$("#menuBtn").onclick=()=>$("#sidebar").classList.toggle("open");$("#accountBtn").onclick=()=>navigate("account");
$("#authSubmit").onclick=submitAuth;$("#toggleAuth").onclick=()=>setAuthMode(state.authMode==="login"?"signup":"login");$("#forgotBtn").onclick=async()=>{if(!hasSupabase){toast("Chưa cấu hình Supabase.");return}const email=$("#authEmail").value.trim();if(!email){toast("Nhập email trước.");return}const {error}=await sb.auth.resetPasswordForEmail(email);toast(error?error.message:"Đã gửi email đặt lại mật khẩu.")};
setAuthMode("login");updateIdentity();renderHome();
if(sb){sb.auth.getSession().then(async({data})=>{if(data.session){state.user=data.session.user;state.profileName=state.user.user_metadata?.display_name||state.user.email.split("@")[0];await loadCloudProgress();updateIdentity();if(state.view==="home")renderHome()}});sb.auth.onAuthStateChange((_event,session)=>{if(!session){state.user=null;state.profileName="Khách học";updateIdentity()}})}
