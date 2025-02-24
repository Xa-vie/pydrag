import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

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
    <Card className="w-full h-full border-0">
      <CardHeader className="p-4 border-b border-white/10">
        <CardTitle className="text-white">Python Snippets</CardTitle>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search snippets..."
            className="pl-8 bg-slate-800 border-white/10 text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <Accordion type="multiple" className="w-full">
            {Object.entries(filteredSnippets).map(([category, snippets]) => (
              <AccordionItem key={category} value={category} className="border-white/10">
                <AccordionTrigger className="text-sm font-medium text-white px-4 hover:bg-white/5">
                  {category}
                </AccordionTrigger>
                <AccordionContent className="pb-2">
                  <div className="grid grid-cols-1 gap-2 p-2">
                    {snippets.map((snippet) => (
                      <div
                        key={snippet.id}
                        className="p-3 rounded-md bg-slate-800 cursor-move hover:bg-slate-700 transition-colors group"
                        draggable
                        onDragStart={(event) => onDragStart(event, snippet.type, snippet.initialData)}
                      >
                        <p className="font-medium text-white mb-1">{snippet.label}</p>
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