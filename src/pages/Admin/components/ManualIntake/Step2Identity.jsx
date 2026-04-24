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
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-[10px] font-black text-uni-400 uppercase tracking-widest italic">2. Identity & Attributes</p>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">Refine the item's identity and confirm the owner match.</p>
      </div>

      {/* Ownership Identification Section */}
      <div className="p-6 bg-white/[0.02] border border-white/10 rounded-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-uni-400 uppercase tracking-widest italic">Owner Identification</p>
            <p className="text-[11px] text-slate-500 font-medium leading-tight">Does this item contain an ID, name, or identifiable markings?</p>
          </div>
          <button 
            type="button"
            onClick={() => setIsIdentified(!isIdentified)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${isIdentified ? 'bg-uni-500 border-uni-400 text-white shadow-lg' : 'bg-white/5 border-white/10 text-slate-500 hover:text-white'}`}
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
              className="space-y-6 overflow-hidden"
            >
              <div className="pt-6 border-t border-white/5 space-y-6">
                {/* Member Search - Hidden if AI matched */}
                {!form.identified_user_id && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between ml-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Search Registry Member</label>
                      {isAnalysing && (
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-uni-400 rounded-full animate-ping" />
                          <span className="text-[9px] font-black text-uni-400 uppercase tracking-widest">AI Scanning...</span>
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isAnalysing ? 'text-uni-400' : 'text-slate-600'}`} size={16} />
                      <input 
                        type="text" 
                        placeholder={isAnalysing ? "AI is scanning for identity..." : "Search by Name or Student ID..."}
                        className={`w-full h-12 bg-black/40 border rounded-xl pl-12 pr-4 text-xs font-bold text-white transition-all outline-none ${isAnalysing ? 'border-uni-500/50 shadow-[0_0_15px_rgba(var(--uni-rgb),0.1)]' : 'border-white/5 focus:border-uni-500/50'}`}
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
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <div className="w-4 h-4 border-2 border-uni-500/30 border-t-uni-500 rounded-full animate-spin" />
                        </div>
                      )}
                    </div>

                    {/* Search Results */}
                    <AnimatePresence>
                      {memberResults.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-2 pt-2"
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
                              className="w-full p-3 bg-white/[0.03] hover:bg-uni-500/20 border border-white/5 rounded-xl flex items-center justify-between group transition-all"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-slate-500 group-hover:text-uni-400">
                                  <User size={14} />
                                </div>
                                <div className="text-left">
                                  <p className="text-[11px] font-bold text-white uppercase">{member.first_name} {member.last_name}</p>
                                  <p className="text-[9px] font-medium text-slate-500 tracking-wider">ID: {member.student_id_number}</p>
                                </div>
                              </div>
                              <Plus size={14} className="text-slate-700 group-hover:text-uni-400" />
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
                    className={`p-4 bg-uni-500/10 border border-uni-400/30 rounded-2xl flex items-center justify-between transition-all ${showPulse ? 'scale-105 shadow-[0_0_20px_rgba(var(--uni-rgb),0.2)]' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center text-uni-400 border border-uni-400/20">
                        <UserCheck size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-black text-white uppercase tracking-tight">{form.identified_name}</p>
                          <span className={`px-2 py-0.5 ${form.identified_user_id ? 'bg-uni-500' : 'bg-slate-700'} text-[8px] font-black text-white rounded-full uppercase tracking-widest flex items-center gap-1`}>
                            {form.identified_user_id ? <Sparkles size={8} /> : <Search size={8} />}
                            {form.identified_user_id ? 'Registry Matched' : 'AI Extracted'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Member ID: {form.identified_id_number}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setForm({...form, identified_name: '', identified_id_number: '', identified_user_id: null})}
                      className="p-2 hover:bg-white/5 rounded-lg text-slate-600 hover:text-white transition-all"
                    >
                      <X size={16} />
                    </button>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Identified Name</label>
                      <div className="relative">
                        <UserCheck className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isAnalysing ? 'text-uni-400 animate-pulse' : 'text-slate-600'}`} size={14} />
                        <input 
                          type="text" 
                          placeholder={isAnalysing ? "Scanning..." : "Owner's full name..."}
                          className={`w-full h-12 bg-black/40 border rounded-xl pl-10 pr-4 text-xs font-bold text-white transition-all outline-none ${isAnalysing ? 'border-uni-500/30' : 'border-white/5 focus:border-uni-500/50'}`}
                          value={form.identified_name}
                          disabled={isAnalysing}
                          onChange={e => setForm({...form, identified_name: e.target.value, identified_user_id: null})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Student / Staff ID</label>
                      <div className="relative">
                        <CreditCard className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isAnalysing ? 'text-uni-400 animate-pulse' : 'text-slate-600'}`} size={14} />
                        <input 
                          type="text" 
                          placeholder={isAnalysing ? "Reading ID..." : "Official ID number..."}
                          className={`w-full h-12 bg-black/40 border rounded-xl pl-10 pr-4 text-xs font-bold text-white transition-all outline-none ${isAnalysing ? 'border-uni-500/30' : 'border-white/5 focus:border-uni-500/50'}`}
                          value={form.identified_id_number}
                          disabled={isAnalysing}
                          onChange={e => setForm({...form, identified_id_number: e.target.value, identified_user_id: null})}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {form.identified_user_id && (
                  <div className="p-4 bg-uni-500/10 border border-uni-500/20 rounded-2xl flex items-center gap-3">
                    <ShieldCheck className="text-uni-400" size={18} />
                    <p className="text-[10px] text-uni-200 font-bold uppercase tracking-widest">Linked to Active Account &bull; Notification will be sent</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2 relative group">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
              Headline / Label
              {aiDraft?.suggested_title && form.title === aiDraft.suggested_title && (
                <span className="flex items-center gap-1 text-[8px] text-uni-400 animate-pulse">
                  <Sparkles size={8} /> AI-Suggested
                </span>
              )}
            </label>
            <input 
              type="text" 
              placeholder="e.g. Red Nike Sports Bag"
              className={`w-full h-12 bg-white/[0.03] border rounded-xl px-4 text-sm font-bold text-white placeholder:text-slate-700 focus:border-uni-500/50 outline-none transition-all ${aiDraft?.suggested_title && form.title === aiDraft.suggested_title ? 'border-uni-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'border-white/5'}`}
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Category</label>
            <select 
              className={`w-full h-12 bg-white/[0.03] border rounded-xl px-4 text-xs font-bold text-white focus:border-uni-500/50 outline-none appearance-none cursor-pointer [&>option]:text-slate-900 ${aiDraft?.category && form.category === aiDraft.category ? 'border-uni-500/30' : 'border-white/5'}`}
              value={form.category}
              onChange={e => setForm({...form, category: e.target.value})}
            >
              {Object.keys(ITEM_ATTRIBUTES).map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Brand (Optional)</label>
            <input 
              type="text" 
              placeholder="e.g. Nike, Apple, Camelbak"
              className={`w-full h-12 bg-white/[0.03] border rounded-xl px-4 text-xs font-bold text-white placeholder:text-slate-700 focus:border-uni-500/50 outline-none transition-all ${aiDraft?.brand && form.attributes.brand === aiDraft.brand ? 'border-uni-500/30' : 'border-white/5'}`}
              value={form.attributes.brand}
              onChange={e => setForm({...form, attributes: {...form.attributes, brand: e.target.value}})}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Color</label>
            <input 
              type="text" 
              placeholder="Primary color..."
              className="w-full h-12 bg-white/[0.03] border border-white/5 rounded-xl px-4 text-xs font-bold text-white focus:border-uni-500/50 outline-none"
              value={form.attributes.color}
              onChange={e => setForm({...form, attributes: {...form.attributes, color: e.target.value}})}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Model / Material</label>
            <input 
              type="text" 
              placeholder="e.g. iPhone 13 Pro / Leather"
              className={`w-full h-12 bg-white/[0.03] border rounded-xl px-4 text-xs font-bold text-white focus:border-uni-500/50 outline-none ${aiDraft?.model && form.attributes.model === aiDraft.model ? 'border-uni-500/30' : 'border-white/5'}`}
              value={form.attributes.model}
              onChange={e => setForm({...form, attributes: {...form.attributes, model: e.target.value}})}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Narrative Description</label>
          <textarea 
            placeholder="Detailed physical description for forensic matching..."
            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-xs font-medium text-white placeholder:text-slate-700 focus:border-uni-500/50 outline-none min-h-[100px] transition-all resize-none"
            value={form.description}
            onChange={e => setForm({...form, description: e.target.value})}
          />
        </div>
      </div>
    </div>
  );
};

export default Step2Identity;
