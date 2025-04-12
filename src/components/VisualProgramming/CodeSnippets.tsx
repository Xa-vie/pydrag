import { useState, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Search, Variable, Lightbulb, Database, FunctionSquare, FileText, AlertTriangle, Box, Sigma, LineChart, GripHorizontal, Repeat2, Code2, Terminal } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Define type for snippet
interface CodeSnippet {
  id: string;
  type: string;
  label: string;
  description: string;
  initialData: Record<string, any>;
}

// Define type for snippets structure
interface SnippetsStructure {
  [category: string]: CodeSnippet[];
}

// Define the structure of our code snippets
const pythonSnippets: SnippetsStructure = {
  'Basic Operations': [
    {
      id: 'variable',
      type: 'variableBlock',
      label: 'Variable',
      description: 'Create and assign a value to a variable',
      initialData: {
        variable: '',
        value: '',
      },
    },
    {
      id: 'print',
      type: 'printBlock',
      label: 'Print',
      description: 'Output text to console',
      initialData: {
        content: 'Hello World',
      },
    },
    {
      id: 'input',
      type: 'inputBlock',
      label: 'Input',
      description: 'Get user input',
      initialData: {
        variable: 'user_input',
        prompt: 'Enter value: ',
      },
    },
  ],
  'Control Flow': [
    {
      id: 'if',
      type: 'ifBlock',
      label: 'If Statement',
      description: 'Conditional execution',
      initialData: {
        condition: 'condition',
      },
    },
    {
      id: 'for',
      type: 'forBlock',
      label: 'For Loop',
      description: 'Iterate over a sequence',
      initialData: {
        variable: 'i',
        iterable: 'range(10)',
      },
    },
    {
      id: 'while',
      type: 'whileBlock',
      label: 'While Loop',
      description: 'Loop while condition is true',
      initialData: {
        condition: 'True',
      },
    },
  ],
  'Data Structures': [
    {
      id: 'list',
      type: 'listBlock',
      label: 'List',
      description: 'Create a list',
      initialData: {
        variable: 'my_list',
        value: '[]',
      },
    },
    {
      id: 'dict',
      type: 'dictBlock',
      label: 'Dictionary',
      description: 'Create a dictionary',
      initialData: {
        variable: 'my_dict',
        value: '{}',
      },
    },
    {
      id: 'tuple',
      type: 'tupleBlock',
      label: 'Tuple',
      description: 'Create a tuple',
      initialData: {
        variable: 'my_tuple',
        value: '()',
      },
    },
    {
      id: 'set',
      type: 'setBlock',
      label: 'Set',
      description: 'Create a set',
      initialData: {
        variable: 'my_set',
        value: 'set()',
      },
    },
  ],
  'Functions': [
    {
      id: 'function',
      type: 'functionBlock',
      label: 'Function',
      description: 'Define a function',
      initialData: {
        name: 'my_function',
        params: '',
      },
    },
    {
      id: 'return',
      type: 'returnBlock',
      label: 'Return',
      description: 'Return a value',
      initialData: {
        value: 'result',
      },
    },
    {
      id: 'lambda',
      type: 'lambdaBlock',
      label: 'Lambda',
      description: 'Anonymous function',
      initialData: {
        params: 'x',
        expression: 'x * 2',
      },
    },
  ],
  'File Operations': [
    {
      id: 'open',
      type: 'openBlock',
      label: 'Open File',
      description: 'Open a file',
      initialData: {
        variable: 'file',
        filename: 'file.txt',
        mode: 'r',
      },
    },
    {
      id: 'read',
      type: 'readBlock',
      label: 'Read File',
      description: 'Read from file',
      initialData: {
        variable: 'content',
        file: 'file',
      },
    },
    {
      id: 'write',
      type: 'writeBlock',
      label: 'Write File',
      description: 'Write to file',
      initialData: {
        file: 'file',
        content: 'text',
      },
    },
  ],
  'Error Handling': [
    {
      id: 'try',
      type: 'tryBlock',
      label: 'Try/Except',
      description: 'Handle exceptions',
      initialData: {
        code: 'risky_operation()',
        error: 'Exception',
      },
    },
    {
      id: 'raise',
      type: 'raiseBlock',
      label: 'Raise',
      description: 'Raise an exception',
      initialData: {
        error: 'ValueError',
        message: 'Invalid input',
      },
    },
  ],
  'Modules': [
    {
      id: 'import',
      type: 'importBlock',
      label: 'Import',
      description: 'Import a module',
      initialData: {
        module: 'module_name',
        alias: '',
      },
    },
    {
      id: 'from_import',
      type: 'fromImportBlock',
      label: 'From Import',
      description: 'Import specific items',
      initialData: {
        module: 'module_name',
        items: 'item1, item2',
      },
    },
  ],
  'NumPy & Pandas': [
    {
      id: 'numpy_array',
      type: 'numpyArrayBlock',
      label: 'NumPy Array',
      description: 'Create array',
      initialData: {
        variable: 'arr',
        value: 'np.array([1, 2, 3])',
      },
    },
    {
      id: 'pandas_df',
      type: 'pandasDfBlock',
      label: 'Pandas DataFrame',
      description: 'Create DataFrame',
      initialData: {
        variable: 'df',
        data: '{"A": [1, 2, 3]}',
      },
    },
  ],
  'Plotting': [
    {
      id: 'matplotlib_plot',
      type: 'matplotlibPlotBlock',
      label: 'Plot',
      description: 'Create a plot',
      initialData: {
        x: 'x_data',
        y: 'y_data',
        type: 'line',
      },
    },
    {
      id: 'seaborn_plot',
      type: 'seabornPlotBlock',
      label: 'Seaborn Plot',
      description: 'Statistical plot',
      initialData: {
        data: 'data',
        type: 'scatter',
      },
    },
  ],
};

