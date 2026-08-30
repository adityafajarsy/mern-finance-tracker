import { useState, useRef, useEffect, useCallback } from "react";

export const useSpeechRecognition = ({
  lang = "id-ID",
  onResult,
  onFinalResult,
  onError,
} = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  // Check browser support
  const isSupported =
    typeof window !== "undefined" &&
    Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

  // Stop listening helper
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // Ignore if already stopped
      }
      setIsListening(false);
    }
  }, []);

  // Start listening helper
  const startListening = useCallback(
    (customLang = lang) => {
      if (!isSupported) {
        const errMsg = "Browser Anda belum mendukung Web Speech Recognition.";
        setError(errMsg);
        if (onError) onError(errMsg);
        return;
      }

      setError(null);

      try {
        const SpeechRecognition =
          window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;

        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = customLang || "id-ID";

        recognition.onstart = () => {
          setIsListening(true);
          setError(null);
        };

        recognition.onresult = (event) => {
          let currentInterim = "";
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const item = event.results[i];
            if (item.isFinal) {
              finalTranscript += item[0].transcript;
            } else {
              currentInterim += item[0].transcript;
            }
          }

          const combined = (finalTranscript || currentInterim).trim();
          setTranscript(combined);

          if (onResult) {
            onResult(combined);
          }

          if (finalTranscript && onFinalResult) {
            onFinalResult(finalTranscript.trim());
          }
        };

        recognition.onerror = (event) => {
          console.warn("Speech recognition error:", event.error);
          let userFriendlyMsg = "Gagal mendeteksi suara.";

          if (event.error === "not-allowed" || event.error === "permission-denied") {
            userFriendlyMsg = "Izin mikrofon ditolak. Izinkan akses mikrofon di browser untuk menggunakan fitur suara.";
          } else if (event.error === "no-speech") {
            userFriendlyMsg = "Tidak ada suara yang terdeteksi. Silakan coba lagi.";
          } else if (event.error === "network") {
            userFriendlyMsg = "Gagal terhubung ke layanan speech recognition browser.";
          }

          setError(userFriendlyMsg);
          setIsListening(false);
          if (onError) onError(userFriendlyMsg);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
      } catch (err) {
        console.error("Speech recognition startup error:", err);
        setError("Gagal memulai mikrofon. Silakan coba kembali.");
        setIsListening(false);
        if (onError) onError("Gagal memulai mikrofon.");
      }
    },
    [isSupported, lang, onResult, onFinalResult, onError]
  );

  // Toggle helper
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore
        }
      }
    };
  }, []);

  return {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
    resetTranscript,
  };
};

export default useSpeechRecognition;
