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
if(window.NP_CONTENT){ Object.keys(window.NP_CONTENT.vocab).forEach(k=>vocab[k]=window.NP_CONTENT.vocab[k]); Object.keys(window.NP_CONTENT.grammar).forEach(k=>grammar[k]=window.NP_CONTENT.grammar[k]); }
const courseThemes=(window.NP_COURSE&&window.NP_COURSE.themes)||{};
const kanjiWords=(window.NP_COURSE&&window.NP_COURSE.kanjiWords)||{};
const readingBank={
 START:[["自己紹介","私はベトナム人です。日本語を勉強しています。日本で生活しています。","Tôi là người Việt Nam. Tôi đang học tiếng Nhật và sống ở Nhật."],["一日の生活","朝起きて、ご飯を食べます。それから学校へ行きます。","Buổi sáng thức dậy, ăn cơm rồi đi học."]],
 N5:[["休日","日曜日は休みです。友達と公園へ行きます。写真を撮って、昼ご飯を食べます。","Chủ nhật nghỉ. Tôi đi công viên cùng bạn, chụp ảnh rồi ăn trưa."],["買い物","スーパーで野菜と牛乳を買いました。全部で千円でした。","Tôi mua rau và sữa ở siêu thị. Tổng cộng 1.000 yên."]],
 N4:[["新しい生活","引っ越してから、近くの店や駅を調べました。生活に必要なものを少しずつ準備しています。","Sau khi chuyển nhà, tôi tìm hiểu cửa hàng và ga gần đó. Tôi đang chuẩn bị từng chút những thứ cần cho cuộc sống."],["健康","最近忙しくて、あまり運動していません。健康のために、毎日少し歩くことにしました。","Gần đây bận nên ít vận động. Vì sức khỏe, tôi quyết định đi bộ một chút mỗi ngày."]],
 N3:[["地域活動","地域のイベントに参加すると、普段話す機会がない人とも交流できます。活動を通して、地域への理解も深まりました。","Tham gia sự kiện địa phương giúp giao lưu với những người ít có dịp trò chuyện, qua hoạt động hiểu hơn về cộng đồng."],["働き方","仕事の効率を上げるには、時間を管理するだけでなく、情報を共有することも大切です。","Để tăng hiệu suất công việc, ngoài quản lý thời gian còn cần chia sẻ thông tin."]],
 N2:[["業務改善","業務の手順を見直した結果、作業時間を削減できました。一方で、関係者への説明と情報共有を維持する必要があります。","Sau khi rà soát quy trình, thời gian làm việc giảm. Mặt khác, vẫn cần duy trì giải thích và chia sẻ thông tin với các bên."],["制度の変更","制度を導入する際には、対象者や条件を明確にしたうえで、現状に合った運用を検討するべきです。","Khi áp dụng hệ thống, cần làm rõ đối tượng và điều kiện rồi xem xét cách vận hành phù hợp hiện trạng."]],
 N1:[["判断の前提","一見妥当に見える結論であっても、前提となる情報が不十分であれば、判断の根拠そのものを問い直す必要がある。","Ngay cả kết luận thoạt nhìn hợp lý, nếu thông tin tiền đề không đầy đủ thì cần xem xét lại chính căn cứ phán đoán."],["持続的な改善","改革を継続的に遂行するには、理念と現場の実情を相互に照らし合わせ、検証に基づいて措置を講じることが不可欠だ。","Để thực thi cải cách bền vững, cần đối chiếu mục tiêu với thực tế và đưa ra biện pháp dựa trên kiểm chứng."]]
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
 const words=(vocab[level]||vocab.N5).slice((+index*4)%Math.max(1,(vocab[level]||vocab.N5).length),((+index*4)%Math.max(1,(vocab[level]||vocab.N5).length))+8);
 const reading=(readingBank[level]||readingBank.N5)[+index%2];
 page(unit,`${l.name} · Unit ${+index+1}/10 · bài học tích hợp`,`
 <article class="study-card"><span class="eyebrow">UNIT ${String(+index+1).padStart(2,"0")} · ${level}</span><h2>${unit}</h2>
 <h3>1. Mục tiêu bài học</h3><ul><li>Nắm từ vựng theo chủ đề.</li><li>Hiểu và vận dụng cấu trúc trọng tâm.</li><li>Đọc đoạn văn và tự kiểm tra.</li></ul>
 <h3>2. Từ vựng trọng tâm</h3><div class="lesson-list">${words.map(w=>`<div class="lesson-row"><div><b class="jp">${w[0]}</b><small>${w[1]} · ${w[2]}</small></div><button class="icon-btn" data-lesson-speak="${w[1]}">🔊</button></div>`).join("")}</div>
 <h3>3. Ngữ pháp trọng tâm</h3><div class="content-card"><h2 class="jp">${g[0]}</h2><b>${g[1]}</b><p class="answer">${g[2]}</p><button class="secondary-btn" id="grammarSpeak">🔊 Nghe ví dụ</button></div>
 <h3>4. Đọc hiểu</h3><div class="content-card"><b>${reading[0]}</b><p class="jp">${reading[1]}</p><p class="muted">${reading[2]}</p><button class="secondary-btn" id="readSpeak">🔊 Đọc đoạn văn</button></div>
 <h3>5. Bài tập tự luyện</h3><p class="muted">Tự viết 3 câu sử dụng cấu trúc trên và 5 từ mới. Chuyển sang kiểm tra cấp ${level} sau khi hoàn thành.</p>
 <div class="inline-actions"><button class="primary-btn" id="completeLesson">Hoàn thành bài +20 XP</button><button class="secondary-btn" data-view="quiz">Làm kiểm tra</button></div></article>`);
 document.querySelectorAll("[data-lesson-speak]").forEach(b=>b.onclick=()=>speak(b.dataset.lessonSpeak));
 $("#grammarSpeak").onclick=()=>speak(g[2].split("—")[0]);
 $("#readSpeak").onclick=()=>speak(reading[1]);
 $("#completeLesson").onclick=()=>{const id=level+"-"+index;if(!state.progress.completed.includes(id)){state.progress.completed.push(id);state.progress.xp+=20;state.progress.level=level;saveProgress();toast("Đã lưu bài học! +20 XP")}else toast("Bài này đã hoàn thành rồi.");};
}
function renderVocab(){
 const lv=state.selectedLevel,words=vocab[lv]||vocab.N5;
 page("Từ vựng & Kanji","Kho từ theo cấp. Furigana, nghĩa và phát âm; đánh dấu từ nhớ để ôn tập.",`
 <div class="toolbar">${levels.map(l=>`<button class="chip ${lv===l.id?"active":""}" data-vlevel="${l.id}">${l.id}</button>`).join("")}</div>
 <div class="lesson-list">${words.map((w,i)=>`<div class="lesson-row"><div class="lesson-num">${i+1}</div><div><b class="jp" style="font-size:23px">${w[0]}</b><small>${w[1]} · ${w[2]}</small></div><button class="icon-btn" data-speak="${w[1]}">🔊</button><button class="secondary-btn" data-known="${lv}-${i}">${state.progress.known.includes(lv+"-"+i)?"Đã nhớ":"Đánh dấu nhớ"}</button></div>`).join("")}</div><p class="tiny muted">Kho nội dung phiên bản nâng cấp: ${words.length} mục ở cấp ${lv}. Nội dung sẽ tiếp tục được mở rộng theo từng unit.</p>`);
 document.querySelectorAll("[data-vlevel]").forEach(b=>b.onclick=()=>{state.selectedLevel=b.dataset.vlevel;renderVocab()});
 document.querySelectorAll("[data-speak]").forEach(b=>b.onclick=()=>speak(b.dataset.speak));
 document.querySelectorAll("[data-known]").forEach(b=>b.onclick=()=>{const id=b.dataset.known;if(!state.progress.known.includes(id)){state.progress.known.push(id);state.progress.xp+=2;saveProgress();toast("+2 XP · Đã lưu từ vựng")}renderVocab()});
}
function renderKanji(){
 const lv=state.selectedLevel,items=kanjiWords[lv]||[];
 page("Kho Kanji & chữ Hán","Tập trung học chữ trong từ: cách đọc từ vựng, nghĩa, nghe và đánh dấu nhớ. Đây là kho học theo từ, không khẳng định mọi âm đọc riêng của từng chữ.",`
 <div class="toolbar">${levels.map(l=>`<button class="chip ${lv===l.id?"active":""}" data-klevel="${l.id}">${l.id}</button>`).join("")}</div>
 <div class="lesson-list">${items.map((w,i)=>`<article class="content-card"><span class="eyebrow">${lv} · KANJI / VOCAB ${i+1}</span><h2 class="jp">${w[0]}</h2><p>${w[2]}</p><small>${w[1]}</small><div class="inline-actions"><button class="secondary-btn" data-kanji-speak="${w[1]}">🔊 Nghe đọc</button><button class="secondary-btn" data-kanji-known="${lv}-${i}">${state.progress.known.includes("K-"+lv+"-"+i)?"Đã nhớ":"Đánh dấu nhớ"}</button></div></article>`).join("")}</div>`);
 document.querySelectorAll("[data-klevel]").forEach(b=>b.onclick=()=>{state.selectedLevel=b.dataset.klevel;renderKanji()});
 document.querySelectorAll("[data-kanji-speak]").forEach(b=>b.onclick=()=>speak(b.dataset.kanjiSpeak));
 document.querySelectorAll("[data-kanji-known]").forEach(b=>b.onclick=()=>{const id="K-"+b.dataset.kanjiKnown;if(!state.progress.known.includes(id)){state.progress.known.push(id);state.progress.xp+=2;saveProgress()}renderKanji()});
}
function renderReading(){
 const lv=state.selectedLevel,items=readingBank[lv]||readingBank.N5;
 page("Đọc hiểu","Bài đọc ngắn theo cấp độ. Đọc, nghe đọc lại và kiểm tra ý chính bằng cách tự diễn đạt.",`
 <div class="toolbar">${levels.filter(l=>l.id!=="START").map(l=>`<button class="chip ${lv===l.id?"active":""}" data-rlevel="${l.id}">${l.id}</button>`).join("")}</div>
 <div class="lesson-list">${items.map((r,i)=>`<article class="content-card"><span class="eyebrow">${lv} · READING ${i+1}</span><h2>${r[0]}</h2><p class="jp" style="line-height:2">${r[1]}</p><details><summary>Hiện dịch tiếng Việt</summary><p>${r[2]}</p></details><button class="secondary-btn" data-read-speak="${i}">🔊 Đọc văn bản</button></article>`).join("")}</div><p class="tiny muted">Bộ đọc hiểu hiện có các văn bản mẫu ngắn được biên soạn riêng. Kho bài đọc dài và câu hỏi dạng JLPT cần được tiếp tục bổ sung.</p>`);
 document.querySelectorAll("[data-rlevel]").forEach(b=>b.onclick=()=>{state.selectedLevel=b.dataset.rlevel;renderReading()});
 document.querySelectorAll("[data-read-speak]").forEach(b=>b.onclick=()=>speak(items[+b.dataset.readSpeak][1]));
}
function renderReview(){
 const due=state.progress.known||[],items=[];
 for(const lv of Object.keys(vocab)){(vocab[lv]||[]).forEach((w,i)=>{if(due.includes(lv+"-"+i)||due.includes("K-"+lv+"-"+i))items.push({w,lv,i})})}
 if(!items.length){page("Ôn tập","Đánh dấu từ vựng hoặc mục Kanji đã nhớ để đưa vào bộ ôn tập.",`<article class="content-card"><h2>Chưa có mục ôn tập</h2><p class="muted">Mở kho từ vựng hoặc Kanji và đánh dấu các mục cần ôn.</p><button class="primary-btn" data-view="vocab">Mở kho từ vựng</button></article>`);return}
 const item=items[state.currentQuiz%items.length];
 page("Ôn tập từ đã đánh dấu","Ôn nhanh những mục đã lưu.",`<article class="study-card"><span class="eyebrow">REVIEW ${state.currentQuiz+1}/${items.length} · ${item.lv}</span><h2 class="jp">${item.w[0]}</h2><small>${item.w[1]}</small><div class="inline-actions"><button class="primary-btn" id="showReviewMeaning">Hiện nghĩa</button><button class="secondary-btn" id="reviewSpeak">🔊 Nghe</button></div><p id="reviewMeaning" hidden>${item.w[2]}</p><div class="inline-actions"><button class="secondary-btn" id="reviewPrev">← Trước</button><button class="primary-btn" id="reviewNext">Tiếp →</button></div></article>`);
 $("#showReviewMeaning").onclick=()=>$("#reviewMeaning").hidden=!$("#reviewMeaning").hidden;
 $("#reviewSpeak").onclick=()=>speak(item.w[1]);
 $("#reviewPrev").onclick=()=>{state.currentQuiz=(state.currentQuiz-1+items.length)%items.length;renderReview()};
 $("#reviewNext").onclick=()=>{state.currentQuiz=(state.currentQuiz+1)%items.length;renderReview()};
}
function renderGrammar(){
 const lv=state.selectedLevel,items=grammar[lv]||grammar.N5;
 page("Ngữ pháp","Danh sách cấu trúc theo cấp; chạm loa để nghe ví dụ và học theo mẫu câu.",`<div class="toolbar">${levels.map(l=>`<button class="chip ${lv===l.id?"active":""}" data-glevel="${l.id}">${l.id}</button>`).join("")}</div><div class="lesson-list">${items.map((g,i)=>`<article class="content-card"><span class="eyebrow">${lv} · GRAMMAR ${i+1}</span><h2 class="jp">${g[0]}</h2><b>${g[1]}</b><div class="answer">${g[2]}</div><button class="secondary-btn" data-gram-speak="${i}">🔊 Nghe ví dụ</button></article>`).join("")}</div><p class="tiny muted">${items.length} cấu trúc ngữ pháp trong kho ${lv} hiện tại.</p>`);
 document.querySelectorAll("[data-glevel]").forEach(b=>b.onclick=()=>{state.selectedLevel=b.dataset.glevel;renderGrammar()});
 document.querySelectorAll("[data-gram-speak]").forEach(b=>b.onclick=()=>speak(items[+b.dataset.gramSpeak][2].split("—")[0]));
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
function buildContentQuiz(){
 const lv=state.selectedLevel, vv=vocab[lv]||vocab.N5, gg=grammar[lv]||grammar.N5;
 const out=[];
 vv.forEach((w,i)=>{if(i%2===0){const options=[w[2],vv[(i+3)%vv.length][2],vv[(i+7)%vv.length][2],"Không có nghĩa phù hợp"];const correct=0;const shift=(i%4);const opts=options.slice(shift).concat(options.slice(0,shift));out.push({level:lv,q:`「${w[0]}（${w[1]}）」の意味は？`,opts,a:(4-shift)%4,why:`${w[0]}（${w[1]}）は「${w[2]}」です。`})}});
 gg.forEach((g,i)=>{const options=[g[1],"Nguyên nhân hoặc điều kiện trái nghĩa","Thời điểm trong quá khứ","Cách chào hỏi"];const shift=i%4;out.push({level:lv,q:`次の表現の意味として適切なのは？「${g[0]}」`,opts:options.slice(shift).concat(options.slice(0,shift)),a:(4-shift)%4,why:g[1]})});
 return out;
}
function renderQuiz(){
 const bank=buildContentQuiz(),q=bank[state.currentQuiz%bank.length];
 page("Kiểm tra kiến thức JLPT","Kho câu hỏi được sinh từ từ vựng và ngữ pháp cấp đã chọn. Mỗi câu có giải thích.",`
 <div class="toolbar">${levels.map(x=>`<button class="chip ${state.selectedLevel===x.id?"active":""}" data-test-level="${x.id}">${x.id}</button>`).join("")}</div>
 <article class="study-card"><span class="eyebrow">CONTENT TEST · ${q.level} · ${state.currentQuiz+1}/${bank.length}</span><h2>${q.q}</h2>${q.opts.map((o,i)=>`<button class="quiz-option" data-answer="${i}">${String.fromCharCode(65+i)}. ${o}</button>`).join("")}<p id="quizFeedback" class="muted"></p><button class="primary-btn" id="nextQuiz">Câu tiếp theo →</button></article><p class="tiny muted">Bộ kiểm tra hiện được tạo từ dữ liệu học. Tiếp theo sẽ bổ sung các đề JLPT mô phỏng theo phần và thời gian thi.</p>`);
 document.querySelectorAll("[data-test-level]").forEach(b=>b.onclick=()=>{state.selectedLevel=b.dataset.testLevel;state.currentQuiz=0;state.quizAnswer=null;renderQuiz()});
 document.querySelectorAll("[data-answer]").forEach(b=>b.onclick=()=>{if(state.quizAnswer===state.currentQuiz)return;const ok=+b.dataset.answer===q.a;document.querySelectorAll("[data-answer]").forEach((x,i)=>{if(i===q.a)x.classList.add("correct");else if(i===+b.dataset.answer)x.classList.add("wrong")});$("#quizFeedback").textContent=(ok?"Chính xác! ":"Chưa đúng. ")+q.why;if(ok){state.progress.xp+=10;saveProgress()}state.quizAnswer=state.currentQuiz});
 $("#nextQuiz").onclick=()=>{state.currentQuiz=(state.currentQuiz+1)%bank.length;state.quizAnswer=null;renderQuiz()};
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
function bindViewButtons(){/* Navigation is handled by the single delegated listener below. */}

// JLPT-style mock exam engine v6: section structure, question navigator, review flags, and listening practice.
let examState=null, examTick=null;
const examBlueprint={
 N5:[{name:'文字・語彙',minutes:20,types:['vocab']},{name:'文法・読解',minutes:40,types:['grammar','reading']},{name:'聴解',minutes:30,types:['listening']}],
 N4:[{name:'文字・語彙',minutes:25,types:['vocab']},{name:'文法・読解',minutes:55,types:['grammar','reading']},{name:'聴解',minutes:35,types:['listening']}],
 N3:[{name:'文字・語彙',minutes:30,types:['vocab']},{name:'文法・読解',minutes:70,types:['grammar','reading']},{name:'聴解',minutes:40,types:['listening']}],
 N2:[{name:'言語知識・読解',minutes:105,types:['vocab','grammar','reading']},{name:'聴解',minutes:50,types:['listening']}],
 N1:[{name:'言語知識・読解',minutes:110,types:['vocab','grammar','reading']},{name:'聴解',minutes:55,types:['listening']}]
};
const examSets={N5:3,N4:3,N3:3,N2:3,N1:3};
function shuffleExam(a){return a.map(x=>({x,r:Math.random()})).sort((a,b)=>a.r-b.r).map(z=>z.x)}
function examQuestionBank(level,setNo=1){
 const baseV=(vocab[level]||vocab.N5).slice(),baseG=(grammar[level]||grammar.N5).slice();
 const extras={START:[['駅','えき','station'],['電話','でんわ','phone']],N5:[['料理','りょうり','cooking'],['旅行','りょこう','travel']],N4:[['故障','こしょう','breakdown'],['景色','けしき','scenery']],N3:[['努力','どりょく','effort'],['条件','じょうけん','condition']],N2:[['制度','せいど','system'],['責任','せきにん','responsibility']],N1:[['措置','そち','measure'],['妥当','だとう','reasonable']]}[level]||[];
 const vocabPool=[...baseV,...extras];
 const bank={vocab:[],grammar:[],reading:[],listening:[]};
 const distractors={START:['あした','きのう','いま','まいにち'],N5:['りょこう','りょうり','しゃしん','でんわ'],N4:['うんてん','けしき','こしょう','じゅんび'],N3:['かんきょう','けっか','げんいん','じょうけん'],N2:['制度','責任','状況','確認'],N1:['措置','妥当','懸念','促進']}[level]||[];
 // Build distinct original items by varying question format across each source entry.
 vocabPool.forEach((v,i)=>{let candidates=vocabPool.map(x=>x[1]).filter(x=>x!==v[1]);let opts=shuffleExam([v[1],...candidates.slice(0,3)]);bank.vocab.push({type:'vocab',kind:i%3===0?'漢字読み':i%3===1?'表記':'語彙',prompt:i%3===0?`次の言葉の読み方として最も適切なものを選びなさい。\n\n${v[0]}`:`文の（　）に入る語として最も適切なものを選びなさい。\n\n${v[2]}に関連する語「${v[0]}」を確認しましょう。`,choices:opts,answer:v[1],explanation:`${v[0]}（${v[1]}）：${v[2]}`});});
 const grammarTemplates={START:['私は毎朝、コーヒーを（　）。','学校へ（　）。','この本を（　）。'],N5:['昨日、友達と映画を（　）。','毎日、日本語を（　）。','駅まで歩いて（　）。'],N4:['雨が降っていたので、家に（　）。','忘れないように、メモを（　）。','準備ができたら、すぐに（　）。'],N3:['原因を確認してから、対応を（　）。','予定が変更になったので、関係者に（　）。','環境への影響を十分に（　）。'],N2:['状況を踏まえて、適切に（　）。','問題の解決に向けて、対策を（　）。','結果を分析し、判断を（　）。'],N1:['計画の趣旨を踏まえ、施策を（　）。','懸念を払拭するため、説明を（　）。','停滞した状況を打開する策を（　）。']}[level];
 const correct={START:['飲みます','行きます','読みます'],N5:['見ました','勉強します','行きます'],N4:['帰りました','書きました','進みます'],N3:['取る','知らせる','考える'],N2:['判断する','講じる','下す'],N1:['遂行する','行う','講じる']}[level];
 const wrong={START:['食べます','寝ます','来ます'],N5:['泳ぎました','買いました','休みました'],N4:['走りました','聞きました','開けました'],N3:['待つ','忘れる','止める'],N2:['延期する','中止する','放置する'],N1:['放棄する','回避する','撤回する']}[level];
 baseG.forEach((g,i)=>{bank.grammar.push({type:'grammar',kind:['文法','文の組み立て','文脈規定'][i%3],prompt:`文の（　）に入る最も適切なものを選びなさい。\n\n${grammarTemplates[i%3]}`,choices:shuffleExam([correct[i%3],...wrong]),answer:correct[i%3],explanation:`学習項目：${g[0]}。${g[2]}`});});
 const passages={START:['きょうは雨です。私は家で本を読みます。','私はどこで本を読みますか。','家',['学校','店','駅']],N5:['田中さんは毎朝七時に起きます。朝ご飯を食べて、八時に家を出ます。','田中さんは何時に家を出ますか。','八時',['七時','九時','十時']],N4:['来週の旅行のために、ホテルを予約しました。電車の切符も買いました。','旅行のために何をしましたか。','ホテルを予約し、切符を買った',['荷物を送った','友達に電話した','旅行を延期した']],N3:['最近、駅前に新しい図書館ができた。静かな場所で勉強できるので、学生だけでなく会社員もよく利用している。','図書館がよく利用される理由は何ですか。','静かに勉強できるから',['本を無料でもらえるから','駅から遠いから','夜遅くまで飲食できるから']],N2:['新しい制度を導入する際には、利点だけでなく、利用者への影響も十分に検討する必要がある。準備不足のまま実施すると、予想外の問題が生じる可能性がある。','筆者が制度導入前に必要だと述べていることは何か。','利点と利用者への影響を検討する',['すぐに実施して結果を見る','利用者を限定する','従来の制度を必ず廃止する']],N1:['効率を重視するあまり、過程における検討を省いてしまうと、短期的には成果が出ても、長期的には問題を招くことがある。重要なのは、目的と手段の妥当性を不断に見直す姿勢である。','筆者の主張に最も近いものはどれか。','手段の妥当性を継続的に検討すべきだ',['効率を最優先し検討を省くべきだ','短期的成果だけを評価すべきだ','目的は変更せず手段も固定すべきだ']]};
 const r=passages[level]||passages.N5;
 for(let i=0;i<5;i++)bank.reading.push({type:'reading',kind:i===0?'短文読解':'読解',passage:r[0]+(i?`\n${['なお、状況によって対応は異なる。','そのため、事前の準備が重要だ。','利用者の意見も参考にしたい。','今後も改善を続ける予定だ。'][i-1]}`:''),prompt:r[1],choices:shuffleExam([r[2],...r[3]]),answer:r[2],explanation:'本文の内容を照合してください。'});
 const listeningScripts={START:['男：これは何ですか。\n女：本です。','女：何を飲みますか。\n男：水をお願いします。'],N5:['男：明日は何時に会いますか。\n女：十時に駅で会いましょう。','女：今日は何曜日ですか。\n男：金曜日です。','男：何を買いましたか。\n女：ノートを買いました。'],N4:['女：買い物に行きますが、何か必要ですか。\n男：牛乳をお願いします。','男：電車は何時に出ますか。\n女：三時半です。','女：週末は何をしましたか。\n男：家で掃除をしました。'],N3:['男：会議の資料はもう印刷しましたか。\n女：まだです。午後までに印刷して、部長に渡します。','女：明日の予定を変更できますか。\n男：午前は無理ですが、午後なら大丈夫です。','男：駅までどうやって行きますか。\n女：バスで行くのが一番早いです。'],N2:['女：調査結果はいつ報告できますか。\n男：データの確認が終われば、明日の午前中には報告できます。','男：この案についてどう思いますか。\n女：利点はありますが、費用も検討する必要があります。','女：会議は延期になりました。\n男：では、資料を修正しておきます。'],N1:['男：現場の意見が十分に反映されていないという指摘があります。\n女：実施時期を含め、もう一度調整する余地があるか検討すべきでしょう。','女：方針の変更について説明が必要ですね。\n男：誤解を招かないよう、背景も含めて説明しましょう。','男：計画が停滞しています。\n女：原因を把握したうえで、根本的な対策を講じる必要があります。']}[level]||[];
 listeningScripts.forEach((script,i)=>{const prompts={START:['何ですか。','男の人は何を頼みましたか。'],N5:['二人は何時に会いますか。','今日は何曜日ですか。','女の人は何を買いましたか。'],N4:['男の人は何を買ってほしいですか。','電車は何時に出ますか。','男の人は週末何をしましたか。'],N3:['女の人は午後までに何をしますか。','男の人はいつ都合がいいですか。','駅まで何で行きますか。'],N2:['男の人はいつ報告できると考えていますか。','女の人が必要だと考えていることは何ですか。','男の人は次に何をしますか。'],N1:['女の人は何を検討すべきだと言っていますか。','男の人はどのように説明するつもりですか。','女の人は何が必要だと言っていますか。']}[level];
 const answers={START:['本','水'],N5:['十時','金曜日','ノート'],N4:['牛乳','三時半','家で掃除'],N3:['資料を印刷して部長に渡す','午後','バス'],N2:['明日の午前中','費用も検討する','資料を修正する'],N1:['実施時期などを再調整できるか','背景も含めて説明する','根本的な対策']}[level];
 const opts={START:[['水','かばん','電話'],['お茶','パン','本']],N5:[['九時','十一時','十二時'],['木曜日','土曜日','日曜日'],['写真','傘','切符']],N4:[['パン','卵','お茶'],['二時','四時','五時'],['友達と旅行','買い物','映画']],N3:[['会議を延期する','部長に電話する','資料を作り直す'],['午前','夜','来週'],['徒歩','電車','タクシー']],N2:[['今日の夕方','来週','確認が終わる前'],['すぐ実施する','利用者を限定する','従来制度を廃止する'],['会議を延期する','報告をやめる','調査を始める']],N1:[['方針を撤回する','現場の意見を無視する','変更を直ちに進める'],['要点だけ伝える','説明を省く','発表を中止する'],['計画を放棄する','変更を避ける','短期成果だけを見る']]}[level];
 listeningScripts.forEach((script,i)=>bank.listening.push({type:'listening',kind:['課題理解','ポイント理解','概要理解'][i%3],script,prompt:prompts[i%prompts.length],choices:shuffleExam([answers[i%answers.length],...opts[i%opts.length]]),answer:answers[i%answers.length],explanation:'会話の内容を聞き取って選びます.'}));});
 // Different sets deterministically rotate and shuffle the pool; sets do not share the same question order.
 // Expand the small prototype pools into distinct, rotating practice items per set; original material only.
 const offset=(setNo-1)*7;
 Object.keys(bank).forEach(k=>{
   let pool=bank[k];
   if(k==='reading' && pool.length){pool=pool.map((q,i)=>({...q,prompt:q.prompt+ (i?` (選択 ${i+1})`:''), passage:q.passage+ (i?`\n\n${['筆者は具体例を挙げて説明している。','この点について、今後も考える必要がある。','一方で、別の意見も見られる。','したがって、状況に応じた判断が重要だ。'][i%4]}`:'' )}));}
   if(k==='listening' && pool.length<5){const original=pool.slice();for(let n=0;n<5;n++){const q=original[n%original.length];pool.push({...q,prompt:q.prompt+` (問${n+1})`,script:q.script+ (n>=original.length?'\nもう一度、重要な点を確認してください。':'')});}}
   const rotated=pool.slice(offset%Math.max(pool.length,1)).concat(pool.slice(0,offset%Math.max(pool.length,1)));
   bank[k]=shuffleExam(rotated.map(q=>({...q,setNo})).slice(0,k==='vocab'||k==='grammar'?pool.length:Math.max(5,pool.length)));
 });return bank;
}

function renderExam(){
 const lev=state.selectedLevel||'N5',sets=examSets[lev]||3,blue=examBlueprint[lev];
 page('模擬試験 JLPT','形式別・時間制限・設問ナビゲーションを備えた独自練習セット。公式過去問ではありません。',`<article class="content-card"><h2>受験レベル</h2><div class="toolbar">${['N5','N4','N3','N2','N1'].map(x=>`<button class="chip ${lev===x?'active':''}" data-exlevel="${x}">${x}</button>`).join('')}</div><h3>${lev} · 模擬セット</h3><div class="toolbar">${Array.from({length:sets},(_,i)=>`<button class="chip" data-exset="${i+1}">セット ${i+1}</button>`).join('')}</div><h3>試験構成</h3>${blue.map(s=>`<div class="lesson-row"><b>${s.name}</b><span>${s.minutes}分</span></div>`).join('')}<p class="muted">問題バンクは現在試作規模です。Listeningではブラウザーの日本語音声読み上げを使います。標準化得点は算出しません。</p><button class="primary-btn" id="startExam" type="button">セット1を開始</button></article><article class="content-card"><h3>受験履歴</h3>${(state.progress.examHistory||[]).slice(-8).reverse().map(x=>`<div class="lesson-row"><b>${x.level} · Set ${x.set||1}</b><span>${x.score}/${x.total} · ${x.date}</span></div>`).join('')||'<p class="muted">まだ受験履歴がありません。</p>'}</article>`);
 document.querySelectorAll('[data-exlevel]').forEach(b=>b.onclick=()=>{state.selectedLevel=b.dataset.exlevel;renderExam()});
 let chosenSet=state.selectedExamSet||1;document.querySelectorAll('[data-exset]').forEach(b=>b.classList.toggle('active',+b.dataset.exset===chosenSet));document.querySelectorAll('[data-exset]').forEach(b=>b.onclick=()=>{chosenSet=+b.dataset.exset;state.selectedExamSet=chosenSet;document.querySelectorAll('[data-exset]').forEach(x=>x.classList.toggle('active',+x.dataset.exset===chosenSet));$('#startExam').textContent=`セット${chosenSet}を開始`});
 const start=$('#startExam');if(start)start.onclick=()=>startExam(lev,state.selectedExamSet||chosenSet);
}
function startExam(level,setNo=1){
 if(examTick){clearInterval(examTick);examTick=null}if(window.speechSynthesis)window.speechSynthesis.cancel();
 const bank=examQuestionBank(level,setNo),blue=examBlueprint[level],questions=[];
 blue.forEach((section,si)=>{section.types.forEach(type=>(bank[type]||[]).forEach(q=>questions.push({...q,section:si,id:questions.length})))});
 examState={level,set:setNo,blue,questions,answers:{},flags:{},idx:0,section:0,remaining:blue[0].minutes*60,started:Date.now()};
 renderExamQuestion();runExamClock();
}
function formatExamTime(n){return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`}
function runExamClock(){if(examTick)clearInterval(examTick);examTick=setInterval(()=>{if(!examState){clearInterval(examTick);examTick=null;return}examState.remaining--;if(examState.remaining<=0){finishExamSection(true);return}let el=$('#examTimer');if(el)el.textContent=formatExamTime(examState.remaining)},1000)}
function examSectionQuestions(){return examState.questions.filter(q=>q.section===examState.section)}
function renderExamQuestion(){
 const es=examState;if(!es)return;const qs=examSectionQuestions();if(!qs.length){finishExamSection(true);return}es.idx=Math.max(0,Math.min(es.idx,qs.length-1));const q=qs[es.idx],list=qs.map((x,i)=>`<button class="chip ${i===es.idx?'active':''} ${es.answers[x.id]!==undefined?'answered':''} ${es.flags[x.id]?'flagged':''}" data-jump="${i}" aria-label="Câu ${i+1}">${i+1}${es.flags[x.id]?' ⚑':''}</button>`).join('');
 const questionBody=q.type==='reading'?`<div class="content-card"><h3>文章</h3><p class="jp exam-passage">${q.passage}</p></div><h2 class="jp">${q.prompt}</h2>`:q.type==='listening'?`<div class="content-card"><h3>聴解</h3><p>Hãy nghe đoạn hội thoại, sau đó chọn đáp án.</p><button class="primary-btn" id="playListening" type="button">▶ Nghe hội thoại</button></div><h2>${q.prompt}</h2>`:`<h2 class="jp exam-prompt">${q.prompt}</h2>`;
 page(`JLPT ${es.level} · ${es.blue[es.section].name}`,`セット${es.set} · ${qs.length}問`, `<article class="study-card"><div class="exam-top"><b>${es.blue[es.section].name}</b><strong id="examTimer">${formatExamTime(es.remaining)}</strong></div><div class="exam-question"><div class="eyebrow">問題 ${es.idx+1} / ${qs.length} · ${q.kind||q.type}</div>${questionBody}${q.choices.map((o,i)=>`<button class="exam-choice ${es.answers[q.id]===o?'selected':''}" data-exanswer="${i}" type="button">${['A','B','C','D'][i]}. ${o}</button>`).join('')}</div><div class="exam-actions"><button class="secondary-btn" id="flagExam" type="button">${es.flags[q.id]?'⚑ マーク解除':'⚑ 見直しマーク'}</button><button class="secondary-btn" id="examPrev" ${es.idx===0?'disabled':''} type="button">← 前の問題</button><button class="primary-btn" id="examNext" type="button">${es.idx===qs.length-1?'セクション終了':'次の問題 →'}</button></div><div class="exam-nav"><h3>問題一覧</h3><div class="toolbar">${list}</div><p class="muted">色付き：回答済み · ⚑：見直しマーク</p></div><button class="secondary-btn" id="examSubmitAll" type="button">試験を終了・採点</button></article>`);
 document.querySelectorAll('[data-exanswer]').forEach(b=>b.onclick=()=>{es.answers[q.id]=q.choices[+b.dataset.exanswer];renderExamQuestion()});
 document.querySelectorAll('[data-jump]').forEach(b=>b.onclick=()=>{es.idx=+b.dataset.jump;renderExamQuestion()});
 $('#flagExam')?.addEventListener('click',()=>{es.flags[q.id]=!es.flags[q.id];renderExamQuestion()});
 $('#examPrev')?.addEventListener('click',()=>{es.idx--;renderExamQuestion()});
 $('#examNext')?.addEventListener('click',()=>{if(es.idx<qs.length-1){es.idx++;renderExamQuestion()}else finishExamSection(false)});
 $('#examSubmitAll')?.addEventListener('click',()=>{if(confirm('試験を終了して採点しますか？ 未回答も含めて採点します。'))finishExam();});
 $('#playListening')?.addEventListener('click',()=>speak(q.script,0.85));
}
function finishExamSection(auto=false){
 if(!examState)return;const es=examState;if(examTick){clearInterval(examTick);examTick=null}
 const next=es.section+1;if(next<es.blue.length){if(auto||confirm(`${es.blue[es.section].name}を終了し、次のセクションへ進みますか？`)){es.section=next;es.idx=0;es.remaining=es.blue[next].minutes*60;renderExamQuestion();runExamClock()}else runExamClock()}else finishExam();
}
function finishExam(){
 if(!examState)return;if(examTick){clearInterval(examTick);examTick=null}if(window.speechSynthesis)window.speechSynthesis.cancel();
 const es=examState,correct=es.questions.filter(q=>es.answers[q.id]===q.answer),total=es.questions.length;
 const history={level:es.level,set:es.set,score:correct.length,total,date:new Date().toLocaleDateString(),answers:es.answers};
 state.progress.examHistory=state.progress.examHistory||[];state.progress.examHistory.push(history);saveProgress();examState=null;
 page('試験結果','練習結果 · JLPT標準化得点ではありません',`<article class="content-card"><h2>${correct.length}/${total}問 正解</h2><p>${Math.round(correct.length/Math.max(total,1)*100)}%</p><h3>分野別</h3>${Object.keys({}).length?'<p></p>':''}${es.blue.map((s,si)=>{let sq=es.questions.filter(q=>q.section===si),sc=sq.filter(q=>history.answers[q.id]===q.answer).length;return `<div class="lesson-row"><b>${s.name}</b><span>${sc}/${sq.length}</span></div>`}).join('')}<h3>答え・解説</h3>${es.questions.map((q,i)=>`<div class="lesson-row"><div><b>${i+1}. ${q.prompt}</b><p>${history.answers[q.id]===q.answer?'✓ 正解':'✗ 不正解 / 未回答'} · 正解：${q.answer}</p><p>選択肢：${q.choices.map((c,ci)=>`${['A','B','C','D'][ci]}. ${c}`).join(' ／ ')}</p>${q.type==='listening'?`<small>${q.script||''}</small><br>`:''}<small>${q.explanation||''}</small></div></div>`).join('')}<button class="primary-btn" type="button" data-view="exam">試験一覧に戻る</button></article>`);
}

function navigate(view){state.view=view;$("#sidebar").classList.remove("open");document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.view===view));const renderers={home:renderHome,kana:renderKana,path:renderPath,vocab:renderVocab,kanji:renderKanji,grammar:renderGrammar,listening:renderListening,reading:renderReading,review:renderReview,quiz:renderQuiz,exam:renderExam,progress:renderProgress,account:renderAccount};if(!renderers[view])view="home";state.view=view;renderers[view]();window.scrollTo(0,0)}
document.addEventListener("click",e=>{const b=e.target.closest("[data-view]");if(b){e.preventDefault();e.stopPropagation();navigate(b.dataset.view);return;}const lv=e.target.closest("[data-level]");if(lv){e.preventDefault();state.selectedLevel=lv.dataset.level;navigate("path");return;}});
$("#menuBtn").onclick=()=>$("#sidebar").classList.toggle("open");$("#accountBtn").onclick=()=>navigate("account");
$("#authSubmit").onclick=submitAuth;$("#toggleAuth").onclick=()=>setAuthMode(state.authMode==="login"?"signup":"login");$("#forgotBtn").onclick=async()=>{if(!hasSupabase){toast("Chưa cấu hình Supabase.");return}const email=$("#authEmail").value.trim();if(!email){toast("Nhập email trước.");return}const {error}=await sb.auth.resetPasswordForEmail(email);toast(error?error.message:"Đã gửi email đặt lại mật khẩu.")};
setAuthMode("login");updateIdentity();renderHome();
if(sb){sb.auth.getSession().then(async({data})=>{if(data.session){state.user=data.session.user;state.profileName=state.user.user_metadata?.display_name||state.user.email.split("@")[0];await loadCloudProgress();updateIdentity();if(state.view==="home")renderHome()}});sb.auth.onAuthStateChange((_event,session)=>{if(!session){state.user=null;state.profileName="Khách học";updateIdentity()}})}
