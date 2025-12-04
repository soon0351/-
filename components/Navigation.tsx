import React from 'react';
import { Check, PenTool, Users, BookOpen, Image as ImageIcon } from 'lucide-react';
import { AppStep } from '../types';

interface NavigationProps {
  currentStep: AppStep;
  setStep: (step: AppStep) => void;
  maxStepReached: number;
}

const steps = [
  { id: AppStep.TOPIC, label: '주제 선택', icon: PenTool },
  { id: AppStep.SCRIPT, label: '스크립트', icon: BookOpen },
  { id: AppStep.CHARACTERS, label: '등장인물', icon: Users },
  { id: AppStep.FINAL, label: '만화 생성', icon: ImageIcon },
];

export const Navigation: React.FC<NavigationProps> = ({ currentStep, setStep, maxStepReached }) => {
  return (
    <div className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 py-4 px-6 shadow-sm">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = maxStepReached > step.id;
            const isClickable = maxStepReached >= step.id;

            return (
              <div key={step.id} className="flex items-center flex-1 last:flex-none group">
                <button
                  onClick={() => isClickable && setStep(step.id)}
                  disabled={!isClickable}
                  className={`flex flex-col items-center relative z-10 ${
                    isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                      isActive
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg scale-110'
                        : isCompleted
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'bg-white border-slate-300 text-slate-400 group-hover:border-slate-400'
                    }`}
                  >
                    {isCompleted && !isActive ? <Check size={20} /> : <Icon size={20} />}
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium transition-colors ${
                      isActive ? 'text-indigo-700' : 'text-slate-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </button>
                
                {index < steps.length - 1 && (
                  <div className="flex-1 h-0.5 mx-4 bg-slate-200 relative">
                    <div 
                      className="absolute top-0 left-0 h-full bg-green-500 transition-all duration-500"
                      style={{ width: maxStepReached > index ? '100%' : '0%' }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};