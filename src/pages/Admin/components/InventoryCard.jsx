import { Link } from 'react-router-dom';
import { useMasterData } from '../../../context/MasterDataContext';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  MapPin, 
  User as UserIcon, 
  BadgeCheck, 
  Vault,
  Clock,
  RefreshCw,
  Zap
} from "lucide-react";

/**
 * InventoryCard - Premium Professional (Pro Max)
 * - Refined glassmorphism.
 * - Human-centric labeling.
 * - High-end typography.
 */
const InventoryCard = ({ 
  item, 
  navigate, 
  handleStatusUpdate, 
  setShowReleaseModal, 
  setReleaseForm, 
  actionLoading 
}) => {
  const { categories: CATEGORIES } = useMasterData();
  const categoryData = CATEGORIES.find(c => c.id === item.category);

  const formattedDate = new Date(item.created_at || item.date_found).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).toUpperCase();

  // Construct reporter name
  const reporterFullName = item.guest_name || [item.guest_first_name, item.guest_last_name].filter(Boolean).join(' ');
  const displayReporter = reporterFullName || item.owner_name || 'Anonymous Finder';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <Card className="group relative border-white/5 bg-slate-900/40 backdrop-blur-3xl hover:bg-slate-900/60 transition-all duration-500 overflow-hidden rounded-[2rem] shadow-2xl p-0 flex flex-col">
         
         {/* 1. Cinematic Header (Visual Intelligence) */}
         <div className={`relative overflow-hidden bg-slate-950 transition-all duration-700 rounded-t-[2rem] ${
           item.photo_url ? 'aspect-[21/9]' : 'h-16 sm:h-20'
         }`}>
            {item.photo_url ? (
               <>
                  <img 
                    src={item.photo_url} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out opacity-90 group-hover:opacity-100"
                  />
                  {/* Cinematic Vignette Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/20 z-10"></div>
               </>
            ) : (
               <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-between px-6 opacity-60 group-hover:opacity-80 transition-opacity">
                  <div className="text-2xl drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{categoryData?.emoji || '📦'}</div>
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em]">Resource Preview</div>
               </div>
            )}

            {/* Top Left Category Anchor */}
            <div className="absolute top-4 left-4 z-20">
               <Badge className="bg-black/70 backdrop-blur-2xl text-white border-white/20 px-4 py-2 text-[11px] font-black uppercase tracking-[0.1em] rounded-xl flex items-center gap-2 shadow-2xl transition-all group-hover:bg-black/90 group-hover:scale-105 duration-300">
                  <span className="text-sm group-hover:scale-110 transition-transform">{categoryData?.emoji || '📦'}</span>
                  {categoryData?.name || item.category || 'Asset'}
               </Badge>
            </div>
         </div>

         <CardContent className="p-4 sm:p-5 flex flex-col gap-4">
            
            {/* 2. Primary Information */}
            <div className="space-y-4 text-left min-w-0">
               <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                     <div className="flex items-center gap-2 flex-wrap text-white">
                        <span className="text-[10px] font-black text-slate-500 tracking-[0.15em] px-2 py-0.5 border border-white/5 rounded">
                           #{item.id.toString().slice(-4).toUpperCase()}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2 border-l border-white/10">
                           <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                           {formattedDate}
                        </div>
                     </div>
                     <Badge className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border shrink-0 transition-all duration-500 ${
                        item.status === 'released' 
                        ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                        : 'bg-uni-500/10 text-uni-400 border-white/5 shadow-inner'
                     }`}>
                        {item.status === 'in_custody' ? 'REPOSITORY' : item.status === 'reported' ? 'INTAKE' : 'RELEASED'}
                     </Badge>
                  </div>

                  <div className="space-y-0.5">
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-0.5">Asset: {item.title}</p>
                     <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight group-hover:text-uni-400 transition-colors duration-500 truncate drop-shadow-sm">
                        {item.location || 'Not Specified'}
                     </h3>
                  </div>
               </div>

               <div className="grid grid-cols-1 pt-4 border-t border-white/5">
                  <div className="space-y-1">
                     <p className="text-[10px] font-normal text-slate-500 uppercase tracking-widest">Reporter</p>
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-uni-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]"></div>
                        <p className="text-sm font-bold text-white truncate capitalize">{displayReporter}</p>
                     </div>
                  </div>
               </div>
            </div>

            {/* 3. Actions Area */}
            <div className="p-4 sm:p-5 border-t lg:border-t-0 lg:border-l border-white/5 flex flex-col items-stretch justify-center gap-3 min-w-[200px] bg-white/[0.01]">
               <div className="flex items-center gap-3 w-full">
                 {item.status === 'reported' ? (
                      <Button 
                        onClick={() => handleStatusUpdate(item, 'in_custody')}
                        disabled={actionLoading === item.id}
                        className="w-full h-14 rounded-2xl bg-white text-slate-950 hover:bg-uni-600 hover:text-white font-bold text-[11px] uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95"
                      >
                         {actionLoading === item.id ? (
                           <RefreshCw size={18} className="animate-spin" />
                         ) : (
                           <div className="flex items-center gap-3">
                             <Vault size={18} />
                             Secure Item
                           </div>
                         )}
                      </Button>
                 ) : (
                      <Button 
                        disabled={item.status === 'claimed'}
                        onClick={() => {
                           setShowReleaseModal(item);
                            setReleaseForm({ 
                                name: item.identified_name || '', 
                                id_number: item.identified_student_id || '',
                                photo_url: '' 
                            });
                        }}
                        className={`w-full h-14 rounded-2xl font-bold text-[11px] uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 ${
                           item.status === 'claimed'
                           ? 'bg-slate-800 text-slate-500 border-white/5 cursor-not-allowed'
                           : 'border border-green-500/20 bg-green-500/10 text-green-400 hover:bg-green-600 hover:text-white'
                        }`}
                      >
                         <BadgeCheck size={18} className="mr-3" />
                         {item.status === 'claimed' ? 'Released' : 'Release Item'}
                      </Button>
                 )}
               </div>
            </div>

         </CardContent>
      </Card>
    </motion.div>
  );
};

export default InventoryCard;
