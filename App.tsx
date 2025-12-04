import React, { useState, useCallback } from 'react';
import { ProjectState, AppStep, ComicConfig, PanelScript, Character, GeneratedPanel } from './types';
import { Navigation } from './components/Navigation';
import { StepTopic } from './components/StepTopic';
import { StepScript } from './components/StepScript';
import { StepCharacters } from './components/StepCharacters';
import { StepResult } from './components/StepResult';
import * as geminiService from './services/geminiService';
import { Loader2 } from 'lucide-react';

const INITIAL_STATE: ProjectState = {
  step: AppStep.TOPIC,
  config: { topic: '', style: '', genre: '', storyPrompt: '' },
  script: [],
  characters: [],
  panels: [],
  isGenerating: false
};

export default function App() {
  const [project, setProject] = useState<ProjectState>(INITIAL_STATE);
  const [maxStepReached, setMaxStepReached] = useState(AppStep.TOPIC);
  const [loadingMessage, setLoadingMessage] = useState("");

  const setStep = (step: AppStep) => {
    setProject(prev => ({ ...prev, step }));
  };

  const updateMaxStep = (step: AppStep) => {
    setMaxStepReached(prev => Math.max(prev, step));
  };

  // --- Actions ---

  // Step 1 -> 2: Generate Script
  const handleGenerateScript = async () => {
    setProject(prev => ({ ...prev, isGenerating: true }));
    setLoadingMessage("AI가 재미있는 스토리를 구상하고 있습니다...");
    
    try {
      const script = await geminiService.generateScript(
        project.config.topic,
        project.config.genre,
        project.config.storyPrompt
      );
      setProject(prev => ({ ...prev, script, step: AppStep.SCRIPT, isGenerating: false }));
      updateMaxStep(AppStep.SCRIPT);
    } catch (e) {
      alert("스크립트 생성 실패. 다시 시도해주세요.");
      setProject(prev => ({ ...prev, isGenerating: false }));
    }
  };

  const updateScript = (newScript: PanelScript[]) => {
    setProject(prev => ({ ...prev, script: newScript }));
  };

  // Step 2 -> 3: Analyze Characters
  const handleAnalyzeCharacters = async () => {
    setProject(prev => ({ ...prev, isGenerating: true }));
    setLoadingMessage("등장인물의 특징을 분석하고 있습니다...");

    try {
      const rawChars = await geminiService.analyzeCharacters(project.script);
      // Preserve existing images if re-analyzing same characters (simple check by name)
      const mergedChars = rawChars.map(nc => {
        const existing = project.characters.find(oc => oc.name === nc.name);
        return existing ? { ...nc, imageUrl: existing.imageUrl, id: existing.id } : { ...nc, imageUrl: undefined } as Character;
      });

      setProject(prev => ({ ...prev, characters: mergedChars, step: AppStep.CHARACTERS, isGenerating: false }));
      updateMaxStep(AppStep.CHARACTERS);
    } catch (e) {
      alert("캐릭터 분석 실패.");
      setProject(prev => ({ ...prev, isGenerating: false }));
    }
  };

  // Step 3: Generate Character Image
  const handleGenerateCharacterImage = async (char: Character) => {
    try {
      const imageUrl = await geminiService.generateCharacterImage(char, project.config.style);
      setProject(prev => ({
        ...prev,
        characters: prev.characters.map(c => c.id === char.id ? { ...c, imageUrl } : c)
      }));
    } catch (e) {
      console.error(e);
      alert(`${char.name} 이미지 생성 실패. 잠시 후 다시 시도하거나 설명을 수정해주세요.`);
    }
  };

  const handleGoToFinal = () => {
    setProject(prev => ({ ...prev, step: AppStep.FINAL }));
    updateMaxStep(AppStep.FINAL);
  };

  // Step 4: Generate Panels
  const generateSinglePanel = async (panelNum: number) => {
    const panelData = project.script.find(p => p.panelNumber === panelNum);
    if (!panelData) return;

    try {
      const imageUrl = await geminiService.generatePanelImage(panelData, project.config.style, project.characters);
      setProject(prev => {
         const existing = prev.panels.filter(p => p.panelNumber !== panelNum);
         return { ...prev, panels: [...existing, { panelNumber: panelNum, imageUrl }].sort((a,b) => a.panelNumber - b.panelNumber) };
      });
    } catch (e) {
      console.error(e);
      // Optional: alert user or show error state in UI
    }
  };

  const generateAllPanels = async () => {
    setProject(prev => ({ ...prev, isGenerating: true }));
    
    const promises = project.script.map(p => generateSinglePanel(p.panelNumber));
    await Promise.allSettled(promises);
    
    setProject(prev => ({ ...prev, isGenerating: false }));
  };


  // --- Render ---

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <Navigation 
        currentStep={project.step} 
        setStep={setStep} 
        maxStepReached={maxStepReached} 
      />

      <main className="flex-1 w-full pb-10">
        <div className="max-w-7xl mx-auto px-4 py-8">
          
          {/* Global Loading Overlay */}
          {project.isGenerating && project.step !== AppStep.FINAL && (
            <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
              <div className="bg-white p-8 rounded-2xl shadow-2xl border border-indigo-100 flex flex-col items-center max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">AI 작업 중</h3>
                <p className="text-center text-slate-600">{loadingMessage}</p>
              </div>
            </div>
          )}

          {project.step === AppStep.TOPIC && (
            <StepTopic 
              config={project.config} 
              onChange={(cfg) => setProject(prev => ({ ...prev, config: cfg }))}
              onNext={handleGenerateScript}
            />
          )}

          {project.step === AppStep.SCRIPT && (
            <StepScript
              script={project.script}
              onUpdateScript={updateScript}
              onNext={handleAnalyzeCharacters}
              onRegenerate={handleGenerateScript}
              isLoading={project.isGenerating}
            />
          )}

          {project.step === AppStep.CHARACTERS && (
            <StepCharacters
              characters={project.characters}
              onGenerateImage={handleGenerateCharacterImage}
              onNext={handleGoToFinal}
              isAnalyzing={project.isGenerating}
            />
          )}

          {project.step === AppStep.FINAL && (
            <StepResult
              panels={project.panels}
              script={project.script}
              isGenerating={project.isGenerating}
              generateAllPanels={generateAllPanels}
              regenerateSinglePanel={(num) => {
                 setProject(prev => ({...prev, isGenerating: true}));
                 generateSinglePanel(num).finally(() => setProject(prev => ({...prev, isGenerating: false})));
              }}
            />
          )}

        </div>
      </main>
    </div>
  );
}