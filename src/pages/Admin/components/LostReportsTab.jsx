import React from 'react';
import LostReportCard from './LostReportCard';

const LostReportsTab = ({ 
  filteredLostReports, 
  matches, 
  navigate, 
  setSearchTerm,
  onUpdateReport,
  actionLoading,
  setPreviewImage
}) => {
  return (
    <div className="p-8 space-y-10 pb-32 text-left">
       {filteredLostReports.length === 0 ? (
         <div className="py-20 text-center opacity-50">
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No Active Lost Reports</p>
           <p className="text-[9px] text-slate-700 font-black uppercase tracking-widest mt-2">All student reports are currently settled or matchless</p>
         </div>
       ) : (
         <div className="grid grid-cols-1 gap-6">
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
