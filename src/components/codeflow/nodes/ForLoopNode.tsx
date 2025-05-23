import { memo, useState, useEffect, useCallback } from 'react';
import NodeWrapper from './NodeWrapper';
import { ForLoopNodeData, NodeComponentProps } from './types';
import { 
  Repeat, AlertCircle, AlertTriangle, Variable, 
  Code2, ListTree, Hash, ArrowRight, Plus, Minus,
  ChevronRight, Infinity, Play, Timer, CheckCircle2, X, RefreshCw
} from 'lucide-react';
import { useFlowStore } from '@/store/use-flow-store';
import clsx from 'clsx';
import { nodeStyles } from './nodeStyles';
import { findParentFunctionNodeByPosition } from '../utils';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';

const ForLoopNode = memo(({ data, id, selected }: NodeComponentProps<ForLoopNodeData>) => {
  const updateNode = useFlowStore(state => state.updateNode);
  const getAllVariables = useFlowStore(state => state.getAllVariables);
  const getVariable = useFlowStore(state => state.getVariable);
  const setVariable = useFlowStore(state => state.setVariable);
  const getNodes = useFlowStore(state => state.getNodes);
  const getEdges = useFlowStore(state => state.getEdges);
  const [loopType, setLoopType] = useState<'range' | 'collection' | 'enumerate'>('range');
  const availableVariables = getAllVariables();
  const nodes = getNodes();
  const edges = getEdges();
  const parentFunctionNode = findParentFunctionNodeByPosition(id, nodes);
  const availableParameters: string[] = Array.isArray(parentFunctionNode?.data?.parameters) ? parentFunctionNode.data.parameters : [];

  // Independent state for each loop type
  const [rangeStart, setRangeStart] = useState('0');
  const [rangeEnd, setRangeEnd] = useState('10');
  const [rangeStep, setRangeStep] = useState('1');
  const [rangeIndexVar, setRangeIndexVar] = useState('i');
  const [isRangeIteratorAdded, setIsRangeIteratorAdded] = useState(false);

  const [collectionIterableVar, setCollectionIterableVar] = useState('');
  const [collectionIndexVar, setCollectionIndexVar] = useState('item');
  const [isCollectionIteratorAdded, setIsCollectionIteratorAdded] = useState(false);

  const [enumerateIterableVar, setEnumerateIterableVar] = useState('');
  const [enumerateIndexVar, setEnumerateIndexVar] = useState('item');
  const [isEnumerateIteratorAdded, setIsEnumerateIteratorAdded] = useState(false);
  
  // Error state for validation
  const [loopError, setLoopError] = useState<string | null>(null);
  const [loopWarning, setLoopWarning] = useState<string | null>(null);
  const [estimatedIterations, setEstimatedIterations] = useState<number | null>(null);

  // New state for nested loop detection
  const [nestingLevel, setNestingLevel] = useState<number>(0);
  const [isNested, setIsNested] = useState<boolean>(false);

  // Loop scope state
  const [loopScope, setLoopScope] = useState<{
    variables: string[];
    isActive: boolean;
  }>({
    variables: [],
    isActive: false
  });

  // Track last added variable and its type
  const [lastAddedVarName, setLastAddedVarName] = useState<string | null>(null);
  const [lastAddedVarType, setLastAddedVarType] = useState<'range' | 'collection' | 'enumerate' | null>(null);

  // Initialize state from data if it exists
  useEffect(() => {
    if (data.condition) {
      const condition = data.condition;
      if (condition.includes('range')) {
        setLoopType('range');
        const matches = condition.match(/range\((.*?)\)/);
        if (matches) {
          const params = matches[1].split(',').map((p: string) => p.trim());
          if (params.length === 1) {
            setRangeStart('0');
            setRangeEnd(params[0]);
            setRangeStep('1');
          } else if (params.length === 2) {
            setRangeStart(params[0]);
            setRangeEnd(params[1]);
            setRangeStep('1');
          } else if (params.length === 3) {
            setRangeStart(params[0]);
            setRangeEnd(params[1]);
            setRangeStep(params[2]);
          }
        }
      } else if (condition.includes('enumerate')) {
        setLoopType('enumerate');
        const matches = condition.match(/(\w+),\s*(\w+)\s+in\s+enumerate\((\w+)\)/);
        if (matches) {
          setEnumerateIndexVar(matches[2]);
          setEnumerateIterableVar(matches[3]);
        }
      } else {
        setLoopType('collection');
        const matches = condition.match(/(\w+)\s+in\s+(\w+)/);
        if (matches) {
          setCollectionIndexVar(matches[1]);
          setCollectionIterableVar(matches[2]);
        }
      }
    }
  }, [data.condition]);

  // Validation logic (for range)
  const validateRangeParams = useCallback(() => {
    setLoopError(null);
    setLoopWarning(null);
    setEstimatedIterations(null);
    if (loopType !== 'range') return;
    const start = Number(rangeStart);
    const end = Number(rangeEnd);
    const step = Number(rangeStep);
    if (step === 0) {
      setLoopError("Step cannot be zero - this would cause an infinite loop");
      return;
    }
    if ((start < end && step < 0) || (start > end && step > 0)) {
      setLoopError("Loop will never terminate - step direction doesn't match range direction");
      return;
    }
    const maxRecommendedIterations = 1000000;
    const estimatedIters = Math.ceil(Math.abs((end - start) / step));
    setEstimatedIterations(estimatedIters);
    if (estimatedIters > maxRecommendedIterations) {
      setLoopWarning(`This loop may have too many iterations (${estimatedIters.toLocaleString()})`);
    }
    if ((start < end && step > 0 && start >= end) || 
        (start > end && step < 0 && start <= end)) {
      setLoopWarning("This loop will not run (empty range)");
      setEstimatedIterations(0);
    }
  }, [loopType, rangeStart, rangeEnd, rangeStep]);

  useEffect(() => {
    validateRangeParams();
  }, [validateRangeParams]);

  // Handle loop type change
  const handleLoopTypeChange = (newType: 'range' | 'collection' | 'enumerate') => {
    setLoopType(newType);
    // No state reset for other types
  };

  // Update condition when variables change
  const updateLoopCondition = useCallback(() => {
    let condition = '';
    let variables: string[] = [];
    if (loopType === 'range') {
      variables = [rangeIndexVar];
        if (rangeStart === '0' && rangeStep === '1') {
        condition = `${rangeIndexVar} in range(${rangeEnd})`;
        } else if (rangeStep === '1') {
        condition = `${rangeIndexVar} in range(${rangeStart}, ${rangeEnd})`;
        } else {
        condition = `${rangeIndexVar} in range(${rangeStart}, ${rangeEnd}, ${rangeStep})`;
      }
    } else if (loopType === 'collection') {
      variables = [collectionIndexVar];
      condition = `${collectionIndexVar} in ${collectionIterableVar || 'items'}`;
    } else if (loopType === 'enumerate') {
      variables = ['idx', enumerateIndexVar];
      condition = `idx, ${enumerateIndexVar} in enumerate(${enumerateIterableVar || 'items'})`;
    }
    if (condition !== data.condition) {
      updateNode(id, {
        ...data,
        condition,
        loopScope: {
          variables,
          isActive: true
        }
      });
      if (loopType === 'enumerate') {
        setVariable('idx', '0', id);
      }
      setLoopScope({
        variables,
        isActive: true
      });
    }
  }, [loopType, rangeStart, rangeEnd, rangeStep, rangeIndexVar, collectionIndexVar, collectionIterableVar, enumerateIndexVar, enumerateIterableVar, id, data.condition]);

  useEffect(() => {
    updateLoopCondition();
  }, [updateLoopCondition]);

  // Detect nesting level
  useEffect(() => {
    const loopNodes = nodes.filter(node => 
      node.type === 'forLoop' || 
      node.type === 'whileLoop'
    );
    
    const currentNode = nodes.find(n => n.id === id);
    if (!currentNode) return;
    
    const currentY = currentNode.position.y;
    const loopsAbove = loopNodes.filter(node => 
      node.id !== id && 
      node.position.y < currentY
    );
    
    const level = loopsAbove.length;
    setNestingLevel(level);
    setIsNested(level > 0);
  }, [id, nodes]);

  // Filter variables based on loop type and context
  const getFilteredVariables = useCallback(() => {
    const currentLoopVars = loopScope.variables || [];
    const allVars = [...availableVariables, ...availableParameters];
    
    // Get current node position
    const currentNode = nodes.find(n => n.id === id);
    const nodeY = currentNode?.position.y || 0;
    
    // Filter out variables based on position and type
    return allVars.filter(varName => {
      // Don't show loop variables as collection options
      if (varName === 'idx' || currentLoopVars.includes(varName)) {
        return false;
      }
      
      // Don't show range variable in collection selection
      if (loopType === 'range' && varName === rangeIndexVar) {
        return false;
      }

      // Get the node that created this variable
      const variableInfo = useFlowStore.getState().variables.get(varName);
      if (!variableInfo) return true; // If no node info, it's a parameter or global variable
      
      const creatorNode = nodes.find(n => n.id === variableInfo.nodeId);
      if (!creatorNode) return true;
      
      // Only show variables from nodes above this one
      return creatorNode.position.y < nodeY;
    });
  }, [loopScope.variables, availableVariables, availableParameters, loopType, rangeIndexVar, nodes, id]);

  // Helper to check and add variable to global scope if not present
  const ensureVariableAdded = (varName: string, isAdded: boolean, setIsAdded: (v: boolean) => void) => {
    if (varName && varName.trim() && !isAdded) {
      setVariable(varName.trim(), 'item', id);
      setIsAdded(true);
    }
  };
  // Helper to remove variable from global scope
  const removeVariable = (varName: string, setVar: (v: string) => void, setIsAdded: (v: boolean) => void) => {
    if (varName && varName.trim()) {
      useFlowStore.getState().deleteVariable(varName.trim());
      setVar('');
      setIsAdded(false);
    }
  };

  // On mount or loop type change, ensure only the current loop type's variable is in global state
  useEffect(() => {
    // Remove variables for other loop types
    if (loopType === 'range') {
      if (collectionIndexVar && collectionIndexVar.trim()) {
        useFlowStore.getState().deleteVariable(collectionIndexVar.trim());
        setIsCollectionIteratorAdded(false);
      }
      if (enumerateIndexVar && enumerateIndexVar.trim()) {
        useFlowStore.getState().deleteVariable(enumerateIndexVar.trim());
        setIsEnumerateIteratorAdded(false);
      }
      ensureVariableAdded(rangeIndexVar, isRangeIteratorAdded, setIsRangeIteratorAdded);
    } else if (loopType === 'collection') {
      if (rangeIndexVar && rangeIndexVar.trim()) {
        useFlowStore.getState().deleteVariable(rangeIndexVar.trim());
        setIsRangeIteratorAdded(false);
      }
      if (enumerateIndexVar && enumerateIndexVar.trim()) {
        useFlowStore.getState().deleteVariable(enumerateIndexVar.trim());
        setIsEnumerateIteratorAdded(false);
      }
      ensureVariableAdded(collectionIndexVar, isCollectionIteratorAdded, setIsCollectionIteratorAdded);
    } else if (loopType === 'enumerate') {
      if (rangeIndexVar && rangeIndexVar.trim()) {
        useFlowStore.getState().deleteVariable(rangeIndexVar.trim());
        setIsRangeIteratorAdded(false);
      }
      if (collectionIndexVar && collectionIndexVar.trim()) {
        useFlowStore.getState().deleteVariable(collectionIndexVar.trim());
        setIsCollectionIteratorAdded(false);
      }
      ensureVariableAdded(enumerateIndexVar, isEnumerateIteratorAdded, setIsEnumerateIteratorAdded);
    }
    // eslint-disable-next-line
  }, [loopType]);

  // Validation for duplicate variable names
  const isDuplicateVar = (varName: string) => {
    if (!varName || !varName.trim()) return false;
    const allVars = getAllVariables();
    return allVars.includes(varName.trim()) || availableParameters.includes(varName.trim());
  };

  // Helper to determine if error should be shown
  const shouldShowDuplicateError = (varName: string, defaultVal: string) => {
    return varName.trim() !== '' && varName.trim() !== defaultVal && isDuplicateVar(varName);
  };

  // --- Range Controls ---
  const renderRangeControls = () => (
    <div className="space-y-4">
      <div className="relative p-4 rounded-lg bg-muted/30 border border-border">
        <div className="absolute -top-3 left-3 px-2 bg-background">
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Hash className="h-3.5 w-3.5" />
            Range Settings
          </span>
        </div>
        {/* Range Visualization */}
        <div className="mb-6 relative pt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">{rangeStart}</span>
            <span className="text-sm">{rangeEnd}</span>
          </div>
          <Progress value={((Number(rangeEnd) - Number(rangeStart)) / Number(rangeStep)) * 10} className="h-2" />
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground justify-center">
            <Timer className="h-3.5 w-3.5" />
            {estimatedIterations !== null && `${estimatedIterations.toLocaleString()} iterations`}
          </div>
        </div>
        {/* Range Controls */}
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Start</Label>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setRangeStart('0')}
                className="h-5 w-5 p-0"
              >
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
            <Input
              value={rangeStart}
              onChange={(e) => setRangeStart(e.target.value)}
              className={clsx("h-8", loopError && "border-destructive")}
              type="number"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs">End</Label>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setRangeEnd('10')}
                className="h-5 w-5 p-0"
              >
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
            <Input
              value={rangeEnd}
              onChange={(e) => setRangeEnd(e.target.value)}
              className={clsx("h-8", loopError && "border-destructive")}
              type="number"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Step</Label>
              <div className="flex gap-0.5">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setRangeStep((prev) => String(Number(prev) - 1))}
                  className="h-5 w-5 p-0"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setRangeStep((prev) => String(Number(prev) + 1))}
                  className="h-5 w-5 p-0"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <Input
              value={rangeStep}
              onChange={(e) => setRangeStep(e.target.value)}
              className={clsx("h-8", loopError && "border-destructive")}
              type="number"
            />
          </div>
        </div>
        {/* Range Iterator Variable */}
        <div className="mt-4 flex flex-col gap-1">
          <div className="flex gap-1 items-center">
            <Input
              value={rangeIndexVar}
              onChange={(e) => setRangeIndexVar(e.target.value)}
              placeholder="e.g., i"
              className="h-8"
              disabled={isRangeIteratorAdded}
            />
            {!isRangeIteratorAdded ? (
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8"
                onClick={() => ensureVariableAdded(rangeIndexVar, isRangeIteratorAdded, setIsRangeIteratorAdded)}
                title="Add variable to global scope"
                disabled={shouldShowDuplicateError(rangeIndexVar, 'i')}
              >
                <Plus className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => removeVariable(rangeIndexVar, setRangeIndexVar, setIsRangeIteratorAdded)}
                title="Reset variable"
              >
                <RefreshCw className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
          {shouldShowDuplicateError(rangeIndexVar, 'i') && (
            <div className="text-xs text-destructive mt-1">Variable name already exists in global scope or as a parameter.</div>
          )}
        </div>
        {/* Error/Warning Display */}
        {(loopError || loopWarning) && (
          <div className="mt-3 p-2 rounded bg-background/50">
            {loopError && (
              <div className="flex items-start gap-2 text-destructive text-xs">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{loopError}</span>
              </div>
            )}
            {!loopError && loopWarning && (
              <div className="flex items-start gap-2 text-amber-500 text-xs">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{loopWarning}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // --- Collection Controls ---
  const renderCollectionControls = () => (
    <div className="space-y-4">
      <div className="relative p-4 rounded-lg bg-muted/30 border border-border">
        <div className="absolute -top-3 left-3 px-2 bg-background">
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <ListTree className="h-3.5 w-3.5" />
            Collection Settings
          </span>
        </div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Collection Variable</Label>
            <Input
              value={collectionIterableVar}
              onChange={(e) => setCollectionIterableVar(e.target.value)}
              placeholder="e.g., my_list"
              className="h-8"
            />
            {/* Show filtered variables */}
            {getFilteredVariables().length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {getFilteredVariables().map(varName => {
                  const value = getVariable(varName);
                  const isParam = availableParameters.includes(varName);
                  return (
                    <Tooltip key={varName}>
                      <TooltipTrigger asChild>
                        <Badge 
                          variant="secondary" 
                          className="cursor-pointer hover:bg-secondary/80 text-xs"
                          onClick={() => setCollectionIterableVar(varName)}
                        >
                          {varName}{isParam ? ' (param)' : ''}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">
                          {isParam ? 'Function parameter' : `Value: ${value}`}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">
              Iterator Variable
            </Label>
            <div className="flex flex-col gap-1">
              <div className="flex gap-1 items-center">
                <Input
                  value={collectionIndexVar}
                  onChange={(e) => setCollectionIndexVar(e.target.value)}
                  placeholder="e.g., item"
                  className="h-8"
                  disabled={isCollectionIteratorAdded}
                />
                {!isCollectionIteratorAdded ? (
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8"
                    onClick={() => ensureVariableAdded(collectionIndexVar, isCollectionIteratorAdded, setIsCollectionIteratorAdded)}
                    title="Add variable to global scope"
                    disabled={shouldShowDuplicateError(collectionIndexVar, 'item')}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => removeVariable(collectionIndexVar, setCollectionIndexVar, setIsCollectionIteratorAdded)}
                    title="Reset variable"
                  >
                    <RefreshCw className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
              {shouldShowDuplicateError(collectionIndexVar, 'item') && (
                <div className="text-xs text-destructive mt-1">Variable name already exists in global scope or as a parameter.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // --- Enumerate Controls ---
  const renderEnumerateControls = () => (
    <div className="space-y-4">
      <div className="relative p-4 rounded-lg bg-muted/30 border border-border">
        <div className="absolute -top-3 left-3 px-2 bg-background">
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <ListTree className="h-3.5 w-3.5" />
            Enumerate Settings
          </span>
        </div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Enumerate Variable</Label>
            <Input
              value={enumerateIterableVar}
              onChange={(e) => setEnumerateIterableVar(e.target.value)}
              placeholder="e.g., items"
              className="h-8"
            />
            {/* Show filtered variables */}
            {getFilteredVariables().length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {getFilteredVariables().map(varName => {
                  const value = getVariable(varName);
                  const isParam = availableParameters.includes(varName);
                  return (
                    <Tooltip key={varName}>
                      <TooltipTrigger asChild>
                        <Badge 
                          variant="secondary" 
                          className="cursor-pointer hover:bg-secondary/80 text-xs"
                          onClick={() => setEnumerateIterableVar(varName)}
                        >
                          {varName}{isParam ? ' (param)' : ''}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">
                          {isParam ? 'Function parameter' : `Value: ${value}`}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">
              Item Variable
            </Label>
            <div className="flex flex-col gap-1">
              <div className="flex gap-1 items-center">
                <Input
                  value={enumerateIndexVar}
                  onChange={(e) => setEnumerateIndexVar(e.target.value)}
                  placeholder="e.g., item"
                  className="h-8"
                  disabled={isEnumerateIteratorAdded}
                />
                {!isEnumerateIteratorAdded ? (
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8"
                    onClick={() => ensureVariableAdded(enumerateIndexVar, isEnumerateIteratorAdded, setIsEnumerateIteratorAdded)}
                    title="Add variable to global scope"
                    disabled={shouldShowDuplicateError(enumerateIndexVar, 'item')}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => removeVariable(enumerateIndexVar, setEnumerateIndexVar, setIsEnumerateIteratorAdded)}
                    title="Reset variable"
                  >
                    <RefreshCw className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
              {shouldShowDuplicateError(enumerateIndexVar, 'item') && (
                <div className="text-xs text-destructive mt-1">Variable name already exists in global scope or as a parameter.</div>
              )}
            </div>
              <p className="text-xs text-muted-foreground mt-1">
                Index variable will be 'idx'
              </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <NodeWrapper 
      id={id}
      icon={Repeat}
      label={`For Loop${isNested ? ` (Level ${nestingLevel})` : ''}`}
      selected={selected}
      category="loops"
    >
      <div className={clsx(
        "relative",
        isNested && "border-l-2",
        nestingLevel === 1 && "border-yellow-500",
        nestingLevel === 2 && "border-orange-500",
        nestingLevel >= 3 && "border-red-500"
      )}>
        {/* Loop Type Selection */}
        <div className="flex gap-1 mb-5">
          {[
            { type: 'range', icon: Code2, label: 'Range' },
            { type: 'collection', icon: ListTree, label: 'Collection' },
            { type: 'enumerate', icon: Hash, label: 'Enumerate' }
          ].map(({ type, icon: Icon, label }) => (
            <Button
              key={type}
              variant={loopType === type ? "default" : "outline"}
              size="sm"
              className={clsx(
                "flex-1 h-8",
                loopType === type && "shadow-sm"
              )}
              onClick={() => handleLoopTypeChange(type as any)}
            >
              <Icon className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-xs">{label}</span>
            </Button>
          ))}
        </div>
        {/* Loop Controls */}
        {loopType === 'range' ? renderRangeControls() : loopType === 'collection' ? renderCollectionControls() : renderEnumerateControls()}
        {/* Loop Variables */}
        <div className="mt-3 flex items-center gap-2 p-2 rounded bg-muted/30">
          <Variable className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-wrap gap-1">
            {loopScope.variables.map((variable) => {
              const isIndex = variable === 'idx' || (loopType === 'range' && variable === rangeIndexVar);
              return (
                <Tooltip key={variable}>
                  <TooltipTrigger asChild>
                    <Badge variant="secondary" className="text-xs opacity-60 cursor-not-allowed">
                      {variable}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Will be available in nodes below this loop</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {isIndex ? 'Index variable' : 'Iterator variable'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </div>
        {/* Nested Loop Warning */}
        {isNested && nestingLevel >= 2 && (
          <div className="mt-3 p-2 rounded bg-muted/30 border border-amber-500/20">
            <div className="flex items-center gap-2 text-amber-500 text-xs">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Nested Loop ({nestingLevel} levels)</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Consider simplifying deeply nested loops for better performance.
            </p>
          </div>
        )}
      </div>
    </NodeWrapper>
  );
});

ForLoopNode.displayName = 'ForLoopNode';

export default ForLoopNode; 