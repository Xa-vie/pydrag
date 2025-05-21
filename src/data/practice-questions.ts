export interface PracticeQuestion {
  id: string;
  difficulty: 'easy' | 'medium' | 'hard';
  title: string;
  description: string;
  hint?: string;
  sampleSolution?: string;
}

// Sample questions for each difficulty level
export const practiceQuestions: PracticeQuestion[] = [
  // Easy Questions
  {
    id: 'easy-1',
    difficulty: 'easy',
    title: 'Simple Data Processing',
    description: 'Create a flow that reads a CSV file and filters rows where the "age" column is greater than 30.',
    hint: 'Use the CSV Reader node followed by a Filter node.',
  },
  {
    id: 'easy-2',
    difficulty: 'easy',
    title: 'Text Transformation',
    description: 'Build a flow that takes a text input and converts it to uppercase.',
    hint: 'Use a Text Input node and String Transformer node.',
  },
  {
    id: 'easy-3',
    difficulty: 'easy',
    title: 'Basic Calculation',
    description: 'Create a flow that takes two numbers and outputs their sum, difference, product, and quotient.',
    hint: 'Use two Number Input nodes and four Math Operation nodes.',
  },
  {
    id: 'easy-4',
    difficulty: 'easy',
    title: 'Hello World API',
    description: 'Create a simple flow that returns "Hello, World!" when accessed via an API endpoint.',
    hint: 'Use an API Trigger node and a Text Output node.',
  },
  {
    id: 'easy-5',
    difficulty: 'easy',
    title: 'Counter Flow',
    description: 'Build a flow that counts from 1 to 10 and outputs each number.',
    hint: 'Use a Loop node with a counter variable.',
  },
  {
    id: 'easy-6',
    difficulty: 'easy',
    title: 'Name Formatter',
    description: 'Create a flow that takes first and last name inputs and formats them as "Last, First".',
    hint: 'Use two Text Input nodes and a String Format node.',
  },
  {
    id: 'easy-7',
    difficulty: 'easy',
    title: 'Even/Odd Checker',
    description: 'Build a flow that determines if a number is even or odd.',
    hint: 'Use a Number Input node and a Conditional node with modulo operation.',
  },
  {
    id: 'easy-8',
    difficulty: 'easy',
    title: 'Date Formatter',
    description: 'Create a flow that takes a date input and outputs it in MM/DD/YYYY format.',
    hint: 'Use a Date Input node and a Date Format node.',
  },
  {
    id: 'easy-9',
    difficulty: 'easy',
    title: 'Temperature Converter',
    description: 'Build a flow that converts temperatures from Celsius to Fahrenheit.',
    hint: 'Use the formula F = C * 9/5 + 32 with a Math Formula node.',
  },
  {
    id: 'easy-10',
    difficulty: 'easy',
    title: 'Simple List Processor',
    description: 'Create a flow that takes a list of numbers and outputs the sum and average.',
    hint: 'Use a List Input node and Aggregate nodes.',
  },

  // Medium Questions
  {
    id: 'medium-1',
    difficulty: 'medium',
    title: 'Weather API Integration',
    description: 'Create a flow that fetches weather data for a city and displays the temperature and conditions.',
    hint: 'Use an HTTP Request node to call a weather API and parse the JSON response.',
  },
  {
    id: 'medium-2',
    difficulty: 'medium',
    title: 'Data Transformation Pipeline',
    description: 'Build a flow that reads a JSON file, transforms the data structure, and outputs a CSV file.',
    hint: 'Use JSON Reader, Map/Transform, and CSV Writer nodes.',
  },
  {
    id: 'medium-3',
    difficulty: 'medium',
    title: 'Scheduled Report Generator',
    description: 'Create a flow that runs daily to generate a report from a database and emails it to stakeholders.',
    hint: 'Use a Schedule Trigger, Database Query, and Email nodes.',
  },
  {
    id: 'medium-4',
    difficulty: 'medium',
    title: 'Form Validation Flow',
    description: 'Build a flow that validates user input forms with multiple fields and returns appropriate error messages.',
    hint: 'Use multiple validation nodes and conditional logic.',
  },
  {
    id: 'medium-5',
    difficulty: 'medium',
    title: 'Data Aggregation Dashboard',
    description: 'Create a flow that aggregates data from multiple sources and presents key metrics on a dashboard.',
    hint: 'Use multiple data source nodes and aggregation functions.',
  },
  {
    id: 'medium-6',
    difficulty: 'medium',
    title: 'Image Processing Pipeline',
    description: 'Build a flow that processes uploaded images by resizing them and applying filters.',
    hint: 'Use File Upload, Image Processing, and File Storage nodes.',
  },
  {
    id: 'medium-7',
    difficulty: 'medium',
    title: 'Multi-step Approval Workflow',
    description: 'Create a flow that implements a multi-step approval process with notifications.',
    hint: 'Use State Machine nodes with conditional transitions and notification nodes.',
  },
  {
    id: 'medium-8',
    difficulty: 'medium',
    title: 'Data Enrichment Flow',
    description: 'Build a flow that enriches customer data with additional information from external APIs.',
    hint: 'Use Database Query nodes and multiple API Integration nodes.',
  },
  {
    id: 'medium-9',
    difficulty: 'medium',
    title: 'Sentiment Analysis Pipeline',
    description: 'Create a flow that analyzes the sentiment of text inputs using NLP techniques.',
    hint: 'Use Text Input and NLP Processing nodes with appropriate libraries.',
  },
  {
    id: 'medium-10',
    difficulty: 'medium',
    title: 'Inventory Management System',
    description: 'Build a flow that tracks inventory levels and sends alerts when stock is low.',
    hint: 'Use Database Integration, Threshold Check, and Notification nodes.',
  },

  // Hard Questions
  {
    id: 'hard-1',
    difficulty: 'hard',
    title: 'Machine Learning Prediction Pipeline',
    description: 'Create a flow that trains a machine learning model on historical data and uses it to make predictions.',
    hint: 'Use Data Import, Feature Engineering, Model Training, and Prediction nodes.',
  },
  {
    id: 'hard-2',
    difficulty: 'hard',
    title: 'Real-time Data Processing System',
    description: 'Build a flow that processes streaming data in real-time and triggers alerts based on complex conditions.',
    hint: 'Use Stream Processing, Complex Event Processing, and Alert nodes.',
  },
  {
    id: 'hard-3',
    difficulty: 'hard',
    title: 'Multi-tenant SaaS Application Backend',
    description: 'Create a flow that implements the backend for a multi-tenant SaaS application with proper data isolation.',
    hint: 'Use Authentication, Authorization, and Tenant-aware Database nodes.',
  },
  {
    id: 'hard-4',
    difficulty: 'hard',
    title: 'Distributed ETL Pipeline',
    description: 'Build a flow that implements a distributed ETL pipeline capable of processing large datasets.',
    hint: 'Use Distributed Processing frameworks and Data Partitioning techniques.',
  },
  {
    id: 'hard-5',
    difficulty: 'hard',
    title: 'Recommendation Engine',
    description: 'Create a flow that implements a recommendation engine based on user behavior and preferences.',
    hint: 'Use User Profiling, Collaborative Filtering, and Recommendation Algorithm nodes.',
  },
  {
    id: 'hard-6',
    difficulty: 'hard',
    title: 'Compliance Audit System',
    description: 'Build a flow that automatically audits systems for compliance with regulatory requirements.',
    hint: 'Use System Integration, Rule Engine, and Compliance Reporting nodes.',
  },
  {
    id: 'hard-7',
    difficulty: 'hard',
    title: 'Natural Language Processing Pipeline',
    description: 'Create a flow that processes natural language inputs, extracts entities, and performs named entity recognition.',
    hint: 'Use NLP Processing, Entity Extraction, and Knowledge Graph nodes.',
  },
  {
    id: 'hard-8',
    difficulty: 'hard',
    title: 'Fault-tolerant Microservice Orchestration',
    description: 'Build a flow that orchestrates multiple microservices with fault tolerance and circuit breaking patterns.',
    hint: 'Use Service Gateway, Circuit Breaker, and Fallback Strategy nodes.',
  },
  {
    id: 'hard-9',
    difficulty: 'hard',
    title: 'Anomaly Detection System',
    description: 'Create a flow that detects anomalies in time-series data using statistical methods and machine learning.',
    hint: 'Use Time Series Processing, Statistical Analysis, and Anomaly Detection nodes.',
  },
  {
    id: 'hard-10',
    difficulty: 'hard',
    title: 'Blockchain Data Integration',
    description: 'Build a flow that integrates with blockchain networks to validate and process transactions.',
    hint: 'Use Blockchain Gateway, Transaction Validation, and Smart Contract Interaction nodes.',
  },
];

export const getQuestionsByDifficulty = (difficulty: 'easy' | 'medium' | 'hard'): PracticeQuestion[] => {
  return practiceQuestions.filter(q => q.difficulty === difficulty);
}; 