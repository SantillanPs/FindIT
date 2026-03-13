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
import ZoneSelectorStep from '../../components/ReportFlow/ZoneSelectorStep';
import IdentificationStep from '../../components/ReportFlow/IdentificationStep';

const ReportFoundItem = () => {
  const [formData, setFormData] = useState({
    item_name: '',
    description: '',
    location_zone: '',
    zone_id: null,
    found_time: new Date().toISOString().slice(0, 16),
    safe_photo_url: '',
    identified_student_id: '',
    identified_name: '',
    category: '',
    contact_info: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const totalSteps = 6;
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [categoryStats, setCategoryStats] = useState([]);
  const [otherItemName, setOtherItemName] = useState('');
  const [hasIdentification, setHasIdentification] = useState(false);

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

      await apiClient.post('/found/report', finalData);
      navigate('/student');
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, y: -30, transition: { duration: 0.3 } }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-10 min-h-[90vh] flex flex-col px-4">
      <ReportStepHeader 
        title="Report Found Item"
        label="Found Item Report"
        step={step}
        totalSteps={totalSteps}
        error={error}
        icon="fa-hand-holding-heart"
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
                stepLabel="Step 1: Upload Photo"
                title="First, upload a photo of the item."
                description="Please upload an actual photo of the item you found."
                value={formData.safe_photo_url}
                onUpload={(url) => {
                  setFormData({...formData, safe_photo_url: url});
                  setTimeout(() => goToStep(2), 800);
                }}
                onNext={() => goToStep(2)}
                optional={false}
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
              <ZoneSelectorStep
                stepLabel="Step 3: Location"
                title="Where was the item found?"
                description="Please select the specific building or area."
                formData={formData}
                setFormData={setFormData}
                onNext={() => goToStep(4)}
              />
            )}

            {step === 4 && (
              <DateTimeStep 
                stepLabel="Step 4: Date & Time"
                title="When was it found?"
                description="Select the approximate date and time."
                value={formData.found_time}
                onChange={(val) => setFormData({...formData, found_time: val})}
                onNext={() => goToStep(5)}
              />
            )}

            {step === 5 && (
              <DetailsStep 
                stepLabel="Step 5: Item Details"
                title="Item Description"
                description="Briefly describe the item's appearance, brand, or other details to help us identify it."
                placeholder="e.g. Red backpack, iPhone 13 with a clear case..."
                value={formData.description}
                onChange={(val) => setFormData({...formData, description: val})}
                onNext={() => goToStep(6)}
              >
                <div className="space-y-6 pt-6 mt-6 border-t border-white/5">
                   <div className="relative group text-left">
                       <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-4 italic text-uni-400">How can we contact you? (Optional)</label>
                       <textarea 
                        placeholder="e.g. FB: juan.cruz.12 / Phone: 09123456789"
                        className="w-full bg-white/5 border-2 border-white/10 rounded-[2rem] p-6 text-lg font-bold text-white focus:border-uni-500 focus:bg-white/10 transition-all outline-none placeholder:text-slate-700 shadow-xl min-h-[100px] resize-none"
                        value={formData.contact_info}
                        onChange={(e) => setFormData({...formData, contact_info: e.target.value})}
                      />
                   </div>
                   <IdentificationStep 
                      formData={formData}
                      setFormData={setFormData}
                      hasIdentification={hasIdentification}
                      setHasIdentification={setHasIdentification}
                    />
                </div>
              </DetailsStep>
            )}

            {step === 6 && (
              <div className="space-y-12 dy-10 flex-grow flex flex-col justify-center text-center">
                <div className="space-y-4">
                   <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20 text-4xl mb-6 shadow-2xl">🌍</div>
                   <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none italic">"Ready to submit<br/>your report?"</h2>
                   <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-10">Check your details before posting to the public feed.</p>
                </div>
                
                <div className="max-w-4xl mx-auto w-full space-y-10 text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                      <div className="aspect-square bg-white/5 rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl relative group">
                         <img src={formData.safe_photo_url} alt="Found item" className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                         <div className="absolute bottom-6 left-6 right-6 text-left">
                            <p className="text-[10px] font-black text-uni-400 uppercase tracking-widest italic mb-1 text-shadow">Item Details</p>
                            <p className="text-lg font-black text-white uppercase tracking-tight italic text-shadow">{formData.category === 'Other' ? otherItemName : formData.category}</p>
                         </div>
                      </div>

                      <div className="space-y-6">
                         <div className="p-8 glass-panel rounded-[2.5rem] border border-white/5 text-left space-y-6 shadow-2xl">
                            <div className="space-y-1">
                               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic block mb-1">Found at</p>
                               <p className="text-lg font-black text-white uppercase tracking-tight leading-none">{formData.location_zone}</p>
                            </div>
                            <div className="space-y-1 border-t border-white/5 pt-6">
                               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic block mb-1">Impact</p>
                               <p className="text-xs font-black text-white uppercase tracking-[0.2em]">{user?.full_name}</p>
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

export default ReportFoundItem;
