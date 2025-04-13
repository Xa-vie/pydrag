import { LucideIcon, Trash2 } from "lucide-react";
import { useFlowStore } from "@/store/use-flow-store";
import clsx from "clsx";
import { memo, ReactNode } from "react";

const NodeWrapper = ({ 
  children, 
  id,
  icon: Icon,
  label,
  selected,
}: { 
  children: ReactNode;
  id?: string;
  icon: LucideIcon;
  label: string;
  selected?: boolean;
}) => {
  const deleteNode = useFlowStore(state => state.deleteNode);
  
  const handleDelete = () => {
    if (id) {
      deleteNode(id);
    } 
  };

  return (
    <div className={clsx(
      "relative",
      "min-w-[280px] max-w-[320px]",
      "rounded-lg border",
      "bg-background/95 backdrop-blur-sm",
      "transition-all duration-300 ease-in-out",
      selected 
        ? "ring-2 ring-primary/70 shadow-[0_0_15px_rgba(var(--primary)/0.15)] border-primary/40" 
        : "shadow-sm hover:shadow-md border-border/50 hover:border-border/80",
      "group"
    )}>
      <div className={clsx(
        "flex items-center gap-2 p-2 border-b",
        "bg-background/80 backdrop-blur-sm",
        selected ? "border-primary/30" : "border-border/60"
      )}>
        <div className="flex items-center gap-2 flex-1">
          <div className={clsx(
            "p-1.5 rounded-md",
            selected ? "bg-primary/20" : "bg-primary/10",
            "transition-colors duration-300"
          )}>
            <Icon className={clsx(
              "h-4 w-4", 
              selected ? "text-primary" : "text-primary/80",
              "transition-colors duration-300"
            )} />
          </div>
          <span className="font-medium text-sm tracking-tight">{label}</span>
        </div>
        {id && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className={clsx(
              "p-1.5 rounded-md transition-colors",
              "opacity-70 hover:opacity-100",
              "hover:bg-destructive/10 hover:text-destructive"
            )}
            aria-label="Delete node"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
      <div className="p-4 rounded-b-lg">
        {children}
      </div>
    </div>
  );
};

NodeWrapper.displayName = 'NodeWrapper';
export default memo(NodeWrapper);