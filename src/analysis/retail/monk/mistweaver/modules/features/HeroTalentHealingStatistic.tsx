import Analyzer from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { SpellLink } from 'interface';
import { formatPercentage } from 'common/format';
import { Talent } from 'common/TALENTS/types';
import CelestialConduit from 'analysis/retail/monk/shared/hero/ConduitOfTheCelestials/talents/CelestialConduit';
import RestoreBalance from 'analysis/retail/monk/shared/hero/ConduitOfTheCelestials/talents/RestoreBalance';
import Coalesence from 'analysis/retail/monk/shared/hero/MasterOfHarmony/talents/Coalesence';
import AspectOfHarmony from '../heroTalents/AspectOfHarmony';
import MeditativeFocus from '../heroTalents/MeditativeFocus';
import YulonsKnowledge from '../heroTalents/YulonsKnowledge';
import StampedeOfTheAncients from '../heroTalents/StampedeOfTheAncients';
import StrengthOfTheBlackOx from '../heroTalents/StrengthOfTheBlackOx';
import UnityWithin from '../heroTalents/UnityWithin';
import TempleTraining from '../heroTalents/TempleTraining';
import XuensGuidance from '../heroTalents/XuensGuidance';
import NiuzaosProtection from '../heroTalents/NiuzaosProtection';
import JadeSanctuary from '../core/defensives/JadeSanctuary';
import CourageOfTheWhiteTiger from '../heroTalents/CourageOfTheWhiteTiger';
import HeartOfTheJadeSerpent from '../spells/HeartOfTheJadeSerpent';
import FlowingWisdom from '../heroTalents/FlowingWisdom';
import InnerCompass from 'analysis/retail/monk/shared/hero/ConduitOfTheCelestials/talents/InnerCompass';
import PathOfTheFallingStar from 'analysis/retail/monk/shared/hero/ConduitOfTheCelestials/talents/PathOfTheFallingStar';
import { TooltipElement } from 'interface/Tooltip';
import InformationIcon from 'interface/icons/Information';

// modules without a healing value contribute in ways that cannot be quantified as healing
interface HeroTalentModule extends Analyzer {
  talent: Talent;
  healing?: number;
}

class HeroTalentHealingStatistic extends Analyzer.withDependencies({
  celestialConduit: CelestialConduit,
  restoreBalance: RestoreBalance,
  yulonsKnowledge: YulonsKnowledge,
  strengthOfTheBlackOx: StrengthOfTheBlackOx,
  stampedeOfTheAncients: StampedeOfTheAncients,
  unityWithin: UnityWithin,
  templeTraining: TempleTraining,
  xuensGuidance: XuensGuidance,
  niuzaosProtection: NiuzaosProtection,
  jadeSanctuary: JadeSanctuary,
  courageOfTheWhiteTiger: CourageOfTheWhiteTiger,
  heartOfTheJadeSerpent: HeartOfTheJadeSerpent,
  flowingWisdom: FlowingWisdom,
  innerCompass: InnerCompass,
  pathOfTheFallingStar: PathOfTheFallingStar,
  coalesence: Coalesence,
  aspectOfHarmony: AspectOfHarmony,
  meditativeFocus: MeditativeFocus,
}) {
  buildTalentList(): HeroTalentModule[] {
    return (Object.values(this.deps) as HeroTalentModule[])
      .filter((module) => module.active)
      .sort((a, b) => (b.healing ?? -1) - (a.healing ?? -1));
  }

  get totalHealing() {
    return this.buildTalentList().reduce((sum, module) => sum + (module.healing ?? 0), 0);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(0)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <>
            <p>
              The purpose of this is to show the overall HPS impact of each hero talent. So not only
              what the talent itself did, but also feeding and synergy or interactions with other
              spells or talents. The percentage shown is what you'd lose without the talent.
            </p>
            <p>
              Note: Due to the synergies that exist between certain talents there is some overlap in
              the HPS contribution shown. Detailed breakdowns of each talent's impact can be found
              in this section.
            </p>
          </>
        }
      >
        <div className="pad">
          <label>Hero Talent Summary</label>
          {this.buildTalentList().map((module) => (
            <div className="flex" key={module.talent.id} style={{ marginBottom: 4 }}>
              <div className="flex-main">
                <SpellLink spell={module.talent} />
              </div>
              <div className="flex-sub text-right">
                {module.healing === undefined ? (
                  <TooltipElement content="This talent's contribution cannot be fully quantified as healing and is not included in the total.">
                    <InformationIcon />
                  </TooltipElement>
                ) : (
                  <>
                    {formatPercentage(this.owner.getPercentageOfTotalHealingDone(module.healing))} %
                  </>
                )}
              </div>
            </div>
          ))}
          <div
            className="flex"
            style={{ borderTop: '1px solid rgba(255,255,255,0.2)', marginTop: 6, paddingTop: 6 }}
          >
            <div className="flex-main">
              <strong>Total</strong>
            </div>
            <div className="flex-sub text-right">
              <strong>
                {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.totalHealing))} %
              </strong>
            </div>
          </div>
        </div>
      </Statistic>
    );
  }
}

export default HeroTalentHealingStatistic;
