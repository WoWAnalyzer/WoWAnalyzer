export interface DurationData {
  timeRemaining: number;
  referenceTime: number;
}

export interface PandemicData {
  timeRemaining: number;
  duration: number;
  pandemicCap?: number;
}

export interface Range {
  atLeast?: number;
  atMost?: number;
}
