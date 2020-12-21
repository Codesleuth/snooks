import { useEffect, useRef } from 'react';

const DEFAULT_DELAY_MS = 15 * 60 * 1000

/**
 * Invoke a trigger function at every `delayMs` milliseconds.
 * @param trigger the trigger function to be invoked
 * @param delayMs the delay in milliseconds, default 15min
 */
export default function useTrigger(trigger: Function, delayMs = DEFAULT_DELAY_MS) {
  const savedCallback = useRef<Function>();

  useEffect(() => {
    savedCallback.current = trigger;
  }, [trigger]);

  useEffect(() => {
    function tick() {
      savedCallback.current && savedCallback.current();
    }
    const timer = setInterval(tick, delayMs);
    return () => clearInterval(timer);
  }, [trigger, delayMs]);
}
