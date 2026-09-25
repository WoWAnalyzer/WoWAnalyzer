export interface TimeWindow {
  startTime: number;
  endTime: number;
}

export interface ChargingTimeWindows extends TimeWindow {
  charges: number;
  maxCharges: number;
}

export interface BuffWindow extends TimeWindow {
  color: string;
  spellId: number;
}
