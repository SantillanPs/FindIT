import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const IdentificationStep = ({ 
  formData, 
  setFormData, 
  hasIdentification, 
  setHasIdentification 
}) => {
  return (
    <div className="space-y-6">
      {!hasIdentification ? (
        <button 
          type="button"
          onClick={() => setHasIdentification(true)}
          className="w-full p-6 bg-white/5 border border-dashed border-white/20 rounded-3xl text-[10px] font-black text-slate-400 hover:text-white hover:bg-white/10 transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-4"
        >
          <i className="fa-solid fa-id-card text-lg text-uni-400"></i>
          Found a name or Student ID on the item?
        </button>
      ) : (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-white/5 rounded-[3rem] border border-uni-500/30 relative text-left"
        >
          <button 
            onClick={() => {
              setHasIdentification(false);
              setFormData({...formData, identified_student_id: '', identified_name: ''});
            }}
            className="absolute -top-3 -right-3 w-8 h-8 bg-slate-900 border border-white/10 rounded-full flex items-center justify-center text-slate-500 hover:text-white z-10"
          >
            <i className="fa-solid fa-xmark text-[10px]"></i>
          </button>

          <div className="space-y-2 p-4">
             <label 
              htmlFor="identified-student-id"
              className="text-[9px] font-black text-slate-600 uppercase tracking-widest block ml-2"
             >
                Student ID Found?
             </label>
            <input 
              id="identified-student-id"
              name="identified-student-id"
              type="text"
              placeholder="e.g. 2021-10042"
              className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-sm font-black text-white focus:border-uni-500 transition-all outline-none"
              value={formData.identified_student_id}
              onChange={(e) => setFormData({...formData, identified_student_id: e.target.value})}
            />
          </div>
          <div className="space-y-2 p-4">
             <label 
              htmlFor="identified-name"
              className="text-[9px] font-black text-slate-600 uppercase tracking-widest block ml-2"
             >
                Name on Item?
             </label>
            <input 
              id="identified-name"
              name="identified-name"
              type="text"
              placeholder="e.g. Juan Cruz"
              className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-sm font-black text-white focus:border-uni-500 transition-all outline-none"
              value={formData.identified_name}
              onChange={(e) => setFormData({...formData, identified_name: e.target.value})}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default IdentificationStep;
