import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeLostNarrative } from '../../lib/lostItemAI';
import { Sparkles, MessageSquare, ArrowRight, Loader2 } from 'lucide-react';

const NarrativeIntakeStep = ({ 
    description, 
    onChange, 
    onAnalysisComplete, 
    onNext,
    stepLabel,
    showAI = true
}) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState(null);

    const handleAnalyze = async () => {
        console.log('🔘 [NarrativeIntakeStep] handleAnalyze CLICKED');
        if (description.length < 10) {
            console.warn('⚠️ [NarrativeIntakeStep] Description too short:', description.length);
            setError('Please provide a bit more detail about what happened!');
            return;
        }

        setIsAnalyzing(true);
        setError(null);

        try {
            console.log('⚡ [NarrativeIntakeStep] Calling service...');
            const results = await analyzeLostNarrative(description);
            console.log('✅ [NarrativeIntakeStep] Success! Moving to step 2.');
            onAnalysisComplete(results);
        } catch (err) {
            setError('AI Analysis failed. But don\'t worry, you can still proceed manually!');
            console.error(err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSimpleNext = () => {
        if (description.length < 10) {
            setError('Please provide a bit more detail about what happened!');
            return;
        }
        onNext();
    };

    return (
        <div className="space-y-12 py-10 flex-grow flex flex-col justify-center text-center">
            <div className="space-y-4">
                <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 italic">
                    {stepLabel}
                </span>
                <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none italic">
                    Describe your <span className="text-blue-400">item.</span>
                </h2>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest max-w-sm mx-auto">
                    Mention color, brand, and what's inside.
                </p>
            </div>

            <div className="max-w-3xl mx-auto w-full space-y-8">
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-[2.5rem] blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
                    <div className="relative">
                        <textarea 
                            autoFocus
                            className="w-full bg-slate-900/80 backdrop-blur-xl border-2 border-white/10 rounded-[2.5rem] p-10 text-xl font-bold text-white focus:border-blue-500 transition-all outline-none placeholder:text-slate-700 min-h-[250px] resize-none leading-relaxed shadow-2xl"
                            placeholder="I lost a black Guess wallet with a gold zipper. It has my ID and some cash inside..."
                            value={description}
                            onChange={(e) => {
                                onChange(e.target.value);
                                if (error) setError(null);
                            }}
                        />
                        <div className="absolute bottom-6 right-8 flex items-center gap-4">
                            <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${description.length < 10 ? 'text-slate-700' : 'text-blue-500/40'}`}>
                                {description.length} characters
                            </span>
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                                <MessageSquare className="h-4 w-4 text-slate-500" />
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-wrap justify-center gap-3 pt-4 relative z-10">
                    {['Color', 'Brand', 'Contents', 'Unique Marks'].map(item => (
                        <div key={item} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item}</span>
                        </div>
                    ))}
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.p 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-rose-400 text-[10px] font-black uppercase tracking-[0.2em] italic"
                        >
                            {error}
                        </motion.p>
                    )}
                </AnimatePresence>

                {showAI ? (
                    <button 
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || description.length < 10}
                        className="w-full relative group overflow-hidden bg-white text-black py-6 rounded-[2.2rem] font-black text-xs uppercase tracking-[0.5em] transition-all hover:bg-clear border border-black/5 active:scale-[0.98] disabled:opacity-30 disabled:grayscale"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500"></div>
                        <span className="relative z-10 flex items-center justify-center gap-4 group-hover:text-white transition-colors">
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Analyzing Story...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4" />
                                    Review My Description
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </span>
                    </button>
                ) : (
                    <button 
                        onClick={handleSimpleNext}
                        className="w-full relative group overflow-hidden bg-white text-black py-6 rounded-[2.2rem] font-black text-xs uppercase tracking-[0.5em] transition-all hover:bg-clear border border-black/5 active:scale-[0.98]"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500"></div>
                        <span className="relative z-10 flex items-center justify-center gap-4 group-hover:text-white transition-colors">
                            Next Step
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </button>
                )}

                {showAI && (
                    <div className="pt-4 flex items-center justify-center gap-6 grayscale opacity-40">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
                            Powered by Gemini 2.5 Flash
                        </p>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
                            Multilingual Support
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NarrativeIntakeStep;
