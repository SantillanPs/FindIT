import React, { useState } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { 
  X, ShieldCheck, Sparkles, Eye, EyeOff, CheckCircle, 
  AlertTriangle, FileText, MapPin, Clock, Fingerprint, 
  ChevronLeft, ChevronRight, RefreshCw, Plus, Trash2, 
  Image as ImageIcon, Star, Lock, Vault, Camera
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useVisionAnalysis } from "../../../hooks/useVisionAnalysis";
import CameraCapture from "./CameraCapture";
import ImageUpload from "../../../components/ImageUpload";

const ReportReviewModal = ({ item, onClose, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    public_title: item.public_title || item.title || '',
    public_description: item.public_description || item.description || '',
    category_id: item.category_id || '', 
    type_id: item.type_id || '',
    attributes: item.attributes || {},
    admin_notes: item.admin_notes || '',
    status: item.status || 'reported',
    visibility_config: item.visibility_config || { location: true, date_found: true, description: true, hidden_attributes: [] },
    is_title_public: item.is_title_public ?? true,
    is_location_public: item.is_location_public ?? false,
    main_photo_url: item.main_photo_url || item.photo_url,
    secondary_photos: Array.isArray(item.secondary_photos) ? item.secondary_photos : [],
    challenge_questions: Array.isArray(item.challenge_questions) ? item.challenge_questions : [item.challenge_question].filter(Boolean),
    found_date: item.date_found ? new Date(item.date_found).toISOString().split('T')[0] : '',
    found_time: item.date_found ? new Date(item.date_found).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '',
    location: item.location || ''
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureTarget, setCaptureTarget] = useState(null); // 'main' or index
  const totalSteps = 4;

  const images = [formData.main_photo_url, ...(formData.secondary_photos || [])].filter(Boolean);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { isAnalysing, aiDraft, triggerAnalysis } = useVisionAnalysis(item);

  const handleApplyAiSuggestion = () => {
    if (!aiDraft) return;
    setFormData(prev => ({
      ...prev,
      public_title: aiDraft.suggested_title || prev.public_title,
      public_description: aiDraft.skeptical_summary || aiDraft.suggested_description || prev.public_description,
      type_id: aiDraft.type_id || prev.type_id,
      attributes: { ...prev.attributes, ...aiDraft.attributes }
    }));
  };

  const handleSave = () => {
    const dateFound = formData.found_date && formData.found_time 
      ? new Date(`${formData.found_date}T${formData.found_time}`).toISOString() : item.date_found;
    
    // Detect question changes for forensic re-answering logic
    const oldQuestions = JSON.stringify(Array.isArray(item.challenge_questions) ? item.challenge_questions : [item.challenge_question].filter(Boolean));
    const newQuestions = JSON.stringify(formData.challenge_questions);
    const questionsChanged = oldQuestions !== newQuestions;

    // Construct finalized database payload
    // We explicitly omit UI-only helper fields (found_date, found_time, category_id) 
    // to prevent PostgREST 400 Bad Request errors.
    const { 
      found_date, 
      found_time, 
      category_id, 
      ...cleanData 
    } = formData;

    onSubmit({ 
      id: item.id, 
      updates: { 
        ...cleanData, 
        challenge_question: formData.challenge_questions[0] || null, // Sync legacy column to prevent ghost data
        date_found: dateFound, 
        review_status: 'reviewed', 
        status: 'available',
        photo_url: formData.main_photo_url // Ensure primary photo is synced back to photo_url
      },
      questionsChanged 
    });
  };

  const addQuestion = () => setFormData(prev => ({ ...prev, challenge_questions: [...prev.challenge_questions, ''] }));
  const updateQuestion = (index, value) => {
    const newQuestions = [...formData.challenge_questions];
    newQuestions[index] = value;
    setFormData(prev => ({ ...prev, challenge_questions: newQuestions }));
  };

  const removeQuestion = (index) => setFormData(prev => ({ ...prev, challenge_questions: prev.challenge_questions.filter((_, i) => i !== index) }));
  const [hasAutoSeeded, setHasAutoSeeded] = useState(false);

  // Auto-seed AI draft data ONLY for initial unreviewed items
  React.useEffect(() => {
    // Only auto-seed if we have a draft AND it's a fresh report (unreviewed)
    if (aiDraft && !hasAutoSeeded && item.status === 'reported') {
      console.log('[ReportReviewModal] Auto-seeding existing AI draft for fresh report...');
      setFormData(prev => ({
        ...prev,
        public_title: !prev.public_title || prev.public_title === item.title ? (aiDraft.suggested_title || prev.public_title) : prev.public_title,
        public_description: !prev.public_description || prev.public_description === item.description ? (aiDraft.skeptical_summary || aiDraft.suggested_description || prev.public_description) : prev.public_description,
        challenge_questions: prev.challenge_questions.length === 0 && aiDraft.security_questions 
          ? aiDraft.security_questions 
          : prev.challenge_questions
      }));
      setHasAutoSeeded(true);
    }
  }, [aiDraft, hasAutoSeeded, item.status, item.title, item.description]);

  const handleManualAiTrigger = async () => {
    console.log('[ReportReviewModal] AI Help Clicked. Images:', images);
    const analysis = await triggerAnalysis(images);
    console.log('[ReportReviewModal] AI Analysis Result:', analysis);
    
    if (analysis) {
      setFormData(prev => ({
        ...prev,
        // Apply Metadata suggestions
        public_title: analysis.suggested_title || prev.public_title,
        public_description: analysis.skeptical_summary || analysis.suggested_description || prev.public_description,
        brand: analysis.brand !== 'Generic' ? analysis.brand : prev.brand,
        
        // Append Questions (merging with existing)
        challenge_questions: analysis.security_questions 
          ? [...new Set([...prev.challenge_questions, ...analysis.security_questions])]
          : prev.challenge_questions
      }));
    }
  };

  const handlePhotoUpdate = (url, target) => {
    if (target === 'main') {
      setFormData(prev => ({ ...prev, main_photo_url: url }));
    } else if (typeof target === 'number') {
      const newSecondary = [...formData.secondary_photos];
      newSecondary[target] = url;
      setFormData(prev => ({ ...prev, secondary_photos: newSecondary }));
    } else if (target === 'new') {
      setFormData(prev => ({ ...prev, secondary_photos: [...prev.secondary_photos, url] }));
    }
    setIsCapturing(false);
    setCaptureTarget(null);
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 md:p-8 isolate overflow-hidden">
      <AnimatePresence>
        <div key="overlay" onClick={onClose} className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" />
      </AnimatePresence>
      
      <div className="w-full max-w-6xl bg-slate-900 border border-white/10 rounded-[2.5rem] relative z-10 shadow-3xl flex flex-col md:flex-row overflow-hidden max-h-[90vh] min-h-0">
        
        {/* Left Side: Visual Intelligence (Fixed context on Desktop) */}
        <div className="hidden md:flex w-full md:w-[40%] bg-black/20 border-r border-white/5 flex-col overflow-hidden">
          <div className="relative h-[450px] shrink-0 group">
            <img src={images[currentImageIndex]} className="w-full h-full object-cover" alt="Item" />
            <div className="absolute top-6 left-6 flex gap-2">
              <Badge className="bg-uni-500/20 text-uni-400 border-uni-500/30">Photo {currentImageIndex+1}/{images.length}</Badge>
            </div>
            {images.length > 1 && (
              <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setCurrentImageIndex(p => p === 0 ? images.length-1 : p-1)} className="p-2 rounded-full bg-black/40"><ChevronLeft size={20} /></button>
                <button onClick={() => setCurrentImageIndex(p => p === images.length-1 ? 0 : p+1)} className="p-2 rounded-full bg-black/40"><ChevronRight size={20} /></button>
              </div>
            )}
          </div>

          <div className="flex-grow overflow-y-auto p-10 space-y-10 custom-scrollbar opacity-30 select-none pointer-events-none min-h-0">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-white/20 font-black uppercase tracking-widest text-[10px]">
                <ImageIcon size={16} /> <span>Original Photos</span>
                {isAnalysing && <RefreshCw size={14} className="animate-spin ml-auto text-uni-400" />}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed italic">
                These are the photos taken when the item was found. Use them to help fill out the details.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Editorial Desk */}
        <div className="flex-grow flex flex-col bg-slate-900 border-l border-white/5 min-h-0">
          <div className="p-6 md:p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/50 backdrop-blur-xl sticky top-0 z-20">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-uni-500/10 flex items-center justify-center text-uni-400 font-black border border-uni-500/20">
                {currentStep}
              </div>
              <div>
                <h2 className="text-xl font-black text-white italic uppercase tracking-tight leading-none">Review Item</h2>
                <div className="flex items-center gap-2 mt-1.5 overflow-hidden">
                  {[1, 2, 3, 4].map((s) => (
                    <button 
                      key={s} 
                      onClick={() => setCurrentStep(s)}
                      className={`h-1 rounded-full transition-all duration-500 ${s <= currentStep ? (s === currentStep ? 'w-6 bg-uni-400' : 'w-3 bg-uni-400/40') : 'w-3 bg-white/10 hover:bg-white/20'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 border border-white/10 rounded-full text-slate-500 hover:text-white transition-colors"><X size={18} /></button>
          </div>

          <div className="flex-grow overflow-y-auto p-6 md:p-8 custom-scrollbar">
            <AnimatePresence mode="wait">
              <Motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* STEP 1: FORENSIC INTEL (Moved from static left side for mobile stacking) */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="p-6 rounded-3xl bg-uni-600/10 border border-uni-500/20 flex gap-4 items-center">
                      <ShieldCheck size={24} className="text-uni-400" />
                      <div><p className="text-[10px] font-black text-white uppercase mb-0.5">Step 1: Item Photos</p><p className="text-[11px] text-slate-400">Update photos or add better ones if needed.</p></div>
                    </div>
                    
                    <div className="space-y-6 pb-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <label className="text-[9px] text-slate-600 uppercase font-black flex items-center gap-2 italic">Photos for the List</label>
                          <span className="text-[8px] font-black text-slate-700 uppercase italic">Admin Only</span>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {/* Main Photo Slot */}
                          <div className="space-y-2">
                             <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-uni-500 bg-black/20 group">
                               <img src={formData.main_photo_url} className="w-full h-full object-cover" alt="Main" />
                               <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                  <button 
                                    onClick={() => { setIsCapturing(true); setCaptureTarget('main'); }}
                                    className="px-3 py-1.5 rounded-lg bg-uni-500 text-white text-[8px] font-black uppercase tracking-widest hover:bg-uni-600 transition-all flex items-center gap-2"
                                  >
                                    <Camera size={12} /> Take New
                                  </button>
                               </div>
                               <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-uni-500 text-white text-[7px] font-black uppercase">Main</div>
                             </div>
                             <p className="text-[8px] font-bold text-slate-600 uppercase text-center italic">Main Identification</p>
                          </div>

                          {/* Secondary Slots */}
                          {formData.secondary_photos.map((url, idx) => (
                            <div key={idx} className="space-y-2">
                              <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/5 bg-black/10 group">
                                <img src={url} className="w-full h-full object-cover" alt="Secondary" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                  <button 
                                    onClick={() => { setIsCapturing(true); setCaptureTarget(idx); }}
                                    className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-[8px] font-black uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2"
                                  >
                                    <Camera size={12} /> Retake
                                  </button>
                                  <button 
                                    onClick={() => setFormData(prev => ({ ...prev, secondary_photos: prev.secondary_photos.filter((_, i) => i !== idx) }))}
                                    className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-[8px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all flex items-center gap-2"
                                  >
                                    <Trash2 size={12} /> Remove
                                  </button>
                                </div>
                              </div>
                              <p className="text-[8px] font-bold text-slate-600 uppercase text-center italic">Evidence Angle #{idx+1}</p>
                            </div>
                          ))}

                          {/* Add New Slot */}
                          {formData.secondary_photos.length < 5 && (
                            <div className="space-y-2">
                              <button 
                                onClick={() => { setIsCapturing(true); setCaptureTarget('new'); }}
                                className="w-full aspect-square rounded-2xl border border-dashed border-white/10 bg-white/[0.02] hover:bg-white/[0.05] flex flex-col items-center justify-center gap-3 transition-all group"
                              >
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-600 group-hover:text-uni-400 transition-colors">
                                  <Plus size={20} />
                                </div>
                                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Add Photo</span>
                              </button>
                              <p className="text-[8px] font-bold text-slate-800 uppercase text-center italic">Another photo</p>
                            </div>
                          )}
                        </div>

                        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                           <div className="flex items-center gap-3 text-[9px] font-black text-slate-500 uppercase italic">
                              <i className="fa-solid fa-cloud-arrow-up"></i>
                              <span>Upload from files</span>
                           </div>
                           <div className="flex gap-4">
                              <div className="flex-grow">
                                <ImageUpload 
                                  onUploadSuccess={(url) => handlePhotoUpdate(url, 'new')} 
                                  description="Upload extra photos" 
                                />
                              </div>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: SECURITY BARRICADES (MOVED UP) */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="p-6 rounded-3xl bg-amber-600/10 border border-amber-500/20 flex gap-4 items-center">
                      <Fingerprint size={24} className="text-amber-400" />
                      <div><p className="text-[10px] font-black text-white uppercase mb-0.5">Step 2: Security</p><p className="text-[11px] text-slate-400">Add questions that only the owner can answer.</p></div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2 items-center text-slate-500 font-black uppercase text-[10px]">
                          Questions for Owner
                        </div>
                        <div className="flex gap-2">
                          {isAnalysing ? (
                            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[9px] font-black uppercase flex items-center gap-2">
                              <RefreshCw size={14} className="animate-spin text-uni-400" /> AI Working...
                            </div>
                          ) : (
                            <button 
                              onClick={handleManualAiTrigger}
                              className="px-4 py-2 rounded-xl bg-uni-500/10 text-uni-400 border border-uni-500/20 text-[9px] font-black uppercase flex items-center gap-2 hover:bg-uni-500/20 transition-all group"
                            >
                              <Sparkles size={14} className="group-hover:animate-pulse" /> AI Help
                            </button>
                          )}
                          <button 
                            onClick={addQuestion} 
                            disabled={formData.challenge_questions.some(q => !q.trim())}
                            className="px-4 py-2 rounded-xl bg-white/5 text-slate-400 border border-white/10 text-[9px] font-black uppercase flex items-center gap-2 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-black"
                          >
                            <Plus size={14} /> Add Manual
                          </button>
                        </div>
                      </div>
                      
                      <div className="max-h-[380px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
                        {formData.challenge_questions.map((q, idx) => (
                          <div key={idx} className="flex gap-3 group animate-in slide-in-from-right-2 duration-300 mb-3 last:mb-0">
                            <div className="flex-grow relative group/input">
                              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-600 uppercase">{idx + 1}</div>
                              <input 
                                type="text" 
                                value={q} 
                                onChange={e => updateQuestion(idx, e.target.value)} 
                                className="w-full h-12 bg-white/[0.02] border border-white/5 rounded-xl pl-10 pr-10 text-xs font-bold text-white outline-none focus:border-amber-500/50 transition-all" 
                                placeholder="e.g. What is the wallpaper on the screen?" 
                              />
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 opacity-0 group-focus-within/input:opacity-100 transition-opacity">
                                <ShieldCheck size={12} className="text-amber-500/50" />
                              </div>
                            </div>
                            <button 
                              onClick={() => removeQuestion(idx)} 
                              className="w-12 h-12 rounded-xl border border-white/5 flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-40 hover:opacity-100"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                      {formData.challenge_questions.length === 0 && (
                          <div className="text-center py-12 border border-dashed border-white/5 rounded-3xl space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto text-slate-600">
                              <ShieldCheck size={24} className="opacity-20" />
                            </div>
                            <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest italic">No questions added. You will need to check the owner yourself.</p>
                          </div>
                        )}
                      </div>
                    </div>
                )}

                {/* STEP 3: PUBLIC BRANDING (MOVED DOWN) */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="p-6 rounded-3xl bg-blue-600/10 border border-blue-500/20 flex gap-4 items-center">
                      <ImageIcon size={24} className="text-blue-400" />
                      <div><p className="text-[10px] font-black text-white uppercase mb-0.5">Step 3: Listing Details</p><p className="text-[11px] text-slate-400">Decide what students will see in the list.</p></div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-[9px] text-slate-600 uppercase font-bold ml-1">Public Title</label>
                          <button 
                            onClick={() => setFormData({...formData, is_title_public: !formData.is_title_public})} 
                            className={`text-[8px] font-black uppercase px-2 py-1 rounded-lg border transition-all ${formData.is_title_public ? 'bg-uni-500/10 text-uni-400 border-uni-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}
                          >
                            {formData.is_title_public ? 'Visibility: Feed' : 'Visibility: Hidden'}
                          </button>
                        </div>
                        <input 
                          type="text" 
                          value={formData.public_title} 
                          onChange={e => setFormData({...formData, public_title: e.target.value})} 
                          className="w-full h-12 bg-white/[0.03] border border-white/5 rounded-xl px-5 text-sm font-bold text-white outline-none focus:border-uni-500/50" 
                          placeholder="e.g. Blue Aluminum Flask" 
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-[9px] text-slate-600 uppercase font-bold ml-1">Found Location</label>
                          <button 
                            onClick={() => setFormData({...formData, is_location_public: !formData.is_location_public})} 
                            className={`text-[8px] font-black uppercase px-2 py-1 rounded-lg border transition-all ${formData.is_location_public ? 'bg-uni-400/10 text-uni-300 border-uni-400/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}
                          >
                            {formData.is_location_public ? 'Public Location' : 'Secret Location'}
                          </button>
                        </div>
                        <input 
                          type="text" 
                          value={formData.location} 
                          onChange={e => setFormData({...formData, location: e.target.value})} 
                          className="w-full h-12 bg-white/[0.03] border border-white/5 rounded-xl px-5 text-sm font-bold text-white outline-none focus:border-uni-500/50" 
                          placeholder="Building / Room / Zone" 
                        />
                        <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest ml-1 italic">Hidden location helps filter legitimate claimers.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: FINAL CLEARANCE */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="p-6 rounded-3xl bg-uni-600/10 border border-uni-500/20 flex gap-4 items-center">
                      <Clock size={24} className="text-uni-400" />
                      <div><p className="text-[10px] font-black text-white uppercase mb-0.5">Step 4: Final Steps</p><p className="text-[11px] text-slate-400">Add internal notes to finish the review.</p></div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-[9px] text-slate-600 uppercase font-black flex items-center gap-2 ml-1">
                          Internal Admin Notes
                        </label>
                        <textarea 
                          value={formData.admin_notes} 
                          onChange={e => setFormData({...formData, admin_notes: e.target.value})} 
                          className="w-full min-h-[120px] bg-uni-500/5 border border-uni-500/20 rounded-2xl p-5 text-sm font-medium text-slate-300 outline-none focus:border-uni-500/50 shadow-inner" 
                          placeholder="e.g. Shelf B, Bin #42. Blue bottle with a 'NASA' sticker on the bottom." 
                        />
                      </div>

                    </div>
                  </div>
                )}
              </Motion.div>
            </AnimatePresence>
          </div>

          {/* Stepper Navigation Footer */}
          <div className="p-6 md:p-8 border-t border-white/5 bg-slate-900/95 backdrop-blur-xl flex gap-4 items-center z-20">
            {currentStep > 1 && (
              <Button 
                onClick={() => setCurrentStep(p => p - 1)} 
                variant="outline" 
                className="h-14 w-14 rounded-2xl border-white/10 text-slate-500 hover:text-white transition-all shrink-0 p-0"
              >
                <ChevronLeft size={24} />
              </Button>
            )}
            
            <div className="flex-grow flex gap-4">
              {currentStep < totalSteps ? (
                <Button 
                  onClick={() => setCurrentStep(p => p + 1)}
                  className="flex-grow h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all text-[11px] font-black uppercase tracking-[0.2em]"
                >
                  Next Step: {currentStep === 1 ? 'Security' : currentStep === 2 ? 'Listing Details' : 'Finish'} →
                </Button>
              ) : (
                <Button 
                  onClick={handleSave} 
                  disabled={isSubmitting} 
                  className="flex-grow h-14 rounded-2xl bg-uni-500 text-white hover:bg-uni-600 transition-all text-[11px] font-black uppercase tracking-[0.3em] shadow-xl shadow-uni-500/20"
                >
                  {isSubmitting ? 'Saving...' : 'Finish & Save'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Camera Capture Overlay */}
      {isCapturing && (
        <CameraCapture 
          onUploadSuccess={(url) => handlePhotoUpdate(url, captureTarget)}
          onCancel={() => { setIsCapturing(false); setCaptureTarget(null); }}
        />
      )}
    </div>
  );
};

export default ReportReviewModal;
