import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from 'framer-motion';
/* eslint-enable no-unused-vars */
import { 
  Search, 
  ChevronLeft, 
  MapPin, 
  Clock, 
  Megaphone,
  GraduationCap,
  ChevronRight,
  Package,
  Share2,
  CheckCircle2
} from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { imageCache } from '../lib/imageCache';
import { useMasterData } from '../context/MasterDataContext';
import ItemDetailsPeek from '../components/ItemDetailsPeek';

// ═══════════════════════════════════════════════
// RELATIVE TIME HELPER
// ═══════════════════════════════════════════════
const getRelativeTime = (dateString) => {
  if (!dateString) return null;
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
};

// ═══════════════════════════════════════════════
// ANNOUNCEMENT CARD COMPONENT
// ═══════════════════════════════════════════════
const AnnouncementCard = ({ item, onClick, onShare }) => {
  const { categories: CATEGORIES } = useMasterData();
  const [imgError, setImgError] = React.useState(imageCache.isFailed(item.photo_thumbnail_url || item.photo_url));
  const categoryData = CATEGORIES.find(c => c.id === item.category);
  const relativeTime = getRelativeTime(item.created_at);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative cursor-pointer"
      onClick={onClick}
    >
      {/* Glow Effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600/20 to-sky-500/20 rounded-[2rem] blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
      
      <div className="relative bg-slate-900/60 backdrop-blur-xl rounded-[2rem] border border-emerald-500/20 hover:border-emerald-400/40 overflow-hidden transition-all duration-300">
        
        {/* Image Section */}
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
          {item.photo_url && !imgError ? (
            <img 
              src={item.photo_thumbnail_url || item.photo_url} 
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
              loading="lazy"
              decoding="async"
              onError={() => { imageCache.markFailed(item.photo_thumbnail_url || item.photo_url); setImgError(true); }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950">
              <Package className="h-16 w-16 text-slate-700" />
            </div>
          )}

          {/* Category Badge (Top Left) */}
          <div className="absolute top-4 left-4 z-20">
            <div className="bg-emerald-500/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-500/20 flex items-center gap-2">
              <span className="text-lg">{categoryData?.emoji || '📦'}</span>
              <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">
                {categoryData?.label || 'General'}
              </span>
            </div>
          </div>

          {/* Time Badge (Top Right) */}
          {relativeTime && (
            <div className="absolute top-4 right-4 z-20">
              <div className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-slate-400" />
                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider">
                  {relativeTime}
                </span>
              </div>
            </div>
          )}

          {/* Gradient Fade */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
        </div>

        {/* Content Section */}
        <div className="p-5 md:p-6 space-y-4">
          {/* Announcement Banner */}
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <Megaphone className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <p className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em]">
              Owner Identified — Claim Required
            </p>
          </div>

          {/* Owner Name */}
          <div className="space-y-1">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em]">Identified Owner</p>
            <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight leading-tight italic">
              {item.identified_name || 'Registered Member'}
            </h3>
          </div>

          {/* Item Details Row */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 rounded-lg border border-white/5">
              <Package className="h-3 w-3 text-sky-400" />
              <span className="text-[10px] font-bold text-white uppercase tracking-tight">{item.title || item.category}</span>
            </div>
            {item.identified_student_id_masked && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 rounded-lg border border-white/5">
                <GraduationCap className="h-3 w-3 text-sky-400" />
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-tight">
                  ID: <span className="text-white">{item.identified_student_id_masked}</span>
                </span>
              </div>
            )}
          </div>

          {/* Location + CTA */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Claim at USG Office</span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onShare(item);
                }}
                className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                title="Share Announcement"
              >
                <Share2 className="h-3.5 w-3.5" />
              </button>
              <div className="flex items-center gap-1 text-emerald-400 group-hover:text-emerald-300 transition-colors">
                <span className="text-[10px] font-black uppercase tracking-widest">Details</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>

          {/* Community Message */}
          <p className="text-[9px] text-slate-500 font-medium italic leading-relaxed">
            If this is you, claim it through the system. If you know them, please let them know their item has been found.
          </p>
        </div>
      </div>
    </motion.div>
  );
};


