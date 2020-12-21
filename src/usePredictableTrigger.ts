import { useEffect, useRef } from 'react';

function getNowDefault () {
  return new Date()
}

const DEFAULT_INTERVAL_MINS = 15
const DEFAULT_OFFSET = 0

/**
 * Invoke a trigger function at every `intervalMins` minutes past the hour; default 15 min.
 * @param trigger the trigger function to be invoked
 * @param options configuration for the interval
 */
export default function usePredictableTrigger(
  trigger: Function,
  options: {
    /** the interval past the hour in whole minutes */
    intervalMins?: number;
    /** an offset past the hour for the interval e.g. offset=17 intervalMins=15 means at 2, 17, 32, 47 */
    offset?: number;
    /** an optional injectable factory function for getting the current Date */
    nowFactory?: () => Date
  } = {},
) {
  const {
    intervalMins,
    offset,
    nowFactory
  } = options
  const getNow = nowFactory ?? getNowDefault
  const savedCallback = useRef<Function>();

  useEffect(() => {
    savedCallback.current = trigger;
  }, [trigger]);

  useEffect(() => {
    const opts = {
      intervalMins: Math.floor(intervalMins ?? DEFAULT_INTERVAL_MINS) || 1,
      offset: Math.floor(offset ?? DEFAULT_OFFSET),
    };

    if (opts.offset >= opts.intervalMins) {
      opts.offset -= opts.intervalMins;
    }

    const snoozeUntil = getNow();
    snoozeUntil.setSeconds(0);
    snoozeUntil.setMilliseconds(0);
    snoozeUntil.setMinutes(
      opts.intervalMins * Math.floor(snoozeUntil.getMinutes() / opts.intervalMins) +
        opts.intervalMins +
        opts.offset,
    );
    const delayMs = opts.intervalMins * 60 * 1000;

    let intervalHandle: number | undefined;

    function tick() {
      savedCallback.current && savedCallback.current();
    }
    function wake() {
      intervalHandle = setInterval(tick, delayMs);
      tick();
    }

    const now = getNow();
    const snoozeMs = +snoozeUntil - +now;
    const snoozeHandle = setTimeout(wake, snoozeMs);

    return () => {
      clearTimeout(snoozeHandle);
      clearInterval(intervalHandle);
    };
  }, [trigger, intervalMins, offset, getNow]);
}
