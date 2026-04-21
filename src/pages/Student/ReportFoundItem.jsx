import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

// Shared Flow Components
import ReportStepHeader from '../../components/ReportFlow/ReportStepHeader';
import ReportSuccess from '../../components/ReportFlow/ReportSuccess';
import ZoneSelectorStep from '../../components/ReportFlow/ZoneSelectorStep';
import ReportSummary from '../../components/ReportFlow/ReportSummary';
import MultiImageStep from '../../components/ReportFlow/MultiImageStep';


const ReportFoundItem = () => {
  const [formData, setFormData] = useState({
    title: 'AI Processing...',
    description: 'Analyzing Forensic Visuals...',
    location: '',
    zone_id: null,
    date_found: new Date().toISOString(),
    photo_url: '',
    secondary_photos: [],
    category: 'other',
    ai_draft: null
  });
  
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const totalSteps = 3;
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get('match');

  // 1. Fetch matched report using TanStack Query
  const { data: matchedReport } = useQuery({
    queryKey: ['lostItem', matchId],
    queryFn: async () => {
      if (!matchId) return null;
      const { data, error } = await supabase
        .from('lost_items')
        .select('*')
        .eq('id', matchId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!matchId
  });

  // 2. Submit found item
  const submissionMutation = useMutation({
    mutationFn: async (reportPayload) => {
      const { data, error } = await supabase.rpc('submit_found_item_v2', { 
        registry_signal: reportPayload 
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['found_items'] });
      queryClient.invalidateQueries({ queryKey: ['student_dashboard'] });
      navigate('/student');
    },
    onError: (err) => {
      setError(err.message || 'Something went wrong. Please try again.');
    }
  });

  // Sync if matchId is present
  useEffect(() => {
    if (matchedReport) {
      setFormData(prev => ({
        ...prev,
        category: matchedReport.category,
        matched_lost_id: parseInt(matchId)
      }));
    }
  }, [matchedReport, matchId]);


  const goToStep = (target) => setStep(target);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');

    const reportPayload = {
      title: 'Processing AI Report...',
      description: 'Found Item - Visual DNA pending analysis.',
      category: formData.category || 'other',
      location: formData.location,
      date_found: formData.date_found,
      photo_url: formData.photo_url,
      photo_thumbnail_url: formData.photo_url,
      secondary_photos: formData.secondary_photos || [],
      finder_id: user?.id || null,
      status: 'reported',
      is_verified: true,
      ai_draft: null, 
      registry_signal: { 
        ...formData, 
        reporter_type: 'student',
        reporter_id: user?.id
      }
    };

    submissionMutation.mutate(reportPayload);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, y: -30, transition: { duration: 0.3 } }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-10 min-h-[calc(100dvh-var(--navbar-height)-4rem)] flex flex-col px-4">
      <ReportStepHeader 
        title="Report Found Item"
        label="AI Forensic Intake"
        step={step}
        totalSteps={totalSteps}
        error={error}
        icon="fa-bolt"
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
              <MultiImageStep 
                stepLabel="Step 1: Forensic Capture"
                title="Snap photos of the item."
                description="The AI will analyze these images to identify the item and its owner."
                primaryImage={formData.photo_url}
                onPrimaryUpload={(url) => {
                  setFormData({...formData, photo_url: url});
                }}
                secondaryPhotos={formData.secondary_photos}
                onSecondaryUpload={(index, url) => {
                  const newSecondary = [...formData.secondary_photos];
                  newSecondary[index] = url;
                  setFormData({...formData, secondary_photos: newSecondary});
                }}
                onNext={() => goToStep(2)}
              />
            )}

            {step === 2 && (
              <ZoneSelectorStep
                stepLabel="Step 2: Location"
                title="Where was it found?"
                description="Select the building or area."
                formData={formData}
                setFormData={setFormData}
                onNext={() => goToStep(3)}
              />
            )}

            {/* FINAL STEP: SUMMARY */}
            {step === 3 && (
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
                  loading={submissionMutation.isPending}
                  onSubmit={handleSubmit}
                />
              </>
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
            University Lost & Found Registry
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ReportFoundItem;
