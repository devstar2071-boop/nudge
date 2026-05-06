import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, ThumbsUp, ThumbsDown } from 'lucide-react';
import { LensNudge } from '../types.ts';
import { trackNudgeInteraction } from '../services/mockApi.ts';

interface SephoraLensOverlayProps {
  ingredient: string;
  nudge?: LensNudge;
  productId: string;
  userId: string;
}

export const SephoraLensOverlay: React.FC<SephoraLensOverlayProps> = ({ 
  ingredient, 
  nudge, 
  productId, 
  userId 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
    if (nudge) {
      trackNudgeInteraction(userId, productId, ingredient, 'view');
    }
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 300); // Small delay to allow moving mouse into the popover
  };

  const handleFeedback = (action: 'helpful' | 'not_helpful') => {
    trackNudgeInteraction(userId, productId, ingredient, action);
    setFeedbackGiven(true);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // If there's no nudge for this ingredient, just render plain text
  if (!nudge) {
    return <span>{ingredient}</span>;
  }

  return (
    <span 
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="lens-highlight font-medium text-black flex items-center inline-flex">
        {ingredient}
        <Sparkles className="h-3 w-3 ml-0.5 text-purple-600" />
      </span>

      {isOpen && (
        <div 
          className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-72 bg-white border border-gray-200 shadow-xl rounded-lg p-4 text-left"
          style={{ animation: 'fadeIn 0.2s ease-out' }}
        >
          <div className="flex items-center space-x-2 mb-2 border-b border-gray-100 pb-2">
            <div className="bg-purple-100 p-1.5 rounded-full">
              <Sparkles className="h-4 w-4 text-purple-600" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-800">
              Sephora Lens Insight
            </span>
          </div>
          
          <p className="text-sm text-gray-800 leading-relaxed mb-3">
            {nudge.summary}
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="text-[10px] text-gray-400 uppercase tracking-wide">
              Based on your profile
            </span>
            
            {!feedbackGiven ? (
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleFeedback('helpful')}
                  className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                  title="Helpful"
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                </button>
                <button 
                  onClick={() => handleFeedback('not_helpful')}
                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Not Helpful"
                >
                  <ThumbsDown className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <span className="text-[10px] text-green-600 font-medium">Thanks for feedback!</span>
            )}
          </div>
          
          {/* Tooltip Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
            <div className="w-3 h-3 bg-white border-b border-r border-gray-200 transform rotate-45"></div>
          </div>
        </div>
      )}
    </span>
  );
};
