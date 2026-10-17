// Génère doc/store_listings/nouveautes-1.0.5.json (locale ASC → texte) à partir des libellés réels de l'app.
const fs = require('fs');
const T = {
  fr: '• Réglages : « {rate} » et « {other} ».\n• Nombre de foulées correctement accordé en russe, polonais, tchèque, arabe et roumain.',
  en: '• Settings: “{rate}” and “{other}”.\n• Stride counts now agree correctly in Russian, Polish, Czech, Arabic and Romanian.',
  de: '• Einstellungen: „{rate}“ und „{other}“.\n• Die Zahl der Galoppsprünge wird auf Russisch, Polnisch, Tschechisch, Arabisch und Rumänisch jetzt richtig gebeugt.',
  es: '• Ajustes: «{rate}» y «{other}».\n• El número de trancos ahora concuerda correctamente en ruso, polaco, checo, árabe y rumano.',
  it: '• Impostazioni: «{rate}» e «{other}».\n• Il numero di tempi ora è accordato correttamente in russo, polacco, ceco, arabo e rumeno.',
  pt: '• Definições: «{rate}» e «{other}».\n• O número de lances passa a concordar corretamente em russo, polaco, checo, árabe e romeno.',
  nl: '• Instellingen: ‘{rate}’ en ‘{other}’.\n• Het aantal galopsprongen wordt nu correct verbogen in het Russisch, Pools, Tsjechisch, Arabisch en Roemeens.',
  da: '• Indstillinger: »{rate}« og »{other}«.\n• Antallet af galopspring bøjes nu korrekt på russisk, polsk, tjekkisk, arabisk og rumænsk.',
  no: '• Innstillinger: «{rate}» og «{other}».\n• Antall galoppsprang bøyes nå riktig på russisk, polsk, tsjekkisk, arabisk og rumensk.',
  sv: '• Inställningar: ”{rate}” och ”{other}”.\n• Antalet galoppsprång böjs nu korrekt på ryska, polska, tjeckiska, arabiska och rumänska.',
  fi: '• Asetukset: ”{rate}” ja ”{other}”.\n• Laukka-askelten määrä taipuu nyt oikein venäjäksi, puolaksi, tšekiksi, arabiaksi ja romaniaksi.',
  pl: '• Ustawienia: „{rate}” i „{other}”.\n• Liczba cwałów jest teraz poprawnie odmieniana po rosyjsku, polsku, czesku, arabsku i rumuńsku.',
  cs: '• Nastavení: „{rate}“ a „{other}“.\n• Počet cvalových skoků se nyní správně skloňuje v ruštině, polštině, češtině, arabštině a rumunštině.',
  hu: '• Beállítások: „{rate}” és „{other}”.\n• A vágtaugrások száma mostantól helyesen jelenik meg orosz, lengyel, cseh, arab és román nyelven.',
  el: '• Ρυθμίσεις: «{rate}» και «{other}».\n• Ο αριθμός διασκελισμών κλίνεται πλέον σωστά στα ρωσικά, πολωνικά, τσεχικά, αραβικά και ρουμανικά.',
  ru: '• Настройки: «{rate}» и «{other}».\n• Число темпов теперь правильно согласуется на русском, польском, чешском, арабском и румынском.',
  tr: '• Ayarlar: “{rate}” ve “{other}”.\n• Fule sayısı artık Rusça, Lehçe, Çekçe, Arapça ve Rumencede doğru çekimleniyor.',
  ar: '• الإعدادات: «{rate}» و«{other}».\n• أصبح عدد الوثبات يُصاغ بشكل صحيح بالروسية والبولندية والتشيكية والعربية والرومانية.',
  ro: '• Setări: „{rate}” și „{other}”.\n• Numărul de fulee se acordă acum corect în rusă, poloneză, cehă, arabă și română.',
  hi: '• सेटिंग्स: “{rate}” और “{other}”।\n• रूसी, पोलिश, चेक, अरबी और रोमानियाई में स्ट्राइड की संख्या अब सही व्याकरण के साथ दिखती है।',
  ja: '• 設定：「{rate}」と「{other}」を追加。\n• ロシア語、ポーランド語、チェコ語、アラビア語、ルーマニア語で完歩数の表記を修正。',
  ko: "• 설정: '{rate}' 및 '{other}' 추가.\n• 러시아어, 폴란드어, 체코어, 아랍어, 루마니아어에서 완보 수 표기를 바로잡았습니다.",
  zh: '• 设置：新增“{rate}”和“{other}”。\n• 修正了俄语、波兰语、捷克语、阿拉伯语和罗马尼亚语中步数的语法。',
  th: '• การตั้งค่า: “{rate}” และ “{other}”\n• แก้ไขรูปพหูพจน์ของจำนวนก้าวในภาษารัสเซีย โปแลนด์ เช็ก อาหรับ และโรมาเนีย',
  vi: '• Cài đặt: “{rate}” và “{other}”.\n• Số sải bước nay được chia đúng ngữ pháp trong tiếng Nga, Ba Lan, Séc, Ả Rập và Rumani.',
};
// 1.0.5 : demandes d'autorisation traduites (texte de la fenêtre système iOS).
const P = {
  fr: '• Les demandes d’accès à la caméra, au micro et aux photos s’affichent désormais dans ta langue.',
  en: '• Camera, microphone and photo access requests now appear in your language.',
  de: '• Anfragen für Kamera-, Mikrofon- und Fotozugriff erscheinen jetzt in deiner Sprache.',
  es: '• Las solicitudes de acceso a la cámara, el micrófono y las fotos aparecen ahora en tu idioma.',
  it: '• Le richieste di accesso a fotocamera, microfono e foto ora compaiono nella tua lingua.',
  pt: '• Os pedidos de acesso à câmara, ao microfone e às fotos aparecem agora no teu idioma.',
  nl: '• Verzoeken om toegang tot camera, microfoon en foto’s verschijnen nu in je eigen taal.',
  da: '• Anmodninger om adgang til kamera, mikrofon og billeder vises nu på dit sprog.',
  no: '• Forespørsler om tilgang til kamera, mikrofon og bilder vises nå på ditt språk.',
  sv: '• Förfrågningar om åtkomst till kamera, mikrofon och bilder visas nu på ditt språk.',
  fi: '• Kameran, mikrofonin ja kuvien käyttöpyynnöt näkyvät nyt omalla kielelläsi.',
  pl: '• Prośby o dostęp do aparatu, mikrofonu i zdjęć wyświetlają się teraz w Twoim języku.',
  cs: '• Žádosti o přístup ke kameře, mikrofonu a fotkám se nyní zobrazují ve tvém jazyce.',
  hu: '• A kamera-, mikrofon- és fotóhozzáférési kérések mostantól a saját nyelveden jelennek meg.',
  el: '• Τα αιτήματα πρόσβασης σε κάμερα, μικρόφωνο και φωτογραφίες εμφανίζονται πλέον στη γλώσσα σου.',
  ru: '• Запросы доступа к камере, микрофону и фото теперь показываются на твоём языке.',
  tr: '• Kamera, mikrofon ve fotoğraf erişim istekleri artık kendi dilinde görünüyor.',
  ar: '• تظهر طلبات الوصول إلى الكاميرا والميكروفون والصور الآن بلغتك.',
  ro: '• Cererile de acces la cameră, microfon și fotografii apar acum în limba ta.',
  hi: '• कैमरा, माइक्रोफ़ोन और फ़ोटो की अनुमति के अनुरोध अब आपकी भाषा में दिखते हैं।',
  ja: '• カメラ・マイク・写真へのアクセス許可の表示が、使用言語で表示されるようになりました。',
  ko: '• 카메라, 마이크, 사진 접근 요청이 이제 사용 언어로 표시됩니다.',
  zh: '• 相机、麦克风和照片的访问请求现在以你的语言显示。',
  th: '• คำขอเข้าถึงกล้อง ไมโครโฟน และรูปภาพ แสดงเป็นภาษาของคุณแล้ว',
  vi: '• Yêu cầu truy cập camera, micrô và ảnh nay hiển thị bằng ngôn ngữ của bạn.',
};const asc = { 'ar-SA': 'ar', cs: 'cs', da: 'da', 'de-DE': 'de', el: 'el', 'en-AU': 'en', 'en-GB': 'en', 'en-US': 'en', 'es-ES': 'es', 'es-MX': 'es', fi: 'fi', 'fr-CA': 'fr', 'fr-FR': 'fr', hi: 'hi', hu: 'hu', it: 'it', ja: 'ja', ko: 'ko', 'nl-NL': 'nl', no: 'no', pl: 'pl', 'pt-PT': 'pt', ro: 'ro', ru: 'ru', sv: 'sv', th: 'th', tr: 'tr', vi: 'vi', 'zh-Hans': 'zh' };
const out = {};
for (const [loc, l] of Object.entries(asc)) {
  const s = JSON.parse(fs.readFileSync(`src/i18n/locales/${l}.json`, 'utf8')).settings;
  if (!T[l] || !s.rateApp || !s.otherApps) throw new Error('manque ' + loc);
  out[loc] = T[l].replace('{rate}', s.rateApp).replace('{other}', s.otherApps) + '\n' + P[l];
}
fs.writeFileSync('doc/store_listings/nouveautes-1.0.5.json.tmp', JSON.stringify(out, null, 2) + '\n', 'utf8');
fs.renameSync('doc/store_listings/nouveautes-1.0.5.json.tmp', 'doc/store_listings/nouveautes-1.0.5.json');
console.log(Object.keys(out).length, 'locales'); console.log(out['fr-FR']); console.log(out['ar-SA']);
