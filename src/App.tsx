import { useState, useEffect, createContext, useContext, useRef, useCallback } from "react";

// ─────────────────────────────────────────────
// API BASE URL
// ─────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || "";

// ─────────────────────────────────────────────
// TRANSLATION API
// ─────────────────────────────────────────────
const TRANSLATE_API = `${API_BASE}/api/translate`;
const translationCache = new Map();

async function translateText(text, targetLocale) {
  if (!text || targetLocale.startsWith("en")) return text;
  
  const cacheKey = `${text}:${targetLocale}`;
  if (translationCache.has(cacheKey)) return translationCache.get(cacheKey);
  
  try {
    const res = await fetch(TRANSLATE_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, target_locale: targetLocale })
    });
    if (!res.ok) return text;
    const data = await res.json();
    // Only cache if translation actually changed
    if (data.translated && data.translated !== text) {
      translationCache.set(cacheKey, data.translated);
      return data.translated;
    }
    return text;
  } catch (e) {
    console.error("Translation error:", e);
    return text;
  }
}

// Custom hook for translating content
function useTranslatedText(text, locale) {
  const [translated, setTranslated] = useState(text);
  
  useEffect(() => {
    let cancelled = false;
    if (locale.startsWith("en")) {
      setTranslated(text);
      return;
    }
    translateText(text, locale).then(t => {
      if (!cancelled) setTranslated(t);
    });
    return () => { cancelled = true; };
  }, [text, locale]);
  
  return translated;
}

// Component for translated text
function TranslatedText({ text, locale }) {
  const translated = useTranslatedText(text, locale);
  return <>{translated}</>;
}

// ─────────────────────────────────────────────
// ADMIN CONFIG
// ─────────────────────────────────────────────
const SUPER_ADMINS = [
  "admin@shapersheds.com",
  "hello@shapersheds.com",
];

const isAdmin = email => SUPER_ADMINS.map(e => e.toLowerCase()).includes((email||"").toLowerCase());

// ─────────────────────────────────────────────
// LOCALISATION
// ─────────────────────────────────────────────
const LOCALES = [
  { code:"en-AU", flag:"🇦🇺", label:"Australia",   lang:"English",    dir:"ltr" },
  { code:"en-US", flag:"🇺🇸", label:"USA",          lang:"English",    dir:"ltr" },
  { code:"en-GB", flag:"🇬🇧", label:"UK",           lang:"English",    dir:"ltr" },
  { code:"en-NZ", flag:"🇳🇿", label:"New Zealand",  lang:"English",    dir:"ltr" },
  { code:"pt-BR", flag:"🇧🇷", label:"Brasil",       lang:"Português",  dir:"ltr" },
  { code:"pt-PT", flag:"🇵🇹", label:"Portugal",     lang:"Português",  dir:"ltr" },
  { code:"fr",    flag:"🇫🇷", label:"France",       lang:"Français",   dir:"ltr" },
  { code:"es",    flag:"🇪🇸", label:"España",       lang:"Español",    dir:"ltr" },
  { code:"de",    flag:"🇩🇪", label:"Deutschland",  lang:"Deutsch",    dir:"ltr" },
  { code:"ja",    flag:"🇯🇵", label:"日本",          lang:"日本語",      dir:"ltr" },
  { code:"ko",    flag:"🇰🇷", label:"한국",          lang:"한국어",      dir:"ltr" },
];

const T = {
  "nav.add":"Add a Shaper","nav.submit":"Submit a Shaper","nav.saved":"Saved","nav.signin":"Sign in","nav.join":"Join Free","nav.admin":"Admin",
  "home.featured":"Featured","home.empty":"No shapers found — try a different search or filter.","home.search":"Search","home.filters":"Filters","home.allListings":"All Listings","home.clearFilters":"Clear filters","home.searchPlaceholder":"Search shapers, locations, board types…","home.country":"Country","home.allCountries":"All Countries","home.changeImage":"🖼 Change Image",
  "hero.headline":"The World's Best Shapers,","hero.sub":"all in one place.","hero.desc":"A surfer community-built directory of surfboard shapers and glassers from around the world.","hero.uploadHint":"Upload a hero image via Admin",
  "listing.back":"← Back to directory","listing.save":"Save","listing.saved":"Saved","listing.featured":"⭐ Featured","listing.founded":"Est.","listing.founded2":"Founded","listing.website":"Website","listing.boards":"Board Portfolio","listing.knowledge":"Shaping Knowledge","listing.premium":"Premium","listing.country":"Country","listing.location":"Location","listing.type":"Type","listing.instagram":"Instagram","listing.youtube":"Watch","listing.viewWebsite":"View on Website →","listing.premiumBadge":"Premium Profile","listing.noPremium":"This shaper hasn't upgraded to Premium yet.","listing.signinToSave":"Sign in to save",
  "reviews.title":"What people are saying","reviews.add":"＋ Add a Review","reviews.signinCta":"Sign in to leave a review","reviews.seeAll":"See all reviews →","reviews.submit":"Submit Review","reviews.modNote":"Reviews are moderated before going live — usually within 24 hours.","reviews.rating":"Rating *","reviews.whichBoard":"Which board? (optional)","reviews.yourReview":"Your review *","reviews.yourName":"Your name (optional)","reviews.submitted":"✓ Review submitted — it'll appear once approved.","reviews.seeAllOf":"See all","reviews.reviewsOf":"reviews →","reviews.of":"Reviews —","reviews.review":"review","reviews.reviews":"reviews",
  "ask.title":"Ask a Shaper","ask.submit":"Submit Question","ask.namePlaceholder":"Your name (optional)","ask.questionPlaceholder":"What do you want to ask","ask.submitBtn":"Ask →","ask.questions":"questions","ask.toPropose":"to propose a live session","ask.submitted":"✓ Question submitted — it'll go live once reviewed.","ask.reviewNote":"Questions are reviewed before going live · Upvote questions you want answered","ask.askTitle":"Ask","ask.atTarget":"🎉 We've hit {n} questions — we're reaching out to propose a live Q&A session!","ask.nearTarget":"Almost there — {n} more questions and we'll propose a live stream.","ask.defaultSub":"Ask anything about shaping, boards, or the craft. When we hit {n} questions, we'll propose a live session.",
  "sub.title":"Who are you adding?","sub.name":"Name","sub.craft":"Craft","sub.craftAll":"All","sub.details":"The details","sub.about":"About them, or your experience of their work","sub.yourInfo":"Almost done","sub.firstName":"First Name","sub.lastName":"Last Name","sub.email":"Email","sub.relationship":"Relationship","sub.submitBtn":"Submit for Review ✓","sub.success":"Submission received!","sub.browseDir":"Browse Directory","sub.submitAnother":"Submit Another","sub.nextDetails":"Next — The Details →","sub.nextInfo":"Next — Your Info →","sub.back":"← Back","sub.whatNext":"What happens next","sub.nameRequired":"Shaper, Glasser or Business Name *","sub.craftRequired":"What's their craft? *","sub.country":"Country *","sub.town":"Town / Location","sub.website":"Website","sub.instagram":"Instagram handle","sub.yourInfoDesc":"Just your details — so we can follow up and keep you in the loop.","sub.relationshipTo":"Your relationship to","sub.privacyNote":"By submitting, you agree to receive occasional updates from Shaper Shed. Your details are kept private — never shared with third parties.","sub.step1of3":"Step 1 of 3","sub.step2of3":"Step 2 of 3","sub.step3of3":"Step 3 of 3","sub.shaperType":"What do they do?","sub.shaper":"Shaper","sub.shaperDesc":"Shapes custom or production surfboards","sub.glasser":"Glasser","sub.glasserDesc":"Specialises in glassing, tints & finish work","sub.selectAll":"— pick all that apply","sub.aboutPlaceholder":"Tell us about this ","sub.successMsg":"Thanks for adding to the community. We'll review","sub.successGo":"and get them live within 48 hours.","sub.step1a":"We review the listing for accuracy and quality","sub.step2a":"We reach out to the shaper to let them know they're listed","sub.step3a":"It goes live on the directory — usually within 48 hours","sub.step4a":"Shapers can upgrade to Premium to unlock videos, boards and more",
  "auth.welcomeBack":"Welcome back","auth.signinDesc":"Sign in to save listings and contribute to the directory.","auth.joinTitle":"Join Shaper Shed","auth.joinDesc":"Free account — save listings, write reviews, and help build the world's best shaper directory.","auth.password":"Password","auth.heard":"How did you hear about us?","auth.lookingFor":"What are you looking for?","auth.createAccount":"Create Free Account","auth.noAccount":"No account? Join free","auth.joinFree":"Join Free","auth.alreadyMember":"Already a member? Sign in","auth.signIn":"Sign In",
  "profile.contributions":"Contributions","profile.reviews":"Reviews","profile.nominated":"Nominated","profile.signOut":"Sign out","profile.saved":"Saved","profile.activity":"Activity","profile.badges":"Badges","profile.backToDir":"← Back to directory","profile.noSaved":"No saved listings yet.","profile.noActivity":"No activity yet — submit a shaper, write a review, or ask a question to get started.","profile.badgesDesc":"Badges are earned through genuine contributions — they reflect who you are in this community.","profile.memberSince":"Member since","profile.signInPrompt":"Sign in to see your profile.","profile.notYetEarned":"Not yet earned","profile.progressTo":"Progress to","profile.moreContribs":"more contribution","profile.toReach":"to reach",
  "saved.title":"Saved Listings","saved.empty":"Nothing saved yet.","saved.browse":"Browse Directory","saved.subtitle":"Shapers and glassers you've bookmarked.",
  "general.location":"Location","general.country":"Country","general.town":"Town / Location","general.website":"Website","general.instagram":"Instagram","general.cancel":"Cancel","general.select":"Select…",
  "sidebar.categories":"Categories","sidebar.submitCta":"Submit a Shaper",
};

const TRANSLATIONS = {
  "pt-BR": {
    "nav.add":"Adicionar Shaper","nav.submit":"Enviar Recurso","nav.saved":"Salvos","nav.signin":"Entrar","nav.join":"Cadastrar","nav.admin":"Admin",
    "hero.headline":"Os Melhores Shapers do Mundo,","hero.sub":"em um só lugar.","hero.desc":"Um diretório colaborativo de shapers e glassers de todo o mundo.","hero.uploadHint":"Envie uma imagem pelo Admin",
    "home.featured":"Destaque","home.empty":"Nenhum shaper encontrado — tente outra busca.","home.search":"Buscar","home.allListings":"Todos","home.clearFilters":"Limpar filtros","home.searchPlaceholder":"Buscar shapers, locais, tipos de prancha…","home.changeImage":"🖼 Trocar Imagem",
    "listing.back":"← Voltar","listing.save":"Salvar","listing.saved":"Salvo","listing.featured":"⭐ Destaque","listing.website":"Site","listing.boards":"Portfólio","listing.knowledge":"Conhecimento","listing.premium":"Premium","listing.country":"País","listing.location":"Localização","listing.type":"Tipo","listing.youtube":"Assistir","listing.viewWebsite":"Ver no Site →",
    "reviews.title":"O que as pessoas dizem","reviews.add":"＋ Avaliar","reviews.submit":"Enviar Avaliação","reviews.rating":"Nota *","reviews.whichBoard":"Qual prancha? (opcional)","reviews.yourReview":"Sua avaliação *","reviews.yourName":"Seu nome (opcional)","reviews.submitted":"✓ Avaliação enviada.","reviews.modNote":"Avaliações são moderadas antes de serem publicadas.","reviews.reviews":"avaliações","reviews.review":"avaliação","reviews.of":"Avaliações —","reviews.seeAllOf":"Ver todas",
    "auth.welcomeBack":"Bem-vindo de volta","auth.signinDesc":"Entre para salvar e contribuir.","auth.joinTitle":"Cadastre-se","auth.joinDesc":"Conta gratuita — salve, avalie e ajude a construir o diretório.","auth.password":"Senha","auth.createAccount":"Criar Conta","auth.noAccount":"Sem conta? Cadastre-se","auth.joinFree":"Cadastrar","auth.alreadyMember":"Já tem conta? Entre","auth.signIn":"Entrar",
    "sub.title":"Quem você está adicionando?","sub.nameRequired":"Nome *","sub.craftRequired":"O que eles fazem? *","sub.country":"País *","sub.submitBtn":"Enviar ✓","sub.success":"Enviado!","sub.browseDir":"Ver Diretório","sub.submitAnother":"Enviar Outro","sub.nextDetails":"Próximo →","sub.nextInfo":"Próximo →","sub.back":"← Voltar",
    "general.cancel":"Cancelar","general.select":"Selecionar…",
    "profile.signOut":"Sair","profile.saved":"Salvos","profile.contributions":"Contribuições","profile.reviews":"Avaliações","profile.nominated":"Indicados","profile.activity":"Atividade","profile.badges":"Conquistas","profile.signInPrompt":"Entre para ver seu perfil.",
    "saved.title":"Salvos","saved.empty":"Nada salvo ainda.","saved.browse":"Ver Diretório","saved.subtitle":"Shapers e glassers salvos.",
  },
  "fr": {
    "nav.add":"Ajouter un Shaper","nav.submit":"Soumettre","nav.saved":"Sauvegardés","nav.signin":"Connexion","nav.join":"Rejoindre","nav.admin":"Admin",
    "hero.headline":"Les Meilleurs Shapers du Monde,","hero.sub":"au même endroit.","hero.desc":"Un annuaire collaboratif de shapers et glassers du monde entier.","hero.uploadHint":"Téléversez une image via Admin",
    "home.featured":"À la une","home.empty":"Aucun shaper trouvé.","home.allListings":"Tous","home.clearFilters":"Effacer les filtres","home.searchPlaceholder":"Rechercher shapers, lieux, types de planches…","home.changeImage":"🖼 Changer l'image",
    "listing.back":"← Retour","listing.website":"Site web","listing.boards":"Portfolio","listing.knowledge":"Savoir","listing.premium":"Premium","listing.country":"Pays","listing.location":"Lieu","listing.type":"Type","listing.youtube":"Regarder","listing.featured":"⭐ À la une",
    "reviews.title":"Ce que les gens disent","reviews.add":"＋ Ajouter un avis","reviews.submit":"Soumettre","reviews.rating":"Note *","reviews.whichBoard":"Quelle planche ? (optionnel)","reviews.yourReview":"Votre avis *","reviews.yourName":"Votre nom (optionnel)","reviews.submitted":"✓ Avis soumis.","reviews.modNote":"Les avis sont modérés avant publication.","reviews.reviews":"avis","reviews.review":"avis","reviews.of":"Avis —","reviews.seeAllOf":"Voir tout",
    "auth.welcomeBack":"Bon retour","auth.signinDesc":"Connectez-vous pour sauvegarder et contribuer.","auth.joinTitle":"Rejoindre","auth.joinDesc":"Compte gratuit — sauvegardez, évaluez, contribuez.","auth.password":"Mot de passe","auth.createAccount":"Créer un compte","auth.noAccount":"Pas de compte ? Inscrivez-vous","auth.joinFree":"Rejoindre","auth.alreadyMember":"Déjà membre ? Connectez-vous","auth.signIn":"Connexion",
    "general.cancel":"Annuler","general.select":"Sélectionner…",
    "profile.signOut":"Déconnexion","profile.saved":"Sauvegardés","profile.contributions":"Contributions","profile.reviews":"Avis","profile.nominated":"Nominés","profile.activity":"Activité","profile.badges":"Badges","profile.signInPrompt":"Connectez-vous pour voir votre profil.",
    "saved.title":"Sauvegardés","saved.empty":"Rien de sauvegardé.","saved.browse":"Voir l'annuaire","saved.subtitle":"Shapers et glassers sauvegardés.",
  },
  "es": {
    "nav.add":"Añadir Shaper","nav.submit":"Enviar","nav.saved":"Guardados","nav.signin":"Entrar","nav.join":"Unirse","nav.admin":"Admin",
    "hero.headline":"Los Mejores Shapers del Mundo,","hero.sub":"en un solo lugar.","hero.desc":"Un directorio colaborativo de shapers y glassers de todo el mundo.",
    "home.featured":"Destacados","home.empty":"No se encontraron shapers.","home.allListings":"Todos","home.clearFilters":"Limpiar filtros","home.searchPlaceholder":"Buscar shapers, lugares, tipos de tabla…","home.changeImage":"🖼 Cambiar imagen",
    "listing.back":"← Volver","listing.website":"Web","listing.boards":"Portfolio","listing.knowledge":"Conocimiento","listing.premium":"Premium","listing.country":"País","listing.location":"Ubicación","listing.type":"Tipo","listing.youtube":"Ver","listing.featured":"⭐ Destacado",
    "reviews.title":"Lo que dice la gente","reviews.add":"＋ Añadir reseña","reviews.submit":"Enviar","reviews.rating":"Puntuación *","reviews.whichBoard":"¿Qué tabla? (opcional)","reviews.yourReview":"Tu reseña *","reviews.yourName":"Tu nombre (opcional)","reviews.submitted":"✓ Reseña enviada.","reviews.modNote":"Las reseñas se moderan antes de publicarse.","reviews.reviews":"reseñas","reviews.review":"reseña","reviews.of":"Reseñas —","reviews.seeAllOf":"Ver todo",
    "auth.welcomeBack":"Bienvenido de nuevo","auth.password":"Contraseña","auth.createAccount":"Crear cuenta","auth.noAccount":"¿Sin cuenta? Únete","auth.joinFree":"Unirse","auth.alreadyMember":"¿Ya eres miembro? Entra","auth.signIn":"Entrar",
    "general.cancel":"Cancelar","general.select":"Seleccionar…",
    "profile.signOut":"Cerrar sesión","profile.saved":"Guardados","profile.contributions":"Contribuciones","profile.reviews":"Reseñas","profile.nominated":"Nominados","profile.activity":"Actividad","profile.badges":"Insignias","profile.signInPrompt":"Inicia sesión para ver tu perfil.",
    "saved.title":"Guardados","saved.empty":"Nada guardado aún.","saved.browse":"Ver directorio","saved.subtitle":"Shapers y glassers guardados.",
  },
  "de": {
    "nav.add":"Shaper hinzufügen","nav.submit":"Einreichen","nav.saved":"Gespeichert","nav.signin":"Anmelden","nav.join":"Registrieren","nav.admin":"Admin",
    "hero.headline":"Die besten Shaper der Welt,","hero.sub":"an einem Ort.","hero.desc":"Ein gemeinschaftlich erstelltes Verzeichnis von Surfboard-Shapern und Glassern aus aller Welt.",
    "home.featured":"Empfohlen","home.empty":"Keine Shaper gefunden.","home.allListings":"Alle","home.clearFilters":"Filter löschen","home.searchPlaceholder":"Shaper, Orte, Board-Typen suchen…",
    "listing.back":"← Zurück","listing.website":"Website","listing.boards":"Board-Portfolio","listing.knowledge":"Wissen","listing.premium":"Premium","listing.country":"Land","listing.location":"Standort","listing.type":"Typ","listing.youtube":"Ansehen","listing.featured":"⭐ Empfohlen",
    "reviews.title":"Was die Leute sagen","reviews.add":"＋ Bewertung hinzufügen","reviews.submit":"Einreichen","reviews.rating":"Bewertung *","reviews.whichBoard":"Welches Board? (optional)","reviews.yourReview":"Deine Bewertung *","reviews.yourName":"Dein Name (optional)","reviews.submitted":"✓ Bewertung eingereicht.","reviews.modNote":"Bewertungen werden vor der Veröffentlichung moderiert.","reviews.reviews":"Bewertungen","reviews.review":"Bewertung","reviews.of":"Bewertungen —","reviews.seeAllOf":"Alle anzeigen",
    "auth.welcomeBack":"Willkommen zurück","auth.password":"Passwort","auth.createAccount":"Konto erstellen","auth.noAccount":"Kein Konto? Registrieren","auth.joinFree":"Registrieren","auth.alreadyMember":"Bereits Mitglied? Anmelden","auth.signIn":"Anmelden",
    "general.cancel":"Abbrechen","general.select":"Auswählen…",
    "profile.signOut":"Abmelden","profile.saved":"Gespeichert","profile.contributions":"Beiträge","profile.reviews":"Bewertungen","profile.badges":"Abzeichen","profile.signInPrompt":"Melde dich an, um dein Profil zu sehen.",
    "saved.title":"Gespeichert","saved.empty":"Noch nichts gespeichert.","saved.browse":"Verzeichnis durchsuchen","saved.subtitle":"Gespeicherte Shaper und Glasser.",
  },
  "ja": {
    "nav.add":"シェイパーを追加","nav.submit":"登録する","nav.saved":"保存済み","nav.signin":"ログイン","nav.join":"参加する","nav.admin":"管理",
    "hero.headline":"世界最高のシェイパーたちが、","hero.sub":"ここに集結。","hero.desc":"サーファーたちが作り上げた、世界中のサーフボード・シェイパーとグラッサーのディレクトリ。",
    "home.featured":"注目","home.empty":"シェイパーが見つかりません。","home.allListings":"すべて","home.clearFilters":"フィルターをクリア","home.searchPlaceholder":"シェイパー、場所、ボードタイプを検索…",
    "listing.back":"← 戻る","listing.website":"ウェブサイト","listing.boards":"ボードラインナップ","listing.knowledge":"シェイピング知識","listing.premium":"プレミアム","listing.country":"国","listing.location":"場所","listing.type":"タイプ","listing.youtube":"動画を見る","listing.featured":"⭐ 注目",
    "reviews.title":"みんなの声","reviews.add":"＋ レビューを書く","reviews.submit":"送信","reviews.rating":"評価 *","reviews.yourReview":"レビュー *","reviews.yourName":"お名前（任意）","reviews.submitted":"✓ レビューを送信しました。","reviews.reviews":"件のレビュー","reviews.review":"件のレビュー","reviews.of":"レビュー —","reviews.seeAllOf":"すべて見る",
    "auth.welcomeBack":"おかえりなさい","auth.password":"パスワード","auth.createAccount":"アカウントを作成","auth.noAccount":"アカウントをお持ちでない方","auth.joinFree":"参加する","auth.alreadyMember":"すでにメンバーの方","auth.signIn":"ログイン",
    "general.cancel":"キャンセル","general.select":"選択してください…",
    "profile.signOut":"ログアウト","profile.saved":"保存済み","profile.contributions":"貢献","profile.reviews":"レビュー","profile.badges":"バッジ","profile.signInPrompt":"プロフィールを見るにはログインしてください。",
    "saved.title":"保存済み","saved.empty":"まだ何も保存されていません。","saved.browse":"ディレクトリを見る","saved.subtitle":"保存したシェイパーとグラッサー。",
  },
  "ko": {
    "nav.add":"셰이퍼 추가","nav.submit":"제출","nav.saved":"저장됨","nav.signin":"로그인","nav.join":"가입","nav.admin":"관리",
    "hero.headline":"세계 최고의 셰이퍼들이,","hero.sub":"한 곳에 모였습니다.","hero.desc":"서퍼 커뮤니티가 만든 전 세계 서프보드 셰이퍼와 글래서 디렉토리.",
    "home.featured":"추천","home.empty":"셰이퍼를 찾을 수 없습니다.","home.allListings":"전체","home.clearFilters":"필터 초기화","home.searchPlaceholder":"셰이퍼, 지역, 보드 유형 검색…",
    "listing.back":"← 뒤로","listing.website":"웹사이트","listing.boards":"보드 포트폴리오","listing.knowledge":"지식","listing.premium":"프리미엄","listing.country":"국가","listing.location":"위치","listing.type":"유형","listing.youtube":"영상 보기","listing.featured":"⭐ 추천",
    "reviews.title":"사람들의 이야기","reviews.add":"＋ 리뷰 작성","reviews.submit":"제출","reviews.rating":"평점 *","reviews.yourReview":"리뷰 *","reviews.yourName":"이름 (선택)","reviews.submitted":"✓ 리뷰가 제출되었습니다.","reviews.reviews":"개의 리뷰","reviews.review":"개의 리뷰","reviews.of":"리뷰 —","reviews.seeAllOf":"전체 보기",
    "auth.welcomeBack":"다시 오셨군요","auth.password":"비밀번호","auth.createAccount":"계정 만들기","auth.noAccount":"계정이 없으신가요?","auth.joinFree":"가입","auth.alreadyMember":"이미 회원이신가요?","auth.signIn":"로그인",
    "general.cancel":"취소","general.select":"선택하세요…",
    "profile.signOut":"로그아웃","profile.saved":"저장됨","profile.contributions":"기여","profile.reviews":"리뷰","profile.badges":"배지","profile.signInPrompt":"프로필을 보려면 로그인하세요.",
    "saved.title":"저장됨","saved.empty":"아직 저장된 항목이 없습니다.","saved.browse":"디렉토리 보기","saved.subtitle":"저장한 셰이퍼와 글래서.",
  },
};

function t(key, locale) {
  // English locales all use the default T dictionary
  if (!locale || locale.startsWith("en")) return T[key] || key;
  
  // Check exact locale match first
  let dict = TRANSLATIONS[locale];
  
  // Fallback: try language code only (e.g., pt-PT -> pt-BR)
  if (!dict) {
    const lang = locale.split("-")[0];
    const fallback = Object.keys(TRANSLATIONS).find(k => k.startsWith(lang));
    if (fallback) dict = TRANSLATIONS[fallback];
  }
  
  if (dict && dict[key] !== undefined) return dict[key];
  return T[key] || key; // fallback to English
}

// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────

const INITIAL_CATEGORIES = [
  { id: "all",         label: "All" },
  { id: "shortboards", label: "Shortboards" },
  { id: "mid-lengths", label: "Mid Lengths" },
  { id: "twin-fins",   label: "Twin Fins" },
  { id: "longboards",  label: "Longboards" },
  { id: "asyms",       label: "Asyms" },
  { id: "single-fin",  label: "Single Fin" },
  { id: "glassers",    label: "Glassers" },
];

const COUNTRIES = [
  "All Countries",
  "Australia","New Zealand","USA","UK","France","Portugal","Spain",
  "Brazil","South Africa","Japan","Indonesia","Costa Rica","Ireland","Other"
];

const SAMPLE_LISTINGS = [
  {
    id:1, name:"Mill Road Shapes", tagline:"Hand-shaped performance boards out of a small Byron Bay shed since 1997",
    category:["shortboards","mid-lengths"], type:"Shaper", featured:true,
    logo:"🏄", logoColor:"#8B6914", logoUrl:"", website:"https://example.com",
    address:"Byron Bay", country:"Australia", founded:"1997", instagram:"millroadshapes",
    youtube_channel:"UCmillroadshapes", twitter:"millroadshapes",
    bio:"Dave Mills has been shaping boards in his Byron shed for over 25 years. Specialising in high-performance shortboards and mid-lengths, every board is shaped by hand from locally sourced blanks. No two boards are exactly the same.\n\nDave grew up surfing the points and beach breaks of the Northern Rivers and that experience informs every outline and rocker he draws. He's shaped for several QS surfers and a handful of WSL competitors, but his real passion is getting everyday surfers into the right board for where they surf.",
    tags:["Shortboard","Mid Length","Custom","Performance","Hand-shaped"],
    photos:[], approved:true, premium:true,
    youtube:[
      { id:"dQw4w9WgXcQ", title:"Shaping a performance shortboard from blank to finish" },
    ],
    knowledge:[
      { topic:"Rocker", icon:"🌊", summary:"Rocker is the curve of the board from nose to tail. More rocker = more manoeuvrability in steep hollow surf. Less rocker = more speed and better paddle power in smaller, weaker waves. Dave typically runs a low entry rocker with a kicked tail for beach break." },
      { topic:"Concave", icon:"📐", summary:"Concave channels water under the board to generate lift and speed. A single concave under the front foot transitions to a double concave through the fins — this is Dave's standard setup, creating drive off the bottom and release off the top." },
      { topic:"Tail Shape", icon:"🔺", summary:"The tail controls release and pivot. A narrower pintail holds in critical sections but needs more power to turn. Dave uses a squash tail on his everyday boards for the balance of speed and manoeuvrability — and a swallow tail on his twin fins for looseness." },
      { topic:"Outline", icon:"✏️", summary:"Outline is the plan shape of the board viewed from above. A wider nose catches more waves. A fuller outline provides more float and forgiveness. Dave hand-draws every outline with a rocker stick — he believes subtle variations in outline are what make two boards of the same dimensions feel completely different." },
    ],
    boards:[
      { name:"The Dagger", type:"Shortboard", length:'5\'10"–6\'2"', fins:"Thruster", description:"Dave's go-to performance shortboard. Low entry rocker, single to double concave, pulled-in pintail. Built for punchy hollow beach break.", price:"$950" },
      { name:"The River Pig", type:"Mid Length", length:'7\'0"–7\'6"', fins:"2+1", description:"A smooth-riding mid-length with a relaxed rocker and wide point forward. Works in almost any condition — the board Dave recommends for surfers stepping up from a foamie.", price:"$1,100" },
      { name:"The Wedge", type:"Shortboard", length:'5\'8"–6\'0"', fins:"Twin / Quad", description:"Wider, flatter and more forgiving than the Dagger. Designed for everyday surf — loads of speed, easy to paddle, loads of fun.", price:"$920" },
    ],
    reviews:[
      { id:1, author:"Tom R.", location:"Byron Bay", board:"The River Pig", rating:5, text:"Ordered a River Pig after seeing Dave shape one in his shed. The thing paddles like a dream and I'm catching waves I'd never have got on my old shortboard. Dave spent an hour on the phone going through dims before I committed. Couldn't recommend him more highly.", date:"January 2026", approved:true },
      { id:2, author:"Sarah M.", location:"Noosa", board:"The Dagger", rating:5, text:"Third board from Dave and he just keeps getting better. The Dagger I picked up in November is the best board I've ever surfed — holds in critical sections but still snappy off the top. He remembered exactly what I'd said I wanted to fix from my last one.", date:"December 2025", approved:true },
      { id:3, author:"Jake W.", location:"Coolangatta", board:"The Wedge", rating:4, text:"Really fun board for average days. Goes great as a quad. Turnaround was about 6 weeks which is totally reasonable for a hand-shape. Would be 5 stars if the gloss was a bit cleaner but functionally it surfs brilliantly.", date:"November 2025", approved:true },
    ],
  },
  { id:2, name:"Southern Glass Co", tagline:"Premium glassing and colour work for shapers across Victoria", category:["glassers"], type:"Glasser", featured:true, logo:"🪟", logoColor:"#2563eb", logoUrl:"", website:"https://example.com", address:"Torquay", country:"Australia", founded:"2005", instagram:"southernglass", bio:"Southern Glass has been finishing boards for some of Victoria's most respected shapers since 2005. Hot coats, sanded and polished finishes, tints, resin tints, and full colour spray work. Fast 5-day turnaround.", tags:["Glassing","Tints","Colour","Repairs"], photos:[], approved:true, premium:false, youtube:[], boards:[] },
  { id:3, name:"Twin Fin Factory", tagline:"Dedicated twin and fish shapes for driving down the line", category:["twin-fins"], type:"Shaper", featured:true, logo:"🔺", logoColor:"#10b981", logoUrl:"", website:"https://example.com", address:"Noosa Heads", country:"Australia", founded:"2009", instagram:"twinfinfactory", bio:"Everything we shape is a twin fin or fish. We've been obsessed with the feel of a well-tuned twin since 2009 and have shaped over 3,000 boards.", tags:["Twin Fin","Fish","Retro","Custom"], photos:[], approved:true, premium:false, youtube:[], boards:[] },
  { id:4, name:"Channel Islands", tagline:"World-class shortboards and longboards out of Santa Barbara", category:["shortboards","longboards"], type:"Shaper", featured:false, logo:"🌊", logoColor:"#6366f1", logoUrl:"", website:"https://example.com", address:"Santa Barbara", country:"USA", founded:"1969", instagram:"cisurfboards", bio:"Channel Islands Surfboards has been shaping world-class boards since 1969. Home of the legendary Al Merrick, shapers of choice for dozens of world tour surfers.", tags:["Shortboard","Longboard","Performance","WSL"], photos:[], approved:true, premium:false, youtube:[], boards:[] },
  { id:5, name:"Asym Works", tagline:"The most dialled asymmetrical shaper in the southern hemisphere", category:["asyms"], type:"Shaper", featured:false, logo:"⚡", logoColor:"#f97316", logoUrl:"", website:"https://example.com", address:"Margaret River", country:"Australia", founded:"2014", instagram:"asymworks", bio:"Asym Works exists for one reason — to shape the most dialled asymmetrical surfboards on the planet. Building asyms since before they were trendy.", tags:["Asym","Custom","Performance"], photos:[], approved:true, premium:false, youtube:[], boards:[] },
  { id:6, name:"Pukas Surf", tagline:"Basque country shapers crafting boards for the world's best waves", category:["shortboards","mid-lengths"], type:"Shaper", featured:false, logo:"🏔️", logoColor:"#dc2626", logoUrl:"", website:"https://example.com", address:"Zarautz", country:"Spain", founded:"1973", instagram:"pukassurf", bio:"Pukas has been shaping boards in the Basque Country for over 40 years. Their team includes some of the most respected shapers in Europe.", tags:["Shortboard","European","Performance","Basque"], photos:[], approved:true, premium:false, youtube:[], boards:[] },
];

function parseCSV(text) {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line, idx) => {
    const vals = []; let cur = "", inQ = false;
    for (let ch of line) {
      if (ch === '"') { inQ = !inQ; }
      else if (ch === "," && !inQ) { vals.push(cur.trim()); cur = ""; }
      else cur += ch;
    }
    vals.push(cur.trim());
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (vals[i] || "").replace(/^"|"$/g, ""); });
    return {
      id: Date.now() + idx, name: obj.name || "", tagline: obj.tagline || "",
      category: obj.category ? obj.category.split("|").map(s => s.trim()) : ["shortboards"],
      type: obj.type || "Shaper", featured: obj.featured?.toLowerCase() === "true",
      website: obj.website || "", address: obj.address || "", country: obj.country || "",
      bio: obj.bio || "", tags: obj.tags ? obj.tags.split(",").map(s => s.trim()) : [],
      logo: obj.logo_emoji || "🏄", logoColor: obj.logo_color || "#8B6914",
      logoUrl: obj.logo_url || "", photos: [], approved: true,
    };
  }).filter(l => l.name);
}

function escapeCSV(val) {
  const s = String(val ?? "");
  return s.includes(",") || s.includes('"') || s.includes("\n")
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

function rowsToCSV(headers, rows) {
  const head = headers.join(",");
  const body = rows.map(r => headers.map(h => escapeCSV(r[h] ?? "")).join(",")).join("\n");
  return `${head}\n${body}`;
}

function downloadCSV(filename, csv) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

const SHAPERS_HEADERS = ["id","name","tagline","type","category","country","address","website","instagram","founded","bio","tags","logo_emoji","logo_color","logo_url","featured","premium"];
function shapersToCSV(listings) {
  return rowsToCSV(SHAPERS_HEADERS, listings.map(l => ({
    id: l.id, name: l.name, tagline: l.tagline, type: l.type,
    category: (l.category||[]).join("|"), country: l.country||"", address: l.address||"",
    website: l.website||"", instagram: l.instagram||"", founded: l.founded||"",
    bio: l.bio||"", tags: (l.tags||[]).join(","),
    logo_emoji: l.logo||"", logo_color: l.logoColor||"", logo_url: l.logoUrl||"",
    featured: l.featured ? "TRUE" : "FALSE", premium: l.premium ? "TRUE" : "FALSE",
  })));
}
function parseShapersCSV(text) {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g,""));
  return lines.slice(1).map((line, idx) => {
    const vals = []; let cur = "", inQ = false;
    for (let ch of line) {
      if (ch === '"') { inQ = !inQ; }
      else if (ch === "," && !inQ) { vals.push(cur.trim()); cur = ""; }
      else cur += ch;
    }
    vals.push(cur.trim());
    const o = {};
    headers.forEach((h,i) => { o[h] = (vals[i]||"").replace(/^"|"$/g,""); });
    return {
      id: Number(o.id) || Date.now()+idx, name: o.name||"", tagline: o.tagline||"",
      type: o.type||"Shaper", featured: o.featured?.toLowerCase()==="true",
      premium: o.premium?.toLowerCase()==="true",
      category: o.category ? o.category.split("|").map(s=>s.trim()) : ["shortboards"],
      country: o.country||"", address: o.address||"", website: o.website||"",
      instagram: o.instagram||"", founded: o.founded||"", bio: o.bio||"",
      tags: o.tags ? o.tags.split(",").map(s=>s.trim()) : [],
      logo: o.logo_emoji||"🏄", logoColor: o.logo_color||"#8B6914", logoUrl: o.logo_url||"",
      photos:[], approved:true, youtube:[], boards:[], knowledge:[], reviews:[],
    };
  }).filter(l => l.name);
}

const BOARDS_HEADERS = ["shaper_id","shaper_name","board_name","type","length","fins","description","price"];
function boardsToCSV(listings) {
  const rows = [];
  listings.forEach(l => (l.boards||[]).forEach(b => rows.push({
    shaper_id: l.id, shaper_name: l.name,
    board_name: b.name, type: b.type, length: b.length,
    fins: b.fins, description: b.description, price: b.price,
  })));
  return rowsToCSV(BOARDS_HEADERS, rows);
}
function parseBoardsCSV(text, listings) {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return listings;
  const headers = lines[0].split(",").map(h=>h.trim().replace(/^"|"$/g,""));
  const boards = lines.slice(1).map(line => {
    const vals=[]; let cur="",inQ=false;
    for (let ch of line){if(ch==='"'){inQ=!inQ;}else if(ch===","&&!inQ){vals.push(cur.trim());cur="";}else cur+=ch;}
    vals.push(cur.trim());
    const o={}; headers.forEach((h,i)=>{o[h]=(vals[i]||"").replace(/^"|"$/g,"");});
    return o;
  }).filter(o=>o.shaper_id&&o.board_name);
  return listings.map(l => {
    const lb = boards.filter(b => String(b.shaper_id)===String(l.id));
    if (!lb.length) return l;
    return { ...l, boards: lb.map(b=>({ name:b.board_name, type:b.type, length:b.length, fins:b.fins, description:b.description, price:b.price })) };
  });
}

const KNOWLEDGE_HEADERS = ["shaper_id","shaper_name","topic","icon","summary","display_order"];
function knowledgeToCSV(listings) {
  const rows = [];
  listings.forEach(l => (l.knowledge||[]).forEach((k,i) => rows.push({
    shaper_id: l.id, shaper_name: l.name,
    topic: k.topic, icon: k.icon, summary: k.summary, display_order: i+1,
  })));
  return rowsToCSV(KNOWLEDGE_HEADERS, rows);
}
function parseKnowledgeCSV(text, listings) {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return listings;
  const headers = lines[0].split(",").map(h=>h.trim().replace(/^"|"$/g,""));
  const items = lines.slice(1).map(line => {
    const vals=[]; let cur="",inQ=false;
    for (let ch of line){if(ch==='"'){inQ=!inQ;}else if(ch===","&&!inQ){vals.push(cur.trim());cur="";}else cur+=ch;}
    vals.push(cur.trim());
    const o={}; headers.forEach((h,i)=>{o[h]=(vals[i]||"").replace(/^"|"$/g,"");});
    return o;
  }).filter(o=>o.shaper_id&&o.topic);
  return listings.map(l => {
    const lk = items.filter(k=>String(k.shaper_id)===String(l.id)).sort((a,b)=>Number(a.display_order)-Number(b.display_order));
    if (!lk.length) return l;
    return { ...l, knowledge: lk.map(k=>({ topic:k.topic, icon:k.icon, summary:k.summary })) };
  });
}

const REVIEWS_HEADERS = ["id","shaper_id","shaper_name","author","location","board","rating","text","date","approved"];
function reviewsToCSV(listings) {
  const rows = [];
  listings.forEach(l => (l.reviews||[]).forEach(r => rows.push({
    id: r.id, shaper_id: l.id, shaper_name: l.name,
    author: r.author, location: r.location||"", board: r.board||"",
    rating: r.rating, text: r.text, date: r.date,
    approved: r.approved ? "TRUE" : "FALSE",
  })));
  return rowsToCSV(REVIEWS_HEADERS, rows);
}
function parseReviewsCSV(text, listings) {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return listings;
  const headers = lines[0].split(",").map(h=>h.trim().replace(/^"|"$/g,""));
  const items = lines.slice(1).map(line => {
    const vals=[]; let cur="",inQ=false;
    for (let ch of line){if(ch==='"'){inQ=!inQ;}else if(ch===","&&!inQ){vals.push(cur.trim());cur="";}else cur+=ch;}
    vals.push(cur.trim());
    const o={}; headers.forEach((h,i)=>{o[h]=(vals[i]||"").replace(/^"|"$/g,"");});
    return o;
  }).filter(o=>o.shaper_id&&o.text);
  return listings.map(l => {
    const lr = items.filter(r=>String(r.shaper_id)===String(l.id));
    if (!lr.length) return l;
    return { ...l, reviews: lr.map(r=>({ id:Number(r.id)||Date.now(), author:r.author, location:r.location, board:r.board, rating:Number(r.rating)||5, text:r.text, date:r.date, approved:r.approved?.toLowerCase()==="true" })) };
  });
}

const QUESTIONS_HEADERS = ["id","shaper_id","shaper_name","question","submitted_by","upvotes","date","approved"];
function questionsToCSV(listings) {
  const rows = [];
  listings.forEach(l => (l.questions||[]).forEach(q => rows.push({
    id: q.id, shaper_id: l.id, shaper_name: l.name,
    question: q.text, submitted_by: q.name||"", upvotes: q.votes, date: q.date, approved:"TRUE",
  })));
  return rowsToCSV(QUESTIONS_HEADERS, rows);
}

const Ctx = createContext();

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}:root{--bg:#faf9f6;--sf:#fff;--bd:#e6e0d4;--bdl:#f0ebe0;--tx:#1c1a14;--tx2:#6b6555;--txm:#9c9485;--g:#8B6914;--gl:#f5edcf;--gh:#6d5210;--gb:#c9a84c;--fbg:#fffcf0;--fbd:#d4a830;--tag:#f2ede4;--r:12px;--rs:8px;--rl:16px;--sh:0 4px 16px rgba(0,0,0,.08);--shl:0 12px 40px rgba(0,0,0,.14)}body{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--tx);line-height:1.6}.shell{display:flex;flex-direction:column;min-height:100vh}.nav{background:var(--sf);border-bottom:1px solid var(--bd);padding:0 28px;height:64px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:200}.brand{display:flex;align-items:center;gap:12px;cursor:pointer;user-select:none}.brand-logo{width:34px;height:34px;border-radius:8px;object-fit:contain}.brand-text{font-family:'Playfair Display',serif;font-size:20px;color:var(--g);line-height:1}.nav-r{display:flex;gap:8px;align-items:center}.btn{display:inline-flex;align-items:center;gap:6px;padding:8px 18px;border-radius:var(--rs);font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;cursor:pointer;transition:all .15s;border:none;outline:none;line-height:1;text-decoration:none}.bg{background:transparent;color:var(--tx2);border:1px solid transparent}.bg:hover{background:var(--tag);color:var(--tx)}.bo{background:transparent;color:var(--tx);border:1px solid var(--bd)}.bo:hover{border-color:var(--g);color:var(--g)}.bp{background:var(--g);color:#fff;border:1px solid var(--g)}.bp:hover{background:var(--gh)}.bw{background:#fff;color:var(--tx);border:1px solid rgba(255,255,255,.5)}.bw:hover{background:rgba(255,255,255,.92)}.bgw{background:rgba(255,255,255,.12);color:#fff;border:1px solid rgba(255,255,255,.4)}.bgw:hover{background:rgba(255,255,255,.22)}.bsm{padding:6px 12px;font-size:13px}.bxs{padding:4px 10px;font-size:12px}.bap{background:#ecfdf5;color:#065f46;border:1px solid #a7f3d0}.bap:hover{background:#065f46;color:#fff}.brej{background:#fef2f2;color:#dc2626;border:1px solid #fecaca}.brej:hover{background:#dc2626;color:#fff}.bed{background:var(--gl);color:var(--g);border:1px solid var(--gb)}.bed:hover{background:var(--g);color:#fff}.bo-gold{background:transparent;color:var(--g);border:1px solid var(--gb)}.bo-gold:hover{background:var(--gl)}.hero-box{position:relative;width:100%;overflow:hidden;min-height:220px;max-height:300px;display:flex;align-items:flex-end;background:#1a1a1a;}.hero-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 30%;display:block;opacity:.72;}.hero-placeholder{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(135deg,#2a2420 0%,#1a1814 100%);gap:8px;color:rgba(255,255,255,.3);font-size:13px;}.hero-placeholder-icon{font-size:36px;opacity:.3}.hero-overlay{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,.1) 0%,rgba(0,0,0,.55) 100%);}.hero-content{position:relative;z-index:2;width:100%;max-width:1200px;margin:0 auto;padding:20px 28px 24px 48px;display:flex;align-items:flex-end;justify-content:space-between;gap:24px;}.hero-text h1{font-family:'Playfair Display',serif;font-size:32px;font-weight:700;line-height:1.1;color:#fff;margin-bottom:6px;text-shadow:0 2px 12px rgba(0,0,0,.5);}.hero-text h1 em{color:#f0c84a;font-style:italic}.hero-text p{font-size:14px;color:rgba(255,255,255,.78);text-shadow:0 1px 6px rgba(0,0,0,.5);line-height:1.5;max-width:500px;}.hero-btns{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.hero-img-btn{position:absolute;bottom:12px;right:14px;z-index:10;background:rgba(0,0,0,.52);backdrop-filter:blur(8px);color:#fff;border:1px solid rgba(255,255,255,.25);border-radius:var(--rs);padding:5px 11px;font-size:11px;cursor:pointer;font-family:'DM Sans',sans-serif;transition:background .15s;}.hero-img-btn:hover{background:rgba(0,0,0,.72)}

/* ── SEARCH BAR ── */
.search-bar-wrap{background:var(--sf);border-bottom:1px solid var(--bd);padding:12px 28px;position:sticky;top:64px;z-index:100;}
.search-bar-inner{display:flex;gap:10px;align-items:center;max-width:1200px;margin:0 auto;}
.swrap{position:relative;flex:1}.si{width:100%;padding:10px 16px 10px 40px;background:var(--bg);border:1px solid var(--bd);border-radius:var(--r);font-family:'DM Sans',sans-serif;font-size:14px;color:var(--tx);outline:none;transition:border-color .15s}.si:focus{border-color:var(--g);box-shadow:0 0 0 3px rgba(139,105,20,.1)}.si::placeholder{color:var(--txm)}.sico{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--txm);pointer-events:none}