// ═══════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════
const Announcements = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [peekItem, setPeekItem] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '' });

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const handleShare = (item) => {
    const text = `I found a ${item.title} on FindIT! If this is yours, you can claim it here.`;
    const url = window.location.origin + `/submit-claim/${item.id}`;
    
    if (navigator.share) {
      navigator.share({ title: 'FindIT | Item Found', text, url });
    } else {
      navigator.clipboard.writeText(`${text} ${url}`);
      showToast('Link copied to clipboard');
    }
  };

  // Fetch identified items from public view
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['announcements_identified'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_public_found_items')
        .select('*')
        .or('identified_name.not.is.null,identified_student_id_masked.not.is.null')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    placeholderData: keepPreviousData,
  });

  // Client-side search filter
  const filteredItems = searchQuery.trim().length > 1
    ? items.filter(item => {
        const q = searchQuery.toLowerCase();
        return (
          (item.identified_name || '').toLowerCase().includes(q) ||
          (item.title || '').toLowerCase().includes(q) ||
          (item.category || '').toLowerCase().includes(q)
        );
      })
    : items;

  return (
    <div className="min-h-screen text-white relative overflow-hidden pb-20">
      {/* Ambient Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent"></div>
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full pointer-events-none blur-3xl"></div>

      {/* Page Header */}
      <section className="relative pt-8 pb-6 md:pt-12 md:pb-10">
        <div className="max-w-7xl mx-auto px-4 md:px-12 relative z-10">
          
          {/* Back Navigation */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-6 group"
          >
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Back to Registry</span>
          </Link>

          {/* Title Block */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                  <Megaphone className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-5xl font-extrabold text-white uppercase tracking-tighter leading-none">
                    Announcements
                  </h1>
                  <div className="h-px w-24 bg-gradient-to-r from-emerald-500/50 to-transparent mt-1.5"></div>
                </div>
              </div>
              <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-[0.15em] max-w-xl leading-relaxed">
                These items have been found and their owners identified. If you are the owner, please claim through the system below. If you know the owner, please inform them.
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full md:max-w-xs shrink-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 z-10" />
              <Input 
                type="text" 
                placeholder="Search by name or item..." 
                className="h-11 pl-11 pr-4 rounded-xl border-white/10 bg-slate-900/60 backdrop-blur-xl text-sm font-bold uppercase tracking-tight focus-visible:ring-emerald-500/30 placeholder:text-slate-600 shadow-xl w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-6 flex items-center gap-4">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
              {filteredItems.length} {filteredItems.length === 1 ? 'Announcement' : 'Announcements'}
            </span>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest hover:text-emerald-300 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Content Grid */}
      <section className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="h-[420px] bg-white/5 animate-pulse rounded-[2rem] border border-white/5"></div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-20 text-center">
              <div className="max-w-md mx-auto space-y-6">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Megaphone className="h-10 w-10 text-emerald-500/40" />
                </div>
                <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">
                  {searchQuery ? 'No results found' : 'No announcements'}
                </h3>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">
                  {searchQuery 
                    ? 'Try a different search term.' 
                    : 'All items are either unclaimed or have been returned to their owners.'}
                </p>
                <Button
                  onClick={() => navigate('/')}
                  className="h-11 px-8 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] bg-white hover:bg-slate-200 text-black"
                >
                  Browse Registry
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filteredItems.map(item => (
                <AnnouncementCard 
                  key={item.id} 
                  item={item}
                  onClick={() => setPeekItem(item)}
                  onShare={handleShare}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Item Detail Peek */}
      <AnimatePresence>
        {peekItem && (
          <ItemDetailsPeek 
            item={peekItem}
            isOpen={!!peekItem}
            onClose={() => setPeekItem(null)}
            onShare={handleShare}
          />
        )}
      </AnimatePresence>

      {/* Toast Container */}
      {toast.show && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[110] animate-in fade-in slide-in-from-bottom-5 duration-500">
          <div className="border border-white/10 bg-slate-900/90 backdrop-blur-xl text-white px-8 py-4 rounded-full flex items-center space-x-4 shadow-2xl">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em]">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcements;
