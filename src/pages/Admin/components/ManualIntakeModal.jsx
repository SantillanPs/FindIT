import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useVisionAnalysis } from '../../../hooks/useVisionAnalysis';

// Modular Components
import IntakeHeader from './ManualIntake/IntakeHeader';
import IntakeFooter from './ManualIntake/IntakeFooter';
import Step1Visuals from './ManualIntake/Step1Visuals';
import Step2Identity from './ManualIntake/Step2Identity';
import Step3Location from './ManualIntake/Step3Location';
import Step4Review from './ManualIntake/Step4Review';

/**
 * ManualIntakeModal - Modular Edition
 * - 4-Step Wizard Flow mirroring the Found Item Report.
 * - Decomposed into sub-components for maintainability.
 */
const ManualIntakeModal = ({ isOpen, onClose, onSubmit, actionLoading }) => {
  const [step, setStep] = useState(1);
  const [type] = useState('found');
  const [showPulse, setShowPulse] = useState(false);
  const scrollRef = useRef(null);
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'other',
    location: '',
    zone_id: null,
    date: new Date().toISOString().split('T')[0],
    time: '',
    reporter_name: '',
    assisted_by: '',
    photo_url: '',
    secondary_photos: ['', ''],
    attributes: {
      material: '',
      condition: 'good',
      brand: '',
      model: '',
      color: ''
    },
    identified_name: '',
    identified_id_number: '',
    identified_user_id: null,
    is_public: true
  });

  const [isIdentified, setIsIdentified] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [memberResults, setMemberResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const stepLabels = [
    "Visual Evidence",
    "Identity & Attributes",
    "Time & Location",
    "Administrative Metadata"
  ];

  const stepSubtitles = [
    "Capture multi-angle photos for AI extraction.",
    "Refine owner details and item characteristics.",
    "Pinpoint where and when the asset was recovered.",
    "Finalize record with intake officer credentials."
  ];

  // AI Vision Integration
  const { isAnalysing, aiDraft, triggerAnalysis, error: aiError } = useVisionAnalysis();
  const lastAnalyzedRef = useRef(null);

  useEffect(() => {
    if (showPulse) {
      const timer = setTimeout(() => setShowPulse(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showPulse]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo(0, 0);
    }
  }, [step]);

  // Manual Trigger for AI Analysis
  const handleManualScan = async () => {
    const photos = [form.photo_url, ...form.secondary_photos].filter(Boolean);
    const primaryPhoto = form.photo_url;

    if (!primaryPhoto || isAnalysing) return;

    console.log("[AI-INTAKE] Manual trigger initiated by admin...");
    
    try {
      const result = await triggerAnalysis(photos);
      if (result) {
      setForm(prev => ({
        ...prev,
        title: prev.title || result.suggested_title,
        description: prev.description || result.skeptical_summary,
        category: result.category || prev.category,
        attributes: {
          ...prev.attributes,
          brand: prev.attributes.brand || result.brand,
          model: prev.attributes.model || result.model,
          color: prev.attributes.color || result.color,
        }
      }));

      if (result.detected_owner_info?.id_number || result.detected_owner_info?.name) {
        setIsIdentified(true);
        setForm(prev => ({
          ...prev,
          identified_name: prev.identified_name || result.detected_owner_info.name || '',
          identified_id_number: prev.identified_id_number || result.detected_owner_info.id_number || ''
        }));

        const { data: matchedUsers } = await supabase
          .from('user_profiles_v1')
          .select('id, first_name, last_name, student_id_number')
          .or(`student_id_number.eq."${result.detected_owner_info.id_number}",first_name.ilike.%${result.detected_owner_info.name}%,last_name.ilike.%${result.detected_owner_info.name}%`)
          .limit(1);

        if (matchedUsers && matchedUsers.length > 0) {
          const member = matchedUsers[0];
          setForm(prev => ({
            ...prev,
            identified_name: `${member.first_name} ${member.last_name}`,
            identified_id_number: member.student_id_number,
            identified_user_id: member.id
          }));
          setShowPulse(true);
        }
      }
    }
    } catch (err) {
      console.error("[AI-INTAKE] Manual scan failed:", err);
    }
  };

  if (!isOpen) return null;

  const handleNext = () => step < 4 ? setStep(s => s + 1) : null;
  const handleBack = () => step > 1 ? setStep(s => s - 1) : null;

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const payload = {
      p_type: type,
      p_title: form.title || 'Found Item',
      p_description: form.description,
      p_category: form.category,
      p_location: form.location,
      p_date: form.date,
      p_reporter_name: form.reporter_name,
      p_status: 'in_custody',
      p_assisted_by: form.assisted_by,
      p_time: form.time,
      p_photo_url: form.photo_url,
      p_zone_id: form.zone_id,
      p_attributes: form.attributes,
      p_secondary_photos: form.secondary_photos.filter(url => !!url),
      p_brand: form.attributes.brand,
      p_model: form.attributes.model,
      p_identified_name: isIdentified ? form.identified_name : null,
      p_identified_id_number: isIdentified ? form.identified_id_number : null,
      p_identified_user_id: isIdentified ? form.identified_user_id : null,
      p_is_public: form.is_public
    };
    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 isolate">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
        onClick={onClose} className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" 
      />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }} 
        animate={{ 
          scale: showPulse ? [1, 1.02, 1] : 1,
          opacity: 1, 
          y: 0,
          boxShadow: showPulse ? [
            "0 0 0 0px rgba(59, 130, 246, 0)",
            "0 0 0 20px rgba(59, 130, 246, 0.4)",
            "0 0 0 40px rgba(59, 130, 246, 0)"
          ] : "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
        }} 
        transition={{ duration: 0.6 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }} 
        className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[2.5rem] relative z-10 shadow-3xl flex flex-col overflow-hidden max-h-[85vh]"
      >
        <AnimatePresence>
          {isAnalysing && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="bg-uni-500 overflow-hidden">
              <div className="px-6 py-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Neural Forensic Scan in Progress...</span>
                </div>
                <Sparkles className="text-white/50 animate-spin-slow" size={14} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <IntakeHeader 
          step={step} stepLabels={stepLabels} stepSubtitles={stepSubtitles} 
          isAnalysing={isAnalysing} onClose={onClose} 
          aiError={aiError}
        />

        <div ref={scrollRef} className="flex-grow overflow-y-auto custom-scrollbar p-6 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-8">
              {step === 1 && <Step1Visuals form={form} setForm={setForm} isAnalysing={isAnalysing} />}
              {step === 2 && (
                <Step2Identity 
                  form={form} setForm={setForm} isIdentified={isIdentified} setIsIdentified={setIsIdentified}
                  memberSearchQuery={memberSearchQuery} setMemberSearchQuery={setMemberSearchQuery}
                  memberResults={memberResults} setMemberResults={setMemberResults}
                  isSearching={isSearching} isAnalysing={isAnalysing} aiDraft={aiDraft}
                  showPulse={showPulse} setShowPulse={setShowPulse}
                />
              )}
              {step === 3 && <Step3Location form={form} setForm={setForm} />}
              {step === 4 && <Step4Review form={form} setForm={setForm} />}
            </motion.div>
          </AnimatePresence>
        </div>

        <IntakeFooter 
          step={step} onClose={onClose} handleBack={handleBack} 
          handleNext={handleNext} handleSubmit={handleSubmit} 
          isAnalysing={isAnalysing} actionLoading={actionLoading} form={form} 
          handleManualScan={handleManualScan} aiDraft={aiDraft}
        />
      </motion.div>
    </div>
  );
};

export default ManualIntakeModal;
