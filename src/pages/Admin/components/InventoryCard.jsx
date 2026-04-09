import { Link } from 'react-router-dom';
import { useMasterData } from '../../../context/MasterDataContext';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, 
  MapPin, 
  Calendar, 
  User as UserIcon, 
  Search, 
  CheckCircle2, 
  BadgeCheck, 
  ArrowRight,
  ClipboardCheck,
  Vault,
  Clock,
  RefreshCw,
  Box,
  Fingerprint,
  Info,
  ShieldCheck,
  Activity,
  ChevronRight,
  Zap,
  Tag
} from "lucide-react";

/**
 * InventoryCard - Premium Professional (Pro Max)
 * - Refined glassmorphism.
 * - Clean, human-centered labeling.
 * - High-end typography (no aggressive italics).
 */
const InventoryCard = ({ 
  item, 
  matches = [], 
  pendingClaims = [], 
  navigate, 
  setSearchTerm, 
  handleStatusUpdate, 
  setShowReleaseModal, 
  setReleaseForm, 
  actionLoading, 
  isSelected, 
  onToggleSelect 
}) => {
  const { categories: CATEGORIES } = useMasterData();
  const itemMatches = matches.find(m => m.found_item.id === item.id)?.top_matches || [];
  const itemClaims = pendingClaims.filter(c => c.found_item_id === item.id);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'reported':
        return { label: 'Newly Reported', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: Activity };
      case 'in_custody':
        return { label: 'Secured in Vault', color: 'bg-uni-500/10 text-sky-400 border-sky-500/20', icon: ShieldCheck };
      case 'claimed':
        return { label: 'Returned', color: 'bg-green-500/10 text-green-400 border-green-500/20', icon: BadgeCheck };
      default:
        return { label: status, color: 'bg-slate-500/10 text-slate-400 border-slate-500/20', icon: Package };
    }
  };

  const statusCfg = getStatusConfig(item.status);
  const categoryData = CATEGORIES.find(c => c.id === item.category);

  // Simple date display instead of "Persistence"
  const formattedDate = new Date(item.created_at || item.date_found).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <Card className={`group relative border-white/5 bg-slate-950/40 backdrop-blur-3xl hover:bg-slate-900/60 transition-all duration-500 overflow-hidden rounded-[1.5rem] md:rounded-[2rem] ${
         isSelected ? 'ring-1 ring-uni-500/50 bg-uni-500/5' : ''
      }`}>
         
         <CardContent className="p-0 flex flex-col lg:flex-row items-stretch lg:items-center">
            
            {/* 1. Visual & Selection Section */}
            <div className="flex items-center gap-4 md:gap-6 p-4 md:p-6 shrink-0 relative">
               {/* Selection Interaction */}
               <div 
                 onClick={onToggleSelect}
                 className={`w-10 h-10 rounded-xl border flex items-center justify-center cursor-pointer transition-all duration-300 z-20 ${
                   isSelected 
                   ? 'bg-uni-500 border-uni-400 shadow-lg scale-105' 
                   : 'border-white/10 hover:border-uni-500/50 hover:bg-white/5'
                 }`}
               >
                  {isSelected && <Zap size={16} className="text-white fill-white" />}
               </div>

               {/* Thumbnail */}
               <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl bg-black border border-white/5 flex items-center justify-center relative flex-shrink-0 shadow-2xl overflow-hidden">
                  {item.photo_url ? (
                    <img 
                      src={item.photo_url} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="text-3xl md:text-4xl grayscale group-hover:grayscale-0 transition-all duration-500">
                      {categoryData?.emoji || '📦'}
                    </div>
                  )}
                  
                  {/* Subtle ID Badge */}
                  <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded-md border border-white/10">
                     <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">
                        #{item.id.slice(0, 4)}
                     </span>
                  </div>
               </div>

               {/* Mobile Title View */}
               <div className="flex flex-col gap-1 lg:hidden">
                  <div className="flex items-center gap-2">
                     <Badge className="bg-uni-500/20 text-uni-400 font-bold uppercase text-[8px] tracking-wider border-0 px-2">
                        {categoryData?.name || 'Item'}
                     </Badge>
                     <span className="text-[10px] font-medium text-slate-500">
                        {formattedDate}
                     </span>
                  </div>
                  <h3 className="text-lg font-bold text-white leading-tight">
                     {item.title}
                  </h3>
               </div>
            </div>

            {/* 2. Primary Information */}
            <div className="flex-grow p-4 md:p-6 lg:p-8 flex flex-col gap-5 border-t lg:border-t-0 lg:border-l border-white/5 relative z-10">
               {/* Desktop Header */}
               <div className="hidden lg:block space-y-1">
                  <div className="flex items-center gap-3">
                     <span className="text-[9px] font-bold text-uni-400 uppercase tracking-widest">
                        {categoryData?.name || 'General'}
                     </span>
                     <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                     <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                        Reported: {formattedDate}
                     </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white group-hover:text-uni-400 transition-colors duration-300">
                     {item.title}
                  </h3>
               </div>

               {/* Meta Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                     <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 border border-white/5">
                        <MapPin size={16} />
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Location Found</span>
                        <span className="text-xs font-semibold text-slate-200">{item.location}</span>
                     </div>
                  </div>

                  <div className="flex items-center gap-3">
                     <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 border border-white/5">
                        <UserIcon size={16} />
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Reported By</span>
                        <span className="text-xs font-semibold text-slate-200">
                           {item.owner_name || 'Anonymous Finder'}
                        </span>
                     </div>
                  </div>
               </div>
            </div>

            {/* 3. Status & Actions */}
            <div className="p-4 md:p-6 lg:p-8 border-t lg:border-t-0 lg:border-l border-white/5 flex flex-row lg:flex-col items-center justify-between lg:justify-center gap-6 min-w-[200px]">
               <div className="flex flex-col items-start lg:items-center gap-1.5">
                  <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Item Status</span>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[11px] font-bold ${statusCfg.color}`}>
                    <statusCfg.icon size={14} />
                    {statusCfg.label}
                  </div>
               </div>

               <div className="flex items-center gap-2">
                 {item.status === 'reported' ? (
                      <Button 
                        onClick={() => handleStatusUpdate(item, 'in_custody')}
                        disabled={actionLoading === item.id}
                        className="h-12 px-6 rounded-xl bg-white text-slate-950 hover:bg-uni-600 hover:text-white font-bold text-[10px] uppercase tracking-widest transition-all"
                      >
                         {actionLoading === item.id ? (
                           <RefreshCw size={16} className="animate-spin" />
                         ) : (
                           <div className="flex items-center gap-2">
                             <Vault size={16} />
                             Secure
                           </div>
                         )}
                      </Button>
                 ) : (
                      <Button 
                        variant="ghost"
                        onClick={() => {
                           setShowReleaseModal(item);
                            setReleaseForm({ 
                               name: item.identified_name || '', 
                               id_number: item.identified_student_id || '',
                               photo_url: '' 
                            });
                        }}
                        className="h-12 px-6 rounded-xl border border-green-500/20 bg-green-500/5 text-green-500 hover:bg-green-600 hover:text-white font-bold text-[10px] uppercase tracking-widest transition-all"
                      >
                         <BadgeCheck size={16} className="mr-2" />
                         Release
                      </Button>
                 )}
                 
                 <Button 
                   variant="ghost"
                   onClick={() => navigate(`/admin/matches/${item.id}`)}
                   className="w-10 h-12 p-0 rounded-xl hover:bg-white/5 border border-white/5 text-slate-400 hover:text-white"
                 >
                    <ChevronRight size={18} />
                 </Button>
               </div>
            </div>

         </CardContent>
      </Card>
    </motion.div>
  );
};

export default InventoryCard;
