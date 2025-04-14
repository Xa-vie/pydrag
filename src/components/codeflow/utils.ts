export const INDENTATION_WIDTH = 100; // Width of each indentation level

export const calculateIndentationLevel = (x: number): number => {
  return Math.max(0, Math.floor(x / INDENTATION_WIDTH) -1);
};

export const snapToIndentation = (x: number): number => {
  const level = calculateIndentationLevel(x);
  return level * INDENTATION_WIDTH;
}; 