/* ═══════════════════════════════════════════════════════════════════════════
   i18n.js — YourFreeDocs Localisation
   Languages: Bengali (bn), Hindi (hi), Chinese Simplified (zh), Japanese (ja)
   English (en) is the default — no translation needed.
   All translations are natural, human-quality — not literal word-for-word.
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Translation dictionary ─────────────────────────────────────────────
     Keys match data-i18n attributes added to HTML elements.
     Each key has translations for bn, hi, zh, ja.
     English fallback is always the original HTML text.
  ─────────────────────────────────────────────────────────────────────── */
  const TRANSLATIONS = {

    // ── Topbar ──────────────────────────────────────────────────────────
    'topbar.no-file':       { bn: 'কোনো ফাইল নেই', hi: 'कोई फ़ाइल नहीं', zh: '未选择文件', ja: 'ファイルなし' },
    'topbar.contact':       { bn: 'যোগাযোগ',      hi: 'संपर्क करें',    zh: '联系我们',  ja: 'お問い合わせ' },
    'topbar.tutorials':     { bn: 'টিউটোরিয়াল',   hi: 'ट्यूटोरियल',    zh: '教程',      ja: 'チュートリアル' },
    'topbar.help':          { bn: 'সাহায্য',       hi: 'सहायता',        zh: '帮助',      ja: 'ヘルプ' },
    'topbar.shortcuts':     { bn: 'শর্টকাট',       hi: 'शॉर्टकट',       zh: '快捷键',    ja: 'ショートカット' },
    'topbar.open-pdf':      { bn: 'PDF খুলুন',    hi: 'PDF खोलें',     zh: '打开 PDF',  ja: 'PDFを開く' },
    'topbar.save-pdf':      { bn: 'PDF সেভ করুন', hi: 'PDF सहेजें',    zh: '保存 PDF',  ja: 'PDFを保存' },

    // ── Toolbar tools ───────────────────────────────────────────────────
    'tool.select':          { bn: 'নির্বাচন',    hi: 'चुनें',       zh: '选择',   ja: '選択' },
    'tool.text':            { bn: 'লেখা',        hi: 'पाठ',         zh: '文字',   ja: 'テキスト' },
    'tool.highlight':       { bn: 'হাইলাইট',     hi: 'हाइलाइट',    zh: '高亮',   ja: 'ハイライト' },
    'tool.draw':            { bn: 'আঁকুন',       hi: 'बनाएं',       zh: '绘制',   ja: '描画' },
    'tool.rect':            { bn: 'আয়তক্ষেত্র', hi: 'आयत',         zh: '矩形',   ja: '四角形' },
    'tool.circle':          { bn: 'বৃত্ত',       hi: 'वृत्त',       zh: '圆形',   ja: '円' },
    'tool.erase':           { bn: 'মুছুন',       hi: 'मिटाएं',      zh: '橡皮擦', ja: '消しゴム' },
    'tool.image':           { bn: 'ছবি',         hi: 'छवि',         zh: '图片',   ja: '画像' },
    'tool.rotate-cw':       { bn: 'ঘড়ির দিকে ঘোরান',       hi: 'दक्षिणावर्त घुमाएं',    zh: '顺时针旋转', ja: '右回転' },
    'tool.rotate-ccw':      { bn: 'ঘড়ির বিপরীতে ঘোরান',   hi: 'वामावर्त घुमाएं',       zh: '逆时针旋转', ja: '左回転' },
    'tool.clear-page':      { bn: 'পৃষ্ঠা পরিষ্কার করুন', hi: 'पृष्ठ साफ़ करें',       zh: '清除页面',   ja: 'ページをクリア' },
    'tool.undo':            { bn: 'পূর্বাবস্থা',          hi: 'पूर्ववत करें',           zh: '撤销',       ja: '元に戻す' },
    'font.search-placeholder': { bn: 'ফন্ট খুঁজুন…', hi: 'फ़ॉन्ट खोजें…', zh: '搜索字体…', ja: 'フォントを検索…' },

    // ── Sidebar ─────────────────────────────────────────────────────────
    'sidebar.pages':        { bn: 'পৃষ্ঠাসমূহ', hi: 'पृष्ठ',      zh: '页面',   ja: 'ページ' },

    // ── Drop zone ───────────────────────────────────────────────────────
    'drop.title':           { bn: 'এখানে আপনার PDF ফেলুন',       hi: 'अपना PDF यहाँ छोड़ें',        zh: '将您的 PDF 拖放到这里',       ja: 'PDFをここにドロップ' },
    'drop.sub':             { bn: 'অথবা নিচের একটি বিকল্প বেছে নিন', hi: 'या नीचे एक विकल्प चुनें', zh: '或从下面选择一个选项',         ja: 'または下のオプションを選択' },
    'drop.browse-pdf':      { bn: 'PDF ব্রাউজ করুন',              hi: 'PDF ब्राउज़ करें',            zh: '浏览 PDF',                    ja: 'PDFを選択' },
    'drop.create-pdf':      { bn: 'PDF তৈরি করুন',                hi: 'PDF बनाएं',                   zh: '创建 PDF',                    ja: 'PDFを作成' },
    'drop.create-hint':     { bn: 'খালি বা লেখা/ছবি থেকে PDF তৈরি করুন', hi: 'रिक्त PDF या टेक्स्ट/चित्र से बनाएं', zh: '创建空白 PDF 或从文字/图片生成', ja: '空白またはテキスト/画像からPDFを作成' },

    // ── Properties panel ────────────────────────────────────────────────
    'panel.fill-stroke':    { bn: 'রং ও রেখা',    hi: 'भरण और स्ट्रोक', zh: '填充和边框', ja: '塗りと線' },
    'panel.fill':           { bn: 'পূরণ',         hi: 'भरण',             zh: '填充',       ja: '塗り' },
    'panel.border':         { bn: 'বর্ডার',       hi: 'बॉर्डर',          zh: '边框',       ja: '枠線' },
    'panel.no-fill':        { bn: 'রং নেই',       hi: 'बिना भरण',        zh: '无填充',     ja: '塗りなし' },
    'panel.custom':         { bn: 'কাস্টম',       hi: 'कस्टम',           zh: '自定义',     ja: 'カスタム' },
    'panel.style':          { bn: 'স্টাইল',       hi: 'शैली',            zh: '样式',       ja: 'スタイル' },
    'panel.border-px':      { bn: 'বর্ডার পিক্স',  hi: 'बॉर्डर px',      zh: '边框像素',   ja: '枠線 px' },
    'panel.opacity':        { bn: 'স্বচ্ছতা',     hi: 'अपारदर्शिता',     zh: '透明度',     ja: '不透明度' },
    'panel.font-size':      { bn: 'ফন্ট আকার',    hi: 'फ़ॉन्ट आकार',    zh: '字体大小',   ja: 'フォントサイズ' },
    'panel.zoom':           { bn: 'জুম',           hi: 'ज़ूम',            zh: '缩放',       ja: 'ズーム' },
    'panel.shortcuts':      { bn: 'শর্টকাট',       hi: 'शॉर्टकट',        zh: '快捷键',     ja: 'ショートカット' },
    'panel.view-shortcuts': { bn: 'সব শর্টকাট দেখুন', hi: 'सभी शॉर्टकट देखें', zh: '查看所有快捷键', ja: 'すべてのショートカットを表示' },
    'panel.document':       { bn: 'ডকুমেন্ট',     hi: 'दस्तावेज़',       zh: '文档信息',   ja: 'ドキュメント' },
    'panel.pages':          { bn: 'পৃষ্ঠা',        hi: 'पृष्ठ',          zh: '页面',       ja: 'ページ' },
    'panel.annotations':    { bn: 'টীকা',          hi: 'एनोटेशन',        zh: '注释',       ja: '注釈' },
    'panel.file-size':      { bn: 'ফাইলের আকার',  hi: 'फ़ाइल आकार',     zh: '文件大小',   ja: 'ファイルサイズ' },
    'panel.close-pdf':      { bn: 'PDF বন্ধ করুন', hi: 'PDF बंद करें',  zh: '关闭 PDF',   ja: 'PDFを閉じる' },

    // ── Status bar ──────────────────────────────────────────────────────
    'status.tool':          { bn: 'টুল',           hi: 'टूल',            zh: '工具',       ja: 'ツール' },
    'status.page':          { bn: 'পৃষ্ঠা',        hi: 'पृष्ठ',          zh: '页面',       ja: 'ページ' },

    // ── Create PDF modal ─────────────────────────────────────────────────
    'create.title':         { bn: 'নতুন PDF তৈরি করুন',  hi: 'नया PDF बनाएं',   zh: '新建 PDF',       ja: '新しいPDFを作成' },
    'create.page-size':     { bn: 'পৃষ্ঠার আকার',        hi: 'पृष्ठ आकार',      zh: '页面尺寸',       ja: 'ページサイズ' },
    'create.orientation':   { bn: 'অভিমুখিতা',           hi: 'अभिविन्यास',      zh: '方向',           ja: '向き' },
    'create.portrait':      { bn: 'পোর্ট্রেট',           hi: 'पोर्ट्रेट',       zh: '竖向',           ja: '縦向き' },
    'create.landscape':     { bn: 'ল্যান্ডস্কেপ',        hi: 'लैंडस्केप',       zh: '横向',           ja: '横向き' },
    'create.num-pages':     { bn: 'পৃষ্ঠার সংখ্যা',      hi: 'पृष्ठों की संख्या', zh: '页数',          ja: 'ページ数' },
    'create.background':    { bn: 'পৃষ্ঠার পটভূমি',      hi: 'पृष्ठ पृष्ठभूमि', zh: '页面背景',       ja: 'ページ背景' },
    'create.white':         { bn: 'সাদা',                hi: 'सफ़ेद',           zh: '白色',           ja: '白' },
    'create.cream':         { bn: 'ক্রিম',               hi: 'क्रीम',           zh: '米色',           ja: 'クリーム' },
    'create.light-gray':    { bn: 'হালকা ধূসর',          hi: 'हल्का ग्रे',      zh: '浅灰',           ja: 'ライトグレー' },
    'create.dark':          { bn: 'গাঢ়',                 hi: 'गहरा',            zh: '深色',           ja: 'ダーク' },
    'create.footer-tip':    { bn: 'PDF খোলার পর যেকোনো জায়গায় ক্লিক করে লেখা শুরু করুন', hi: 'PDF खुलने के बाद पृष्ठ पर कहीं भी क्लिक करके टाइप करें', zh: 'PDF 创建后，点击页面任意位置即可开始输入', ja: 'PDF作成後、ページ上の任意の場所をクリックして入力開始' },
    'create.cancel':        { bn: 'বাতিল',               hi: 'रद्द करें',       zh: '取消',           ja: 'キャンセル' },
    'create.confirm':       { bn: 'PDF তৈরি করুন',       hi: 'PDF बनाएं',       zh: '创建 PDF',       ja: 'PDFを作成' },

    // ── Free-type banner ────────────────────────────────────────────────
    'freetype.msg':         { bn: 'মুক্ত টাইপিং মোড — পাতায় <span style="color:var(--accent);">যেকোনো জায়গায় ক্লিক করুন</span> লেখা রাখতে', hi: 'मुक्त टाइपिंग मोड — पाठ रखने के लिए पृष्ठ पर <span style="color:var(--accent);">कहीं भी क्लिक करें</span>', zh: '自由输入模式 — <span style="color:var(--accent);">点击页面任意位置</span>放置文字', ja: '自由入力モード — ページの<span style="color:var(--accent);">任意の場所をクリック</span>してテキストを配置' },
    'freetype.exit':        { bn: 'বের হন',               hi: 'बाहर निकलें',     zh: '退出',           ja: '終了' },

    // ── Help modal ──────────────────────────────────────────────────────
    'help.title':           { bn: 'সাহায্য ও নিয়মাবলি',           hi: 'सहायता और टूल नियम',        zh: '帮助与工具说明',              ja: 'ヘルプとツールの説明' },
    'help.text-tool-title': { bn: 'টেক্সট টুল',                   hi: 'टेक्स्ट टूल',               zh: '文字工具',                    ja: 'テキストツール' },
    'help.color-rule-head': { bn: 'বর্ডার রং = টেক্সট রং',       hi: 'बॉर्डर रंग = टेक्स्ट रंग', zh: '边框颜色即文字颜色',           ja: '枠線の色 ＝ テキストの色' },
    'help.color-rule-body': { bn: '<strong style="color:var(--accent)">টেক্সট</strong> টুলে ক্লিক করলে একটি কালার পিকার আসবে। আপনি যে রঙ বেছে নেবেন সেটি <strong style="color:var(--text)">টেক্সটের রং এবং বর্ডারের রং</strong> উভয়ই হবে। রং বেছে তারপর PDF-এ যেকোনো জায়গায় ক্লিক করুন।', hi: '<strong style="color:var(--accent)">टेक्स्ट</strong> टूल पर क्लिक करने पर एक कलर पिकर दिखाई देगा। आप जो रंग चुनेंगे वह <strong style="color:var(--text)">टेक्स्ट का रंग और बॉर्डर का रंग</strong> दोनों होगा। रंग चुनें, फिर PDF पर कहीं भी क्लिक करें।', zh: '点击<strong style="color:var(--accent)">文字</strong>工具后会出现颜色选择器。您选择的颜色将同时作为<strong style="color:var(--text)">文字颜色和边框颜色</strong>。选好颜色后点击 PDF 上任意位置放置文字。', ja: '<strong style="color:var(--accent)">テキスト</strong>ツールをクリックするとカラーピッカーが表示されます。選んだ色が<strong style="color:var(--text)">テキストの色と枠線の色</strong>の両方になります。色を選んでPDFの任意の場所をクリックしてください。' },
    'help.step1':           { bn: '<kbd class="kbd">Text</kbd> টুলে ক্লিক করুন (বা <kbd class="kbd">T</kbd> চাপুন) — একটি কালার পিকার পপআপ আসবে।', hi: '<kbd class="kbd">Text</kbd> टूल पर क्लिक करें (या <kbd class="kbd">T</kbd> दबाएं) — एक कलर पिकर पॉपअप दिखाई देगा।', zh: '点击<kbd class="kbd">Text</kbd>工具（或按<kbd class="kbd">T</kbd>）— 颜色选择器弹窗将出现。', ja: '<kbd class="kbd">Text</kbd>ツールをクリック（または<kbd class="kbd">T</kbd>を押す）— カラーピッカーが表示されます。' },
    'help.step2':           { bn: 'প্যালেট থেকে একটি রং বেছে নিন — এটি আপনার টেক্সট ও বর্ডারের রং হবে।', hi: 'पैलेट से एक रंग चुनें — यह आपके टेक्स्ट और बॉर्डर का रंग होगा।', zh: '从调色板中选择一种颜色 — 这将是您的文字和边框颜色。', ja: 'パレットから色を選択 — これがテキストと枠線の色になります。' },
    'help.step3':           { bn: 'সেই রঙের টেক্সট বক্স রাখতে PDF ক্যানভাসে যেকোনো জায়গায় ক্লিক করুন।', hi: 'उस रंग का टेक्स्ट बॉक्स रखने के लिए PDF कैनवास पर कहीं भी क्लिक करें।', zh: '点击 PDF 画布上的任意位置，以放置该颜色的文字框。', ja: 'そのテキストボックスを配置するために、PDFキャンバスの任意の場所をクリックしてください。' },
    'help.step4':           { bn: 'আপনার টেক্সট টাইপ করুন। বাইরে ক্লিক করুন বা অন্য টুল বেছে নিলে টেক্সট বক্স ফ্রিজ হয়ে যাবে।', hi: 'अपना पाठ टाइप करें। बाहर क्लिक करें या दूसरा टूल चुनें — टेक्स्ट बॉक्स फ्रीज हो जाएगा।', zh: '输入您的文字。点击外部或选择其他工具 — 文字框将被固定。', ja: 'テキストを入力してください。外をクリックするか別のツールを選ぶとテキストボックスが固定されます。' },
    'help.info-tip':        { bn: 'ফ্রোজেন টেক্সট বক্সে ডাবল ক্লিক করে রং পরিবর্তন করা যায় — ডান প্যানেলের স্ট্রোক রং থেকে।', hi: 'जमे हुए टेक्स्ट बॉक्स पर डबल क्लिक करके रंग बदलें — दाएं पैनल में स्ट्रोक रंग से।', zh: '双击已固定的文字框可重新编辑 — 通过右侧面板的边框颜色更改颜色。', ja: '固定されたテキストボックスをダブルクリックして編集再開 — 右パネルのストロークカラーで色変更できます。' },
    'help.footer-tip':      { bn: 'যেকোনো সময় HELP বাটনে ক্লিক করে এই গাইড খুলুন।', hi: 'इस गाइड को फिर से खोलने के लिए कभी भी HELP बटन पर क्लिक करें।', zh: '随时点击帮助按钮重新打开本指南。', ja: 'いつでもHELPボタンをクリックしてこのガイドを再表示できます。' },
    'help.close':           { bn: 'বন্ধ করুন', hi: 'बंद करें', zh: '关闭', ja: '閉じる' },

    // ── Text color popup ─────────────────────────────────────────────────
    'textcolor.title':      { bn: 'টেক্সটের রং বেছে নিন',           hi: 'टेक्स्ट रंग चुनें',           zh: '选择文字颜色',               ja: 'テキストの色を選択' },
    'textcolor.sub':        { bn: 'নির্বাচিত রঙ টেক্সট ও বর্ডার উভয়ের জন্য ব্যবহৃত হবে।', hi: 'चुना गया रंग टेक्स्ट और बॉर्डर दोनों के लिए उपयोग होगा।', zh: '所选颜色将同时用于文字和边框。', ja: '選択した色はテキストと枠線の両方に使用されます。' },
    'textcolor.custom':     { bn: 'কাস্টম:',                          hi: 'कस्टम:',                     zh: '自定义:',                    ja: 'カスタム:' },
    'textcolor.confirm':    { bn: 'রং নিশ্চিত করুন ও টেক্সট রাখুন', hi: 'रंग की पुष्टि करें और टेक्स्ट रखें', zh: '确认颜色并放置文字',        ja: '色を確定してテキストを配置' },

    // ── Shortcuts modal ──────────────────────────────────────────────────
    'shortcuts.title':      { bn: 'কীবোর্ড শর্টকাট',    hi: 'कीबोर्ड शॉर्टकट',    zh: '键盘快捷键',       ja: 'キーボードショートカット' },
    'shortcuts.tools':      { bn: 'টুলসমূহ',              hi: 'टूल',                zh: '工具',             ja: 'ツール' },
    'shortcuts.file':       { bn: 'ফাইল',                 hi: 'फ़ाइल',              zh: '文件',             ja: 'ファイル' },
    'shortcuts.navigation': { bn: 'নেভিগেশন',             hi: 'नेविगेशन',           zh: '页面导航',         ja: 'ナビゲーション' },
    'shortcuts.zoom':       { bn: 'জুম',                   hi: 'ज़ूम',               zh: '缩放',             ja: 'ズーム' },
    'sc.select':            { bn: 'নির্বাচন / সরান',       hi: 'चुनें / ले जाएं',   zh: '选择/移动',        ja: '選択/移動' },
    'sc.text':              { bn: 'লেখা',                  hi: 'पाठ',                zh: '文字',             ja: 'テキスト' },
    'sc.draw':              { bn: 'হাতে আঁকুন',            hi: 'फ्रीहैंड ड्रा',      zh: '手绘',             ja: '手描き' },
    'sc.rect':              { bn: 'আয়তক্ষেত্র',           hi: 'आयत',                zh: '矩形',             ja: '四角形' },
    'sc.circle':            { bn: 'বৃত্ত',                 hi: 'वृत्त',              zh: '圆形',             ja: '円' },
    'sc.highlight':         { bn: 'হাইলাইট',               hi: 'हाइलाइट',            zh: '高亮',             ja: 'ハイライト' },
    'sc.erase':             { bn: 'মুছুন',                 hi: 'मिटाएं',             zh: '橡皮擦',           ja: '消しゴム' },
    'sc.image':             { bn: 'ছবি যোগ করুন',          hi: 'छवि डालें',          zh: '插入图片',         ja: '画像を挿入' },
    'sc.open':              { bn: 'PDF খুলুন',             hi: 'PDF खोलें',          zh: '打开 PDF',         ja: 'PDFを開く' },
    'sc.save':              { bn: 'PDF সেভ করুন',          hi: 'PDF सहेजें',         zh: '保存 PDF',         ja: 'PDFを保存' },
    'sc.undo':              { bn: 'পূর্বাবস্থায় ফেরান',    hi: 'पूर्ववत करें',       zh: '撤销',             ja: '元に戻す' },
    'sc.delete':            { bn: 'নির্বাচিত মুছুন',       hi: 'चुना हुआ हटाएं',    zh: '删除所选',         ja: '選択を削除' },
    'sc.show-shortcuts':    { bn: 'শর্টকাট দেখুন',         hi: 'शॉर्टकट दिखाएं',   zh: '显示快捷键',       ja: 'ショートカットを表示' },
    'sc.close-modal':       { bn: 'ডায়ালগ বন্ধ করুন',     hi: 'डायलॉग बंद करें',  zh: '关闭弹窗',         ja: 'ダイアログを閉じる' },
    'sc.prev-page':         { bn: 'আগের পৃষ্ঠা',           hi: 'पिछला पृष्ठ',       zh: '上一页',           ja: '前のページ' },
    'sc.next-page':         { bn: 'পরের পৃষ্ঠা',           hi: 'अगला पृष्ठ',        zh: '下一页',           ja: '次のページ' },
    'sc.first-page':        { bn: 'প্রথম পৃষ্ঠা',          hi: 'पहला पृष्ठ',        zh: '第一页',           ja: '最初のページ' },
    'sc.last-page':         { bn: 'শেষ পৃষ্ঠা',            hi: 'अंतिम पृष्ठ',       zh: '最后一页',         ja: '最後のページ' },
    'sc.zoom-in':           { bn: 'জুম ইন',                hi: 'ज़ूम इन',            zh: '放大',             ja: 'ズームイン' },
    'sc.zoom-out':          { bn: 'জুম আউট',               hi: 'ज़ूम आउट',           zh: '缩小',             ja: 'ズームアウト' },
    'sc.fit':               { bn: 'উইন্ডোয় ফিট করুন',     hi: 'विंडो में फ़िट करें', zh: '适应窗口',        ja: 'ウィンドウに合わせる' },
    'sc.scroll-zoom':       { bn: 'স্ক্রোল দিয়ে জুম',     hi: 'स्क्रोल से ज़ूम',   zh: '滚轮缩放',         ja: 'スクロールズーム' },
    'shortcuts.footer-tip': { bn: 'যেকোনো সময় <kbd class="kbd">?</kbd> চাপুন এই প্যানেল খুলতে', hi: 'इस पैनल को खोलने के लिए कभी भी <kbd class="kbd">?</kbd> दबाएं', zh: '随时按 <kbd class="kbd">?</kbd> 打开此面板', ja: 'いつでも<kbd class="kbd">?</kbd>を押してこのパネルを開く' },
    'shortcuts.close':      { bn: 'বন্ধ করুন',             hi: 'बंद करें',           zh: '关闭',             ja: '閉じる' },

    // ── Nav buttons (page nav titles) ───────────────────────────────────
    'nav.prev-page':        { bn: 'আগের পৃষ্ঠা',   hi: 'पिछला पृष्ठ',  zh: '上一页', ja: '前のページ' },
    'nav.next-page':        { bn: 'পরের পৃষ্ঠা',   hi: 'अगला पृष्ठ',   zh: '下一页', ja: '次のページ' },
  };

  /* ── Supported languages ─────────────────────────────────────────────── */
  const LANGUAGES = {
    en: { label: 'EN', name: 'English',  flag: '🇬🇧' },
    bn: { label: 'বাং', name: 'বাংলা',   flag: '🇧🇩' },
    hi: { label: 'हिं',  name: 'हिन्दी',  flag: '🇮🇳' },
    zh: { label: '中文', name: '中文',    flag: '🇨🇳' },
    ja: { label: '日本', name: '日本語',  flag: '🇯🇵' },
  };

  const LS_KEY = 'yfd-lang';

  // Auto-detect language from URL path: /bn/, /hi/, /zh/, /ja/
  function detectLangFromURL() {
    const path = window.location.pathname;
    const match = path.match(/^\/([a-z]{2})\//);
    if (match) {
      const code = match[1];
      if (['bn','hi','zh','ja'].includes(code)) return code;
    }
    return null;
  }

  // URL language takes priority over localStorage
  const urlLang = detectLangFromURL();
  let currentLang = urlLang || localStorage.getItem(LS_KEY) || 'en';
  // If loaded from a language URL, save it so toggles work
  if (urlLang) localStorage.setItem(LS_KEY, urlLang);

  /* ── English snapshot — stored once before first translation ────────── */
  const EN_SNAPSHOT = {};

  function saveEnglishSnapshot() {
    if (EN_SNAPSHOT._saved) return;

    // All data-i18n elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      EN_SNAPSHOT['data-i18n:' + key] = el.innerHTML;
    });

    // data-i18n-placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      EN_SNAPSHOT['placeholder:' + key] = el.placeholder;
    });

    // Special elements snapshot
    const specials = [
      'a[href*="forms.gle"]', '#btn-tutorials', '#btn-help', '#btn-shortcuts',
      '#btn-open', '#btn-save', '#btn-drop-open', '#btn-create-pdf',
      '#btn-close-pdf', '#create-pdf-cancel', '#create-pdf-confirm',
      '#free-type-exit', '#help-modal-close-btn', '#shortcuts-modal-close-btn',
    ];
    specials.forEach(sel => {
      const el = document.querySelector(sel);
      if (el) EN_SNAPSHOT['special:' + sel] = el.innerHTML;
    });

    // Tool buttons
    document.querySelectorAll('.tool-btn[data-tool], #btn-insert-image, #btn-rotate-cw, #btn-rotate-ccw, #btn-clear-ann, #btn-undo').forEach(el => {
      EN_SNAPSHOT['toolbtn:' + (el.dataset.tool || el.id)] = el.innerHTML;
    });

    // Sidebar header
    const sidebarHdr = document.querySelector('.sidebar-header');
    if (sidebarHdr) EN_SNAPSHOT['sidebar-header'] = sidebarHdr.innerHTML;

    // Drop sub hint
    const dropSubs = document.querySelectorAll('.drop-sub');
    if (dropSubs[1]) EN_SNAPSHOT['drop-sub-2'] = dropSubs[1].innerHTML;

    // Panel labels
    document.querySelectorAll('.panel-label').forEach(el => {
      EN_SNAPSHOT['panel-label:' + el.textContent.trim()] = el.innerHTML;
    });

    // prop-row labels
    document.querySelectorAll('.prop-row label').forEach(el => {
      EN_SNAPSHOT['prop-label:' + el.textContent.trim()] = el.innerHTML;
    });

    // stat-lbl
    document.querySelectorAll('.stat-lbl').forEach(el => {
      EN_SNAPSHOT['stat-lbl:' + el.textContent.trim()] = el.innerHTML;
    });

    // shortcut group titles
    document.querySelectorAll('.shortcut-group-title').forEach(el => {
      EN_SNAPSHOT['sc-group:' + el.textContent.trim()] = el.innerHTML;
    });

    // shortcut descriptions
    document.querySelectorAll('.shortcut-desc').forEach(el => {
      EN_SNAPSHOT['sc-desc:' + el.textContent.trim()] = el.innerHTML;
    });

    // view shortcuts button
    const viewScBtn = document.getElementById('btn-shortcuts-panel');
    if (viewScBtn) EN_SNAPSHOT['btn-shortcuts-panel'] = viewScBtn.innerHTML;

    // Modal titles
    const createTitle = document.querySelector('#create-pdf-modal .modal-title');
    if (createTitle) EN_SNAPSHOT['modal-title:create'] = createTitle.innerHTML;

    const helpTitle = document.querySelector('#help-modal .modal-title');
    if (helpTitle) EN_SNAPSHOT['modal-title:help'] = helpTitle.innerHTML;

    const scTitle = document.querySelector('#shortcuts-modal .modal-title');
    if (scTitle) EN_SNAPSHOT['modal-title:shortcuts'] = scTitle.innerHTML;

    // Help modal body
    const helpModal = document.getElementById('help-modal');
    if (helpModal) {
      const body = helpModal.querySelector('[style*="padding:22px"]') || helpModal.querySelector('.modal-body');
      if (body) EN_SNAPSHOT['help-modal-body'] = body.innerHTML;
    }

    // Text color popup
    const popup = document.getElementById('text-color-popup');
    if (popup) EN_SNAPSHOT['text-color-popup'] = popup.innerHTML;

    // Create modal body
    const createModal = document.getElementById('create-pdf-modal');
    if (createModal) EN_SNAPSHOT['create-modal-body'] = createModal.innerHTML;

    // Free-type banner
    const ftBanner = document.getElementById('free-type-banner');
    if (ftBanner) EN_SNAPSHOT['free-type-banner'] = ftBanner.innerHTML;

    // Footer tips
    const scFooterTip = document.querySelector('#shortcuts-modal .modal-footer .modal-footer-tip');
    if (scFooterTip) EN_SNAPSHOT['sc-footer-tip'] = scFooterTip.innerHTML;

    const helpFooterTip = document.querySelector('#help-modal .modal-footer .modal-footer-tip');
    if (helpFooterTip) EN_SNAPSHOT['help-footer-tip'] = helpFooterTip.innerHTML;

    // Status bar
    const toolStatus = document.getElementById('cur-tool-status');
    if (toolStatus) EN_SNAPSHOT['cur-tool-status'] = toolStatus.textContent;

    const pageStatus = document.getElementById('cur-page-status');
    if (pageStatus) EN_SNAPSHOT['cur-page-status'] = pageStatus.textContent;

    // file name badge
    const badge = document.getElementById('file-name-badge');
    if (badge) EN_SNAPSHOT['file-name-badge'] = badge.innerHTML;

    // font search placeholder
    const fontSearch = document.getElementById('font-picker-search');
    if (fontSearch) EN_SNAPSHOT['font-search-placeholder'] = fontSearch.placeholder;

    EN_SNAPSHOT._saved = true;
  }

  /* ── Restore English from snapshot ──────────────────────────────────── */
  function restoreEnglish() {
    if (!EN_SNAPSHOT._saved) return;

    // data-i18n elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = 'data-i18n:' + el.getAttribute('data-i18n');
      if (EN_SNAPSHOT[key] !== undefined) el.innerHTML = EN_SNAPSHOT[key];
    });

    // placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = 'placeholder:' + el.getAttribute('data-i18n-placeholder');
      if (EN_SNAPSHOT[key] !== undefined) el.placeholder = EN_SNAPSHOT[key];
    });

    // Special elements
    const specials = [
      'a[href*="forms.gle"]', '#btn-tutorials', '#btn-help', '#btn-shortcuts',
      '#btn-open', '#btn-save', '#btn-drop-open', '#btn-create-pdf',
      '#btn-close-pdf', '#create-pdf-cancel', '#create-pdf-confirm',
      '#free-type-exit', '#help-modal-close-btn', '#shortcuts-modal-close-btn',
    ];
    specials.forEach(sel => {
      const el = document.querySelector(sel);
      if (el && EN_SNAPSHOT['special:' + sel] !== undefined) el.innerHTML = EN_SNAPSHOT['special:' + sel];
    });

    // Tool buttons
    document.querySelectorAll('.tool-btn[data-tool], #btn-insert-image, #btn-rotate-cw, #btn-rotate-ccw, #btn-clear-ann, #btn-undo').forEach(el => {
      const key = 'toolbtn:' + (el.dataset.tool || el.id);
      if (EN_SNAPSHOT[key] !== undefined) el.innerHTML = EN_SNAPSHOT[key];
    });

    // Sidebar header
    const sidebarHdr = document.querySelector('.sidebar-header');
    if (sidebarHdr && EN_SNAPSHOT['sidebar-header'] !== undefined) sidebarHdr.innerHTML = EN_SNAPSHOT['sidebar-header'];

    // Drop sub hint
    const dropSubs = document.querySelectorAll('.drop-sub');
    if (dropSubs[1] && EN_SNAPSHOT['drop-sub-2'] !== undefined) dropSubs[1].innerHTML = EN_SNAPSHOT['drop-sub-2'];

    // Panel labels
    document.querySelectorAll('.panel-label').forEach(el => {
      const snap = EN_SNAPSHOT['panel-label:' + el.textContent.trim()];
      // Can't key by translated text — use index instead
    });
    // Re-restore panel labels by stored index
    Object.keys(EN_SNAPSHOT).filter(k => k.startsWith('panel-label-idx:')).forEach(k => {
      const idx = parseInt(k.split(':')[1]);
      const labels = document.querySelectorAll('.panel-label');
      if (labels[idx]) labels[idx].innerHTML = EN_SNAPSHOT[k];
    });

    // prop-row labels by index
    Object.keys(EN_SNAPSHOT).filter(k => k.startsWith('prop-label-idx:')).forEach(k => {
      const idx = parseInt(k.split(':')[1]);
      const labels = document.querySelectorAll('.prop-row label');
      if (labels[idx]) labels[idx].innerHTML = EN_SNAPSHOT[k];
    });

    // stat-lbl by index
    Object.keys(EN_SNAPSHOT).filter(k => k.startsWith('stat-lbl-idx:')).forEach(k => {
      const idx = parseInt(k.split(':')[1]);
      const labels = document.querySelectorAll('.stat-lbl');
      if (labels[idx]) labels[idx].innerHTML = EN_SNAPSHOT[k];
    });

    // shortcut group titles by index
    Object.keys(EN_SNAPSHOT).filter(k => k.startsWith('sc-group-idx:')).forEach(k => {
      const idx = parseInt(k.split(':')[1]);
      const els = document.querySelectorAll('.shortcut-group-title');
      if (els[idx]) els[idx].innerHTML = EN_SNAPSHOT[k];
    });

    // shortcut descriptions by index
    Object.keys(EN_SNAPSHOT).filter(k => k.startsWith('sc-desc-idx:')).forEach(k => {
      const idx = parseInt(k.split(':')[1]);
      const els = document.querySelectorAll('.shortcut-desc');
      if (els[idx]) els[idx].innerHTML = EN_SNAPSHOT[k];
    });

    // view shortcuts button
    const viewScBtn = document.getElementById('btn-shortcuts-panel');
    if (viewScBtn && EN_SNAPSHOT['btn-shortcuts-panel'] !== undefined) viewScBtn.innerHTML = EN_SNAPSHOT['btn-shortcuts-panel'];

    // Modal titles
    const createTitle = document.querySelector('#create-pdf-modal .modal-title');
    if (createTitle && EN_SNAPSHOT['modal-title:create'] !== undefined) createTitle.innerHTML = EN_SNAPSHOT['modal-title:create'];

    const helpTitle = document.querySelector('#help-modal .modal-title');
    if (helpTitle && EN_SNAPSHOT['modal-title:help'] !== undefined) helpTitle.innerHTML = EN_SNAPSHOT['modal-title:help'];

    const scTitle = document.querySelector('#shortcuts-modal .modal-title');
    if (scTitle && EN_SNAPSHOT['modal-title:shortcuts'] !== undefined) scTitle.innerHTML = EN_SNAPSHOT['modal-title:shortcuts'];

    // Help modal body
    const helpModal = document.getElementById('help-modal');
    if (helpModal && EN_SNAPSHOT['help-modal-body'] !== undefined) {
      const body = helpModal.querySelector('[style*="padding:22px"]') || helpModal.querySelector('.modal-body');
      if (body) body.innerHTML = EN_SNAPSHOT['help-modal-body'];
    }

    // Text color popup — restore inner content carefully (keep inputs/ids intact)
    // We restore the sub-elements individually, not the whole popup
    const popup = document.getElementById('text-color-popup');
    if (popup && EN_SNAPSHOT['text-color-popup-title'] !== undefined) {
      const titleEl = popup.querySelector('[style*="bi-fonts"]');
      if (titleEl) titleEl.innerHTML = EN_SNAPSHOT['text-color-popup-title'];
    }
    if (popup && EN_SNAPSHOT['text-color-popup-sub'] !== undefined) {
      // restore sub text
      popup.querySelectorAll('[style*="font-size:11px"]').forEach(el => {
        if (el.textContent && !el.querySelector('input')) {
          // restore by index stored during snapshot
        }
      });
    }
    const confirmBtn = document.getElementById('text-color-confirm');
    if (confirmBtn && EN_SNAPSHOT['text-color-confirm'] !== undefined) confirmBtn.innerHTML = EN_SNAPSHOT['text-color-confirm'];

    // Create modal sections
    if (EN_SNAPSHOT['create-modal-sections']) {
      try {
        const sections = JSON.parse(EN_SNAPSHOT['create-modal-sections']);
        const modal = document.getElementById('create-pdf-modal');
        if (modal) {
          const upperLabels = modal.querySelectorAll('[style*="text-transform:uppercase"]');
          upperLabels.forEach((el, i) => { if (sections[i] !== undefined) el.textContent = sections[i]; });
        }
      } catch(e) {}
    }
    const orientBtns = document.querySelectorAll('.pdf-orient-btn');
    if (orientBtns[0] && EN_SNAPSHOT['orient-portrait'] !== undefined) orientBtns[0].innerHTML = EN_SNAPSHOT['orient-portrait'];
    if (orientBtns[1] && EN_SNAPSHOT['orient-landscape'] !== undefined) orientBtns[1].innerHTML = EN_SNAPSHOT['orient-landscape'];

    const bgLabel = document.getElementById('create-bg-label');
    if (bgLabel && EN_SNAPSHOT['create-bg-label'] !== undefined) bgLabel.textContent = EN_SNAPSHOT['create-bg-label'];

    const footerTip = document.querySelector('#create-pdf-modal .modal-footer .modal-footer-tip');
    if (footerTip && EN_SNAPSHOT['create-footer-tip'] !== undefined) footerTip.innerHTML = EN_SNAPSHOT['create-footer-tip'];

    // Free-type banner
    const ftBanner = document.getElementById('free-type-banner');
    if (ftBanner && EN_SNAPSHOT['free-type-banner'] !== undefined) ftBanner.innerHTML = EN_SNAPSHOT['free-type-banner'];

    // Footer tips
    const scFooterTip = document.querySelector('#shortcuts-modal .modal-footer .modal-footer-tip');
    if (scFooterTip && EN_SNAPSHOT['sc-footer-tip'] !== undefined) scFooterTip.innerHTML = EN_SNAPSHOT['sc-footer-tip'];

    const helpFooterTip = document.querySelector('#help-modal .modal-footer .modal-footer-tip');
    if (helpFooterTip && EN_SNAPSHOT['help-footer-tip'] !== undefined) helpFooterTip.innerHTML = EN_SNAPSHOT['help-footer-tip'];

    // Status bar
    const toolStatus = document.getElementById('cur-tool-status');
    if (toolStatus && EN_SNAPSHOT['cur-tool-status'] !== undefined) toolStatus.textContent = EN_SNAPSHOT['cur-tool-status'];

    const pageStatus = document.getElementById('cur-page-status');
    if (pageStatus && EN_SNAPSHOT['cur-page-status'] !== undefined) pageStatus.textContent = EN_SNAPSHOT['cur-page-status'];

    // file name badge
    const badge = document.getElementById('file-name-badge');
    if (badge && EN_SNAPSHOT['file-name-badge'] !== undefined) badge.innerHTML = EN_SNAPSHOT['file-name-badge'];

    // font search placeholder
    const fontSearch = document.getElementById('font-picker-search');
    if (fontSearch && EN_SNAPSHOT['font-search-placeholder'] !== undefined) fontSearch.placeholder = EN_SNAPSHOT['font-search-placeholder'];

    document.documentElement.lang = 'en';
  }

  /* ── Enhanced saveEnglishSnapshot with index-based keys ─────────────── */
  function enhancedSnapshot() {
    // Store by index for elements that lose their text identity after translation
    document.querySelectorAll('.panel-label').forEach((el, i) => {
      EN_SNAPSHOT['panel-label-idx:' + i] = el.innerHTML;
    });
    document.querySelectorAll('.prop-row label').forEach((el, i) => {
      EN_SNAPSHOT['prop-label-idx:' + i] = el.innerHTML;
    });
    document.querySelectorAll('.stat-lbl').forEach((el, i) => {
      EN_SNAPSHOT['stat-lbl-idx:' + i] = el.innerHTML;
    });
    document.querySelectorAll('.shortcut-group-title').forEach((el, i) => {
      EN_SNAPSHOT['sc-group-idx:' + i] = el.innerHTML;
    });
    document.querySelectorAll('.shortcut-desc').forEach((el, i) => {
      EN_SNAPSHOT['sc-desc-idx:' + i] = el.innerHTML;
    });
    // Text color popup sub-elements
    const popup = document.getElementById('text-color-popup');
    if (popup) {
      const titleEl = popup.querySelector('[style*="bi-fonts"]');
      if (titleEl) EN_SNAPSHOT['text-color-popup-title'] = titleEl.innerHTML;
      const confirmBtn = document.getElementById('text-color-confirm');
      if (confirmBtn) EN_SNAPSHOT['text-color-confirm'] = confirmBtn.innerHTML;
    }
    // Create modal section labels
    const createModal = document.getElementById('create-pdf-modal');
    if (createModal) {
      const sections = [];
      createModal.querySelectorAll('[style*="text-transform:uppercase"]').forEach(el => sections.push(el.textContent));
      EN_SNAPSHOT['create-modal-sections'] = JSON.stringify(sections);
      const orientBtns = createModal.querySelectorAll('.pdf-orient-btn');
      if (orientBtns[0]) EN_SNAPSHOT['orient-portrait'] = orientBtns[0].innerHTML;
      if (orientBtns[1]) EN_SNAPSHOT['orient-landscape'] = orientBtns[1].innerHTML;
      const bgLabel = document.getElementById('create-bg-label');
      if (bgLabel) EN_SNAPSHOT['create-bg-label'] = bgLabel.textContent;
      const footerTip = createModal.querySelector('.modal-footer .modal-footer-tip');
      if (footerTip) EN_SNAPSHOT['create-footer-tip'] = footerTip.innerHTML;
    }
  }

  /* ── Core translate function ─────────────────────────────────────────── */
  function t(key, lang) {
    if (!lang || lang === 'en') return null;
    const entry = TRANSLATIONS[key];
    if (!entry) return null;
    return entry[lang] || null;
  }

  /* ── Master apply function ───────────────────────────────────────────── */
  function applyTranslations(lang) {
    // Save English before first translation
    if (!EN_SNAPSHOT._saved) {
      saveEnglishSnapshot();
      enhancedSnapshot();
    }

    currentLang = lang;
    localStorage.setItem(LS_KEY, lang);

    // ── Switching TO English: restore snapshot ──
    if (lang === 'en') {
      restoreEnglish();
      updateLangButtons(lang);
      // Notify converters.js to restore English
      if (typeof window.__convApplyLang === 'function') window.__convApplyLang('en');
      return;
    }

    // ── Switching to a non-English language ──
    document.documentElement.lang = lang === 'zh' ? 'zh-Hans' : lang;

    // data-i18n elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = t(key, lang);
      if (val !== null) el.innerHTML = val;
    });

    // placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const val = t(key, lang);
      if (val !== null) el.placeholder = val;
    });

    // Panel labels by index (so they survive re-key after translation)
    document.querySelectorAll('.panel-label').forEach((el, i) => {
      const enText = EN_SNAPSHOT['panel-label-idx:' + i];
      if (!enText) return;
      const panelLabelMap = {
        'Fill & Stroke': 'panel.fill-stroke', 'Fill & Stroke': 'panel.fill-stroke',
        'Style': 'panel.style', 'Zoom': 'panel.zoom',
        'Shortcuts': 'panel.shortcuts', 'Document': 'panel.document',
      };
      // match by stored EN text
      const clean = enText.replace(/<[^>]*>/g, '').trim();
      const key = panelLabelMap[clean];
      if (key) { const val = t(key, lang); if (val !== null) el.innerHTML = val; }
    });

    // prop-row labels by index
    document.querySelectorAll('.prop-row label').forEach((el, i) => {
      const enText = (EN_SNAPSHOT['prop-label-idx:' + i] || '').replace(/<[^>]*>/g, '').trim();
      const map = { 'Border px': 'panel.border-px', 'Opacity': 'panel.opacity', 'Font size': 'panel.font-size' };
      const key = map[enText];
      if (key) { const val = t(key, lang); if (val !== null) el.innerHTML = val; }
    });

    // stat-lbl by index
    document.querySelectorAll('.stat-lbl').forEach((el, i) => {
      const enText = (EN_SNAPSHOT['stat-lbl-idx:' + i] || '').replace(/<[^>]*>/g, '').trim();
      const map = { 'Pages': 'panel.pages', 'Annotations': 'panel.annotations', 'File size': 'panel.file-size' };
      const key = map[enText];
      if (key) { const val = t(key, lang); if (val !== null) el.innerHTML = val; }
    });

    // shortcut group titles by index
    document.querySelectorAll('.shortcut-group-title').forEach((el, i) => {
      const enText = (EN_SNAPSHOT['sc-group-idx:' + i] || '').trim();
      const map = { 'Tools': 'shortcuts.tools', 'File': 'shortcuts.file', 'Navigation': 'shortcuts.navigation', 'Zoom': 'shortcuts.zoom' };
      const key = map[enText];
      if (key) { const val = t(key, lang); if (val !== null) el.innerHTML = val; }
    });

    // shortcut descriptions by index
    const scDescMap = {
      'Select / Move': 'sc.select', 'Text': 'sc.text', 'Freehand Draw': 'sc.draw',
      'Rectangle': 'sc.rect', 'Circle': 'sc.circle', 'Highlight': 'sc.highlight',
      'Erase': 'sc.erase', 'Insert Image': 'sc.image',
      'Open PDF': 'sc.open', 'Save PDF': 'sc.save', 'Undo': 'sc.undo',
      'Delete selected': 'sc.delete', 'Show shortcuts': 'sc.show-shortcuts',
      'Close modal': 'sc.close-modal',
      'Previous page': 'sc.prev-page', 'Next page': 'sc.next-page',
      'First page': 'sc.first-page', 'Last page': 'sc.last-page',
      'Zoom in': 'sc.zoom-in', 'Zoom out': 'sc.zoom-out',
      'Fit to window': 'sc.fit', 'Scroll zoom': 'sc.scroll-zoom',
    };
    document.querySelectorAll('.shortcut-desc').forEach((el, i) => {
      const enText = (EN_SNAPSHOT['sc-desc-idx:' + i] || '').replace(/<[^>]*>/g, '').trim();
      const key = scDescMap[enText];
      if (key) { const val = t(key, lang); if (val !== null) el.innerHTML = val; }
    });

    // All special elements with icons
    applySpecialTranslations(lang);

    updateLangButtons(lang);

    // Notify converters.js
    if (typeof window.__convApplyLang === 'function') window.__convApplyLang(lang);
  }

  /* ── Update lang switcher button styles ──────────────────────────────── */
  function updateLangButtons(lang) {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      const isActive = btn.dataset.lang === lang;
      btn.style.background = isActive ? 'var(--accent)' : 'transparent';
      btn.style.color      = isActive ? '#ffffff' : 'var(--text2)';
    });
  }

  /* ── Special elements: icon + text ──────────────────────────────────── */
  function applySpecialTranslations(lang) {
    const specials = [
      { sel: 'a[href*="forms.gle"]',       key: 'topbar.contact',   icon: 'bi-envelope' },
      { sel: '#btn-tutorials',              key: 'topbar.tutorials', icon: 'bi-play-circle' },
      { sel: '#btn-help',                   key: 'topbar.help',      icon: 'bi-question-circle-fill' },
      { sel: '#btn-shortcuts',              key: 'topbar.shortcuts', icon: 'bi-keyboard', suffix: ' <kbd>?</kbd>' },
      { sel: '#btn-open',                   key: 'topbar.open-pdf',  icon: 'bi-folder2-open' },
      { sel: '#btn-save',                   key: 'topbar.save-pdf',  icon: 'bi-download' },
      { sel: '#btn-drop-open',              key: 'drop.browse-pdf',  icon: 'bi-folder2-open' },
      { sel: '#btn-create-pdf',             key: 'drop.create-pdf',  icon: 'bi-file-earmark-plus' },
      { sel: '#btn-close-pdf',              key: 'panel.close-pdf',  icon: 'bi-x-circle' },
      { sel: '#create-pdf-cancel',          key: 'create.cancel',    icon: null },
      { sel: '#create-pdf-confirm',         key: 'create.confirm',   icon: 'bi-file-earmark-check' },
      { sel: '#free-type-exit',             key: 'freetype.exit',    icon: null },
      { sel: '#help-modal-close-btn',       key: 'help.close',       icon: null },
      { sel: '#shortcuts-modal-close-btn',  key: 'shortcuts.close',  icon: null },
    ];
    specials.forEach(({ sel, key, icon, suffix }) => {
      const el = document.querySelector(sel);
      if (!el) return;
      const val = t(key, lang);
      if (val === null) return;
      el.innerHTML = icon ? `<i class="bi ${icon}"></i> ${val}${suffix || ''}` : (val + (suffix || ''));
    });

    // Tool buttons
    const toolMap = {
      'select': ['tool.select','bi-cursor'], 'text': ['tool.text','bi-fonts'],
      'highlight': ['tool.highlight','bi-highlighter'], 'draw': ['tool.draw','bi-pen'],
      'rect': ['tool.rect','bi-square'], 'circle': ['tool.circle','bi-circle'],
      'erase': ['tool.erase','bi-eraser'],
    };
    document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
      const entry = toolMap[btn.dataset.tool];
      if (!entry) return;
      const val = t(entry[0], lang);
      if (val !== null) btn.innerHTML = `<i class="bi ${entry[1]}"></i> ${val}`;
    });

    const idToolMap = {
      'btn-insert-image': ['tool.image','bi-image'],
      'btn-rotate-cw':    ['tool.rotate-cw','bi-arrow-clockwise'],
      'btn-rotate-ccw':   ['tool.rotate-ccw','bi-arrow-counterclockwise'],
      'btn-clear-ann':    ['tool.clear-page','bi-trash2'],
      'btn-undo':         ['tool.undo','bi-arrow-left-short'],
    };
    Object.entries(idToolMap).forEach(([id, [key, icon]]) => {
      const el = document.getElementById(id);
      if (!el) return;
      const val = t(key, lang);
      if (val !== null) el.innerHTML = `<i class="bi ${icon}"></i> ${val}`;
    });

    // Sidebar header
    const sidebarHdr = document.querySelector('.sidebar-header');
    if (sidebarHdr) {
      const badge = document.getElementById('page-count-badge');
      const val = t('sidebar.pages', lang);
      if (val !== null && badge) sidebarHdr.innerHTML = `${val} <span id="page-count-badge">${badge.textContent}</span>`;
    }

    // Drop sub 2 hint
    const dropSubs = document.querySelectorAll('.drop-sub');
    if (dropSubs[1]) {
      const val = t('drop.create-hint', lang);
      if (val !== null) dropSubs[1].innerHTML = `<i class="bi bi-info-circle" style="color:var(--accent);"></i> ${val}`;
    }

    // View shortcuts button
    const viewScBtn = document.getElementById('btn-shortcuts-panel');
    if (viewScBtn) {
      const val = t('panel.view-shortcuts', lang);
      if (val !== null) viewScBtn.innerHTML = `
        <span style="display:flex;align-items:center;gap:8px;">
          <i class="bi bi-keyboard" style="font-size:15px;color:var(--accent);"></i>${val}
        </span>
        <kbd class="kbd" style="font-size:11px;">?</kbd>`;
    }

    // Modal titles
    const createTitle = document.querySelector('#create-pdf-modal .modal-title');
    if (createTitle) { const val = t('create.title', lang); if (val) createTitle.innerHTML = `<i class="bi bi-file-earmark-plus" style="color:var(--accent)"></i> ${val}`; }

    const helpTitle = document.querySelector('#help-modal .modal-title');
    if (helpTitle) { const val = t('help.title', lang); if (val) helpTitle.innerHTML = `<i class="bi bi-question-circle-fill" style="color:var(--accent)"></i> ${val}`; }

    const scTitle = document.querySelector('#shortcuts-modal .modal-title');
    if (scTitle) { const val = t('shortcuts.title', lang); if (val) scTitle.innerHTML = `<i class="bi bi-keyboard"></i> ${val}`; }

    // Free-type banner
    const ftBanner = document.getElementById('free-type-banner');
    if (ftBanner) {
      const msgSpan = ftBanner.querySelector('span');
      if (msgSpan) { const val = t('freetype.msg', lang); if (val !== null) msgSpan.innerHTML = val; }
    }

    // Help modal body
    applyHelpContent(lang);

    // Text color popup
    applyTextColorPopup(lang);

    // Create modal content
    applyCreateModal(lang);

    // Footer tips
    const scFooterTip = document.querySelector('#shortcuts-modal .modal-footer .modal-footer-tip');
    if (scFooterTip) { const val = t('shortcuts.footer-tip', lang); if (val) scFooterTip.innerHTML = `<i class="bi bi-info-circle" style="color:var(--accent)"></i> ${val}`; }

    const helpFooterTip = document.querySelector('#help-modal .modal-footer .modal-footer-tip');
    if (helpFooterTip) { const val = t('help.footer-tip', lang); if (val) helpFooterTip.innerHTML = `<i class="bi bi-lightbulb" style="color:var(--accent)"></i> ${val}`; }

    // Status bar
    applyStatusBar(lang);

    // File badge
    const badge2 = document.getElementById('file-name-badge');
    if (badge2) {
      const enBadge = EN_SNAPSHOT['file-name-badge'];
      if (enBadge && (enBadge === 'No file' || badge2.textContent === 'No file' ||
          badge2.innerHTML === EN_SNAPSHOT['file-name-badge'])) {
        const val = t('topbar.no-file', lang);
        if (val !== null) badge2.innerHTML = val;
      }
    }

    // Font search placeholder
    const fontSearch2 = document.getElementById('font-picker-search');
    if (fontSearch2) { const val = t('font.search-placeholder', lang); if (val !== null) fontSearch2.placeholder = val; }
  }

  function applyHelpContent(lang) {
    const modal = document.getElementById('help-modal');
    if (!modal) return;
    const body = modal.querySelector('[style*="padding:22px"]') || modal.querySelector('.modal-body');
    if (!body) return;
    const keys = ['help.text-tool-title','help.color-rule-head','help.color-rule-body',
                   'help.step1','help.step2','help.step3','help.step4','help.info-tip'];
    if (!keys.every(k => TRANSLATIONS[k] && TRANSLATIONS[k][lang])) return;
    const [htt,hrh,hrb,s1,s2,s3,s4,tip] = keys.map(k => TRANSLATIONS[k][lang]);
    body.innerHTML = `
      <div style="margin-bottom:20px;">
        <div style="font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--accent);margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px;">
          <i class="bi bi-fonts"></i> ${htt}
        </div>
        <div style="background:var(--surface2);border:1px solid var(--border2);border-radius:10px;padding:16px 18px;display:flex;flex-direction:column;gap:10px;">
          <div style="display:flex;gap:12px;align-items:flex-start;">
            <div style="width:32px;height:32px;flex-shrink:0;border-radius:8px;background:var(--accent-dim);border:1.5px solid var(--accent);display:flex;align-items:center;justify-content:center;font-size:15px;color:var(--accent);"><i class="bi bi-palette2"></i></div>
            <div>
              <div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:4px;">${hrh}</div>
              <div style="font-size:12px;color:var(--text2);line-height:1.6;">${hrb}</div>
            </div>
          </div>
          <div style="height:1px;background:var(--border);"></div>
          <div style="display:flex;flex-direction:column;gap:6px;">
            <div style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--text2);"><i class="bi bi-1-circle" style="color:var(--accent);font-size:14px;"></i> ${s1}</div>
            <div style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--text2);"><i class="bi bi-2-circle" style="color:var(--accent);font-size:14px;"></i> ${s2}</div>
            <div style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--text2);"><i class="bi bi-3-circle" style="color:var(--accent);font-size:14px;"></i> ${s3}</div>
            <div style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--text2);"><i class="bi bi-4-circle" style="color:var(--accent);font-size:14px;"></i> ${s4}</div>
          </div>
          <div style="background:var(--accent-dim);border:1px solid var(--accent-glow);border-radius:7px;padding:10px 12px;font-size:11px;color:var(--text2);display:flex;gap:8px;align-items:flex-start;">
            <i class="bi bi-info-circle" style="color:var(--accent);font-size:13px;flex-shrink:0;margin-top:1px;"></i>
            <span>${tip}</span>
          </div>
        </div>
      </div>`;
  }

  function applyTextColorPopup(lang) {
    const popup = document.getElementById('text-color-popup');
    if (!popup) return;
    const titleEl = popup.querySelector('[style*="bi-fonts"]');
    if (titleEl) { const val = t('textcolor.title', lang); if (val) titleEl.innerHTML = `<i class="bi bi-fonts"></i> ${val}`; }
    popup.querySelectorAll('div').forEach(el => {
      if (el.children.length === 0 && el.textContent.trim() === 'Selected color will be used for both text and border.') {
        const val = t('textcolor.sub', lang); if (val) el.textContent = val;
      }
    });
    const customLabel = [...popup.querySelectorAll('label')].find(l => l.textContent.includes('Custom'));
    if (customLabel) { const val = t('textcolor.custom', lang); if (val) customLabel.textContent = val; }
    const confirmBtn = document.getElementById('text-color-confirm');
    if (confirmBtn) { const val = t('textcolor.confirm', lang); if (val) confirmBtn.innerHTML = `<i class="bi bi-check-lg"></i> ${val}`; }
  }

  function applyCreateModal(lang) {
    const modal = document.getElementById('create-pdf-modal');
    if (!modal) return;
    const labelMap = { 'Page Size': 'create.page-size', 'Orientation': 'create.orientation', 'Number of Pages': 'create.num-pages', 'Page Background': 'create.background' };
    modal.querySelectorAll('[style*="text-transform:uppercase"]').forEach(el => {
      const enSections = JSON.parse(EN_SNAPSHOT['create-modal-sections'] || '[]');
      const idx = [...modal.querySelectorAll('[style*="text-transform:uppercase"]')].indexOf(el);
      const enText = enSections[idx] || el.textContent.trim();
      const key = labelMap[enText];
      if (key) { const val = t(key, lang); if (val) el.textContent = val; }
    });
    modal.querySelectorAll('.pdf-orient-btn').forEach(btn => {
      if (btn.dataset.orient === 'portrait') { const val = t('create.portrait', lang); if (val) btn.innerHTML = `<i class="bi bi-file-earmark"></i> ${val}`; }
      if (btn.dataset.orient === 'landscape') { const val = t('create.landscape', lang); if (val) btn.innerHTML = `<i class="bi bi-file-earmark" style="transform:rotate(90deg);display:inline-block;"></i> ${val}`; }
    });
    const bgLabel = document.getElementById('create-bg-label');
    if (bgLabel) {
      const bgMap = { 'White': 'create.white', 'Cream': 'create.cream', 'Light Gray': 'create.light-gray', 'Dark': 'create.dark' };
      const enBg = EN_SNAPSHOT['create-bg-label'] || bgLabel.textContent.trim();
      const key = bgMap[enBg];
      if (key) { const val = t(key, lang); if (val) bgLabel.textContent = val; }
    }
    const footerTip = modal.querySelector('.modal-footer .modal-footer-tip');
    if (footerTip) { const val = t('create.footer-tip', lang); if (val) footerTip.innerHTML = `<i class="bi bi-cursor-text" style="color:var(--accent)"></i> ${val}`; }
  }

  function applyStatusBar(lang) {
    const toolStatus = document.getElementById('cur-tool-status');
    if (toolStatus) {
      const enContent = EN_SNAPSHOT['cur-tool-status'] || 'Tool: Select';
      const toolName = enContent.replace(/^[^:]*:\s*/, '');
      const statusLabel = t('status.tool', lang);
      const toolNameKeyMap = { 'Select': 'tool.select', 'Text': 'tool.text', 'Highlight': 'tool.highlight', 'Draw': 'tool.draw', 'Rect': 'tool.rect', 'Circle': 'tool.circle', 'Erase': 'tool.erase', 'Image': 'tool.image' };
      const tnKey = toolNameKeyMap[toolName.trim()];
      const tnVal = tnKey ? t(tnKey, lang) : null;
      if (statusLabel) toolStatus.textContent = `${statusLabel}: ${tnVal || toolName}`;
    }
    const pageStatus = document.getElementById('cur-page-status');
    if (pageStatus) {
      const enContent = EN_SNAPSHOT['cur-page-status'] || 'Page: —';
      const pageNum = enContent.replace(/^[^:]*:\s*/, '');
      const val = t('status.page', lang);
      if (val) pageStatus.textContent = `${val}: ${pageNum}`;
    }
  }

  /* ── Build language switcher UI ──────────────────────────────────────── */
  function buildSwitcher() {
    const wrap = document.createElement('div');
    wrap.id = 'lang-switcher';
    wrap.style.cssText = 'display:inline-flex;align-items:center;gap:2px;background:var(--surface2);border:1px solid var(--border2);border-radius:8px;padding:2px;flex-shrink:0;';
    Object.entries(LANGUAGES).forEach(([code, info]) => {
      const btn = document.createElement('button');
      btn.className = 'lang-btn';
      btn.dataset.lang = code;
      btn.title = info.name;
      btn.textContent = info.label;
      btn.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;padding:3px 7px;border-radius:6px;border:none;background:transparent;color:var(--text2);font-family:var(--font-body);font-size:11px;font-weight:700;cursor:pointer;transition:all .12s;white-space:nowrap;line-height:1;';
      btn.addEventListener('mouseenter', () => { if (btn.dataset.lang !== currentLang) { btn.style.background = 'var(--accent-dim)'; btn.style.color = 'var(--accent)'; }});
      btn.addEventListener('mouseleave', () => { if (btn.dataset.lang !== currentLang) { btn.style.background = 'transparent'; btn.style.color = 'var(--text2)'; }});
      btn.addEventListener('click', () => applyTranslations(code));
      wrap.appendChild(btn);
    });
    const topbarRight = document.querySelector('.topbar-right');
    const firstSep = topbarRight ? topbarRight.querySelector('.topbar-sep') : null;
    if (topbarRight && firstSep) topbarRight.insertBefore(wrap, firstSep);
    else if (topbarRight) topbarRight.prepend(wrap);
    updateLangButtons(currentLang);
  }

  /* ── Init ────────────────────────────────────────────────────────────── */
  function init() {
    buildSwitcher();
    // Always snapshot English FIRST before any translation
    saveEnglishSnapshot();
    enhancedSnapshot();
    // Now apply saved language if not English
    if (currentLang !== 'en') {
      applyTranslations(currentLang);
    } else {
      updateLangButtons('en');
    }
    // Re-apply on modal open for dynamically shown content
    document.addEventListener('click', function(e) {
      const t2 = e.target;
      const triggers = ['btn-help','btn-shortcuts','btn-shortcuts-panel','btn-create-pdf','btn-drop-open'];
      const hit = triggers.some(id => t2.id === id || t2.closest('#' + id));
      if (hit && currentLang !== 'en') setTimeout(() => applySpecialTranslations(currentLang), 80);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 150);
  }

})();
