import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TALENTS_MONK as talents } from 'common/TALENTS';
import HotTrackerMW from '../core/HotTrackerMW';
import Combatants from 'parser/shared/modules/Combatants';
import { TIERS } from 'game/TIERS';
import Events, { HealEvent } from 'parser/core/Events';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import { SPELL_COLORS } from '../../constants';
import { formatDuration, formatNumber } from 'common/format';
import DonutChart from 'parser/ui/DonutChart';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemSetLink from 'interface/ItemSetLink';
import { MONK_TWW1_ID } from 'common/ITEMS/dragonflight';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import HotTracker, { Extension } from 'parser/shared/modules/HotTracker';
import SpellLink from 'interface/SpellLink';
import { TooltipElement } from 'interface/Tooltip';

const ATTRIBUTION_PREFIX = 'Tier32';
const TWO_PIECE_INCREASE = 0.1;
const EXTENSION_PER_CAST = 3000;
const TIER_SET_HOTS = [SPELLS.RENEWING_MIST_HEAL, talents.ENVELOPING_MIST_TALENT];

class T32TierSet extends Analyzer {
  static dependencies = {
    hotTracker: HotTrackerMW,
    combatants: Combatants,
  };

  protected hotTracker!: HotTrackerMW;
  protected combatants!: Combatants;

  twoPieceHealingBySpell = new Map<number, number>();

  fourPieceActive: boolean = false;
  fourPieceExtensionBySpell = new Map<number, number>();

