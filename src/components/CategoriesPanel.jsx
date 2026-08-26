import { useState } from "react";
import { Plus, Edit2, Trash2, Tag, ArrowLeft } from "lucide-react";

const CategoriesPanel = ({
  categories,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  onSetActiveTab,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editCategory, setEditCategory] = useState(null);

  // Form states
  const [name, setName] = useState("");
  const [type, setType] = useState("Expense");
  const [color, setColor] = useState("#8B5CF6");
  const [icon, setIcon] = useState("tag");

  const handleOpenCreate = () => {
    setEditCategory(null);
    setName("");
    setType("Expense");
    setColor("#8B5CF6");
    setIcon("tag");
    setShowForm(true);
  };

  const handleOpenEdit = (cat) => {
    setEditCategory(cat);
    setName(cat.name);
    setType(cat.type);
    setColor(cat.color);
    setIcon(cat.icon);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name,
      type,
      color,
      icon,
    };

    if (editCategory) {
      onUpdateCategory(editCategory._id, payload);
    } else {
      onCreateCategory(payload);
    }
    setShowForm(false);
  };

  const incomeCategories = categories.filter((c) => c.type === "Income");
  const expenseCategories = categories.filter((c) => c.type === "Expense");

  return (
    <div className="space-y-6 animate-fade-in">
      
      {onSetActiveTab && (
        <button 
          onClick={() => onSetActiveTab("settings")}
          className="flex items-center gap-1.5 text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline cursor-pointer transition-all active:scale-95 w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Settings
        </button>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight font-display">Categories</h2>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
            Group your transactions with <span className="font-semibold text-zinc-700 dark:text-zinc-300">{categories.length} active tags</span>
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-violet-500/20 cursor-pointer transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Categories split sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Income Section */}
        <div className="space-y-3.5">
          <h3 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest pl-1 font-display">
            📈 Income Categories ({incomeCategories.length})
          </h3>
          <div className="bg-white dark:bg-zinc-900 border border-[#EEF2F7] dark:border-zinc-800/80 rounded-2xl p-5 space-y-2.5 shadow-sm hover:shadow-md transition-all duration-300">
            {!incomeCategories.length ? (
              <p className="text-center text-xs text-zinc-400 dark:text-zinc-500 py-8 font-medium">No income categories found.</p>
            ) : (
              incomeCategories.map((cat) => (
                <div
                  key={cat._id}
                  className="group flex items-center justify-between p-3 bg-zinc-50/50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200/40 dark:border-zinc-800/40 hover:border-zinc-300 dark:hover:border-zinc-750 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8.5 h-8.5 rounded-xl flex items-center justify-center text-white shadow-inner"
                      style={{ backgroundColor: cat.color }}
                    >
                      <Tag className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg cursor-pointer transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete category "${cat.name}"? Transactions using this category will be marked uncategorized.`)) {
                          onDeleteCategory(cat._id);
                        }
                      }}
                      className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 rounded-lg cursor-pointer transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Expense Section */}
        <div className="space-y-3.5">
          <h3 className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest pl-1 font-display">
            📉 Expense Categories ({expenseCategories.length})
          </h3>
          <div className="bg-white dark:bg-zinc-900 border border-[#EEF2F7] dark:border-zinc-800/80 rounded-2xl p-5 space-y-2.5 shadow-sm hover:shadow-md transition-all duration-300">
            {!expenseCategories.length ? (
              <p className="text-center text-xs text-zinc-400 dark:text-zinc-500 py-8 font-medium">No expense categories found.</p>
            ) : (
              expenseCategories.map((cat) => (
                <div
                  key={cat._id}
                  className="group flex items-center justify-between p-3 bg-zinc-50/50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200/40 dark:border-zinc-800/40 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8.5 h-8.5 rounded-xl flex items-center justify-center text-white shadow-inner"
                      style={{ backgroundColor: cat.color }}
                    >
                      <Tag className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg cursor-pointer transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete category "${cat.name}"? Transactions using this category will be marked uncategorized.`)) {
                          onDeleteCategory(cat._id);
                        }
                      }}
                      className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 rounded-lg cursor-pointer transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Category Edit/Create Form Overlay Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl animate-scale-up">
            <h3 className="text-lg font-black text-zinc-900 dark:text-white mb-4 tracking-tight font-display">
              {editCategory ? "Edit Category Tag" : "Add Category Tag"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Category Name */}
              <div>
                <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shopping, Coffee, Rent, Dividends"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 bg-zinc-50/50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-600 dark:focus:ring-violet-500 font-medium"
                />
              </div>

              {/* Type Grid selection */}
              <div>
                <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Category Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {["Expense", "Income"].map((catType) => (
                    <button
                      key={catType}
                      type="button"
                      onClick={() => setType(catType)}
                      className={`py-2.5 px-3 border rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                        type === catType
                          ? type === "Income"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400"
                            : "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400"
                          : "border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {catType === "Income" ? "📈 Income" : "📉 Expense"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Color Picker */}
              <div>
                <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Color Label</label>
                <div className="flex gap-3 flex-wrap">
                  {["#8B5CF6", "#10B981", "#059669", "#EF4444", "#F59E0B", "#EC4899", "#7C3AED", "#6366F1", "#3B82F6", "#06B6D4"].map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => setColor(hex)}
                      className={`w-7 h-7 rounded-full cursor-pointer transition-transform duration-200 border-2 ${
                        color === hex ? "scale-110 border-zinc-400 dark:border-zinc-300" : "border-transparent"
                      }`}
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-2xl text-sm font-semibold cursor-pointer transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-violet-600 hover:bg-violet-755 text-white rounded-2xl text-sm font-bold shadow-lg shadow-violet-500/25 cursor-pointer transition-all duration-200"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPanel;
