"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

let isScriptInjected = false;

export function loadGoogleTranslateScript() {
  if (typeof window === "undefined") return;
  if (isScriptInjected || document.getElementById("google-translate-script")) {
    return;
  }
  isScriptInjected = true;

  window.googleTranslateElementInit = () => {
    if (window.google?.translate?.TranslateElement) {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "hi",
          autoDisplay: false,
        },
        "google_translate_element"
      );
    }
  };

  const script = document.createElement("script");
  script.id = "google-translate-script";
  script.src =
    "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  script.async = true;
  document.body.appendChild(script);
}

export default function GoogleTranslate() {
  useEffect(() => {
    // Only load if user previously explicitly selected Hindi
    if (document.cookie.includes("googtrans=/en/hi")) {
      loadGoogleTranslateScript();
    }
  }, []);

  return <div id="google_translate_element" className="notranslate" translate="no" />;
}
