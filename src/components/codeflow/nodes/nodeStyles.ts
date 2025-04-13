import clsx from "clsx";

export const nodeStyles = {
    input: clsx(
      "w-full rounded-md border bg-background/70 px-3 py-2",
      "text-sm focus:outline-none focus:ring-1 focus:ring-primary/70",
      "placeholder:text-muted-foreground/50",
      "transition-colors duration-200"
    ),
    inputIcon: "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4",
    label: "text-xs font-medium text-muted-foreground mb-1.5 block",
    handle: "!w-3 !h-3 !bg-muted-foreground/50 hover:!bg-primary/50 !border-background !shadow-sm transition-colors",
    handleLabel: "absolute text-[10px] font-medium bg-background/90 backdrop-blur-sm px-1.5 py-0.5 rounded-sm border shadow-sm whitespace-nowrap",
    suggestions: {
      container: "mt-2 space-y-1",
      title: "text-[10px] font-medium text-muted-foreground",
      list: "flex flex-wrap gap-1",
      item: clsx(
        "text-[10px] px-1.5 py-0.5 rounded-sm",
        "bg-muted/80 backdrop-blur-sm hover:bg-muted transition-colors",
        "cursor-pointer select-none"
      )
    },
    error: "mt-1.5 text-[10px] text-destructive font-medium",
    hint: "mt-1.5 text-[10px] text-muted-foreground"
  };