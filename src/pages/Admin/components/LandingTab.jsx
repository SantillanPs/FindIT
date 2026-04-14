import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  RotateCcw, 
  Layout, 
  Megaphone, 
  Type, 
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion } from 'framer-motion';

const LandingTab = () => {
  const [config, setConfig] = useState({
    hero_title: '',
    hero_subtitle: '',
    announcement_text: '',
    show_announcement: false,
    show_leaderboard: true,
    show_identified: true,
    support_email: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: '' }

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const { data, error } = await Promise.race([
        supabase
          .schema('internal')
          .from('site_configs')
          .select('*')
          .eq('id', 'main')
          .single(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Fetch Timeout')), 30000)
        )
      ]);
      
      if (error) throw error;
      if (data) setConfig(data);
    } catch (error) {
      console.error('Error fetching config:', error);
      setStatus({ 
        type: 'error', 
        message: error.message === 'Fetch Timeout' ? 'System response delayed. Please retry.' : 'Failed to load landing page configuration.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setStatus(null);
      
      const { error } = await supabase
        .schema('internal')
        .from('site_configs')
        .update({
          ...config,
          updated_at: new Date().toISOString()
        })
        .eq('id', 'main');

      if (error) throw error;
      
      setStatus({ type: 'success', message: 'Landing page configuration updated successfully.' });
      setTimeout(() => setStatus(null), 3000);
    } catch (error) {
      console.error('Error saving config:', error);
      setStatus({ type: 'error', message: 'Failed to save configuration. Access denied or network error.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/5 border-t-uni-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
      {/* Header Actions */}
      <div className="flex items-center justify-between gap-6 pb-6 border-b border-white/5">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-white tracking-tight">Landing Page Control</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Global UI & Content Management</p>
        </div>
        
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            onClick={fetchConfig}
            className="h-12 px-6 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-bold uppercase tracking-widest"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saving}
            className="h-12 px-8 rounded-xl bg-white hover:bg-uni-600 hover:text-white text-slate-950 text-[10px] font-bold uppercase tracking-widest shadow-xl transition-all"
          >
            {saving ? (
              <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Publish Changes
          </Button>
        </div>
      </div>

      {status && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border flex items-center gap-3 ${
            status.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}
        >
          {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <p className="text-[10px] font-bold uppercase tracking-widest">{status.message}</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Hero Section Control */}
        <section className="space-y-6 bg-slate-950/40 p-8 rounded-[2rem] border border-white/5">
          <div className="flex items-center gap-3 pb-4 border-b border-white/5">
            <Type className="h-4 w-4 text-uni-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Hero Presentation</h3>
          </div>
          
          <div className="space-y-6 text-left">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Headline</label>
              <Input 
                value={config.hero_title}
                onChange={e => setConfig({...config, hero_title: e.target.value})}
                placeholder="Lost it? Find it."
                className="h-14 bg-black/40 border-white/10 rounded-xl focus:border-uni-500 transition-all font-bold"
              />
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Subtext</label>
              <Textarea 
                value={config.hero_subtitle}
                onChange={e => setConfig({...config, hero_subtitle: e.target.value})}
                placeholder="The university's centralized registry..."
                className="min-h-[100px] bg-black/40 border-white/10 rounded-xl focus:border-uni-500 transition-all font-medium text-slate-400"
              />
            </div>
          </div>
        </section>

        {/* Global Announcement */}
        <section className="space-y-6 bg-slate-950/40 p-8 rounded-[2rem] border border-white/5">
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <Megaphone className="h-4 w-4 text-rose-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">System Banner</h3>
            </div>
            <button 
              onClick={() => setConfig({...config, show_announcement: !config.show_announcement})}
              className={`p-1.5 rounded-lg transition-all ${config.show_announcement ? 'bg-rose-500/20 text-rose-400' : 'bg-white/5 text-slate-600'}`}
            >
              {config.show_announcement ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>

          <div className="space-y-6 text-left">
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Broadcast Message</label>
                <Badge variant="outline" className={config.show_announcement ? 'border-rose-500/50 text-rose-400 text-[8px]' : 'text-[8px] opacity-20'}>
                  {config.show_announcement ? 'LIVE' : 'INACTIVE'}
                </Badge>
              </div>
              <Textarea 
                value={config.announcement_text}
                onChange={e => setConfig({...config, announcement_text: e.target.value})}
                placeholder="e.g. Server maintenance scheduled for 2:00 AM..."
                className="min-h-[100px] bg-black/40 border-white/10 rounded-xl focus:border-uni-500 transition-all font-medium"
              />
              <p className="text-[9px] text-slate-600 font-bold tracking-wider">Visible at the very top of the landing page when active.</p>
            </div>
          </div>
        </section>

        {/* Visibility Controls */}
        <section className="space-y-6 bg-slate-950/40 p-8 rounded-[2rem] border border-white/5">
          <div className="flex items-center gap-3 pb-4 border-b border-white/5">
            <Layout className="h-4 w-4 text-sky-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Section Toggles</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 hover:bg-black/40 transition-all group">
              <div className="text-left">
                <p className="text-[10px] font-bold text-white uppercase tracking-widest group-hover:text-sky-400 transition-colors">Identified Items</p>
                <p className="text-[9px] text-slate-500 mt-0.5">Show items linked to student IDs</p>
              </div>
              <button 
                onClick={() => setConfig({...config, show_identified: !config.show_identified})}
                className={`w-12 h-6 rounded-full transition-all relative ${config.show_identified ? 'bg-sky-500' : 'bg-slate-800'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${config.show_identified ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 hover:bg-black/40 transition-all group">
              <div className="text-left">
                <p className="text-[10px] font-bold text-white uppercase tracking-widest group-hover:text-emerald-400 transition-colors">Honor Roll</p>
                <p className="text-[9px] text-slate-500 mt-0.5">Public community leaderboard</p>
              </div>
              <button 
                onClick={() => setConfig({...config, show_leaderboard: !config.show_leaderboard})}
                className={`w-12 h-6 rounded-full transition-all relative ${config.show_leaderboard ? 'bg-emerald-500' : 'bg-slate-800'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${config.show_leaderboard ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </section>

        {/* Global Metadata */}
        <section className="space-y-6 bg-slate-950/40 p-8 rounded-[2rem] border border-white/5">
          <div className="flex items-center gap-3 pb-4 border-b border-white/5">
            <Save className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Global Metadata</h3>
          </div>
          
          <div className="space-y-6 text-left">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Institutional Support Email</label>
              <Input 
                value={config.support_email}
                onChange={e => setConfig({...config, support_email: e.target.value})}
                placeholder="support@findit.edu"
                className="h-14 bg-black/40 border-white/10 rounded-xl focus:border-uni-500 transition-all font-bold"
              />
            </div>
          </div>
        </section>
      </div>

      <div className="pt-10 flex items-center justify-center gap-4 text-slate-600">
        <AlertCircle size={14} />
        <p className="text-[9px] font-bold uppercase tracking-[0.2em]">Changes take effect immediately upon publishing for all users.</p>
      </div>
    </div>
  );
};

export default LandingTab;
