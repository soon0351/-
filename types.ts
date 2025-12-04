export enum AppStep {
  TOPIC = 0,
  SCRIPT = 1,
  CHARACTERS = 2,
  FINAL = 3
}

export interface ComicConfig {
  topic: string;
  style: string;
  genre: string;
  storyPrompt: string;
}

export interface PanelScript {
  panelNumber: number;
  description: string;
  dialogue: string;
}

export interface Character {
  id: string;
  name: string;
  description: string; // Visual description
  imageUrl?: string;
}

export interface GeneratedPanel {
  panelNumber: number;
  imageUrl: string;
}

export interface ProjectState {
  step: AppStep;
  config: ComicConfig;
  script: PanelScript[];
  characters: Character[];
  panels: GeneratedPanel[];
  isGenerating: boolean;
}