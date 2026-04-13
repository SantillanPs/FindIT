import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useMasterData } from '../context/MasterDataContext';

// Shared Flow Components
import ReportStepHeader from '../components/ReportFlow/ReportStepHeader';
import ReportSuccess from '../components/ReportFlow/ReportSuccess';
import CategorySelection from '../components/ReportFlow/CategorySelection';
import ImageStep from '../components/ReportFlow/ImageStep';
import DetailsStep from '../components/ReportFlow/DetailsStep';
import SimpleInputStep from '../components/ReportFlow/SimpleInputStep';
import DateTimeStep from '../components/ReportFlow/DateTimeStep';
import ZoneSelectorStep from '../components/ReportFlow/ZoneSelectorStep';
import GuestInfoStep from '../components/ReportFlow/GuestInfoStep';
import ReportSummary from '../components/ReportFlow/ReportSummary';

const GuestReportItem = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    zone_id: null,
    date_lost: new Date().toISOString().slice(0, 16),
    guest_first_name: '',
    guest_last_name: '',
    guest_email: '',
    contact_info: '',
    category: '',
    photo_url: '',
    attributes: {}
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 7;

  const queryClient = useQueryClient();
  const [otherItemName, setOtherItemName] = useState('');

  // 1. Submit lost item using TanStack Mutation
  const submissionMutation = useMutation({
    mutationFn: async (reportPayload) => {
      const { data, error } = await supabase.rpc('submit_lost_item_v2', { 
        registry_signal: reportPayload 
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate dashboard and list keys
      queryClient.invalidateQueries({ queryKey: ['lost_items'] });
      queryClient.invalidateQueries({ queryKey: ['student_dashboard'] });
      setSuccess(true);
      window.scrollTo(0, 0);
    },
    onError: (err) => {
      setError(err.message || 'Something went wrong. Please try again.');
    }
  });


  const goToStep = (target) => setStep(target);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');

    const finalData = { ...formData };
    if (formData.category === 'Other') {
      finalData.title = otherItemName;
    } else {
      finalData.title = formData.category;
    }

    const reportPayload = {
      title: formData.title || formData.category,
      description: formData.description || `Reported ${formData.category}`,
      category: formData.category,
      location: formData.location,
      date_lost: formData.date_lost,
      guest_name: `${formData.guest_first_name} ${formData.guest_last_name}`,
      guest_email: formData.guest_email,
      guest_phone: formData.contact_info,
      photo_url: formData.photo_url,
      photo_thumbnail_url: formData.photo_url,
      status: 'reported',
      is_verified: false,
      registry_signal: { ...formData, reporter_type: 'guest' }
    };

    submissionMutation.mutate(reportPayload);
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.98, y: 30 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, scale: 1.02, y: -30, transition: { duration: 0.3 } }
  };

  if (success) {
    return <ReportSuccess type="lost" userFormData={formData} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-10 min-h-[calc(100vh-theme(spacing.24))] flex flex-col px-4">
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
                value={formData.photo_url}
                onUpload={(url) => setFormData({...formData, photo_url: url})}
                onNext={() => goToStep(2)}
              />
            )}

            {step === 2 && (
              <CategorySelection 
                formData={formData}
                setFormData={setFormData}
                otherItemName={otherItemName}
                setOtherItemName={setOtherItemName}
                onNext={() => goToStep(3)}
              />
            )}

            {step === 3 && (
              <ZoneSelectorStep
                stepLabel="Step 3: Location"
                title="Where was it last seen?"
                description="Please select the specific building or area."
                formData={formData}
                setFormData={setFormData}
                onNext={() => goToStep(4)}
              />
            )}

            {step === 4 && (
              <DateTimeStep 
                stepLabel="Step 4: Approximate Time"
                title="When did it go missing?"
                description="Select the date and time you last saw your item."
                value={formData.date_lost}
                onChange={(val) => setFormData({...formData, date_lost: val})}
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
              />
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
              <ReportSummary 
                type="lost"
                formData={formData}
                otherItemName={otherItemName}
                loading={submissionMutation.isPending}
                onSubmit={handleSubmit}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {!submissionMutation.isPending && (
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

export default GuestReportItem;