// Add category icons mapping
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Basic Operations': <Variable className="h-4 w-4" />,
  'Control Flow': <Repeat2 className="h-4 w-4" />,
  'Data Structures': <Database className="h-4 w-4" />,
  'Functions': <FunctionSquare className="h-4 w-4" />,
  'File Operations': <FileText className="h-4 w-4" />,
  'Error Handling': <AlertTriangle className="h-4 w-4" />,
  'Modules': <Box className="h-4 w-4" />,
  'NumPy & Pandas': <Sigma className="h-4 w-4" />,
  'Plotting': <LineChart className="h-4 w-4" />
};

interface CodeSnippetsPanelProps {
  onDragStart: (event: React.DragEvent, nodeType: string, data: any) => void;
}

export const CodeSnippetsPanel = memo(({ onDragStart }: CodeSnippetsPanelProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredSnippets = searchTerm
    ? Object.entries(pythonSnippets).reduce((acc, [category, snippets]) => {
        const filtered = snippets.filter(
          s => s.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
               s.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (filtered.length > 0) {
          acc[category] = filtered;
        }
        return acc;
      }, {} as typeof pythonSnippets)
    : pythonSnippets;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
    <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
      <PopoverTrigger asChild>
        
              <Button 
                variant="outline" 
                size="icon"
                className="h-10 w-10 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 shadow-sm transition-all duration-200 ease-in-out"
              >
                <Terminal className="w-4.5 h-4.5" />
              </Button>
            </PopoverTrigger>

            </TooltipTrigger>
            <TooltipContent side="right" className="bg-slate-800 text-slate-200 border-slate-700">
              <p>Click to open code blocks. Drag blocks to canvas</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      <PopoverContent 
        side="bottom" 
        align="start" 
        className="w-80 p-0 bg-slate-900 border-slate-800 shadow-2xl"
      >
        <div className="flex flex-col h-[600px]">
          <div className="p-4 border-b border-white/10 bg-slate-800/50">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-5 w-5 text-slate-400" />
              <h3 className="text-lg font-semibold text-white">Code Blocks</h3>
            </div>
            <p className="text-sm text-slate-400 mb-3">Drag and drop blocks onto the canvas to build your program</p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search blocks..."
                className="pl-9 bg-slate-800 border-slate-700 text-sm text-white placeholder:text-slate-400 focus:border-purple-400 focus:ring-purple-400 rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <ScrollArea className="flex-1">
            <Accordion type="multiple" className="w-full">
              {Object.entries(filteredSnippets).map(([category, snippets]) => (
                <AccordionItem 
                  key={category} 
                  value={category} 
                  className="border-b border-white/10 group"
                >
                  <AccordionTrigger className="text-sm font-medium text-white hover:bg-slate-800/30 transition-colors px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-purple-400">
                        {CATEGORY_ICONS[category]}
                      </span>
                      {category}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-3 px-4">
                    <div className="grid grid-cols-1 gap-2">
                      {snippets.map((snippet) => (
                        <div
                          key={snippet.id}
                          className="p-3 rounded-lg bg-slate-800/50 cursor-move hover:bg-slate-700/30 transition-all border border-slate-700/50 hover:border-purple-400/30 relative group/item"
                          draggable
                          onDragStart={(event) => {
                            onDragStart(event, snippet.type, snippet.initialData);
                            setIsOpen(false);
                          }}
                        >
                          <div className="flex items-start gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-sm font-medium text-white">
                                  {snippet.label}
                                </span>
                                <span className="text-xs text-purple-400/80 font-mono px-1.5 py-0.5 bg-purple-400/10 rounded">
                                  {snippet.type.replace('Block', '')}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 leading-snug">
                                {snippet.description}
                              </p>
                            </div>
                            <GripHorizontal className="h-4 w-4 text-slate-500 mt-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                          </div>
                          <div className="absolute inset-0 rounded-lg transition-all -z-10 group-hover/item:bg-purple-400/5" />
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}); 

CodeSnippetsPanel.displayName = 'CodeSnippetsPanel';
