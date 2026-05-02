export interface WeatherData {
  temp: number;
  feelsLike: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  locationName: string;
  lat: number;
  lon: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  diseaseRisk: string;
  farmingSuggestion: string;
  irrigationAdvice: string;
  sprayingAlert: string;
}

export const fetchWeather = async (lat: number, lon: number, lang: string = 'en', nameOverride?: string): Promise<WeatherData> => {
  const API_KEY = (import.meta as any).env.VITE_OPENWEATHER_API_KEY;
  
  const translations: Record<string, any> = {
    en: {
      mockLocation: 'Your Farm',
      mockDisease: 'Minimal fungal threat due to low humidity.',
      mockSuggestion: 'Ideal time for harvesting and drying grains.',
      mockIrrigation: 'Soil drying fast. Water your crops in the evening.',
      mockSpraying: 'Low wind speed detected. Safe for pesticide application.',
      diseaseHigh: 'High risk of Blight and Powdery Mildew due to high humidity.',
      diseaseMed: 'Moderate risk of damp-related diseases.',
      diseaseLow: 'Minimal risk today.',
      irrigationHot: 'Extreme heat! Water early morning or late evening only.',
      irrigationDry: 'High evaporation. Extra watering recommended.',
      irrigationRain: 'Raining. No irrigation needed today.',
      irrigationNormal: 'Regular schedule is fine.',
      sprayingWindy: 'Too windy for spraying. Material will drift.',
      sprayingRainy: 'Avoid spraying. Rain will wash away materials.',
      sprayingSafe: 'Excellent low-wind conditions for spraying.',
      sprayingDefault: 'Safe to spray.',
      farmingRainy: 'Perform indoor maintenance or equipment repair.',
      farmingCold: 'Protect sensitive seedlings from night dip.',
      farmingGood: 'Good day for weeding and field observation.',
      farmingDefault: 'Normal operations supported.'
    },
    hi: {
      mockLocation: 'आपका खेत',
      mockDisease: 'कम उमस के कारण फंगल का खतरा कम है।',
      mockSuggestion: 'अनाज की कटाई और सुखाने के लिए आदर्श समय।',
      mockIrrigation: 'मिट्टी तेजी से सूख रही है। शाम को पानी दें।',
      mockSpraying: 'हवा की गति कम है। कीटनाशक छिड़काव के लिए सुरक्षित।',
      diseaseHigh: 'अधिक उमस के कारण ब्लाइट और डाउनी मिल्ड्यू का उच्च जोखिम।',
      diseaseMed: 'नमी से संबंधित बीमारियों का मध्यम जोखिम।',
      diseaseLow: 'आज न्यूनतम जोखिम है।',
      irrigationHot: 'अत्यधिक गर्मी! केवल सुबह जल्दी या देर शाम को पानी दें।',
      irrigationDry: 'उच्च वाष्पीकरण। अतिरिक्त सिंचाई की सिफारिश की जाती है।',
      irrigationRain: 'बारिश हो रही है। आज सिंचाई की जरूरत नहीं है।',
      irrigationNormal: 'नियमित समय सारणी ठीक है।',
      sprayingWindy: 'छिड़काव के लिए बहुत हवा है। दवा उड़ जाएगी।',
      sprayingRainy: 'छिड़काव से बचें। बारिश दवा को धो देगी।',
      sprayingSafe: 'छिड़काव के लिए हवा की स्थिति उत्कृष्ट है।',
      sprayingDefault: 'छिड़काव के लिए सुरक्षित।',
      farmingRainy: 'भंडारण या उपकरणों की मरम्मत करें।',
      farmingCold: 'नर्सरी को रात की ठंड से बचाएं।',
      farmingGood: 'निराई-गुड़ाई और खेत के अवलोकन के लिए अच्छा दिन।',
      farmingDefault: 'सामान्य कृषि कार्य जारी रखें।'
    },
    mr: {
      mockLocation: 'तुमची शेती',
      mockDisease: 'कमी आर्द्रतेमुळे बुरशीजन्य रोगांचा धोका कमी आहे.',
      mockSuggestion: 'धान्य कापणी आणि वाळवण्यासाठी योग्य वेळ.',
      mockIrrigation: 'माती वेगाने कोरडी होत आहे. संध्याकाळी पाणी द्या.',
      mockSpraying: 'वाऱ्याचा वेग कमी आहे. कीटकनाशक फवारणीसाठी सुरक्षित.',
      diseaseHigh: 'जास्त आर्द्रतेमुळे करपा आणि भुरी रोगाचा मोठा धोका.',
      diseaseMed: 'दमट हवामानामुळे रोगांचा मध्यम धोका.',
      diseaseLow: 'आज कमीत कमी धोका आहे.',
      irrigationHot: 'प्रचंड उष्णता! फक्त पहाटे किंवा उशिरा संध्याकाळी पाणी द्या.',
      irrigationDry: 'जास्त बाष्पीभवन. जास्तीच्या सिंचनाची शिफारस.',
      irrigationRain: 'पाऊस पडत आहे. आज सिंचनाची गरज नाही.',
      irrigationNormal: 'नियमित वेळापत्रक ठीक आहे.',
      sprayingWindy: 'फवारणीसाठी जास्त वारा आहे. औषध उडून जाईल.',
      sprayingRainy: 'फवारणी टाळा. पाऊस औषध धुवून टाकेल.',
      sprayingSafe: 'फवारणीसाठी हवेची स्थिती उत्कृष्ट आहे.',
      sprayingDefault: 'फवारणीसाठी सुरक्षित.',
      farmingRainy: 'घरातील देखभाल किंवा अवजारांची दुरुस्ती करा.',
      farmingCold: 'रोपवाटिकेला रात्रीच्या थंडीपासून वाचवा.',
      farmingGood: 'खुरपणी आणि शेत निरीक्षणासाठी चांगला दिवस.',
      farmingDefault: 'सामान्य शेती कामे चालू ठेवा.'
    },
    bn: {
      mockLocation: 'কলকাতা',
      mockDisease: 'আর্দ্রতা কম থাকার কারণে ছত্রাকের সম্ভাবনা কম।',
      mockSuggestion: 'শস্য কাটা এবং শুকানোর জন্য উপযুক্ত সময়।',
      mockIrrigation: 'মাটি দ্রুত শুকিয়ে যাচ্ছে। সন্ধ্যায় জল দিন।',
      mockSpraying: 'বাতাসের গতি কম। কীটনাশক স্প্রে করার জন্য নিরাপদ।',
      diseaseHigh: 'উচ্চ আর্দ্রতার কারণে ব্লাইট এবং ছত্রাকের উচ্চ ঝুঁকি।',
      diseaseMed: 'স্যাঁতসেঁতে আবহাওয়ার কারণে রোগের মাঝারি ঝুঁকি।',
      diseaseLow: 'আজ ঝুঁকি নগণ্য।',
      irrigationHot: 'অত্যধিক গরম! ভোরে বা সন্ধ্যায় জল দিন।',
      irrigationDry: 'বেশি বাষ্পীভবন। অতিরিক্ত সেচের পরামর্শ।',
      irrigationRain: 'বৃষ্টি হচ্ছে। আজ সেচের প্রয়োজন নেই।',
      irrigationNormal: 'সাধারণ নিয়ম মেনে সেচ দিন।',
      sprayingWindy: 'খুব বেশি বাতাস। স্প্রে করলে ওষুধ উড়ে যাবে।',
      sprayingRainy: 'স্প্রে করবেন না। বৃষ্টিতে ধুয়ে যাবে।',
      sprayingSafe: 'স্প্রে করার জন্য চমৎকার আবহাওয়া।',
      sprayingDefault: 'স্প্রে করা নিরাপদ।',
      farmingRainy: 'ঘরের কাজ বা যন্ত্রপাতি মেরামত করুন।',
      farmingCold: 'চারাগাছকে রাতের ঠান্ডা থেকে রক্ষা করুন।',
      farmingGood: 'মাঠ পরিদর্শন এবং আগাছা পরিষ্কারের জন্য ভালো দিন।',
      farmingDefault: 'স্বাভাবিক কৃষি কাজ চালিয়ে যান।'
    },
    gu: {
      mockLocation: 'અમદાવાદ',
      mockDisease: 'ભેજ ઓછો હોવાને કારણે ફૂગનો ખતરો ઓછો છે.',
      mockSuggestion: 'અનાજની કાપણી અને સૂકવણી માટે આદર્શ સમય.',
      mockIrrigation: 'જમીન ઝડપથી સુકાઈ રહી છે. સાંજે પાણી આપો.',
      mockSpraying: 'પવનની ગતિ ઓછી છે. જંતુનાશક છંટકાવ માટે સુરક્ષિત.',
      diseaseHigh: 'વધારે ભેજને કારણે બ્લાઈટ અને ફૂગનો મોટો ખતરો.',
      diseaseMed: 'ભેજવાળા હવામાનને કારણે રોગોનો મધ્યમ ખતરો.',
      diseaseLow: 'આજે ન્યૂનતમ જોખમ છે.',
      irrigationHot: 'ખૂબ ગરમી! સવારે વહેલા અથવા મોડી સાંજે જ પાણી આપો.',
      irrigationDry: 'વધારે બાષ્પીભવન. વધારાના સિંચાઈની સલાહ.',
      irrigationRain: 'વરસાદ પડી રહ્યો છે. આજે સિંચાઈની જરૂર નથી.',
      irrigationNormal: 'નિયમિત સમયપત્રક બરાબર છે.',
      sprayingWindy: 'છંટકાવ માટે ખૂબ પવન છે. દવા ઉડી જશે.',
      sprayingRainy: 'છંટકાવ ટાળો. વરસાદ દવા ધોઈ નાખશે.',
      sprayingSafe: 'છંટકાવ માટે હવાની સ્થિતિ ઉત્તમ છે.',
      sprayingDefault: 'છંટકાવ માટે સુરક્ષિત.',
      farmingRainy: 'સાધનસામગ્રીની મરામત અથવા ઇનડોર કામ કરો.',
      farmingCold: 'ધરૂવાડિયાને રાત્રિની ઠંડીથી બચાવો.',
      farmingGood: 'નિંદામણ અને ખેતરના અવલોકન માટે સારો દિવસ.',
      farmingDefault: 'સામાન્ય કૃષિ કાર્ય ચાલુ રાખો.'
    },
    te: {
      mockLocation: 'హైదరాబాద్',
      mockDisease: 'తక్కువ తేమ వల్ల శిలీంధ్రాల ముప్పు తక్కువగా ఉంది.',
      mockSuggestion: 'పంట కోత మరియు ఎండబెట్టడానికి అనువైన సమయం.',
      mockIrrigation: 'నేల వేగంగా ఎండిపోతోంది. సాయంత్రం నీరు పెట్టండి.',
      mockSpraying: 'గాలి వేగం తక్కువగా ఉంది. పురుగుమందుల పిచికారీకి సురక్షితం.',
      diseaseHigh: 'అధిక తేమ వల్ల బ్లైట్ మరియు బూజు తెగుళ్ల ప్రమాదం ఉంది.',
      diseaseMed: 'తేమతో కూడిన వాతావరణం వల్ల మధ్యస్థ ముప్పు.',
      diseaseLow: 'ఈరోజు ముప్పు చాలా తక్కువ.',
      irrigationHot: 'విపరీతమైన వేడి! ఉదయం త్వరగా లేదా సాయంత్రం ఆలస్యంగా మాత్రమే నీరు పెట్టండి.',
      irrigationDry: 'అధిక ఆవిరి. అదనపు నీటిపారుదల సిఫార్సు చేయబడింది.',
      irrigationRain: 'వర్షం పడుతోంది. ఈరోజు నీటిపారుదల అవసరం లేదు.',
      irrigationNormal: 'సాధారణ షెడ్యూల్ సరిపోతుంది.',
      sprayingWindy: 'పిచికారీకి గాలి ఎక్కువగా ఉంది. మందు ఎగిరిపోతుంది.',
      sprayingRainy: 'పిచికారీ వద్దు. వర్షం మందును కడిగివేస్తుంది.',
      sprayingSafe: 'పిచికారీకి గాలి పరిస్థితులు అద్భుతంగా ఉన్నాయి.',
      sprayingDefault: 'పిచికారీకి సురక్షితం.',
      farmingRainy: 'సామగ్రి మరమ్మతు లేదా ఇండోర్ పనులు చేయండి.',
      farmingCold: 'నర్సరీలను రాత్రి చలి నుండి రక్షించండి.',
      farmingGood: 'కలుపు తీయడం మరియు పొలం పరిశీలనకు మంచి రోజు.',
      farmingDefault: 'సాధారణ వ్యవసాయ పనులు కొనసాగించండి.'
    },
    ta: {
      mockLocation: 'சென்னை',
      mockDisease: 'குறைந்த ஈரப்பதம் காரணமாக பூஞ்சை தாக்குதல் குறைவாக உள்ளது.',
      mockSuggestion: 'பயிர் அறுவடை மற்றும் உலர்த்துவதற்கு ஏற்ற நேரம்.',
      mockIrrigation: 'மண் வேகமாக உலர்கிறது. மாலையில் நீர்ப்பாசனம் செய்யவும்.',
      mockSpraying: 'காற்றின் வேகம் குறைவு. பூச்சிக்கொல்லி தெளிக்க பாதுகாப்பானது.',
      diseaseHigh: 'அதிக ஈரப்பதம் காரணமாக கருகல் மற்றும் சாம்பல் நோய் ஆபத்து.',
      diseaseMed: 'ஈரமான வானிலை காரணமாக நடுத்தர ஆபத்து.',
      diseaseLow: 'இன்று ஆபத்து குறைவு.',
      irrigationHot: 'அதிக வெப்பம்! அதிகாலை அல்லது மாலை தாமதமாக மட்டும் நீர் பாய்ச்சவும்.',
      irrigationDry: 'அதிக ஆவியாதல். கூடுதல் நீர்ப்பாசனம் தேவை.',
      irrigationRain: 'மழை பெய்கிறது. இன்று நீர்ப்பाசனம் தேவையில்லை.',
      irrigationNormal: 'வழக்கமான அட்டவணை சரியானது.',
      sprayingWindy: 'தெளிப்பதற்கு காற்று அதிகம். மருந்து அடித்துச் செல்லப்படும்.',
      sprayingRainy: 'தெளிப்பதைத் தவிர்க்கவும். மழை மருந்தை கழுவிவிடும்.',
      sprayingSafe: 'தெளிப்பதற்கு காற்று நிலை சிறப்பாக உள்ளது.',
      sprayingDefault: 'தெளிப்பது பாதுகாப்பானது.',
      farmingRainy: 'உபகரண பராமரிப்பு அல்லது உட்புற வேலைகளைச் செய்யுங்கள்.',
      farmingCold: 'நாற்றுகளை இரவு குளிரிலிருந்து பாதுகாக்கவும்.',
      farmingGood: 'களை எடுத்தல் மற்றும் வயல் ஆய்வுக்கு நல்ல நாள்.',
      farmingDefault: 'சாதாரண விவசாயப் பணிகளைத் தொடரவும்.'
    },
    kn: {
      mockLocation: 'ಬೆಂಗಳೂರು',
      mockDisease: 'ಕಡಿಮೆ ಆರ್ದ್ರತೆಯಿಂದ ಶಿಲೀಂಧ್ರ ಮುನ್ನೆಚ್ಚರಿಕೆ ಕಡಿಮೆ ಇದೆ.',
      mockSuggestion: 'ಬೆಳೆ ಕೊಯ್ಲು ಮತ್ತು ಒಣಗಿಸಲು ಸೂಕ್ತ ಸಮಯ.',
      mockIrrigation: 'ಮಣ್ಣು ಬೇಗನೆ ಒಣಗುತ್ತಿದೆ. ಸಂಜೆ ನೀರು ಹಾಯಿಸಿ.',
      mockSpraying: 'ಗಾಳಿಯ ವೇಗ ಕಡಿಮೆ ಇದೆ. ಸಿಂಪರಣೆಗೆ ಸುರಕ್ಷಿತ.',
      diseaseHigh: 'ಹೆಚ್ಚಿನ ಆರ್ದ್ರತೆಯಿಂದ ಬ್ಲೈಟ್ ಮತ್ತು ಶಿಲೀಂಧ್ರ ರೋಗದ ಅಪಾಯ ಹೆಚ್ಚಿದೆ.',
      diseaseMed: 'ತೇವಾಂಶದಿಂದ ಕೂಡಿದ ಹವಾಮಾನದ ಅಪಾಯ.',
      diseaseLow: 'ಇಂದು ಅಪಾಯ ಕಡಿಮೆ ಇದೆ.',
      irrigationHot: 'ಅತಿಯಾದ ಶಾಖ! ಬೆಳಿಗ್ಗೆ ಬೇಗ ಅಥವಾ ಸಂಜೆ ತಡವಾಗಿ ಮಾತ್ರ ನೀರು ಹಾಯಿಸಿ.',
      irrigationDry: 'ಹೆಚ್ಚಿನ ಆವಿಯಾಗುವಿಕೆ. ಹೆಚ್ಚಿನ ನೀರಾವರಿ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ.',
      irrigationRain: 'ಮಳೆ ಬರುತ್ತಿದೆ. ಇಂದು ನೀರಾವರಿ ಅಗತ್ಯವಿಲ್ಲ.',
      irrigationNormal: 'ನಿಯಮಿತ ವೇಳಾಪಟ್ಟಿ ಸರಿಯಾಗಿದೆ.',
      sprayingWindy: 'ಸಿಂಪರಣೆಗೆ ಗಾಳಿ ಹೆಚ್ಚಿದೆ. ಔಷಧಿ ಹಾರಿ ಹೋಗುತ್ತದೆ.',
      sprayingRainy: 'ಸಿಂಪರಣೆ ಮಾಡಬೇಡಿ. ಮಳೆಯಿಂದ ಔಷಧಿ ತೊಳೆದು ಹೋಗುತ್ತದೆ.',
      sprayingSafe: 'ಸಿಂಪರಣೆಗೆ ಹವಾಮಾನ ಪೂರಕವಾಗಿದೆ.',
      sprayingDefault: 'ಸಿಂಪರಣೆಗೆ ಸುರಕ್ಷಿತ.',
      farmingRainy: 'ಉಪಕರಣಗಳ ದುರಸ್ತಿ ಅಥವಾ ಒಳಾಂಗಣ ಕೆಲಸ ಮಾಡಿ.',
      farmingCold: 'ಸಸಿಗಳನ್ನು ರಾತ್ರಿಯ ಚಳಿಯಿಂದ ರಕ್ಷಿಸಿ.',
      farmingGood: 'ಕಳೆ ತೆಗೆಯಲು and ಹೊಲದ ವೀಕ್ಷಣೆಗೆ ಉತ್ತಮ ದಿನ.',
      farmingDefault: 'ಸಾಮಾನ್ಯ ಕೃಷಿ ಕೆಲಸಗಳನ್ನು ಮುಂದುವರಿಸಿ.'
    },
    ml: {
      mockLocation: 'കൊച്ചി',
      mockDisease: 'ഈർപ്പം കുറവായതിനാൽ കുമിൾ രോഗ സാധ്യത കുറവാണ്.',
      mockSuggestion: 'വിളവെടുപ്പിനും ഉണക്കുന്നതിനും അനുയോജ്യമായ സമയം.',
      mockIrrigation: 'മണ്ണ് പെട്ടെന്ന് ഉണങ്ങുന്നു. വൈകുന്നേരം നനയ്ക്കുക.',
      mockSpraying: 'കാറ്റിന്റെ വേഗത കുറവാണ്. കീടനാശിനി തളിക്കാൻ സുരക്ഷിതം.',
      diseaseHigh: 'കൂടുതൽ ഈർപ്പം കാരണം കുമിൾ രോഗ സാധ്യത കൂടുതലാണ്.',
      diseaseMed: 'ഈർപ്പമുള്ള കാലാവസ്ഥ കാരണം മിതമായ രോഗസാധ്യത.',
      diseaseLow: 'ഇന്ന് രോഗസാധ്യത കുറവാണ്.',
      irrigationHot: 'കടുത്ത ചൂട്! അതിരാവിലെ അല്ലെങ്കിൽ വൈകുന്നേരം മാത്രം നനയ്ക്കുക.',
      irrigationDry: 'കൂടുതൽ ജലനഷ്ടം. കൂടുതൽ ജലസേചനം ആവശ്യമാണ്.',
      irrigationRain: 'മഴ പെയ്യുന്നു. ഇന്ന് നനയ്ക്കേണ്ടതില്ല.',
      irrigationNormal: 'പതിവ് രീതി തുടരാം.',
      sprayingWindy: 'കാറ്റ് കൂടുതലാണ്. മരുന്ന് അടിച്ചുപോകും.',
      sprayingRainy: 'മരുന്ന് തളിക്കരുത്. മഴ കൊണ്ടു പോകും.',
      sprayingSafe: 'മരുന്ന് തളിക്കാൻ പറ്റിയ കാലാവസ്ഥ.',
      sprayingDefault: 'മരുന്ന് തളിക്കുന്നത് സുരക്ഷിതം.',
      farmingRainy: 'വീടിനുള്ളിലെ ജോലികൾ അല്ലെങ്കിൽ ഉപകരണങ്ങൾ നന്നാക്കുക.',
      farmingCold: 'തൈകളെ രാത്രിയിലെ തണുപ്പിൽ നിന്ന് സംരക്ഷിക്കുക.',
      farmingGood: 'കള പറിക്കാനും തോട്ടം നിരീക്ഷിക്കാനും നല്ല ദിവസം.',
      farmingDefault: 'സാധാരണ കൃഷി ജോലികൾ തുടരുക.'
    },
    pa: {
      mockLocation: 'ਅੰਮ੍ਰਿਤਸਰ',
      mockDisease: 'ਘੱਟ ਉਮਸ ਕਾਰਨ ਉੱਲੀ ਦਾ ਖ਼ਤਰਾ ਘੱਟ ਹੈ।',
      mockSuggestion: 'ਫਸল ਦੀ ਕਟਾਈ ਅਤੇ ਸੁਕਾਉਣ ਲਈ ਵਧੀਆ ਸਮਾਂ।',
      mockIrrigation: 'ਮਿੱਟੀ ਤੇਜ਼ੀ ਨਾਲ ਸੁੱਕ ਰਹੀ ਹੈ। ਸ਼ਾਮ ਨੂੰ ਪਾਣੀ ਦਿਓ।',
      mockSpraying: 'ਹਵਾ ਦੀ ਰਫ਼ਤਾਰ ਘੱਟ ਹੈ। ਕੀੜੇਮਾਰ ਦਵਾਈ ਦੇ ਛਿੜਕਾਅ ਲਈ ਸੁਰੱਖਿਅਤ।',
      diseaseHigh: 'ਵੱਧ ਉਮਸ ਕਾਰਨ ਬਲਾਈਟ ਅਤੇ ਉੱਲੀ ਦਾ ਵੱਡา ਖ਼ਤਰਾ।',
      diseaseMed: 'ਸਿੱਲ੍ਹੇ ਮੌਸਮ ਕਾਰਨ ਬਿਮਾਰੀਆਂ ਦਾ ਦਰਮਿਆਨਾ ਖ਼ਤਰਾ।',
      diseaseLow: 'ਅੱਜ ਖ਼ਤਰਾ ਘੱਟ ਹੈ।',
      irrigationHot: 'ਬਹੁਤ ਗਰਮੀ! ਸਿਰਫ਼ ਸਵੇਰੇ ਜਲਦੀ ਜਾਂ ਦੇਰ ਸ਼ਾਮ ਨੂੰ ਪਾਣੀ ਦਿਓ।',
      irrigationDry: 'ਵੱਧ ਵਾਸ਼ਪੀਕਰਨ। ਵਾਧੂ ਸਿੰਚਾਈ ਦੀ ਸਲਾਹ।',
      irrigationRain: 'ਮੀਂਹ ਪੈ ਰਿਹਾ ਹੈ। ਅੱਜ ਸਿੰਚਾਈ ਦੀ ਲੋੜ ਨਹੀਂ।',
      irrigationNormal: 'ਨਿਯਮਿਤ ਸਮਾਂ-ਸਾਰਣੀ ਠੀਕ ਹੈ।',
      sprayingWindy: 'ਛਿੜਕਾਅ ਲਈ ਬਹੁਤ ਹਵਾ ਹੈ। ਦਵਾਈ ਉੱਡ ਜਾਵੇਗੀ।',
      sprayingRainy: 'ਛਿੜਕਾਅ ਨਾ ਕਰੋ। ਮੀਂਹ ਦਵਾਈ ਨੂੰ ਧੋ ਦੇਵੇਗਾ।',
      sprayingSafe: 'ਛਿੜਕਾਅ ਲਈ ਹਵਾ ਦੀ ਸਥਿਤੀ ਸ਼ਾਨਦਾਰ ਹੈ।',
      sprayingDefault: 'ਛਿੜਕਾਅ ਲਈ ਸੁਰੱਖਿਅਤ।',
      farmingRainy: 'ਸੰਦਾਂ ਦੀ ਮੁਰੰਮਤ ਜਾਂ ਘਰ ਦੇ ਅੰਦਰਲੇ ਕੰਮ ਕਰੋ।',
      farmingCold: 'ਪਨੀਰੀ ਨੂੰ ਰਾਤ ਦੀ ਠੰਢ ਤੋਂ ਬਚਾਓ।',
      farmingGood: 'ਗੋਡੀ ਅਤੇ ਖੇਤ ਦੇ ਨਿਰੀਖਣ ਲਈ ਵਧੀਆ ਦਿਨ।',
      farmingDefault: 'ਆਮ ਖੇਤੀ ਕੰਮ ਜਾਰੀ ਰੱਖੋ।'
    }
  };

  const str = translations[lang] || translations.en;
  
  // Create deterministic pseudo-random values based on location name or lat/lon
  const seed = nameOverride ? nameOverride.length : (lat + lon);
  const hash = (str: string) => {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
    return Math.abs(h);
  };
  const nameHash = nameOverride ? hash(nameOverride) : Math.floor(lat * 100);
  
  const mockTemp = 25 + (nameHash % 15); // 25-40 C
  const mockHumidity = 30 + (nameHash % 50); // 30-80 %
  const mockWind = 2 + (nameHash % 18); // 2-20 km/h
  
  const mockData: WeatherData = {
    temp: mockTemp,
    feelsLike: mockTemp + 2,
    condition: mockHumidity > 70 ? 'Cloudy' : 'Sunny',
    humidity: mockHumidity,
    windSpeed: mockWind,
    locationName: nameOverride || str.mockLocation,
    lat,
    lon,
    riskLevel: mockHumidity > 60 ? 'Medium' : 'Low',
    diseaseRisk: mockHumidity > 60 ? str.diseaseMed : str.diseaseLow,
    farmingSuggestion: mockTemp > 35 ? str.farmingCold : str.farmingGood,
    irrigationAdvice: mockHumidity < 40 ? str.irrigationDry : str.irrigationNormal,
    sprayingAlert: mockWind > 15 ? str.sprayingWindy : str.sprayingSafe
  };

  // Try to get real location name even if key is missing (using OSM)
  if (!nameOverride) {
    try {
      const osmResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`, {
        headers: { 'Accept-Language': lang }
      });
      if (osmResponse.ok) {
        const osmData = await osmResponse.json();
        const city = osmData.address.city || osmData.address.town || osmData.address.village || osmData.address.state_district || osmData.address.state;
        if (city) {
          mockData.locationName = city;
        }
      }
    } catch (e) {
      console.warn("OSM reverse geocoding failed, using generic name.");
    }
  }

  if (!API_KEY || API_KEY === 'undefined' || API_KEY === '' || API_KEY.includes('YOUR_OPENWEATHER_API_KEY')) {
    return mockData;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`,
      { signal: controller.signal }
    );
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.warn(`Weather API error: ${response.status}. Using mock data.`);
      return mockData;
    }

    const data = await response.json();
    
    if (!data.main || !data.weather) {
      console.warn("Invalid weather data format received. Using fallback.");
      return mockData;
    }

    const temp = Math.round(data.main.temp);
    const feelsLike = Math.round(data.main.feels_like);
    const humidity = data.main.humidity;
    const windSpeed = data.wind?.speed ? data.wind.speed * 3.6 : 0;
    const condition = data.weather[0]?.main || 'Clear';
    const locationName = nameOverride || data.name || 'Your Farm';

    let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
    let diseaseRisk = str.diseaseLow;
    let irrigationAdvice = str.irrigationNormal;
    let sprayingAlert = str.sprayingDefault;
    let farmingSuggestion = str.farmingDefault;

    // Disease Analysis
    if (humidity > 80) {
      riskLevel = 'High';
      diseaseRisk = str.diseaseHigh;
    } else if (humidity > 60) {
      riskLevel = 'Medium';
      diseaseRisk = str.diseaseMed;
    }

    // Irrigation Analysis
    if (temp > 35) {
      irrigationAdvice = str.irrigationHot;
    } else if (temp > 28 && humidity < 40) {
      irrigationAdvice = str.irrigationDry;
    } else if (condition === 'Rain') {
      irrigationAdvice = str.irrigationRain;
    }

    // Spraying Analysis
    if (windSpeed > 20) {
      sprayingAlert = str.sprayingWindy;
    } else if (condition === 'Rain') {
      sprayingAlert = str.sprayingRainy;
    } else if (windSpeed < 10) {
      sprayingAlert = str.sprayingSafe;
    }

    // Farming Suggestion
    if (condition === 'Rain') {
      farmingSuggestion = str.farmingRainy;
    } else if (temp < 15) {
      farmingSuggestion = str.farmingCold;
    } else {
      farmingSuggestion = str.farmingGood;
    }

    return {
      temp,
      feelsLike,
      condition,
      humidity,
      windSpeed,
      locationName,
      lat,
      lon,
      riskLevel,
      diseaseRisk,
      farmingSuggestion,
      irrigationAdvice,
      sprayingAlert
    };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.warn('Weather request timed out. Using fallback data.');
    } else {
      console.error('Weather network request failed (likely CORS or network block). Using fallback weather data:', error);
    }
    return mockData;
  }
};

