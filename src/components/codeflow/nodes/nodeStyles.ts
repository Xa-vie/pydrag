import clsx from "clsx";

export const nodeStyles = {
    input: clsx(
      "w-full rounded-lg border border-input bg-background px-4 py-2",
      "text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary/60",
      "placeholder:text-muted-foreground/70",
      "transition-all duration-200 shadow-sm"
    ),
    inputIcon: "absolute left-3 top-1/2 -translate-y-1/2 text-primary h-5 w-5 pointer-events-none",
    label: "text-xs font-semibold text-foreground mb-2 block tracking-wide",
    handle: "!w-4 !h-4 !bg-primary/60 hover:!bg-primary/90 !border-2 !border-background !shadow-md transition-colors",
    handleLabel: "absolute text-xs font-medium bg-background/95 backdrop-blur-sm px-2 py-1 rounded border-2 shadow-sm whitespace-nowrap",
    suggestions: {
      container: "mt-3 space-y-2",
      title: "text-xs font-semibold text-foreground/80",
      list: "flex flex-wrap gap-2",
      item: clsx(
        "text-xs px-2.5 py-1 rounded-md border border-border/40",
        "shadow-sm backdrop-blur-md hover:bg-primary/10 hover:text-primary transition-all duration-150",
        "cursor-pointer select-none"
      )
    },
    error: "mt-2 text-xs text-destructive font-semibold",
    hint: "mt-2 text-xs text-foreground/70"
  };