/**
 * Language Context - AUREX Civic Issue Reporting System
 * 
 * Provides multilingual support (English, Tamil, Hindi).
 */

import React, { createContext, useContext, useEffect, useState } from 'react';

type Language = 'en' | 'ta' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Translation dictionary
const translations: Record<Language, Record<string, string>> = {
  en: {
    // General
    'app.name': 'AUREX',
    'app.tagline': 'Civic Issue Reporting',
    'loading': 'Loading...',
    'error': 'Something went wrong',
    'retry': 'Retry',
    'cancel': 'Cancel',
    'save': 'Save',
    'delete': 'Delete',
    'edit': 'Edit',
    'close': 'Close',
    'confirm': 'Confirm',
    'back': 'Back',
    'next': 'Next',
    'submit': 'Submit',
    'search': 'Search',
    'filter': 'Filter',
    'sort': 'Sort',
    
    // Navigation
    'nav.home': 'Home',
    'nav.community': 'Community',
    'nav.report': 'Report',
    'nav.track': 'Track',
    'nav.laws': 'Laws',
    'nav.dashboard': 'Dashboard',
    'nav.reports': 'Reports',
    'nav.messages': 'Messages',
    'nav.settings': 'Settings',
    'nav.profile': 'Profile',
    'nav.logout': 'Logout',
    
    // Auth
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.name': 'Full Name',
    'auth.phone': 'Phone Number',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
    'auth.signUp': 'Sign Up',
    'auth.signIn': 'Sign In',
    
    // Home
    'home.welcome': 'Welcome',
    'home.welcomeBack': 'Welcome back',
    'home.reportIssue': 'Report Issue',
    'home.viewReports': 'View Reports',
    'home.statistics': 'Statistics',
    'home.announcements': 'Announcements',
    'home.recentActivity': 'Recent Activity',
    
    // Report
    'report.title': 'Report an Issue',
    'report.issueTitle': 'Issue Title',
    'report.description': 'Description',
    'report.category': 'Category',
    'report.priority': 'Priority',
    'report.location': 'Location',
    'report.media': 'Photos/Videos',
    'report.anonymous': 'Report Anonymously',
    'report.submit': 'Submit Report',
    'report.success': 'Report submitted successfully!',
    
    // Categories
    'category.roads': 'Roads',
    'category.water_supply': 'Water Supply',
    'category.electricity': 'Electricity',
    'category.sanitation': 'Sanitation',
    'category.garbage': 'Garbage',
    'category.streetlights': 'Street Lights',
    'category.public_transport': 'Public Transport',
    'category.parks': 'Parks',
    'category.noise_pollution': 'Noise Pollution',
    'category.air_pollution': 'Air Pollution',
    'category.illegal_construction': 'Illegal Construction',
    'category.traffic': 'Traffic',
    'category.safety': 'Safety',
    'category.healthcare': 'Healthcare',
    'category.education': 'Education',
    'category.other': 'Other',
    
    // Priority
    'priority.low': 'Low',
    'priority.medium': 'Medium',
    'priority.high': 'High',
    'priority.emergency': 'Emergency',
    
    // Status
    'status.pending': 'Pending',
    'status.under_review': 'Under Review',
    'status.in_progress': 'In Progress',
    'status.resolved': 'Resolved',
    'status.rejected': 'Rejected',
    'status.escalated': 'Escalated',
    
    // Track
    'track.title': 'My Reports',
    'track.noReports': 'No reports yet',
    'track.reportId': 'Report ID',
    'track.submitted': 'Submitted',
    'track.lastUpdated': 'Last Updated',
    'track.timeline': 'Status Timeline',
    
    // Community
    'community.title': 'Community',
    'community.posts': 'Posts',
    'community.announcements': 'Announcements',
    'community.stories': 'Stories',
    'community.like': 'Like',
    'community.comment': 'Comment',
    'community.share': 'Share',
    'community.report': 'Report',
    'community.writeComment': 'Write a comment...',
    
    // Laws
    'laws.title': 'Laws & Awareness',
    'laws.search': 'Search laws...',
    'laws.categories': 'Categories',
    'laws.featured': 'Featured',
    'laws.readMore': 'Read More',
    
    // Emergency
    'emergency.title': 'Emergency',
    'emergency.sos': 'SOS Emergency',
    'emergency.call': 'Call Emergency',
    'emergency.contacts': 'Emergency Contacts',
    'emergency.police': 'Police',
    'emergency.ambulance': 'Ambulance',
    'emergency.fire': 'Fire Department',
    
    // Settings
    'settings.title': 'Settings',
    'settings.appearance': 'Appearance',
    'settings.darkMode': 'Dark Mode',
    'settings.language': 'Language',
    'settings.notifications': 'Notifications',
    'settings.pushNotifications': 'Push Notifications',
    'settings.emailNotifications': 'Email Notifications',
    'settings.help': 'Help & Support',
    'settings.privacy': 'Privacy Policy',
    'settings.terms': 'Terms & Conditions',
    'settings.about': 'About AUREX',
    
    // Messages
    'messages.title': 'Messages',
    'messages.noMessages': 'No messages yet',
    'messages.noConversations': 'No conversations yet',
    'messages.search': 'Search conversations',
    'messages.photo': 'Photo',
    'messages.document': 'Document',
    'messages.message': 'Message',
    'messages.someone': 'Someone',
    'messages.user': 'User',
    'messages.attachment': 'Attachment',
    'messages.loadOlder': 'Load older messages',
    'messages.emptyPrompt': 'No messages yet. Say hello!',
    'messages.reply': 'Reply',
    'messages.delete': 'Delete',
    'messages.replyingTo': 'Replying to',
    'messages.imageReady': 'Image ready to send',
    'messages.isTyping': 'is typing...',
    'messages.someoneTyping': 'Someone is typing...',
    'messages.selectConversation': 'Select a conversation to start chatting.',
    'messages.pickConversation': 'Pick a conversation from the list.',
    'messages.noAdmin': 'No admin available.',
    'messages.reconnecting': 'Reconnecting to chat server...',
    'messages.typeMessage': 'Type a message...',
    'messages.send': 'Send',
    'messages.online': 'Online',
    'messages.offline': 'Offline',
    
    // Admin
    'admin.dashboard': 'Admin Dashboard',
    'admin.totalReports': 'Total Reports',
    'admin.pendingReports': 'Pending',
    'admin.resolvedReports': 'Resolved',
    'admin.users': 'Users',
    'admin.recentReports': 'Recent Reports',
    'admin.manageReports': 'Manage Reports',
    'admin.manageCommunity': 'Manage Community',
    'admin.manageLaws': 'Manage Laws',
    'admin.manageContacts': 'Manage Contacts',
  },
  ta: {
    // Tamil translations
    'app.name': 'ஆரெக்ஸ்',
    'app.tagline': 'நகர்ப்புற பிரச்சனை அறிக்கை',
    'loading': 'ஏற்றுகிறது...',
    'error': 'எதோ தவறு நடந்துவிட்டது',
    'retry': 'மீண்டும் முயற்சிக்கவும்',
    'cancel': 'ரத்து செய்',
    'save': 'சேமி',
    'delete': 'நீக்கு',
    'edit': 'திருத்து',
    'close': 'மூடு',
    'confirm': 'உறுதி செய்',
    'back': 'பின் செல்',
    'next': 'அடுத்து',
    'submit': 'சமர்ப்பி',
    'search': 'தேடு',
    'filter': 'வடிப்பான்',
    'sort': 'வரிசைப்படுத்து',
    
    'nav.home': 'முகப்பு',
    'nav.community': 'சமூகம்',
    'nav.report': 'அறிக்கை',
    'nav.track': 'கண்காணி',
    'nav.laws': 'சட்டங்கள்',
    'nav.dashboard': 'டாஷ்போர்டு',
    'nav.reports': 'அறிக்கைகள்',
    'nav.messages': 'செய்திகள்',
    'nav.settings': 'அமைப்புகள்',
    'nav.profile': 'சுயவிவரம்',
    'nav.logout': 'வெளியேறு',
    
    'auth.login': 'உள்நுழைய',
    'auth.register': 'பதிவு செய்',
    'auth.email': 'மின்னஞ்சல்',
    'auth.password': 'கடவுச்சொல்',
    'auth.name': 'முழு பெயர்',
    'auth.phone': 'தொலைபேசி எண்',
    'auth.forgotPassword': 'கடவுச்சொல் மறந்ததா?',
    'auth.noAccount': 'கணக்கு இல்லையா?',
    'auth.hasAccount': 'ஏற்கனவே கணக்கு உள்ளதா?',
    'auth.signUp': 'பதிவு செய்',
    'auth.signIn': 'உள்நுழைய',
    
    'home.welcome': 'வரவேற்கிறோம்',
    'home.welcomeBack': 'மீண்டும் வரவேற்கிறோம்',
    'home.reportIssue': 'பிரச்சனையை பதிவு செய்',
    'home.viewReports': 'அறிக்கைகளை காண்',
    'home.statistics': 'புள்ளிவிவரங்கள்',
    'home.announcements': 'அறிவிப்புகள்',
    'home.recentActivity': 'சமீபத்திய செயல்பாடு',
    
    'report.title': 'பிரச்சனையை பதிவு செய்',
    'report.issueTitle': 'பிரச்சனை தலைப்பு',
    'report.description': 'விளக்கம்',
    'report.category': 'வகை',
    'report.priority': 'முக்கியத்துவம்',
    'report.location': 'இடம்',
    'report.media': 'புகைப்படங்கள்/வீடியோக்கள்',
    'report.anonymous': 'அநாமதேயமாக பதிவு செய்',
    'report.submit': 'அறிக்கையை சமர்ப்பி',
    'report.success': 'அறிக்கை வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!',
    
    'category.roads': 'சாலைகள்',
    'category.water_supply': 'குடிநீர் வழங்கல்',
    'category.electricity': 'மின்சாரம்',
    'category.sanitation': 'சுகாதாரம்',
    'category.garbage': 'குப்பை',
    'category.streetlights': 'தெரு விளக்குகள்',
    'category.public_transport': 'பொதுப் போக்குவரத்து',
    'category.parks': 'பூங்காக்கள்',
    'category.noise_pollution': 'ஒலி மாசு',
    'category.air_pollution': 'காற்று மாசு',
    'category.illegal_construction': 'சட்டவிரோத கட்டிடம்',
    'category.traffic': 'போக்குவரத்து',
    'category.safety': 'பாதுகாப்பு',
    'category.healthcare': 'சுகாதாரம்',
    'category.education': 'கல்வி',
    'category.other': 'மற்றவை',
    
    'priority.low': 'குறைவு',
    'priority.medium': 'நடுத்தரம்',
    'priority.high': 'அதிகம்',
    'priority.emergency': 'அவசரம்',
    
    'status.pending': 'நிலுவையில்',
    'status.under_review': 'மதிப்பீட்டில்',
    'status.in_progress': 'செயல்பாட்டில்',
    'status.resolved': 'தீர்க்கப்பட்டது',
    'status.rejected': 'நிராகரிக்கப்பட்டது',
    'status.escalated': 'உயர்த்தப்பட்டது',
    
    'track.title': 'எனது அறிக்கைகள்',
    'track.noReports': 'இன்னும் அறிக்கைகள் இல்லை',
    'track.reportId': 'அறிக்கை எண்',
    'track.submitted': 'சமர்ப்பிக்கப்பட்டது',
    'track.lastUpdated': 'கடைசி புதுப்பிப்பு',
    'track.timeline': 'நிலை காலவரிசை',
    
    'community.title': 'சமூகம்',
    'community.posts': 'பதிவுகள்',
    'community.announcements': 'அறிவிப்புகள்',
    'community.stories': 'கதைகள்',
    'community.like': 'பிடி',
    'community.comment': 'கருத்து',
    'community.share': 'பகிர்',
    'community.report': 'புகார்',
    'community.writeComment': 'கருத்து எழுது...',
    
    'laws.title': 'சட்டங்கள் & விழிப்புணர்வு',
    'laws.search': 'சட்டங்களை தேடு...',
    'laws.categories': 'வகைகள்',
    'laws.featured': 'சிறப்பு',
    'laws.readMore': 'மேலும் படி',
    
    'emergency.title': 'அவசரம்',
    'emergency.sos': 'அவசர SOS',
    'emergency.call': 'அவசர அழைப்பு',
    'emergency.contacts': 'அவசர தொடர்புகள்',
    'emergency.police': 'காவல்துறை',
    'emergency.ambulance': 'ஆம்புலன்ஸ்',
    'emergency.fire': 'தீயணைப்பு',
    
    'settings.title': 'அமைப்புகள்',
    'settings.appearance': 'தோற்றம்',
    'settings.darkMode': 'இருண்ட பயன்முறை',
    'settings.language': 'மொழி',
    'settings.notifications': 'அறிவிப்புகள்',
    'settings.pushNotifications': 'புஷ் அறிவிப்புகள்',
    'settings.emailNotifications': 'மின்னஞ்சல் அறிவிப்புகள்',
    'settings.help': 'உதவி & ஆதரவு',
    'settings.privacy': 'தனியுரிமை கொள்கை',
    'settings.terms': 'விதிமுறைகள் & நிபந்தனைகள்',
    'settings.about': 'ஆரெக்ஸ் பற்றி',
    
    'messages.title': 'செய்திகள்',
    'messages.noMessages': 'இன்னும் செய்திகள் இல்லை',
    'messages.noConversations': '?????? ??????????? ?????',
    'messages.search': '?????????? ????',
    'messages.photo': '??????????',
    'messages.document': '?????',
    'messages.message': '??????',
    'messages.someone': '????',
    'messages.user': '?????',
    'messages.attachment': '???????',
    'messages.loadOlder': '??????? ????????? ????????',
    'messages.emptyPrompt': '??????? ????????? ?????. ??????? ???????????!',
    'messages.reply': '?????',
    'messages.delete': '??????',
    'messages.replyingTo': '????? ??????',
    'messages.imageReady': '???? ?????? ?????? ??????',
    'messages.isTyping': '???????? ??????????...',
    'messages.someoneTyping': '???? ???????? ??????????...',
    'messages.selectConversation': '?????? ?????? ??? ?????????? ?????????????????.',
    'messages.pickConversation': '?????????? ??????? ??? ?????????? ?????????????????.',
    'messages.noAdmin': '???????? ?????????????.',
    'messages.reconnecting': '???? ????????? ???????? ????????????????...',
'messages.typeMessage': 'செய்தி எழுது...',
    'messages.send': 'அனுப்பு',
    'messages.online': 'ஆன்லைன்',
    'messages.offline': 'ஆஃப்லைன்',
    
    'admin.dashboard': 'நிர்வாக டாஷ்போர்டு',
    'admin.totalReports': 'மொத்த அறிக்கைகள்',
    'admin.pendingReports': 'நிலுவையில்',
    'admin.resolvedReports': 'தீர்க்கப்பட்டது',
    'admin.users': 'பயனர்கள்',
    'admin.recentReports': 'சமீபத்திய அறிக்கைகள்',
    'admin.manageReports': 'அறிக்கைகளை நிர்வகி',
    'admin.manageCommunity': 'சமூகத்தை நிர்வகி',
    'admin.manageLaws': 'சட்டங்களை நிர்வகி',
    'admin.manageContacts': 'தொடர்புகளை நிர்வகி',
  },
  hi: {
    // Hindi translations
    'app.name': 'ऑरिक्स',
    'app.tagline': 'नागरिक मुद्दा रिपोर्टिंग',
    'loading': 'लोड हो रहा है...',
    'error': 'कुछ गलत हो गया',
    'retry': 'पुनः प्रयास करें',
    'cancel': 'रद्द करें',
    'save': 'सहेजें',
    'delete': 'हटाएं',
    'edit': 'संपादित करें',
    'close': 'बंद करें',
    'confirm': 'पुष्टि करें',
    'back': 'वापस',
    'next': 'अगला',
    'submit': 'जमा करें',
    'search': 'खोजें',
    'filter': 'फ़िल्टर',
    'sort': 'क्रमबद्ध करें',
    
    'nav.home': 'होम',
    'nav.community': 'समुदाय',
    'nav.report': 'रिपोर्ट',
    'nav.track': 'ट्रैक',
    'nav.laws': 'कानून',
    'nav.dashboard': 'डैशबोर्ड',
    'nav.reports': 'रिपोर्ट्स',
    'nav.messages': 'संदेश',
    'nav.settings': 'सेटिंग्स',
    'nav.profile': 'प्रोफाइल',
    'nav.logout': 'लॉगआउट',
    
    'auth.login': 'लॉगिन',
    'auth.register': 'रजिस्टर',
    'auth.email': 'ईमेल',
    'auth.password': 'पासवर्ड',
    'auth.name': 'पूरा नाम',
    'auth.phone': 'फोन नंबर',
    'auth.forgotPassword': 'पासवर्ड भूल गए?',
    'auth.noAccount': 'खाता नहीं है?',
    'auth.hasAccount': 'पहले से खाता है?',
    'auth.signUp': 'साइन अप',
    'auth.signIn': 'साइन इन',
    
    'home.welcome': 'स्वागत है',
    'home.welcomeBack': 'वापसी पर स्वागत',
    'home.reportIssue': 'मुद्दा रिपोर्ट करें',
    'home.viewReports': 'रिपोर्ट देखें',
    'home.statistics': 'आंकड़े',
    'home.announcements': 'घोषणाएं',
    'home.recentActivity': 'हाल की गतिविधि',
    
    'report.title': 'मुद्दा रिपोर्ट करें',
    'report.issueTitle': 'मुद्दे का शीर्षक',
    'report.description': 'विवरण',
    'report.category': 'श्रेणी',
    'report.priority': 'प्राथमिकता',
    'report.location': 'स्थान',
    'report.media': 'फोटो/वीडियो',
    'report.anonymous': 'गुमनाम रूप से रिपोर्ट करें',
    'report.submit': 'रिपोर्ट जमा करें',
    'report.success': 'रिपोर्ट सफलतापूर्वक जमा की गई!',
    
    'category.roads': 'सड़कें',
    'category.water_supply': 'पानी की आपूर्ति',
    'category.electricity': 'बिजली',
    'category.sanitation': 'स्वच्छता',
    'category.garbage': 'कचरा',
    'category.streetlights': 'स्ट्रीट लाइट्स',
    'category.public_transport': 'सार्वजनिक परिवहन',
    'category.parks': 'पार्क',
    'category.noise_pollution': 'ध्वनि प्रदूषण',
    'category.air_pollution': 'वायु प्रदूषण',
    'category.illegal_construction': 'अवैध निर्माण',
    'category.traffic': 'यातायात',
    'category.safety': 'सुरक्षा',
    'category.healthcare': 'स्वास्थ्य सेवा',
    'category.education': 'शिक्षा',
    'category.other': 'अन्य',
    
    'priority.low': 'कम',
    'priority.medium': 'मध्यम',
    'priority.high': 'उच्च',
    'priority.emergency': 'आपातकालीन',
    
    'status.pending': 'लंबित',
    'status.under_review': 'समीक्षा में',
    'status.in_progress': 'प्रगति में',
    'status.resolved': 'हल किया गया',
    'status.rejected': 'अस्वीकृत',
    'status.escalated': 'बढ़ाया गया',
    
    'track.title': 'मेरी रिपोर्ट्स',
    'track.noReports': 'अभी तक कोई रिपोर्ट नहीं',
    'track.reportId': 'रिपोर्ट आईडी',
    'track.submitted': 'जमा किया गया',
    'track.lastUpdated': 'अंतिम अपडेट',
    'track.timeline': 'स्थिति टाइमलाइन',
    
    'community.title': 'समुदाय',
    'community.posts': 'पोस्ट्स',
    'community.announcements': 'घोषणाएं',
    'community.stories': 'कहानियां',
    'community.like': 'लाइक',
    'community.comment': 'कमेंट',
    'community.share': 'शेयर',
    'community.report': 'रिपोर्ट',
    'community.writeComment': 'कमेंट लिखें...',
    
    'laws.title': 'कानून और जागरूकता',
    'laws.search': 'कानून खोजें...',
    'laws.categories': 'श्रेणियां',
    'laws.featured': 'विशेष रुप से प्रदर्शित',
    'laws.readMore': 'और पढ़ें',
    
    'emergency.title': 'आपातकालीन',
    'emergency.sos': 'एसओएस आपातकालीन',
    'emergency.call': 'आपातकालीन कॉल',
    'emergency.contacts': 'आपातकालीन संपर्क',
    'emergency.police': 'पुलिस',
    'emergency.ambulance': 'एम्बुलेंस',
    'emergency.fire': 'फायर विभाग',
    
    'settings.title': 'सेटिंग्स',
    'settings.appearance': 'दिखावट',
    'settings.darkMode': 'डार्क मोड',
    'settings.language': 'भाषा',
    'settings.notifications': 'सूचनाएं',
    'settings.pushNotifications': 'पुश सूचनाएं',
    'settings.emailNotifications': 'ईमेल सूचनाएं',
    'settings.help': 'सहायता और समर्थन',
    'settings.privacy': 'गोपनीयता नीति',
    'settings.terms': 'नियम और शर्तें',
    'settings.about': 'ऑरिक्स के बारे में',
    
    'messages.title': 'संदेश',
    'messages.noMessages': 'अभी तक कोई संदेश नहीं',
    'messages.noConversations': '??? ?? ??? ?????? ????',
    'messages.search': '?????? ?????',
    'messages.photo': '????',
    'messages.document': '?????????',
    'messages.message': '?????',
    'messages.someone': '???',
    'messages.user': '??????????',
    'messages.attachment': '???????',
    'messages.loadOlder': '?????? ????? ??? ????',
    'messages.emptyPrompt': '??? ?? ??? ????? ????? ?????? ????!',
    'messages.reply': '????',
    'messages.delete': '?????',
    'messages.replyingTo': '?? ???? ?? ??? ???',
    'messages.imageReady': '????? ????? ?? ??? ????? ??',
    'messages.isTyping': '???? ?? ???/??? ??...',
    'messages.someoneTyping': '??? ???? ?? ???/??? ??...',
    'messages.selectConversation': '??? ???? ???? ?? ??? ??? ?????? ??????',
    'messages.pickConversation': '???? ?? ?? ?????? ??????',
    'messages.noAdmin': '??? ????? ?????? ???? ???',
    'messages.reconnecting': '??? ????? ?? ??? ?? ???? ??? ??...',
'messages.typeMessage': 'संदेश लिखें...',
    'messages.send': 'भेजें',
    'messages.online': 'ऑनलाइन',
    'messages.offline': 'ऑफलाइन',
    
    'admin.dashboard': 'एडमिन डैशबोर्ड',
    'admin.totalReports': 'कुल रिपोर्ट्स',
    'admin.pendingReports': 'लंबित',
    'admin.resolvedReports': 'हल किया गया',
    'admin.users': 'उपयोगकर्ता',
    'admin.recentReports': 'हाल की रिपोर्ट्स',
    'admin.manageReports': 'रिपोर्ट्स प्रबंधित करें',
    'admin.manageCommunity': 'समुदाय प्रबंधित करें',
    'admin.manageLaws': 'कानून प्रबंधित करें',
    'admin.manageContacts': 'संपर्क प्रबंधित करें',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('aurex-language') as Language;
      if (stored && ['en', 'ta', 'hi'].includes(stored)) return stored;
    }
    return 'en';
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
      document.documentElement.setAttribute('data-lang', language);
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('aurex-language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}


