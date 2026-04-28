import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, UserCheck, Search, Plus, X, CreditCard, User, ShieldCheck } from 'lucide-react';
import { supabase } from '../../../../lib/supabase';
import { ITEM_ATTRIBUTES } from '../../../../constants/attributes';

const Step2Identity = ({ 
  form, 
  setForm, 
  isIdentified, 
  setIsIdentified, 
  memberSearchQuery, 
  setMemberSearchQuery, 
  memberResults, 
  setMemberResults, 
  isSearching, 
  isAnalysing, 
  aiDraft,
  showPulse,
  setShowPulse
}) => {
  return (
    <div className="space-y-5">
      {/* Ownership Identification Section */}
      <div className="p-4 bg-white/[0.02] border border-white/10 rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-uni-400 uppercase tracking-wider">Owner Identification</p>
            <p className="text-[10px] text-slate-500 font-medium leading-tight">Identifiable markings on this item?</p>
          </div>
          <button 
            type="button"
            onClick={() => setIsIdentified(!isIdentified)}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all border ${isIdentified ? 'bg-uni-500 border-uni-400 text-white shadow-md' : 'bg-white/5 border-white/10 text-slate-500 hover:text-white'}`}
          >
            {isIdentified ? 'Identified' : 'Unknown'}
          </button>
        </div>

        <AnimatePresence>
          {isIdentified && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 overflow-hidden"
            >
              <div className="pt-4 border-t border-white/5 space-y-4">
                {/* Member Search - Hidden if AI matched */}
                {!form.identified_user_id && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between ml-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Search Member</label>
                      {isAnalysing && (
                        <div className="flex items-center gap-1.5">
                          <div className="w-1 h-1 bg-uni-400 rounded-full animate-ping" />
                          <span className="text-[8px] font-bold text-uni-400 uppercase tracking-wider">Scanning...</span>
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <Search className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isAnalysing ? 'text-uni-400' : 'text-slate-600'}`} size={14} />
                      <input 
                        type="text" 
                        placeholder={isAnalysing ? "AI scanning..." : "Name or Student ID..."}
                        className={`w-full h-10 bg-black/40 border rounded-lg pl-9 pr-4 text-xs font-medium text-white transition-all outline-none ${isAnalysing ? 'border-uni-500/50' : 'border-white/5 focus:border-uni-500/50'}`}
                        value={memberSearchQuery}
                        disabled={isAnalysing}
                        onChange={async (e) => {
                          setMemberSearchQuery(e.target.value);
                          if (e.target.value.length > 2) {
                            const { data } = await supabase
                              .from('user_profiles_v1')
                              .select('id, first_name, last_name, student_id_number, email')
                              .or(`first_name.ilike.%${e.target.value}%,last_name.ilike.%${e.target.value}%,student_id_number.ilike.%${e.target.value}%`)
                              .limit(5);
                            setMemberResults(data || []);
                          } else {
                            setMemberResults([]);
                          }
                        }}
                      />
                      {(isSearching || isAnalysing) && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="w-3.5 h-3.5 border-2 border-uni-500/30 border-t-uni-500 rounded-full animate-spin" />
                        </div>
                      )}
                    </div>

                    {/* Search Results */}
                    <AnimatePresence>
                      {memberResults.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-1.5"
                        >
                          {memberResults.map(member => (
                            <button
                              key={member.id}
                              type="button"
                              onClick={() => {
                                setForm({
                                  ...form,
                                  identified_name: `${member.first_name} ${member.last_name}`,
                                  identified_id_number: member.student_id_number,
                                  identified_user_id: member.id
                                });
                                setMemberResults([]);
                                setMemberSearchQuery('');
                                setShowPulse(true);
                              }}
                              className="w-full p-2.5 bg-white/[0.03] hover:bg-uni-500/20 border border-white/5 rounded-lg flex items-center justify-between group transition-all"
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-md bg-black flex items-center justify-center text-slate-500 group-hover:text-uni-400">
                                  <User size={12} />
                                </div>
                                <div className="text-left">
                                  <p className="text-[10px] font-bold text-white uppercase">{member.first_name} {member.last_name}</p>
                                  <p className="text-[8px] font-medium text-slate-500 tracking-wider">ID: {member.student_id_number}</p>
                                </div>
                              </div>
                              <Plus size={12} className="text-slate-700 group-hover:text-uni-400" />
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {form.identified_user_id ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-3 bg-uni-500/10 border border-uni-400/30 rounded-xl flex items-center justify-between transition-all ${showPulse ? 'shadow-[0_0_15px_rgba(var(--uni-rgb),0.2)]' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-black flex items-center justify-center text-uni-400 border border-uni-400/20">
                        <UserCheck size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-[11px] font-bold text-white uppercase tracking-tight">{form.identified_name}</p>
                          <span className={`px-1.5 py-px ${form.identified_user_id ? 'bg-uni-500' : 'bg-slate-700'} text-[7px] font-bold text-white rounded-full uppercase tracking-wider flex items-center gap-0.5`}>
                            {form.identified_user_id ? <Sparkles size={7} /> : <Search size={7} />}
                            {form.identified_user_id ? 'Matched' : 'AI'}
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-500 font-medium tracking-wider uppercase">ID: {form.identified_id_number}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setForm({...form, identified_name: '', identified_id_number: '', identified_user_id: null})}
                      className="p-1.5 hover:bg-white/5 rounded-md text-slate-600 hover:text-white transition-all"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Name</label>
                      <div className="relative">
                        <UserCheck className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isAnalysing ? 'text-uni-400 animate-pulse' : 'text-slate-600'}`} size={12} />
                        <input 
                          type="text" 
                          placeholder={isAnalysing ? "Scanning..." : "Full name..."}
                          className={`w-full h-10 bg-black/40 border rounded-lg pl-8 pr-3 text-xs font-medium text-white transition-all outline-none ${isAnalysing ? 'border-uni-500/30' : 'border-white/5 focus:border-uni-500/50'}`}
                          value={form.identified_name}
                          disabled={isAnalysing}
                          onChange={e => setForm({...form, identified_name: e.target.value, identified_user_id: null})}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">ID Number</label>
                      <div className="relative">
                        <CreditCard className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isAnalysing ? 'text-uni-400 animate-pulse' : 'text-slate-600'}`} size={12} />
                        <input 
                          type="text" 
                          placeholder={isAnalysing ? "Reading..." : "ID number..."}
                          className={`w-full h-10 bg-black/40 border rounded-lg pl-8 pr-3 text-xs font-medium text-white transition-all outline-none ${isAnalysing ? 'border-uni-500/30' : 'border-white/5 focus:border-uni-500/50'}`}
                          value={form.identified_id_number}
                          disabled={isAnalysing}
                          onChange={e => setForm({...form, identified_id_number: e.target.value, identified_user_id: null})}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {form.identified_user_id && (
                  <div className="p-3 bg-uni-500/10 border border-uni-500/20 rounded-xl flex items-center gap-2">
                    <ShieldCheck className="text-uni-400" size={14} />
                    <p className="text-[9px] text-uni-200 font-medium uppercase tracking-wider">Linked to account &bull; Notification will be sent</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1.5">
              Title
              {aiDraft?.suggested_title && form.title === aiDraft.suggested_title && (
                <span className="flex items-center gap-0.5 text-[8px] text-uni-400 animate-pulse">
                  <Sparkles size={7} /> AI
                </span>
              )}
            </label>
            <input 
              type="text" 
              placeholder="e.g. Red Nike Sports Bag"
              className={`w-full h-10 bg-white/[0.03] border rounded-lg px-3 text-sm font-medium text-white placeholder:text-slate-700 focus:border-uni-500/50 outline-none transition-all ${aiDraft?.suggested_title && form.title === aiDraft.suggested_title ? 'border-uni-500/30' : 'border-white/5'}`}
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Category</label>
              <select 
                className={`w-full h-10 bg-white/[0.03] border rounded-lg px-3 text-xs font-medium text-white focus:border-uni-500/50 outline-none appearance-none cursor-pointer [&>option]:text-slate-900 ${aiDraft?.category && form.category === aiDraft.category ? 'border-uni-500/30' : 'border-white/5'}`}
                value={form.category}
                onChange={e => setForm({...form, category: e.target.value})}
              >
                {Object.keys(ITEM_ATTRIBUTES).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Brand</label>
              <input 
                type="text" 
                placeholder="e.g. Nike, Apple"
                className={`w-full h-10 bg-white/[0.03] border rounded-lg px-3 text-xs font-medium text-white placeholder:text-slate-700 focus:border-uni-500/50 outline-none transition-all ${aiDraft?.brand && form.attributes.brand === aiDraft.brand ? 'border-uni-500/30' : 'border-white/5'}`}
                value={form.attributes.brand}
                onChange={e => setForm({...form, attributes: {...form.attributes, brand: e.target.value}})}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Color</label>
            <input 
              type="text" 
              placeholder="Primary color..."
              className="w-full h-10 bg-white/[0.03] border border-white/5 rounded-lg px-3 text-xs font-medium text-white focus:border-uni-500/50 outline-none"
              value={form.attributes.color}
              onChange={e => setForm({...form, attributes: {...form.attributes, color: e.target.value}})}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Model</label>
            <input 
              type="text" 
              placeholder="e.g. iPhone 13"
              className={`w-full h-10 bg-white/[0.03] border rounded-lg px-3 text-xs font-medium text-white focus:border-uni-500/50 outline-none ${aiDraft?.model && form.attributes.model === aiDraft.model ? 'border-uni-500/30' : 'border-white/5'}`}
              value={form.attributes.model}
              onChange={e => setForm({...form, attributes: {...form.attributes, model: e.target.value}})}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Description</label>
          <textarea 
            placeholder="Physical description for matching..."
            className="w-full bg-white/[0.03] border border-white/5 rounded-xl p-3 text-xs font-medium text-white placeholder:text-slate-700 focus:border-uni-500/50 outline-none min-h-[72px] transition-all resize-none"
            value={form.description}
            onChange={e => setForm({...form, description: e.target.value})}
          />
        </div>
      </div>
    </div>
  );
};

export default Step2Identity;
