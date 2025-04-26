import { memo, useState, useMemo } from 'react';
import { usePython } from 'react-py';
import { Code2, Terminal, Check, Copy, Download, Expand, Play, Loader2, Code, ChevronRight, ChevronDown, FileCode2, Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '../ui/button';
import { useFlowStore } from '@/store/use-flow-store';
import clsx from 'clsx';
import { generateNodeCode } from './code-generation';
import { Input } from '../ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const CodePanel = memo(() => {
  const { stdout, stderr, isLoading, runPython } = usePython();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'output'>('code');
  const [fileName, setFileName] = useState('code');
  const [isFileNameFocused, setIsFileNameFocused] = useState(false);
  const [isFileNameHovered, setIsFileNameHovered] = useState(false);
  const { nodes, edges } = useFlowStore();

  const generatedCode = useMemo(() => {
    return nodes
      .filter(node => !node.parentId) 
      .sort((a, b) => a.position.y - b.position.y)
      .map(node => generateNodeCode(node, edges, nodes))
      .join('\n');
  }, [nodes, edges]);

  const handleRunCode = async () => {
    await runPython(generatedCode);
    setActiveTab('output');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    const blob = new Blob([generatedCode], { type: 'text/python' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.py`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderCodePreview = (code: string, limit = 0) => {
    const lines = code.split('\n');
    const limitedLines = limit ? lines.slice(0, limit) : lines;
    
    return limitedLines.map((line, i) => (
      <div key={i} className="flex group items-center">
        <span className="w-10 text-right pr-3 select-none font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-fuchsia-500 group-hover:from-fuchsia-500 group-hover:to-primary transition-colors">
          {i + 1}
        </span>
        <span className="flex-1 group-hover:bg-primary/10 transition-colors rounded px-1 font-mono text-[13px]">{line}</span>
      </div>
    ));
  };

  const previewLength = 10;
  const shouldTruncate = generatedCode.split('\n').length > previewLength;
  const hasOutput = Boolean(stdout || stderr);

  return (
    <>
      {/* Compact Preview Card */}
      <div className="w-80 relative overflow-hidden rounded-2xl border border-border shadow-lg shadow-primary/20 bg-background/80 backdrop-blur-xl transition-all duration-300 hover:scale-[1.01]">
        {/* Animated Accent Bar */}
        <div className="absolute left-0 top-0 h-full w-2 bg-gradient-to-b from-primary via-fuchsia-500 to-cyan-400 animate-gradient-y z-10" />
        <div className="relative z-20 p-4 border-b border-border bg-gradient-to-r from-primary/20 via-background/80 to-background/60 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className={clsx(
              "flex items-center justify-center h-9 w-9 rounded-xl bg-primary/90 text-white shadow-lg transition-transform duration-200 hover:scale-110",
              isFileNameFocused ? "ring-2 ring-primary/40" : ""
            )}>
              <FileCode2 size={22} />
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className={clsx(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 flex-1 group cursor-text bg-background/60 border border-border/60",
                      isFileNameFocused ? "ring-2 ring-primary/30" : "hover:bg-background/80"
                    )}
                    onMouseEnter={() => setIsFileNameHovered(true)}
                    onMouseLeave={() => setIsFileNameHovered(false)}
                  >
                    <Input
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      onFocus={() => setIsFileNameFocused(true)}
                      onBlur={() => setIsFileNameFocused(false)}
                      className="h-6 text-sm w-[120px] bg-transparent border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50 font-semibold"
                      placeholder="Untitled"
                    />
                    <Pencil 
                      size={14} 
                      className={clsx(
                        "text-primary/80 transition-opacity duration-200",
                        isFileNameHovered || isFileNameFocused ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  Click to rename file
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full shadow transition hover:bg-primary/20"
              onClick={copyToClipboard}
              title="Copy code"
            >
              {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full shadow transition hover:bg-primary/20"
              onClick={downloadCode}
              title="Download code"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full shadow transition hover:bg-primary/20"
              onClick={() => setDialogOpen(true)}
              title="View full code"
            >
              <Expand className="h-4 w-4" />
            </Button>
            <Button
              variant={hasOutput ? "ghost" : "default"}
              size="icon"
              className={clsx(
                "h-9 w-9 rounded-full shadow transition",
                hasOutput ? "text-primary hover:bg-primary/20" : "bg-gradient-to-tr from-primary to-fuchsia-500 text-white hover:from-primary/90 hover:to-fuchsia-400"
              )}
              onClick={handleRunCode}
              disabled={isLoading}
              title={isLoading ? "Running..." : "Run code"}
            >
              {isLoading 
                ? <Loader2 className="h-4 w-4 animate-spin" /> 
                : <Play className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        {/* Tabs for code and output */}
        <div className="border-b bg-background/60 px-2 pt-2 relative z-20">
          <div className="flex gap-1">
            <button
              className={clsx(
                "px-3 pb-1.5 text-xs rounded-t-md relative flex items-center gap-1.5",
                activeTab === 'code' 
                  ? "text-primary font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary after:rounded-full"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setActiveTab('code')}
            >
              <Code2 size={12} />
              <span>Code</span>
            </button>
            <button
              className={clsx(
                "px-3 pb-1.5 text-xs rounded-t-md flex items-center gap-1.5 relative",
                activeTab === 'output' 
                  ? "text-primary font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary after:rounded-full"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setActiveTab('output')}
            >
              <Terminal size={12} />
              <span>Output</span>
              {hasOutput && activeTab !== 'output' && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary/80 animate-pulse"></span>
              )}
            </button>
          </div>
        </div>
        
        {/* Content area */}
        <div className="max-h-60 overflow-auto bg-zinc-900/80 dark:bg-zinc-900/90 border-x border-b border-zinc-800/40 rounded-b-2xl relative z-20">
          {activeTab === 'code' ? (
            <pre className="p-3 text-sm font-mono leading-relaxed">
              <code className="block">
                {renderCodePreview(generatedCode, previewLength)}
                {shouldTruncate && (
                  <div 
                    className="text-primary text-xs mt-1 cursor-pointer hover:underline flex items-center gap-1" 
                    onClick={() => setDialogOpen(true)}
                  >
                    <ChevronDown size={12} />
                    View full code ({generatedCode.split('\n').length - previewLength} more lines)
                  </div>
                )}
              </code>
            </pre>
          ) : (
            <div className="p-2">
              {hasOutput ? (
                <>
                  {stdout && (
                    <pre className="text-xs text-green-600 dark:text-green-400 whitespace-pre-wrap mb-2">
                      {stdout}
                    </pre>
                  )}
                  {stderr && (
                    <pre className="text-xs text-red-600 dark:text-red-400 whitespace-pre-wrap">
                      {stderr}
                    </pre>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                  <Terminal size={20} className="mb-2 opacity-60" />
                  <p className="text-xs">No output yet</p>
                  <p className="text-[10px] mt-1">Click Run to execute your code</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Full Code Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className={clsx(
                "p-2 rounded-md transition-colors duration-200",
                isFileNameFocused ? "bg-primary/20" : "bg-primary/10"
              )}>
                <FileCode2 size={18} className={clsx(
                  "transition-colors duration-200",
                  isFileNameFocused ? "text-primary" : "text-primary/80"
                )} />
              </div>
              <div className="flex-1">
                <DialogTitle>
                  <div 
                    className={clsx(
                      "flex items-center gap-2 px-3 py-1.5 rounded-md w-fit transition-all duration-200 group",
                      isFileNameFocused ? "bg-muted" : "hover:bg-muted/50"
                    )}
                    onMouseEnter={() => setIsFileNameHovered(true)}
                    onMouseLeave={() => setIsFileNameHovered(false)}
                  >
                    <Input
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      onFocus={() => setIsFileNameFocused(true)}
                      onBlur={() => setIsFileNameFocused(false)}
                      className="h-7 text-lg font-semibold w-[200px] bg-transparent border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
                      placeholder="Untitled"
                    />
                    <span className="text-lg font-medium text-muted-foreground/70">.py</span>
                    <Pencil 
                      size={14} 
                      className={clsx(
                        "text-muted-foreground/50 transition-opacity duration-200",
                        isFileNameHovered || isFileNameFocused ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </div>
                </DialogTitle>
                <DialogDescription className="mt-1.5">Generated from your flow diagram</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <Tabs defaultValue="code" className="flex-1 overflow-hidden">
            <TabsList className="mb-2">
              <TabsTrigger value="code" className="flex items-center gap-1.5">
                <Code2 size={14} />
                <span>Code</span>
              </TabsTrigger>
              <TabsTrigger value="output" className="flex items-center gap-1.5">
                <Terminal size={14} />
                <span>Output</span>
                {hasOutput && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="code" className="flex-1 overflow-hidden mt-0 border rounded-lg">
              <div className="flex justify-between items-center p-2 border-b bg-muted/30">
                <span className="text-sm font-medium">Python ({generatedCode.split('\n').length} lines)</span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:bg-muted/50"
                    onClick={copyToClipboard}
                  >
                    {copied ? <Check size={14} className="text-primary" /> : <Copy size={14} />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:bg-muted/50"
                    onClick={downloadCode}
                  >
                    <Download size={14} />
                  </Button>
                </div>
              </div>
              <div className="overflow-auto max-h-[calc(90vh-220px)]">
                <pre className="p-4 bg-[#1e1e1e] text-white h-full">
                  <code className="block font-mono text-sm whitespace-pre">
                    {renderCodePreview(generatedCode)}
                  </code>
                </pre>
              </div>
            </TabsContent>
            
            <TabsContent value="output" className="flex-1 overflow-hidden mt-0 border rounded-lg">
              <div className="flex justify-between items-center p-2 border-b">
                <span className="text-sm font-medium">Execution Result</span>
                {hasOutput && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs hover:bg-muted/50"
                    onClick={() => runPython('')}
                  >
                    Clear
                  </Button>
                )}
              </div>
              <div className="p-4 overflow-auto max-h-[calc(90vh-220px)]">
                {hasOutput ? (
                  <>
                    {stdout && <pre className="text-sm text-green-500/90 mb-2">{stdout}</pre>}
                    {stderr && <pre className="text-sm text-red-500/90">{stderr}</pre>}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
                    <Terminal size={24} className="mb-2 opacity-50" />
                    <p className="text-sm">No output yet</p>
                    <p className="text-xs">Run your code to see the results</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button
              onClick={handleRunCode}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play size={16} />}
              {isLoading ? 'Running...' : 'Run Code'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
});

CodePanel.displayName = 'CodePanel'; 

export default CodePanel;