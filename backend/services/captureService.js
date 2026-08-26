import User from "../models/User.js";
import Account from "../models/Account.js";
import Category from "../models/Category.js";
import { interpretTransactionWithAI } from "./aiService.js";
import { preCheckIntent } from "./intentGuard.js";

/**
 * SALDO Capture Service
 * Intermediary between Natural Language input, Intent Guard, Date Validator, and the Transaction Engine
 */
export const interpretNaturalLanguageCapture = async ({ userId, text, referenceDate = null }) => {
  if (!text || typeof text !== "string" || !text.trim()) {
    throw new Error("Input text is required");
  }

  const trimmedText = text.trim();

  // 1. Fast deterministic pre-check guard
  const preCheck = preCheckIntent(trimmedText);
  if (preCheck.isGuarded) {
    return {
      intentCategory: preCheck.intentCategory,
      isBoundaryResponse: true,
      boundaryMessage: preCheck.message,
      draft: null,
      needsClarification: false,
      clarificationQuestion: null,
      rawText: trimmedText,
    };
  }

  // 2. Fetch user context
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const accounts = await Account.find({ createdBy: userId });
  const categories = await Category.find({ createdBy: userId });

  let defaultAccount = null;
  if (user.defaultAccount) {
    defaultAccount = accounts.find(a => String(a._id) === String(user.defaultAccount));
  }
  if (!defaultAccount && accounts.length === 1) {
    defaultAccount = accounts[0];
  }

  // 3. Deep AI Intent Classification and Financial Extraction
  const aiResult = await interpretTransactionWithAI({
    text: trimmedText,
    userAccounts: accounts,
    userCategories: categories,
    defaultAccount,
    userCurrency: user.currency || "IDR",
    referenceDate,
  });

  const intentCategory = aiResult.intentCategory || (aiResult.needsClarification ? "CLARIFICATION" : "TRANSACTION");

  // 4. Handle NON_TRANSACTION and PROMPT_INJECTION boundaries
  if (intentCategory === "NON_TRANSACTION" || intentCategory === "PROMPT_INJECTION") {
    const defaultBoundaryMsg = intentCategory === "PROMPT_INJECTION"
      ? "SALDO can only help with financial tracking. Coba masukkan transaksi yang ingin kamu catat."
      : "SALDO is for tracking your money. Coba ceritakan transaksi yang ingin kamu catat.";

    return {
      intentCategory,
      isBoundaryResponse: true,
      boundaryMessage: aiResult.boundaryMessage || defaultBoundaryMsg,
      draft: null,
      needsClarification: false,
      clarificationQuestion: null,
      rawText: trimmedText,
    };
  }

  // 5. Date Boundary Validation
  const refDateObj = referenceDate ? new Date(referenceDate) : new Date();
  const yearNum = refDateObj.getFullYear();
  const monthNum = String(refDateObj.getMonth() + 1).padStart(2, "0");
  const dayNum = String(refDateObj.getDate()).padStart(2, "0");
  const currentTodayStr = `${yearNum}-${monthNum}-${dayNum}`;
  const currentYear = yearNum;
  const currentMonth = Number(monthNum);
  const currentMonthName = refDateObj.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  let finalTxDate = aiResult.date || currentTodayStr;

  if (finalTxDate) {
    const [txYear, txMonth] = finalTxDate.split("-").map(Number);

    // Reject out-of-month (previous month / next month) through normal Capture
    if (txYear !== currentYear || txMonth !== currentMonth) {
      return {
        intentCategory: "OUT_OF_PERIOD",
        isBoundaryResponse: true,
        boundaryMessage: `Normal Capture currently supports historical transactions within the current month (${currentMonthName}). Untuk mencatat transaksi bulan lain, gunakan fitur Transaction History.`,
        draft: null,
        needsClarification: false,
        clarificationQuestion: null,
        rawText: trimmedText,
      };
    }

    // Reject future dates exceeding today
    if (finalTxDate > currentTodayStr) {
      return {
        intentCategory: "FUTURE_DATE",
        isBoundaryResponse: true,
        boundaryMessage: "SALDO cannot record transactions with future dates. Pastikan tanggal transaksi tidak melebihi hari ini.",
        draft: null,
        needsClarification: false,
        clarificationQuestion: null,
        rawText: trimmedText,
      };
    }
  }

  // 6. Account Resolution Helper
  const resolveAccount = (candidateName, fallbackAcc = defaultAccount || accounts[0]) => {
    if (!candidateName) return fallbackAcc || null;
    const lower = candidateName.toLowerCase().trim();
    const match = accounts.find(a => 
      a.name.toLowerCase() === lower || 
      a.name.toLowerCase().includes(lower) || 
      lower.includes(a.name.toLowerCase())
    );
    return match || fallbackAcc || null;
  };

  let resolvedType = aiResult.intent || "Expense";
  let resolvedSourceAccount = resolveAccount(aiResult.accountCandidate, defaultAccount || accounts[0]);
  let resolvedDestAccount = null;

  if (resolvedType === "Transfer") {
    resolvedDestAccount = resolveAccount(aiResult.destinationAccountCandidate, null);

    // If destination account is not found among user's own accounts or equals source account:
    // It is an external transfer / outflow to someone else -> treat as Expense!
    if (!resolvedDestAccount || (resolvedSourceAccount && String(resolvedSourceAccount._id) === String(resolvedDestAccount._id))) {
      resolvedType = "Expense";
      resolvedDestAccount = null;
    }
  }

  // 7. Category Resolution Helper
  const resolveCategory = (candidateName, type) => {
    if (type === "Transfer") return null;
    const available = categories.filter(c => c.type === type);
    if (!available.length) return null;

    if (candidateName) {
      const lower = candidateName.toLowerCase().trim();
      const exact = available.find(c => c.name.toLowerCase() === lower);
      if (exact) return exact;

      const partial = available.find(c => 
        c.name.toLowerCase().includes(lower) || lower.includes(c.name.toLowerCase())
      );
      if (partial) return partial;
    }

    // Default fallback category for the type
    return available[0];
  };

  const resolvedCategory = resolveCategory(aiResult.categoryCandidate, resolvedType);

  // 8. Multi-item Resolution
  let resolvedItems = [];
  if (Array.isArray(aiResult.items) && aiResult.items.length > 0) {
    resolvedItems = aiResult.items.map(item => ({
      description: item.description || "Item",
      amount: Number(item.amount) || 0,
      category: resolveCategory(item.categoryCandidate, resolvedType),
    }));
  }

  // If items exist and total stated amount is missing or sum of items differs, reconcile total amount
  let calculatedAmount = aiResult.amount !== null && !isNaN(Number(aiResult.amount)) ? Number(aiResult.amount) : null;
  if (resolvedItems.length > 0) {
    const itemsSum = resolvedItems.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    if (calculatedAmount === null || calculatedAmount === 0 || itemsSum > 0) {
      calculatedAmount = itemsSum;
    }
  }

  // 9. Construct Validated Draft Object
  const draft = {
    type: resolvedType,
    amount: calculatedAmount,
    description: aiResult.description || (resolvedType === "Transfer" ? "Transfer Dana" : "Transaksi"),
    date: finalTxDate,
    account: resolvedSourceAccount ? {
      _id: resolvedSourceAccount._id,
      name: resolvedSourceAccount.name,
      type: resolvedSourceAccount.type,
      color: resolvedSourceAccount.color,
    } : null,
    destinationAccount: resolvedDestAccount ? {
      _id: resolvedDestAccount._id,
      name: resolvedDestAccount.name,
      type: resolvedDestAccount.type,
      color: resolvedDestAccount.color,
    } : null,
    category: resolvedCategory ? {
      _id: resolvedCategory._id,
      name: resolvedCategory.name,
      icon: resolvedCategory.icon,
      color: resolvedCategory.color,
    } : null,
    items: resolvedItems,
  };

  const isClarification = intentCategory === "CLARIFICATION" || aiResult.needsClarification || draft.amount === null;

  return {
    intentCategory: isClarification ? "CLARIFICATION" : "TRANSACTION",
    isBoundaryResponse: false,
    boundaryMessage: null,
    draft,
    needsClarification: isClarification,
    clarificationQuestion: aiResult.clarificationQuestion || (draft.amount === null ? "Berapa nominal transaksinya?" : null),
    confidence: aiResult.confidence ?? 0.95,
    rawText: trimmedText,
  };
};