export const fetchWeatherByCity = async (cityName: string, lang: string = 'en'): Promise<WeatherData> => {
  const API_KEY = (import.meta as any).env.VITE_OPENWEATHER_API_KEY;
  const dummyLat = 20.5937;
  const dummyLon = 78.9629;

  if (!API_KEY || API_KEY === 'undefined' || API_KEY === '' || API_KEY.includes('YOUR_OPENWEATHER_API_KEY')) {
    // Try OSM geocoding if OWM key is missing
    try {
      const osmGeoResponse = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1`);
      if (osmGeoResponse.ok) {
        const osmGeoData = await osmGeoResponse.json();
        if (osmGeoData && osmGeoData[0]) {
          return fetchWeather(parseFloat(osmGeoData[0].lat), parseFloat(osmGeoData[0].lon), lang, cityName);
        }
      }
    } catch (e) {
      console.warn("OSM geocoding failed, falling back to dummy.");
    }
    const data = await fetchWeather(dummyLat, dummyLon, lang, cityName);
    return data;
  }

  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=metric`);
    if (!response.ok) {
      console.warn(`City weather fetch failed with status ${response.status}. Using fallback.`);
      
      // Fallback to OSM geocoding + mock weather if API fails (e.g. 401/404)
      try {
        const osmGeoResponse = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1`);
        if (osmGeoResponse.ok) {
          const osmGeoData = await osmGeoResponse.json();
          if (osmGeoData && osmGeoData[0]) {
            return fetchWeather(parseFloat(osmGeoData[0].lat), parseFloat(osmGeoData[0].lon), lang, cityName);
          }
        }
      } catch (e) {
        // ignore OSM failure
      }
      return fetchWeather(dummyLat, dummyLon, lang, cityName);
    }
    
    const data = await response.json();
    return fetchWeather(data.coord.lat, data.coord.lon, lang, cityName);
  } catch (error: any) {
    console.warn('City weather network error:', error.message);
    return fetchWeather(dummyLat, dummyLon, lang, cityName);
  }
};
