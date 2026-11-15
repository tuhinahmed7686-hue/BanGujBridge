// All user-facing interface text, in three languages.
//
// The English dictionary is the source of truth: the TranslationKey type is derived from it, and the Bengali
// and Gujarati dictionaries are typed as Record<TranslationKey, string>, so a missing OR extra key is a
// compile-time error.
//
// Not translated on purpose: proper nouns (BANGUJ Bridge, USGS, OpenStreetMap, names of planned data sources) and
// raw data from the USGS feed (place names, event IDs).
//
// IMPORTANT: the Bengali and Gujarati text below is a DRAFT written by an AI assistant. A native speaker must
// review it, especially the safety disclaimers (footer.text, details.disclaimer, verify.body), before public use.

export type Language = 'en' | 'bn' | 'gu';
export const DEFAULT_LANGUAGE: Language = 'en';

export const LANGUAGES: ReadonlyArray<{ code: Language; nativeName: string; locale: string }> = [
  { code: 'en', nativeName: 'English', locale: 'en' },
  { code: 'bn', nativeName: 'বাংলা', locale: 'bn-BD' },
  { code: 'gu', nativeName: 'ગુજરાતી', locale: 'gu-IN' },
];
export const isLanguage = (value: unknown): value is Language =>
  typeof value === 'string' && LANGUAGES.some((l) => l.code === value);
export const localeFor = (language: Language): string => LANGUAGES.find((l) => l.code === language)?.locale ?? 'en';

