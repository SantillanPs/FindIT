import React from 'react';
import LostReportCard from './LostReportCard';
import { Calendar, Filter, SearchX, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const LostReportsTab = ({ 
  filteredLostReports, 
  matches, 
  navigate, 
  setSearchTerm,
  onUpdateReport,
  actionLoading,
  setPreviewImage,
  activeFilter
}) => {
  return (
    <div className="space-y-10 pb-32 text-left">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-uni-500/10 flex items-center justify-center text-uni-400 border border-uni-500/20 shadow-sm">
            <FileText size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Lost Item Registry</h3>
            <p className="text-[12px] text-slate-400 font-medium mt-1">Student submissions pending resolution</p>
          </div>
        </div>

        {['today', 'weekly'].includes(activeFilter) && (
           <div className="flex items-center gap-3">
              <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 px-4 py-1.5 rounded-xl text-[12px] font-bold flex items-center gap-2">
                <Calendar size={12} />
                {activeFilter === 'today' ? 'Filter: Today' : 'Filter: This Week'}
              </Badge>
              <button 
                onClick={() => setSearchTerm('')}
                className="text-[12px] font-medium text-slate-400 hover:text-amber-500 transition-colors"
              >
                Clear Filter ✕
              </button>
           </div>
        )}

       {filteredLostReports.length === 0 ? (
         <div className="py-32 text-center space-y-4 opacity-40">
           <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto border border-white/5">
             <SearchX size={32} className="text-slate-700" />
           </div>
           <div>
             <p className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">No Active Lost Reports</p>
             <p className="text-[12px] text-slate-500 font-medium mt-1">Registry is clear or no reports match your current filter</p>
           </div>
         </div>
       ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-8">
           {filteredLostReports.map(report => (
             <LostReportCard 
               key={report.id}
               report={report}
               matches={matches}
               navigate={navigate}
               setSearchTerm={setSearchTerm}
               onUpdate={onUpdateReport}
               isUpdating={actionLoading === `lost-${report.id}`}
               onPreview={setPreviewImage}
             />
           ))}
         </div>
       )}
    </div>
  );
};

export default LostReportsTab;
