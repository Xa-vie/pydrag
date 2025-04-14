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
      <div key={i} className="flex group">
        <span className="text-muted-foreground/60 w-8 text-right pr-2 select-none group-hover:text-muted-foreground transition-colors">{i + 1}</span>
        <span className="flex-1 group-hover:bg-muted/30 transition-colors rounded px-1">{line}</span>
      </div>
    ));
  };

  const previewLength = 10;
  const shouldTruncate = generatedCode.split('\n').length > previewLength;
  const hasOutput = Boolean(stdout || stderr);

  return (
    <>
      {/* Compact Preview Card */}
      <div className="w-80 bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg overflow-hidden">
        <div className="border-b bg-muted/80 px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <div className={clsx(
              "p-1.5 rounded-md transition-colors duration-200",
              isFileNameFocused ? "bg-primary/20" : "bg-primary/10"
            )}>
              <FileCode2 size={14} className={clsx(
                "transition-colors duration-200",
                isFileNameFocused ? "text-primary" : "text-primary/80"
              )} />
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className={clsx(
                      "flex items-center gap-1.5 px-2 py-1 rounded-md transition-all duration-200 flex-1 group cursor-text",
                      isFileNameFocused ? "bg-muted/80" : "hover:bg-muted/50"
                    )}
                    onMouseEnter={() => setIsFileNameHovered(true)}
                    onMouseLeave={() => setIsFileNameHovered(false)}
                  >
                    <Input
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      onFocus={() => setIsFileNameFocused(true)}
                      onBlur={() => setIsFileNameFocused(false)}
                      className="h-5 text-xs w-[100px] bg-transparent border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
                      placeholder="Untitled"
                    />
                    <Pencil 
                      size={12} 
                      className={clsx(
                        "text-muted-foreground/50 transition-opacity duration-200",
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
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-muted/50"
              onClick={copyToClipboard}
              title="Copy code"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-muted/50"
              onClick={downloadCode}
              title="Download code"
            >
              <Download className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-muted/50"
              onClick={() => setDialogOpen(true)}
              title="View full code"
            >
              <Expand className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={hasOutput ? "ghost" : "default"}
              size="sm"
              className={clsx(
                "h-7 w-7 p-0", 
                hasOutput ? "text-primary hover:bg-muted/50" : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
              onClick={handleRunCode}
              disabled={isLoading}
              title={isLoading ? "Running..." : "Run code"}
            >
              {isLoading 
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> 
                : <Play className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
        
        {/* Tabs for code and output */}
        <div className="border-b bg-muted/40 px-2 pt-1.5">
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
        <div className="max-h-60 overflow-auto">
          {activeTab === 'code' ? (
            <pre className="p-2 text-xs">
              <code className="font-mono">
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