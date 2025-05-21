import { memo, useState, useMemo, useEffect, useRef } from 'react';
import { usePython } from 'react-py';
import { Code2, Terminal, Check, Copy, Download, Expand, Play, Loader2, Code, ChevronRight, ChevronDown, FileCode2, Pencil, AlertTriangle, MoreHorizontal, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '../ui/button';
import { useFlowStore } from '@/store/use-flow-store';
import clsx from 'clsx';
import { generateNodeCode } from './code-generation';
import { Input } from '../ui/input';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism-tomorrow.css';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const CodePanel = memo(() => {
  const { stdout, stderr, isLoading, runPython } = usePython();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'output'>('code');
  const [fileName, setFileName] = useState('code');
  const [isFileNameFocused, setIsFileNameFocused] = useState(false);
  const [isFileNameHovered, setIsFileNameHovered] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const { nodes, edges } = useFlowStore();
  const previewRef = useRef<HTMLElement>(null);
  const fullCodeRef = useRef<HTMLElement>(null);

  const generatedCode = useMemo(() => {
    return nodes
      .filter(node => !node.parentId) 
      .sort((a, b) => a.position.y - b.position.y)
      .map(node => generateNodeCode(node, edges, nodes))
      .join('\n');
  }, [nodes, edges]);

  // Highlight code with Prism whenever code changes or dialog opens
  useEffect(() => {
    if (previewRef.current) {
      Prism.highlightElement(previewRef.current);
    }
  }, [generatedCode, activeTab]);

  useEffect(() => {
    if (dialogOpen && fullCodeRef.current) {
      Prism.highlightElement(fullCodeRef.current);
    }
  }, [dialogOpen, generatedCode]);

  // Fixed handleRunCode function with proper error handling
  const handleRunCode = async () => {
    try {
      if (!generatedCode.trim()) {
        console.warn("No code to execute");
        return;
      }
      
      // Run the Python code
      await runPython(generatedCode);
      
      // Switch to output tab to show results
      setActiveTab('output');
    } catch (error) {
      console.error("Error executing code:", error);
      // Still switch to output tab to show error
      setActiveTab('output');
    }
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

  // Helper to highlight a single line with Prism
  const highlightLine = (line: string) => {
    // Prism.highlight expects a string and language
    return Prism.highlight(line, Prism.languages.python, 'python');
  };

  // Render code with line numbers, perfectly aligned
  const renderCodeWithNumbers = (code: string) => {
    const lines = code.split('\n');
    return (
      <div className="bg-zinc-950 rounded-md border border-zinc-800/50 overflow-x-auto">
        <div className="font-mono text-[13px]">
          {lines.map((line, idx) => (
            <div key={idx} className="flex min-h-[21px] group">
              {showLineNumbers && (
                <div className="select-none w-10 text-right pr-4 text-xs font-mono text-zinc-500 dark:text-zinc-400 border-r border-zinc-700/30 mr-4 flex items-center justify-end group-hover:text-primary transition-colors">
                  {idx + 1}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <pre className="m-0 p-0 leading-[21px] bg-transparent text-[13px] font-mono overflow-x-auto whitespace-pre"><code dangerouslySetInnerHTML={{ __html: highlightLine(line) }} /></pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const previewLength = 10;
  const shouldTruncate = generatedCode.split('\n').length > previewLength;
  const hasOutput = Boolean(stdout || stderr);
  const hasError = Boolean(stderr);
  
  // Get limited code for preview
  const limitedCode = useMemo(() => {
    if (!shouldTruncate) return generatedCode;
    return generatedCode.split('\n').slice(0, previewLength).join('\n');
  }, [generatedCode, previewLength, shouldTruncate]);

  return (
    <>
      {/* Compact Preview Card */}
      <div className="w-[32dvw] relative z-40 rounded-xl border border-border/80 shadow-lg bg-background/95 backdrop-blur-sm overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:border-primary/40">
        {/* Accent Top Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-primary via-purple-600 to-primary/70" />
        
        {/* Header Bar */}
        <div className="p-3 border-b border-border/50 flex items-center gap-3">
          {/* File Icon & Name */}
          <div className="flex items-center gap-2.5 flex-1">
            <div className={clsx(
              "flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 text-primary transition-all duration-200 ease-out",
              isFileNameFocused ? "bg-primary/20" : ""
            )}>
              <FileCode2 size={18} />
            </div>
            
            <div 
              className={clsx(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all duration-200 border",
                isFileNameFocused 
                  ? "border-primary/50 bg-primary/5 ring-1 ring-primary/10" 
                  : "border-border/60 hover:border-primary/20 hover:bg-muted/30"
              )}
              onMouseEnter={() => setIsFileNameHovered(true)}
              onMouseLeave={() => setIsFileNameHovered(false)}
            >
              <Input
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                onFocus={() => setIsFileNameFocused(true)}
                onBlur={() => setIsFileNameFocused(false)}
                className="h-5 text-sm w-[120px] bg-transparent border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 font-medium"
                placeholder="Untitled"
              />
              <span className="text-sm text-muted-foreground">.py</span>
              <Pencil 
                size={13} 
                className={clsx(
                  "text-muted-foreground transition-all duration-200 ease-in-out",
                  isFileNameHovered || isFileNameFocused ? "opacity-100" : "opacity-0"
                )}
              />
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-1">
            {/* Copy button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-md transition-all duration-200"
                    onClick={copyToClipboard}
                  >
                    {copied ? 
                      <Check className="h-3.5 w-3.5 text-primary" /> : 
                      <Copy className="h-3.5 w-3.5" />
                    }
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={5} className="text-xs">
                  {copied ? "Copied!" : "Copy code"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {/* Options dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-md transition-all duration-200"
                >
                  <Settings className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem 
                  onClick={() => setShowLineNumbers(!showLineNumbers)}
                  className="flex items-center justify-between cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Code className="h-3.5 w-3.5" />
                    <span>Line numbers</span>
                  </div>
                  {showLineNumbers && <Check className="h-3 w-3 text-primary" />}
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={downloadCode}
                  className="flex items-center gap-2 cursor-pointer text-xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => setDialogOpen(true)}
                  className="flex items-center gap-2 cursor-pointer text-xs"
                >
                  <Expand className="h-3.5 w-3.5" />
                  <span>Full screen</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Run button - Ensure onClick is properly set */}
            <Button
              variant={hasOutput ? (hasError ? "destructive" : "secondary") : "default"}
              size="sm"
              className={clsx(
                "h-7 px-2.5 rounded-md transition-all duration-200",
                !hasOutput && !hasError && "bg-primary hover:bg-primary/90 text-white"
              )}
              onClick={() => handleRunCode()}
              disabled={isLoading}
            >
              {isLoading ? 
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : 
                <Play className={clsx("h-3.5 w-3.5 mr-1", hasOutput && !hasError && "fill-primary")} />
              }
              <span className="text-xs font-medium">
                {isLoading ? "Running" : "Run"}
              </span>
            </Button>
          </div>
        </div>
        
        {/* Tabs Navigation */}
        <div className="border-b border-border/50 px-3">
          <div className="flex">
            <button
              className={clsx(
                "px-3 py-1.5 text-xs font-medium relative flex items-center gap-1.5 transition-all duration-200",
                activeTab === 'code' 
                  ? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setActiveTab('code')}
            >
              <Code2 size={12} />
              <span>Code</span>
            </button>
            <button
              className={clsx(
                "px-3 py-1.5 text-xs font-medium relative flex items-center gap-1.5 transition-all duration-200",
                activeTab === 'output' 
                  ? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setActiveTab('output')}
            >
              <Terminal size={12} />
              <span>Output</span>
              {hasOutput && activeTab !== 'output' && (
                <span className={clsx(
                  "w-1.5 h-1.5 rounded-full ml-1",
                  hasError ? "bg-destructive" : "bg-primary"
                )}></span>
              )}
            </button>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="max-h-[280px] bg-zinc-950/95 transition-all duration-200">
          <div className="overflow-auto max-h-[280px] scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            {activeTab === 'code' ? (
              <div className="p-3">
                {renderCodeWithNumbers(limitedCode)}
                {shouldTruncate && (
                  <Button
                    variant="ghost" 
                    className="w-full mt-2 h-7 text-xs text-primary/80 hover:text-primary hover:bg-primary/5"
                    onClick={() => setDialogOpen(true)}
                  >
                    <ChevronDown size={14} className="mr-1" />
                    <span>Show all {generatedCode.split('\n').length} lines</span>
                  </Button>
                )}
              </div>
            ) : (
              <div className="p-3">
                {hasOutput ? (
                  <div className="rounded-md border border-zinc-800/50 overflow-hidden">
                    {stdout && (
                      <div className="p-2.5 bg-zinc-900/60 border-b border-zinc-800/50">
                        <pre className="text-xs text-emerald-400 whitespace-pre-wrap font-mono">
                          {stdout}
                        </pre>
                      </div>
                    )}
                    {stderr && (
                      <div className="p-2.5 bg-red-950/30 border-t border-red-900/50">
                        <div className="flex items-center gap-1.5 mb-1.5 text-red-400 text-xs font-medium">
                          <AlertTriangle size={12} />
                          <span>Error</span>
                        </div>
                        <pre className="text-xs text-red-400 whitespace-pre-wrap font-mono">
                          {stderr}
                        </pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center rounded-md border border-dashed border-zinc-800/40 bg-zinc-900/30">
                    <Terminal size={18} className="mb-2 text-muted-foreground/60" />
                    <p className="text-xs font-medium text-muted-foreground/80">No output yet</p>
                    <p className="text-[10px] mt-1 text-muted-foreground/60">Run your code to see results</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full Code Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 rounded-lg overflow-hidden border bg-background/95 backdrop-blur-sm">
          {/* Dialog Header */}
          <div className="h-1 w-full bg-gradient-to-r from-primary via-purple-600 to-primary/70" />
          <div className="p-4 border-b">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileCode2 size={20} className="text-primary" />
                </div>
                <div className="flex-1">
                  <DialogTitle className="flex items-center mb-1">
                    <div 
                      className={clsx(
                        "flex items-center gap-1.5 px-3 py-1 rounded-md transition-all duration-200 border",
                        isFileNameFocused 
                          ? "border-primary/40 bg-primary/5" 
                          : "border-border hover:border-primary/20 hover:bg-muted/30"
                      )}
                      onMouseEnter={() => setIsFileNameHovered(true)}
                      onMouseLeave={() => setIsFileNameHovered(false)}
                    >
                      <Input
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        onFocus={() => setIsFileNameFocused(true)}
                        onBlur={() => setIsFileNameFocused(false)}
                        className="h-6 text-lg font-semibold bg-transparent border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 w-[180px]"
                        placeholder="Untitled"
                      />
                      <span className="text-lg text-muted-foreground">.py</span>
                      <Pencil 
                        size={14} 
                        className={clsx(
                          "text-muted-foreground transition-all duration-200",
                          isFileNameHovered || isFileNameFocused ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </div>
                  </DialogTitle>
                  <DialogDescription>
                    Generated Python code from your flow diagram
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>
          
          {/* Tabs Content */}
          <Tabs defaultValue="code" className="flex flex-col h-[calc(90vh-180px)]">
            <div className="px-4 pt-2 flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="code" className="flex items-center gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                  <Code2 size={14} />
                  <span>Code</span>
                </TabsTrigger>
                <TabsTrigger value="output" className="flex items-center gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                  <Terminal size={14} />
                  <span>Output</span>
                  {hasOutput && (
                    <span className={clsx(
                      "w-1.5 h-1.5 rounded-full ml-1",
                      hasError ? "bg-destructive" : "bg-primary"
                    )}></span>
                  )}
                </TabsTrigger>
              </TabsList>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                  onClick={copyToClipboard}
                >
                  {copied ? 
                    <Check size={14} className="text-primary" /> : 
                    <Copy size={14} />
                  }
                  {copied ? "Copied" : "Copy"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                  onClick={downloadCode}
                >
                  <Download size={14} />
                  Download
                </Button>
              </div>
            </div>
            
            <TabsContent value="code" className="flex-1 overflow-hidden m-4 mt-3 rounded-lg border">
              <div className="flex justify-between items-center p-2 bg-muted/30 border-b">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">Python</span>
                  <span className="text-xs text-muted-foreground px-1.5 py-0.5 rounded bg-muted/50">
                    {generatedCode.split('\n').length} lines
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setShowLineNumbers(!showLineNumbers)}
                >
                  <Code size={14} className={showLineNumbers ? "text-primary" : ""} />
                </Button>
              </div>
              <div className="overflow-auto h-[calc(90vh-280px)] scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                <div className="p-3 bg-zinc-950">
                  {renderCodeWithNumbers(generatedCode)}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="output" className="flex-1 overflow-hidden m-4 mt-3 rounded-lg border">
              <div className="flex justify-between items-center p-2 bg-muted/30 border-b">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">Execution Result</span>
                  {hasError && (
                    <span className="text-xs text-white px-1.5 py-0.5 rounded bg-destructive">
                      Error
                    </span>
                  )}
                </div>
                {hasOutput && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs hover:text-destructive"
                    onClick={() => runPython('')}
                  >
                    Clear
                  </Button>
                )}
              </div>
              <div className="overflow-auto h-[calc(90vh-280px)] p-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                {hasOutput ? (
                  <div className="rounded-md border border-zinc-800/50 overflow-hidden">
                    {stdout && (
                      <div className="p-3 bg-zinc-900/60">
                        <pre className="text-sm text-emerald-400 font-mono">{stdout}</pre>
                      </div>
                    )}
                    {stderr && (
                      <div className="p-3 bg-red-950/30 border-t border-red-900/50">
                        <div className="flex items-center gap-2 mb-2 text-red-400 font-medium text-sm">
                          <AlertTriangle size={14} />
                          <span>Error</span>
                        </div>
                        <pre className="text-sm text-red-400 font-mono">{stderr}</pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-10 rounded-md border border-dashed border-zinc-800/40">
                    <Terminal size={24} className="mb-3 text-muted-foreground/60" />
                    <p className="text-sm font-medium text-muted-foreground/80">No output yet</p>
                    <p className="text-xs mt-1 text-muted-foreground/60">Run your code to see results</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Footer with Run Button - Fix the onClick handler */}
          <div className="p-4 border-t flex justify-end">
            <Button
              onClick={() => handleRunCode()}
              disabled={isLoading}
              className={clsx(
                "flex items-center gap-2 transition-all duration-200",
                !isLoading && !hasError && "bg-primary hover:bg-primary/90 text-white"
              )}
              variant={hasError ? "destructive" : "default"}
            >
              {isLoading ? 
                <Loader2 className="h-4 w-4 animate-spin" /> : 
                <Play className="h-4 w-4" />
              }
              {isLoading ? 'Running...' : 'Run Code'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});

CodePanel.displayName = 'CodePanel'; 

export default CodePanel;