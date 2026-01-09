
export interface GenerationResult {
  imageUrl: string;
  name: string;
  timestamp: number;
}

export enum AppStatus {
  IDLE = 'idle',
  GENERATING = 'generating',
  SUCCESS = 'success',
  ERROR = 'error'
}
