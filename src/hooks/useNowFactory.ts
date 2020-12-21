/** Calls and returns the result from `new Date()` */
function nowFactory() {
  return new Date();
}

/** Provider function for the native `new Date()` side-effect */
export default function useNowFactory() {
  return nowFactory;
}
