import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';

// Shared Flow Components
import ReportStepHeader from '../../components/ReportFlow/ReportStepHeader';
import CategorySelection from '../../components/ReportFlow/CategorySelection';
import ImageStep from '../../components/ReportFlow/ImageStep';
import DetailsStep from '../../components/ReportFlow/DetailsStep';
import SimpleInputStep from '../../components/ReportFlow/SimpleInputStep';
import DateTimeStep from '../../components/ReportFlow/DateTimeStep';

const ReportLostItem = () => {
  const [formData, setFormData] = useState({
    item_name: '',
    description: '',
    location_zone: '',
    last_seen_time: new Date().toISOString().slice(0, 16),
    category: '',
    safe_photo_url: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const totalSteps = 6;
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [categoryStats, setCategoryStats] = useState([]);
  const [otherItemName, setOtherItemName] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const resp = await apiClient.get('/categories/stats');
        setCategoryStats(resp.data);
      } catch (err) {
        console.error("Failed to fetch cluster stats", err);
      }
    };
    fetchStats();
  }, []);

  const goToStep = (target) => setStep(target);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const finalData = { ...formData };
      if (formData.category === 'Other') {
        finalData.item_name = otherItemName;
      } else {
        finalData.item_name = formData.category;
      }

      await apiClient.post('/lost/report', finalData);
      navigate('/student');
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.98, y: 30 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, scale: 1.02, y: -30, transition: { duration: 0.3 } }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-10 min-h-[90vh] flex flex-col px-4">
      <ReportStepHeader 
        title="Report Lost Item"
        label="Lost Item Report"
        step={step}
        totalSteps={totalSteps}
        error={error}
        icon="fa-file-circle-question"
      />

      <div className="flex-grow flex flex-col relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex-grow flex flex-col"
          >
            {step === 1 && (
              <ImageStep 
                stepLabel="Step 1: Visual Reference"
                title="Do you have a photo of the item?"
                description="A photo helps us identify your item faster. You can use a real photo or a reference image."
                value={formData.safe_photo_url}
                onUpload={(url) => setFormData({...formData, safe_photo_url: url})}
                onNext={() => goToStep(2)}
              />
            )}

            {step === 2 && (
              <CategorySelection 
                formData={formData}
                setFormData={setFormData}
                categoryStats={categoryStats}
                otherItemName={otherItemName}
                setOtherItemName={setOtherItemName}
                onNext={() => goToStep(3)}
              />
            )}

            {step === 3 && (
              <SimpleInputStep 
                stepLabel="Step 3: Location"
                title="Where was it last seen?"
                description="Please provide the specific building or area."
                placeholder="e.g. Science Library, 2nd Floor"
                icon="fa-location-crosshairs"
                value={formData.location_zone}
                onChange={(val) => setFormData({...formData, location_zone: val})}
                onNext={() => goToStep(4)}
              />
            )}

            {step === 4 && (
              <DateTimeStep 
                stepLabel="Step 4: Approximate Time"
                title="When did it go missing?"
                description="Select the date and time you last saw your item."
                value={formData.last_seen_time}
                onChange={(val) => setFormData({...formData, last_seen_time: val})}
                onNext={() => goToStep(5)}
              />
            )}

            {step === 5 && (
              <DetailsStep 
                stepLabel="Step 5: Item Details"
                title="Item Description"
                description="Briefly describe the item's appearance, brand, or other details."
                placeholder="e.g. Blue case with a small scratch on the bottom right corner..."
                value={formData.description}
                onChange={(val) => setFormData({...formData, description: val})}
                onNext={() => goToStep(6)}
              />
            )}

            {step === 6 && (
              <div className="space-y-12 dy-10 flex-grow flex flex-col justify-center text-center">
                <div className="space-y-4">
                   <div className="w-24 h-24 bg-uni-500/10 rounded-full flex items-center justify-center mx-auto border border-uni-500/20 text-4xl mb-6 shadow-2xl">📡</div>
                   <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none italic">"Ready to submit<br/>your report?"</h2>
                   <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-10">Check your details before posting to the public registry.</p>
                </div>
                
                <div className="max-w-4xl mx-auto w-full space-y-10 text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="p-10 glass-panel rounded-[3rem] border border-white/5 text-left space-y-8 shadow-2xl flex flex-col justify-center h-full">
                         <div className="flex justify-between items-start">
                            <div className="space-y-1">
                               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic leading-none mb-1">Item Details</p>
                               <p className="text-xl font-black text-white uppercase tracking-tight italic">{formData.category === 'Other' ? otherItemName : formData.category}</p>
                            </div>
                            {formData.safe_photo_url && (
                                <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 shadow-xl">
                                    <img src={formData.safe_photo_url} className="w-full h-full object-cover" alt="Preview" />
                                </div>
                            )}
                         </div>
                         <div className="space-y-1 border-t border-white/5 pt-8">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic leading-none mb-1">Last Seen At</p>
                            <p className="text-xl font-black text-white uppercase tracking-tight">{formData.location_zone}</p>
                         </div>
                      </div>

                      <div className="space-y-6">
                         <div className="p-10 bg-white/5 rounded-[3rem] border border-white/5 text-left space-y-4 shadow-2xl">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Registry Status</p>
                            <div className="flex items-center gap-4">
                               <div className="w-3 h-3 rounded-full bg-uni-400 animate-pulse"></div>
                               <p className="text-sm font-black text-uni-400 uppercase tracking-widest">Logged in as {user?.full_name}</p>
                            </div>
                            <div className="pt-6 border-t border-white/5">
                               <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest italic block mb-1">Impact</p>
                               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">We'll notify you as soon as a potential match is found by the USG.</p>
                            </div>
                         </div>

                         <button 
                          onClick={handleSubmit} 
                          disabled={loading}
                          className="w-full bg-white text-black py-8 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.6em] shadow-[0_20px_60px_rgba(255,255,255,0.1)] hover:bg-uni-400 hover:text-white transition-all group flex items-center justify-center gap-6"
                        >
                          {loading ? (
                            <div className="flex items-center gap-4">
                              <div className="w-6 h-6 border-[3px] border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                              Processing...
                            </div>
                          ) : (
                            <>
                               <i className="fa-solid fa-paper-plane text-2xl group-hover:rotate-12 transition-transform"></i>
                               Submit Report
                            </>
                          )}
                        </button>
                      </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {!loading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-10"
        >
          {step > 1 ? (
            <button 
              onClick={prevStep}
              className="px-8 py-3 rounded-xl bg-white/5 text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-all flex items-center gap-4 group"
            >
              <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
              Previous Step
            </button>
          ) : (
             <Link to="/student" className="px-8 py-3 rounded-xl bg-red-500/5 text-red-500/40 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-all">
                Cancel
             </Link>
          )}
          
          <div className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em] flex items-center gap-3 italic text-center md:text-right">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-800"></span>
            University Lost & Found Registry
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ReportLostItem;
