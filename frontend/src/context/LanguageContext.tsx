import React, { createContext, useContext, useState, useEffect } from 'react';

export type SupportedLanguage = 'en' | 'hi' | 'pa' | 'ta' | 'gu' | 'kn';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🌾' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🏛️' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🌻' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🌴' },
];

export const TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    // Nav & Sidebar
    nav_dashboard: "Farmer Dashboard",
    nav_rewards: "Rewards & Prizes Store",
    nav_disease: "AI Crop Health Analysis",
    nav_crop_tracker: "Crop Growth Tracker",
    nav_farm_profile: "Farm Profile",
    nav_recommendations: "AI Recommendations",
    nav_missions: "Missions & Challenges",
    nav_auctions: "Government MSP Auctions",
    nav_community: "Community Exchange",
    nav_help_desk: "Help Desk Advisory",
    nav_leaderboard: "Badges & Leaderboard",
    nav_assistant: "AI Farming Assistant",
    nav_analytics: "Progress Analytics",

    // Dashboard Banner
    streak_days: "7 Day Streak",
    eco_level: "Level 2 Eco Farmer",
    points_label: "Points",
    sustainability_score: "Sustainability Score",
    score_excellent: "Excellent",

    // Dashboard Quick Actions
    action_ai_disease: "AI Crop Health Scan",
    action_ai_disease_desc: "Instant leaf disease diagnosis & organic treatment recipes",
    action_quests: "Farming Quests",
    action_quests_desc: "Complete eco-tasks with photo proof verification to earn XP",
    action_auctions: "Government MSP Procurement",
    action_auctions_desc: "Direct MSP sale eligibility check (Requires Score > 60)",
    action_community: "Farmer Knowledge Exchange",
    action_community_desc: "Share organic farming tips with fellow farmers (+25 XP)",

    // Common Buttons
    btn_start_scan: "Run Diagnostic Scan (+30 XP)",
    btn_start_quest: "Start Quest",
    btn_apply_msp: "Apply for Procurement",
    btn_redeem_prize: "Redeem Prize Voucher",
    btn_submit_ticket: "Submit Advisory Ticket",
    btn_ask_ai: "Ask AI Assistant",
    btn_view_all: "View All",

    // Score Metrics
    water_efficiency: "Water Efficiency",
    soil_health: "Soil Health & Carbon",
    waste_mgmt: "Organic Waste Recycling",
    crop_diversity: "Crop Diversity",
    resource_mgmt: "Chemical Minimization"
  },

  hi: {
    // Nav & Sidebar
    nav_dashboard: "किसान डैशबोर्ड",
    nav_rewards: "पुरस्कार एवं इनाम स्टोर",
    nav_disease: "एआई फसल स्वास्थ्य जांच",
    nav_crop_tracker: "फसल विकास ट्रैकर",
    nav_farm_profile: "खेत प्रोफ़ाइल",
    nav_recommendations: "एआई सिफारिशें",
    nav_missions: "मिशन और चुनौतियाँ",
    nav_auctions: "सरकारी एमएसपी नीलामी",
    nav_community: "किसान समुदाय मंच",
    nav_help_desk: "हेल्प डेस्क परामर्श",
    nav_leaderboard: "बैज और लीडरबोर्ड",
    nav_assistant: "एआई कृषि सहायक",
    nav_analytics: "प्रगति विश्लेषण",

    // Dashboard Banner
    streak_days: "7 दिन की निरंतरता",
    eco_level: "स्तर 2 इको किसान",
    points_label: "अंक (XP)",
    sustainability_score: "सतत खेती स्कोर",
    score_excellent: "उत्कृष्ट",

    // Dashboard Quick Actions
    action_ai_disease: "एआई फसल बीमारी जांच",
    action_ai_disease_desc: "पत्ती की तस्वीर से तुरंत बीमारी निदान और जैविक उपचार पाएं",
    action_quests: "जैविक खेती मिशन",
    action_quests_desc: "फोटो प्रमाण के साथ पर्यावरण मिशन पूरे करें और अंक कमाएं",
    action_auctions: "सरकारी एमएसपी खरीद",
    action_auctions_desc: "सीधी एमएसपी बिक्री पात्रता जांच (स्कोर > 60 आवश्यक)",
    action_community: "किसान ज्ञान साझा मंच",
    action_community_desc: "साथी किसानों के साथ जैविक सुझाव साझा करें (+25 XP)",

    // Common Buttons
    btn_start_scan: "निदान स्कैन चलाएं (+30 XP)",
    btn_start_quest: "मिशन शुरू करें",
    btn_apply_msp: "एमएसपी खरीद आवेदन करें",
    btn_redeem_prize: "पुरस्कार वाउचर भुनाएं",
    btn_submit_ticket: "परामर्श टिकट दर्ज करें",
    btn_ask_ai: "एआई सहायक से पूछें",
    btn_view_all: "सभी देखें",

    // Score Metrics
    water_efficiency: "जल उपयोग दक्षता",
    soil_health: "मृदा स्वास्थ्य एवं कार्बन",
    waste_mgmt: "जैविक कचरा पुनर्चक्रण",
    crop_diversity: "फसल विविधता",
    resource_mgmt: "रसायन न्यूनीकरण"
  },

  pa: {
    // Nav & Sidebar
    nav_dashboard: "ਕਿਸਾਨ ਡੈਸ਼ਬੋਰਡ",
    nav_rewards: "ਇਨਾਮ ਅਤੇ ਇਨਾਮ ਸਟੋਰ",
    nav_disease: "ਏਆਈ ਫਸਲ ਸਿਹਤ ਜਾਂਚ",
    nav_crop_tracker: "ਫਸਲ ਵਾਧਾ ਟ੍ਰੈਕਰ",
    nav_farm_profile: "ਖੇਤ ਪ੍ਰੋਫਾਈਲ",
    nav_recommendations: "ਏਆਈ ਸਿਫਾਰਸ਼ਾਂ",
    nav_missions: "ਮਿਸ਼ਨ ਅਤੇ ਚੁਣੌਤੀਆਂ",
    nav_auctions: "ਸਰਕਾਰੀ ਐਮਐਸਪੀ ਨਿਲਾਮੀ",
    nav_community: "ਕਿਸਾਨ ਭਾਈਚਾਰਾ ਫੋਰਮ",
    nav_help_desk: "ਹੈਲਪ ਡੈਸਕ ਸਲਾਹਕਾਰੀ",
    nav_leaderboard: "ਬੈਜ ਅਤੇ ਲੀਡਰਬੋਰਡ",
    nav_assistant: "ਏਆਈ ਖੇਤੀਬਾੜੀ ਸਹਾਇਕ",
    nav_analytics: "ਤਰੱਕੀ ਵਿਸ਼ਲੇਸ਼ਣ",

    // Dashboard Banner
    streak_days: "7 ਦਿਨਾਂ ਦੀ ਲਗਾਤਾਰਤਾ",
    eco_level: "ਲੇਵਲ 2 ਈਕੋ ਕਿਸਾਨ",
    points_label: "ਅੰਕ (XP)",
    sustainability_score: "ਟਿਕਾਊ ਖੇਤੀ ਸਕੋਰ",
    score_excellent: "ਬਹੁਤ ਵਧੀਆ",

    // Dashboard Quick Actions
    action_ai_disease: "ਏਆਈ ਫਸਲ ਬੀਮਾਰੀ ਜਾਂਚ",
    action_ai_disease_desc: "ਪੱਤੇ ਦੀ ਫੋਟੋ ਤੋਂ ਤੁਰੰਤ ਬੀਮਾਰੀ ਨਿਦਾਨ ਅਤੇ ਜੈਵਿਕ ਇਲਾਜ ਪ੍ਰਾਪਤ ਕਰੋ",
    action_quests: "ਟਿਕਾਊ ਖੇਤੀ ਮਿਸ਼ਨ",
    action_quests_desc: "ਫੋਟੋ ਸਬੂਤ ਨਾਲ ਮਿਸ਼ਨ ਪੂਰੇ ਕਰੋ ਅਤੇ ਅੰਕ ਪ੍ਰਾਪਤ ਕਰੋ",
    action_auctions: "ਸਰਕਾਰੀ ਐਮਐਸਪੀ ਖਰੀਦ",
    action_auctions_desc: "ਸਿੱਧੀ ਐਮਐਸਪੀ ਵੇਚ ਯੋਗਤਾ ਜਾਂਚ (ਸਕੋਰ > 60 ਲੋੜੀਂਦਾ)",
    action_community: "ਕਿਸਾਨ ਗਿਆਨ ਸਾਂਝਾ ਕਰਨ ਦਾ ਮੰਚ",
    action_community_desc: "ਸਾਥੀ ਕਿਸਾਨਾਂ ਨਾਲ ਜੈਵਿਕ ਨੁਸਖੇ ਸਾਂਝੇ ਕਰੋ (+25 XP)",

    // Common Buttons
    btn_start_scan: "ਜਾਂਚ ਸਕੈਨ ਚਲਾਓ (+30 XP)",
    btn_start_quest: "ਮਿਸ਼ਨ ਸ਼ੁਰੂ ਕਰੋ",
    btn_apply_msp: "ਖਰੀਦ ਲਈ ਅਰਜ਼ੀ ਦਿਓ",
    btn_redeem_prize: "ਇਨਾਮ ਵਾਊਚਰ ਲਵੋ",
    btn_submit_ticket: "ਸਲਾਹ ਟਿਕਟ ਦਰਜ ਕਰੋ",
    btn_ask_ai: "ਏਆਈ ਸਹਾਇਕ ਤੋਂ ਪੁੱਛੋ",
    btn_view_all: "ਸਾਰੇ ਦੇਖੋ",

    // Score Metrics
    water_efficiency: "ਪਾਣੀ ਦੀ ਬਚਤ",
    soil_health: "ਮਿੱਟੀ ਦੀ ਸਿਹਤ",
    waste_mgmt: "ਜੈਵਿਕ ਰਹਿੰਦ-ਖੂੰਹਦ ਪ੍ਰਬੰਧਨ",
    crop_diversity: "ਫਸਲੀ ਵਿਭਿੰਨਤਾ",
    resource_mgmt: "ਰਸਾਇਣ ਘਟਾਓ"
  },

  ta: {
    // Nav & Sidebar
    nav_dashboard: "விவசாயி டாஷ்போர்டு",
    nav_rewards: "பரிசுகள் கடை",
    nav_disease: "AI பயிர் நோய் பகுப்பாய்வு",
    nav_crop_tracker: "பயிர் வளர்ச்சி கண்காணிப்பு",
    nav_farm_profile: "பண்ணை சுயவிவரம்",
    nav_recommendations: "AI பரிந்துரைகள்",
    nav_missions: "இயற்கை விவசாய பணிகள்",
    nav_auctions: "அரசு MSP கொள்முதல்",
    nav_community: "விவசாயிகள் சமூகம்",
    nav_help_desk: "உதவி மையம்",
    nav_leaderboard: "மதிப்பெண் பட்டியல்",
    nav_assistant: "AI விவசாய உதவியாளர்",
    nav_analytics: "வளர்ச்சி பகுப்பாய்வு",

    // Dashboard Banner
    streak_days: "7 நாட்கள் தொடர்ச்சி",
    eco_level: "நிலை 2 இயற்கை விவசாயி",
    points_label: "புள்ளிகள் (XP)",
    sustainability_score: "இயற்கை விவசாய மதிப்பெண்",
    score_excellent: "மிகச்சிறந்தது",

    // Dashboard Quick Actions
    action_ai_disease: "AI பயிர் நோய் கண்டறிதல்",
    action_ai_disease_desc: "இலை புகைப்படத்துடன் உடனடி நோய் கண்டறிதல் மற்றும் இயற்கை தீர்வுகள்",
    action_quests: "இயற்கை விவசாய பணிகள்",
    action_quests_desc: "புகைப்பட சான்றுடன் பணிகளை முடித்து புள்ளிகளைப் பெறுங்கள்",
    action_auctions: "அரசு MSP நேரடி கொள்முதல்",
    action_auctions_desc: "நேரடி அரசு கொள்முதல் தகுதி (மதிப்பெண் > 60 தேவை)",
    action_community: "விவசாயிகள் அனுபவ பகிர்வு",
    action_community_desc: "இயற்கை விவசாய குறிப்புகளைப் பகிர்ந்து புள்ளிகளைப் பெறுங்கள் (+25 XP)",

    // Common Buttons
    btn_start_scan: "சோதனை தொடங்குக (+30 XP)",
    btn_start_quest: "பணியைத் தொடங்கு",
    btn_apply_msp: "கொள்முதலுக்கு விண்ணப்பிக்கவும்",
    btn_redeem_prize: "பரிசைப் பெறுங்கள்",
    btn_submit_ticket: "கேள்வி கேட்கவும்",
    btn_ask_ai: "AI உதவியாளரிடம் கேளுங்கள்",
    btn_view_all: "அனைத்தையும் காண்க",

    // Score Metrics
    water_efficiency: "நீர் பயன்பாட்டு திறன்",
    soil_health: "மண் வளம்",
    waste_mgmt: "கழிவு மேலாண்மை",
    crop_diversity: "பயிர் பன்முகத்தன்மை",
    resource_mgmt: "ரசாயன குறைப்பு"
  },

  gu: {
    // Nav & Sidebar
    nav_dashboard: "ખેડૂત ડેશબોર્ડ",
    nav_rewards: "ઇનામ અને પુરસ્કાર સ્ટોર",
    nav_disease: "AI પાક રોગ નિદાન",
    nav_crop_tracker: "પાક વિકાસ ટ્રેકર",
    nav_farm_profile: "ખેતર પ્રોફાઇલ",
    nav_recommendations: "AI ભલામણો",
    nav_missions: "મિશન અને પડકારો",
    nav_auctions: "સરકારી MSP ખરીદી",
    nav_community: "ખેડૂત સમુદાય મંચ",
    nav_help_desk: "સહાયક કેન્દ્ર",
    nav_leaderboard: "લીડરબોર્ડ",
    nav_assistant: "AI ખેતી સહાયક",
    nav_analytics: "પ્રગતિ વિશ્લેષણ",

    // Dashboard Banner
    streak_days: "7 દિવસની સાતત્યતા",
    eco_level: "લેવલ 2 ઇકો ખેડૂત",
    points_label: "પોઇન્ટ (XP)",
    sustainability_score: "ટકાઉ ખેતી સ્કોર",
    score_excellent: "ઉત્કૃષ્ટ",

    // Dashboard Quick Actions
    action_ai_disease: "AI પાક નિદાન",
    action_ai_disease_desc: "પાંદડાના ફોટા પરથી તાત્કાલિક રોગ નિદાન અને જૈવિક ઉપચાર",
    action_quests: "ટકાઉ ખેતી મિશન",
    action_quests_desc: "ફોટો સબૂતો સાથે મિશન પૂર્ણ કરી પોઇન્ટ મેળવો",
    action_auctions: "સરકારી MSP ખરીદી",
    action_auctions_desc: "સીધી MSP વેચાણ પાત્રતા (સ્કોર > 60 જરૂરી)",
    action_community: "ખેડૂત જ્ઞાન આદાન-પ્રદાન",
    action_community_desc: "જૈવિક ખેતીની ટિપ્સ શેર કરો (+25 XP)",

    // Common Buttons
    btn_start_scan: "સ્કેન શરૂ કરો (+30 XP)",
    btn_start_quest: "મિશન શરૂ કરો",
    btn_apply_msp: "અરજી કરો",
    btn_redeem_prize: "ઇનામ મેળવો",
    btn_submit_ticket: "પ્રશ્ન મોકલો",
    btn_ask_ai: "AI ને પૂછો",
    btn_view_all: "બધું જુઓ",

    // Score Metrics
    water_efficiency: "પાણીની કાર્યક્ષમતા",
    soil_health: "જમીનની ગુણવત્તા",
    waste_mgmt: "કચરા વ્યવસ્થાપન",
    crop_diversity: "પાક વિવિધતા",
    resource_mgmt: "રસાયણ ઘટાડો"
  },

  kn: {
    // Nav & Sidebar
    nav_dashboard: "ರೈತರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    nav_rewards: "ಬಹುಮಾನಗಳ ಅಂಗಡಿ",
    nav_disease: "AI ಬೆಳೆ ರೋಗ ಪತ್ತೆ",
    nav_crop_tracker: "ಬೆಳೆ ಬೆಳವಣಿಗೆ ಟ್ರ್ಯಾಕರ್",
    nav_farm_profile: "ಫಾರ್ಮ್ ಪ್ರೊಫೈಲ್",
    nav_recommendations: "AI ಶಿಫಾರಸುಗಳು",
    nav_missions: "ಸಸ್ಟೈನಬಲ್ ಮಿಷನ್‌ಗಳು",
    nav_auctions: "ಸರ್ಕಾರಿ MSP ಖರೀದಿ",
    nav_community: "ರೈತರ ಸಮುದಾಯ",
    nav_help_desk: "ಸಹಾಯ ಕೇಂದ್ರ",
    nav_leaderboard: "ಲೀಡರ್‌ಬೋರ್ಡ್",
    nav_assistant: "AI ಕೃಷಿ ಸಹಾಯಕ",
    nav_analytics: "ಪ್ರಗತಿ ವಿಶ್ಲೇಷಣೆ",

    // Dashboard Banner
    streak_days: "7 ದಿನಗಳ ಸತತತೆ",
    eco_level: "ಹಂತ 2 ಇಕೋ ರೈತ",
    points_label: "ಅಂಕಗಳು (XP)",
    sustainability_score: "ಸುಸ್ಥಿರ ಕೃಷಿ ಸ್ಕೋರ್",
    score_excellent: "ಉತ್ತಮವಾಗಿದೆ",

    // Dashboard Quick Actions
    action_ai_disease: "AI ಬೆಳೆ ರೋಗ ಪತ್ತೆ",
    action_ai_disease_desc: "ಎಲೆಯ ಫೋಟೋ ಮೂಲಕ ತಕ್ಷಣದ ರೋಗ ಪತ್ತೆ ಮತ್ತು ಸಾವಯವ ಪರಿಹಾರ",
    action_quests: "ಸುಸ್ಥಿರ ಕೃಷಿ ಮಿಷನ್‌ಗಳು",
    action_quests_desc: "ಫೋಟೋ ಸಾಕ್ಷಿಯೊಂದಿಗೆ ಕಾರ್ಯಗಳನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ ಅಂಕಗಳನ್ನು ಗಳಿಸಿ",
    action_auctions: "ಸರ್ಕಾರಿ MSP ಖರೀದಿ",
    action_auctions_desc: "ನೇರ ಸರ್ಕಾರಿ ಖರೀದಿ ಅರ್ಹತೆ (ಸ್ಕೋರ್ > 60 ಅಗತ್ಯವಿದೆ)",
    action_community: "ರೈತರ ಜ್ಞಾನ ವಿನಿಮಯ",
    action_community_desc: "ಸಾವಯವ ಕೃಷಿ ಸಲಹೆಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಿ (+25 XP)",

    // Common Buttons
    btn_start_scan: "ಪರೀಕ್ಷೆ ಪ್ರಾರಂಭಿಸಿ (+30 XP)",
    btn_start_quest: "ಮಿಷನ್ ಪ್ರಾರಂಭಿಸಿ",
    btn_apply_msp: "ಅರ್ಜಿ ಸಲ್ಲಿಸಿ",
    btn_redeem_prize: "ಬಹುಮಾನವನ್ನು ಪಡೆದುಕೊಳ್ಳಿ",
    btn_submit_ticket: "ಸಲಹಾ ಟಿಕೆಟ್ ಸಲ್ಲಿಸಿ",
    btn_ask_ai: "AI ಸಹಾಯಕರನ್ನು ಕೇಳಿ",
    btn_view_all: "ಎಲ್ಲವನ್ನೂ ವೀಕ್ಷಿಸಿ",

    // Score Metrics
    water_efficiency: "ನೀರಿನ ಬಳಕೆ ದಕ್ಷತೆ",
    soil_health: "ಮಣ್ಣಿನ ಆರೋಗ್ಯ",
    waste_mgmt: "ತ್ಯಾಜ್ಯ ನಿರ್ವಹಣೆ",
    crop_diversity: "ಬೆಳೆ ವೈವಿಧ್ಯತೆ",
    resource_mgmt: "ರಸಾಯನಿಕ ಕಡಿತ"
  }
};

interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(() => {
    return (localStorage.getItem('ecofarm_language') as SupportedLanguage) || 'en';
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setCurrentLanguage(lang);
    localStorage.setItem('ecofarm_language', lang);
  };

  const t = (key: string): string => {
    const langDict = TRANSLATIONS[currentLanguage] || TRANSLATIONS['en'];
    return langDict[key] || TRANSLATIONS['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