/* ── MAIN LAYOUT with sidebar ── */
.main-layout{display:flex;max-width:1200px;margin:0 auto;width:100%;gap:0;padding:0 28px;}
.sidebar{width:220px;flex-shrink:0;padding:24px 0 24px 0;border-right:1px solid var(--bd);min-height:calc(100vh - 130px);position:sticky;top:130px;align-self:flex-start;}
.sidebar-section-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.09em;color:var(--txm);padding:0 20px;margin-bottom:8px;display:block;}
.sidebar-cat{display:flex;align-items:center;gap:8px;width:100%;padding:8px 20px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;color:var(--tx2);background:none;border:none;cursor:pointer;text-align:left;transition:all .13s;border-radius:0;}
.sidebar-cat:hover{background:var(--gl);color:var(--g);}
.sidebar-cat.on{background:var(--gl);color:var(--g);font-weight:600;border-left:3px solid var(--g);}
.sidebar-cat-count{margin-left:auto;font-size:11px;color:var(--txm);background:var(--tag);padding:1px 7px;border-radius:20px;}
.sidebar-cat.on .sidebar-cat-count{background:var(--g);color:#fff;}
.sidebar-divider{height:1px;background:var(--bd);margin:16px 20px;}
.sidebar-submit-cta{margin:16px 16px 0;padding:12px 14px;background:var(--g);color:#fff;border:none;border-radius:var(--r);font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;width:calc(100% - 32px);text-align:center;transition:background .15s;line-height:1.4;}
.sidebar-submit-cta:hover{background:var(--gh);}
.sidebar-submit-sub{font-size:11px;color:rgba(255,255,255,.7);margin-top:3px;font-weight:400;}

.content-area{flex:1;min-width:0;padding:24px 28px 52px;}

.filter-btn{display:inline-flex;align-items:center;gap:7px;padding:9px 16px;border-radius:var(--r);border:1px solid var(--bd);background:var(--sf);color:var(--tx2);font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;cursor:pointer;transition:all .15s;white-space:nowrap}.filter-btn:hover{border-color:var(--g);color:var(--g)}.filter-btn.active{border-color:var(--g);color:var(--g);background:var(--gl)}.filter-dot{width:7px;height:7px;border-radius:50%;background:var(--g);display:none}.filter-btn.active .filter-dot{display:block}.filter-panel{position:absolute;top:calc(100% + 6px);right:0;z-index:150;background:var(--sf);border:1px solid var(--bd);border-radius:var(--rl);box-shadow:var(--shl);padding:20px 22px;min-width:300px;}.fp-section{margin-bottom:18px}.fp-section:last-child{margin-bottom:0}.fp-label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:var(--txm);margin-bottom:10px;display:block}.fp-options{display:flex;flex-wrap:wrap;gap:7px}.fp-chip{padding:5px 12px;border-radius:20px;border:1px solid var(--bd);background:var(--sf);color:var(--tx2);font-size:12.5px;cursor:pointer;transition:all .13s;font-family:'DM Sans',sans-serif}.fp-chip:hover{border-color:var(--g);color:var(--g)}.fp-chip.on{background:var(--g);color:#fff;border-color:var(--g)}.fp-footer{display:flex;justify-content:space-between;align-items:center;padding-top:14px;border-top:1px solid var(--bdl);margin-top:4px}.fp-clear{font-size:13px;color:var(--txm);cursor:pointer;background:none;border:none;font-family:'DM Sans',sans-serif}.fp-clear:hover{color:var(--g)}.pb{padding:26px 32px 52px;max-width:1200px;margin:0 auto;width:100%}.sh{display:flex;align-items:baseline;gap:10px;margin-bottom:14px}.st{font-family:'Playfair Display',serif;font-size:22px}.sc{font-size:12px;color:var(--txm);background:var(--tag);padding:2px 8px;border-radius:20px}.sdiv{height:1px;background:var(--bd);margin:6px 0 26px}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(265px,1fr));gap:14px;margin-bottom:36px}.card{background:var(--sf);border:1px solid var(--bd);border-radius:var(--r);padding:18px;cursor:pointer;transition:all .18s;position:relative;display:flex;flex-direction:column;gap:10px}.card:hover{border-color:#ccc4b0;box-shadow:var(--sh);transform:translateY(-2px)}.card.feat{border-color:var(--fbd);background:var(--fbg)}.card.feat:hover{border-color:#b8891e}.fbadge{position:absolute;top:12px;right:12px;font-size:10.5px;font-weight:600;color:#7a5410;background:#fef3c7;border:1px solid #f0c84a;padding:2px 8px;border-radius:20px}.ctop{display:flex;align-items:flex-start;gap:12px}.cinfo{flex:1;min-width:0}.cname{font-weight:600;font-size:15px;margin-bottom:3px;padding-right:56px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ctag{font-size:13px;color:var(--tx2);line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.cfoot{display:flex;align-items:center;gap:6px;flex-wrap:wrap}.ptyp{font-size:11px;color:var(--g);background:var(--gl);padding:3px 9px;border-radius:20px;border:1px solid var(--gb)}.ptag{font-size:11px;color:var(--tx2);background:var(--tag);padding:3px 8px;border-radius:20px;border:1px solid var(--bdl)}.preg{font-size:11px;color:var(--txm)}.lp{padding:28px 32px;max-width:840px;margin:0 auto}.backbtn{display:inline-flex;align-items:center;gap:6px;font-size:14px;color:var(--tx2);cursor:pointer;margin-bottom:22px;background:none;border:none;font-family:'DM Sans';transition:color .12s}.backbtn:hover{color:var(--g)}.lhead{background:var(--sf);border:1px solid var(--bd);border-radius:var(--rl);padding:32px;margin-bottom:16px}.ltop{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:20px}.llogoname{display:flex;align-items:center;gap:16px}.lname{font-family:'Playfair Display',serif;font-size:26px;margin-bottom:4px}.ltag{font-size:15px;color:var(--tx2)}.bmbtn{background:var(--tag);border:1px solid var(--bd);border-radius:var(--rs);width:38px;height:38px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:17px;transition:all .15s}.bmbtn:hover,.bmbtn.on{background:var(--gl);border-color:var(--g)}.lmeta{background:var(--bg);border:1px solid var(--bdl);border-radius:var(--rs);padding:16px 20px;display:flex;gap:28px;flex-wrap:wrap;margin-bottom:20px}.mi{display:flex;flex-direction:column;gap:4px}.mil{font-size:10.5px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:var(--txm)}.miv{font-size:14px}.micats{display:flex;gap:6px;flex-wrap:wrap}.micat{font-size:12px;padding:3px 10px;background:var(--gl);color:var(--g);border-radius:20px;cursor:pointer}.micat:hover{background:#e8d8a0}.lsec{background:var(--sf);border:1px solid var(--bd);border-radius:var(--rl);padding:28px 32px;margin-bottom:14px}.lsec h3{font-family:'Playfair Display',serif;font-size:18px;margin-bottom:12px}.lbio{font-size:15px;color:var(--tx2);line-height:1.8}.ltags{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}.ltag2{font-size:13px;color:var(--tx2);background:var(--tag);border:1px solid var(--bdl);padding:5px 12px;border-radius:20px}.ov{position:fixed;inset:0;background:rgba(0,0,0,.42);z-index:300;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);padding:20px}.modal{background:var(--sf);border-radius:var(--rl);padding:36px;width:100%;max-width:500px;position:relative;box-shadow:var(--shl);max-height:92vh;overflow-y:auto}.modal.wide{max-width:680px}.mclose{position:absolute;top:14px;right:14px;background:var(--tag);border:1px solid var(--bd);border-radius:6px;width:30px;height:30px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:15px;color:var(--tx2)}.modal h2{font-family:'Playfair Display',serif;font-size:24px;margin-bottom:6px}.modal>p{font-size:14px;color:var(--tx2);margin-bottom:22px}.fg{margin-bottom:14px}.fl{display:block;font-size:13px;font-weight:500;margin-bottom:5px}.fi,.fs,.ft{width:100%;padding:9px 13px;background:var(--bg);border:1px solid var(--bd);border-radius:var(--rs);font-family:'DM Sans',sans-serif;font-size:14px;color:var(--tx);outline:none;transition:border-color .15s}.fi:focus,.fs:focus,.ft:focus{border-color:var(--g);box-shadow:0 0 0 3px rgba(139,105,20,.1)}.ft{resize:vertical;min-height:90px}.f2{display:grid;grid-template-columns:1fr 1fr;gap:12px}.fbtn{width:100%;padding:12px;font-size:15px;margin-top:6px;justify-content:center}.swlnk{text-align:center;font-size:13px;color:var(--tx2);margin-top:14px}.swlnk span{color:var(--g);cursor:pointer;font-weight:500}.subp{padding:36px 32px;max-width:700px;margin:0 auto}.pgh{margin-bottom:26px}.pgh h1{font-family:'Playfair Display',serif;font-size:30px;margin-bottom:8px}.pgh p{font-size:15px;color:var(--tx2)}.fcard{background:var(--sf);border:1px solid var(--bd);border-radius:var(--rl);padding:30px}.fsec{border-top:1px solid var(--bd);padding-top:20px;margin-top:6px}.fsec h4{font-size:15px;font-weight:600;margin-bottom:14px}.okban{background:var(--gl);border:1px solid var(--gb);border-radius:var(--r);padding:20px 24px;display:flex;align-items:flex-start;gap:14px;font-size:14px;color:var(--g)}.adp{padding:28px 32px;max-width:960px;margin:0 auto}.adp h1{font-family:'Playfair Display',serif;font-size:28px;margin-bottom:4px}.addesc{font-size:14px;color:var(--tx2);margin-bottom:22px}.atabs{display:flex;gap:4px;margin-bottom:22px;flex-wrap:wrap}.atab{padding:8px 18px;border-radius:var(--rs);font-size:14px;font-weight:500;cursor:pointer;border:1px solid var(--bd);background:transparent;color:var(--tx2);font-family:'DM Sans';transition:all .12s}.atab:hover{background:var(--tag)}.atab.on{background:var(--tx);color:#fff;border-color:var(--tx)}.acard{background:var(--sf);border:1px solid var(--bd);border-radius:var(--r);padding:18px 20px;margin-bottom:10px;display:flex;align-items:flex-start;justify-content:space-between;gap:16px}.ainfo h4{font-size:15px;font-weight:600;margin-bottom:3px;display:flex;align-items:center;gap:10px}.ainfo p{font-size:13px;color:var(--tx2)}.ainfo .sub{font-size:12px;color:var(--txm);margin-top:5px}.aacts{display:flex;gap:8px;align-items:center;flex-shrink:0;flex-wrap:wrap;justify-content:flex-end}.togrow{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--tx2);cursor:pointer;margin-top:6px;user-select:none}.tog{width:36px;height:20px;border-radius:10px;background:var(--bd);position:relative;transition:background .2s;flex-shrink:0}.tog.on{background:var(--g)}.tog::after{content:'';position:absolute;width:14px;height:14px;background:#fff;border-radius:50%;top:3px;left:3px;transition:left .2s;box-shadow:0 1px 3px rgba(0,0,0,.2)}.tog.on::after{left:19px}.hero-upload-zone{border:2px dashed var(--bd);border-radius:var(--r);padding:28px;text-align:center;cursor:pointer;transition:all .15s;margin-bottom:14px}.hero-upload-zone:hover,.hero-upload-zone.drag{border-color:var(--g);background:var(--gl)}.huz-ico{font-size:36px;margin-bottom:8px}.huz-p{font-size:15px;font-weight:500;margin-bottom:3px}.huz-s{font-size:13px;color:var(--txm)}.current-hero-preview{width:100%;height:140px;object-fit:cover;border-radius:var(--rs);margin-bottom:12px;border:1px solid var(--bd)}.imghint{font-size:12px;color:var(--txm);margin-top:6px;line-height:1.6}.cmlist{display:flex;flex-direction:column;gap:8px;margin-bottom:16px}.cmitem{display:flex;align-items:center;gap:10px;background:var(--sf);border:1px solid var(--bd);border-radius:var(--rs);padding:10px 14px}.cmh{color:var(--txm);font-size:18px;user-select:none}.cmi{flex:1;border:none;background:transparent;font-family:'DM Sans',sans-serif;font-size:14px;color:var(--tx);outline:none}.cmi:focus{color:var(--g)}.cmid{font-size:11px;color:var(--txm);font-family:monospace}.cmadd{display:flex;gap:10px}.cmadd input{flex:1}.dz{border:2px dashed var(--bd);border-radius:var(--r);padding:32px;text-align:center;cursor:pointer;transition:all .15s;margin-bottom:16px}.dm-wrap{border:1px solid var(--bd);border-radius:var(--r);margin-top:24px;overflow:hidden}.dm-toggle{width:100%;background:var(--sf);border:none;padding:16px 20px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;color:var(--tx);border-top:1px solid var(--bdl)}.dm-toggle:first-child{border-top:none}.dm-toggle:hover{background:var(--bg)}.dm-toggle-arrow{font-size:12px;color:var(--txm);transition:transform .2s}.dm-toggle.open .dm-toggle-arrow{transform:rotate(180deg)}.dm-body{padding:20px;border-top:1px solid var(--bdl);background:var(--bg);display:flex;flex-direction:column;gap:14px}.dm-db{background:var(--sf);border:1px solid var(--bd);border-radius:var(--r);padding:16px 18px}.dm-db-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;gap:8px;flex-wrap:wrap}.dm-db-title{font-size:14px;font-weight:600;color:var(--tx)}.dm-db-meta{font-size:12px;color:var(--txm)}.dm-db-desc{font-size:12px;color:var(--tx2);margin-bottom:12px;line-height:1.6}.dm-db-cols{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:12px}.dm-db-col{font-size:11px;font-family:monospace;background:var(--tag);border:1px solid var(--bdl);padding:2px 7px;border-radius:4px;color:var(--g)}.dm-actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.dm-dropzone{border:2px dashed var(--bd);border-radius:var(--rs);padding:10px 14px;font-size:13px;color:var(--txm);cursor:pointer;transition:all .14s;text-align:center;flex:1;min-width:140px}.dm-dropzone:hover,.dm-dropzone.drag{border-color:var(--g);color:var(--g);background:var(--gl)}.dm-dropzone input{display:none}.dm-success{font-size:12px;color:var(--g);font-weight:500}.dz:hover,.dz.drag{border-color:var(--g);background:var(--gl)}.dzico{font-size:36px;margin-bottom:10px}.dz p{font-size:15px;font-weight:500;margin-bottom:4px}.dz span{font-size:13px;color:var(--txm)}.ldp{max-width:900px;margin:0 auto;padding:0 0 60px}.ld-back{padding:16px 32px;border-bottom:1px solid var(--bdl)}.ld-backbtn{display:inline-flex;align-items:center;gap:6px;font-size:13px;color:var(--tx2);cursor:pointer;background:none;border:none;font-family:'DM Sans';transition:color .12px;padding:0}.ld-backbtn:hover{color:var(--g)}.ld-header{padding:32px 32px 0}.ld-hcard{background:var(--sf);border:1px solid var(--bd);border-radius:var(--rl);padding:28px 28px 24px;margin-bottom:2px}.ld-htop{display:flex;align-items:flex-start;gap:20px;margin-bottom:22px}.ld-hinfo{flex:1;min-width:0}.ld-badges{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px}.ld-feat-badge{font-size:11px;font-weight:600;color:#7a5410;background:#fef3c7;border:1px solid #f0c84a;padding:3px 10px;border-radius:20px}.ld-prem-badge{font-size:11px;font-weight:600;color:#5b3d8a;background:#f3eeff;border:1px solid #c4a9f0;padding:3px 10px;border-radius:20px}.ld-name{font-family:'Playfair Display',serif;font-size:30px;font-weight:700;margin-bottom:6px;line-height:1.1}.ld-tagline{font-size:15px;color:var(--tx2);line-height:1.5;margin-bottom:0}.ld-hright{display:flex;flex-direction:column;align-items:flex-end;gap:10px;flex-shrink:0}.ld-save{background:var(--tag);border:1px solid var(--bd);border-radius:var(--rs);width:40px;height:40px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;padding:0;flex-shrink:0}.ld-save:hover{background:var(--gl);border-color:var(--g)}.ld-save.on{background:var(--gl);border-color:var(--g)}.ld-save svg{width:20px;height:20px;transition:all .2s}.ld-save .bm-outline{fill:none;stroke:var(--tx2);stroke-width:1.8;transition:all .2s}.ld-save .bm-fill{fill:none;transition:all .2s}.ld-save:hover .bm-outline{stroke:var(--g)}.ld-save.on .bm-outline{stroke:var(--g)}.ld-save.on .bm-fill{fill:var(--g)}.nav-bm-btn{display:flex;align-items:center;gap:6px;background:var(--sf);border:1px solid var(--bd);border-radius:var(--rs);padding:6px 12px;cursor:pointer;font-size:13px;font-weight:500;color:var(--tx2);transition:all .15s}.nav-bm-btn:hover{border-color:var(--g);color:var(--g)}.nav-bm-btn svg{width:15px;height:15px;flex-shrink:0}.nav-bm-btn .bm-outline{fill:none;stroke:currentColor;stroke-width:1.8;transition:all .2s}.nav-bm-btn .bm-fill{fill:none;transition:all .2s}.nav-bm-btn.has-saved .bm-fill{fill:currentColor}.nav-bm-btn.has-saved{color:var(--g);border-color:var(--gb)}.nav-admin-btn{display:flex;align-items:center;gap:6px;background:#1c1a14;color:#f0c84a;border:1px solid #3d3420;border-radius:var(--rs);padding:6px 12px;cursor:pointer;font-size:13px;font-weight:600;transition:all .15s;letter-spacing:.01em;}.nav-admin-btn:hover{background:#2d2518;border-color:#8B6914;}.ld-meta{display:flex;flex-wrap:wrap;gap:0;border-top:1px solid var(--bdl);padding-top:18px;margin-top:4px}.ld-mi{display:flex;flex-direction:column;gap:3px;padding-right:28px;margin-right:28px;border-right:1px solid var(--bdl)}.ld-mi:last-child{border-right:none;margin-right:0;padding-right:0}.ld-mil{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.09em;color:var(--txm)}.ld-miv{font-size:14px;color:var(--tx)}.ld-cats{display:flex;gap:6px;flex-wrap:wrap}.ld-cat{font-size:12px;padding:3px 10px;background:var(--gl);color:var(--g);border-radius:20px;cursor:pointer;border:1px solid var(--gb)}.ld-cat:hover{background:#e8d8a0}.ld-social{display:flex;gap:8px;margin-top:4px;flex-wrap:wrap}.ld-socbtn{display:inline-flex;align-items:center;gap:7px;padding:8px 14px;border-radius:var(--rs);font-size:13px;font-weight:500;cursor:pointer;transition:all .15s;border:1px solid var(--bd);background:var(--sf);color:var(--tx2);text-decoration:none;line-height:1}.ld-socbtn:hover{transform:translateY(-1px);box-shadow:var(--sh)}.ld-socbtn.web:hover{border-color:var(--g);color:var(--g);background:var(--gl)}.ld-socbtn.ig:hover{border-color:#e1306c;color:#e1306c;background:#fff0f5}.ld-socbtn.yt:hover{border-color:#ff0000;color:#ff0000;background:#fff5f5}.ld-socbtn.tw:hover{border-color:#000;color:#000;background:#f5f5f5}.ld-social-bar{background:var(--sf);border:1px solid var(--bd);border-radius:var(--rl);padding:16px 20px;margin-top:14px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}.ld-social-bar-label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:var(--txm);margin-right:2px}.ld-board-link{display:inline-flex;align-items:center;gap:6px;margin-top:10px;padding:8px 14px;border-radius:var(--rs);font-size:13px;font-weight:500;text-decoration:none;background:var(--tx);color:#fff;border:1px solid var(--tx);transition:all .14s;width:100%;justify-content:center}.ld-board-link:hover{background:var(--g);border-color:var(--g)}.ld-body{padding:0 32px}.ld-sec{background:var(--sf);border:1px solid var(--bd);border-radius:var(--rl);padding:26px 28px;margin-top:14px}.ld-sec-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}.ld-sec-header .ld-sec-title{margin-bottom:0}.ld-sec-links{display:flex;gap:6px}.ld-sec-title{font-family:'Playfair Display',serif;font-size:19px;margin-bottom:14px;display:flex;align-items:center;gap:10px}.ld-sec-title span{font-size:13px;font-weight:400;font-family:'DM Sans',sans-serif;color:var(--txm)}.ld-bio{font-size:15px;color:var(--tx2);line-height:1.85;white-space:pre-line}.ld-tags{display:flex;flex-wrap:wrap;gap:7px;margin-top:16px}.ld-tag{font-size:12px;color:var(--tx2);background:var(--tag);border:1px solid var(--bdl);padding:4px 11px;border-radius:20px}.ld-photos{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.ld-photo{width:100%;aspect-ratio:4/3;border-radius:var(--rs);object-fit:cover;cursor:pointer;transition:opacity .15s}.ld-photo:hover{opacity:.88}.ld-video{border-radius:var(--rs);overflow:hidden;background:#000;aspect-ratio:16/9;width:100%}.ld-video iframe{width:100%;height:100%;border:none;display:block}.ld-vtitle{font-size:13px;color:var(--tx2);margin-top:8px;font-style:italic}.ld-knowledge{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px}.ld-kcard{background:var(--bg);border:1px solid var(--bd);border-radius:var(--r);padding:18px;display:flex;flex-direction:column;gap:10px;cursor:pointer;transition:all .18s;}.ld-kcard:hover{border-color:var(--gb);box-shadow:var(--sh);transform:translateY(-2px)}.ld-kcard.open{border-color:var(--gb);background:var(--gl)}.ld-kcard-top{display:flex;align-items:center;gap:10px}.ld-kcard-icon{width:40px;height:40px;border-radius:10px;background:var(--sf);border:1px solid var(--bd);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}.ld-kcard.open .ld-kcard-icon{background:var(--g);border-color:var(--g)}.ld-kcard-topic{font-weight:600;font-size:14px;color:var(--tx)}.ld-kcard-arrow{margin-left:auto;font-size:12px;color:var(--txm);transition:transform .2s}.ld-kcard.open .ld-kcard-arrow{transform:rotate(180deg);color:var(--g)}.ld-kcard-body{font-size:13px;color:var(--tx2);line-height:1.7;border-top:1px solid var(--bdl);padding-top:10px}.ld-boards{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px}.ld-board{background:var(--bg);border:1px solid var(--bd);border-radius:var(--r);padding:18px;display:flex;flex-direction:column;gap:8px;transition:all .16s}.ld-board:hover{border-color:var(--gb);box-shadow:var(--sh)}.ld-board-name{font-weight:700;font-size:15px;color:var(--tx)}.ld-board-type{font-size:11px;color:var(--g);background:var(--gl);border:1px solid var(--gb);padding:2px 9px;border-radius:20px;display:inline-block}.ld-board-specs{display:flex;gap:10px;flex-wrap:wrap}.ld-board-spec{font-size:12px;color:var(--txm);display:flex;align-items:center;gap:4px}.ld-board-desc{font-size:13px;color:var(--tx2);line-height:1.6}.ld-board-price{font-size:15px;font-weight:600;color:var(--g);margin-top:4px}.ld-lock{background:var(--sf);border:1px solid var(--bd);border-radius:var(--rl);padding:32px 28px;margin-top:14px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:14px;position:relative;overflow:hidden;}.ld-lock::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(139,105,20,.04) 0%,rgba(91,61,138,.06) 100%);}.ld-lock-icon{font-size:32px;opacity:.5}.ld-lock-title{font-family:'Playfair Display',serif;font-size:18px;color:var(--tx)}.ld-lock-desc{font-size:14px;color:var(--tx2);max-width:400px;line-height:1.6}.ld-lock-features{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}.ld-lock-feat{font-size:12px;color:var(--tx2);background:var(--tag);border:1px solid var(--bdl);padding:4px 12px;border-radius:20px}.ld-lock-blur{filter:blur(4px);opacity:.35;pointer-events:none;user-select:none;margin-top:4px;font-size:13px;color:var(--tx2)}.ask-wrap{background:var(--sf);border:1px solid var(--bd);border-radius:var(--rl);padding:28px;margin-top:14px;position:relative;overflow:hidden;}.ask-wrap::before{content:'';position:absolute;top:-60px;right:-60px;width:200px;height:200px;border-radius:50%;background:rgba(139,105,20,.05);pointer-events:none;}.ask-header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:18px;}.ask-title{font-family:'Playfair Display',serif;font-size:20px;color:var(--tx);margin-bottom:6px;}.ask-sub{font-size:13px;color:var(--tx2);line-height:1.6;max-width:420px;}.ask-counter{flex-shrink:0;text-align:center;background:var(--gl);border:1px solid var(--gb);border-radius:var(--r);padding:12px 18px;}.ask-counter-n{font-family:'Playfair Display',serif;font-size:30px;color:var(--g);line-height:1;}.ask-counter-l{font-size:10px;color:var(--txm);text-transform:uppercase;letter-spacing:.08em;margin-top:3px;}.ask-threshold{background:var(--bg);border:1px solid var(--bdl);border-radius:var(--rs);padding:10px 14px;display:flex;align-items:center;gap:10px;margin-bottom:18px;}.ask-bar-wrap{flex:1;height:6px;background:var(--bdl);border-radius:3px;overflow:hidden;}.ask-bar{height:100%;background:linear-gradient(90deg,var(--g),var(--gb));border-radius:3px;transition:width .5s ease;}.ask-bar-label{font-size:11px;color:var(--txm);white-space:nowrap;}.ask-questions{display:flex;flex-direction:column;gap:8px;margin-bottom:18px;max-height:280px;overflow-y:auto;}.ask-questions::-webkit-scrollbar{width:4px;}.ask-questions::-webkit-scrollbar-track{background:var(--bg);border-radius:2px;}.ask-questions::-webkit-scrollbar-thumb{background:var(--bd);border-radius:2px;}.ask-q{background:var(--bg);border:1px solid var(--bdl);border-radius:var(--rs);padding:12px 14px;display:flex;align-items:flex-start;gap:12px;transition:border-color .14s;}.ask-q:hover{border-color:var(--bd);}.ask-q-vote{display:flex;flex-direction:column;align-items:center;gap:3px;flex-shrink:0;cursor:pointer;transition:all .14s;}.ask-q-vote:hover .ask-q-arr{color:var(--g);}.ask-q-arr{font-size:14px;color:var(--bd);line-height:1;}.ask-q-n{font-size:12px;font-weight:600;color:var(--txm);line-height:1;}.ask-q-vote.voted .ask-q-arr{color:var(--g);}.ask-q-vote.voted .ask-q-n{color:var(--g);}.ask-q-body{flex:1;}.ask-q-text{font-size:13.5px;color:var(--tx);line-height:1.5;}.ask-q-meta{font-size:11px;color:var(--txm);margin-top:4px;}.ask-form{display:flex;flex-direction:column;gap:10px;}.ask-input{width:100%;padding:10px 13px;background:var(--bg);border:1px solid var(--bd);border-radius:var(--rs);font-family:'DM Sans',sans-serif;font-size:14px;color:var(--tx);outline:none;transition:border-color .15s;resize:none;}.ask-input::placeholder{color:var(--txm);}.ask-input:focus{border-color:var(--g);box-shadow:0 0 0 3px rgba(139,105,20,.1);}.ask-form-row{display:flex;gap:8px;align-items:flex-end;}.ask-form-row .ask-input{flex:1;}.ask-submit{background:var(--g);color:#fff;border:1px solid var(--g);border-radius:var(--rs);padding:10px 20px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;cursor:pointer;white-space:nowrap;transition:background .15s;flex-shrink:0;}.ask-submit:hover{background:var(--gh);}.ask-anon{font-size:11px;color:var(--txm);text-align:center;}.savp{padding:28px 32px;max-width:1200px;margin:0 auto}.savp h1{font-family:'Playfair Display',serif;font-size:28px;margin-bottom:4px}.sub-wrap{max-width:640px;margin:0 auto;padding:28px 32px 60px}.sub-steps{display:flex;align-items:center;gap:0;margin-bottom:32px}.sub-step{display:flex;align-items:center;gap:8px;flex:1}.sub-step:last-child{flex:0}.sub-step-dot{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;transition:all .2s;border:2px solid var(--bd);background:var(--sf);color:var(--txm)}.sub-step.done .sub-step-dot{background:var(--g);border-color:var(--g);color:#fff}.sub-step.active .sub-step-dot{background:var(--tx);border-color:var(--tx);color:#fff}.sub-step-label{font-size:12px;color:var(--txm);white-space:nowrap}.sub-step.active .sub-step-label{color:var(--tx);font-weight:600}.sub-step.done .sub-step-label{color:var(--g)}.sub-step-line{flex:1;height:2px;background:var(--bd);margin:0 8px;transition:background .2s}.sub-step.done .sub-step-line{background:var(--g)}.sub-card{background:var(--sf);border:1px solid var(--bd);border-radius:var(--rl);padding:32px}.sub-card h2{font-family:'Playfair Display',serif;font-size:22px;margin-bottom:6px}.sub-card .sub-desc{font-size:14px;color:var(--tx2);margin-bottom:24px;line-height:1.6}.sub-nav{display:flex;justify-content:space-between;align-items:center;margin-top:24px;padding-top:20px;border-top:1px solid var(--bdl)}.sub-progress{font-size:12px;color:var(--txm)}.sub-cat-pills{display:flex;flex-wrap:wrap;gap:8px;}.sub-cat-pill{padding:8px 16px;border-radius:20px;border:1.5px solid var(--bd);background:var(--sf);color:var(--tx2);font-size:13px;font-weight:500;cursor:pointer;transition:all .15s;font-family:'DM Sans',sans-serif;}.sub-cat-pill:hover{border-color:var(--gb);color:var(--g);}.sub-cat-pill.on{border-color:var(--g);background:var(--gl);color:var(--g);font-weight:600;}.type-opt{border:2px solid var(--bd);border-radius:var(--r);padding:16px;cursor:pointer;transition:all .15s;text-align:left;background:var(--sf)}.type-opt:hover{border-color:var(--gb)}.type-opt.on{border-color:var(--g);background:var(--gl)}.type-opt-icon{font-size:24px;margin-bottom:8px}.type-opt-label{font-size:14px;font-weight:600;color:var(--tx);margin-bottom:3px}.type-opt-desc{font-size:12px;color:var(--tx2)}.sub-success{text-align:center;padding:20px 0}.sub-success-icon{font-size:52px;margin-bottom:16px}.sub-success h2{font-family:'Playfair Display',serif;font-size:26px;margin-bottom:10px}.sub-success p{font-size:14px;color:var(--tx2);line-height:1.7;max-width:380px;margin:0 auto 24px}.sub-success-steps{text-align:left;background:var(--bg);border:1px solid var(--bdl);border-radius:var(--r);padding:16px 20px;margin-bottom:24px}.sub-success-steps h4{font-size:13px;font-weight:600;margin-bottom:12px;color:var(--txm);text-transform:uppercase;letter-spacing:.06em}.sub-success-step{display:flex;align-items:flex-start;gap:10px;margin-bottom:10px;font-size:13px;color:var(--tx2)}.sub-success-step:last-child{margin-bottom:0}.sub-success-step-n{width:20px;height:20px;border-radius:50%;background:var(--g);color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}.rv-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;gap:12px;flex-wrap:wrap;}.rv-summary{display:flex;align-items:center;gap:12px;}.rv-big-score{font-family:'Playfair Display',serif;font-size:36px;color:var(--g);line-height:1;}.rv-stars-wrap{display:flex;flex-direction:column;gap:3px;}.rv-stars{display:flex;gap:2px;}.rv-star{font-size:16px;}.rv-star.on{color:#f0c84a;}.rv-star.off{color:var(--bd);}.rv-count{font-size:12px;color:var(--txm);}.rv-snippets{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-bottom:14px;}.rv-snippet{background:var(--bg);border:1px solid var(--bd);border-radius:var(--r);padding:16px;display:flex;flex-direction:column;gap:8px;cursor:pointer;transition:all .16s;}.rv-snippet:hover{border-color:var(--gb);box-shadow:var(--sh);transform:translateY(-2px);}.rv-snippet-stars{display:flex;gap:2px;}.rv-snippet-star{font-size:12px;}.rv-snippet-text{font-size:13px;color:var(--tx);line-height:1.55;font-style:italic;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;}.rv-snippet-meta{display:flex;align-items:center;justify-content:space-between;}.rv-snippet-author{font-size:12px;font-weight:600;color:var(--tx);}.rv-snippet-board{font-size:11px;color:var(--g);background:var(--gl);border:1px solid var(--gb);padding:2px 8px;border-radius:20px;}.rv-modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:200;display:flex;align-items:flex-end;justify-content:center;}@media(min-width:640px){.rv-modal-bg{align-items:center;}}.rv-modal{background:var(--sf);border-radius:var(--rl) var(--rl) 0 0;width:100%;max-width:640px;max-height:90vh;overflow-y:auto;padding:28px 28px 40px;}@media(min-width:640px){.rv-modal{border-radius:var(--rl);max-height:80vh;}}.rv-modal-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;}.rv-modal-title{font-family:'Playfair Display',serif;font-size:20px;}.rv-modal-close{background:var(--tag);border:1px solid var(--bd);border-radius:var(--rs);width:32px;height:32px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;}.rv-full-list{display:flex;flex-direction:column;gap:14px;}.rv-full-card{background:var(--bg);border:1px solid var(--bdl);border-radius:var(--r);padding:18px;}.rv-full-card-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:8px;gap:8px;}.rv-full-card-author{font-weight:600;font-size:14px;}.rv-full-card-loc{font-size:12px;color:var(--txm);margin-top:2px;}.rv-full-card-text{font-size:14px;color:var(--tx2);line-height:1.7;font-style:italic;margin-bottom:10px;}.rv-full-card-footer{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}.rv-full-card-date{font-size:11px;color:var(--txm);}.rv-form{display:flex;flex-direction:column;gap:12px;margin-top:20px;padding-top:20px;border-top:1px solid var(--bdl);}.rv-form-title{font-weight:600;font-size:15px;margin-bottom:2px;}.rv-star-pick{display:flex;gap:6px;}.rv-star-btn{font-size:24px;cursor:pointer;background:none;border:none;padding:0;transition:transform .1s;}.rv-star-btn:hover{transform:scale(1.2);}.locale-btn{background:none;border:1px solid var(--bd);border-radius:var(--rs);padding:5px 9px;cursor:pointer;font-size:18px;line-height:1;transition:all .15s;display:flex;align-items:center;gap:5px;color:var(--tx2);font-size:13px}.locale-btn:hover{border-color:var(--g);background:var(--gl)}.locale-flag{font-size:18px;line-height:1}.locale-drop{position:absolute;top:calc(100% + 8px);right:0;background:var(--sf);border:1px solid var(--bd);border-radius:var(--r);box-shadow:var(--shl);min-width:200px;z-index:400;padding:6px;display:grid;grid-template-columns:1fr 1fr;gap:2px}.locale-wrap{position:relative}.locale-opt{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:var(--rs);cursor:pointer;font-size:13px;color:var(--tx2);transition:all .12s;background:none;border:none;width:100%;text-align:left;font-family:'DM Sans',sans-serif}.locale-opt:hover{background:var(--bg);color:var(--tx)}.locale-opt.active{background:var(--gl);color:var(--g);font-weight:600}.locale-opt-flag{font-size:20px}.locale-opt-label{display:flex;flex-direction:column;line-height:1.2}.locale-opt-country{font-size:12px;color:var(--txm)}.prof-wrap{max-width:780px;margin:0 auto;padding:32px 32px 60px;}.prof-hero{background:var(--sf);border:1px solid var(--bd);border-radius:var(--rl);padding:32px;margin-bottom:20px;display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap;}.prof-avatar{width:80px;height:80px;border-radius:50%;background:var(--g);display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:32px;color:#fff;flex-shrink:0;}.prof-info{flex:1;min-width:200px;}.prof-name{font-family:'Playfair Display',serif;font-size:26px;margin-bottom:4px;}.prof-region{font-size:13px;color:var(--txm);margin-bottom:12px;display:flex;align-items:center;gap:6px;}.prof-stats{display:flex;gap:20px;flex-wrap:wrap;}.prof-stat{text-align:center;}.prof-stat-n{font-family:'Playfair Display',serif;font-size:22px;color:var(--g);line-height:1;}.prof-stat-l{font-size:11px;color:var(--txm);text-transform:uppercase;letter-spacing:.06em;margin-top:3px;}.prof-tier{display:inline-flex;align-items:center;gap:6px;padding:5px 14px;border-radius:20px;font-size:12px;font-weight:600;margin-bottom:14px;}.prof-tier.bronze{background:#fdf3e8;color:#8B5E3C;border:1px solid #e8c99a;}.prof-tier.silver{background:#f4f4f6;color:#555;border:1px solid #ccc;}.prof-tier.gold{background:#fef8e6;color:#8B6914;border:1px solid #e2c860;}.prof-progress{background:var(--bg);border:1px solid var(--bdl);border-radius:var(--r);padding:16px 18px;margin-top:16px;}.prof-progress-label{font-size:12px;color:var(--txm);margin-bottom:8px;display:flex;justify-content:space-between;}.prof-progress-bar{height:6px;background:var(--bdl);border-radius:3px;overflow:hidden;}.prof-progress-fill{height:100%;background:linear-gradient(90deg,var(--g),var(--gb));border-radius:3px;transition:width .5s;}.prof-progress-next{font-size:11px;color:var(--txm);margin-top:6px;}.prof-badges-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;}.prof-badge{background:var(--bg);border:1px solid var(--bdl);border-radius:var(--r);padding:16px;display:flex;flex-direction:column;align-items:flex-start;gap:6px;transition:all .15s;}.prof-badge.earned{border-color:var(--gb);background:var(--gl);}.prof-badge.earned:hover{box-shadow:var(--sh);transform:translateY(-2px);}.prof-badge.locked{opacity:.4;}.prof-badge-icon{font-size:26px;}.prof-badge-label{font-size:13px;font-weight:700;color:var(--tx);}.prof-badge-desc{font-size:11px;color:var(--tx2);line-height:1.5;}.prof-badge-tier{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;padding:2px 8px;border-radius:20px;margin-top:2px;}.prof-badge-tier.gold{background:#fef8e6;color:#8B6914;}.prof-badge-tier.silver{background:#f4f4f6;color:#666;}.prof-badge-tier.bronze{background:#fdf3e8;color:#8B5E3C;}.prof-activity{display:flex;flex-direction:column;gap:10px;}.prof-act-row{display:flex;gap:12px;align-items:flex-start;padding:12px 14px;background:var(--bg);border:1px solid var(--bdl);border-radius:var(--r);}.prof-act-icon{font-size:18px;flex-shrink:0;margin-top:1px;}.prof-act-text{font-size:13px;color:var(--tx);line-height:1.5;}.prof-act-date{font-size:11px;color:var(--txm);margin-top:3px;}.prof-local-cta{background:linear-gradient(135deg,#e8f6ee,#f0faf3);border:1px solid #9dd4b2;border-radius:var(--r);padding:16px 18px;display:flex;gap:12px;align-items:flex-start;margin-top:14px;}.prof-local-cta-icon{font-size:24px;flex-shrink:0;}.prof-local-cta-body{flex:1;font-size:13px;color:#276843;line-height:1.6;}.prof-local-cta-body strong{display:block;font-size:14px;margin-bottom:3px;}.qv-wrap{display:flex;flex-direction:column;gap:0;}.qv-section-head{display:flex;align-items:center;justify-content:space-between;margin:28px 0 14px;}.qv-section-title{font-family:'Playfair Display',serif;font-size:17px;color:var(--tx);display:flex;align-items:center;gap:8px;}.qv-section-count{font-size:12px;color:var(--txm);background:var(--tag);border-radius:20px;padding:2px 9px;font-weight:600;}.qv-add-btn{display:flex;align-items:center;gap:6px;padding:7px 14px;border-radius:var(--rs);border:1px solid var(--g);background:transparent;color:var(--g);font-size:13px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .12s;}.qv-add-btn:hover{background:var(--gl);}.qv-empty{text-align:center;padding:28px 20px;color:var(--txm);font-size:13px;background:var(--bg);border:1px dashed var(--bdl);border-radius:var(--r);}.qv-empty-ico{font-size:28px;margin-bottom:8px;}.qv-board{background:var(--sf);border:1px solid var(--bd);border-radius:var(--r);padding:18px;display:flex;flex-direction:column;gap:12px;position:relative;transition:box-shadow .15s;}.qv-board:hover{box-shadow:var(--sh);}.qv-board.past{opacity:.82;background:var(--bg);}.qv-board-top{display:flex;align-items:flex-start;gap:12px;}.qv-board-main{flex:1;min-width:0;}.qv-board-name{font-size:15px;font-weight:700;color:var(--tx);line-height:1.3;}.qv-board-shaper{font-size:12px;color:var(--g);font-weight:600;margin-top:2px;cursor:pointer;}.qv-board-shaper:hover{text-decoration:underline;}.qv-board-shaper.unlinked{color:var(--txm);cursor:default;}.qv-board-shaper.unlinked:hover{text-decoration:none;}.qv-board-meta{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;}.qv-chip{font-size:11px;padding:3px 9px;border-radius:20px;background:var(--tag);color:var(--tx2);font-weight:500;white-space:nowrap;}.qv-chip.wave{background:#e8f4fb;color:#1a6080;}.qv-chip.cond{background:#f0f8ee;color:#276843;}.qv-chip.seeking{background:#fef3e2;color:#8B5E1A;}.qv-board-rating{display:flex;gap:2px;flex-shrink:0;margin-top:2px;}.qv-star{font-size:16px;cursor:pointer;color:var(--bdl);transition:color .1s;line-height:1;}.qv-star.on{color:#f0c84a;}.qv-board-notes{font-size:12px;color:var(--tx2);line-height:1.6;border-top:1px solid var(--bdl);padding-top:10px;}.qv-fins{border-top:1px solid var(--bdl);padding-top:12px;}.qv-fins-title{font-size:11px;font-weight:700;color:var(--txm);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;}.qv-fin-list{display:flex;flex-direction:column;gap:6px;}.qv-fin-row{display:flex;align-items:center;gap:8px;}.qv-fin-name{font-size:12px;color:var(--tx);flex:1;}.qv-fin-badge{font-size:10px;padding:2px 8px;border-radius:20px;font-weight:600;white-space:nowrap;}.qv-fin-badge.best{background:#fef8e6;color:#8B6914;border:1px solid #e2c860;}.qv-fin-badge.tried{background:var(--tag);color:var(--txm);}.qv-fin-add{font-size:11px;color:var(--g);cursor:pointer;background:none;border:none;font-family:'DM Sans',sans-serif;padding:0;font-weight:600;}.qv-fin-add:hover{text-decoration:underline;}.qv-board-actions{display:flex;gap:6px;flex-wrap:wrap;border-top:1px solid var(--bdl);padding-top:10px;}.qv-action-btn{font-size:11px;padding:5px 11px;border-radius:var(--rs);border:1px solid var(--bdl);background:transparent;color:var(--tx2);cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .12s;}.qv-action-btn:hover{background:var(--bg);border-color:var(--bd);color:var(--tx);}.qv-action-btn.archive{color:#8B5E1A;border-color:#e8c99a;}.qv-action-btn.archive:hover{background:#fdf3e8;}.qv-action-btn.restore{color:#276843;border-color:#9dd4b2;}.qv-action-btn.restore:hover{background:#e8f6ee;}.qv-action-btn.delete{color:#c0392b;border-color:#f0b8b0;}.qv-action-btn.delete:hover{background:#fdf0ee;}.qv-form{background:var(--bg);border:1px solid var(--g);border-radius:var(--r);padding:22px;margin-top:4px;display:flex;flex-direction:column;gap:0;}.qv-form-title{font-size:15px;font-weight:700;color:var(--tx);margin-bottom:18px;display:flex;align-items:center;gap:8px;}.qv-shaper-search{position:relative;}.qv-shaper-results{position:absolute;top:calc(100% + 4px);left:0;right:0;background:var(--sf);border:1px solid var(--bd);border-radius:var(--rs);box-shadow:var(--sh);z-index:200;max-height:200px;overflow-y:auto;}.qv-shaper-opt{padding:10px 14px;cursor:pointer;font-size:13px;display:flex;flex-direction:column;gap:2px;border-bottom:1px solid var(--bdl);transition:background .1s;}.qv-shaper-opt:last-child{border-bottom:none;}.qv-shaper-opt:hover{background:var(--gl);}.qv-shaper-opt-name{font-weight:600;color:var(--tx);}.qv-shaper-opt-loc{font-size:11px;color:var(--txm);}.qv-shaper-opt.add-new{color:var(--g);font-weight:600;}.qv-wave-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}.qv-wave-opt{padding:10px 8px;border:1px solid var(--bdl);border-radius:var(--rs);text-align:center;cursor:pointer;font-size:12px;color:var(--tx2);transition:all .12s;background:var(--bg);}.qv-wave-opt.on{border-color:var(--g);background:var(--gl);color:var(--g);font-weight:600;}.qv-cond-slider{-webkit-appearance:none;appearance:none;width:100%;height:5px;border-radius:3px;background:linear-gradient(90deg,var(--gl) 0%,var(--g) 100%);outline:none;}.qv-cond-slider::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:var(--g);cursor:pointer;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.2);}.qv-cond-labels{display:flex;justify-content:space-between;font-size:10px;color:var(--txm);margin-top:4px;}.qv-star-pick{display:flex;gap:4px;}.qv-star-pick-btn{font-size:24px;background:none;border:none;cursor:pointer;color:var(--bdl);transition:color .1s;padding:0;line-height:1;}.qv-star-pick-btn.on{color:#f0c84a;}.qv-fin-form{display:flex;gap:8px;align-items:center;margin-top:8px;}.qv-fin-input{flex:1;}.qv-fin-toggle{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--tx2);cursor:pointer;flex-shrink:0;}.qv-fin-toggle input{accent-color:var(--g);width:14px;height:14px;cursor:pointer;}.an-stat{background:var(--sf);border:1px solid var(--bd);border-radius:var(--r);padding:18px 20px}.an-stat-n{font-family:'Playfair Display',serif;font-size:32px;color:var(--g);line-height:1;margin-bottom:4px}.an-stat-l{font-size:12px;color:var(--txm);text-transform:uppercase;letter-spacing:.06em}.an-stat-sub{font-size:12px;color:var(--tx2);margin-top:6px}.an-sec{background:var(--sf);border:1px solid var(--bd);border-radius:var(--r);padding:20px 22px;margin-bottom:14px}.an-sec h3{font-family:'Playfair Display',serif;font-size:16px;margin-bottom:14px}.an-row{display:flex;align-items:center;gap:12px;padding:9px 0;border-bottom:1px solid var(--bdl)}.an-row:last-child{border-bottom:none}.an-row-label{flex:1;font-size:13px;color:var(--tx)}.an-row-bar-wrap{width:160px;height:6px;background:var(--bg);border-radius:3px;overflow:hidden}.an-row-bar{height:100%;background:linear-gradient(90deg,var(--g),var(--gb));border-radius:3px}.an-row-val{font-size:13px;font-weight:600;color:var(--g);min-width:36px;text-align:right}.an-row-badge{font-size:11px;padding:2px 8px;border-radius:20px;font-weight:500}.an-badge-web{background:#e8f4fd;color:#1a6b9a}.an-badge-ig{background:#fff0f5;color:#c0246a}.an-badge-yt{background:#fff5f5;color:#cc0000}.an-badge-tw{background:#f5f5f5;color:#333}.an-badge-board{background:var(--gl);color:var(--g)}.an-empty{text-align:center;padding:32px;color:var(--txm);font-size:14px}.an-note{font-size:12px;color:var(--txm);margin-top:12px;padding-top:12px;border-top:1px solid var(--bdl)}.empty{text-align:center;padding:52px 24px;color:var(--txm)}.emico{font-size:44px;margin-bottom:14px}.empty p{font-size:14px;margin-bottom:16px}.toast{position:fixed;bottom:24px;right:24px;background:var(--tx);color:#fff;padding:12px 20px;border-radius:var(--rs);font-size:14px;z-index:999;box-shadow:var(--shl);animation:su .2s ease}@keyframes su{from{transform:translateY(10px);opacity:0}to{transform:translateY(0);opacity:1}}

/* Logo upload section in admin */
.logo-upload-section{background:var(--bg);border:1px solid var(--bdl);border-radius:var(--r);padding:20px;margin-bottom:20px;}
.logo-upload-section h4{font-size:14px;font-weight:600;margin-bottom:4px;}
.logo-upload-section p{font-size:12px;color:var(--txm);margin-bottom:14px;}
.logo-preview-row{display:flex;align-items:center;gap:14px;margin-bottom:14px;}
.logo-preview-box{width:56px;height:56px;border-radius:12px;border:1px solid var(--bd);background:var(--sf);display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;}
.logo-preview-box img{width:100%;height:100%;object-fit:contain;}
.logo-upload-zone{border:2px dashed var(--bd);border-radius:var(--rs);padding:14px;text-align:center;cursor:pointer;transition:all .15s;font-size:13px;color:var(--txm);}
.logo-upload-zone:hover{border-color:var(--g);color:var(--g);background:var(--gl);}

@media(max-width:768px){
  .hero-text h1{font-size:24px}
  .f2{grid-template-columns:1fr}
  .main-layout{flex-direction:column}
  .sidebar{width:100%;min-height:auto;position:static;border-right:none;border-bottom:1px solid var(--bd);padding:12px 0 0;}
  .sidebar-cats-row{display:flex;overflow-x:auto;gap:6px;padding:0 16px 12px;-webkit-overflow-scrolling:touch;}
  .sidebar-cats-row::-webkit-scrollbar{display:none;}
  .sidebar-cat{white-space:nowrap;padding:7px 14px;border-radius:20px;border:1px solid var(--bd);}
  .sidebar-cat.on{border-color:var(--g);border-left:1px solid var(--g);}
  .sidebar-section-label{padding:0 16px;}
  .sidebar-divider,.sidebar-submit-cta{display:none;}
  .content-area{padding:16px}
  .filter-panel{right:auto;left:0;min-width:260px}
}
`;

// ─────────────────────────────────────────────
// MICRO HELPERS
// ─────────────────────────────────────────────
function Styles() {
  useEffect(() => {
    const el = document.createElement("style");
    el.innerHTML = CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);
  return null;
}

function Toast({ msg, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return <div className="toast">{msg}</div>;
}

function LogoImg({ listing, size = "sm" }) {
  const d = size === "lg" ? 68 : 44;
  const rad = size === "lg" ? 14 : 10;
  const fnt = size === "lg" ? 34 : 22;
  const logoColor = listing.logoColor || "#8B6914";
  const logo = listing.logo || "🏄";
  const logoUrl = listing.logoUrl || "";
  
  const wrap = { width: d, height: d, borderRadius: rad, overflow: "hidden", flexShrink: 0, background: logoColor + "22", display: "flex", alignItems: "center", justifyContent: "center" };
  if (logoUrl) return <div style={wrap}><img src={logoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} onError={e => e.target.style.display = "none"} /></div>;
  return <div style={{ ...wrap, fontSize: fnt }}>{logo}</div>;
}

// ─────────────────────────────────────────────
// BADGE DEFINITIONS
// ─────────────────────────────────────────────
const BADGE_DEFS = [
  { id:"founding",    icon:"🌊", label:"Founding Member",   desc:"One of the first 100 people to join Shaper Shed",             tier:"gold"   },
  { id:"nominator",   icon:"🪚", label:"Nominator",         desc:"Submitted a shaper who was approved and went live",             tier:"gold"   },
  { id:"reviewer",    icon:"⭐", label:"Trusted Reviewer",  desc:"Written 3 or more approved reviews",                           tier:"silver" },
  { id:"loyal",       icon:"🤙", label:"Loyal",             desc:"Reviewed the same shaper more than once over time",             tier:"silver" },
  { id:"questioner",  icon:"❓", label:"Curious",           desc:"Asked 5 or more questions to shapers",                         tier:"bronze" },
  { id:"contributor", icon:"✏️", label:"Contributor",       desc:"Made 10+ contributions to the directory",                      tier:"bronze" },
  { id:"glasshead",   icon:"🪟", label:"Glass Head",        desc:"Champion of the glassing craft — reviewed a glasser",          tier:"bronze" },
];

// ─────────────────────────────────────────────
// AUTH MODAL
// ─────────────────────────────────────────────
function AuthModal({ mode: init, onClose, onAuth }) {
  const { tr, showToast } = useContext(Ctx);
  const [mode, setMode] = useState(init);
  const [f, setF] = useState({ firstName:"", lastName:"", email:"", pw:"", heard:"", interest:"" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const h = (k, v) => setF(p => ({ ...p, [k]: v }));

  const sub = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const endpoint = mode === "in" ? `${API_BASE}/api/auth/login` : `${API_BASE}/api/auth/register`;
      const body = mode === "in" 
        ? { email: f.email, password: f.pw }
        : { email: f.email, password: f.pw, firstName: f.firstName, lastName: f.lastName, heard: f.heard, lookingFor: f.interest };
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Authentication failed");
      }
      
      const userData = await res.json();
      onAuth({
        ...userData,
        badges: ["founding"],
        contributions: 0, reviews: 0, nominations: 0,
        joinDate: new Date().toLocaleDateString("en-AU", { month:"long", year:"numeric" }),
      });
    } catch (err) {
      setError(err.message);
      showToast(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ov" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="mclose" onClick={onClose}>✕</button>
        {mode === "in" ? <>
          <h2>{tr("auth.welcomeBack")}</h2>
          <p>{tr("auth.signinDesc")}</p>
          {error && <div style={{color:"#dc2626",fontSize:13,marginBottom:12,padding:"8px 12px",background:"#fef2f2",borderRadius:6}}>{error}</div>}
          <form onSubmit={sub}>
            <div className="fg"><label className="fl">{tr("sub.email")} *</label><input className="fi" type="email" required placeholder="you@example.com" value={f.email} onChange={e => h("email",e.target.value)} /></div>
            <div className="fg"><label className="fl">{tr("auth.password")} *</label><input className="fi" type="password" required placeholder="••••••••" value={f.pw} onChange={e => h("pw",e.target.value)} /></div>
            <button type="submit" className="btn bp fbtn" disabled={loading}>{loading ? "Signing in..." : tr("nav.signin")}</button>
          </form>
          <div className="swlnk">{tr("auth.noAccount")} <span onClick={() => setMode("up")}>{tr("auth.joinFree")}</span></div>
        </> : <>
          <h2>{tr("auth.joinTitle")}</h2>
          <p>{tr("auth.joinDesc")}</p>
          {error && <div style={{color:"#dc2626",fontSize:13,marginBottom:12,padding:"8px 12px",background:"#fef2f2",borderRadius:6}}>{error}</div>}
          <form onSubmit={sub}>
            <div className="f2">
              <div className="fg"><label className="fl">{tr("sub.firstName")} *</label><input className="fi" required placeholder="Jane" value={f.firstName} onChange={e => h("firstName",e.target.value)} /></div>
              <div className="fg"><label className="fl">{tr("sub.lastName")} *</label><input className="fi" required placeholder="Smith" value={f.lastName} onChange={e => h("lastName",e.target.value)} /></div>
            </div>
            <div className="fg"><label className="fl">{tr("sub.email")} *</label><input className="fi" type="email" required placeholder="you@example.com" value={f.email} onChange={e => h("email",e.target.value)} /></div>
            <div className="fg"><label className="fl">{tr("auth.password")} *</label><input className="fi" type="password" required placeholder="Create a password" value={f.pw} onChange={e => h("pw",e.target.value)} /></div>
            <div className="fg"><label className="fl">{tr("auth.heard")}</label>
              <select className="fs" value={f.heard} onChange={e => h("heard",e.target.value)}>
                <option value="">{tr("general.select")}</option>
                <option>Another surfer</option><option>A shaper</option>
                <option>Instagram</option><option>YouTube</option>
                <option>Surf mag</option><option>Google</option><option>Other</option>
              </select>
            </div>
            <div className="fg"><label className="fl">{tr("auth.lookingFor")}</label>
              <select className="fs" value={f.interest} onChange={e => h("interest",e.target.value)}>
                <option value="">{tr("general.select")}</option>
                <option>Just exploring different shapers</option>
                <option>Looking for a new board</option>
                <option>Want to learn about surfboard design</option>
                <option>Planning a surf trip</option>
                <option>Glassing services</option>
                <option>Repair service</option>
                <option>Other</option>
              </select>
            </div>
            <button type="submit" className="btn bp fbtn" disabled={loading}>{loading ? "Creating account..." : tr("auth.createAccount")}</button>
          </form>
          <div style={{ fontSize:11, color:"var(--txm)", marginTop:12, lineHeight:1.6, padding:"0 2px" }}>
            By joining, you agree to receive occasional updates from Shaper Shed about new listings, features, and community news. Your details are kept private — never shared with third parties. Unsubscribe any time.
          </div>
          <div className="swlnk">{tr("auth.alreadyMember")} <span onClick={() => setMode("in")}>{tr("auth.signIn")}</span></div>
        </>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// EDIT LISTING MODAL
// ─────────────────────────────────────────────
function EditModal({ listing, categories, onSave, onClose }) {
  const { tr } = useContext(Ctx);
  const [f, setF] = useState({ ...listing, category: [...listing.category], tags: listing.tags.join(",") });
  const h = (k, v) => setF(p => ({ ...p, [k]: v }));
  const ref = useRef();
  const pickLogo = e => { const file = e.target.files[0]; if (!file) return; const r = new FileReader(); r.onload = ev => h("logoUrl", ev.target.result); r.readAsDataURL(file); };
  const toggleCategory = (id) => {
    setF(p => {
      const current = p.category || [];
      if (current.includes(id)) {
        return { ...p, category: current.filter(c => c !== id) };
      } else if (current.length < 3) {
        return { ...p, category: [...current, id] };
      }
      return p;
    });
  };
  const sub = e => { e.preventDefault(); onSave({ ...f, category: f.category, tags: f.tags.split(",").map(s => s.trim()) }); };
  return (
    <div className="ov" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal wide">
        <button className="mclose" onClick={onClose}>✕</button>
        <h2>Edit Listing</h2><p>Updating <strong>{listing.name}</strong></p>
        <form onSubmit={sub}>
          <div className="f2">
            <div className="fg"><label className="fl">Name *</label><input className="fi" required value={f.name} onChange={e => h("name", e.target.value)} /></div>
            <div className="fg"><label className="fl">{tr("listing.type")}</label>
              <select className="fs" value={f.type} onChange={e => h("type", e.target.value)}>
                {["Shaper","Glasser","Retail","Service","Supplier","Manufacturer","School","Other"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="fg"><label className="fl">Tagline</label><input className="fi" value={f.tagline} onChange={e => h("tagline", e.target.value)} /></div>
          <div className="fg">
            <label className="fl">Speciality (select up to 3)</label>
            <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(130px, 1fr))", gap:"8px", marginTop:"8px"}}>
              {categories.filter(c => c.id !== "all").map(c => {
                const selected = (f.category || []).includes(c.id);
                const atMax = (f.category || []).length >= 3 && !selected;
                return (
                  <label key={c.id} style={{display:"flex", alignItems:"center", gap:"8px", cursor: atMax ? "not-allowed" : "pointer", opacity: atMax ? 0.5 : 1, padding:"8px 12px", background: selected ? "var(--gl)" : "var(--bg)", border: selected ? "1px solid var(--gb)" : "1px solid var(--bd)", borderRadius:"8px", fontSize:"13px", transition:"all 0.15s"}}>
                    <input 
                      type="checkbox" 
                      checked={selected}
                      disabled={atMax}
                      onChange={() => toggleCategory(c.id)}
                      style={{cursor: atMax ? "not-allowed" : "pointer", accentColor:"var(--g)"}}
                    />
                    <span style={{color: selected ? "var(--g)" : "var(--tx)"}}>{c.label}</span>
                  </label>
                );
              })}
            </div>
            {(f.category || []).length > 0 && <div style={{fontSize:"12px", color: (f.category || []).length >= 3 ? "var(--txm)" : "var(--g)", marginTop:"8px"}}>✓ {(f.category || []).length}/3 selected</div>}
          </div>
          <div className="f2">
            <div className="fg"><label className="fl">{tr("listing.country")}</label>
              <select className="fs" value={f.country} onChange={e => h("country", e.target.value)}>
                <option value="">Select…</option>
                {COUNTRIES.filter(c => c !== "All Countries").map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="f2">
            <div className="fg"><label className="fl">{tr("sub.website")}</label><input className="fi" value={f.website} onChange={e => h("website", e.target.value)} /></div>
            <div className="fg"><label className="fl">Location / Town</label><input className="fi" value={f.address} onChange={e => h("address", e.target.value)} /></div>
          </div>
          <div className="fg"><label className="fl">About</label><textarea className="ft" rows={4} value={f.bio} onChange={e => h("bio", e.target.value)} /></div>
          <div className="fg"><label className="fl">Tags (comma-separated)</label><input className="fi" value={f.tags} onChange={e => h("tags", e.target.value)} /></div>
          <div className="fsec">
            <h4>Logo</h4>
            <div className="f2">
              <div className="fg"><label className="fl">Logo URL</label><input className="fi" value={f.logoUrl || ""} onChange={e => h("logoUrl", e.target.value)} placeholder="https://…" /></div>
              <div className="fg">
                <label className="fl">Upload File</label>
                <input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={pickLogo} />
                <button type="button" className="btn bo" style={{ width: "100%", justifyContent: "center" }} onClick={() => ref.current.click()}>📁 Choose Image</button>
                {f.logoUrl && <img src={f.logoUrl} alt="" style={{ width: 44, height: 44, borderRadius: 8, marginTop: 8, objectFit: "contain", border: "1px solid var(--bd)" }} />}
              </div>
            </div>
            <div className="f2">
              <div className="fg"><label className="fl">Emoji fallback</label><input className="fi" value={f.logo} onChange={e => h("logo", e.target.value)} /></div>
              <div className="fg"><label className="fl">Brand colour</label><input type="color" className="fi" value={f.logoColor} onChange={e => h("logoColor", e.target.value)} style={{ height: 38 }} /></div>
            </div>
          </div>
          <button type="submit" className="btn bp" style={{ width: "100%", marginTop: 16, justifyContent: "center" }}>Save Changes</button>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// CATEGORY MANAGER MODAL
// ─────────────────────────────────────────────
function CatManagerModal({ categories, onSave, onClose }) {
  const [cats, setCats] = useState(categories.filter(c => c.id !== "all"));
  const [newLabel, setNewLabel] = useState("");
  const toId = s => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const add = () => {
    if (!newLabel.trim()) return;
    const id = toId(newLabel);
    if (cats.find(c => c.id === id)) return;
    setCats(p => [...p, { id, label: newLabel.trim() }]);
    setNewLabel("");
  };
  return (
    <div className="ov" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="mclose" onClick={onClose}>✕</button>
        <h2>Manage Categories</h2>
        <p>Add, rename or remove board type categories. ALL is always first.</p>
        <div className="cmlist">
          {cats.map(c => (
            <div key={c.id} className="cmitem">
              <span className="cmh">⠿</span>
              <input className="cmi" value={c.label} onChange={e => setCats(p => p.map(x => x.id === c.id ? { ...x, label: e.target.value } : x))} />
              <span className="cmid">{c.id}</span>
              <button className="btn bxs brej" onClick={() => setCats(p => p.filter(x => x.id !== c.id))}>✕</button>
            </div>
          ))}
        </div>
        <div className="cmadd">
          <input className="fi" placeholder="New category name…" value={newLabel} onChange={e => setNewLabel(e.target.value)}
            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), add())} />
          <button className="btn bp bsm" onClick={add}>+ Add</button>
        </div>
        <button className="btn bp" style={{ width: "100%", marginTop: 16, justifyContent: "center" }}
          onClick={() => { onSave([{ id: "all", label: "All" }, ...cats]); onClose(); }}>
          Save Categories
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// FILTER PANEL (dropdown)
// ─────────────────────────────────────────────
function FilterPanel({ categories, activeCats, activeCountries, onToggleCat, onToggleCountry, onClear, onClose }) {
  const { tr } = useContext(Ctx);
  const ref = useRef();
  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div className="filter-panel" ref={ref}>
      <div className="fp-section">
        <span className="fp-label">Country</span>
        <div className="fp-options">
          {COUNTRIES.filter(c => c !== "All Countries").map(c => (
            <div key={c} className={`fp-chip ${activeCountries.includes(c) ? "on" : ""}`} onClick={() => onToggleCountry(c)}>
              {c}
            </div>
          ))}
        </div>
      </div>
      <div className="fp-footer">
        <button className="fp-clear" onClick={onClear}>{tr("home.clearFilters")}</button>
        <button className="btn bp bsm" onClick={onClose}>Done</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// LOCALE PICKER
// ─────────────────────────────────────────────
function LocalePicker({ locale, setLocale }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const current = LOCALES.find(l => l.code === locale) || LOCALES[0];

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="locale-wrap" ref={ref}>
      <button className="locale-btn" onClick={() => setOpen(o => !o)}>
        <span className="locale-flag">{current.flag}</span>
        <span style={{ fontSize:11, color:"var(--txm)" }}>▾</span>
      </button>
      {open && (
        <div className="locale-drop">
          {LOCALES.map(l => (
            <button key={l.code} className={`locale-opt ${l.code === locale ? "active" : ""}`}
              onClick={() => { setLocale(l.code); setOpen(false); }}>
              <span className="locale-opt-flag">{l.flag}</span>
              <span className="locale-opt-label">
                <span>{l.lang}</span>
                <span className="locale-opt-country">{l.label}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function BookmarkIcon({ saved, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path className="bm-fill" d="M5 3h14a1 1 0 0 1 1 1v17.25a.5.5 0 0 1-.8.4L12 17.333l-7.2 4.317A.5.5 0 0 1 4 21.25V4a1 1 0 0 1 1-1z"
        style={{ fill: saved ? "var(--g)" : "none" }} />
      <path className="bm-outline" d="M5 3h14a1 1 0 0 1 1 1v17.25a.5.5 0 0 1-.8.4L12 17.333l-7.2 4.317A.5.5 0 0 1 4 21.25V4a1 1 0 0 1 1-1z"
        style={{ fill: "none", stroke: saved ? "var(--g)" : "var(--tx2)", strokeWidth: 1.8, strokeLinejoin: "round" }} />
    </svg>
  );
}

// ─────────────────────────────────────────────
// LISTING CARD
// ─────────────────────────────────────────────
function Card({ listing, onClick }) {
  const { tr, locale } = useContext(Ctx);
  const translatedTagline = useTranslatedText(listing.tagline || "", locale);
  const tags = listing.tags || [];
  const featured = listing.featured || false;
  
  return (
    <div className={`card ${featured ? "feat" : ""}`} onClick={() => onClick(listing)}>
      {featured && <span className="fbadge">{tr("listing.featured")}</span>}
      <div className="ctop">
        <LogoImg listing={listing} />
        <div className="cinfo">
          <div className="cname">{listing.name}</div>
          <div className="ctag">{translatedTagline}</div>
        </div>
      </div>
      <div className="cfoot">
        <span className="ptyp">{listing.type}</span>
        {listing.country && <span className="preg">🌍 {listing.country}</span>}
        {tags.slice(0, 1).map(t => <span key={t} className="ptag">{t}</span>)}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────
function Sidebar({ listings, categories, activeCat, setCat, search, setSearch, onSubmit }) {
  const { filterCountries, setFilterCountries } = useContext(Ctx);
  const [filterOpen, setFilterOpen] = useState(false);

  const toggleCountry = c => setFilterCountries(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);
  const clearFilters  = () => setFilterCountries([]);
  const hasFilters = filterCountries.length > 0;

  // Count per category
  const countFor = id => id === "all"
    ? listings.length
    : listings.filter(l => (l.category || []).includes(id)).length;

  return (
    <aside className="sidebar">
      <span className="sidebar-section-label">Categories</span>
      <div className="sidebar-cats-row">
        {categories.map(c => (
          <button
            key={c.id}
            className={`sidebar-cat ${activeCat === c.id ? "on" : ""}`}
            onClick={() => { setCat(c.id); setSearch(""); }}
          >
            {c.id === "all" && "🏄 "}
            {c.id === "shortboards" && "🏄 "}
            {c.id === "mid-lengths" && "🌊 "}
            {c.id === "twin-fins"   && "🔺 "}
            {c.id === "longboards"  && "📏 "}
            {c.id === "asyms"       && "⚡ "}
            {c.id === "single-fin"  && "🎯 "}
            {c.id === "glassers"    && "🪟 "}
            {c.label}
            <span className="sidebar-cat-count">{countFor(c.id)}</span>
          </button>
        ))}
      </div>

      <div className="sidebar-divider" />

      {/* Country filter in sidebar */}
      <div style={{ padding:"0 20px", marginBottom:8 }}>
        <div style={{ position:"relative" }}>
          <button
            className={`filter-btn ${hasFilters ? "active" : ""}`}
            style={{ width:"100%", justifyContent:"space-between" }}
            onClick={() => setFilterOpen(o => !o)}
          >
            <span style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div className="filter-dot" />
              🌍 Country{hasFilters ? ` (${filterCountries.length})` : ""}
            </span>
            <span style={{ fontSize:11 }}>▾</span>
          </button>
          {filterOpen && (
            <FilterPanel
              categories={categories}
              activeCats={[]}
              activeCountries={filterCountries}
              onToggleCat={() => {}}
              onToggleCountry={toggleCountry}
              onClear={clearFilters}
              onClose={() => setFilterOpen(false)}
            />
          )}
        </div>
      </div>

      <div className="sidebar-divider" />

      <button className="sidebar-submit-cta" onClick={onSubmit}>
        ＋ Submit a Shaper
        <div className="sidebar-submit-sub">Add a shaper or glasser</div>
      </button>
    </aside>
  );
}

// ─────────────────────────────────────────────
// HOME PAGE
// ─────────────────────────────────────────────
function HomePage({ listings: allListings, onView }) {
  const { setPage, categories, activeCat, setCat, search, setSearch, user, heroImage, tr, filterCountries } = useContext(Ctx);

  const filtered = allListings.filter(l => {
    const mc = activeCat === "all" || l.category.includes(activeCat);
    const q = search.toLowerCase();
    const ms = !q || l.name.toLowerCase().includes(q) || l.tagline.toLowerCase().includes(q) || l.tags.some(t => t.toLowerCase().includes(q));
    const countryMatch = filterCountries.length === 0 || filterCountries.includes(l.country);
    return mc && ms && countryMatch;
  });

  const featured = filtered.filter(l => l.featured);
  const regular  = filtered.filter(l => !l.featured);

  const activeLabel = activeCat === "all" ? tr("home.allListings") : categories.find(c => c.id === activeCat)?.label || activeCat;

  return (
    <>
      {/* ══ HERO ══ */}
      <div className="hero-box">
        {heroImage
          ? <img className="hero-img" src={heroImage} alt="Shaper Shed hero" />
          : <div className="hero-placeholder"><div className="hero-placeholder-icon">🏄</div><span>{tr("hero.uploadHint")}</span></div>
        }
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-text">
            <h1>{tr("hero.headline")}<br /><em>{tr("hero.sub")}</em></h1>
            <p>{tr("hero.desc")}</p>
          </div>
        </div>
        {user?.role === "superadmin" && <button className="hero-img-btn" onClick={() => setPage("admin")}>{tr("home.changeImage")}</button>}
      </div>

      {/* ══ SEARCH BAR ══ */}
      <div className="search-bar-wrap">
        <div className="search-bar-inner">
          <div className="swrap">
            <span className="sico">🔍</span>
            <input className="si" placeholder={tr("home.searchPlaceholder")} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      {/* ══ MAIN LAYOUT: sidebar + content ══ */}
      <div className="main-layout">
        <Sidebar
          listings={allListings}
          categories={categories}
          activeCat={activeCat}
          setCat={setCat}
          search={search}
          setSearch={setSearch}
          onSubmit={() => setPage("submit")}
        />

        <div className="content-area">
          {featured.length > 0 && <>
            <div className="sh"><h2 className="st">{tr("home.featured")}</h2><span className="sc">{featured.length}</span></div>
            <div className="grid">{featured.map(l => <Card key={l.id} listing={l} onClick={onView} />)}</div>
            <div className="sdiv" />
          </>}

          <div className="sh">
            <h2 className="st">{activeLabel}</h2>
            <span className="sc">{regular.length}</span>
          </div>
          {regular.length > 0
            ? <div className="grid">{regular.map(l => <Card key={l.id} listing={l} onClick={onView} />)}</div>
            : <div className="empty"><div className="emico">🌊</div><p>{tr("home.empty")}</p></div>
          }
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// REVIEWS
// ─────────────────────────────────────────────
function StarRow({ rating, size = 14 }) {
  return (
    <div className="rv-stars" style={{ gap: 2 }}>
      {[1,2,3,4,5].map(n => (
        <span key={n} className={`rv-star ${n <= rating ? "on" : "off"}`} style={{ fontSize: size }}>★</span>
      ))}
    </div>
  );
}

function ReviewSection({ listing, onPendingReview }) {
  const { user, setModal, tr } = useContext(Ctx);
  const [open, setOpen]       = useState(false);
  const [adding, setAdding]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [rv, setRv] = useState({ rating:0, board:"", text:"", author:"" });

  const reviews = (listing.reviews || []).filter(r => r.approved);
  const avgRating = reviews.length ? (reviews.reduce((s,r) => s+r.rating, 0) / reviews.length).toFixed(1) : null;

  const submitReview = () => {
    if (!rv.rating || !rv.text.trim()) return;
    onPendingReview({
      id: Date.now(), listingId: listing.id,
      author: rv.author.trim() || (user?.name || "Anonymous"),
      board: rv.board, rating: rv.rating, text: rv.text.trim(),
      date: new Date().toLocaleDateString("en-AU", { month:"long", year:"numeric" }),
      approved: false,
    });
    setSubmitted(true);
    setAdding(false);
  };

  // Always show section - either reviews exist or user can add one
  return (
    <>
      <div className="ld-sec">
        <div className="rv-header">
          <div className="ld-sec-title" style={{ marginBottom:0 }}>{tr("reviews.title")}</div>
          {avgRating && (
            <div className="rv-summary">
              <div className="rv-big-score">{avgRating}</div>
              <div className="rv-stars-wrap">
                <StarRow rating={Math.round(avgRating)} size={16} />
                <div className="rv-count">{reviews.length} {reviews.length !== 1 ? tr("reviews.reviews") : tr("reviews.review")}</div>
              </div>
            </div>
          )}
        </div>

        {reviews.length > 0 && (
          <div className="rv-snippets">
            {reviews.slice(0, 3).map(r => (
              <div key={r.id} className="rv-snippet" onClick={() => setOpen(true)}>
                <div className="rv-snippet-stars">
                  {[1,2,3,4,5].map(n => <span key={n} className="rv-snippet-star" style={{ color: n<=r.rating?"#f0c84a":"var(--bd)" }}>★</span>)}
                </div>
                <div className="rv-snippet-text">"{r.text}"</div>
                <div className="rv-snippet-meta">
                  <span className="rv-snippet-author">{r.author}</span>
                  {r.board && <span className="rv-snippet-board">{r.board}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {reviews.length === 0 && (
          <p style={{ fontSize:14, color:"var(--tx2)", marginBottom:14 }}>
            No reviews yet — be the first to share your experience with {listing.name}.
          </p>
        )}

        {reviews.length > 3 && (
          <button className="btn bo bsm" style={{ marginBottom:14 }} onClick={() => setOpen(true)}>
            {tr("reviews.seeAllOf")} {reviews.length} {tr("reviews.reviews")} →
          </button>
        )}

        <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
          {user ? (
            submitted ? (
              <div style={{ fontSize:13, color:"var(--g)", fontWeight:500 }}>{tr("reviews.submitted")}</div>
            ) : (
              <button className="btn bp bsm" onClick={() => setAdding(a => !a)}>
                {adding ? tr("general.cancel") : tr("reviews.add")}
              </button>
            )
          ) : (
            <div style={{ fontSize:13, color:"var(--txm)" }}>
              <button className="btn bo bsm" onClick={() => setModal("in")}>{tr("nav.signin")}</button>
              {" "}to leave a review
            </div>
          )}
        </div>

        {adding && !submitted && (
          <div className="rv-form">
            <div className="rv-form-title">{tr("reviews.of")} {listing.name}</div>
            <div>
              <label className="fl" style={{ marginBottom:6 }}>{tr("reviews.rating")}</label>
              <div className="rv-star-pick">
                {[1,2,3,4,5].map(n => (
                  <button key={n} className="rv-star-btn" onClick={() => setRv(r=>({...r,rating:n}))}>
                    <span style={{ color: n<=rv.rating ? "#f0c84a" : "var(--bd)" }}>★</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="fg" style={{ margin:0 }}>
              <label className="fl">{tr("reviews.whichBoard")}</label>
              <select className="fs" value={rv.board} onChange={e => setRv(r=>({...r,board:e.target.value}))}>
                <option value="">Select a board…</option>
                {(listing.boards||[]).map(b => <option key={b.name}>{b.name}</option>)}
                <option value="Custom order">Custom order</option>
                <option value="General">General — no specific board</option>
              </select>
            </div>
            <div className="fg" style={{ margin:0 }}>
              <label className="fl">{tr("reviews.yourReview")}</label>
              <textarea className="ft" rows={4}
                placeholder="Tell us about your experience — the board, the process, the communication…"
                value={rv.text} onChange={e => setRv(r=>({...r,text:e.target.value}))} />
            </div>
            <div className="fg" style={{ margin:0 }}>
              <label className="fl">{tr("reviews.yourName")}</label>
              <input className="fi" placeholder="Jane S." value={rv.author} onChange={e => setRv(r=>({...r,author:e.target.value}))} />
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button className="btn bp" onClick={submitReview} disabled={!rv.rating || !rv.text.trim()}>{tr("reviews.submit")}</button>
              <button className="btn bo" onClick={() => setAdding(false)}>{tr("general.cancel")}</button>
            </div>
            <div style={{ fontSize:12, color:"var(--txm)" }}>{tr("reviews.modNote")}</div>
          </div>
        )}
      </div>

      {open && (
        <div className="rv-modal-bg" onClick={e => e.target===e.currentTarget && setOpen(false)}>
          <div className="rv-modal">
            <div className="rv-modal-top">
              <div className="rv-modal-title">{tr("reviews.of")} {listing.name}</div>
              <button className="rv-modal-close" onClick={() => setOpen(false)}>✕</button>
            </div>
            {avgRating && (
              <div className="rv-summary" style={{ marginBottom:20 }}>
                <div className="rv-big-score">{avgRating}</div>
                <div className="rv-stars-wrap">
                  <StarRow rating={Math.round(avgRating)} size={18} />
                  <div className="rv-count">{reviews.length} {reviews.length !== 1 ? tr("reviews.reviews") : tr("reviews.review")}</div>
                </div>
              </div>
            )}
            <div className="rv-full-list">
              {reviews.map(r => (
                <div key={r.id} className="rv-full-card">
                  <div className="rv-full-card-top">
                    <div>
                      <div className="rv-full-card-author">{r.author}</div>
                      {r.location && <div className="rv-full-card-loc">📍 {r.location}</div>}
                    </div>
                    <StarRow rating={r.rating} size={14} />
                  </div>
                  <div className="rv-full-card-text">"{r.text}"</div>
                  <div className="rv-full-card-footer">
                    {r.board && <span className="rv-snippet-board">{r.board}</span>}
                    <span className="rv-full-card-date">{r.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────
// ASK A SHAPER
// ─────────────────────────────────────────────
const THRESHOLD = 50;

const SAMPLE_QUESTIONS = [
  { id:1, text:"How do you decide on rocker for a surfer who splits their time between beach break and points?", votes:14, votedByMe:false, name:"Tom R.", date:"2 days ago" },
  { id:2, text:"What's the biggest mistake you see people make when ordering a custom board?", votes:9, votedByMe:false, name:"Anonymous", date:"4 days ago" },
  { id:3, text:"Do you think EPS boards will fully replace PU in the next 10 years?", votes:7, votedByMe:false, name:"Sarah M.", date:"1 week ago" },
];

function AskAShaper({ listing }) {
  const { tr } = useContext(Ctx);
  const [questions, setQuestions] = useState(listing.id === 1 ? SAMPLE_QUESTIONS : []);
  const [text, setText]     = useState("");
  const [name, setName]     = useState("");
  const [submitted, setSubmitted] = useState(false);

  const totalQ     = questions.length;
  const pct        = Math.min((totalQ / THRESHOLD) * 100, 100);
  const nearTarget = totalQ >= THRESHOLD * 0.7;
  const atTarget   = totalQ >= THRESHOLD;

  const submit = () => {
    if (!text.trim()) return;
    const newQ = { id: Date.now(), text: text.trim(), votes: 0, votedByMe: false, name: name.trim() || "Anonymous", date: "Just now" };
    setQuestions(p => [newQ, ...p]);
    setText(""); setName(""); setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const vote = id => {
    setQuestions(p => p.map(q =>
      q.id === id ? { ...q, votes: q.votedByMe ? q.votes - 1 : q.votes + 1, votedByMe: !q.votedByMe } : q
    ));
  };

  const sorted = [...questions].sort((a, b) => b.votes - a.votes);
  const firstName = listing.name.split(" ")[0];

  const subText = atTarget
    ? tr("ask.atTarget").replace("{n}", THRESHOLD)
    : nearTarget
    ? tr("ask.nearTarget").replace("{n}", THRESHOLD - totalQ)
    : tr("ask.defaultSub").replace("{n}", THRESHOLD);

  return (
    <div className="ask-wrap">
      <div className="ask-header">
        <div>
          <div className="ask-title">{tr("ask.askTitle")} {firstName}</div>
          <div className="ask-sub">{subText}</div>
        </div>
        <div className="ask-counter">
          <div className="ask-counter-n">{totalQ}</div>
          <div className="ask-counter-l">{tr("ask.questions")}</div>
        </div>
      </div>

      <div className="ask-threshold">
        <div className="ask-bar-wrap">
          <div className="ask-bar" style={{ width: `${pct}%` }} />
        </div>
        <div className="ask-bar-label">{totalQ} / {THRESHOLD} {tr("ask.toPropose")}</div>
      </div>

      {sorted.length > 0 && (
        <div className="ask-questions">
          {sorted.map(q => (
            <div key={q.id} className="ask-q">
              <div className={`ask-q-vote ${q.votedByMe ? "voted" : ""}`} onClick={() => vote(q.id)}>
                <span className="ask-q-arr">▲</span>
                <span className="ask-q-n">{q.votes}</span>
              </div>
              <div className="ask-q-body">
                <div className="ask-q-text">{q.text}</div>
                <div className="ask-q-meta">{q.name} · {q.date}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {submitted ? (
        <div style={{ textAlign:"center", padding:"16px 0", color:"var(--g)", fontSize:14, fontWeight:500 }}>
          {tr("ask.submitted")}
        </div>
      ) : (
        <div className="ask-form">
          <textarea className="ask-input" rows={2}
            placeholder={`${tr("ask.questionPlaceholder")} ${firstName}?`}
            value={text} onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), submit())}
          />
          <div className="ask-form-row">
            <input className="ask-input" placeholder={tr("ask.namePlaceholder")} value={name} onChange={e => setName(e.target.value)} />
            <button className="ask-submit" onClick={submit}>{tr("ask.submitBtn")}</button>
          </div>
          <div className="ask-anon">{tr("ask.reviewNote")}</div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// OUTBOUND CLICK TRACKING
// ─────────────────────────────────────────────
function trackOutbound({ listingId, listingName, destination, label, type }) {
  const event = {
    listingId, listingName, destination, label, type,
    timestamp: new Date().toISOString(),
    session: sessionStorage.getItem("ss_session") || (() => {
      const id = Math.random().toString(36).slice(2);
      sessionStorage.setItem("ss_session", id);
      return id;
    })(),
  };
  console.log("[ShaperSheds outbound]", event);
  try {
    const key = "ss_clicks";
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    existing.push(event);
    localStorage.setItem(key, JSON.stringify(existing.slice(-500)));
  } catch (_) {}
}

function TrackedLink({ href, listingId, listingName, label, type, children, className, style }) {
  const handle = () => trackOutbound({ listingId, listingName, destination: href, label, type });
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className} style={style} onClick={handle}>
      {children}
    </a>
  );
}

// ─────────────────────────────────────────────
// KNOWLEDGE CARD GRID
// ─────────────────────────────────────────────
function KnowledgeGrid({ items }) {
  const [open, setOpen] = useState(null);
  return (
    <div className="ld-knowledge">
      {items.map((item, i) => (
        <div key={i} className={`ld-kcard ${open === i ? "open" : ""}`} onClick={() => setOpen(open === i ? null : i)}>
          <div className="ld-kcard-top">
            <div className="ld-kcard-icon">{item.icon}</div>
            <div className="ld-kcard-topic">{item.topic}</div>
            <span className="ld-kcard-arrow">▼</span>
          </div>
          {open === i && <div className="ld-kcard-body">{item.summary}</div>}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// LISTING DETAIL PAGE
// ─────────────────────────────────────────────
function PremiumLock({ title, description, features }) {
  return (
    <div className="ld-lock">
      <div className="ld-lock-icon">🔒</div>
      <div className="ld-lock-title">{title}</div>
      <div className="ld-lock-desc">{description}</div>
      <div className="ld-lock-features">
        {features.map(f => <span key={f} className="ld-lock-feat">✓ {f}</span>)}
      </div>
      <div className="ld-lock-blur">
        The River Pig · 7'0"–7'6" · 2+1 fins · $1,100 &nbsp;·&nbsp; The Dagger · 5'10"–6'2" · Thruster · $950
      </div>
      <p style={{ fontSize: 13, color: "var(--txm)", marginTop: 12, maxWidth: 360, lineHeight: 1.6 }}>
        This content is available when <strong>the shaper</strong> upgrades to a Premium listing.
      </p>
    </div>
  );
}

function ListingPage({ listing }) {
  const { setPage, setCat, user, savedIds, toggleSave, showToast, setModal, categories, setPendingReviews, tr, locale } = useContext(Ctx);
  const saved = savedIds.includes(listing.id);
  const bm = () => { if (!user) { setModal("in"); return; } toggleSave(listing.id); showToast(saved ? "Removed from saved" : "Saved!"); };
  const isPremium  = listing.premium;
  const hasBoards  = isPremium && listing.boards?.length > 0;

  // Translate dynamic content
  const translatedTagline = useTranslatedText(listing.tagline, locale);
  const translatedBio = useTranslatedText(listing.bio, locale);

  return (
    <div className="ldp">
      <div className="ld-back">
        <button className="ld-backbtn" onClick={() => setPage("home")}>{tr("listing.back")}</button>
      </div>
      <div className="ld-header">
        <div className="ld-hcard">
          <div className="ld-htop">
            <LogoImg listing={listing} size="lg" />
            <div className="ld-hinfo">
              <div className="ld-badges">
                {listing.featured && <span className="ld-feat-badge">{tr("listing.featured")}</span>}
                {isPremium && <span className="ld-prem-badge">✦ Premium</span>}
              </div>
              <div className="ld-name">{listing.name}</div>
              <div className="ld-tagline">{translatedTagline}</div>
            </div>
            <div className="ld-hright">
              <button className={`ld-save ${saved ? "on" : ""}`} onClick={bm}>
                <BookmarkIcon saved={saved} size={20} />
              </button>
            </div>
          </div>

          <div className="ld-meta">
            {listing.category.length > 0 && (
              <div className="ld-mi">
                <span className="ld-mil">Speciality</span>
                <div className="ld-cats">
                  {listing.category.map(cId => {
                    const cat = categories.find(c => c.id === cId);
                    return cat ? <span key={cId} className="ld-cat" onClick={() => { setCat(cId); setPage("home"); }}>{cat.label}</span> : null;
                  })}
                </div>
              </div>
            )}
            <div className="ld-mi"><span className="ld-mil">{tr("listing.type")}</span><span className="ld-miv">{listing.type}</span></div>
            {listing.country && <div className="ld-mi"><span className="ld-mil">{tr("listing.country")}</span><span className="ld-miv">🌍 {listing.country}</span></div>}
            {listing.address && <div className="ld-mi"><span className="ld-mil">{tr("listing.location")}</span><span className="ld-miv">📍 {listing.address}</span></div>}
            {listing.founded && <div className="ld-mi"><span className="ld-mil">{tr("listing.founded2")}</span><span className="ld-miv">{listing.founded}</span></div>}
          </div>
        </div>
      </div>

      <div className="ld-body">
        <div className="ld-sec">
          <div className="ld-sec-header">
            <div className="ld-sec-title">About</div>
            {(listing.website || listing.instagram) && (
              <div className="ld-sec-links">
                {listing.website && (
                  <a className="ld-cat" href={listing.website} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none'}}>Website ↗</a>
                )}
                {listing.instagram && (
                  <a className="ld-cat" href={`https://instagram.com/${listing.instagram}`} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none'}}>Instagram ↗</a>
                )}
              </div>
            )}
          </div>
          <p className="ld-bio">{translatedBio}</p>
          {listing.tags.length > 0 && (
            <div className="ld-tags">
              {listing.tags.map(t => <span key={t} className="ld-tag">{t}</span>)}
            </div>
          )}
        </div>

        {/* Reviews and Q&A - always shown after About for all listings */}
        <ReviewSection
          listing={listing}
          onPendingReview={rv => { setPendingReviews(p => [...p, rv]); showToast("Review submitted — thanks!"); }}
        />
        <AskAShaper listing={listing} />

        {isPremium && listing.youtube?.length > 0 && (
          <div className="ld-sec">
            <div className="ld-sec-title">{tr("listing.youtube")} <span>{tr("listing.premium")}</span></div>
            <div className="ld-video">
              <iframe
                src={`https://www.youtube.com/embed/${listing.youtube[0].id}?rel=0&modestbranding=1`}
                title={listing.youtube[0].title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            {listing.youtube[0].title && <div className="ld-vtitle">"{listing.youtube[0].title}"</div>}
          </div>
        )}

        {!isPremium && (
          <PremiumLock
            title="Watch this shaper at work"
            description="When the shaper upgrades to Premium, they can embed a video — watch their full shaping process, hear their philosophy, and get a feel for who they are before you order a board."
            features={["1 embedded YouTube video","Shaping process","Brand story","Build confidence before you buy"]}
          />
        )}

        {isPremium && listing.knowledge?.length > 0 && (
          <div className="ld-sec">
            <div className="ld-sec-title">{tr("listing.knowledge")} <span>{tr("listing.premium")}</span></div>
            <p style={{ fontSize: 13, color: "var(--txm)", marginBottom: 16 }}>
              How {listing.name.split(" ")[0]} thinks about the fundamentals — click any card to expand.
            </p>
            <KnowledgeGrid items={listing.knowledge} />
          </div>
        )}

        {!isPremium && (
          <PremiumLock
            title="Shaping Knowledge — how they think"
            description="When the shaper upgrades to Premium, they can share their philosophy on rocker, concave, tail shapes, outlines and more."
            features={["Rocker explained","Concave philosophy","Tail & outline thinking","Why it matters for your surfing"]}
          />
        )}

        {hasBoards && (
          <div className="ld-sec">
            <div className="ld-sec-title">{tr("listing.boards")} <span>{tr("listing.premium")}</span></div>
            <div className="ld-boards">
              {listing.boards.map((b, i) => (
                <div key={i} className="ld-board">
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8 }}>
                    <div className="ld-board-name">{b.name}</div>
                    <span className="ld-board-type">{b.type}</span>
                  </div>
                  <div className="ld-board-specs">
                    <span className="ld-board-spec">📏 {b.length}</span>
                    <span className="ld-board-spec">🏄 {b.fins}</span>
                  </div>
                  <div className="ld-board-desc">{b.description}</div>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:8 }}>
                    <div className="ld-board-price">{b.price}</div>
                  </div>
                  {listing.website && (
                    <TrackedLink href={listing.website} listingId={listing.id} listingName={listing.name} label={`${b.name} board link`} type="board_link" className="ld-board-link">
                      View {b.name} ↗
                    </TrackedLink>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!isPremium && (
          <PremiumLock
            title="Board Portfolio — every shape, explained"
            description="When the shaper upgrades to Premium, they can showcase their full range with individual board cards — dimensions, fin setup, ideal conditions, and pricing."
            features={["Full board catalogue","Dimensions & fins","Who each board suits","Custom order pricing"]}
          />
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MULTI-STEP SUBMIT PAGE
// ─────────────────────────────────────────────
function SubmitPage() {
  const { setPending, showToast, categories, setPage, tr } = useContext(Ctx);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [f, setF] = useState({
    type:"Shaper", categories:[], name:"", country:"", address:"",
    website:"", instagram:"", bio:"", firstName:"", lastName:"", email:"", relationship:"",
  });
  const h = (k, v) => setF(p => ({ ...p, [k]: v }));
  const toggleCat = id => setF(p => ({
    ...p,
    categories: p.categories.includes(id) 
      ? p.categories.filter(c=>c!==id) 
      : p.categories.length < 3 ? [...p.categories, id] : p.categories,
  }));

  const canNext = [
    () => f.type && f.name.trim() && f.categories.length > 0,
    () => f.bio.trim() && f.country,
    () => f.firstName.trim() && f.lastName.trim() && f.email.trim(),
  ];

  const next = () => { if (canNext[step]()) setStep(s => s + 1); else showToast("Please fill in the required fields"); };
  const back = () => setStep(s => s - 1);

  const submit = () => {
    if (!f.firstName.trim() || !f.lastName.trim() || !f.email.trim()) { showToast("Please fill in all required fields"); return; }
    setPending(p => [...p, {
      id:Date.now(), ...f,
      name: f.name,
      tagline: f.bio.slice(0, 80).trim() + (f.bio.length > 80 ? "…" : ""),
      submitterName: `${f.firstName} ${f.lastName}`,
      logo:"🏄", logoColor:"#8B6914", logoUrl:"",
      featured:false, category: f.categories, tags:[], photos:[],
      approved:false, premium:false, youtube:[], boards:[], knowledge:[],
      reviews:[], pendingDate:new Date().toLocaleDateString(),
    }]);
    setDone(true); showToast("Submission received!");
  };

  const StepDots = () => (
    <div className="sub-steps">
      {[tr("sub.title"), tr("sub.details"), tr("sub.yourInfo")].map((label, i) => (
        <div key={i} className={`sub-step ${i < step ? "done" : i === step ? "active" : ""}`}>
          <div className="sub-step-dot">{i < step ? "✓" : i + 1}</div>
          <div className="sub-step-label">{label}</div>
          {i < 2 && <div className="sub-step-line" />}
        </div>
      ))}
    </div>
  );

  if (done) return (
    <div className="sub-wrap">
      <div className="sub-card">
        <div className="sub-success">
          <div className="sub-success-icon">🏄</div>
          <h2>{tr("sub.success")}</h2>
          <p>{tr("sub.successMsg")} <strong>{f.name}</strong> {tr("sub.successGo")}</p>
          <div className="sub-success-steps">
            <h4>{tr("sub.whatNext")}</h4>
            <div className="sub-success-step"><div className="sub-success-step-n">1</div><span>{tr("sub.step1a")}</span></div>
            <div className="sub-success-step"><div className="sub-success-step-n">2</div><span>{tr("sub.step2a")}</span></div>
            <div className="sub-success-step"><div className="sub-success-step-n">3</div><span>{tr("sub.step3a")}</span></div>
            <div className="sub-success-step"><div className="sub-success-step-n">4</div><span>{tr("sub.step4a")}</span></div>
          </div>
          <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
            <button className="btn bp" onClick={() => setPage("home")}>{tr("sub.browseDir")}</button>
            <button className="btn bo" onClick={() => { setDone(false); setStep(0); setF({ type:"Shaper", categories:[], name:"", country:"", address:"", website:"", instagram:"", bio:"", firstName:"", lastName:"", email:"", relationship:"" }); }}>{tr("sub.submitAnother")}</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="sub-wrap">
      <div style={{ marginBottom:8 }}>
        <button className="ld-backbtn" onClick={() => setPage("home")}>{tr("listing.back")}</button>
      </div>
      <StepDots />
      <div className="sub-card">
        {step === 0 && <>
          <h2>{tr("sub.title")}</h2>
          <p className="sub-desc">Tell us who you'd like to add to the directory.</p>
          <div className="fg">
            <label className="fl">{tr("sub.nameRequired")}</label>
            <input className="fi" required autoFocus placeholder="e.g. Mill Road Shapes or Dave Mills"
              value={f.name} onChange={e => h("name", e.target.value)} />
          </div>
          <div style={{ marginBottom:20 }}>
            <label className="fl" style={{ marginBottom:10 }}>{tr("sub.shaperType")}</label>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {[
                { val:"Shaper",  icon:"🪚", label:tr("sub.shaper"),  desc:tr("sub.shaperDesc") },
                { val:"Glasser", icon:"🪟", label:tr("sub.glasser"), desc:tr("sub.glasserDesc") },
              ].map(opt => (
                <div key={opt.val} className={`type-opt ${f.type===opt.val?"on":""}`} onClick={() => h("type", opt.val)}>
                  <div className="type-opt-icon">{opt.icon}</div>
                  <div className="type-opt-label">{opt.label}</div>
                  <div className="type-opt-desc">{opt.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="fg">
            <label className="fl" style={{ marginBottom:10 }}>
              {tr("sub.craftRequired")} <span style={{ fontWeight:400, color:"var(--txm)" }}>{tr("sub.selectAll")}</span>
            </label>
            <div className="sub-cat-pills">
              {categories.filter(c => c.id !== "all").map(c => (
                <button key={c.id} type="button" className={`sub-cat-pill ${f.categories.includes(c.id) ? "on" : ""}`} onClick={() => toggleCat(c.id)}>
                  {c.label}
                </button>
              ))}
            </div>
            {f.categories.length > 0 && <div style={{ fontSize:12, color: f.categories.length >= 3 ? "var(--txm)" : "var(--g)", marginTop:8 }}>✓ {f.categories.length}/3 selected {f.categories.length >= 3 && "(max)"}</div>}
          </div>
          <div className="sub-nav">
            <span className="sub-progress">{tr("sub.step1of3")}</span>
            <button className="btn bp" onClick={next}>{tr("sub.nextDetails")}</button>
          </div>
        </>}

        {step === 1 && <>
          <h2>{tr("sub.details")} — {f.name || `this ${f.type.toLowerCase()}`}</h2>
          <p className="sub-desc">The more you give us, the better their listing.</p>
          <div className="f2">
            <div className="fg"><label className="fl">{tr("sub.country")}</label>
              <select className="fs" value={f.country} onChange={e => h("country",e.target.value)}>
                <option value="">Select…</option>
                {COUNTRIES.filter(c=>c!=="All Countries").map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="fg"><label className="fl">{tr("sub.town")}</label>
              <input className="fi" placeholder="e.g. Byron Bay" value={f.address} onChange={e => h("address",e.target.value)} />
            </div>
          </div>
          <div className="f2">
            <div className="fg"><label className="fl">Website</label>
              <input className="fi" placeholder="https://…" value={f.website} onChange={e => h("website",e.target.value)} />
            </div>
            <div className="fg"><label className="fl">{tr("sub.instagram")}</label>
              <input className="fi" placeholder="@handle" value={f.instagram} onChange={e => h("instagram",e.target.value.replace("@",""))} />
            </div>
          </div>
          <div className="fg">
            <label className="fl">{tr("sub.about")} *</label>
            <textarea className="ft" rows={5} required
              placeholder={`Tell us about this ${f.type.toLowerCase()} — their background, what makes them special…`}
              value={f.bio} onChange={e => h("bio",e.target.value)} />
          </div>
          <div className="sub-nav">
            <button className="btn bo" onClick={back}>{tr("sub.back")}</button>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <span className="sub-progress">{tr("sub.step2of3")}</span>
              <button className="btn bp" onClick={next}>{tr("sub.nextInfo")}</button>
            </div>
          </div>
        </>}

        {step === 2 && <>
          <h2>{tr("sub.yourInfo")}</h2>
          <p className="sub-desc">{tr("sub.yourInfoDesc")}</p>
          <div className="f2">
            <div className="fg"><label className="fl">{tr("sub.firstName")} *</label><input className="fi" required placeholder="Jane" value={f.firstName} onChange={e => h("firstName",e.target.value)} /></div>
            <div className="fg"><label className="fl">{tr("sub.lastName")} *</label><input className="fi" required placeholder="Smith" value={f.lastName} onChange={e => h("lastName",e.target.value)} /></div>
          </div>
          <div className="fg">
            <label className="fl">{tr("sub.email")} *</label>
            <input className="fi" type="email" required placeholder="you@example.com" value={f.email} onChange={e => h("email",e.target.value)} />
          </div>
          <div className="fg">
            <label className="fl">{tr("sub.relationshipTo")} {f.name || `this ${f.type.toLowerCase()}`}</label>
            <select className="fs" value={f.relationship} onChange={e => h("relationship",e.target.value)}>
              <option value="">Select…</option>
              <option>I am the shaper / business owner</option>
              <option>I'm a customer</option>
              <option>I'm a friend or family member</option>
              <option>I found them and think they deserve to be here</option>
              <option>Other</option>
            </select>
          </div>
          <div className="okban" style={{ marginTop:4 }}>
            <span style={{ fontSize:18 }}>🔒</span>
            <div style={{ fontSize:12, color:"var(--tx2)", lineHeight:1.6 }}>{tr("sub.privacyNote")}</div>
          </div>
          <div className="sub-nav">
            <button className="btn bo" onClick={back}>{tr("sub.back")}</button>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <span className="sub-progress">{tr("sub.step3of3")}</span>
              <button className="btn bp" onClick={submit}>{tr("sub.submitBtn")}</button>
            </div>
          </div>
        </>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// QUIVER TRACKER
// ─────────────────────────────────────────────
const WAVE_TYPES = [
  { id:"beach",  label:"🏖 Beach break" },
  { id:"point",  label:"🌀 Point break" },
  { id:"reef",   label:"🪨 Reef break"  },
  { id:"river",  label:"🌊 River mouth" },
  { id:"shore",  label:"🌊 Shore break" },
  { id:"any",    label:"✅ All types"   },
];

const COND_LABELS = ["1ft mush", "1–2ft", "2–3ft", "3–4ft", "4–5ft", "5–6ft", "6ft+"];

function emptyBoard() {
  return {
    id: Date.now(), name: "", shaperText: "", shaperId: null,
    length: "", volume: "", year: "", waveTypes: [], condMin: 0, condMax: 6,
    rating: 0, notes: "", fins: [], seekingReplacement: false, archived: false,
  };
}

function QuiverTab({ listings }) {
  const { setPage } = useContext(Ctx);
  const [boards, setBoards]   = useState(DEMO_QUIVER);
  const [adding, setAdding]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState(emptyBoard());

  const h = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const currentBoards = boards.filter(b => !b.archived);
  const pastBoards    = boards.filter(b => b.archived);

  const openAdd  = () => { setForm(emptyBoard()); setAdding(true); setEditing(null); };
  const openEdit = b  => { setForm({ ...b }); setEditing(b.id); setAdding(false); };
  const cancelForm = () => { setAdding(false); setEditing(null); };

  const saveBoard = () => {
    if (!form.name.trim()) return;
    if (editing) { setBoards(p => p.map(b => b.id === editing ? { ...form } : b)); }
    else { setBoards(p => [{ ...form, id: Date.now() }, ...p]); }
    setAdding(false); setEditing(null);
  };

  const archive = id => setBoards(p => p.map(b => b.id === id ? { ...b, archived: true } : b));
  const restore = id => setBoards(p => p.map(b => b.id === id ? { ...b, archived: false } : b));
  const remove  = id => setBoards(p => p.filter(b => b.id !== id));
  const rate    = (id, n) => setBoards(p => p.map(b => b.id === id ? { ...b, rating: b.rating === n ? 0 : n } : b));

  return (
    <div className="qv-wrap">
      <div className="qv-section-head">
        <div className="qv-section-title">🏄 Current Quiver<span className="qv-section-count">{currentBoards.length}</span></div>
        {!adding && !editing && <button className="qv-add-btn" onClick={openAdd}>＋ Add board</button>}
      </div>
      {currentBoards.length === 0 && !adding && (
        <div className="qv-empty">
          <div className="qv-empty-ico">🏄</div>
          <div>No boards in your current quiver yet.</div>
        </div>
      )}
      {currentBoards.map(b => (
        <BoardCard key={b.id} board={b} onEdit={() => openEdit(b)} onArchive={() => archive(b.id)}
          onRate={n => rate(b.id, n)} onNavigate={() => setPage("listing")} listings={listings} />
      ))}
      {(adding || editing) && (
        <BoardForm form={form} h={h} listings={listings}
          title={editing ? "Edit board" : "Add a board to your quiver"}
          onSave={saveBoard} onCancel={cancelForm} setForm={setForm} />
      )}
      {pastBoards.length > 0 && (
        <>
          <div className="qv-section-head" style={{ marginTop:36 }}>
            <div className="qv-section-title">📦 Boards I've Owned<span className="qv-section-count">{pastBoards.length}</span></div>
          </div>
          {pastBoards.map(b => (
            <BoardCard key={b.id} board={b} past onEdit={() => openEdit(b)}
              onRestore={() => restore(b.id)} onDelete={() => remove(b.id)}
              onRate={n => rate(b.id, n)} onNavigate={() => setPage("listing")} listings={listings} />
          ))}
        </>
      )}
    </div>
  );
}

function BoardCard({ board: b, past, onEdit, onArchive, onRestore, onDelete, onRate, onNavigate, listings }) {
  const linked = listings?.find(l => l.id === b.shaperId);
  const condStr = (b.condMin != null && b.condMax != null) ? `${COND_LABELS[b.condMin ?? 0]} – ${COND_LABELS[b.condMax ?? 6]}` : null;

  return (
    <div className={`qv-board ${past ? "past" : ""}`} style={{ marginBottom:12 }}>
      <div className="qv-board-top">
        <div className="qv-board-main">
          <div className="qv-board-name">{b.name || "Unnamed board"}</div>
          {b.shaperText && (
            linked
              ? <div className="qv-board-shaper" onClick={() => onNavigate(linked.id)}>🏭 {b.shaperText} ↗</div>
              : <div className="qv-board-shaper unlinked">🏭 {b.shaperText}</div>
          )}
          <div className="qv-board-meta">
            {b.length   && <span className="qv-chip">📏 {b.length}</span>}
            {b.volume   && <span className="qv-chip">💧 {b.volume}L</span>}
            {b.year     && <span className="qv-chip">📅 {b.year}</span>}
            {b.waveTypes?.map(wt => { const wl = WAVE_TYPES.find(w=>w.id===wt); return wl ? <span key={wt} className="qv-chip wave">{wl.label}</span> : null; })}
            {condStr && <span className="qv-chip cond">🌊 {condStr}</span>}
            {b.seekingReplacement && <span className="qv-chip seeking">🔍 Seeking replacement</span>}
          </div>
        </div>
        <div className="qv-board-rating">
          {[1,2,3,4,5].map(n => <span key={n} className={`qv-star ${n<=b.rating?"on":""}`} onClick={()=>onRate(n)}>★</span>)}
        </div>
      </div>
      {b.notes && <div className="qv-board-notes">"{b.notes}"</div>}
      {b.fins?.length > 0 && (
        <div className="qv-fins">
          <div className="qv-fins-title">Fins tried</div>
          <div className="qv-fin-list">
            {b.fins.map((f,i) => (
              <div key={i} className="qv-fin-row">
                <div className="qv-fin-name">{f.name}</div>
                <span className={`qv-fin-badge ${f.isBest?"best":"tried"}`}>{f.isBest?"⭐ Best combo":"Tried"}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="qv-board-actions">
        <button className="qv-action-btn" onClick={onEdit}>✏️ Edit</button>
        {!past
          ? <button className="qv-action-btn archive" onClick={onArchive}>📦 Move to Past Boards</button>
          : <>
              <button className="qv-action-btn restore" onClick={onRestore}>↩ Back to Current</button>
              <button className="qv-action-btn delete" onClick={() => { if (window.confirm("Remove permanently?")) onDelete(); }}>🗑 Remove</button>
            </>
        }
      </div>
    </div>
  );
}

function BoardForm({ form, h, listings, title, onSave, onCancel, setForm }) {
  const { setPage } = useContext(Ctx);
  const [shaperQ, setShaperQ]     = useState(form.shaperText || "");
  const [shaperOpen, setShaperOpen] = useState(false);
  const [finInput, setFinInput]   = useState("");
  const [finBest, setFinBest]     = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setShaperOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const shaperMatches = shaperQ.length > 1
    ? listings.filter(l => l.name.toLowerCase().includes(shaperQ.toLowerCase())).slice(0, 6)
    : [];

  const pickShaper = l => { h("shaperText", l.name); h("shaperId", l.id); setShaperQ(l.name); setShaperOpen(false); };
  const toggleWave = id => { const curr = form.waveTypes||[]; h("waveTypes", curr.includes(id)?curr.filter(w=>w!==id):[...curr,id]); };
  const addFin = () => {
    if (!finInput.trim()) return;
    const cleared = finBest ? (form.fins||[]).map(f=>({...f,isBest:false})) : (form.fins||[]);
    h("fins", [...cleared, { name: finInput.trim(), isBest: finBest }]);
    setFinInput(""); setFinBest(false);
  };
  const removeFin  = i => h("fins", form.fins.filter((_,idx)=>idx!==i));
  const setBestFin = i => h("fins", form.fins.map((f,idx)=>({...f,isBest:idx===i})));

  return (
    <div className="qv-form">
      <div className="qv-form-title">🏄 {title}</div>
      <div className="f2" style={{ marginBottom:0 }}>
        <div className="fg">
          <label className="fl">Board name / model *</label>
          <input className="fi" placeholder="e.g. The River Pig" value={form.name} onChange={e => h("name", e.target.value)} />
        </div>
        <div className="fg">
          <label className="fl">Shaper</label>
          <div className="qv-shaper-search" ref={ref}>
            <input className="fi" placeholder="Search directory or type name…" value={shaperQ}
              onChange={e => { setShaperQ(e.target.value); h("shaperText",e.target.value); h("shaperId",null); setShaperOpen(true); }}
              onFocus={() => shaperQ.length>1 && setShaperOpen(true)} />
            {shaperOpen && (shaperMatches.length>0||shaperQ.length>1) && (
              <div className="qv-shaper-results">
                {shaperMatches.map(l => (
                  <div key={l.id} className="qv-shaper-opt" onClick={() => pickShaper(l)}>
                    <span className="qv-shaper-opt-name">{l.name}</span>
                    <span className="qv-shaper-opt-loc">{l.address||l.country}</span>
                  </div>
                ))}
                {shaperQ.length>1 && (
                  <div className="qv-shaper-opt add-new" onClick={() => { h("shaperText",shaperQ); h("shaperId",null); setShaperOpen(false); setPage("submit"); }}>
                    ＋ "{shaperQ}" not here — add them →
                  </div>
                )}
              </div>
            )}
          </div>
          {form.shaperId && <div style={{fontSize:11,color:"var(--g)",marginTop:4}}>✓ Linked to directory listing</div>}
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:0 }}>
      <div className="fg"><label className="fl">Length</label><input className="fi" placeholder={`e.g. 6'2"`} value={form.length} onChange={e=>h("length",e.target.value)} /></div>
        <div className="fg"><label className="fl">Volume (L)</label><input className="fi" placeholder="e.g. 32.5" value={form.volume} onChange={e=>h("volume",e.target.value)} /></div>
        <div className="fg"><label className="fl">Year</label><input className="fi" placeholder="e.g. 2023" value={form.year} onChange={e=>h("year",e.target.value)} /></div>
      </div>
      <div className="fg">
        <label className="fl">Wave types it suits</label>
        <div className="qv-wave-grid">
          {WAVE_TYPES.map(w => (
            <div key={w.id} className={`qv-wave-opt ${(form.waveTypes||[]).includes(w.id)?"on":""}`} onClick={()=>toggleWave(w.id)}>{w.label}</div>
          ))}
        </div>
      </div>
      <div className="fg">
        <label className="fl">Overall rating</label>
        <div className="qv-star-pick">
          {[1,2,3,4,5].map(n => (
            <button key={n} className={`qv-star-pick-btn ${n<=form.rating?"on":""}`} onClick={()=>h("rating",form.rating===n?0:n)}>★</button>
          ))}
        </div>
      </div>
      <div className="fg">
        <label className="fl">Fins tried on this board</label>
        {(form.fins||[]).length>0 && (
          <div className="qv-fin-list" style={{marginBottom:8}}>
            {(form.fins||[]).map((f,i) => (
              <div key={i} className="qv-fin-row">
                <div className="qv-fin-name">{f.name}</div>
                <button className={`qv-fin-badge ${f.isBest?"best":"tried"}`} style={{cursor:"pointer",border:"none",borderRadius:20}} onClick={()=>setBestFin(i)}>
                  {f.isBest?"⭐ Best combo":"Mark as best"}
                </button>
                <button className="qv-fin-add" onClick={()=>removeFin(i)} style={{color:"var(--txm)",marginLeft:4}}>✕</button>
              </div>
            ))}
          </div>
        )}
        <div className="qv-fin-form">
          <input className="fi qv-fin-input" placeholder="e.g. FCS II AM Large" value={finInput} onChange={e=>setFinInput(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&(e.preventDefault(),addFin())} style={{fontSize:12,padding:"6px 10px"}} />
          <label className="qv-fin-toggle"><input type="checkbox" checked={finBest} onChange={e=>setFinBest(e.target.checked)} />Best combo</label>
          <button className="btn bp bsm" style={{fontSize:11,flexShrink:0}} onClick={addFin}>Add fin</button>
        </div>
      </div>
      <div className="fg">
        <label className="fl">Notes</label>
        <textarea className="ft" rows={3} placeholder="What you loved, what it was like to surf…"
          value={form.notes} onChange={e=>h("notes",e.target.value)} />
      </div>
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 0",borderTop:"1px solid var(--bdl)",marginTop:4}}>
        <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,color:"var(--tx2)"}}>
          <input type="checkbox" style={{accentColor:"var(--g)",width:16,height:16,cursor:"pointer"}}
            checked={form.seekingReplacement||false} onChange={e=>h("seekingReplacement",e.target.checked)} />
          🔍 I'm looking for a replacement for this board
        </label>
      </div>
      <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:4}}>
        <button className="btn bo" onClick={onCancel}>Cancel</button>
        <button className="btn bp" onClick={onSave} disabled={!form.name.trim()}>
          {form.id&&form.name?"Save changes":"Add to quiver"} ✓
        </button>
      </div>
    </div>
  );
}

const DEMO_QUIVER = [
  { id:1, name:"The River Pig", shaperText:"Mill Road Shapes", shaperId:1, length:'6\'2"', volume:"32.5", year:"2023", waveTypes:["beach","point"], condMin:1, condMax:4, rating:5, notes:"Best board I've owned. Paddles like a dream.", fins:[{name:"FCS II AM Large",isBest:true},{name:"FCS II MF PC Carbon",isBest:false}], seekingReplacement:false, archived:false },
  { id:2, name:"Summer Groveller", shaperText:"Moonlight Glass", shaperId:2, length:'5\'10"', volume:"36", year:"2022", waveTypes:["beach"], condMin:0, condMax:2, rating:4, notes:"Great for small days.", fins:[{name:"Futures EA Blackstix",isBest:true}], seekingReplacement:false, archived:false },
  { id:3, name:"Old Log", shaperText:"Unknown shaper", shaperId:null, length:"9'0\"", volume:"80", year:"2018", waveTypes:["point","shore"], condMin:0, condMax:3, rating:3, notes:"Got me through two years of learning.", fins:[{name:"Futures Honey Badger 9\"",isBest:true}], seekingReplacement:false, archived:true },
];

// ─────────────────────────────────────────────
// USER PROFILE PAGE
// ─────────────────────────────────────────────
const TIER_CONFIG = [
  { id:"Newcomer",    min:0,  max:2,  color:"bronze", next:"Regular",     desc:"Just getting started" },
  { id:"Regular",     min:3,  max:9,  color:"silver", next:"Contributor", desc:"Part of the community" },
  { id:"Contributor", min:10, max:24, color:"gold",   next:"Local Voice", desc:"A trusted contributor" },
  { id:"Local Voice", min:25, max:999,color:"gold",   next:null,          desc:"The go-to voice for your region" },
];

function getUserTier(contributions) {
  return TIER_CONFIG.find(t => contributions >= t.min && contributions <= t.max) || TIER_CONFIG[0];
}

function getDemoActivity() {
  return [
    { icon:"🪚", text:`Nominated <strong>Mill Road Shapes</strong> — approved and live`, date:"2 days ago" },
    { icon:"⭐", text:`Left a review for <strong>Mill Road Shapes</strong> — The River Pig`, date:"1 week ago" },
    { icon:"❓", text:`Asked a question on <strong>Mill Road Shapes</strong>`, date:"2 weeks ago" },
    { icon:"🔖", text:`Saved <strong>Southern Glass Co</strong> to your list`, date:"3 weeks ago" },
  ];
}

function ProfilePage() {
  const { user, setUser, setPage, listings, savedIds, showToast, tr } = useContext(Ctx);
  const [tab, setTab] = useState("saved");

  if (!user) {
    return (
      <div className="prof-wrap">
        <div className="empty"><div className="emico">👤</div><p>{tr("profile.signInPrompt")}</p></div>
      </div>
    );
  }

  const contributions = user.contributions ?? 1;
  const tier    = getUserTier(contributions);
  const nextTier = TIER_CONFIG.find(t => t.id === tier.next);
  const progress = nextTier ? Math.min(100, Math.round(((contributions-tier.min)/(tier.max-tier.min+1))*100)) : 100;
  const earnedBadges = user.badges || ["founding"];
  const savedListings = listings.filter(l => savedIds.includes(l.id));
  const activity = getDemoActivity();
  const initials = ((user.firstName?.[0]||"")+(user.lastName?.[0]||""))||user.name?.[0]||"?";

  return (
    <div className="prof-wrap">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <button className="ld-backbtn" onClick={() => setPage("home")}>{tr("listing.back")}</button>
        <button className="btn bo bsm" onClick={() => { setUser(null); setPage("home"); showToast("Signed out"); }}>{tr("profile.signOut")}</button>
      </div>
      <div className="prof-hero">
        <div className="prof-avatar">{initials.toUpperCase()}</div>
        <div className="prof-info">
          <div className="prof-name">{user.name}</div>
          <div className={`prof-tier ${tier.color}`}>{tier.id}</div>
          <div className="prof-stats">
            <div className="prof-stat"><div className="prof-stat-n">{contributions}</div><div className="prof-stat-l">{tr("profile.contributions")}</div></div>
            <div className="prof-stat"><div className="prof-stat-n">{user.reviews??0}</div><div className="prof-stat-l">{tr("profile.reviews")}</div></div>
            <div className="prof-stat"><div className="prof-stat-n">{savedIds.length}</div><div className="prof-stat-l">{tr("profile.saved")}</div></div>
            <div className="prof-stat"><div className="prof-stat-n">{user.nominations??1}</div><div className="prof-stat-l">{tr("profile.nominated")}</div></div>
          </div>
          {nextTier && (
            <div className="prof-progress">
              <div className="prof-progress-label">
                <span>{tr("profile.progressTo")} <strong>{nextTier.id}</strong></span>
                <span>{contributions} / {tier.max+1}</span>
              </div>
              <div className="prof-progress-bar"><div className="prof-progress-fill" style={{width:`${progress}%`}} /></div>
              <div className="prof-progress-next">{tier.max+1-contributions} {tr("profile.moreContribs")}{tier.max+1-contributions!==1?"s":""} {tr("profile.toReach")} {nextTier.id}</div>
            </div>
          )}
        </div>
      </div>

      <div className="atabs" style={{ marginTop:20 }}>
        {[["saved",tr("profile.saved")],["quiver","🏄 Quiver"],["activity",tr("profile.activity")],["badges",tr("profile.badges")]].map(([t,l]) => (
          <button key={t} className={`atab ${tab===t?"on":""}`} onClick={()=>setTab(t)}>{l}</button>
        ))}
      </div>

      {tab==="quiver"   && <QuiverTab listings={listings} />}
      {tab==="badges"   && (
        <div>
          <p style={{fontSize:13,color:"var(--tx2)",marginBottom:16,lineHeight:1.6}}>{tr("profile.badgesDesc")}</p>
          <div className="prof-badges-grid">
            {BADGE_DEFS.map(b => {
              const earned = earnedBadges.includes(b.id);
              return (
                <div key={b.id} className={`prof-badge ${earned?"earned":"locked"}`}>
                  <div className="prof-badge-icon">{earned?b.icon:"🔒"}</div>
                  <div className="prof-badge-label">{b.label}</div>
                  <div className="prof-badge-desc">{b.desc}</div>
                  <div className={`prof-badge-tier ${b.tier}`}>{b.tier}</div>
                  {!earned && <div style={{fontSize:10,color:"var(--txm)",marginTop:2}}>{tr("profile.notYetEarned")}</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}
      {tab==="activity" && (
        <div>
          <p style={{fontSize:13,color:"var(--tx2)",marginBottom:16}}>{tr("profile.memberSince")} {user.joinDate||"2026"}</p>
          <div className="prof-activity">
            {activity.map((a,i) => (
              <div key={i} className="prof-act-row">
                <div className="prof-act-icon">{a.icon}</div>
                <div>
                  <div className="prof-act-text" dangerouslySetInnerHTML={{__html:a.text}} />
                  <div className="prof-act-date">{a.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab==="saved" && (
        <div>
          {savedListings.length===0
            ? <div className="empty"><div className="emico">🔖</div><p>{tr("profile.noSaved")}</p><button className="btn bp" onClick={()=>setPage("home")}>{tr("saved.browse")}</button></div>
            : <div className="grid">{savedListings.map(l=><Card key={l.id} listing={l} onClick={()=>{}} />)}</div>
          }
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// DATA MANAGEMENT
// ─────────────────────────────────────────────
function DataManagement() {
  const { listings, setListings, showToast } = useContext(Ctx);
  const [open, setOpen]     = useState(false);
  const [dragDb, setDragDb] = useState(null);
  const [imported, setImported] = useState({});
  const fileRefs = { shapers: useRef(), boards: useRef(), knowledge: useRef(), reviews: useRef() };

  const handleFile = async (dbKey, file) => {
    if (!file) return;
    console.log("[CSV Upload] Starting upload for:", dbKey, file.name);
    const reader = new FileReader();
    reader.onload = async e => {
      const text = e.target.result;
      console.log("[CSV Upload] File read, length:", text.length);
      let updated = listings; let count = 0;
      try {
        if (dbKey==="shapers") { 
          const parsed = parseShapersCSV(text); 
          count = parsed.length; 
          console.log("[CSV Upload] Parsed shapers:", count);
          const ids = new Set(listings.map(l=>String(l.id))); 
          const newOnes = parsed.filter(p=>!ids.has(String(p.id))); 
          updated = [...listings.map(l=>{const match=parsed.find(p=>String(p.id)===String(l.id));return match?{...l,...match}:l;}),...newOnes]; 
          console.log("[CSV Upload] Updated listings count:", updated.length);
        }
        else if (dbKey==="boards") { updated=parseBoardsCSV(text,listings); count=text.trim().split("\n").length-1; }
        else if (dbKey==="knowledge") { updated=parseKnowledgeCSV(text,listings); count=text.trim().split("\n").length-1; }
        else if (dbKey==="reviews") { updated=parseReviewsCSV(text,listings); count=text.trim().split("\n").length-1; }
        
        // Save to backend
        console.log("[CSV Upload] Saving to backend, listings:", updated.length);
        try {
          const res = await fetch(`${API_BASE}/api/listings/bulk`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ listings: updated })
          });
          console.log("[CSV Upload] Backend response status:", res.status);
          if (!res.ok) throw new Error("Failed to save to server");
          const data = await res.json();
          console.log("[CSV Upload] Backend response:", data);
          showToast(`${dbKey} updated — ${data.inserted} new, ${data.updated} updated`);
        } catch (err) {
          console.error("[CSV Upload] Failed to save to backend:", err);
          showToast(`${dbKey} updated locally — ${count} row${count!==1?"s":""} (server sync failed)`);
        }
        
        setListings(updated); setImported(p=>({...p,[dbKey]:count}));
      } catch(err) { 
        console.error("[CSV Upload] Error:", err);
        showToast("Error reading file — check the format"); 
      }
    };
    reader.readAsText(file);
  };

  const databases = [
    { key:"shapers", label:"Shapers Directory", desc:"Master listing for all shapers and glassers.", cols:SHAPERS_HEADERS, count:listings.length, onDown:()=>downloadCSV("shapers-directory.csv",shapersToCSV(listings)) },
    { key:"boards", label:"Board Portfolio", desc:"One row per board model.", cols:BOARDS_HEADERS, count:listings.reduce((n,l)=>n+(l.boards||[]).length,0), onDown:()=>downloadCSV("board-portfolio.csv",boardsToCSV(listings)) },
    { key:"knowledge", label:"Shaping Knowledge", desc:"One row per knowledge card.", cols:KNOWLEDGE_HEADERS, count:listings.reduce((n,l)=>n+(l.knowledge||[]).length,0), onDown:()=>downloadCSV("shaping-knowledge.csv",knowledgeToCSV(listings)) },
    { key:"reviews", label:"Reviews", desc:"All approved and pending reviews.", cols:REVIEWS_HEADERS, count:listings.reduce((n,l)=>n+(l.reviews||[]).length,0), onDown:()=>downloadCSV("reviews.csv",reviewsToCSV(listings)) },
    { key:"questions", label:"Ask a Shaper", desc:"Export only — all questions with upvote counts.", cols:QUESTIONS_HEADERS, count:listings.reduce((n,l)=>n+(l.questions||[]).length,0), onDown:()=>downloadCSV("ask-a-shaper.csv",questionsToCSV(listings)), exportOnly:true },
  ];

  return (
    <div className="dm-wrap">
      <button className={`dm-toggle ${open?"open":""}`} onClick={()=>setOpen(o=>!o)}>
        <span style={{display:"flex",alignItems:"center",gap:8}}><span>📂</span><span>Data Management — Download &amp; Upload CSVs</span></span>
        <span className="dm-toggle-arrow">▼</span>
      </button>
      {open && (
        <div className="dm-body">
          <p style={{fontSize:13,color:"var(--tx2)",lineHeight:1.7,marginBottom:4}}>Download any database as a CSV, edit in Excel or Google Sheets, then re-upload to merge changes.</p>
          {databases.map(db => (
            <div key={db.key} className="dm-db">
              <div className="dm-db-head">
                <div><div className="dm-db-title">{db.label}</div><div className="dm-db-meta">{db.count} record{db.count!==1?"s":""} currently</div></div>
                {imported[db.key] && <div className="dm-success">✓ {imported[db.key]} rows imported</div>}
              </div>
              <div className="dm-db-desc">{db.desc}</div>
              <div className="dm-db-cols">{db.cols.map(c=><span key={c} className="dm-db-col">{c}</span>)}</div>
              <div className="dm-actions">
                <button className="btn bp bsm" onClick={db.onDown}>↓ Download {db.label}</button>
                {!db.exportOnly && (
                  <label className={`dm-dropzone ${dragDb===db.key?"drag":""}`}
                    onDragOver={e=>{e.preventDefault();setDragDb(db.key)}} onDragLeave={()=>setDragDb(null)}
                    onDrop={e=>{e.preventDefault();setDragDb(null);handleFile(db.key,e.dataTransfer.files[0])}}>
                    <input ref={fileRefs[db.key]} type="file" accept=".csv" onChange={e=>{if(e.target.files[0])handleFile(db.key,e.target.files[0])}} />
                    ↑ Upload updated CSV
                  </label>
                )}
                {db.exportOnly && <span style={{fontSize:12,color:"var(--txm)"}}>Export only</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// ADMIN PAGE
// ─────────────────────────────────────────────
function AnalyticsTab({ listings }) {
  const [clicks, setClicks] = useState([]);
  useEffect(() => { try { setClicks(JSON.parse(localStorage.getItem("ss_clicks")||"[]")); } catch(_) {} }, []);
  const total = clicks.length;
  const sessions = new Set(clicks.map(c=>c.session)).size;

  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:14,marginBottom:20}}>
        {[["Outbound Clicks",total,"All tracked link clicks"],["Sessions",sessions,"Unique browser sessions"],["Board Link Clicks",clicks.filter(c=>c.type==="board_link").length,"Portfolio → shaper website"]].map(([l,n,s])=>(
          <div key={l} className="an-stat"><div className="an-stat-n">{n||"—"}</div><div className="an-stat-l">{l}</div><div className="an-stat-sub">{s}</div></div>
        ))}
      </div>
      {total===0 ? (
        <div className="an-sec">
          <div className="an-empty">
            <div style={{fontSize:36,marginBottom:12}}>📊</div>
            <div style={{fontWeight:600,marginBottom:8,color:"var(--tx)"}}>No click data yet</div>
            <div>Click tracking starts when someone visits a shaper profile and clicks a link.</div>
          </div>
        </div>
      ) : (
        <div className="an-sec">
          <h3>Recent Clicks</h3>
          {clicks.slice(-10).reverse().map((c,i)=>(
            <div key={i} className="an-row">
              <div className="an-row-label" style={{fontSize:12}}>{c.listingName} — {c.label}</div>
              <div style={{fontSize:11,color:"var(--txm)"}}>{new Date(c.timestamp).toLocaleTimeString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminPage() {
  const { pending, setPending, listings, setListings, showToast, categories, setCategories, heroImage, setHeroImage, logoImage, setLogoImage, pendingReviews, setPendingReviews } = useContext(Ctx);
  const [tab, setTab]         = useState("pending");
  const [editTarget, setEdit] = useState(null);
  const [showCM, setShowCM]   = useState(false);
  const [heroDrag, setHeroDrag] = useState(false);
  const [logoDrag, setLogoDrag] = useState(false);
  const heroRef = useRef();
  const logoRef = useRef();
  const csvRef  = useRef();
  
  // Live listings search & filter state
  const [liveSearch, setLiveSearch] = useState("");
  const [liveFilters, setLiveFilters] = useState({ type: "", country: "", featured: "", premium: "", category: "" });
  const [showLiveFilters, setShowLiveFilters] = useState(false);

  const approve = async item => { 
    const newListing = {...item, approved:true};
    setListings(p=>[...p, newListing]); 
    setPending(p=>p.filter(x=>x.id!==item.id)); 
    showToast(`"${item.name}" approved!`);
    // Sync to backend
    try {
      await fetch(`${API_BASE}/api/listings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newListing)
      });
    } catch (err) { console.error("Failed to sync approval:", err); }
  };
  const reject  = item => { setPending(p=>p.filter(x=>x.id!==item.id)); showToast(`"${item.name}" rejected.`); };
  const toggleF = async id => {
    const listing = listings.find(l => l.id === id);
    const updated = {...listing, featured: !listing.featured};
    setListings(p=>p.map(l=>l.id===id?updated:l));
    try {
      await fetch(`${API_BASE}/api/listings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });
    } catch (err) { console.error("Failed to sync featured toggle:", err); }
  };
  const toggleP = async id => {
    const listing = listings.find(l => l.id === id);
    const updated = {...listing, premium: !listing.premium};
    setListings(p=>p.map(l=>l.id===id?updated:l));
    try {
      await fetch(`${API_BASE}/api/listings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });
    } catch (err) { console.error("Failed to sync premium toggle:", err); }
  };
  const save = async u => { 
    setListings(p=>p.map(l=>l.id===u.id?u:l)); 
    setEdit(null); 
    showToast("Updated!");
    try {
      await fetch(`${API_BASE}/api/listings/${u.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(u)
      });
    } catch (err) { console.error("Failed to sync update:", err); }
  };
  const del = async id => { 
    if (window.confirm("Delete this listing?")) { 
      setListings(p=>p.filter(l=>l.id!==id)); 
      showToast("Deleted.");
      try {
        await fetch(`${API_BASE}/api/listings/${id}`, { method: "DELETE" });
      } catch (err) { console.error("Failed to sync deletion:", err); }
    } 
  };

  // Filter live listings
  const filteredListings = listings.filter(l => {
    const searchMatch = !liveSearch || 
      l.name.toLowerCase().includes(liveSearch.toLowerCase()) ||
      (l.tagline||"").toLowerCase().includes(liveSearch.toLowerCase()) ||
      (l.country||"").toLowerCase().includes(liveSearch.toLowerCase()) ||
      (l.address||"").toLowerCase().includes(liveSearch.toLowerCase());
    const typeMatch = !liveFilters.type || l.type === liveFilters.type;
    const countryMatch = !liveFilters.country || l.country === liveFilters.country;
    const featuredMatch = !liveFilters.featured || 
      (liveFilters.featured === "yes" && l.featured) || 
      (liveFilters.featured === "no" && !l.featured);
    const premiumMatch = !liveFilters.premium || 
      (liveFilters.premium === "yes" && l.premium) || 
      (liveFilters.premium === "no" && !l.premium);
    const categoryMatch = !liveFilters.category || (l.category||[]).includes(liveFilters.category);
    return searchMatch && typeMatch && countryMatch && featuredMatch && premiumMatch && categoryMatch;
  });

  const clearLiveFilters = () => setLiveFilters({ type: "", country: "", featured: "", premium: "", category: "" });
  const hasActiveFilters = Object.values(liveFilters).some(v => v !== "");

  const approveReview = async rv => {
    const listing = listings.find(l => l.id === rv.listingId);
    const updatedListing = {...listing, reviews: [...(listing.reviews||[]), {...rv, approved:true}]};
    setListings(p=>p.map(l=>l.id===rv.listingId?updatedListing:l));
    setPendingReviews(p=>p.filter(r=>r.id!==rv.id)); 
    showToast("Review approved!");
    try {
      await fetch(`${API_BASE}/api/listings/${rv.listingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedListing)
      });
    } catch (err) { console.error("Failed to sync review approval:", err); }
  };
  const rejectReview = rv => { setPendingReviews(p=>p.filter(r=>r.id!==rv.id)); showToast("Review rejected."); };

  const handleHeroFile = file => {
    if (file.size > 2000000) {
      showToast("Image too large! Please use a URL instead (e.g. imgur.com)");
      return;
    }
    const r = new FileReader();
    r.onload = e => { setHeroImage(e.target.result); showToast("Hero image updated!"); };
    r.readAsDataURL(file);
  };

  const handleLogoFile = file => {
    const r = new FileReader();
    r.onload = e => { setLogoImage(e.target.result); showToast("Site logo updated!"); };
    r.readAsDataURL(file);
  };

  const handleCSV = file => {
    const r = new FileReader();
    r.onload = e => { const parsed=parseCSV(e.target.result); if(parsed.length){setListings(p=>[...p,...parsed]);showToast(`Imported ${parsed.length} listings!`);}else showToast("No valid rows found."); };
    r.readAsText(file);
  };

  return (
    <div className="adp">
      <h1>Admin Panel</h1>
      <p className="addesc">Manage listings, submissions, reviews, analytics, and site content.</p>
      <div className="atabs">
        {[
          ["pending",  `Pending (${pending.length})`],
          ["reviews",  `Reviews (${pendingReviews.length})`],
          ["live",     `Live (${listings.length})`],
          ["analytics","📊 Analytics"],
          ["hero",     "Hero Image"],
        ].map(([t,l]) => (
          <button key={t} className={`atab ${tab===t?"on":""}`} onClick={()=>setTab(t)}>{l}</button>
        ))}
        <button className="atab" onClick={()=>setShowCM(true)}>⊕ Categories</button>
      </div>

      {tab==="reviews" && (
        pendingReviews.length===0
          ? <div className="empty"><div className="emico">✅</div><p>No reviews awaiting approval.</p></div>
          : pendingReviews.map(rv => {
              const listing = listings.find(l=>l.id===rv.listingId);
              return (
                <div key={rv.id} className="acard">
                  <div className="ainfo">
                    <h4>{[1,2,3,4,5].map(n=><span key={n} style={{color:n<=rv.rating?"#f0c84a":"var(--bd)",fontSize:14}}>★</span>)} {rv.author}</h4>
                    <p style={{fontStyle:"italic",color:"var(--tx2)",fontSize:13,margin:"6px 0"}}>"{rv.text}"</p>
                    <p className="sub">For: <strong>{listing?.name||"Unknown"}</strong>{rv.board?` · ${rv.board}`:""}</p>
                  </div>
                  <div className="aacts">
                    <button className="btn bsm bap" onClick={()=>approveReview(rv)}>✓ Approve</button>
                    <button className="btn bsm brej" onClick={()=>rejectReview(rv)}>✕ Reject</button>
                  </div>
                </div>
              );
            })
      )}

      {tab==="analytics" && <AnalyticsTab listings={listings} />}

      {tab==="hero" && (
        <div>
          {/* ── SITE LOGO ── */}
          <div className="logo-upload-section">
            <h4>🏷 Site Logo</h4>
            <p>Upload your brand logo — shown in the top-left navigation bar. Recommended: square PNG with transparent background, at least 100×100px.</p>
            {logoImage && (
              <div className="logo-preview-row">
                <div className="logo-preview-box"><img src={logoImage} alt="Logo preview" /></div>
                <div>
                  <div style={{fontSize:13,fontWeight:500,marginBottom:4}}>Current logo</div>
                  <button className="btn brej bsm" onClick={()=>{setLogoImage("");showToast("Logo removed.");}}>Remove</button>
                </div>
              </div>
            )}
            <div
              className={`logo-upload-zone ${logoDrag?"drag":""}`}
              onDragOver={e=>{e.preventDefault();setLogoDrag(true)}} onDragLeave={()=>setLogoDrag(false)}
              onDrop={e=>{e.preventDefault();setLogoDrag(false);const f=e.dataTransfer.files[0];if(f)handleLogoFile(f);}}
              onClick={()=>logoRef.current.click()}
            >
              <input ref={logoRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{if(e.target.files[0])handleLogoFile(e.target.files[0]);}} />
              🖼 Drop logo here or click to upload
            </div>
            <div className="fg" style={{marginTop:10}}>
              <label className="fl">Or paste a logo URL</label>
              <input className="fi" placeholder="https://…" value={logoImage||""} onChange={e=>setLogoImage(e.target.value)} />
            </div>
          </div>

          {/* ── HERO IMAGE ── */}
          <p style={{fontSize:14,color:"var(--tx2)",marginBottom:16}}>
            Add a hero image using a <strong>URL</strong> (recommended) or upload a small file (&lt;2MB).
          </p>
          <div className="fg" style={{marginBottom:16}}>
            <label className="fl">Paste a hero image URL (recommended)</label>
            <input className="fi" placeholder="https://imgur.com/your-image.jpg" value={heroImage||""} onChange={e=>setHeroImage(e.target.value)} />
            <p className="imghint">Tip: Upload your image to <strong>imgur.com</strong> or <strong>cloudinary.com</strong>, then paste the direct image URL here.</p>
          </div>
          {heroImage && <img className="current-hero-preview" src={heroImage} alt="Current hero" />}
          <div className={`hero-upload-zone ${heroDrag?"drag":""}`}
            onDragOver={e=>{e.preventDefault();setHeroDrag(true)}} onDragLeave={()=>setHeroDrag(false)}
            onDrop={e=>{e.preventDefault();setHeroDrag(false);const f=e.dataTransfer.files[0];if(f)handleHeroFile(f)}}
            onClick={()=>heroRef.current.click()}>
            <input ref={heroRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{if(e.target.files[0])handleHeroFile(e.target.files[0])}} />
            <div className="huz-ico">🖼️</div>
            <div className="huz-p">Or upload a small image (&lt;2MB)</div>
            <div className="huz-s">Large files won't persist — use a URL instead</div>
          </div>
          {heroImage && <button className="btn brej bsm" style={{marginTop:8}} onClick={()=>{setHeroImage("");showToast("Removed.");}}>Remove Hero Image</button>}
        </div>
      )}

      {tab==="pending" && (
        <div>
          {pending.length===0
            ? <div className="empty"><div className="emico">✅</div><p>No pending submissions.</p></div>
            : pending.map(item=>(
                <div key={item.id} className="acard">
                  <div className="ainfo">
                    <h4>{item.name}</h4>
                    <p>{item.tagline}</p>
                    <p className="sub">By {item.submitterName||"anon"} · {item.email} · {item.pendingDate}</p>
                    {item.relationship && <p className="sub">Relationship: {item.relationship}</p>}
                  </div>
                  <div className="aacts">
                    <button className="btn bsm bap" onClick={()=>approve(item)}>✓ Approve</button>
                    <button className="btn bsm brej" onClick={()=>reject(item)}>✕ Reject</button>
                  </div>
                </div>
              ))
          }
          <DataManagement />
        </div>
      )}

      {tab==="live" && (
        <div>
          {/* Search & Filter Bar */}
          <div style={{display:"flex", gap:"10px", marginBottom:"16px", flexWrap:"wrap", alignItems:"center"}}>
            <div style={{flex:"1", minWidth:"200px", position:"relative"}}>
              <input 
                className="fi" 
                placeholder="Search listings..." 
                value={liveSearch} 
                onChange={e => setLiveSearch(e.target.value)}
                style={{paddingLeft:"36px"}}
              />
              <span style={{position:"absolute", left:"12px", top:"50%", transform:"translateY(-50%)", color:"var(--txm)"}}>🔍</span>
            </div>
            <button 
              className={`btn bo ${hasActiveFilters ? "active" : ""}`} 
              onClick={() => setShowLiveFilters(!showLiveFilters)}
              style={{display:"flex", alignItems:"center", gap:"6px"}}
            >
              ⚙️ Filters {hasActiveFilters && <span style={{background:"var(--g)", color:"#fff", borderRadius:"10px", padding:"1px 6px", fontSize:"11px"}}>{Object.values(liveFilters).filter(v=>v).length}</span>}
            </button>
            {hasActiveFilters && <button className="btn bg" onClick={clearLiveFilters}>Clear</button>}
            <span style={{fontSize:"13px", color:"var(--txm)"}}>{filteredListings.length} of {listings.length} listings</span>
          </div>

          {/* Filter Panel */}
          {showLiveFilters && (
            <div style={{background:"var(--bg)", border:"1px solid var(--bd)", borderRadius:"12px", padding:"16px 20px", marginBottom:"16px"}}>
              <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(150px, 1fr))", gap:"12px"}}>
                <div className="fg" style={{marginBottom:0}}>
                  <label className="fl">Type</label>
                  <select className="fs" value={liveFilters.type} onChange={e => setLiveFilters(p=>({...p, type: e.target.value}))}>
                    <option value="">All Types</option>
                    {["Shaper","Glasser","Retail","Service","Supplier","Manufacturer","School","Other"].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="fg" style={{marginBottom:0}}>
                  <label className="fl">Country</label>
                  <select className="fs" value={liveFilters.country} onChange={e => setLiveFilters(p=>({...p, country: e.target.value}))}>
                    <option value="">All Countries</option>
                    {COUNTRIES.filter(c=>c!=="All Countries").map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="fg" style={{marginBottom:0}}>
                  <label className="fl">Category</label>
                  <select className="fs" value={liveFilters.category} onChange={e => setLiveFilters(p=>({...p, category: e.target.value}))}>
                    <option value="">All Categories</option>
                    {categories.filter(c=>c.id!=="all").map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                <div className="fg" style={{marginBottom:0}}>
                  <label className="fl">Featured</label>
                  <select className="fs" value={liveFilters.featured} onChange={e => setLiveFilters(p=>({...p, featured: e.target.value}))}>
                    <option value="">All</option>
                    <option value="yes">Featured Only</option>
                    <option value="no">Not Featured</option>
                  </select>
                </div>
                <div className="fg" style={{marginBottom:0}}>
                  <label className="fl">Premium</label>
                  <select className="fs" value={liveFilters.premium} onChange={e => setLiveFilters(p=>({...p, premium: e.target.value}))}>
                    <option value="">All</option>
                    <option value="yes">Premium Only</option>
                    <option value="no">Not Premium</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Listings */}
          {filteredListings.length === 0 ? (
            <div className="empty"><div className="emico">🔍</div><p>No listings match your search/filters.</p></div>
          ) : filteredListings.map(l=>(
            <div key={l.id} className="acard">
              <div className="ainfo">
                <h4><LogoImg listing={l} /><span>{l.name}</span></h4>
                <p>{l.tagline}</p>
                <p className="sub">{l.type} · {l.country||"No country"} {(l.category||[]).length > 0 && `· ${(l.category||[]).slice(0,2).join(", ")}`}</p>
                <div style={{display:"flex", gap:"16px", flexWrap:"wrap", marginTop:"8px"}}>
                  <div className="togrow" onClick={()=>toggleF(l.id)}>
                    <div className={`tog ${l.featured?"on":""}`} />
                    <span>{l.featured?"⭐ Featured":"Not featured"}</span>
                  </div>
                  <div className="togrow" onClick={()=>toggleP(l.id)}>
                    <div className={`tog ${l.premium?"on":""}`} style={{background: l.premium ? "#8b5cf6" : "var(--bd)"}} />
                    <span>{l.premium?"💎 Premium":"Not premium"}</span>
                  </div>
                </div>
              </div>
              <div className="aacts">
                <button className="btn bsm bed" onClick={()=>setEdit(l)}>✏️ Edit</button>
                <button className="btn bsm brej" onClick={()=>del(l.id)}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editTarget && <EditModal listing={editTarget} categories={categories} onSave={save} onClose={()=>setEdit(null)} />}
      {showCM && <CatManagerModal categories={categories} onSave={cats=>{setCategories(cats);showToast("Categories saved!");}} onClose={()=>setShowCM(false)} />}
    </div>
  );
}

// ─────────────────────────────────────────────
// SAVED PAGE
// ─────────────────────────────────────────────
function SavedPage({ listings }) {
  const { savedIds, setPage, tr } = useContext(Ctx);
  const saved = listings.filter(l => savedIds.includes(l.id));
  return (
    <div className="savp">
      <div className="pgh"><h1>{tr("saved.title")}</h1><p style={{color:"var(--tx2)",fontSize:14}}>{tr("saved.subtitle")}</p></div>
      {saved.length===0
        ? <div className="empty"><div className="emico">🔖</div><p>{tr("saved.empty")}</p><button className="btn bp" onClick={()=>setPage("home")}>{tr("saved.browse")}</button></div>
        : <div className="grid">{saved.map(l=><Card key={l.id} listing={l} onClick={()=>{}} />)}</div>
      }
    </div>
  );
}

// ─────────────────────────────────────────────
// APP ROOT
// ─────────────────────────────────────────────
export default function App() {
  const [page,       setPage]       = useState("home");
  const [activeCat,  setCat]        = useState("all");
  const [search,     setSearch]     = useState("");
  const [modal,      setModal]      = useState(null);
  const [user,       setUser]       = useState(() => {
    try {
      const saved = localStorage.getItem("ss_user");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [savedIds,   setSavedIds]   = useState(() => {
    try {
      const savedUser = localStorage.getItem("ss_user");
      if (savedUser) {
        const u = JSON.parse(savedUser);
        const key = `ss_saved_${u.email}`;
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : [];
      }
      return [];
    } catch { return []; }
  });
  const [listings,   setListings]   = useState(SAMPLE_LISTINGS);
  const [listingsLoaded, setListingsLoaded] = useState(false);
  const [pending,        setPending]        = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [selected,   setSelected]   = useState(null);
  const [toast,      setToast]      = useState(null);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [heroImage,  setHeroImage]  = useState(() => {
    try { return localStorage.getItem("ss_heroImage") || ""; } catch { return ""; }
  });
  const [logoImage,  setLogoImage]  = useState(() => {
    try { return localStorage.getItem("ss_logoImage") || ""; } catch { return ""; }
  });
  const [locale,     setLocale]     = useState(() => {
    try { return localStorage.getItem("ss_locale") || "en-AU"; } catch { return "en-AU"; }
  });
  const [filterCountries, setFilterCountries] = useState([]);

  // Persist locale to localStorage
  useEffect(() => {
    try { localStorage.setItem("ss_locale", locale); } catch {}
  }, [locale]);

  // Persist hero and logo images to localStorage
  useEffect(() => {
    try { 
      if (heroImage && heroImage.length > 2000000) {
        console.warn("Hero image too large for localStorage, use a URL instead");
      } else {
        localStorage.setItem("ss_heroImage", heroImage); 
      }
    } catch (e) { 
      console.error("Failed to save hero image:", e);
    }
  }, [heroImage]);
  useEffect(() => {
    try { 
      if (logoImage && logoImage.length > 500000) {
        console.warn("Logo image too large for localStorage, use a URL instead");
      } else {
        localStorage.setItem("ss_logoImage", logoImage); 
      }
    } catch (e) {
      console.error("Failed to save logo image:", e);
    }
  }, [logoImage]);
  // Load listings from backend on startup
  useEffect(() => {
    fetch(`${API_BASE}/api/listings`)
      .then(res => res.json())
      .then(data => {
        if (data.listings && data.listings.length > 0) {
          setListings(data.listings);
        }
        setListingsLoaded(true);
      })
      .catch(err => {
        console.error("Failed to load listings:", err);
        setListingsLoaded(true);
      });
  }, []);

  // Persist user to localStorage
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem("ss_user", JSON.stringify(user));
      } else {
        localStorage.removeItem("ss_user");
      }
    } catch {}
  }, [user]);

  // Load savedIds when user changes (login/logout)
  useEffect(() => {
    if (user?.email) {
      // Load from backend
      fetch(`${API_BASE}/api/bookmarks/${encodeURIComponent(user.email)}`)
        .then(res => res.json())
        .then(data => {
          setSavedIds(data.savedIds || []);
          // Also cache locally
          try {
            const key = `ss_saved_${user.email}`;
            localStorage.setItem(key, JSON.stringify(data.savedIds || []));
          } catch {}
        })
        .catch(() => {
          // Fallback to localStorage
          try {
            const key = `ss_saved_${user.email}`;
            const saved = localStorage.getItem(key);
            setSavedIds(saved ? JSON.parse(saved) : []);
          } catch {
            setSavedIds([]);
          }
        });
    } else {
      setSavedIds([]);
    }
  }, [user?.email]);

  const localeObj = LOCALES.find(l => l.code === locale) || LOCALES[0];
  const tr = key => t(key, locale);

  const showToast   = msg => setToast(msg);
  
  const toggleSave = async (id) => {
    if (!user?.email) return;
    
    // Optimistic update
    setSavedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
    
    try {
      const res = await fetch(`${API_BASE}/api/bookmarks/${encodeURIComponent(user.email)}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: id })
      });
      
      if (res.ok) {
        const data = await res.json();
        setSavedIds(data.savedIds);
        // Update local cache
        try {
          const key = `ss_saved_${user.email}`;
          localStorage.setItem(key, JSON.stringify(data.savedIds));
        } catch {}
      }
    } catch (err) {
      console.error("Failed to save bookmark:", err);
      // Revert optimistic update on error
      setSavedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
    }
  };
  
  const handleAuth  = u   => {
    const role = isAdmin(u.email) ? "superadmin" : "user";
    setUser({ ...u, role });
    setModal(null);
    showToast(role==="superadmin" ? `Welcome back, ${u.name} 👋` : `Welcome, ${u.name}!`);
  };
  const viewListing = l => { setSelected(l); setPage("listing"); };

  const ctx = {
    page, setPage, activeCat, setCat,
    search, setSearch, modal, setModal,
    user, setUser, savedIds, toggleSave,
    listings, setListings, pending, setPending,
    pendingReviews, setPendingReviews,
    showToast, selected, categories, setCategories,
    heroImage, setHeroImage,
    logoImage, setLogoImage,
    locale, setLocale, tr,
    filterCountries, setFilterCountries,
  };

  return (
    <Ctx.Provider value={ctx}>
      <Styles />
      <div className="shell" dir={localeObj.dir}>

        {/* ── NAV ── */}
        <nav className="nav">
          <div className="brand" onClick={() => { setPage("home"); setCat("all"); setSearch(""); }}>
            {logoImage ? (
              <img src={logoImage} alt="Shaper Shed" className="brand-logo" />
            ) : (
              <svg width="34" height="34" viewBox="0 0 100 100" fill="none">
                <ellipse cx="50" cy="50" rx="44" ry="44" stroke="#8B6914" strokeWidth="5" fill="none"/>
                <ellipse cx="50" cy="50" rx="18" ry="35" fill="#8B6914"/>
                <line x1="50" y1="16" x2="50" y2="84" stroke="white" strokeWidth="2.5"/>
              </svg>
            )}
            <div className="brand-text">Shaper Shed</div>
          </div>
          <div className="nav-r">
            <LocalePicker locale={locale} setLocale={setLocale} />
            {/* Submit a Shaper — prominent CTA in nav */}
            <button className="btn bp" onClick={() => setPage("submit")}>＋ Submit a Shaper</button>
            {user ? <>
              <button className={`nav-bm-btn ${savedIds.length>0?"has-saved":""}`} onClick={()=>setPage("saved")}>
                <BookmarkIcon saved={savedIds.length>0} size={15} />
                {tr("nav.saved")}{savedIds.length>0?` (${savedIds.length})`:""}
              </button>
              {user.role==="superadmin" && (
                <button className="nav-admin-btn" onClick={()=>setPage("admin")}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                    <circle cx="18" cy="6" r="3" fill="#f0c84a" stroke="#f0c84a"/>
                    <path d="M18 4v4M16 6h4" stroke="#1c1a14" strokeWidth="1.5"/>
                  </svg>
                  {tr("nav.admin")}
                </button>
              )}
              <button className="btn bo bsm" onClick={()=>setPage("profile")} style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{width:22,height:22,borderRadius:"50%",background:"var(--g)",color:"#fff",fontSize:11,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  {((user.firstName?.[0]||"")+(user.lastName?.[0]||""))||user.name?.[0]||"?"}
                </span>
                {user.firstName||user.name.split(" ")[0]}
              </button>
            </> : <>
              <button className="btn bg" onClick={()=>setModal("in")}>{tr("nav.signin")}</button>
              <button className="btn bo" onClick={()=>setModal("up")}>{tr("nav.join")}</button>
            </>}
          </div>
        </nav>

        {/* ── PAGES ── */}
        <main style={{ flex:1, overflowY:"auto" }}>
          {page==="home"    && <HomePage listings={listings} onView={viewListing} />}
          {page==="listing" && selected && <ListingPage listing={selected} />}
          {page==="submit"  && <SubmitPage />}
          {page==="admin"   && user?.role==="superadmin" && <AdminPage />}
          {page==="admin"   && user?.role!=="superadmin" && (
            <div className="empty" style={{paddingTop:80}}>
              <div className="emico">🔒</div>
              <p>You don't have permission to access this page.</p>
              <button className="btn bp" onClick={()=>setPage("home")}>Back to Directory</button>
            </div>
          )}
          {page==="saved"   && <SavedPage listings={listings} />}
          {page==="profile" && <ProfilePage />}
        </main>

        {/* ── MODALS ── */}
        {modal && <AuthModal mode={modal} onClose={()=>setModal(null)} onAuth={handleAuth} />}
        {toast && <Toast msg={toast} onDone={()=>setToast(null)} />}
      </div>
    </Ctx.Provider>
  );
}
