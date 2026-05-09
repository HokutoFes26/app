import { useVisitedContext } from "@/contexts/VisitedContext";

export const useVisited = () => {
  const { visited, toggleVisited, isVisited, mounted } = useVisitedContext();

  return {
    visited,
    toggleVisited,
    isVisited,
    mounted,
  };
};
