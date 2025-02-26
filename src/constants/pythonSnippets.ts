import { SnippetsStructure } from '@/types/python';

export const pythonSnippets = [
  {
    category: "Basic",
    items: [
      {
        name: "Variable",
        type: "variableBlock",
        description: "Declare a variable",
        icon: "Variable"
      },
      {
        name: "Print",
        type: "printBlock",
        description: "Output text to console",
        icon: "Printer"
      },
      {
        name: "Input",
        type: "inputBlock",
        description: "Get user input",
        icon: "Terminal"
      },
      {
        name: "If Statement",
        type: "ifBlock",
        description: "Conditional logic",
        icon: "GitBranch"
      },
      {
        name: "For Loop",
        type: "forBlock",
        description: "Iterate over a sequence",
        icon: "Repeat"
      },
      {
        name: "While Loop",
        type: "whileBlock",
        description: "Loop while condition is true",
        icon: "CircleDot"
      },
      {
        name: "Function",
        type: "functionBlock",
        description: "Define a reusable function",
        icon: "Code2"
      },
      {
        name: "Return",
        type: "returnBlock",
        description: "Return a value from a function",
        icon: "CornerUpLeft"
      },
      {
        name: "Try/Except",
        type: "tryBlock",
        description: "Handle exceptions",
        icon: "ShieldAlert"
      },
      {
        name: "Import",
        type: "importBlock",
        description: "Import a module",
        icon: "Package"
      }
    ]
  },
  {
    category: "Data Structures",
    items: [
      {
        name: "List",
        type: "listBlock",
        description: "Create and manipulate a list",
        icon: "ListOrdered"
      },
      {
        name: "Dictionary",
        type: "dictBlock",
        description: "Create and manipulate a dictionary",
        icon: "Table"
      },
      {
        name: "Tuple",
        type: "tupleBlock",
        description: "Create and access a tuple",
        icon: "Brackets"
      },
      {
        name: "Set",
        type: "setBlock",
        description: "Create and manipulate a set",
        icon: "CircleOff"
      },
      {
        name: "NumPy Array",
        type: "numpyArrayBlock",
        description: "Create a NumPy array",
        icon: "Grid"
      }
    ]
  },
  {
    category: "File Operations",
    items: [
      {
        name: "Open File",
        type: "openBlock",
        description: "Open and read/write files",
        icon: "FolderOpen"
      },
      {
        name: "CSV Reader",
        type: "csvReaderBlock",
        description: "Read data from CSV files",
        icon: "FileSpreadsheet"
      },
      {
        name: "JSON Operations",
        type: "jsonBlock",
        description: "Read/write JSON data",
        icon: "Braces"
      },
      {
        name: "File Writer",
        type: "fileWriterBlock",
        description: "Write data to files",
        icon: "FilePlus"
      }
    ]
  },
  {
    category: "Web & APIs",
    items: [
      {
        name: "Flask API",
        type: "flaskApiBlock",
        description: "Create a Flask API endpoint",
        icon: "Server"
      },
      {
        name: "HTTP Request",
        type: "httpRequestBlock",
        description: "Make HTTP requests",
        icon: "Globe"
      },
      {
        name: "API Response",
        type: "apiResponseBlock",
        description: "Format API responses",
        icon: "ArrowLeftRight"
      },
      {
        name: "WebSocket",
        type: "webSocketBlock",
        description: "Create WebSocket connection",
        icon: "Radio"
      },
      {
        name: "FastAPI Endpoint",
        type: "fastApiBlock",
        description: "Create a FastAPI endpoint",
        icon: "Zap"
      }
    ]
  },
  {
    category: "Database",
    items: [
      {
        name: "SQL Query",
        type: "sqlQueryBlock",
        description: "Execute SQL queries",
        icon: "Database"
      },
      {
        name: "MongoDB",
        type: "mongoDbBlock",
        description: "MongoDB operations",
        icon: "Leaf"
      },
      {
        name: "SQLite Connection",
        type: "sqliteBlock",
        description: "Connect to SQLite database",
        icon: "HardDrive"
      },
      {
        name: "ORM Model",
        type: "ormModelBlock",
        description: "Define ORM model",
        icon: "Layers"
      }
    ]
  },
  {
    category: "Advanced",
    items: [
      {
        name: "Lambda",
        type: "lambdaBlock",
        description: "Create anonymous function",
        icon: "Code"
      },
      {
        name: "Decorator",
        type: "decoratorBlock",
        description: "Create a function decorator",
        icon: "Sparkles"
      },
      {
        name: "Async Function",
        type: "asyncBlock",
        description: "Define asynchronous function",
        icon: "Hourglass"
      },
      {
        name: "Generator",
        type: "generatorBlock",
        description: "Create a generator function",
        icon: "Repeat"
      },
      {
        name: "Class",
        type: "classBlock",
        description: "Define a class",
        icon: "Box"
      }
    ]
  }
]; 