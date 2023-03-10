export interface DurationData {
  timeRemaining?: number;
  referenceTime: number;
}

export interface PandemicData {
  timeRemaining: number;
  duration: number;
  /**
   * The multiple of the buff duration that the buff can pandemic to.
   *
   * Typically debuffs pandemic 1.5x, buffs pandemic to 3x.
   */
  pandemicCap?: number;
}

export interface Range {
  atLeast?: number;
  atMost?: number;
}