export const en = {
  'app.name': 'BANGUJ Bridge',
  'language.label': 'Language',

  'nav.sections': 'Sections',
  'nav.liveMap': 'Live Map',
  'nav.eventFeed': 'Event Feed',
  'nav.verify': 'Bilingual Alert Verification',
  'nav.sources': 'Sources and Data Health',

  'header.lastRefresh': 'Last successful refresh: {time}',
  'header.noRefreshYet': 'none yet',

  'status.loading': 'Connecting to USGS',
  'status.live': 'Connected to USGS',
  'status.stale': 'Stale: refreshes are failing',
  'status.unavailable': 'Unavailable: could not load USGS data',

  'banner.stale': 'Showing stale data. The last successful fetch was {time}, and recent refreshes have failed. These events may be out of date.',
  'banner.unavailable': 'Earthquake data is unavailable. BANGUJ Bridge could not load the USGS feed ({reason}). No events are shown. It will retry every {seconds} seconds.',

  'error.network': 'Could not reach the USGS feed.',
  'error.http': 'The USGS feed returned HTTP error {status}.',
  'error.invalidJson': 'The USGS feed returned invalid data (not valid JSON).',
  'error.invalidFormat': 'The USGS response was not in the expected format.',
  'error.unknown': 'An unknown error occurred while loading data.',

  'region.label': 'Region',
  'region.global.button': 'Global view',
  'region.bangladesh.button': 'Bangladesh view',
  'region.gujarat.button': 'Gujarat, India view',
  'region.bangladesh.name': 'Bangladesh',
  'region.gujarat.name': 'Gujarat, India',
  'region.note': 'Regional views use rough rectangular search areas to centre the map and filter events. They are not official administrative boundaries.',
  'region.emptyNotice': 'No earthquakes of magnitude 2.5 or higher in the USGS past-7-days feed fall inside the approximate {region} search area.',

  'feed.title': 'Latest earthquakes',
  'feed.titleCount': 'Latest earthquakes ({count})',
  'feed.loading': 'Loading earthquake reports from USGS...',
  'feed.unavailable': 'No data to show because the USGS feed is unavailable.',
  'feed.empty': 'No events to show.',
  'feed.depth': 'Depth {depth}',
  'feed.usgsLink': 'USGS event page',

  'details.title': 'Event details',
  'details.selectPrompt': 'Select a marker on the map or an event in the feed to see its details.',
  'details.eventTime': 'Event time',
  'details.updated': 'Last updated by USGS',
  'details.depth': 'Depth',
  'details.latitude': 'Latitude',
  'details.longitude': 'Longitude',
  'details.eventId': 'USGS event ID',
  'details.openOfficial': 'Open official USGS event page',
  'details.disclaimer': 'This is an observed earthquake report from USGS. It is not a forecast and not an official evacuation instruction.',

  'event.placeMissing': 'Location description not provided',
  'common.notProvided': 'Not provided',
  'common.notAvailable': 'Not available',
  'common.magnitudeMissing': 'n/a',

  'map.legend': 'Marker size and colour show reported magnitude: blue under 4, amber 4 to 4.9, orange 5 to 5.9, red 6 and above. Colours are a visual aid only, not a risk level.',
  'map.tilesUnavailable': 'The map background could not be loaded, so earthquakes are shown on a plain background. Their positions are still plotted at the real coordinates reported by USGS.',
  'map.helpSummary': 'Map background not loading?',
  'map.helpBody': 'The background map comes from OpenStreetMap. If it shows an “Access blocked” image or stays blank, the page may be running inside an embedded preview, or behind a privacy tool that hides where the request comes from. Open the app in a normal browser tab. Earthquake markers are drawn at their true coordinates either way.',
  'map.zoomIn': 'Zoom in',
  'map.zoomOut': 'Zoom out',
  'map.popupDepth': 'Depth: {depth}',

  'health.title': 'Data health',
  'health.connection': 'Connection',
  'health.lastFetch': 'Last successful fetch',
  'health.noFetchYet': 'No successful fetch yet',
  'health.generated': 'Feed generated by USGS',
  'health.received': 'Events received',
  'health.inView': 'Events in this view',
  'health.skipped': 'Records skipped',
  'health.skippedValue': '{count} (missing or invalid data)',
  'health.autoRefresh': 'Automatic refresh',
  'health.autoRefreshValue': 'Every {seconds} seconds while this page is open',
  'health.refreshFailed': 'Latest refresh failed: {reason} ({count} in a row)',
  'health.refreshNow': 'Refresh now',
  'health.refreshing': 'Refreshing...',

  'verify.badge': 'Planned, not implemented',
  'verify.body': 'A future milestone will compare Bengali and Gujarati versions of important public notices and check whether meaning, dates, times, locations, instructions and negation agree. No verification feature or AI model exists in this version.',

  'sources.activeTitle': 'Active source',
  'sources.name': 'USGS Earthquake Hazards Program',
  'sources.activeDesc': 'Magnitude 2.5+ earthquakes worldwide over the past seven days, read directly from the public feed. USGS data is public information from the U.S. Geological Survey.',
  'sources.feedLink': 'Open the USGS GeoJSON summary feed',
  'sources.tilesLabel': 'Map tiles',
  'sources.plannedTitle': 'Planned sources (not connected)',
  'sources.plannedBadge': 'Planned',
  'planned.gdacs': 'Global disaster alerts',
  'planned.ffwc': 'Flood forecasting and warning',
  'planned.imd': 'Weather and cyclone bulletins',
  'planned.openMeteo': 'Weather data',
  'planned.gdelt': 'News and media monitoring',

  'footer.text': 'Source: USGS Earthquake Hazards Program. BANGUJ Bridge shows observed earthquake reports only. It does not predict earthquakes and does not issue official warnings or evacuation instructions. For official guidance, follow your national and local authorities.',
} as const;

export type TranslationKey = keyof typeof en;
export type Dictionary = Record<TranslationKey, string>;
export type TranslationParams = Record<string, string | number>;
export type TFunction = (key: TranslationKey, params?: TranslationParams) => string;

