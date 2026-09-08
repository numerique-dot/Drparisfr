import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'fr' | 'zh' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translateText: (text: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// UI Static Translation Dictionary
const staticTranslations: Record<Language, Record<string, string>> = {
  fr: {
    // Nav & Common
    home: "Accueil",
    services: "Tarifs & Services",
    beforeAfter: "Avant / Après",
    aiStudio: "Studio IA",
    testimonials: "Témoignages",
    clientSpace: "Espace Patient",
    loyaltyCard: "Carte de Fidélité",
    adminSpace: "Espace Admin",
    contact: "Contact",
    bookAppointment: "Prendre rendez-vous",
    viewServices: "Voir les services",
    bookNow: "Réserver",
    cancel: "Annuler",
    anyPractitioner: "Praticien Conseillé",
    anyPractitionerDesc: "Attribue votre créneau au spécialiste le plus tôt disponible.",
    practitionerSelected: "Spécialiste Sélectionné",
    next: "Suivant",
    back: "Retour",
    hours: "Horaires",
    address: "Adresse",
    phone: "Téléphone",
    allRightsReserved: "Tous droits réservés.",
    followUs: "Suivez-nous",
    quickLinks: "Liens rapides",
    findUs: "Nous trouver",
    openNow: "Ouvert",
    closedNow: "Fermé",
    closesAt: "Ferme à 20h00",
    opensTodayAt: "Ouvre à 10h00",
    opensTomorrowAt: "Ouvre demain à 10h00",
    opensMondayAt: "Ouvre lundi à 10h00",
    closingSoon: "Ferme bientôt",
    openingScheduleTitle: "Horaires de l'Institut",
    salonStatusTitle: "Statut d'ouverture",
    monToSat: "Lundi - Samedi",
    sunday: "Dimanche",
    closed: "Fermé",
    parisLocalTime: "Heure de Paris",
    
    // Cookie Banner
    cookieBannerText: "Ce site utilise des cookies pour assurer son bon fonctionnement et améliorer votre expérience.",
    cookieBannerPrivacy: "politique de confidentialité",
    accept: "Accepter",

    // Home Page
    heroTitle: "D.R. Santé & Beauté",
    heroTagline: "L'art des soins de beauté de précision et du bien-être absolu.",
    heroSubtitle: "Institut de Beauté Paris 11",
    aboutTitle: "Votre escale beauté",
    aboutSubtitle: "moderne & raffinée",
    aboutP1: "Idéalement situé au cœur du 11ème arrondissement de Paris, l'institut D.R. Santé & Beauté vous ouvre ses portes pour une parenthèse enchantée de pure détente et d'embellissement.",
    aboutP2: "Nos esthéticiennes qualifiées et passionnées mettent à votre disposition un savoir-faire d'excellence. De la pose minutieuse de faux-ongles, au rehaussement de cils, en passant par des massages relaxants chinois bienfaisants, nous concevons chaque rituel sur-mesure pour magnifier votre beauté naturelle.",
    satisfactionLive: "Satisfaction live",
    activeExperts: "Experts actifs",
    realizationsTitle: "Galerie d'inspirations réelles",
    realizationsSubtitle: "Découvrez les magnifiques réalisations de notre institut en haute définition.",
    realizedAtSalon: "Réalisé à l'Institut",
    realTimeRendering: "Rendu Réel Post-Prestation",
    reserveThisTreatment: "Réserver ce soin",
    detailsSoin: "Soin Réalisé",
    detailsDescription: "Nouveau style",
    backToGallery: "Retour à la Galerie",

    // Services Page
    ourSavoirFaire: "Notre Savoir-faire",
    ourServices: "Nos Prestations",
    servicesIntro: "Chez D.R. Santé & Beauté, chaque soin est une invitation à la détente. Découvrez notre carte complète dédiée à votre beauté dans une ambiance chaleureuse et raffinée.",
    searchPlaceholder: "Rechercher par soin (Ex: vernis, cils, massage...)",
    noServiceMatch: "Aucun soin ne correspond à votre recherche",
    tryOtherTerms: "Essayez d'autres termes d'interrogation ou réinitialisez les filtres.",
    resetSearch: "Réinitialiser la recherche",
    durationLabel: "Durée",
    priceLabel: "Tarif",

    // Before/After Page
    transformationsReal: "TRANSFORMATIONS RÉELLES & ÉCLAT",
    beforeAfterTitle: "Galerie Avant / Après",
    beforeAfterIntro: "Consultez les résultats de nos soins d'embellissement. Chaque comparaison représente une transformation réelle réalisée avec passion et minutie par nos esthéticiennes expertes.",
    beautyProtocol: "Protocole Beauté",
    finalOutcome: "Rendu Final Actuel",
    dragSlider: "Faites glisser pour comparer",

    // Testimonials
    testimonialsTitle: "Témoignages & Avis",
    testimonialsSubtitle: "Ce que disent nos clientes",
    testimonialsIntro: "La plus belle récompense est votre sourire. Découvrez les retours d'expérience de nos magnifiques clientes après leur passage chez nous.",
    writeReview: "Laisser un avis",
    ratingLabel: "Note",
    submit: "Envoyer",

    // Contact Page
    contactTitle: "Contactez-nous",
    contactSubtitle: "Une question ou besoin d'aide ?",
    contactIntro: "Notre équipe est disponible pour répondre à vos questions et vous accueillir dans notre maison de beauté.",
    nameLabel: "Nom complet",
    emailLabel: "Adresse e-mail",
    messageLabel: "Votre message",
    sendMessage: "Envoyer le message",

    // Reservation Page
    reservationTitle: "Prise de rendez-vous en ligne",
    reservationSubtitle: "Réservez votre instant beauté",
    step1: "Soin",
    step2: "Praticienne",
    step3: "Date & Horaire",
    step4: "Vos coordonnées",
    selectServiceStep1: "Sélectionnez votre prestation d'esthétique ou de beauté",
    selectPractitioner: "Choisissez votre conseillère de soin",
    selectDate: "Sélectionnez un jour et un créneau horaire",
    fillInfo: "Saisissez vos coordonnées de réservation",
    notesLabel: "Instructions importantes (facultatif / allergies / préférences)",
    consentRGPD: "J'accepte que mes données soient stockées pour gérer mon rendez-vous.",
    completeBooking: "Confirmer mon rendez-vous",
    bookingSuccess: "Votre rendez-vous a été enregistré !",
    bookingSuccessMessage: "Un e-mail de confirmation reprenant tous les détails du rendez-vous vous a été envoyé. Nous avons hâte de vous chouchouter !",
    newBooking: "Prendre un nouveau rendez-vous"
  },
  zh: {
    // Nav & Common
    home: "首页",
    services: "价目与服务",
    beforeAfter: "前后效果",
    aiStudio: "智能设计",
    testimonials: "顾客口碑",
    clientSpace: "顾客专区",
    loyaltyCard: "会员积分卡",
    adminSpace: "后台管理",
    contact: "联系我们",
    bookAppointment: "在线预约",
    viewServices: "查看所有服务",
    bookNow: "立即预订",
    cancel: "取消",
    anyPractitioner: "推荐理疗师",
    anyPractitionerDesc: "自动为您分配最早可预约的资深技师，省时高效。",
    practitionerSelected: "已选美疗师",
    next: "下一步",
    back: "返回",
    hours: "营业时间",
    address: "店铺地址",
    phone: "联系电话",
    allRightsReserved: "版权所有。",
    followUs: "关注我们",
    quickLinks: "快捷导航",
    findUs: "联系方式",
    openNow: "营业中",
    closedNow: "已打烊",
    closesAt: "20:00 打烊",
    opensTodayAt: "今日 10:00 开门",
    opensTomorrowAt: "明日 10:00 开门",
    opensMondayAt: "周一 10:00 开门",
    closingSoon: "即将打烊",
    openingScheduleTitle: "沙龙营业时间",
    salonStatusTitle: "实时营业状态",
    monToSat: "周一至周六",
    sunday: "周日",
    closed: "休息打烊",
    parisLocalTime: "巴黎当地时间",

    // Cookie Banner
    cookieBannerText: "本网站使用Cookie，以确保网站的正常运行并提升您的用户体验。",
    cookieBannerPrivacy: "隐私政策",
    accept: "接受并关闭",

    // Home Page
    heroTitle: "D.R. Santé & Beauté",
    heroTagline: "巴黎精致美容理疗与品质指甲美睫艺术。",
    heroSubtitle: "巴黎第十一区专业美容沙龙",
    aboutTitle: "您的专属美丽空间",
    aboutSubtitle: "现代 & 优雅精湛",
    aboutP1: "D.R. Santé & Beauté 美容沙龙坐落于巴黎第十一区（50 Rue Popincourt），为您在繁忙的都市生活中提供一处温馨、放松且纯粹的舒缓与保养空间。",
    aboutP2: "我们专业且充满热情的美容师团队为您提供卓越的技术与贴心的服务。从精细的美甲与美睫，到中式经络舒缓按摩、温和蜜蜡脱毛，我们为每一位顾客量身定制护理方案，让您重现自然光彩。",
    satisfactionLive: "实时满意度",
    activeExperts: "资深美容师",
    realizationsTitle: "真实顾客效果展示",
    realizationsSubtitle: "为您展示沙龙内真实顾客在接受精致护理后的极佳效果。",
    realizedAtSalon: "沙龙真实案例",
    realTimeRendering: "无美颜后期真实成效",
    reserveThisTreatment: "预订此项目",
    detailsSoin: "进行的项目",
    detailsDescription: "定制风格",
    backToGallery: "返回画廊",

    // Services Page
    ourSavoirFaire: "我们的专业服务",
    ourServices: "服务价目表",
    servicesIntro: "在 D.R. Santé & Beauté，每一次护理都是一次身心的舒缓与呵护。欢迎浏览我们包含美甲、美睫、脱毛与中式理疗的完整服务价目表。",
    searchPlaceholder: "输入关键字搜索（如：美甲、睫毛、中式按摩...）",
    noServiceMatch: "未找到符合您搜索条件的服务项目",
    tryOtherTerms: "建议您更换搜索词汇，或直接重置并清除所有筛选条件。",
    resetSearch: "重置并重新搜索",
    durationLabel: "项目时长",
    priceLabel: "价格",

    // Before/After Page
    transformationsReal: "最真实的蜕变：见证璀璨瞩目",
    beforeAfterTitle: "前后效果对比图",
    beforeAfterIntro: "在这里，您可以清晰看到我们的多款面部、睫毛、美眉与手足项目，在技艺高纯度的理疗师精修下的蜕变成果。",
    beautyProtocol: "定制美学方案",
    finalOutcome: "顾客当前实拍效果",
    dragSlider: "左右拖动滑块即可进行对比",

    // Testimonials
    testimonialsTitle: "顾客真实好评反馈",
    testimonialsSubtitle: "听听她们怎么说",
    testimonialsIntro: "您满意后的盈盈笑意，是我们毕生追求并感到荣耀的褒奖。下面是多位尊贵顾客在体验后的真实心路历程。",
    writeReview: "留下您宝贵的意见",
    ratingLabel: "打分",
    submit: "提交反馈",

    // Contact Page
    contactTitle: "与我们取得联系",
    contactSubtitle: "有什么问题或需要帮助吗？",
    contactIntro: "我们非常乐意为您解答任何保养或预约相关的疑问，并在巴黎本店恭候您的光临。",
    nameLabel: "全名/姓氏",
    emailLabel: "电子邮箱",
    messageLabel: "您的咨询内容",
    sendMessage: "发送消息",

    // Reservation Page
    reservationTitle: "在线自助快速预约",
    reservationSubtitle: "随时锁定您的美丽时刻",
    step1: "选择项目",
    step2: "选择美疗师",
    step3: "选择时间",
    step4: "填写信息",
    selectServiceStep1: "请选择您今天想要定制的美学或放松目类",
    selectPractitioner: "请挑选为您服务的专属理疗顾问",
    selectDate: "请选定一个您方便的前来日期与具体时刻",
    fillInfo: "请准确填写您用于锁单的个人或预约信息",
    notesLabel: "备注说明（可在此写下您的指甲现状、敏感源、喜好习惯等）",
    consentRGPD: "我同意沙龙安全地保存并处理以上资料，用于预约的跟进与通知服务。",
    completeBooking: "确定提交并锁定预约",
    bookingSuccess: "您的专属预约已圆满成功！",
    bookingSuccessMessage: "我们将确认信与地址信息直接发送到了您的邮箱中。我们已悉心做好准备，期待您的到来！",
    newBooking: "为新项目进行预订"
  },
  en: {
    // Nav & Common
    home: "Home",
    services: "Rates & Services",
    beforeAfter: "Before / After",
    aiStudio: "AI Studio",
    testimonials: "Testimonials",
    clientSpace: "Patient Space",
    loyaltyCard: "Loyalty Card",
    adminSpace: "Admin Space",
    contact: "Contact",
    bookAppointment: "Book Appointment",
    viewServices: "View Services",
    bookNow: "Book Now",
    cancel: "Cancel",
    anyPractitioner: "Recommended Specialist",
    anyPractitionerDesc: "Assigns your slot to the earliest available master for maximum convenience.",
    practitionerSelected: "Selected Master",
    next: "Next",
    back: "Back",
    hours: "Opening Hours",
    address: "Address",
    phone: "Phone",
    allRightsReserved: "All rights reserved.",
    followUs: "Follow us",
    quickLinks: "Quick links",
    findUs: "Find us",
    openNow: "Open",
    closedNow: "Closed",
    closesAt: "Closes at 8:00 PM",
    opensTodayAt: "Opens at 10:00 AM",
    opensTomorrowAt: "Opens tomorrow at 10:00 AM",
    opensMondayAt: "Opens Monday at 10:00 AM",
    closingSoon: "Closing soon",
    openingScheduleTitle: "Salon Hours",
    salonStatusTitle: "Opening Status",
    monToSat: "Monday - Saturday",
    sunday: "Sunday",
    closed: "Closed",
    parisLocalTime: "Paris Local Time",

    // Cookie Banner
    cookieBannerText: "This website uses cookies to configure proper session analytics and perfect your visual experience.",
    cookieBannerPrivacy: "privacy policy",
    accept: "Accept & Dismiss",

    // Home Page
    heroTitle: "D.R. House of Beauty",
    heroTagline: "The supreme art of precision aesthetics and absolute body & mind relaxation.",
    heroSubtitle: "Cosmetics & Pampering Salon · Paris 11",
    aboutTitle: "Your Sanctuary of Care",
    aboutSubtitle: "modern & elegant",
    aboutP1: "Conveniently located in the lively 11th district of Paris (50 Rue Popincourt), D.R. House of Beauty invites you to disconnect from day-to-day stress and enjoy a marvelous cocoon of total relaxation.",
    aboutP2: "Our highly trained and certified beauty specialists provide exceptional spa expertise. From long-lasting chic French manicures, and medical-grade eyelash design, to restorative traditional Chinese massage with natural botanical oils, we personalize every single gesture to amplify your physical posture and natural glow.",
    satisfactionLive: "Customer Satisfaction",
    activeExperts: "Active Experts",
    realizationsTitle: "Real-Life Transformations Display",
    realizationsSubtitle: "Admire actual, razor-sharp high-definition photos of manicures, lashes, and rituals carried out in our salon.",
    realizedAtSalon: "Crafted in Our Salon",
    realTimeRendering: "Zero Filtering Real Outcomes",
    reserveThisTreatment: "Reserve This Treatment",
    detailsSoin: "Service Executed",
    detailsDescription: "Selected style",
    backToGallery: "Back to Gallery",

    // Services Page
    ourSavoirFaire: "Our Craftsmanship",
    ourServices: "Aesthetics Menu",
    servicesIntro: "At D.R. House of Beauty, each customized session represents a sublime ticket to serenity. Discover our fully organic list of nails, eyelash styling, waxing, and deep relaxation massage.",
    searchPlaceholder: "Search for services (e.g. gel, eyebrow, classic, massage...)",
    noServiceMatch: "No appointments match your search terms",
    tryOtherTerms: "Try changing your query keywords, or simply click to reset the search filters.",
    resetSearch: "Reset and clear search query",
    durationLabel: "Duration",
    priceLabel: "Price",

    // Before/After Page
    transformationsReal: "ELEGANT SHIFTS: GLOWING RESULTS",
    beforeAfterTitle: "Before / After Results",
    beforeAfterIntro: "Consult the actual comparative renders of our services. Each slider displays genuine, unaltered transformations executed with extreme dedication by specialists.",
    beautyProtocol: "Beauty Blueprint",
    finalOutcome: "Unretouched Current Outlines",
    dragSlider: "Drag the slider to compare before and after",

    // Testimonials
    testimonialsTitle: "Testimonials & Reviews",
    testimonialsSubtitle: "What our clients recommend",
    testimonialsIntro: "The highest reward is your bright, confident smile. Hear what our regular guests say after experiencing our pampering routines.",
    writeReview: "Share your rating",
    ratingLabel: "Score",
    submit: "Submit",

    // Contact Page
    contactTitle: "Get in Touch",
    contactSubtitle: "Do you have any inquiries?",
    contactIntro: "Our team is entirely accessible to clarify your skin routine doubts and warmly guide you when visiting our Paris salon.",
    nameLabel: "Full Name",
    emailLabel: "Email Address",
    messageLabel: "Your Inquiry",
    sendMessage: "Send Message",

    // Reservation Page
    reservationTitle: "Secure Online Booking Slot",
    reservationSubtitle: "Select times and secure your moment",
    step1: "Soin Category",
    step2: "Esthetician",
    step3: "Ideal Timeslot",
    step4: "Contact Data",
    selectServiceStep1: "Please choose your preferred beautifying or wellness routine",
    selectPractitioner: "Select your preferred personal treatment master",
    selectDate: "Mark your ideal appointment date and pick a specific time",
    fillInfo: "Please input the personal details required to lock this slot",
    notesLabel: "Special requirements / allergies / preferred nail length / comments",
    consentRGPD: "I authorize D.R. Beauty to process my personal data to follow up and manage this appointment schedule.",
    completeBooking: "Authorize and Secure My Slot",
    bookingSuccess: "Your appointment is confirmed!",
    bookingSuccessMessage: "A confirmation mail with location maps and hours has been sent directly. We look forward to welcome you in Paris!",
    newBooking: "Book another treatment"
  }
};

// Word translation directory helper for 77 items dynamic parsing
const wordDictionary: Record<string, Record<string, string>> = {
  // Category mapping
  "I. ÉPILATION": { "en": "I. WAXING SERVICE", "zh": "I. 脱毛" },
  "II. SOINS RELAXANTS": { "en": "II. RESTORATIVE BODY MASSAGE", "zh": "II. 身体放松理疗" },
  "III. EXTENSION DES CILS": { "en": "III. EYELASH & REGARD DESIGN", "zh": "III. 睫毛嫁接" },
  "IV. BEAUTÉ DES MAINS": { "en": "IV. MANICURE & HAND REPAIR", "zh": "IV. 美手艺术" },
  "V. BEAUTÉ DES PIEDS": { "en": "V. PEDICURE & FOOT SPA", "zh": "V. 美足艺术" },
  "VI. POSE FAUX-ONGLES": { "en": "VI. LONG-WEAR FALSE NAILS", "zh": "VI. 贴片与延长甲" },
  "⭐ SOIN SIGNATURE": { "en": "⭐ SIGNATURE GLOW COLLECTION", "zh": "⭐ 招牌特色护理" },
  "⭐ RITUELS SIGNATURE": { "en": "⭐ BRAND EXCLUSIVE TREATMENTS", "zh": "⭐ 招牌特惠套餐" },
  "✨ OPTIONS & NOUVEAUTÉS": { "en": "✨ NAIL ART & NOVELTIES", "zh": "✨ 附加项目与新品" },

  // Before & After categories & titles
  "French Semi-Permanent Perfect": { "en": "French Semi-Permanent Perfect", "zh": "完美法式半永久美甲" },
  "Extension de Cils Volume Glamour": { "en": "Glamour Volume Lash Extensions", "zh": "浓密款睫毛嫁接" },
  "Rituel Beauté des Pieds & SPA": { "en": "Signature Pedicure & Foot SPA Ritual", "zh": "足部美化与SPA面膜套餐" },
  "Pose Faux Ongles Résine & Beauté": { "en": "Artistic Acrylic & Gel Extensions", "zh": "水晶假指甲制作与修护" },
  "Extension Naturel Regard": { "en": "Natural Regard Lash Extensions", "zh": "自然款睫毛嫁接" },
  "Beauté des Pieds de Luxe & Semi": { "en": "Luxe Foot Care & Gel Polish Duo", "zh": "高品质半永久美足" },

  // Procedures & Outcomes translations
  "Dépose douce, manucure russe de précision, préparation de la plaque et pose de vernis semi-permanent French avec renfort.": {
    "en": "Gentle removal, Russian precision manicure, plate deep preparation, and French gel polish application with reinforcement.",
    "zh": "温和卸除、俄式精修、指甲面准备，以及法式半永久加固甲油胶涂抹。"
  },
  "Des ongles perfectly dessinés, renforcés et une French ultra-propre avec une brillance miroir durable.": {
    "en": "Perfectly shaped, reinforced nails and an ultra-clean French finish with long-lasting mirror shine.",
    "zh": "完美修型、加固的指甲与极佳的法式效果，光泽持久。"
  },
  "Isolation rigoureuse cil à cil, application de bouquets faits mains en fibre de soie premium pour un effet étiré sur-mesure.": {
    "en": "Strict isolations per lash, handmade customized premium silk-fiber fan volume placement for custom styling.",
    "zh": "严格的一对一真睫隔离，手工开花优质丝质纤维，实现定制延展效果。"
  },
  "Un regard instantanément agrandi, des cils denses et légers sans aucune surcharge sur la racine naturelle.": {
    "en": "Immediately enlarged and deepened gaze, dense and weightless premium lash texture without damage to natural hairs.",
    "zh": "双眼瞬间放大，睫毛浓密轻盈，真睫根部无负担。"
  },
  "Bain aux sels marins, gommage enzymatique aux pépins de fruits, traitement anti-callosités indolore et massage hydratant.": {
    "en": "Atlantic course mineral sea salt bath, enzyme organic fruit seeds scrub, painless calluses scraping, and hydrating massage.",
    "zh": "海盐足浴、酵素去角质、无痛老茧清理和滋润按摩。"
  },
  "Des talons incroyablement doux, libérés des rugosités et des callosités, avec des ongles coupés et nettoyés.": {
    "en": "Remarkably soft baby heels free of crusts and calluses, fully trimmed toenails with deep side hygiene.",
    "zh": "足跟柔软光滑，去除粗糙与老茧，趾甲修剪并清洁。"
  },
  "Rallongement haut de gamme au chablon avec gel de construction auto-égalisant pour restructurer les ongles rongés ou cassants.": {
    "en": "Superior nail reconstruction sculpting via paper guides with self-leveling hard gel for bitten or damaged nail bases.",
    "zh": "使用自平整凝胶进行纸托假指甲延长，专门修护受损指甲。"
  },
  "Des ongles longs, robustes et à l'aspect incroyablement naturel, prêts pour une pose de couleur unie.": {
    "en": "Fabulous long and sturdy extensions featuring an organically slim look, flawlessly prepared for color painting.",
    "zh": "指甲修长牢固，外观自然，随时可进行单色上色。"
  },
  "Pose de cils individuels ultra-fins cil à cil pour souligner la ligne des yeux tout en discrétion.": {
    "en": "Meticulous single ultra-slim lash application onto individual natural lashes for a discreet but radiant eye outline.",
    "zh": "精细一对一极细睫毛嫁接，自然勾勒眼部线条。"
  },
  "Effet mascara naturel, couraurbe parfaite sans paquet qui dure de 4 à 6 semaines.": {
    "en": "Flawless daily natural mascara look, magnificent curvature without clump that lasts securely for up to 6 weeks.",
    "zh": "自然睫毛膏效果，弧度完美不结块，可持续4至6周。"
  },
  "Effet mascara naturel, courbure parfaite sans paquet qui dure de 4 à 6 semaines.": {
    "en": "Flawless daily natural mascara look, magnificent curvature without clump that lasts securely for up to 6 weeks.",
    "zh": "自然睫毛膏效果，弧度完美不结块，可持续4至6周。"
  },
  "Soin des cuticules, râpe dermatologique, hydratation intense et pose de vernis semi-permanent longue tenue.": {
    "en": "Hygienic cuticle care, dermatological rasp calluses care, intense moisture wraps, and durable gel polish set.",
    "zh": "角质层精修、足底老茧清理、强效保湿，并涂抹半永久甲油胶。"
  },
  "Des orteils impeccables et un vernis ultra-brillant à l'épreuve des chocs pour plus d'un mois.": {
    "en": "Impeccable toenails design and shockproof premium gel shine lasting vibrant for more than 4 weeks.",
    "zh": "脚趾晶莹整洁，色泽明亮且防撞防蹭，可持续一个月以上。"
  },

  // Épilations
  "Sourcils": { "en": "Eyebrows Wax", "zh": "蜜蜡修眉 (Sourcils)" },
  "Lèvres": { "en": "Lips Wax", "zh": "蜜蜡脱唇毛 (Lèvres)" },
  "Narines": { "en": "Nostrils Wax", "zh": "蜜蜡脱鼻毛 (Narines)" },
  "Menton": { "en": "Chin Wax", "zh": "蜜蜡脱下巴毛 (Menton)" },
  "Oreilles": { "en": "Ears Wax", "zh": "蜜蜡脱耳毛 (Oreilles)" },
  "Visage complet": { "en": "Full Face Wax", "zh": "蜜蜡全脸脱毛 (Visage complet)" },
  "Cou": { "en": "Neck Wax", "zh": "蜜蜡脱颈部毛 (Cou)" },
  "Aisselles": { "en": "Underarms Wax", "zh": "蜜蜡脱腋毛 (Aisselles)" },
  "Demi-bras": { "en": "Half Arms Wax", "zh": "蜜蜡脱半臂毛 (Demi-bras)" },
  "Bras entiers": { "en": "Full Arms Wax", "zh": "蜜蜡脱全臂毛 (Bras entiers)" },
  "Torse": { "en": "Chest Wax", "zh": "蜜蜡脱胸部毛 (Torse)" },
  "Ventre": { "en": "Stomach Wax", "zh": "蜜蜡脱腹部毛 (Ventre)" },
  "Dos": { "en": "Back Wax", "zh": "蜜蜡脱后背毛 (Dos)" },
  "Maillot Simple": { "en": "Basic Bikini Wax", "zh": "普通比基尼脱毛 (Maillot Simple)" },
  "Maillot Échancré": { "en": "Extended Bikini Wax", "zh": "高开叉比基尼脱毛 (Maillot Échancré)" },
  "Maillot Intégral": { "en": "Full Bikini Wax", "zh": "全比基尼脱毛 (Maillot Intégral)" },
  "Demi-Jambes": { "en": "Half Legs Wax", "zh": "蜜蜡脱半腿毛 (Demi-Jambes)" },
  "Jambes Entières": { "en": "Full Legs Wax", "zh": "蜜蜡脱全腿毛 (Jambes Entières)" },

  // Épilations packages
  "Demi-Jambes + Aisselles + Maillot Simple": { "en": "Half Legs + Underarms + Basic Bikini", "zh": "半腿 + 腋下 + 普通比基尼" },
  "Demi-Jambes + Aisselles + Maillot Échancré": { "en": "Half Legs + Underarms + Extended Bikini", "zh": "半腿 + 腋下 + 高开叉比基尼" },
  "Demi-Jambes + Aisselles + Maillot Intégral": { "en": "Half Legs + Underarms + Full Bikini", "zh": "半腿 + 腋下 + 全比基尼" },
  "Jambes Entières + Aisselles + Maillot Simple": { "en": "Full Legs + Underarms + Basic Bikini", "zh": "全腿 + 腋下 + 普通比基尼" },
  "Jambes Entières + Aisselles + Maillot Échancré": { "en": "Full Legs + Underarms + Extended Bikini", "zh": "全腿 + 腋下 + 高开叉比基尼" },
  "Jambes Entières + Aisselles + Maillot Intégral": { "en": "Full Legs + Underarms + Full Bikini", "zh": "全腿 + 腋下 + 全比基尼" },

  // Soins Relaxants
  "Massage Chinois - Soin Relaxant (30 min)": { "en": "Traditional Chinese Massage (30 min)", "zh": "中式按摩 - 放松护理 (30分钟)" },
  "Massage Chinois - Soin Relaxant (60 min)": { "en": "Traditional Chinese Massage (60 min)", "zh": "中式按摩 - 放松护理 (60分钟)" },
  "Soins Ciblés - Pieds (30 min)": { "en": "Foot Reflexology (30 min)", "zh": "针对性护理 - 足部 (30分钟)" },
  "Soins Ciblés - Épaules & Cou (15 min)": { "en": "Shoulder & Neck Relief (15 min)", "zh": "针对性护理 - 肩颈 (15分钟)" },

  // Cils
  "Extension Naturel": { "en": "Natural Look Eyelash Extension", "zh": "自然款睫毛嫁接" },
  "Extension Glamour": { "en": "Glamour Volume Eyelash Extension", "zh": "浓密款睫毛嫁接" },
  "Remplissage à 3 semaines": { "en": "Eyelash Refill (within 3 weeks)", "zh": "3周内睫毛修补" },
  "Remplissage à 4 semaines": { "en": "Eyelash Refill (within 4 weeks)", "zh": "4周内睫毛修补" },
  "Dépose des Faux Cils": { "en": "Eyelash Extensions Removal", "zh": "假睫毛卸除" },

  // Mains & Pieds (Pose Vernis / Manucures / SPA / Foot care)
  "Pose Vernis - Vernis Classique": { "en": "Classic Polish Application", "zh": "涂指甲油 - 普通指甲油" },
  "Pose Vernis - Vernis French": { "en": "French Polish Design", "zh": "涂指甲油 - 法式普通指甲油" },
  "Pose Vernis - Semi-Permanent": { "en": "Gel Polish Application", "zh": "涂指甲油 - 半永久甲油胶" },
  "Manucures - Manucure sans couleur": { "en": "Hygienic Classic Manicure (No Polish)", "zh": "手部护理 - 无色护理" },
  "Manucures - Manucure avec classique": { "en": "Classic Manicure with Polish", "zh": "手部护理 - 配合普通指甲油" },
  "Manucures - Manucure avec semi": { "en": "Gel Polish Manicure", "zh": "手部护理 - 配合半永久甲油胶" },
  "Coupe & Vernis - Coupe des Ongles seule": { "en": "Hygienic Toenails Trim Only", "zh": "仅修剪趾甲" },
  "Coupe & Vernis - Coupe avec vernis classique": { "en": "Hygienic Toenails Trim with Polish", "zh": "修剪配合普通指甲油" },
  "Beauté des Pieds - Pieds sans vernis": { "en": "Medical Pedicure (No Polish)", "zh": "足部美化 - 无色美足" },
  "Beauté des Pieds - Pieds avec classique": { "en": "Pedicure with Classic Polish", "zh": "足部美化 - 美足配合普通指甲油" },
  "Beauté des Pieds - Pieds avec semi-permanent": { "en": "Pedicure with Gel Polish", "zh": "足部美化 - 美足配合半永久甲油胶" },

  // Shared SPA and Removal keys to resolve duplicate key build errors
  "Rituel SPA · Avec Masque - SPA sans vernis": { "en": "Deep Hydrating SPA Ceremony (No Polish)", "zh": "SPA面膜仪式 - SPA无色" },
  "Rituel SPA · Avec Masque - SPA classique": { "en": "Deep Hydrating SPA Ceremony with Classic Polish", "zh": "SPA面膜仪式 - SPA配合普通指甲油" },
  "Rituel SPA · Avec Masque - SPA semi-permanent": { "en": "Deep Hydrating SPA Ceremony with Gel Polish", "zh": "SPA面膜仪式 - SPA配合半永久甲油胶" },
  "Dépose Semi-Permanent - Dépose sans nouvelle pose": { "en": "Gel Polish Removal Only", "zh": "半永久甲油胶卸除 - 纯卸除不重做" },
  "Dépose Semi-Permanent - Dépose avec nouvelle pose": { "en": "Gel Polish Removal before New Set", "zh": "半永久甲油胶卸除 - 卸除并重做" },

  // Faux Ongles
  "Pose Résine - Résine sans couleur": { "en": "Acrylic Extensions (No Polish)", "zh": "高级水晶甲延长塑形（无色）" },
  "Pose Résine - Résine + classique": { "en": "Acrylic Extensions + Classic Polish", "zh": "高级水晶甲延长+高光指甲油" },
  "Pose Résine - Résine + semi-permanent": { "en": "Acrylic Extensions + Gel Polish", "zh": "水晶长甲延长+大牌持久甲油胶" },
  "Pose Gel - Gel + semi-permanent": { "en": "Classic Gel Extensions + Gel Polish", "zh": "光疗凝胶制作 - 凝胶 + 半永久甲油胶" },
  "Pose Gel - Gel de Gainage + semi-permanent": { "en": "BIAB Structure Polish (Gainage)", "zh": "光疗凝胶制作 - 凝胶加固 + 半永久甲油胶" },
  "Remplissage · Dépose Offerte - Résine + classique": { "en": "Acrylic Refill (incl. Polish)", "zh": "水晶长甲修补+普通甲油（含卸除）" },
  "Remplissage · Dépose Offerte - Résine + semi-permanent": { "en": "Acrylic Refill with Gel Polish", "zh": "水晶长甲修补+持久甲油胶（含卸除）" },
  "Remplissage · Dépose Offerte - Gel + semi-permanent": { "en": "Classic Gel Refill with Gel Polish", "zh": "光疗凝胶修补（免卸除费） - 凝胶 + 半永久甲油胶" },
  "Remplissage · Dépose Offerte - Gel de Gainage + semi-permanent": { "en": "Gainage Structuring Refill with Gel", "zh": "光疗凝胶修补（免卸除费） - 凝胶加固 + 半永久甲油胶" },
  "Finitions & Suppléments - Enlever les Faux-Ongles": { "en": "Acrylic/Gel Extensions Full Removal", "zh": "修饰与附加项 - 卸除假指甲" },
  "Finitions & Suppléments - Dessin sur Ongle (par ongle)": { "en": "Bespoke Nail Art Detail (per nail)", "zh": "修饰与附加项 - 指甲手绘（单指）" },
  "Finitions & Suppléments - French Simple (supplément)": { "en": "Elegant French Styling Surcharge", "zh": "修饰与附加项 - 简易法式款式（附加费）" },

  // Signature and Rituals
  "⭐ SOIN SIGNATURE — Soin du Visage": { "en": "⭐ SIGNATURE TREATMENT — Facial Care", "zh": "⭐ 招牌特色护理 — 面部护理" },
  "Rituel 01 : Le Classique": { "en": "Ritual 01 : The Timeless Duo", "zh": "套餐 01 : 经典双人（手部+足部 普通指甲油）" },
  "Rituel 02 : Le Précieux": { "en": "Ritual 02 : The Pearl Duet", "zh": "套餐 02 : 珍贵双人（手部+足部 半永久甲油胶）" },
  "Rituel 03 : L'Exception": { "en": "Ritual 03 : The Imperial Treatment", "zh": "套餐 03 : 至臻修护（手部+足部 半永久 卸除重做）" },

  // New Additions (Options & Nouveautés)
  "French Simple": { "en": "Chic Simple French Line Design", "zh": "简易法式" },
  "Miroir": { "en": "CatWalk Metallic Chrome Chrome Finishes", "zh": "魔镜粉效果" },
  "Gel œil de chat": { "en": "Deep Cosmic CatEye Paint effect", "zh": "猫眼效果胶" },
  "Baby boomer": { "en": "Soft BabyBoomer Airbrush Gradation", "zh": "渐变渐染效果" },
  "Soin relaxant pieds — 10 min": { "en": "Express Foot Relaxing Massage (10 min)", "zh": "足部放松护理 — 10分钟" },
  "Soin relaxant pieds — 20 min": { "en": "Pro-Reflex Foot Meridian Massage (20 min)", "zh": "足部放松护理 — 20分钟" },
  "Gommage": { "en": "Organic Brown Sugar Polish Exfoliation", "zh": "去角质磨砂" }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always default strictly to French ('fr') upon initial load, regardless of browser or OS language settings
  const [language, setLanguageState] = useState<Language>('fr');

  useEffect(() => {
    // Clear any previously persisted language preference to guarantee subsequent initial loads always start in French
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('user-lang');
      } catch (e) {
        // ignore localStorage access issues
      }
    }
  }, []);

  useEffect(() => {
    // Synchronize the HTML lang attribute with current language
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    // Allows language switcher to dynamically update interface state during the session
    setLanguageState(lang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  };

  const t = (key: string): string => {
    return staticTranslations[language]?.[key] || staticTranslations['fr']?.[key] || key;
  };

  const translateText = (text: string): string => {
    if (language === 'fr') return text;
    
    // Look for exact word mapping first
    if (wordDictionary[text]?.[language]) {
      return wordDictionary[text][language];
    }

    // Try substring replacements or lookup
    for (const [key, mapObj] of Object.entries(wordDictionary)) {
      if (text.includes(key) && mapObj[language]) {
        return text.replace(key, mapObj[language]);
      }
    }

    // Fallback if not found: translate common words
    let result = text;
    if (language === 'en') {
      result = result
        .replace(/Soin d'excellence/g, "Premium treatment")
        .replace(/réalisé par nos/g, "performed by our")
        .replace(/Épilation de précision/g, "Precision hair removal")
        .replace(/réalisée à la cire/g, "performed using lukewarm wax")
        .replace(/pour la zone : /g, "for: ")
        .replace(/Forfait complet/g, "Complete bundle pack")
        .replace(/combinant/g, "combining")
        .replace(/Idéal pour un soin/g, "Ideal for a complete care")
        .replace(/Soin ciblé/g, "Targeted care")
        .replace(/Un soin combiné/g, "A combined treatment")
        .replace(/Option nouveauté/g, "New premium choice");
    } else if (language === 'zh') {
      result = result
        .replace(/Soin d'excellence/g, "由我们店内的专业美容师为您提供的高端护理服务。")
        .replace(/réalisé par nos/g, "")
        .replace(/Épilation de précision/g, "使用恒温安全温和蜜蜡进行的精准脱毛护理")
        .replace(/réalisée à la cire/g, "")
        .replace(/pour la zone : /g, "针对区域 : ")
        .replace(/Forfait complet/g, "超值全包复合特惠套餐")
        .replace(/combinant/g, "组合搭配了")
        .replace(/Idéal pour un soin/g, "性价比拔群，为您带去绝佳的身心呵护")
        .replace(/Soin ciblé/g, "精纯温和局部高阶调理")
        .replace(/Un soin combiné/g, "全手足卸甲、死皮修护与多效保湿泥膜尊享理疗组合")
        .replace(/Option nouveauté/g, "本季最热网红美甲爆款时尚沙龙升级方案");
    }
    
    return result;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translateText }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
