import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { transactionApi } from "../api/client";

const FinanceContext = createContext(null);

const initialSummary = {
  income: 0,
  spends: 0,
  savings: 0,
  balance: 0,
  savings_chart: [],
};

const defaultSettings = {
  displayName: "My account",
  currency: "INR",
  savingsGoal: 100000,
};

export function FinanceProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(initialSummary);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState(null);

  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem(
        "savefolio-settings",
      );

      return stored
        ? {
            ...defaultSettings,
            ...JSON.parse(stored),
          }
        : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  const showToast = useCallback((message, type = "success") => {
    clearTimeout(toastTimerRef.current);
    setToast({ message, type });

    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 3000);
  }, []);

  const refresh = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      setError("");

      const [transactionData, summaryData] =
        await Promise.all([
          transactionApi.list(),
          transactionApi.summary(),
        ]);

      setTransactions(transactionData);
      setSummary(summaryData);
    } catch {
      setError(
        "Could not connect to the Savefolio API.",
      );
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    refresh();

    return () => {
      clearTimeout(toastTimerRef.current);
    };
  }, [refresh]);

  function openCreateForm() {
    setEditingTransaction(null);
    setFormOpen(true);
  }

  function openEditForm(transaction) {
    setEditingTransaction(transaction);
    setFormOpen(true);
  }

  function closeForm() {
    if (saving) {
      return;
    }

    setFormOpen(false);
    setEditingTransaction(null);
  }

  async function saveTransaction(values) {
    try {
      setSaving(true);
      setError("");

      if (editingTransaction) {
        await transactionApi.update(
          editingTransaction.id,
          values,
        );

        showToast("Transaction updated.");
      } else {
        await transactionApi.create(values);
        showToast("Transaction added.");
      }

      setFormOpen(false);
      setEditingTransaction(null);

      await refresh(false);

      return true;
    } catch (requestError) {
      const detail =
        requestError.response?.data?.detail;

      showToast(
        typeof detail === "string"
          ? detail
          : "Could not save the transaction.",
        "error",
      );

      return false;
    } finally {
      setSaving(false);
    }
  }

  async function deleteTransaction(id) {
    try {
      await transactionApi.remove(id);
      showToast("Transaction deleted.");
      await refresh(false);
    } catch {
      showToast(
        "Could not delete the transaction.",
        "error",
      );
    }
  }

  function updateSettings(values) {
    const updatedSettings = {
      ...settings,
      ...values,
    };

    setSettings(updatedSettings);

    localStorage.setItem(
      "savefolio-settings",
      JSON.stringify(updatedSettings),
    );

    showToast("Preferences saved.");
  }

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        summary,
        loading,
        saving,
        error,
        formOpen,
        editingTransaction,
        toast,
        settings,
        refresh,
        openCreateForm,
        openEditForm,
        closeForm,
        saveTransaction,
        deleteTransaction,
        updateSettings,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);

  if (!context) {
    throw new Error(
      "useFinance must be used inside FinanceProvider",
    );
  }

  return context;
}