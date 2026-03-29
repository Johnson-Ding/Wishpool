export const demoPageVariants = {
  initial: (direction: "forward" | "back") => ({
    x: direction === "forward" ? "100%" : "-30%",
    opacity: direction === "forward" ? 0.6 : 0.8,
  }),
  animate: { x: 0, opacity: 1 },
  exit: (direction: "forward" | "back") => ({
    x: direction === "forward" ? "-30%" : "100%",
    opacity: 0.5,
  }),
};