// DRAFT: needs native-speaker review.
const bn: Dictionary = {
  'app.name': 'BANGUJ Bridge',
  'language.label': 'ভাষা',

  'nav.sections': 'বিভাগসমূহ',
  'nav.liveMap': 'লাইভ মানচিত্র',
  'nav.eventFeed': 'ঘটনার তালিকা',
  'nav.verify': 'দ্বিভাষিক সতর্কবার্তা যাচাই',
  'nav.sources': 'উৎস ও তথ্যের অবস্থা',

  'header.lastRefresh': 'সর্বশেষ সফল হালনাগাদ: {time}',
  'header.noRefreshYet': 'এখনও হয়নি',

  'status.loading': 'USGS-এর সঙ্গে সংযোগ হচ্ছে',
  'status.live': 'USGS-এর সঙ্গে সংযুক্ত',
  'status.stale': 'পুরোনো তথ্য: হালনাগাদ ব্যর্থ হচ্ছে',
  'status.unavailable': 'পাওয়া যাচ্ছে না: USGS-এর তথ্য লোড করা যায়নি',

  'banner.stale': 'পুরোনো তথ্য দেখানো হচ্ছে। সর্বশেষ সফলভাবে তথ্য আনা হয়েছিল {time}-এ, এবং সাম্প্রতিক হালনাগাদগুলো ব্যর্থ হয়েছে। এই ঘটনাগুলো হালনাগাদ নাও হতে পারে।',
  'banner.unavailable': 'ভূমিকম্পের তথ্য পাওয়া যাচ্ছে না। BANGUJ Bridge USGS-এর ফিড লোড করতে পারেনি ({reason})। কোনো ঘটনা দেখানো হচ্ছে না। প্রতি {seconds} সেকেন্ডে আবার চেষ্টা করা হবে।',

  'error.network': 'USGS-এর ফিডে পৌঁছানো যায়নি।',
  'error.http': 'USGS-এর ফিড HTTP ত্রুটি {status} ফেরত দিয়েছে।',
  'error.invalidJson': 'USGS-এর ফিড অবৈধ তথ্য (সঠিক JSON নয়) ফেরত দিয়েছে।',
  'error.invalidFormat': 'USGS-এর উত্তর প্রত্যাশিত ফরম্যাটে ছিল না।',
  'error.unknown': 'তথ্য লোড করার সময় একটি অজানা ত্রুটি ঘটেছে।',

  'region.label': 'অঞ্চল',
  'region.global.button': 'সারা বিশ্ব',
  'region.bangladesh.button': 'বাংলাদেশ',
  'region.gujarat.button': 'গুজরাট, ভারত',
  'region.bangladesh.name': 'বাংলাদেশ',
  'region.gujarat.name': 'গুজরাট, ভারত',
  'region.note': 'অঞ্চলভিত্তিক দৃশ্যে মানচিত্রের কেন্দ্র ঠিক করতে ও ঘটনা বাছাই করতে মোটামুটি আয়তাকার অনুসন্ধান এলাকা ব্যবহার করা হয়। এগুলো সরকারি প্রশাসনিক সীমানা নয়।',
  'region.emptyNotice': 'USGS-এর গত ৭ দিনের ফিডে {region}ের আনুমানিক অনুসন্ধান এলাকার মধ্যে ২.৫ বা তার বেশি মাত্রার কোনো ভূমিকম্প নেই।',

  'feed.title': 'সাম্প্রতিক ভূমিকম্প',
  'feed.titleCount': 'সাম্প্রতিক ভূমিকম্প ({count})',
  'feed.loading': 'USGS থেকে ভূমিকম্পের প্রতিবেদন লোড হচ্ছে...',
  'feed.unavailable': 'USGS-এর ফিড পাওয়া যাচ্ছে না, তাই দেখানোর মতো তথ্য নেই।',
  'feed.empty': 'দেখানোর মতো কোনো ঘটনা নেই।',
  'feed.depth': 'গভীরতা {depth}',
  'feed.usgsLink': 'USGS ঘটনার পাতা',

  'details.title': 'ঘটনার বিবরণ',
  'details.selectPrompt': 'বিবরণ দেখতে মানচিত্রের একটি চিহ্ন বা তালিকার একটি ঘটনা বেছে নিন।',
  'details.eventTime': 'ঘটনার সময়',
  'details.updated': 'USGS-এর সর্বশেষ হালনাগাদ',
  'details.depth': 'গভীরতা',
  'details.latitude': 'অক্ষাংশ',
  'details.longitude': 'দ্রাঘিমাংশ',
  'details.eventId': 'USGS ঘটনার আইডি',
  'details.openOfficial': 'USGS-এর অফিসিয়াল ঘটনার পাতা খুলুন',
  'details.disclaimer': 'এটি USGS-এর একটি পর্যবেক্ষিত ভূমিকম্প প্রতিবেদন। এটি কোনো পূর্বাভাস নয় এবং অফিসিয়াল সরিয়ে নেওয়ার নির্দেশনাও নয়।',

  'event.placeMissing': 'স্থানের বিবরণ দেওয়া হয়নি',
  'common.notProvided': 'দেওয়া হয়নি',
  'common.notAvailable': 'পাওয়া যায়নি',
  'common.magnitudeMissing': 'অজানা',

  'map.legend': 'চিহ্নের আকার ও রং রিপোর্ট করা মাত্রা বোঝায়: ৪-এর কম নীল, ৪ থেকে ৪.৯ হলুদ, ৫ থেকে ৫.৯ কমলা, ৬ ও তার বেশি লাল। রংগুলো কেবল দৃশ্যগত সহায়তা, ঝুঁকির মাত্রা নয়।',
  'map.tilesUnavailable': 'মানচিত্রের পটভূমি লোড করা যায়নি, তাই ভূমিকম্পগুলো সাদামাটা পটভূমিতে দেখানো হচ্ছে। USGS-এর দেওয়া প্রকৃত স্থানাঙ্কেই এগুলো বসানো আছে।',
  'map.helpSummary': 'মানচিত্রের পটভূমি লোড হচ্ছে না?',
  'map.helpBody': 'পটভূমির মানচিত্র আসে OpenStreetMap থেকে। এটি যদি “Access blocked” লেখা ছবি দেখায় বা ফাঁকা থাকে, তবে পাতাটি হয়তো কোনো এমবেডেড প্রিভিউয়ের ভেতরে চলছে, অথবা কোনো গোপনীয়তা-সুরক্ষা টুল অনুরোধের উৎস লুকিয়ে রাখছে। অ্যাপটি একটি সাধারণ ব্রাউজার ট্যাবে খুলুন। পটভূমি থাকুক বা না থাকুক, ভূমিকম্পের চিহ্নগুলো প্রকৃত স্থানাঙ্কেই আঁকা হয়।',
  'map.zoomIn': 'বড় করুন',
  'map.zoomOut': 'ছোট করুন',
  'map.popupDepth': 'গভীরতা: {depth}',

  'health.title': 'তথ্যের অবস্থা',
  'health.connection': 'সংযোগ',
  'health.lastFetch': 'সর্বশেষ সফল তথ্য সংগ্রহ',
  'health.noFetchYet': 'এখনও সফলভাবে তথ্য আনা হয়নি',
  'health.generated': 'USGS ফিড তৈরির সময়',
  'health.received': 'প্রাপ্ত ঘটনা',
  'health.inView': 'এই দৃশ্যে ঘটনা',
  'health.skipped': 'বাদ দেওয়া রেকর্ড',
  'health.skippedValue': '{count} (তথ্য অনুপস্থিত বা অবৈধ)',
  'health.autoRefresh': 'স্বয়ংক্রিয় হালনাগাদ',
  'health.autoRefreshValue': 'এই পাতা খোলা থাকলে প্রতি {seconds} সেকেন্ডে',
  'health.refreshFailed': 'সর্বশেষ হালনাগাদ ব্যর্থ হয়েছে: {reason} (পরপর {count} বার)',
  'health.refreshNow': 'এখনই হালনাগাদ করুন',
  'health.refreshing': 'হালনাগাদ হচ্ছে...',

  'verify.badge': 'পরিকল্পিত, এখনও তৈরি হয়নি',
  'verify.body': 'ভবিষ্যতের একটি ধাপে গুরুত্বপূর্ণ জনবিজ্ঞপ্তির বাংলা ও গুজরাটি সংস্করণ তুলনা করা হবে এবং অর্থ, তারিখ, সময়, স্থান, নির্দেশনা ও নেতিবাচক বাক্য মিলছে কি না যাচাই করা হবে। এই সংস্করণে কোনো যাচাই-সুবিধা বা এআই মডেল নেই।',

  'sources.activeTitle': 'বর্তমান উৎস',
  'sources.name': 'USGS Earthquake Hazards Program',
  'sources.activeDesc': 'গত সাত দিনে বিশ্বজুড়ে ২.৫ বা তার বেশি মাত্রার ভূমিকম্প, সরাসরি প্রকাশ্য ফিড থেকে পড়া হয়। USGS-এর তথ্য যুক্তরাষ্ট্রের ভূতাত্ত্বিক জরিপ সংস্থার প্রকাশ্য তথ্য।',
  'sources.feedLink': 'USGS GeoJSON সারাংশ ফিড খুলুন',
  'sources.tilesLabel': 'মানচিত্রের টাইল',
  'sources.plannedTitle': 'পরিকল্পিত উৎস (এখনও সংযুক্ত নয়)',
  'sources.plannedBadge': 'পরিকল্পিত',
  'planned.gdacs': 'বৈশ্বিক দুর্যোগ সতর্কতা',
  'planned.ffwc': 'বন্যা পূর্বাভাস ও সতর্কীকরণ',
  'planned.imd': 'আবহাওয়া ও ঘূর্ণিঝড়ের বুলেটিন',
  'planned.openMeteo': 'আবহাওয়ার তথ্য',
  'planned.gdelt': 'সংবাদ ও গণমাধ্যম পর্যবেক্ষণ',

  'footer.text': 'উৎস: USGS Earthquake Hazards Program। BANGUJ Bridge শুধু পর্যবেক্ষিত ভূমিকম্পের প্রতিবেদন দেখায়। এটি ভূমিকম্পের পূর্বাভাস দেয় না এবং কোনো সরকারি সতর্কতা বা সরিয়ে নেওয়ার নির্দেশনাও দেয় না। অফিসিয়াল নির্দেশনার জন্য আপনার জাতীয় ও স্থানীয় কর্তৃপক্ষের কথা অনুসরণ করুন।',
};

