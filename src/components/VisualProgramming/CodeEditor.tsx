import { memo } from 'react';
import { Editor } from '@monaco-editor/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Loader2, Code2, Copy, Download } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface CodeEditorProps {
  code: string;
}

const CodeEditor = memo(({ code }: CodeEditorProps) => {
  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-lg overflow-hidden">

      {/* Editor Section */}
      <CardContent className="flex-1 p-0 overflow-hidden bg-[#1E1E1E]">
        <div className="h-full">
          <Editor
            height="100%"
            defaultLanguage="python"
            theme="vs-dark"
            value={code}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              readOnly: true,
              wordWrap: 'on',
              padding: { top: 16, bottom: 16 },
              scrollBeyondLastLine: false,
              renderLineHighlight: 'all',
              fontFamily: 'JetBrains Mono, monospace',
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              formatOnPaste: true,
              formatOnType: true,
            }}
          />
        </div>
      </CardContent>
    </div>
  );
});

CodeEditor.displayName = 'CodeEditor';

export default CodeEditor; 