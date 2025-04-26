import { LucideIcon, Trash2 } from "lucide-react";
import { useFlowStore } from "@/store/use-flow-store";
import clsx from "clsx";
import { memo, ReactNode } from "react";

const categoryColors: Record<string, string> = {
  core: 'bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-200',
  logic: 'bg-green-200 text-green-900 dark:bg-green-900 dark:text-green-200',
  loops: 'bg-yellow-200 text-yellow-900 dark:bg-yellow-800 dark:text-yellow-100',
  functions: 'bg-purple-200 text-purple-900 dark:bg-purple-900 dark:text-purple-200',
  errorHandling: 'bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-200',
  annotations: 'bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-gray-200',
};

const NodeWrapper = ({ 
  children, 
  id,
  icon: Icon,
  label,
  selected,
  category = 'core',
}: { 
  children: ReactNode;
  id?: string;
  icon: LucideIcon;
  label: string;
  selected?: boolean;
  category?: string;
}) => {
  const deleteNode = useFlowStore(state => state.deleteNode);
  
  const handleDelete = () => {
    if (id) {
      deleteNode(id);
    } 
  };

  const colorClass = categoryColors[category] || categoryColors['core'];

  return (
    <div className={clsx(
      "relative flex flex-col",
      "min-w-[280px] max-w-[340px]",
      "rounded-2xl border border-border/60",
      "bg-white/70 dark:bg-background/80 backdrop-blur-xl",
      "shadow-xl hover:shadow-2xl transition-all duration-300",
      selected 
        ? "ring-2 ring-primary/70 border-primary/70" 
        : "hover:border-primary/40",
      "group overflow-hidden"
    )}>
      <div className={clsx(
        "flex items-center gap-2 px-4 py-2 border-b border-border/40",
        "bg-gradient-to-r from-primary/10 to-background/60 dark:from-primary/20 dark:to-background/80",
        "backdrop-blur-md",
        selected ? "border-primary/40" : "border-border/40"
      )}>
        <div className={clsx(
          "p-2 rounded-lg shadow-sm flex items-center justify-center transition-colors duration-300",
          colorClass
        )}>
          <Icon className={clsx("h-5 w-5", colorClass)} />
        </div>
        <span className="font-semibold text-base tracking-tight text-foreground flex-1 truncate">{label}</span>
        {id && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className={clsx(
              "p-2 rounded-lg transition-colors",
              "opacity-80 hover:opacity-100",
              "hover:bg-destructive/15 hover:text-destructive focus:ring-2 focus:ring-destructive/40"
            )}
            aria-label="Delete node"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
};

NodeWrapper.displayName = 'NodeWrapper';
export default memo(NodeWrapper);