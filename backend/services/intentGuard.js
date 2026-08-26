/**
 * SALDO Input Boundary & Intent Guard
 * 
 * Classifies untrusted user input before and alongside AI parsing.
 * Defends against prompt injection, instruction overrides, out-of-scope conversational requests,
 * and arbitrary execution attempts.
 */

// Heuristic patterns for fast pre-classification of blatant non-financial / injection requests
const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions|prompts|rules)/i,
  /reveal\s+(your\s+)?(system|hidden)\s+(prompt|instructions)/i,
  /show\s+(me\s+)?(your\s+)?(system\s+prompt|instructions|developer\s+mode)/i,
  /pretend\s+(you\s+are|to\s+be)\s+/i,
  /you\s+are\s+now\s+(chatgpt|dan|an\s+unrestricted)/i,
  /developer\s+mode/i,
  /disable\s+(your\s+)?(safety|rules|constraints)/i,
  /return\s+(the\s+)?(api\s+key|secret|env|database\s+password)/i,
  /what\s+is\s+your\s+system\s+prompt/i,
];

const ARBITRARY_COMMAND_PATTERNS = [
  /^delete\s+all\s+(my\s+)?(transactions|data|accounts)/i,
  /^drop\s+database/i,
  /^reset\s+everything/i,
];

const NON_TRANSACTION_PATTERNS = [
  /^(halo|hai|hello|hi|hey|p)\s*$/i,
  /^hari\s+ini\s+hari\s+apa\??$/i,
  /^cuaca(nya)?\s+gimana\??$/i,
  /^bikin(kan)?\s+(pantun|puisi|cerita|lagu|caption)/i,
  /^siapa\s+presiden\s+/i,
  /^(gue|saya|aku)\s+lagi\s+(capek|sedih|senang|bosan|galau)/i,
  /^jelas(in|kan)\s+(react|javascript|python|coding|html|css)/i,
  /^apa\s+itu\s+saham\??$/i,
  /^ceritain\s+film\s+/i,
];

export const preCheckIntent = (text) => {
  if (!text || typeof text !== "string") {
    return { isGuarded: true, intentCategory: "NON_TRANSACTION", message: "SALDO is for tracking your money. Coba ceritakan transaksi yang ingin kamu catat." };
  }

  const trimmed = text.trim();

  // Check for arbitrary destructive commands
  for (const pattern of ARBITRARY_COMMAND_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        isGuarded: true,
        intentCategory: "PROMPT_INJECTION",
        message: "SALDO can only modify transactions through the available transaction management controls.",
      };
    }
  }

  // Check for pure prompt injections (unless it clearly contains a transaction keyword like 'beli', 'kopi', 'rp', etc.)
  const hasFinancialContent = /\b(beli|bayar|keluar|gaji|masuk|transfer|rp|k\b|ribu|juta|cash|bca|gopay|makan|ngopi|belanja)\b/i.test(trimmed);

  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(trimmed) && !hasFinancialContent) {
      return {
        isGuarded: true,
        intentCategory: "PROMPT_INJECTION",
        message: "SALDO can only help with financial tracking. Coba masukkan transaksi yang ingin kamu catat.",
      };
    }
  }

  // Check for obvious non-transaction conversational inputs without financial intent
  for (const pattern of NON_TRANSACTION_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        isGuarded: true,
        intentCategory: "NON_TRANSACTION",
        message: "SALDO is for tracking your money. Coba ceritakan transaksi yang ingin kamu catat.",
      };
    }
  }

  return { isGuarded: false };
};
