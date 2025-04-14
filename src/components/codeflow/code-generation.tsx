import { Node, Edge } from '@xyflow/react';
import { NodeData } from '@/store/use-flow-store';
import { calculateIndentationLevel } from './utils';

export const generateNodeCode = (node: Node<NodeData>, edges: Edge[], allNodes: Node<NodeData>[]): string => {
  // Calculate indentation level based on x position
  const indentationLevel = calculateIndentationLevel(node.position.x);
  const spaces = ' '.repeat(indentationLevel * 4);
  
  // Get all available variables for expression validation
  const allVariables = allNodes
    .filter(n => n.type === 'variable' && n.data.type === 'variable' && n.data.name)
    .map(n => n.data.name!)
    .filter(Boolean);

  const getChildNodesForHandle = (handleId: string) => {
    return edges
      .filter(edge => edge.source === node.id && edge.sourceHandle === handleId)
      .map(edge => allNodes.find(n => n.id === edge.target))
      .filter((n): n is Node<NodeData> => n !== undefined);
  };

  const generateBodyForHandle = (handleId: string) => {
    const childNodes = getChildNodesForHandle(handleId);
    if (childNodes.length > 0) {
      return '\n' + childNodes
        .map(child => generateNodeCode(child, edges, allNodes))
        .filter(code => code !== '') // Filter out empty strings
        .join('\n');
    }
    return ''; // Return empty string instead of pass
  };

  // Helper to format condition expressions
  const formatCondition = (condition: string) => {
    // If it's a simple variable name, use it as is
    if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(condition)) {
      return condition;
    }
    // If it contains comparison operators, keep as is
    if (/[<>=!]+/.test(condition)) {
      return condition;
    }
    // Otherwise wrap in quotes
    return `"${condition}"`;
  };

  switch (node.type) {
    case 'comment':
      // Only generate comment if generateComment is true
      if (node.data.generateComment) {
        return `${spaces}# ${node.data.label}`;
      }
      return '';
    case 'tryBlock':
      if (node.data.type === 'tryBlock') {
        let code = `${spaces}try:`;
        code += generateBodyForHandle('out') || `\n${spaces}    pass`;
        return code;
      }
      return `${spaces}try:\n${spaces}    pass`;
    case 'exceptBlock':
      if (node.data.type === 'exceptBlock') {
        let code = `${spaces}except ${node.data.exceptionType || 'Exception'}:`;
        code += generateBodyForHandle('out') || `\n${spaces}    pass`;
        return code;
      }
      return `${spaces}except Exception:\n${spaces}    pass`;
    case 'finallyBlock':
      if (node.data.type === 'finallyBlock') {
        let code = `${spaces}finally:`;
        code += generateBodyForHandle('out') || `\n${spaces}    pass`;
        return code;
      }
      return `${spaces}finally:\n${spaces}    pass`;
    case 'print':
      if (node.data.type === 'print') {
        const message = node.data.message || 'Hello, World!';
        // Check if the message contains any variables
        if (message.includes('{') && message.includes('}')) {
          // Convert the message to an f-string
          return `${spaces}print(f"${message}")`;
        } else {
          // Regular string if no variables
          return `${spaces}print("${message}")`;
        }
      }
      return `${spaces}print("Hello, World!")`;
    case 'ifBlock':
      if (node.data.type === 'ifBlock') {
        let code = `${spaces}if ${formatCondition(node.data.condition || 'True')}:${generateBodyForHandle('true')}`;
        
        // Add elif blocks
        node.data.elifConditions?.forEach(elif => {
          code += `\n${spaces}elif ${formatCondition(elif.condition || 'True')}:${generateBodyForHandle(`elif-${elif.id}`)}`;
        });
        
        // Add else block if it exists
        if (node.data.hasElse) {
          code += `\n${spaces}else:${generateBodyForHandle('else')}`;
        }
        
        return code;
      }
      return `${spaces}if True:${generateBodyForHandle('true')}`;
    case 'elifBlock':
      if (node.data.type === 'elifBlock') {
        return `${spaces}elif ${formatCondition(node.data.condition || 'True')}:${generateBodyForHandle(`elif-${node.data.id}`)}`;
      }
      return `${spaces}elif True:${generateBodyForHandle('true')}`;
    case 'elseBlock':
      if (node.data.type === 'elseBlock') {
        return `${spaces}else:${generateBodyForHandle('else')}`;
      }
      return `${spaces}else:${generateBodyForHandle('else')}`;
    case 'forLoop':
      if (node.data.type === 'forLoop') {
        return `${spaces}for ${node.data.condition || 'i in range(10)'}:${generateBodyForHandle('body')}`;
      }
      return `${spaces}for i in range(10):${generateBodyForHandle('body')}`;
    case 'variable':
      if (node.data.type === 'variable') {
        const name = node.data.name || 'variable';
        const value = node.data.value || 'None';
        
        // Handle different value types appropriately
        if (node.data.valueType === 'list') {
          // For list type, use the listItems array directly
          const listItems = (node.data.listItems || []) as string[];
          return `${spaces}${name} = [${listItems.map((item: string) => {
            // Check if item is a number
            const num = Number(item);
            return !isNaN(num) ? num : `"${item}"`;
          }).join(', ')}]`;
        } else if (node.data.valueType === 'dict') {
          // For dict type, format it as a proper Python dictionary with type handling
          const dictItems = Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && value[0] !== null
            ? value.map((item: any) => ({ key: item.key, value: item.value })) 
            : [];
          return `${spaces}${name} = {${dictItems.map(item => {
            // Check if value is a number
            const numValue = Number(item.value);
            const formattedValue = !isNaN(numValue) ? numValue : `"${item.value}"`;
            
            // Always quote keys in Python dictionaries
            return `"${item.key}": ${formattedValue}`;
          }).join(', ')}}`;
        } else if (value === 'true' || value === 'false') {
          return `${spaces}${name} = ${value === 'true' ? 'True' : 'False'}`;
        } else if (!isNaN(Number(value))) {
          return `${spaces}${name} = ${value}`;
        } else if (typeof value === 'string' && (value.includes('+') || value.includes('-') || value.includes('*') || value.includes('/') || 
                   allVariables.some(v => value.includes(v)))) {
          return `${spaces}${name} = ${value}`;
        } else {
          return `${spaces}${name} = "${String(value)}"`;
        }
      }
      return `${spaces}variable = None`;
    case 'database':
      if (node.data.type === 'database') {
        return `${spaces}# Database Query\n${spaces}${node.data.query || '# Enter SQL query'}`;
      }
      return `${spaces}# Database Query\n${spaces}# Enter SQL query`;
    case 'function': {
      if (node.data.type === 'function') {
        const bodyNodes = getChildNodesForHandle('body');
        const bodyCode = bodyNodes.length > 0
          ? '\n' + bodyNodes
              .map(child => generateNodeCode(child, edges, allNodes))
              .join('\n')
          : ''; // Empty string instead of pass

        const params = node.data.parameters?.join(', ') || '';
        const funcName = node.data.label?.toLowerCase().replace(/\s+/g, '_') || 'my_function';

        return `${spaces}def ${funcName}(${params}):${bodyCode}`;
      }
      return `${spaces}def my_function():`;
    }
    case 'functionCall': {
      if (node.data.type === 'functionCall') {
        const args = node.data.arguments?.join(', ') || '';
        const funcName = node.data.functionName?.toLowerCase().replace(/\s+/g, '_') || 'my_function';
        return `${spaces}${funcName}(${args})`;
      }
      return `${spaces}# Invalid function call`;
    }
    default:
      return `${spaces}# Unknown node type: ${node.type}`;
  }
}; 