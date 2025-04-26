import { memo, useState } from 'react';
import { Terminal, GitBranch, Repeat, Code2, ArrowRightLeft, Play, PanelLeft, Sparkles, ArrowUpDown, ArrowRight, HelpCircle, Wrench } from 'lucide-react';
import { Keyboard, Variable as VariableIcon, Braces, AlertTriangle, MessageSquare, ListTree, KeyRound, Type, SquareCode, CircleDashed } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Available node types for the sidebar
const nodeCategories = [
  {
    id: 'core',
    label: 'Core Elements',
    description: 'Essential building blocks',
    items: [
      { type: 'variable', label: 'Variable', icon: VariableIcon, description: 'Create and store a value in memory' },
      { type: 'print', label: 'Print', icon: Terminal, description: 'Show a value or message on the output' },
      { type: 'return', label: 'Return', icon: ArrowRight, description: 'Send a value back from a function' },
      { type: 'operation', label: 'Operation', icon: Wrench, description: 'Do math or logic with variables' },
    ],
  },
  {
    id: 'logic',
    label: 'Logic',
    description: 'Control the flow with conditions',
    items: [
      { type: 'ifBlock', label: 'If', icon: GitBranch, description: 'Run code only if a condition is true' },
      { type: 'elifBlock', label: 'Else If', icon: ListTree, description: 'Check another condition if previous is false' },
      { type: 'elseBlock', label: 'Else', icon: ArrowRightLeft, description: 'Run code if no conditions above are true' },
    ],
  },
  {
    id: 'loops',
    label: 'Loops',
    description: 'Repeat actions multiple times',
    items: [
      { type: 'forLoop', label: 'For Loop', icon: Repeat, description: 'Repeat code for each item or a number of times' },
    ],
  },
  {
    id: 'functions',
    label: 'Functions',
    description: 'Reusable code blocks',
    items: [
      { type: 'function', label: 'Define Function', icon: Code2, description: 'Create a named block of code to reuse' },
      { type: 'functionCall', label: 'Call Function', icon: Play, description: 'Run a function you have defined' },
    ],
  },
  {
    id: 'errorHandling',
    label: 'Error Handling',
    description: 'Handle problems in your code',
    items: [
      { type: 'tryBlock', label: 'Try', icon: Braces, description: 'Try code that might cause an error' },
      { type: 'exceptBlock', label: 'Catch Error', icon: AlertTriangle, description: 'Respond if an error happens' },
      { type: 'finallyBlock', label: 'Finally', icon: KeyRound, description: 'Always run this code, error or not' },
    ],
  },
  {
    id: 'annotations',
    label: 'Comments',
    description: 'Add notes to your code',
    items: [
      { type: 'comment', label: 'Comment', icon: MessageSquare, description: 'Write a note for yourself or others' },
    ],
  }
];

// Color map for categories (dark theme)
const categoryColors: Record<string, string> = {
  core: 'bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-200',
  logic: 'bg-green-200 text-green-900 dark:bg-green-900 dark:text-green-200',
  loops: 'bg-yellow-200 text-yellow-900 dark:bg-yellow-800 dark:text-yellow-100',
  functions: 'bg-purple-200 text-purple-900 dark:bg-purple-900 dark:text-purple-200',
  errorHandling: 'bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-200',
  annotations: 'bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-gray-200',
};

