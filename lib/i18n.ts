/**
 * Curated Hindi translations for GovCorp News UI elements.
 * Provides authentic, natural journalistic Hindi rather than clumsy machine translation.
 */

export const HINDI_UI: Record<string, string> = {
  // Navigation Parent Tabs
  Home: "होम",
  Companies: "कंपनियां",
  Market: "बाज़ार",
  International: "अंतरराष्ट्रीय",
  Sectors: "सेक्टर्स",
  Appointments: "नियुक्तियां",
  Jobs: "नौकरियां",
  Government: "सरकार",
  Analysis: "विश्लेषण",
  More: "अन्य",

  // Companies Sub-categories
  "Boardroom & Governance": "बोर्डरूम और गवर्नेंस",
  "Mergers & Acquisitions": "विलय और अधिग्रहण",
  "Private Corporates": "निजी कॉर्पोरेट्स",
  "PSUs (Maharatna & Navratna)": "पीएसयू (महारत्न व नवरत्न)",
  "Quarterly Results": "त्रैमासिक परिणाम",

  // Market Sub-categories
  "BSE / NSE Updates": "बीएसई / एनएसई अपडेट्स",
  "Commodities & Energy": "कमोडिटीज़ और ऊर्जा",
  "PSU Stocks Index": "पीएसयू स्टॉक्स इंडेक्स",
  "Rupee / Dollar Tracker": "रुपया / डॉलर ट्रैकर",

  // Sectors Sub-categories
  "Aviation & Shipping": "नागरिक उड्डयन व शिपिंग",
  "Banking & Financial Services": "बैंकिंग और वित्तीय सेवाएं",
  "Defence & Aerospace": "रक्षा और एयरोस्पेस",
  "Healthcare & Pharma": "हेल्थकेयर और फार्मा",
  "Infrastructure & Railways": "बुनियादी ढांचा और रेलवे",
  "Metals & Mining": "धातु और खनन",
  "Oil & Gas": "तेल और प्राकृतिक गैस",
  "Power & Energy": "विद्युत और ऊर्जा",
  "Telecom & Technology": "दूरसंचार और प्रौद्योगिकी",

  // Government Sub-categories
  "Cabinet Approvals": "कैबिनेट निर्णय",
  "Ministry of Finance": "वित्त मंत्रालय",
  Policies: "सरकारी नीतियां",
  "Policy Decisions": "नीतिगत निर्णय",
  "States Updates": "राज्यों के समाचार",

  // More Sub-categories
  Awards: "पुरस्कार",
  Events: "आयोजन व सम्मेलन",
  Interviews: "विशेष साक्षात्कार",

  // Section Headers & Badges
  Breaking: "ब्रेकिंग न्यूज़",
  "Breaking News": "ताज़ा समाचार",
  "Top Stories": "प्रमुख ख़बरें",
  "Live Editorial": "संपादकीय चयन",
  "Featured Story": "मुख्य समाचार",
  "Latest News": "ताज़ा अपडेट्स",
  "Editorial Staff": "संपादकीय टीम",

  // Action Buttons & Links
  "View More": "और पढ़ें",
  "View More Top Stories": "और प्रमुख ख़बरें",
  "Read Full Story": "पूरी ख़बर पढ़ें",
  "Read More": "विस्तार से पढ़ें",
  Search: "खोजें",
  "Search news, companies, topics...": "समाचार, कंपनियां, विषय खोजें...",

  // Footer & Common Labels
  Company: "कंपनी",
  Sections: "सेक्शन्स",
  Legal: "कानूनी जानकारी",
  "About Us": "हमारे बारे में",
  Careers: "करियर",
  Contact: "संपर्क करें",
  "Privacy Policy": "गोपनीयता नीति",
  "Terms of Use": "उपयोग की शर्तें",
  "News Desk": "न्यूज़ डेस्क",
  "Follow Us": "फॉलो करें",
  "All rights reserved.": "सर्वाधिकार सुरक्षित।",
  "India's PSU & Corporate News Network": "भारत का प्रमुख पीएसयू व कॉर्पोरेट न्यूज़ नेटवर्क",
};

/**
 * Returns the curated translation if in Hindi mode, otherwise the original English label.
 */
export function t(key: string, isHindi?: boolean): string {
  if (!isHindi) return key;
  return HINDI_UI[key.trim()] || key;
}
