import { breakpointsTailwind } from '@vueuse/core'

export function useIsSmallScreen() {
  const breakpoints = useBreakpoints(breakpointsTailwind)
  return breakpoints.smaller('md')
}

export function useIsSmallLg() {
  const breakpoints = useBreakpoints(breakpointsTailwind)
  return breakpoints.smaller('lg')
}
