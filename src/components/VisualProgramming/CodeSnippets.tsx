import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Search, Variable, GripHorizontal } from "lucide-react";

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
        onChange: undefined,
        onValueChange: undefined,
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

interface CodeSnippetsPanelProps {
  onDragStart: (event: React.DragEvent, nodeType: string, data: any) => void;
}

export function CodeSnippetsPanel({ onDragStart }: CodeSnippetsPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');

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
    <Card className="w-full h-full border-0 bg-slate-900">
      <CardHeader className="p-4 border-b border-white/10">
        <CardTitle className="text-xl font-semibold text-white">Python Blocks</CardTitle>
        <div className="relative mt-2">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search blocks..."
            className="pl-8 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400 focus:border-slate-600 focus:ring-slate-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <Accordion type="multiple" className="w-full">
            {Object.entries(filteredSnippets).map(([category, snippets]) => (
              <AccordionItem key={category} value={category} className="border-b border-white/10 px-4">
                <AccordionTrigger className="text-sm font-medium text-white hover:bg-white/5 -mx-4 px-4 py-3">
                  {category}
                </AccordionTrigger>
                <AccordionContent className="pb-3">
                  <div className="grid grid-cols-1 gap-2">
                    {snippets.map((snippet) => (
                      <div
                        key={snippet.id}
                        className="group p-3 rounded-lg bg-slate-800/50 cursor-move hover:bg-slate-700/50 transition-colors border border-slate-700/50 hover:border-slate-600"
                        draggable
                        onDragStart={(event) => onDragStart(event, snippet.type, snippet.initialData)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-white">{snippet.label}</span>
                          <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                            <GripHorizontal className="h-4 w-4 text-slate-400" />
                          </div>
                        </div>
                        <p className="text-xs text-slate-400">{snippet.description}</p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 