  missedCasts: number = 0;
  totalCasts: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.has2PieceByTier(TIERS.TWW1);
    this.fourPieceActive = this.selectedCombatant.has4PieceByTier(TIERS.TWW1);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TIER_SET_HOTS),
      this.onTwoPieceHeal,
    );

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.VIVIFY), this.onVivify);
  }

  get renewingMistHealing_2p() {
    return this.twoPieceHealingBySpell.get(SPELLS.RENEWING_MIST_HEAL.id) || 0;
  }

  get envelopingMistHealing_2p() {
    return this.twoPieceHealingBySpell.get(talents.ENVELOPING_MIST_TALENT.id) || 0;
  }

  get twoPieceHealing() {
    return this.renewingMistHealing_2p + this.envelopingMistHealing_2p;
  }

  get fourPieceReMExtension() {
    return this.fourPieceExtensionBySpell.get(SPELLS.RENEWING_MIST_HEAL.id) || 0;
  }

  get fourPieceEnvExtension() {
    return this.fourPieceExtensionBySpell.get(talents.ENVELOPING_MIST_TALENT.id) || 0;
  }

  get fourPieceRemHealing() {
    const filteredExtensions: Set<Extension> = new Set<Extension>();
    this.hotTracker.hotHistory.forEach(function (tracker) {
      if (tracker.spellId === SPELLS.RENEWING_MIST_HEAL.id) {
        const extensions = tracker.extensions.filter((extension) =>
          extension.attribution.name.includes(ATTRIBUTION_PREFIX),
        );
        if (extensions) {
          extensions.forEach((ext) => filteredExtensions.add(ext));
        }
      }
    });
    const result = [...filteredExtensions].reduce((sum, ext) => sum + ext.attribution.healing, 0);
    return result;
  }

  get fourPieceEnvHealing() {
    const filteredExtensions: Set<Extension> = new Set<Extension>();
    this.hotTracker.hotHistory.forEach(function (tracker) {
      if (tracker.spellId === talents.ENVELOPING_MIST_TALENT.id) {
        const extensions = tracker.extensions.filter((extension) =>
          extension.attribution.name.includes(ATTRIBUTION_PREFIX),
        );
        if (extensions) {
          extensions.forEach((ext) => filteredExtensions.add(ext));
        }
      }
    });
    const result = [...filteredExtensions].reduce((sum, ext) => sum + ext.attribution.healing, 0);
    return result;
  }

  get fourPieceHealing() {
    return this.fourPieceRemHealing + this.fourPieceEnvHealing;
  }

  private onTwoPieceHeal(event: HealEvent) {
    const spellId = event.ability.guid;
    const amount = calculateEffectiveHealing(event, TWO_PIECE_INCREASE);
    const spell = this.twoPieceHealingBySpell.get(spellId);
    this.twoPieceHealingBySpell.set(spellId, (spell ?? 0) + amount);
  }

  private onVivify(event: HealEvent) {
    this.totalCasts += 1;
    const targetId = event.targetID;
    //check for active hots
    if (
      !this.hotTracker.hots[targetId] ||
      (!this.hotTracker.hots[targetId][TIER_SET_HOTS[0].id] &&
        !this.hotTracker.hots[targetId][TIER_SET_HOTS[1].id])
    ) {
      this.missedCasts += 1;
      return;
    }
    const attrib = ATTRIBUTION_PREFIX;

    Object.keys(this.hotTracker.hots[targetId]).forEach((spellIdString) => {
      const spellId = Number(spellIdString);
      //skip enveloping breath
      if (spellId === SPELLS.ENVELOPING_BREATH_HEAL.id) {
        return;
      }

      const hot = this.hotTracker.hots[targetId][spellId];
      //can only be extended once
      const hasExtension = hot?.extensions.find((x) => x.attribution.name === ATTRIBUTION_PREFIX);
      if (hasExtension) {
        return;
      }

      //add extension
      const attribution = HotTracker.getNewAttribution(attrib);
      this.hotTracker.addExtension(
        attribution,
        EXTENSION_PER_CAST,
        targetId,
        spellId,
        event.timestamp,
      );
      //increase max duration
      hot.maxDuration = hot.maxDuration! + EXTENSION_PER_CAST;
      const spell = this.fourPieceExtensionBySpell.get(spellId);
      this.fourPieceExtensionBySpell.set(spellId, (spell ?? 0) + EXTENSION_PER_CAST);
    });
  }

  private renderDonutChart() {
    const items = [
      {
        color: SPELL_COLORS.RENEWING_MIST,
        label: 'Renewing Mist',
        spellId: talents.RENEWING_MIST_TALENT.id,
        value: this.renewingMistHealing_2p,
        valueTooltip: formatNumber(this.renewingMistHealing_2p),
      },
      {
        color: SPELL_COLORS.ENVELOPING_MIST,
        label: 'Enveloping Mist',
        spellId: talents.ENVELOPING_MIST_TALENT.id,
        value: this.envelopingMistHealing_2p,
        valueTooltip: formatNumber(this.envelopingMistHealing_2p),
      },
    ];
    return <DonutChart items={items} />;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(0)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            Out of {this.totalCasts} casts of <SpellLink spell={SPELLS.VIVIFY} />,{' '}
            {this.missedCasts} were on targets without{' '}
            <SpellLink spell={talents.ENVELOPING_MIST_TALENT} /> or{' '}
            <SpellLink spell={talents.RENEWING_MIST_TALENT} />.
          </>
        }
      >
        <ItemSetLink id={MONK_TWW1_ID}>
          <>Gatecrasher's Fortitude (T32 tier set)</>
        </ItemSetLink>
        <div className="pad">
          <h4>2 Piece</h4>
          <ItemHealingDone amount={this.twoPieceHealing} />
          <div className="pad"></div>
          {this.renderDonutChart()}
        </div>
        {this.fourPieceActive && (
          <div className="pad">
            <hr />
            <h4>4 Piece</h4>
            <TooltipElement
              content={
                <>
                  NOTE: This analysis is only showing the hps from the additional hot healing and
                  does not take into account the additional{' '}
                  <SpellLink spell={SPELLS.INVIGORATING_MISTS_HEAL} /> or additional{' '}
                  <SpellLink spell={talents.ENVELOPING_MIST_TALENT} /> bonus healing that comes from
                  the extra duration.
                </>
              }
            >
              <ItemHealingDone amount={this.fourPieceHealing} />
            </TooltipElement>
            <div className="pad"></div>
            <div>
              <small>
                <SpellLink spell={talents.RENEWING_MIST_TALENT} />:{' '}
              </small>
              {formatDuration(this.fourPieceReMExtension)}
              <div></div>
              <small>
                <SpellLink spell={talents.ENVELOPING_MIST_TALENT} />:{' '}
              </small>
              {formatDuration(this.fourPieceEnvExtension)}
            </div>
          </div>
        )}
      </Statistic>
    );
  }
}

export default T32TierSet;
