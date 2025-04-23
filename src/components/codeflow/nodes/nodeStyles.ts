import clsx from "clsx";

export const nodeStyles = {
    input: clsx(
      "w-full rounded-md border-2 bg-background/80 px-3 py-2",
      "text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/80",
      "placeholder:text-muted-foreground/70",
      "transition-colors duration-200"
    ),
    inputIcon: "absolute left-3 top-1/2 -translate-y-1/2 text-foreground/70 h-4 w-4",
    label: "text-xs font-medium text-foreground mb-1.5 block",
    handle: "!w-4 !h-4 !bg-primary/60 hover:!bg-primary/90 !border-2 !border-background !shadow-md transition-colors",
    handleLabel: "absolute text-xs font-medium bg-background/95 backdrop-blur-sm px-2 py-1 rounded-sm border-2 shadow-sm whitespace-nowrap",
    suggestions: {
      container: "mt-3 space-y-1.5",
      title: "text-xs font-medium text-foreground",
      list: "flex flex-wrap gap-1.5",
      item: clsx(
        "text-xs px-2 py-1 rounded-sm border",
        "bg-muted/90 backdrop-blur-sm hover:bg-accent transition-colors",
        "cursor-pointer select-none"
      )
    },
    error: "mt-2 text-xs text-destructive font-medium",
    hint: "mt-2 text-xs text-foreground/80"
  };