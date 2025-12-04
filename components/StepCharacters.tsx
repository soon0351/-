import React, { useEffect, useState } from 'react';
import { Character } from '../types';
import { Loader2, ArrowRight, RefreshCw, Wand2 } from 'lucide-react';

interface Props {
  characters: Character[];
  onGenerateImage: (character: Character) => Promise<void>;
  onNext: () => void;
  isAnalyzing: boolean;
}

export const StepCharacters: React.FC<Props> = ({ characters, onGenerateImage, onNext, isAnalyzing }) => {
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set());

  const handleGenerate = async (char: Character) => {
    if (generatingIds.has(char.id)) return;
    
    setGeneratingIds(prev => new Set(prev).add(char.id));
    try {
      await onGenerateImage(char);
    } finally {
      setGeneratingIds(prev => {
        const next = new Set(prev);
        next.delete(char.id);
        return next;
      });
    }
  };

  // Auto-generate images if not present (optional UX choice, lets keep it manual for control or auto trigger)
  // For this demo, we'll let user see the text descriptions first, then click generate.

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <Wand2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600" size={24} />
        </div>
        <p className="text-lg font-medium text-slate-600 animate-pulse">스크립트에서 등장인물을 분석 중입니다...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">등장인물 디자인</h2>
          <p className="text-slate-500">AI가 분석한 캐릭터들입니다. 이미지를 생성하여 시각화해보세요.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {characters.map((char) => (
          <div key={char.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="aspect-square bg-slate-100 relative flex items-center justify-center group">
              {char.imageUrl ? (
                <>
                  <img src={char.imageUrl} alt={char.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <button
                      onClick={() => handleGenerate(char)}
                      className="bg-white text-indigo-600 px-4 py-2 rounded-full font-medium flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
                    >
                      <RefreshCw size={16} /> 다시 그리기
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center p-6">
                   <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-300">
                      <UsersIcon size={40} />
                   </div>
                   <button
                    onClick={() => handleGenerate(char)}
                    disabled={generatingIds.has(char.id)}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-full font-medium shadow-lg hover:bg-indigo-700 disabled:opacity-50 transition-all"
                   >
                     {generatingIds.has(char.id) ? (
                       <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={16} /> 생성 중...</span>
                     ) : (
                       "이미지 생성"
                     )}
                   </button>
                </div>
              )}
            </div>
            <div className="p-5 flex-1 bg-white">
              <h3 className="font-bold text-lg text-slate-800 mb-1">{char.name}</h3>
              <p className="text-sm text-slate-500 leading-relaxed line-clamp-4 hover:line-clamp-none transition-all">
                {char.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-8">
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 shadow-md transition-all"
        >
          <span>최종 만화 생성하기</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

const UsersIcon = ({size}: {size:number}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);