// DRAFT: needs native-speaker review.
const gu: Dictionary = {
  'app.name': 'BANGUJ Bridge',
  'language.label': 'ભાષા',

  'nav.sections': 'વિભાગો',
  'nav.liveMap': 'લાઇવ નકશો',
  'nav.eventFeed': 'ઘટનાઓની યાદી',
  'nav.verify': 'દ્વિભાષી ચેતવણી ચકાસણી',
  'nav.sources': 'સ્ત્રોતો અને ડેટા સ્થિતિ',

  'header.lastRefresh': 'છેલ્લું સફળ અપડેટ: {time}',
  'header.noRefreshYet': 'હજુ સુધી નથી',

  'status.loading': 'USGS સાથે જોડાઈ રહ્યું છે',
  'status.live': 'USGS સાથે જોડાયેલ છે',
  'status.stale': 'જૂનો ડેટા: અપડેટ નિષ્ફળ થઈ રહ્યા છે',
  'status.unavailable': 'ઉપલબ્ધ નથી: USGS નો ડેટા લોડ થઈ શક્યો નથી',

  'banner.stale': 'જૂનો ડેટા બતાવાઈ રહ્યો છે. છેલ્લે સફળતાપૂર્વક ડેટા {time} એ મેળવવામાં આવ્યો હતો, અને તાજેતરના અપડેટ નિષ્ફળ ગયા છે. આ ઘટનાઓ કદાચ તાજી ન હોય.',
  'banner.unavailable': 'ભૂકંપનો ડેટા ઉપલબ્ધ નથી. BANGUJ Bridge USGS ફીડ લોડ કરી શક્યું નથી ({reason}). કોઈ ઘટના બતાવાતી નથી. દર {seconds} સેકન્ડે ફરી પ્રયાસ કરવામાં આવશે.',

  'error.network': 'USGS ફીડ સુધી પહોંચી શકાયું નથી.',
  'error.http': 'USGS ફીડે HTTP ભૂલ {status} પાછી આપી.',
  'error.invalidJson': 'USGS ફીડે અમાન્ય ડેટા (માન્ય JSON નથી) પાછો આપ્યો.',
  'error.invalidFormat': 'USGS નો પ્રતિભાવ અપેક્ષિત ફોર્મેટમાં ન હતો.',
  'error.unknown': 'ડેટા લોડ કરતી વખતે અજ્ઞાત ભૂલ થઈ.',

  'region.label': 'પ્રદેશ',
  'region.global.button': 'આખું વિશ્વ',
  'region.bangladesh.button': 'બાંગ્લાદેશ',
  'region.gujarat.button': 'ગુજરાત, ભારત',
  'region.bangladesh.name': 'બાંગ્લાદેશ',
  'region.gujarat.name': 'ગુજરાત, ભારત',
  'region.note': 'પ્રાદેશિક દૃશ્યોમાં નકશાને કેન્દ્રિત કરવા અને ઘટનાઓ ગાળવા માટે આશરે લંબચોરસ શોધ વિસ્તારનો ઉપયોગ થાય છે. તે સત્તાવાર વહીવટી સીમાઓ નથી.',
  'region.emptyNotice': 'USGS ના છેલ્લા 7 દિવસના ફીડમાં {region}ના અંદાજિત શોધ વિસ્તારમાં 2.5 કે તેથી વધુ તીવ્રતાનો કોઈ ભૂકંપ નથી.',

  'feed.title': 'તાજેતરના ભૂકંપ',
  'feed.titleCount': 'તાજેતરના ભૂકંપ ({count})',
  'feed.loading': 'USGS પાસેથી ભૂકંપના અહેવાલ લોડ થઈ રહ્યા છે...',
  'feed.unavailable': 'USGS ફીડ ઉપલબ્ધ ન હોવાથી બતાવવા માટે કોઈ ડેટા નથી.',
  'feed.empty': 'બતાવવા માટે કોઈ ઘટના નથી.',
  'feed.depth': 'ઊંડાઈ {depth}',
  'feed.usgsLink': 'USGS ઘટના પૃષ્ઠ',

  'details.title': 'ઘટનાની વિગતો',
  'details.selectPrompt': 'વિગતો જોવા માટે નકશા પરનું ચિહ્ન અથવા યાદીમાંની કોઈ ઘટના પસંદ કરો.',
  'details.eventTime': 'ઘટનાનો સમય',
  'details.updated': 'USGS દ્વારા છેલ્લું અપડેટ',
  'details.depth': 'ઊંડાઈ',
  'details.latitude': 'અક્ષાંશ',
  'details.longitude': 'રેખાંશ',
  'details.eventId': 'USGS ઘટના આઈડી',
  'details.openOfficial': 'USGS નું સત્તાવાર ઘટના પૃષ્ઠ ખોલો',
  'details.disclaimer': 'આ USGS તરફથી નોંધાયેલો ભૂકંપનો અહેવાલ છે. તે આગાહી નથી અને સત્તાવાર સ્થળાંતરની સૂચના પણ નથી.',

  'event.placeMissing': 'સ્થળનું વર્ણન આપવામાં આવ્યું નથી',
  'common.notProvided': 'આપેલ નથી',
  'common.notAvailable': 'ઉપલબ્ધ નથી',
  'common.magnitudeMissing': 'અજ્ઞાત',

  'map.legend': 'ચિહ્નનું કદ અને રંગ નોંધાયેલી તીવ્રતા દર્શાવે છે: 4 થી ઓછી વાદળી, 4 થી 4.9 પીળી, 5 થી 5.9 નારંગી, 6 અને તેથી વધુ લાલ. રંગો ફક્ત દૃશ્ય સહાય છે, જોખમનું સ્તર નથી.',
  'map.tilesUnavailable': 'નકશાની પૃષ્ઠભૂમિ લોડ થઈ શકી નથી, તેથી ભૂકંપ સાદી પૃષ્ઠભૂમિ પર બતાવાયા છે. USGS એ આપેલા વાસ્તવિક સ્થાન-નિર્દેશાંકો પર જ તે દર્શાવાયા છે.',
  'map.helpSummary': 'નકશાની પૃષ્ઠભૂમિ લોડ થતી નથી?',
  'map.helpBody': 'પૃષ્ઠભૂમિનો નકશો OpenStreetMap પરથી આવે છે. જો તે “Access blocked” લખેલી છબી બતાવે અથવા ખાલી રહે, તો પેજ કદાચ કોઈ એમ્બેડેડ પ્રિવ્યૂની અંદર ચાલી રહ્યું છે, અથવા કોઈ પ્રાઇવસી ટૂલ વિનંતીનો સ્ત્રોત છુપાવી રહ્યું છે. એપ્લિકેશનને સામાન્ય બ્રાઉઝર ટેબમાં ખોલો. પૃષ્ઠભૂમિ હોય કે ન હોય, ભૂકંપના ચિહ્નો વાસ્તવિક સ્થાન પર જ દોરાય છે.',
  'map.zoomIn': 'મોટું કરો',
  'map.zoomOut': 'નાનું કરો',
  'map.popupDepth': 'ઊંડાઈ: {depth}',

  'health.title': 'ડેટા સ્થિતિ',
  'health.connection': 'જોડાણ',
  'health.lastFetch': 'છેલ્લી સફળ ડેટા પ્રાપ્તિ',
  'health.noFetchYet': 'હજુ સુધી કોઈ સફળ ડેટા પ્રાપ્તિ થઈ નથી',
  'health.generated': 'USGS ફીડ બનાવ્યાનો સમય',
  'health.received': 'પ્રાપ્ત ઘટનાઓ',
  'health.inView': 'આ દૃશ્યમાં ઘટનાઓ',
  'health.skipped': 'છોડી દીધેલા રેકોર્ડ',
  'health.skippedValue': '{count} (માહિતી ખૂટે છે અથવા અમાન્ય છે)',
  'health.autoRefresh': 'આપમેળે અપડેટ',
  'health.autoRefreshValue': 'આ પેજ ખુલ્લું હોય ત્યારે દર {seconds} સેકન્ડે',
  'health.refreshFailed': 'છેલ્લું અપડેટ નિષ્ફળ ગયું: {reason} (સતત {count} વખત)',
  'health.refreshNow': 'હમણાં અપડેટ કરો',
  'health.refreshing': 'અપડેટ થઈ રહ્યું છે...',

  'verify.badge': 'આયોજિત, હજુ બનાવાયું નથી',
  'verify.body': 'ભવિષ્યના તબક્કામાં મહત્વપૂર્ણ જાહેર સૂચનાઓના બંગાળી અને ગુજરાતી સંસ્કરણોની સરખામણી કરવામાં આવશે અને અર્થ, તારીખો, સમય, સ્થળો, સૂચનાઓ અને નકારાત્મક વાક્યો મેળ ખાય છે કે નહીં તે તપાસવામાં આવશે. આ સંસ્કરણમાં કોઈ ચકાસણી સુવિધા કે એઆઈ મોડેલ નથી.',

  'sources.activeTitle': 'હાલનો સ્ત્રોત',
  'sources.name': 'USGS Earthquake Hazards Program',
  'sources.activeDesc': 'છેલ્લા સાત દિવસમાં વિશ્વભરના 2.5 કે તેથી વધુ તીવ્રતાના ભૂકંપ, સીધા જાહેર ફીડમાંથી વાંચવામાં આવે છે. USGS નો ડેટા અમેરિકાના ભૂસ્તરીય સર્વેક્ષણની જાહેર માહિતી છે.',
  'sources.feedLink': 'USGS GeoJSON સારાંશ ફીડ ખોલો',
  'sources.tilesLabel': 'નકશાની ટાઇલ્સ',
  'sources.plannedTitle': 'આયોજિત સ્ત્રોતો (હજુ જોડાયેલા નથી)',
  'sources.plannedBadge': 'આયોજિત',
  'planned.gdacs': 'વૈશ્વિક આપત્તિ ચેતવણીઓ',
  'planned.ffwc': 'પૂરની આગાહી અને ચેતવણી',
  'planned.imd': 'હવામાન અને વાવાઝોડાના બુલેટિન',
  'planned.openMeteo': 'હવામાન ડેટા',
  'planned.gdelt': 'સમાચાર અને મીડિયા દેખરેખ',

  'footer.text': 'સ્ત્રોત: USGS Earthquake Hazards Program. BANGUJ Bridge ફક્ત નોંધાયેલા ભૂકંપના અહેવાલ બતાવે છે. તે ભૂકંપની આગાહી કરતું નથી અને કોઈ સત્તાવાર ચેતવણી કે સ્થળાંતરની સૂચના આપતું નથી. સત્તાવાર માર્ગદર્શન માટે તમારા રાષ્ટ્રીય અને સ્થાનિક સત્તાવાળાઓને અનુસરો.',
};

export const translations: Record<Language, Dictionary> = { en, bn, gu };

/** Look up a string and fill in {placeholders}. Falls back to English if a key is somehow missing. */
export function translate(language: Language, key: TranslationKey, params?: TranslationParams): string {
  const template = translations[language]?.[key] ?? en[key];
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (whole, name: string) => (name in params ? String(params[name]) : whole));
}
