import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../api/client';

// Shared Flow Components
import ReportStepHeader from '../components/ReportFlow/ReportStepHeader';
import ReportSuccess from '../components/ReportFlow/ReportSuccess';
import CategorySelection from '../components/ReportFlow/CategorySelection';
import ImageStep from '../components/ReportFlow/ImageStep';
import DetailsStep from '../components/ReportFlow/DetailsStep';
import SimpleInputStep from '../components/ReportFlow/SimpleInputStep';
import DateTimeStep from '../components/ReportFlow/DateTimeStep';
import IdentificationStep from '../components/ReportFlow/IdentificationStep';
import ReportSummary from '../components/ReportFlow/ReportSummary';

const GuestReportFound = () => {
  const [formData, setFormData] = useState({
    item_name: '',
    description: '',
    location_zone: '',
    found_time: new Date().toISOString().slice(0, 16),
    safe_photo_url: '',
    contact_full_name: '',
    identified_student_id: '',
    identified_name: '',
    category: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 7;

  const [categoryStats, setCategoryStats] = useState([]);
  const [otherItemName, setOtherItemName] = useState('');
  const [hasIdentification, setHasIdentification] = useState(false);
  const [reportData, setReportData] = useState(null);

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

      const resp = await apiClient.post('/found/report/guest', finalData);
      setReportData(resp.data);
      setSuccess(true);
      window.scrollTo(0, 0);
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

  if (success) {
    return <ReportSuccess type="found" reportData={reportData} userFormData={formData} />;
  }

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
              <SimpleInputStep 
                stepLabel="Step 3: Location"
                title="Where was the item found?"
                description="Be as specific as possible (Building, room, or landmark)."
                placeholder="e.g. Science Library, 2nd Floor, Near Stairs"
                icon="fa-location-dot"
                value={formData.location_zone}
                onChange={(val) => setFormData({...formData, location_zone: val})}
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
                <IdentificationStep 
                  formData={formData}
                  setFormData={setFormData}
                  hasIdentification={hasIdentification}
                  setHasIdentification={setHasIdentification}
                />
              </DetailsStep>
            )}

            {step === 6 && (
              <SimpleInputStep 
                stepLabel="Step 6: Your Information"
                title="And finally, what is your name?"
                description="Please provide your name for the report registry."
                placeholder="Your Full Name"
                icon="fa-user-check"
                value={formData.contact_full_name}
                onChange={(val) => setFormData({...formData, contact_full_name: val})}
                onNext={() => goToStep(7)}
                buttonText="Review Summary →"
              />
            )}

            {step === 7 && (
              <ReportSummary 
                type="found"
                formData={formData}
                otherItemName={otherItemName}
                loading={loading}
                onSubmit={handleSubmit}
              />
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
             <Link to="/" className="px-8 py-3 rounded-xl bg-red-500/5 text-red-500/40 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-all">
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

export default GuestReportFound;
