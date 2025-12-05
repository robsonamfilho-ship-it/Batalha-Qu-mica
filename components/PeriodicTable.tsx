
import React from 'react';
import { ElementData, HiddenTarget } from '../types';
import { PERIODIC_TABLE, CATEGORY_COLORS } from '../constants';
import { Crosshair } from 'lucide-react';

interface PeriodicTableProps {
  onElementClick: (element: ElementData) => void;
  hits: number[];
  misses: number[];
  targets?: HiddenTarget[]; // If provided (reveal phase), show targets.
  disabled: boolean;
}

const PeriodicTable: React.FC<PeriodicTableProps> = ({ 
  onElementClick, 
  hits, 
  misses, 
  targets,
  disabled
}) => {
  
  const getCellStyle = (element: ElementData) => {
    const isHit = hits.includes(element.number);
    const isMiss = misses.includes(element.number);
    
    // Check if this element is a target (ONLY if targets prop is provided for reveal phase)
    const isTarget = targets?.some(t => t.element.number === element.number);

    let baseClasses = "relative flex flex-col items-center justify-center p-[2px] rounded cursor-pointer transition-all duration-200 select-none text-white";
    
    // Shift column by 1 to make room for period labels
    const gridStyle = {
      gridColumn: element.col + 1,
      gridRow: element.row,
    };

    if (isHit) {
      // If it's a hit, check if it was a target to decide color (though hits usually imply target in this logic, keeping distinction is safe)
      return {
        className: `${baseClasses} bg-green-600 shadow-[0_0_15px_rgba(22,163,74,0.8)] border border-green-400 z-10`,
        style: gridStyle
      };
    }
    
    if (isMiss) {
      return {
        className: `${baseClasses} bg-slate-800 opacity-40 grayscale border border-slate-700`,
        style: gridStyle
      };
    }

    if (isTarget) {
      return {
        className: `${baseClasses} bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.8)] border border-yellow-300 z-10 transform scale-110`,
        style: gridStyle
      };
    }

    const categoryColor = CATEGORY_COLORS[element.category] || "bg-slate-600";
    
    return {
      className: `${baseClasses} ${categoryColor} hover:brightness-125 border border-white/5 ${disabled ? 'opacity-80' : 'opacity-100'}`,
      style: gridStyle
    };
  };

  return (
    <div className="inline-block min-w-max p-4">
      <div 
        className="grid gap-[2px] bg-slate-950 p-2 rounded-xl"
        style={{
          // Added 30px first column for period labels
          gridTemplateColumns: '30px repeat(18, 44px)', 
          gridTemplateRows: 'repeat(10, 44px)', 
        }}
      >
        {/* Period Labels (1-7) */}
        {[1, 2, 3, 4, 5, 6, 7].map(period => (
          <div 
            key={`period-${period}`}
            className="flex items-center justify-center text-slate-500 font-bold text-sm"
            style={{ gridColumn: 1, gridRow: period }}
          >
            {period}
          </div>
        ))}

        {PERIODIC_TABLE.map((element) => {
          const { className, style } = getCellStyle(element);

          return (
            <div
              key={element.number}
              className={className}
              style={style}
              onClick={() => !disabled && onElementClick(element)}
            >
              <span className="absolute top-[1px] left-[2px] text-[8px] opacity-70 leading-none">{element.number}</span>
              <span className="text-sm font-bold leading-tight">{element.symbol}</span>
              
              {/* Hit Marker Animation */}
              {hits.includes(element.number) && (
                 <Crosshair className="absolute w-6 h-6 text-white opacity-50 animate-ping" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PeriodicTable;
