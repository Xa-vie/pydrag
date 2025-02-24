export interface CodeSnippet {
  id: string;
  type: string;
  label: string;
  description: string;
  icon?: React.ReactNode;
  initialData: Record<string, any>;
}

export interface SnippetsStructure {
  [category: string]: CodeSnippet[];
} 