import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, ResourceChangeEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS/classic/druid';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import SpellLink from 'interface/SpellLink';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import HotTrackerRestoDruid from '../core/HotTrackerRestoDruid';
import Combatants from 'parser/shared/modules/Combatants';
import ItemLink from 'interface/ItemLink';
import ITEMS from 'common/ITEMS/classic';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringValue from 'parser/ui/BoringValueText';
import ManaIcon from 'interface/icons/Mana';
import { formatNumber } from 'common/format';
import { getBloomCausingRegen } from '../normalizers/CastLinkNormalizer';

class Lifebloom extends Analyzer {
  static dependencies = {
    hotTracker: HotTrackerRestoDruid,
    combatants: Combatants,
  };

  constructor(options: Options) {
    super(options);
    this.active = true;

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.LIFEBLOOM),
      this.castLifebloom,
    );

    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.LIFEBLOOM_REGEN),
      this.regenLifebloom,
    );
  }

  protected hotTracker!: HotTrackerRestoDruid;
  clearcastAttrib = HotTrackerRestoDruid.getNewAttribution('Clearcast');
  combatants!: Combatants;
  activeLifeblooms: number = 0;
  manaFromLifebloom: number = 0;
  /** Box row entry for each Lifebloom cast */
  castEntries: BoxRowEntry[] = [];
  lifeBloomPerPlayer: { [playerId: number]: { casts: number; clearcastCount: number } } = {};

  get mp5FromLifebloom(): number {
    return (this.manaFromLifebloom / (this.owner.fightDuration / 1000)) * 5;
  }

  castLifebloom(event: CastEvent) {
    let value: QualitativePerformance;

    const isClearcast = this.selectedCombatant.hasBuff(SPELLS.CLEARCASTING.id, event.timestamp);
    const isHealingTrance = this.selectedCombatant.hasBuff(ITEMS.SOUL_PRESERVER.buffs[0].id);
    if (isClearcast || isHealingTrance) {
      value = QualitativePerformance.Good;
    } else {
      value = QualitativePerformance.Ok;
    }

    const target = this.combatants.getEntity(event);
    if (!event.targetID || !target) {
      console.warn("Couldn't find target for Lifebloom cast", event);
      return; // can't do further handling without target
    }

    const tooltip = (
      <>
        @ <strong>{this.owner.formatTimestamp(event.timestamp)}</strong>
        <br />
        targetting <strong>{target.name}</strong>
        <br />
        {isClearcast && (
          <strong>
            <SpellLink spell={SPELLS.CLEARCASTING} /> proc
          </strong>
        )}
        {isHealingTrance && (
          <strong>
            <ItemLink id={ITEMS.SOUL_PRESERVER.id} /> proc
          </strong>
        )}
      </>
    );

    this.castEntries.push({ value, tooltip });

    const lifeBloomForTarget = this.lifeBloomPerPlayer[event.targetID];
    if (!lifeBloomForTarget) {
      this.lifeBloomPerPlayer[event.targetID] = { casts: 1, clearcastCount: isClearcast ? 1 : 0 };
    } else {
      this.lifeBloomPerPlayer[event.targetID] = {
        casts: lifeBloomForTarget.casts + 1,
        clearcastCount: lifeBloomForTarget.clearcastCount + (isClearcast ? 1 : 0),
      };
    }
  }

  regenLifebloom(event: ResourceChangeEvent) {
    const lifeBloomEvent = getBloomCausingRegen(event);
    if (!lifeBloomEvent) {
      return;
    }

    const activeLifeBloom = this.lifeBloomPerPlayer[lifeBloomEvent.targetID];
    // Check for an active life bloom with a clearcast count
    if (!activeLifeBloom || activeLifeBloom.clearcastCount === 0) {
      delete this.lifeBloomPerPlayer[lifeBloomEvent.targetID];
      return;
    }

    const manaReturned =
      Math.floor(event.resourceChange / (activeLifeBloom.casts / activeLifeBloom.clearcastCount)) -
      event.waste;

    this.manaFromLifebloom += manaReturned;
    delete this.lifeBloomPerPlayer[lifeBloomEvent.targetID];
  }

  /** Guide subsectopm describing the proper usage of Swiftmend */
  get guideSubsection(): JSX.Element {
    const explanation = (
      <>
        <p>
          <b>
            <SpellLink spell={SPELLS.LIFEBLOOM} />
          </b>{' '}
          is a heal-over-time effect that heals every second for 7 seconds and stacks up to 3 times.
          When it expires it heals for an additional amount and refunds half the mana cost.
        </p>
        <p>
          Casting this during a <SpellLink spell={SPELLS.CLEARCASTING} /> or{' '}
          <ItemLink id={ITEMS.SOUL_PRESERVER.id} /> proc, will generate mana.
        </p>
      </>
    );

    // Build up description of chart, which varies based on talents
    let chartDescription = ' - ';
    // no procs
    chartDescription +=
      'Green is a cast while Clearcasting is active, Yellow is a full cost Lifebloom cast.';
    chartDescription += ' Mouseover for more details.';

    const data = (
      <div>
        <strong>Lifebloom casts</strong>
        <small>{chartDescription}</small>
        <PerformanceBoxRow values={this.castEntries} />
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(52)} // chosen for fixed ordering of general stats
        size="flexible"
        tooltip="Mana returned during clearcasting procs (no mana cost)."
      >
        <BoringValue label={<SpellLink spell={SPELLS.LIFEBLOOM_REGEN} />}>
          <div>
            <ManaIcon /> {formatNumber(this.manaFromLifebloom)} <small>mana returned</small>
            <br />
            <ManaIcon /> {formatNumber(this.mp5FromLifebloom)}
            <small> MP5</small>
          </div>
        </BoringValue>
      </Statistic>
    );
  }
}

export default Lifebloom;
