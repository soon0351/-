import React from 'react';
import { ComicConfig } from '../types';
import { GENRES, ART_STYLES, BEGINNER_TEMPLATES } from '../constants';
import { Sparkles, ArrowRight } from 'lucide-react';

interface Props {
  config: ComicConfig;
  onChange: (newConfig: ComicConfig) => void;
  onNext: () => void;
}

export const StepTopic: React.FC<Props> = ({ config, onChange, onNext }) => {
  
  const handleTemplateClick = (template: typeof BEGINNER_TEMPLATES[0]) => {
    onChange({
      topic: template.title,
      genre: template.genre,
      style: template.style,
      storyPrompt: template.prompt
    });
  };

  const isReady = config.topic && config.genre && config.style && config.storyPrompt;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-slate-800">어떤 웹툰을 그릴까요?</h2>
        <p className="text-slate-500">주제, 장르, 스타일을 선택하거나 템플릿을 이용해보세요.</p>
      </div>

      {/* Beginner Templates */}
      <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
        <div className="flex items-center gap-2 mb-4 text-indigo-800 font-semibold">
          <Sparkles size={18} />
          <span>초보자용 퀵 스타트 (클릭하여 자동완성)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {BEGINNER_TEMPLATES.map((tpl, idx) => (
            <button
              key={idx}
              onClick={() => handleTemplateClick(tpl)}
              className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md border border-indigo-100 text-left transition-all hover:-translate-y-1"
            >
              <h4 className="font-bold text-indigo-600">{tpl.title}</h4>
              <p className="text-xs text-slate-500 mt-1">{tpl.genre} / {tpl.style}</p>
              <p className="text-sm text-slate-700 mt-2 line-clamp-2">{tpl.prompt}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
        {/* Topic Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">웹툰 제목 (주제)</label>
          <input
            type="text"
            value={config.topic}
            onChange={(e) => onChange({ ...config, topic: e.target.value })}
            placeholder="예: 좌충우돌 AI 개발기"
            className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Genre Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">만화 장르</label>
            <select
              value={config.genre}
              onChange={(e) => onChange({ ...config, genre: e.target.value })}
              className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            >
              <option value="">장르를 선택하세요</option>
              {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          {/* Style Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">그림 스타일</label>
            <select
              value={config.style}
              onChange={(e) => onChange({ ...config, style: e.target.value })}
              className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            >
              <option value="">스타일을 선택하세요</option>
              {ART_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Story Box */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">스토리 박스 (줄거리)</label>
          <textarea
            value={config.storyPrompt}
            onChange={(e) => onChange({ ...config, storyPrompt: e.target.value })}
            placeholder="4컷 만화에 들어갈 내용을 자유롭게 적어주세요. 구체적일수록 좋습니다!"
            className="w-full h-32 p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
          />
        </div>

        <div className="pt-4 flex justify-end">
          <button
            onClick={onNext}
            disabled={!isReady}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              isReady
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>스크립트 생성하기</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};