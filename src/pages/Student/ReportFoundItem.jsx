import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
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
import GuestInfoStep from '../../components/ReportFlow/GuestInfoStep';
import ReportSummary from '../../components/ReportFlow/ReportSummary';

const ReportFoundItem = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    zone_id: null,
    date_found: new Date().toISOString().slice(0, 16),
    photo_url: '',
    identified_student_id: '',
    identified_name: '',
    category: '',
    guest_first_name: '',
    guest_last_name: '',
    guest_email: '',
    contact_info: '',
    attributes: {}
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const totalSteps = 7;
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [categoryStats, setCategoryStats] = useState([]);
  const [otherItemName, setOtherItemName] = useState('');
  const [hasIdentification, setHasIdentification] = useState(false);
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get('match');
  const [matchedReport, setMatchedReport] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data, error } = await supabase
          .from('found_items')
          .select('category');
        
        if (error) throw error;
        
        const statsMap = (data || []).reduce((acc, item) => {
          acc[item.category] = (acc[item.category] || 0) + 1;
          return acc;
        }, {});

        const formattedStats = Object.keys(statsMap).map(cat => ({
          category: cat,
          count: statsMap[cat]
        }));

        setCategoryStats(formattedStats);
      } catch (err) {
        console.error("Failed to fetch statistics from Supabase", err);
      }
    };
    fetchStats();

    // Pre-fill contact info if user is logged in
    if (user) {
      setFormData(prev => ({
        ...prev,
        guest_first_name: user.first_name || '',
        guest_last_name: user.last_name || '',
        guest_email: user.email || ''
      }));
    }

    const fetchMatchedReport = async () => {
      if (matchId) {
        try {
          const { data, error } = await supabase
            .from('lost_items')
            .select('*')
            .eq('id', matchId)
            .single();
          
          if (error) throw error;
          
          setMatchedReport(data);
          setFormData(prev => ({
            ...prev,
            category: data.category,
            matched_lost_id: parseInt(matchId)
          }));
        } catch (err) {
          console.error("Failed to fetch matched report from Supabase", err);
        }
      }
    };
    fetchMatchedReport();
  }, [user, matchId]);

  const goToStep = (target) => setStep(target);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const finalData = { ...formData };
      if (formData.category === 'Other') {
        finalData.title = otherItemName;
      } else {
        finalData.title = formData.category;
      }

      const reportPayload = {
        title: formData.title || formData.category,
        description: formData.description || `Student Found ${formData.category}`,
        category: formData.category,
        location: formData.location,
        date_found: formData.date_found,
        photo_url: formData.photo_url,
        photo_thumbnail_url: formData.photo_url,
        finder_id: user?.id || null,
        status: 'reported',
        is_verified: true,
        registry_signal: { ...formData, reporter_type: 'student' }
      };

      const { error } = await supabase.rpc('submit_found_item_v2', { 
        registry_signal: reportPayload 
      });

      if (error) throw error;

      navigate('/student');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
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
                value={formData.photo_url}
                onUpload={(url) => {
                  setFormData({...formData, photo_url: url});
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
                value={formData.date_found}
                onChange={(val) => setFormData({...formData, date_found: val})}
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
                  category={formData.category}
                  attributes={formData.attributes}
                  onAttributeChange={(field, val) => setFormData(prev => ({
                    ...prev,
                    attributes: { ...prev.attributes, [field]: val }
                  }))}
                  onChange={(val) => setFormData(prev => ({...prev, description: val}))}
                  onNext={() => goToStep(6)}
                >
                  <div className="space-y-6 pt-6 mt-6 border-t border-white/5">
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
              <GuestInfoStep 
                stepLabel="Step 6: Contact Details"
                firstName={formData.guest_first_name}
                lastName={formData.guest_last_name}
                email={formData.guest_email}
                contactInfo={formData.contact_info}
                onChange={(updates) => setFormData({...formData, ...updates})}
                onNext={() => goToStep(7)}
              />
            )}

            {step === 7 && (
              <>
                {matchedReport && (
                  <div className="mb-10 p-6 bg-uni-600/10 border border-uni-500/20 rounded-3xl flex items-center gap-6 max-w-2xl mx-auto">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-2xl">🔍</div>
                    <div className="text-left">
                      <p className="text-[10px] font-black text-uni-400 uppercase tracking-widest italic mb-1">Direct Match Reporting</p>
                      <p className="text-sm font-bold text-white">You are reporting a find for <span className="text-uni-400">"{matchedReport.title}"</span></p>
                    </div>
                  </div>
                )}
                
                <ReportSummary 
                  type="found"
                  formData={formData}
                  otherItemName={otherItemName}
                  loading={loading}
                  onSubmit={handleSubmit}
                />
              </>
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
