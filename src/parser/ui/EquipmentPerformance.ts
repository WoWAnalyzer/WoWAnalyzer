//This is based on src\parser\ui\QualitativePerformance.ts but, for Equipment/Items.  This was split because of the drift that was starting to occur between the goal of the original QualitativePerformance and the needs of the evaluation of Gems in particular.

/**
 * An expression of quality of the equipment being looked at
 *
 * The ranking descriptions are as follows:
 * 'perfect' - the equipment is ideal for the spec and use case (This should be rare)
 * 'good' - the equipment is in general the best possible (e.g. All sockets have the best gems but, there is either no way of telling the best possible or there is a way of tell but, the gems aren't that)
 * 'ok' - the equipment is acceptable, but not ideal (e.g. Having 2 sockets but, they are filled with low level gems)
 * 'potential' - the equipment can be enhanced in a known way that is not actually part of the equipment. (e.g. a gem socket can be added)
 * 'fail' - the equipment is not acceptable (e.g. having sockets but, all of them are empty)
 *
 * If a boolean is provided instead, true is equivalent to 'good' and false is equivalent to 'fail'.
 */
export const enum EquipmentPerformance {
  Perfect = 'Perfect',
  Good = 'Good',
  Ok = 'Ok',
  Fail = 'Fail',
  Potential = 'Potential',
}

/**
 * Helper function to get the average perf from an array for an overall perf
 * @param perfs array of EquipmentPerformance enums
 * @returns average EquipmentPerformance in array
 */
export function getAveragePerf(perfs: EquipmentPerformance[]) {
  if (perfs.length === 0) {
    return EquipmentPerformance.Fail;
  }
  let total = 0;
  const order = [
    EquipmentPerformance.Fail,
    EquipmentPerformance.Potential,
    EquipmentPerformance.Ok,
    EquipmentPerformance.Good,
    EquipmentPerformance.Perfect,
  ];
  const orderArr = perfs.map((perf) => {
    return order.indexOf(perf);
  });
  orderArr.forEach((i) => {
    total += i;
  });
  const average = Math.floor(total / orderArr.length);
  return order[average];
}

/**
 * Helper function to get the lowest perf from an array to easily reduce to an overall perf
 * @param perfs array of EquipmentPerformance enums
 * @returns lowest EquipmentPerformance in array
 */
export function getLowestPerf(perfs: EquipmentPerformance[]): EquipmentPerformance {
  if (perfs.length === 0) {
    return EquipmentPerformance.Perfect;
  }
  const order = [
    EquipmentPerformance.Fail,
    EquipmentPerformance.Potential,
    EquipmentPerformance.Ok,
    EquipmentPerformance.Good,
    EquipmentPerformance.Perfect,
  ];
  const orderArr = perfs.map((perf) => {
    return order.indexOf(perf);
  });
  const lowestPerf = orderArr.reduce((accum, cur) => {
    return cur < accum ? cur : accum;
  });
  return order[lowestPerf];
}
