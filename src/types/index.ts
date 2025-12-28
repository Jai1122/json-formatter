export interface ValidationResult {
  isValid: boolean;
  error?: string;
  line?: number;
  column?: number;
}

export interface JSONNode {
  key: string;
  value: any;
  type: string;
  path: string;
  isExpanded?: boolean;
  children?: JSONNode[];
}

export type ViewMode = 'editor' | 'tree' | 'split' | 'diff';
