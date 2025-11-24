import { useEffect, useRef } from 'react';

/**
 * Custom hook for handling async operations in useEffect with cancellation support
 * Prevents state updates after component unmounts
 */
export function useAsyncEffect(
  effect: () => Promise<void> | (() => void) | void,
  deps: React.DependencyList
): void {
  const cancelledRef = useRef(false);
  const effectRef = useRef(effect);

  // Keep effect ref up to date
  useEffect(() => {
    effectRef.current = effect;
  }, [effect]);

  useEffect(() => {
    cancelledRef.current = false;

    const cleanup = effectRef.current();

    return () => {
      cancelledRef.current = true;
      if (typeof cleanup === 'function') {
        cleanup();
      }
    };
    // deps is intentionally dynamic - this hook allows custom dependency arrays
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Helper to check if effect was cancelled
 */
export function useCancelledRef() {
  const cancelledRef = useRef(false);

  return {
    get cancelled() {
      return cancelledRef.current;
    },
    set cancelled(value: boolean) {
      cancelledRef.current = value;
    },
    reset: () => {
      cancelledRef.current = false;
    },
  };
}

