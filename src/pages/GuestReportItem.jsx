import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useMasterData } from '../context/MasterDataContext';

// Shared Flow Components
import ReportStepHeader from '../components/ReportFlow/ReportStepHeader';
import ReportSuccess from '../components/ReportFlow/ReportSuccess';
import NarrativeIntakeStep from '../components/ReportFlow/NarrativeIntakeStep';
import DetailsStep from '../components/ReportFlow/DetailsStep';
import ZoneSelectorStep from '../components/ReportFlow/ZoneSelectorStep';
import LocationModeStep from '../components/ReportFlow/LocationModeStep';
import GuestInfoStep from '../components/ReportFlow/GuestInfoStep';
import ImageStep from '../components/ReportFlow/ImageStep';
import ReportSummary from '../components/ReportFlow/ReportSummary';

const GuestReportItem = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '', // Original narrative
    synthesized_description: '', // Clean AI version
    location: '',
    zone_id: null,
    date_lost: new Date().toISOString().slice(0, 16),
    category: '',
    photo_url: '',
    guest_first_name: '',
    guest_last_name: '',
    guest_full_name: '',
    guest_email: '',
    contact_info: '',
    potential_zone_ids: [],
    location_mode: '', // 'certain' | 'trace'
    location_hints: [], // Buildings mentioned in narrative
    attributes: {}
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 7;

  const queryClient = useQueryClient();

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
      queryClient.invalidateQueries({ queryKey: ['lost_items'] });
      queryClient.invalidateQueries({ queryKey: ['student_dashboard'] });
      setSuccess(true);
      window.scrollTo(0, 0);
    },
    onError: (err) => {
      setError(err.message || 'Something went wrong. Please try again.');
    }
  });

  const handleAnalysisComplete = (results) => {
    setFormData(prev => ({
      ...prev,
      category: results.category,
      attributes: results.attributes,
      location_hints: results.location_hints,
      synthesized_description: results.synthesized_description,
    }));
    setStep(2);
  };

  const goToStep = (target) => setStep(target);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');

    const reportPayload = {
      title: formData.category || 'Lost Item',
      description: formData.synthesized_description || formData.description,
      original_description: formData.description,
      synthesized_description: formData.synthesized_description,
      category: formData.category,
      location: formData.location,
      date_lost: formData.date_lost,
      guest_name: (formData.guest_full_name || `${formData.guest_first_name} ${formData.guest_last_name}`).trim(),
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
    <div className="max-w-4xl mx-auto space-y-12 py-10 min-h-[calc(100dvh-var(--navbar-height)-4rem)] flex flex-col px-4">
      <ReportStepHeader 
        title="Report Lost Item"
        label="Narrative-First System (Guest)"
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
              <NarrativeIntakeStep 
                stepLabel="Step 1: Your Narrative"
                description={formData.description}
                onChange={(val) => setFormData({...formData, description: val})}
                onAnalysisComplete={handleAnalysisComplete}
              />
            )}

            {step === 2 && (
              <DetailsStep 
                stepLabel="Step 2: Smart Check"
                title="What we understood"
                description="We've parsed your story into these details. Please verify or adjust them."
                value={formData.synthesized_description}
                category={formData.category}
                attributes={formData.attributes}
                onAttributeChange={(field, val) => setFormData(prev => ({
                    ...prev,
                    attributes: { ...prev.attributes, [field]: val }
                }))}
                onChange={(val) => setFormData(prev => ({...prev, synthesized_description: val}))}
                onNext={() => goToStep(3)}
              >
                <div className="bg-blue-500/5 p-6 rounded-2xl border border-blue-500/10 mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <i className="fas fa-magic text-blue-400"></i>
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest italic">AI Synthesis</span>
                    </div>
                    <p className="text-xs text-slate-400 italic">"Helping you match faster"</p>
                </div>
              </DetailsStep>
            )}

            {step === 3 && (
              <LocationModeStep 
                stepLabel="Step 3: Location Style"
                title="How should we look?"
                description="Help us match your item by choosing how you remember its location."
                value={formData.location_mode}
                onChange={(mode) => setFormData({...formData, location_mode: mode})}
                onNext={() => goToStep(4)}
              />
            )}

            {step === 4 && (
              <ZoneSelectorStep
                stepLabel="Step 4: Location"
                title={formData.location_mode === 'certain' ? "Pinpoint the area" : "Confirm the path"}
                description={formData.location_mode === 'certain' ? "Select the exact building or area where you left it." : "Select the areas you passed through. We've highlighted what your story mentioned."}
                formData={formData}
                setFormData={setFormData}
                onNext={() => goToStep(5)}
                multiSelect={formData.location_mode === 'trace'}
                aiHints={formData.location_hints}
              />
            )}

            {step === 5 && (
              <GuestInfoStep 
                stepLabel="Step 5: Contact Details"
                fullName={formData.guest_full_name || `${formData.guest_first_name} ${formData.guest_last_name}`.trim()}
                email={formData.guest_email}
                contactInfo={formData.contact_info}
                onChange={(updates) => {
                    if (updates.guest_full_name !== undefined) {
                        const fullName = updates.guest_full_name;
                        const parts = fullName.trim().split(' ');
                        setFormData({
                            ...formData,
                            guest_full_name: fullName,
                            guest_first_name: parts[0] || '',
                            guest_last_name: parts.slice(1).join(' ') || ''
                        });
                    } else {
                        setFormData({...formData, ...updates});
                    }
                }}
                onNext={() => goToStep(6)}
              />
            )}

            {step === 6 && (
              <ImageStep 
                stepLabel="Step 6: Reference Photo"
                title="Final Polish"
                description="Optional: Adding a photo helps us verify the item if found."
                value={formData.photo_url}
                onUpload={(url) => setFormData({...formData, photo_url: url})}
                onNext={() => goToStep(7)} 
              />
            )}

            {step === 7 && (
              <div className="pt-12">
                 <ReportSummary 
                  type="lost"
                  formData={formData}
                  loading={submissionMutation.isPending}
                  onSubmit={handleSubmit}
                />
              </div>
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
            Narrative-First Integration 2026
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default GuestReportItem;
