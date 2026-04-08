import { Link } from 'react-router-dom';
import { useMasterData } from '../../../context/MasterDataContext';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Fingerprint
} from "lucide-react";

/**
 * InventoryCard - Overhauled for Premium Admin Dashboard
 * Fixes UUID overlap and implements a high-performance, attractive layout.
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
        return { label: 'Discovery Pending', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: Clock };
      case 'in_custody':
        return { label: 'In Vault', color: 'bg-sky-500/10 text-sky-400 border-sky-500/20', icon: Vault };
      case 'claimed':
        return { label: 'Ready for Release', color: 'bg-green-500/10 text-green-400 border-green-500/20', icon: BadgeCheck };
      default:
        return { label: status, color: 'bg-slate-500/10 text-slate-400 border-slate-500/20', icon: Package };
    }
  };

  const statusCfg = getStatusConfig(item.status);
  const categoryData = CATEGORIES.find(c => c.id === item.category);

  return (
    <Card className={`group relative border-white/5 bg-slate-950/40 backdrop-blur-md hover:bg-slate-900/60 transition-all duration-500 overflow-hidden rounded-[2rem] ${
       isSelected ? 'ring-2 ring-uni-500/50 bg-uni-500/5' : ''
    }`}>
       {/* Background Accent Gradient */}
       <div className="absolute top-0 right-0 w-64 h-64 bg-uni-500/5 blur-[120px] pointer-events-none group-hover:bg-uni-500/10 transition-colors duration-700"></div>
       
       <CardContent className="p-0 flex flex-col lg:flex-row items-stretch lg:items-center">
          
          {/* 1. Visual & Selection Section */}
          <div className="flex items-center gap-6 p-6 lg:p-8 shrink-0">
             {/* Custom Checkbox */}
             <div 
               onClick={onToggleSelect}
               className={`w-6 h-6 rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all duration-300 ${
                 isSelected 
                 ? 'bg-uni-500 border-uni-500 shadow-xl shadow-uni-500/40' 
                 : 'border-white/10 hover:border-white/30 hover:scale-110'
               }`}
             >
                {isSelected && <CheckCircle2 size={14} className="text-white" />}
             </div>

             {/* Thumbnail Container */}
             <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-[1.75rem] bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 flex items-center justify-center relative flex-shrink-0 shadow-2xl group-hover:border-uni-500/30 transition-all duration-500">
                {item.photo_url ? (
                  <img 
                    src={item.photo_url} 
                    alt={item.title} 
                    className="w-full h-full object-cover rounded-[1.75rem] opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                ) : (
                  <div className="text-4xl lg:text-5xl drop-shadow-2xl grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500">
                    {categoryData?.emoji || '📦'}
                  </div>
                )}
                
                {/* Minimal ID Badge - Subtly Integrated */}
                <div className="absolute -top-2 -left-2 bg-slate-950 border border-white/5 px-2.5 py-1 rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                   <Fingerprint size={10} className="text-uni-500" />
                   <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">
                      {item.id.slice(0, 8)}
                   </span>
                </div>
             </div>
          </div>

          {/* 2. Primary Information Section */}
          <div className="flex-grow p-6 lg:p-8 flex flex-col gap-4 border-l border-white/5">
             <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                   <Badge className="bg-uni-500/10 text-uni-400 border-uni-500/20 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-lg">
                      {categoryData?.name || 'Uncategorized'}
                   </Badge>
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Calendar size={12} className="text-slate-600" />
                      {new Date(item.date_found).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                   </span>
                </div>
                <h3 className="text-xl lg:text-2xl font-black text-white italic tracking-tight group-hover:text-uni-400 transition-colors duration-300 uppercase">
                   {item.title}
                </h3>
             </div>

             <div className="flex items-center gap-4 text-slate-400">
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                      <MapPin size={14} className="text-uni-400" />
                   </div>
                   <span className="text-[12px] font-bold tracking-tight">{item.location}</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-slate-800"></div>
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                      <UserIcon size={14} className="text-slate-500" />
                   </div>
                   <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {item.finder_id ? (
                        <Link to={`/admin/profile/${item.finder_id}`} className="hover:text-uni-400 transition-colors">
                           {item.owner_name || 'System Registry'}
                        </Link>
                      ) : (
                        item.owner_name || 'System Registry'
                      )}
                   </span>
                </div>
             </div>
          </div>

          {/* 3. Analytics & Intelligence Section */}
          <div className="hidden xl:flex items-center gap-8 px-10 border-l border-white/5 h-full min-w-[280px]">
             <div className="space-y-4 w-full">
                <div className="flex items-center justify-between">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Search size={12} className="text-uni-500" />
                      Insight Engine
                   </p>
                </div>
                
                <div className="flex flex-col gap-2.5">
                   {itemMatches.length > 0 ? (
                      <div className="flex items-center justify-between bg-uni-500/5 border border-uni-500/10 p-2.5 rounded-xl">
                         <span className="text-[11px] font-bold text-uni-400 uppercase tracking-widest pl-1">Found Correlation</span>
                         <Badge className="bg-uni-500 text-white font-black text-[10px] px-2 rounded-lg">
                            {itemMatches.length}
                         </Badge>
                      </div>
                   ) : (
                      <div className="flex items-center gap-2 text-slate-600 animate-pulse">
                         <RefreshCw size={12} className="animate-spin-slow" />
                         <span className="text-[10px] font-black uppercase tracking-widest italic">Scanning database...</span>
                      </div>
                   )}
                   
                   {itemClaims.length > 0 && (
                      <div className="flex items-center justify-between bg-amber-500/5 border border-amber-500/10 p-2.5 rounded-xl">
                         <span className="text-[11px] font-bold text-amber-500 uppercase tracking-widest pl-1">Active Claims</span>
                         <Badge className="bg-amber-500 text-white font-black text-[10px] px-2 rounded-lg">
                            {itemClaims.length}
                         </Badge>
                      </div>
                   )}
                </div>

                {itemMatches.length > 0 && (
                   <button 
                       onClick={() => {
                           navigate('/admin/matches');
                           setSearchTerm(`#${item.id.slice(0, 8)}`);
                       }}
                       className="group/btn w-full mt-1 py-1.5 flex items-center justify-center gap-2 text-[10px] font-black text-uni-400 uppercase tracking-[0.2em] border border-uni-400/20 rounded-lg hover:bg-uni-400 hover:text-white transition-all"
                   >
                       Detailed Inspection
                       <ArrowRight size={10} className="group-hover/btn:translate-x-1 transition-transform" />
                   </button>
                )}
             </div>
          </div>

          {/* 4. Secondary Actions / Status Section */}
          <div className="p-6 lg:p-8 border-l border-white/5 bg-slate-400/[0.02] flex flex-row lg:flex-col items-center justify-between lg:justify-center gap-6 min-w-[200px]">
             <div className="flex flex-col items-center lg:items-end gap-2">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest pr-1">Current Status</p>
                <Badge className={`text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-xl ${statusCfg.color} border shadow-2xl`}>
                  <statusCfg.icon size={13} className="mr-2" />
                  {statusCfg.label}
                </Badge>
             </div>

             <div className="flex flex-col gap-2 w-full max-w-[160px]">
               {item.status === 'reported' ? (
                    <Button 
                      onClick={() => handleStatusUpdate(item, 'in_custody')}
                      disabled={actionLoading === item.id}
                      className="w-full bg-uni-600 hover:bg-uni-700 text-white text-[11px] font-black uppercase tracking-[0.2em] h-14 rounded-2xl shadow-xl shadow-uni-600/20 active:scale-95 transition-all"
                    >
                       {actionLoading === item.id ? (
                         <RefreshCw size={16} className="animate-spin" />
                       ) : (
                         <>
                           <Vault size={16} className="mr-2.5" />
                           Secure
                         </>
                       )}
                    </Button>
               ) : (
                    <Button 
                      variant="outline"
                      onClick={() => {
                         setShowReleaseModal(item);
                          setReleaseForm({ 
                             name: item.identified_name || '', 
                             id_number: item.identified_student_id || '',
                             photo_url: '' 
                          });
                      }}
                      className="w-full bg-green-500/5 border-green-500/20 text-green-500 hover:bg-green-600 hover:text-white text-[11px] font-black uppercase tracking-[0.2em] h-14 rounded-2xl transition-all shadow-lg active:scale-95"
                    >
                       <BadgeCheck size={16} className="mr-2.5" />
                       Release
                    </Button>
               )}
             </div>
          </div>

       </CardContent>
    </Card>
  );
};


export default InventoryCard;
