import Transaction from "../models/Transaction.js";
import Account from "../models/Account.js";

/**
 * Helper to adjust account balance safely
 */
const adjustAccountBalance = async (accountId, amount, operation) => {
  if (!accountId || isNaN(amount)) return;
  const account = await Account.findById(accountId);
  if (!account) return;

  if (operation === "add") {
    account.balance += Number(amount);
  } else if (operation === "subtract") {
    account.balance -= Number(amount);
  }
  await account.save();
};

/**
 * Authoritative Transaction Domain Service
 */
export const createTransaction = async ({
  userId,
  type,
  amount,
  description,
  date,
  category,
  account,
  destinationAccount,
  items = [],
}) => {
  if (!type || amount === undefined || amount === null || !account) {
    throw new Error("Transaction type, amount, and account are required");
  }

  const numericAmount = Number(amount);
  if (isNaN(numericAmount) || numericAmount < 0) {
    throw new Error("Amount must be a valid positive number");
  }

  // 1. Verify source account ownership
  const sourceAcc = await Account.findOne({ _id: account, createdBy: userId });
  if (!sourceAcc) {
    throw new Error("Source account not found or unauthorized");
  }

  // 2. Transfer verification
  if (type === "Transfer") {
    if (!destinationAccount) {
      throw new Error("Destination account is required for transfers");
    }
    if (String(account) === String(destinationAccount)) {
      throw new Error("Source and destination accounts must be different");
    }
    const destAcc = await Account.findOne({ _id: destinationAccount, createdBy: userId });
    if (!destAcc) {
      throw new Error("Destination account not found or unauthorized");
    }
  }

  // 3. Create the transaction record
  const transaction = new Transaction({
    type,
    amount: numericAmount,
    description: description || (type === "Transfer" ? "Transfer Dana" : "Transaksi"),
    date: date ? new Date(date) : new Date(),
    category: type === "Transfer" ? undefined : (category || undefined),
    account,
    destinationAccount: type === "Transfer" ? destinationAccount : undefined,
    items: Array.isArray(items) ? items : [],
    createdBy: userId,
  });

  const savedTx = await transaction.save();

  // 4. Mutate account balances
  if (type === "Income") {
    await adjustAccountBalance(account, numericAmount, "add");
  } else if (type === "Expense") {
    await adjustAccountBalance(account, numericAmount, "subtract");
  } else if (type === "Transfer") {
    await adjustAccountBalance(account, numericAmount, "subtract");
    await adjustAccountBalance(destinationAccount, numericAmount, "add");
  }

  return await Transaction.findById(savedTx._id)
    .populate("category", "name icon color type")
    .populate("account", "name type color")
    .populate("destinationAccount", "name type color");
};

export const updateTransaction = async ({
  transactionId,
  userId,
  type,
  amount,
  description,
  date,
  category,
  account,
  destinationAccount,
  items,
}) => {
  const transaction = await Transaction.findOne({
    _id: transactionId,
    createdBy: userId,
  });

  if (!transaction) {
    throw new Error("Transaction not found or unauthorized");
  }

  // 1. Revert previous balances
  if (transaction.type === "Income") {
    await adjustAccountBalance(transaction.account, transaction.amount, "subtract");
  } else if (transaction.type === "Expense") {
    await adjustAccountBalance(transaction.account, transaction.amount, "add");
  } else if (transaction.type === "Transfer") {
    await adjustAccountBalance(transaction.account, transaction.amount, "add");
    await adjustAccountBalance(transaction.destinationAccount, transaction.amount, "subtract");
  }

  // 2. Validate updated accounts & type
  const targetAccountId = account || transaction.account;
  const targetSourceAcc = await Account.findOne({ _id: targetAccountId, createdBy: userId });
  if (!targetSourceAcc) {
    throw new Error("Account not found or unauthorized");
  }

  const newType = type || transaction.type;
  const newAmount = amount !== undefined ? Number(amount) : transaction.amount;
  const targetDestAccountId = destinationAccount !== undefined ? destinationAccount : transaction.destinationAccount;

  if (newType === "Transfer") {
    if (!targetDestAccountId) {
      throw new Error("Destination account is required for transfers");
    }
    if (String(targetAccountId) === String(targetDestAccountId)) {
      throw new Error("Source and destination accounts must be different");
    }
    const destAcc = await Account.findOne({ _id: targetDestAccountId, createdBy: userId });
    if (!destAcc) {
      throw new Error("Destination account not found or unauthorized");
    }
  }

  // 3. Save new values
  transaction.type = newType;
  transaction.amount = newAmount;
  transaction.description = description !== undefined ? description : transaction.description;
  transaction.date = date ? new Date(date) : transaction.date;
  transaction.account = targetAccountId;

  if (newType === "Transfer") {
    transaction.destinationAccount = targetDestAccountId;
    transaction.category = undefined;
  } else {
    transaction.category = category !== undefined ? category : transaction.category;
    transaction.destinationAccount = undefined;
  }

  if (items !== undefined) {
    transaction.items = items;
  }

  const updatedTx = await transaction.save();

  // 4. Apply new balances
  if (newType === "Income") {
    await adjustAccountBalance(targetAccountId, newAmount, "add");
  } else if (newType === "Expense") {
    await adjustAccountBalance(targetAccountId, newAmount, "subtract");
  } else if (newType === "Transfer") {
    await adjustAccountBalance(targetAccountId, newAmount, "subtract");
    await adjustAccountBalance(targetDestAccountId, newAmount, "add");
  }

  return await Transaction.findById(updatedTx._id)
    .populate("category", "name icon color type")
    .populate("account", "name type color")
    .populate("destinationAccount", "name type color");
};

export const deleteTransaction = async ({ transactionId, userId }) => {
  const transaction = await Transaction.findOne({
    _id: transactionId,
    createdBy: userId,
  });

  if (!transaction) {
    throw new Error("Transaction not found or unauthorized");
  }

  // Revert balance before deletion
  if (transaction.type === "Income") {
    await adjustAccountBalance(transaction.account, transaction.amount, "subtract");
  } else if (transaction.type === "Expense") {
    await adjustAccountBalance(transaction.account, transaction.amount, "add");
  } else if (transaction.type === "Transfer") {
    await adjustAccountBalance(transaction.account, transaction.amount, "add");
    await adjustAccountBalance(transaction.destinationAccount, transaction.amount, "subtract");
  }

  await Transaction.deleteOne({ _id: transactionId });
  return { message: "Transaction removed successfully" };
};

export const getTransactions = async ({
  userId,
  startDate,
  endDate,
  category,
  type,
  account,
  search,
  page = 1,
  limit = 50,
}) => {
  const query = { createdBy: userId };

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date.$lte = end;
    }
  }

  if (category) query.category = category;
  if (type) query.type = type;
  if (account) {
    query.$or = [{ account }, { destinationAccount: account }];
  }
  if (search) {
    query.description = { $regex: search, $options: "i" };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const transactions = await Transaction.find(query)
    .populate("category", "name icon color type")
    .populate("account", "name type color")
    .populate("destinationAccount", "name type color")
    .sort({ date: -1, createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Transaction.countDocuments(query);

  return {
    transactions,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    total,
  };
};
