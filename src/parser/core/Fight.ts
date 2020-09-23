export interface Fight {
  filtered?: boolean;
  phase?: string;
  instance?: number;
  // eslint-disable-next-line camelcase
  offset_time: number;
  // eslint-disable-next-line camelcase
  original_end_time: number;

  // Below are WCL properties, above are generated or applied properties
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

export default Fight;
