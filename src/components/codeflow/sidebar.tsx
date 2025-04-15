import { memo, useState } from 'react';
import { Terminal, GitBranch, Repeat, Code2, ArrowRightLeft, Play, PanelLeft, Sparkles, ArrowUpDown, ArrowRight, HelpCircle, Wrench } from 'lucide-react';
import { Keyboard, Variable as VariableIcon, Braces, AlertTriangle, MessageSquare, ListTree, KeyRound, Type, SquareCode, CircleDashed } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Available node types for the sidebar
const nodeCategories = [
  {
    id: 'core',
    label: 'Core Elements',
    description: 'Essential building blocks',
    items: [
      { type: 'variable', label: 'Variable', icon: VariableIcon, description: 'Define and store data values' },
      { type: 'print', label: 'Output', icon: Terminal, description: 'Display values and messages' },
      { type: 'return', label: 'Return', icon: ArrowRight, description: 'Return a value from a function' },
      { type: 'operation', label: 'Operation', icon: Wrench, description: 'Perform operations on variables' },
    ],
  },
  {
    id: 'logic',
    label: 'Logic',
    description: 'Conditional flow control',
    items: [
      { type: 'ifBlock', label: 'Condition', icon: GitBranch, description: 'Create conditional logic branches' },
      { type: 'elifBlock', label: 'Alternate', icon: ListTree, description: 'Add alternative conditions' },
      { type: 'elseBlock', label: 'Default', icon: ArrowRightLeft, description: 'Fallback path for conditions' },
    ],
  },
  {
    id: 'loops',
    label: 'Loops',
    description: 'Iteration structures',
    items: [
      { type: 'forLoop', label: 'Loop', icon: Repeat, description: 'Repeat operations multiple times' },
    ],
  },
  {
    id: 'functions',
    label: 'Functions',
    description: 'Reusable code blocks',
    items: [
      { type: 'function', label: 'Define', icon: Code2, description: 'Create reusable functions' },
      { type: 'functionCall', label: 'Call', icon: Play, description: 'Execute a defined function' },
    ],
  },
  {
    id: 'errorHandling',
    label: 'Error Handling',
    description: 'Manage exceptions',
    items: [
      { type: 'tryBlock', label: 'Try', icon: Braces, description: 'Attempt code that might fail' },
      { type: 'exceptBlock', label: 'Except', icon: AlertTriangle, description: 'Handle specific errors' },
      { type: 'finallyBlock', label: 'Finally', icon: KeyRound, description: 'Always execute cleanup code' },
    ],
  },
  {
    id: 'annotations',
    label: 'Comments',
    description: 'Documentation elements',
    items: [
      { type: 'comment', label: 'Comment', icon: MessageSquare, description: 'Add notes and documentation' },
    ],
  }
];

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
    'operation': 'O'
  };

  return (
    <div className={clsx(
      "flex flex-col h-full bg-background/95 backdrop-blur-md border-r transition-all duration-300",
      collapsed ? "w-[56px]" : "w-[260px]"
    )}>
      {/* Header */}
      <div className="p-3 border-b flex items-center justify-between bg-background/80">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
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
        </div>
      </div>

      {/* Node Categories */}
      <div className="flex-1 overflow-y-auto">
        {!collapsed ? (
          <Accordion type="multiple" className="w-full" defaultValue={nodeCategories.map(cat => cat.id)}>
            {/* Categories */}
            {nodeCategories.map((category) => (
              <AccordionItem key={category.id} value={category.id} className="border-b border-border/60">
                <AccordionTrigger className="py-2 px-3 text-sm hover:no-underline">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary/70"></div>
                    <span className="tracking-tight font-medium">{category.label}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3 pt-1">
                  <div className="grid grid-cols-2 gap-1.5">
                    {category.items.map((item) => {
                      const Icon = item.icon;
                      const shortcut = shortcuts[item.type];
                      
                      return (
                        <div
                          key={item.type}
                          className={clsx(
                            "group/item relative flex flex-col items-center justify-center rounded-md border cursor-grab transition-all duration-200 active:scale-[0.98]",
                            "p-2.5 bg-background hover:border-border",
                            "hover:bg-accent/20 hover:shadow-md",
                          )}
                          draggable
                          onDragStart={(event) => onDragStart(event, item.type)}
                          title={`${item.label} ${shortcut ? `(${shortcut})` : ''}: ${item.description}`}
                        >
                          <div className={clsx(
                            "flex shrink-0 items-center justify-center rounded-md",
                            "p-2 mb-1.5",
                            "bg-primary/10 transition-colors group-hover/item:bg-primary/20"
                          )}>
                            <Icon className={clsx(
                              "h-4 w-4",
                              "text-primary/80 group-hover/item:text-primary transition-colors"
                            )} />
                          </div>
                          <p className="text-xs tracking-tight font-medium text-center text-muted-foreground/90 group-hover/item:text-foreground transition-colors">
                            {item.label}
                          </p>
                          {shortcut && (
                            <div className={clsx(
                              "absolute text-[10px] tracking-wide font-medium text-muted-foreground/90 bg-muted/80 backdrop-blur-sm px-1.5 py-0.5 rounded-sm shadow-sm transition-all",
                              "top-1 right-1"
                            )}>
                              {shortcut}
                            </div>
                          )}
                          <div className="absolute inset-0 rounded-md ring-1 ring-transparent ring-offset-background transition-all group-hover/item:ring-primary/40" />
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
                  
                  return (
                    <div
                      key={item.type}
                      className={clsx(
                        "group/item relative flex flex-col items-center justify-center rounded-md border cursor-grab transition-all duration-200 active:scale-[0.98]",
                        "p-2 w-[40px] h-[40px]",
                        "hover:bg-accent/20 hover:shadow-md",
                      )}
                      draggable
                      onDragStart={(event) => onDragStart(event, item.type)}
                      title={`${item.label} ${shortcut ? `(${shortcut})` : ''}: ${item.description}`}
                    >
                      <div className={clsx(
                        "flex shrink-0 items-center justify-center rounded-md",
                        "p-1.5",
                        "bg-primary/10 transition-colors group-hover/item:bg-primary/20"
                      )}>
                        <Icon className={clsx(
                          "h-4 w-4",
                          "text-primary/80 group-hover/item:text-primary transition-colors"
                        )} />
                      </div>
                      {shortcut && (
                        <div className={clsx(
                          "absolute text-[10px] font-medium text-muted-foreground bg-muted/70 backdrop-blur-sm px-1.5 py-0.5 rounded shadow-sm transition-all",
                          "top-0 right-0 -translate-y-1/3 translate-x-1/3 opacity-0 group-hover/item:opacity-100"
                        )}>
                          {shortcut}
                        </div>
                      )}
                      <div className="absolute inset-0 rounded-md ring-1 ring-transparent ring-offset-background transition-all group-hover/item:ring-primary/40" />
                    </div>
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