// Sidebar component
const Sidebar = memo(() => {
  const [collapsed, setCollapsed] = useState(false);
  
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const shortcuts: Record<string, string> = {
    'variable': 'V',
    'print': 'P',
    'ifBlock': 'I',
    'elifBlock': 'E',
    'elseBlock': 'L',
    'forLoop': 'F', 
    'function': 'U',
    'functionCall': 'C',
    'tryBlock': 'T',
    'exceptBlock': 'X',
    'finallyBlock': 'Y',
    'comment': 'A',
    'database': 'D',
    'operation': 'O',
    'return': 'R'
  };

  return (
    <div className={clsx(
      "flex flex-col h-full bg-background/95 backdrop-blur-md border-r-2 transition-all duration-300",
      collapsed ? "w-[56px]" : "w-[260px]"
    )}>
      {/* Header */}
      <div className="p-3 border-b-2 flex items-center justify-between bg-background/90">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/20">
              <SquareCode className="h-3.5 w-3.5 text-primary" />
            </div>
            <h2 className="text-sm font-semibold tracking-tight">Flow Elements</h2>
          </div>
        )}
        <div className="flex items-center gap-1">
          {!collapsed && (
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 w-7 p-0 rounded-md"
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="start">
                <div className="flex flex-col gap-2">
                  <div className="bg-background/70 backdrop-blur-xl rounded-lg border shadow-md overflow-hidden">
                    <div className="bg-primary/5 px-3 py-2 border-b flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded-lg bg-primary/10">
                          <Sparkles className="h-3 w-3 text-primary" />
                        </div>
                        <span className="font-medium text-xs">Quick Guide</span>
                      </div>
                    </div>
                    
                    <div className="p-3 space-y-2">
                      {/* Movement controls */}
                      <div className="rounded-lg bg-muted/40 p-2 space-y-2 backdrop-blur-sm">
                        <div className="flex items-center gap-2 group">
                          <div className="p-1.5 rounded-lg bg-primary/10 shadow-sm transition-all duration-300 group-hover:bg-primary/20">
                            <ArrowRightLeft className="h-3 w-3 text-primary transition-all duration-300 group-hover:scale-110" />
                          </div>
                          <div className="flex-1">
                            <span className="text-xs font-medium">Horizontal Movement</span>
                            <p className="text-[10px] text-muted-foreground">Affects indentation level</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 group">
                          <div className="p-1.5 rounded-lg bg-primary/10 shadow-sm transition-all duration-300 group-hover:bg-primary/20">
                            <ArrowUpDown className="h-3 w-3 text-primary transition-all duration-300 group-hover:scale-110" />
                          </div>
                          <div className="flex-1">
                            <span className="text-xs font-medium">Vertical Movement</span>
                            <p className="text-[10px] text-muted-foreground">Controls execution order</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Keyboard shortcuts */}
                      <div className="rounded-lg bg-muted/40 p-2 backdrop-blur-sm">
                        <div className="flex items-center gap-2 group">
                          <div className="p-1.5 rounded-lg bg-primary/10 shadow-sm transition-all duration-300 group-hover:bg-primary/20">
                            <Keyboard className="h-3 w-3 text-primary transition-all duration-300 group-hover:scale-110" />
                          </div>
                          <div className="flex-1">
                            <span className="text-xs font-medium">Keyboard Shortcuts</span>
                            <p className="text-[10px] text-muted-foreground">Press shortcut key to add node</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={clsx(
                    "h-7 w-7 p-0 rounded-md",
                    collapsed && "ml-auto"
                  )}
                  onClick={() => setCollapsed(!collapsed)}
                >
                  <PanelLeft className={clsx("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{collapsed ? "Expand sidebar" : "Collapse sidebar"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Node Categories */}
      <div className="flex-1 overflow-y-auto">
        {!collapsed ? (
          <Accordion type="multiple" className="w-full" defaultValue={nodeCategories.map(cat => cat.id)}>
            {/* Categories */}
            {nodeCategories.map((category) => (
              <AccordionItem key={category.id} value={category.id} className="border-b border-border/80">
                <AccordionTrigger className="py-2 px-3 text-sm hover:no-underline">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary/90"></div>
                    <span className="tracking-tight font-medium">{category.label}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3 pt-1">
                  <div className="grid grid-cols-2 gap-3">
                    {category.items.map((item) => {
                      const Icon = item.icon;
                      const shortcut = shortcuts[item.type];
                      const colorClass = categoryColors[category.id] || 'bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-gray-200';
                      return (
                        <div
                          key={item.type}
                          className={clsx(
                            "group/item relative flex flex-col items-center justify-between rounded-xl shadow-md cursor-grab transition-all duration-200 active:scale-95",
                            "p-4 bg-white/80 dark:bg-zinc-900/80 hover:bg-primary/10 dark:hover:bg-primary/20 border border-transparent hover:border-primary/40 dark:hover:border-primary/60 backdrop-blur-md min-h-[120px] min-w-0"
                          )}
                          draggable
                          onDragStart={(event) => onDragStart(event, item.type)}
                          title={`${item.label}: ${item.description}`}
                        >
                          <div className={clsx(
                            "flex items-center justify-center rounded-full mb-2",
                            "h-12 w-12",
                            colorClass,
                            "shadow-sm border border-white/20 dark:border-zinc-700"
                          )}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <span className="text-sm font-semibold text-foreground dark:text-zinc-100 text-center w-full truncate">{item.label}</span>
                          <span className="text-xs text-muted-foreground dark:text-zinc-400 mt-1 text-center w-full line-clamp-2">{item.description}</span>
                          {shortcut && (
                            <span className="absolute top-2 right-2 text-xs font-bold text-primary/80 dark:text-primary/60 bg-primary/10 dark:bg-primary/30 px-2 py-0.5 rounded-lg shadow">
                              {shortcut}
                            </span>
                          )}
                          <div className="absolute inset-0 rounded-xl ring-1 ring-transparent ring-offset-background transition-all group-hover/item:ring-primary/60 pointer-events-none" />
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="p-2 space-y-4">
            {nodeCategories.map((category) => (
              <div key={category.id} className="flex flex-col items-center space-y-2">
                {category.items.map((item) => {
                  const Icon = item.icon;
                  const shortcut = shortcuts[item.type];
                  const colorClass = categoryColors[category.id] || 'bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-gray-200';
                  return (
                    <TooltipProvider key={item.type}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={clsx(
                              "group/item relative flex flex-col items-center justify-center rounded-xl shadow-md cursor-grab transition-all duration-200 active:scale-95",
                              "p-2 w-[44px] h-[44px] bg-white/80 dark:bg-zinc-900/80 hover:bg-primary/10 dark:hover:bg-primary/20 border border-transparent hover:border-primary/40 dark:hover:border-primary/60 backdrop-blur-md"
                            )}
                            draggable
                            onDragStart={(event) => onDragStart(event, item.type)}
                          >
                            <div className={clsx(
                              "flex items-center justify-center rounded-full",
                              "h-8 w-8",
                              colorClass,
                              "shadow-sm border border-white/20 dark:border-zinc-700"
                            )}>
                              <Icon className="h-5 w-5" />
                            </div>
                            {shortcut && (
                              <span className="absolute top-1 right-1 text-xs font-bold text-primary/80 dark:text-primary/60 bg-primary/10 dark:bg-primary/30 px-1.5 py-0.5 rounded shadow">
                                {shortcut}
                              </span>
                            )}
                            <div className="absolute inset-0 rounded-xl ring-1 ring-transparent ring-offset-background transition-all group-hover/item:ring-primary/60 pointer-events-none" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="flex flex-col border-2 max-w-[200px] dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-100">
                          <span className="font-medium">{item.label}</span>
                          <span className="text-xs text-foreground/80 dark:text-zinc-400">{item.description}</span>
                          {shortcut && <span className="text-xs mt-1 font-medium text-primary/90 dark:text-primary/60">Shortcut: {shortcut}</span>}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

Sidebar.displayName = 'Sidebar'; 

export default Sidebar;