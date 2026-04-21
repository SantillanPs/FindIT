import React, { useState } from 'react';
import { useMasterData } from '../../../context/MasterDataContext';
import { 
  Plus, 
  Trash2, 
  ChevronRight, 
  ChevronDown, 
  Database, 
  Search,
  AlertCircle
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const TaxonomyTab = ({ mutation }) => {
  const { categories, itemTypes, loading } = useMasterData();
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [newTypeName, setNewTypeName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-8 h-8 border-2 border-white/5 border-t-uni-500 rounded-full animate-spin"></div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Loading...</p>
      </div>
    );
  }

  const filteredCategories = categories.filter(cat => 
    cat.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    itemTypes.some(t => t.category_id === cat.id && t.label.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddType = async (categoryId) => {
    if (!newTypeName.trim()) return;
    try {
      await mutation.mutateAsync({
        action: 'add_type',
        data: {
          category_id: categoryId,
          label: newTypeName.trim(),
          is_active: true
        }
      });
      setNewTypeName('');
      setIsAdding(false);
    } catch (err) {
      console.error('Failed to add type:', err);
    }
  };

  const handleDeleteType = async (typeId) => {
    if (!window.confirm('Are you sure you want to remove this type? This will immediately disable it as a classification option.')) return;
    try {
      await mutation.mutateAsync({
        action: 'delete_type',
        data: { id: typeId }
      });
    } catch (err) {
      console.error('Failed to delete type:', err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header & Stats Strip */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <div className="flex items-center gap-3 text-slate-500 mb-1">
              <Database size={16} />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Categories</h3>
           </div>
           <h2 className="text-3xl font-black text-white tracking-tight uppercase italic">Categories</h2>
           <p className="text-sm font-medium text-slate-500 mt-2 max-w-xl">
              Manage the list of categories used for organizing and matching items.
           </p>
        </div>

        <div className="relative w-full md:w-80">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
           <input 
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 bg-white/[0.03] border border-white/5 rounded-2xl pl-12 pr-4 text-xs font-bold text-white focus:border-uni-500/50 outline-none transition-all shadow-inner"
           />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCategories.map(category => {
          const isExpanded = expandedCategory === category.id;
          const types = itemTypes.filter(t => t.category_id === category.id);
          
          return (
            <div 
              key={category.id} 
              className={`glass-panel rounded-[2rem] border transition-all duration-500 overflow-hidden ${isExpanded ? 'border-uni-500/30 ring-1 ring-uni-500/10' : 'border-white/5 hover:border-white/10'}`}
            >
              <div 
                className="p-6 md:p-8 flex items-center justify-between cursor-pointer group"
                onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
              >
                <div className="flex items-center gap-6">
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl transition-all ${isExpanded ? 'bg-uni-600 text-white shadow-lg' : 'bg-white/5 text-slate-500 group-hover:text-uni-400'}`}>
                      <i className={`fa-solid ${category.icon || 'fa-folder-tree'}`}></i>
                   </div>
                   <div className="text-left">
                      <h4 className="text-lg font-black text-white uppercase tracking-tight">{category.label}</h4>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                        {types.length} types inside
                      </p>
                   </div>
                </div>
                <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                   {isExpanded ? <ChevronDown size={20} className="text-uni-400" /> : <ChevronRight size={20} className="text-slate-700" />}
                </div>
              </div>

              {isExpanded && (
                <div className="px-6 pb-8 md:px-8 bg-black/20 border-t border-white/5 animate-in slide-in-from-top-4 duration-500">
                   <div className="pt-6 space-y-4">
                      {/* Active Types List */}
                      <div className="flex flex-wrap gap-2">
                        {types.map(type => (
                          <div 
                            key={type.id} 
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex items-center gap-3 group/item hover:bg-white/[0.08] transition-all"
                          >
                            <span className="text-[11px] font-black text-white uppercase tracking-widest">{type.label}</span>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleDeleteType(type.id); }}
                              className="opacity-0 group-hover/item:opacity-100 text-rose-500 hover:text-rose-400 transition-all"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add New Type Action */}
                      <div className="pt-4 mt-6 border-t border-white/5">
                        {isAdding === category.id ? (
                           <div className="flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200">
                              <input 
                                autoFocus
                                type="text"
                                placeholder="Type name (e.g. Mechanical Watch)"
                                value={newTypeName}
                                onChange={(e) => setNewTypeName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddType(category.id)}
                                className="flex-grow h-11 bg-white/[0.03] border border-uni-500/30 rounded-xl px-4 text-xs font-bold text-white outline-none focus:ring-1 ring-uni-500/20"
                              />
                              <Button 
                                onClick={() => handleAddType(category.id)}
                                className="bg-uni-600 hover:bg-uni-500 text-white h-11 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest"
                              >
                                Add
                              </Button>
                              <Button 
                                variant="ghost" 
                                onClick={() => setIsAdding(false)}
                                className="h-11 px-4 rounded-xl text-slate-500 hover:text-white uppercase text-[8px] font-black"
                              >
                                Cancel
                              </Button>
                           </div>
                        ) : (
                           <button 
                              onClick={() => setIsAdding(category.id)}
                              className="flex items-center gap-3 text-slate-500 hover:text-uni-400 transition-all group"
                           >
                              <div className="w-8 h-8 rounded-lg border border-dashed border-slate-700 flex items-center justify-center group-hover:border-uni-500 group-hover:bg-uni-500/10">
                                 <Plus size={14} />
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-widest italic">Add new type</span>
                           </button>
                        )}
                      </div>
                   </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Safety Notice */}
      <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-6">
         <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
            <AlertCircle size={24} />
         </div>
         <div className="text-left">
            <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Important Note on Categories</h4>
            <p className="text-[11px] font-medium text-slate-400 leading-relaxed">
               Changing or removing types affects how items are organized. Items already in the list will stay there, but they might lose some details in filters. Correct categories make it much easier to find matches.
            </p>
         </div>
      </div>
    </div>
  );
};

export default TaxonomyTab;
