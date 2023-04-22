import Barkskin from 'analysis/retail/druid/guardian/modules/core/defensives/Barkskin';
import SurvivalInstincts from 'analysis/retail/druid/guardian/modules/core/defensives/SurvivalInstincts';
import RageOfTheSleeper from 'analysis/retail/druid/guardian/modules/core/defensives/RageOfTheSleeper';
import Pulverize from 'analysis/retail/druid/guardian/modules/core/defensives/Pulverize';

export const MAJOR_DEFENSIVE_ANALYZERS = [
  Barkskin,
  RageOfTheSleeper,
  Pulverize,
  SurvivalInstincts,
] as const;
