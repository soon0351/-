import React, { useEffect, useState } from 'react';
import { GeneratedPanel, PanelScript } from '../types';
import { Loader2, Download, Share2, RefreshCw, AlertCircle } from 'lucide-react';

interface Props {
  panels: GeneratedPanel[];
  script: PanelScript[];
  isGenerating: boolean;
  generateAllPanels: () => void;
  regenerateSinglePanel: (panelNum: number) => void;
}

export const StepResult: React.FC<Props> = ({ panels, script, isGenerating, generateAllPanels, regenerateSinglePanel }) => {
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    // Auto start generation if empty
    if (panels.length === 0 && !isGenerating && !hasStarted) {
      setHasStarted(true);
      generateAllPanels();
    }
  }, [panels.length, isGenerating, hasStarted, generateAllPanels]);

  const getPanelImage = (num: number) => panels.find(p => p.panelNumber === num)?.imageUrl;

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-slate-800">당신의 4컷 만화</h2>
        <p className="text-slate-500">완성된 만화를 확인하세요. 마음에 들지 않는 컷은 다시 그릴 수 있습니다.</p>
      </div>

      {/* Comic Strip Container */}
      <div className="bg-white shadow-2xl rounded-lg overflow-hidden border border-slate-200 flex flex-col divide-y-4 divide-slate-100">
        {script.map((panel) => {
          const imgSrc = getPanelImage(panel.panelNumber);
          
          return (
            <div key={panel.panelNumber} className="relative group bg-slate-50 min-h-[300px] md:min-h-[400px]">
              {/* Panel Content */}
              {imgSrc ? (
                <div className="relative w-full h-full">
                  <img src={imgSrc} alt={`Panel ${panel.panelNumber}`} className="w-full h-auto block" />
                  
                  {/* Hover Overlay for Regen */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => regenerateSinglePanel(panel.panelNumber)}
                      className="bg-white/90 hover:bg-white text-slate-700 p-2 rounded-full shadow-lg backdrop-blur-sm transition-transform hover:scale-110"
                      title="이 컷만 다시 생성"
                    >
                      <RefreshCw size={20} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full h-[400px] flex flex-col items-center justify-center text-slate-400 space-y-4">
                  {isGenerating ? (
                    <>
                      <Loader2 className="animate-spin text-indigo-500" size={48} />
                      <p className="font-medium text-slate-600 animate-pulse">드로잉 중...</p>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                       <AlertCircle size={32} />
                       <p>이미지 없음</p>
                       <button onClick={() => regenerateSinglePanel(panel.panelNumber)} className="text-indigo-600 underline">생성하기</button>
                    </div>
                  )}
                </div>
              )}

              {/* Dialogue Box (Overlay Style) */}
              <div className="bg-white border-t-2 border-slate-100 p-4">
                <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold">
                        {panel.panelNumber}
                    </span>
                    <p className="text-slate-800 font-medium font-serif leading-relaxed">
                        {panel.dialogue}
                    </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="sticky bottom-6 flex justify-center gap-4 z-20">
        <button 
          onClick={generateAllPanels}
          disabled={isGenerating}
          className="bg-white text-slate-700 border border-slate-300 px-6 py-3 rounded-full font-semibold shadow-lg hover:bg-slate-50 transition-all flex items-center gap-2"
        >
            <RefreshCw size={18} className={isGenerating ? "animate-spin" : ""} />
            전체 다시 그리기
        </button>
        <button className="bg-indigo-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:bg-indigo-700 hover:scale-105 transition-all flex items-center gap-2">
            <Download size={18} />
            저장하기
        </button>
      </div>
    </div>
  );
};