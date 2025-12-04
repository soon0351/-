import React, { useState } from 'react';
import { PanelScript } from '../types';
import { RefreshCcw, ArrowRight, Edit2, Check, Loader2 } from 'lucide-react';

interface Props {
  script: PanelScript[];
  onUpdateScript: (newScript: PanelScript[]) => void;
  onNext: () => void;
  onRegenerate: () => void;
  isLoading: boolean;
}

export const StepScript: React.FC<Props> = ({ script, onUpdateScript, onNext, onRegenerate, isLoading }) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTemp, setEditTemp] = useState<PanelScript | null>(null);

  const startEdit = (panel: PanelScript) => {
    setEditingId(panel.panelNumber);
    setEditTemp({ ...panel });
  };

  const saveEdit = () => {
    if (editTemp) {
      const newScript = script.map(p => p.panelNumber === editTemp.panelNumber ? editTemp : p);
      onUpdateScript(newScript);
    }
    setEditingId(null);
    setEditTemp(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">스크립트 확인</h2>
          <p className="text-slate-500">AI가 생성한 4컷 만화의 구성을 확인하고 수정하세요.</p>
        </div>
        <button
          onClick={onRegenerate}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 text-sm text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="animate-spin" size={16} /> : <RefreshCcw size={16} />}
          다시 생성하기
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {script.map((panel) => (
          <div 
            key={panel.panelNumber} 
            className={`bg-white rounded-xl shadow-sm border transition-all p-5 relative ${
              editingId === panel.panelNumber ? 'ring-2 ring-indigo-500 border-transparent' : 'border-slate-200'
            }`}
          >
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500 rounded-l-xl" />
            
            <div className="flex justify-between items-start mb-3 pl-3">
              <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded">
                # {panel.panelNumber}컷
              </span>
              
              {editingId !== panel.panelNumber ? (
                <button 
                  onClick={() => startEdit(panel)}
                  className="text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  <Edit2 size={16} />
                </button>
              ) : (
                <button 
                  onClick={saveEdit}
                  className="text-green-500 hover:text-green-700 transition-colors"
                >
                  <Check size={20} />
                </button>
              )}
            </div>

            {editingId === panel.panelNumber && editTemp ? (
              <div className="space-y-3 pl-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">장면 묘사</label>
                  <textarea
                    value={editTemp.description}
                    onChange={(e) => setEditTemp({...editTemp, description: e.target.value})}
                    className="w-full p-2 mt-1 border rounded text-sm"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">대사</label>
                  <textarea
                    value={editTemp.dialogue}
                    onChange={(e) => setEditTemp({...editTemp, dialogue: e.target.value})}
                    className="w-full p-2 mt-1 border rounded text-sm"
                    rows={2}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2 pl-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{panel.description}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg mt-2">
                  <p className="text-sm text-slate-600 italic">" {panel.dialogue} "</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={onNext}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 shadow-md transition-all disabled:opacity-50"
        >
          <span>캐릭터 생성하기</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};