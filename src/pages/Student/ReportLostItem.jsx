import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useMasterData } from '../../context/MasterDataContext';

// New Components
import ReportStepHeader from '../../components/ReportFlow/ReportStepHeader';
import NarrativeIntakeStep from '../../components/ReportFlow/NarrativeIntakeStep';
import ZoneSelectorStep from '../../components/ReportFlow/ZoneSelectorStep';
import ImageStep from '../../components/ReportFlow/ImageStep';
import ReportSummary from '../../components/ReportFlow/ReportSummary';
import DetailsStep from '../../components/ReportFlow/DetailsStep';
import LocationModeStep from '../../components/ReportFlow/LocationModeStep';

const ReportLostItem = () => {
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
    guest_email: '',
    contact_info: '',
    potential_zone_ids: [],
    location_mode: '', // 'certain' | 'trace'
    location_hints: [], // Buildings mentioned in narrative
    attributes: {}
  });
  
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  const navigate = useNavigate();
  const { user } = useAuth();
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
      navigate('/student');
    },
    onError: (err) => {
      setError(err.message || 'Something went wrong. Please try again.');
    }
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        guest_first_name: user.first_name || '',
        guest_last_name: user.last_name || '',
        guest_email: user.email || ''
      }));
    }
  }, [user]);

  const handleAnalysisComplete = (results) => {
    setFormData(prev => ({
      ...prev,
      title: results.suggested_title || prev.title,
      category: results.category,
      attributes: results.attributes,
      location_hints: results.location_hints,
      synthesized_description: results.synthesized_description,
      // If AI found a timeframe hint, we could try to parse it, 
      // but for now we'll let them confirm the default or current date
    }));
    setStep(2);
  };

  const goToStep = (target) => setStep(target);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');

    const reportPayload = {
      title: formData.title || formData.category || 'Lost Item',
      description: formData.synthesized_description || formData.description,
      original_description: formData.description, // Store original in table
      synthesized_description: formData.synthesized_description,
      category: formData.category,
      location: formData.location,
      date_lost: formData.date_lost,
      photo_url: formData.photo_url,
      photo_thumbnail_url: formData.photo_url,
      owner_id: user?.id || null,
      status: 'reported',
      is_verified: true,
      registry_signal: { ...formData, reporter_type: 'student' }
    };

    submissionMutation.mutate(reportPayload);
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.98, y: 30 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, scale: 1.02, y: -30, transition: { duration: 0.3 } }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-10 min-h-[calc(100dvh-var(--navbar-height)-4rem)] flex flex-col px-4">
      <ReportStepHeader 
        title="Report Lost Item"
        label="Narrative-First System"
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
                titleValue={formData.title}
                onTitleChange={(val) => setFormData({...formData, title: val})}
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
                    <p className="text-xs text-slate-400 italic">"Matches better with found items"</p>
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
              <ImageStep 
                stepLabel="Step 5: Almost Done"
                title="Reference Photo"
                description="Optional: Adding a photo helps us verify the item if found."
                value={formData.photo_url}
                onUpload={(url) => setFormData({...formData, photo_url: url})}
                onNext={() => goToStep(6)} 
              />
            )}

            {step === 6 && (
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
             <Link to="/student" className="px-8 py-3 rounded-xl bg-red-500/5 text-red-500/40 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-all">
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

export default ReportLostItem;
