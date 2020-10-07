// WCL properties 
export interface WCLFight {
  id: number,
  // eslint-disable-next-line camelcase
  start_time: number,
  // eslint-disable-next-line camelcase
  end_time: number,
  boss: number,
  name: string,
  size?: number,
  difficulty?: number,
  kill?: boolean,
}

//generated or applied properties
export interface Fight extends WCLFight {
  filtered?: boolean;
  phase?: string;
  instance?: number;
  // eslint-disable-next-line camelcase
  offset_time: number;
  // eslint-disable-next-line camelcase
  original_end_time: number;
}

export default Fight;
