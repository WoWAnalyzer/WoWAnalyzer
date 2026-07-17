import type { JSX } from 'react';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import TALENTS from 'common/TALENTS/paladin';
import { SpellLink } from 'interface';
import { SubSection } from 'interface/guide';
import CastOverview from 'interface/guide/components/CastOverview';
import GuideSection from 'interface/guide/components/GuideSection';
import StackedBar, { StackedBarSegment } from 'interface/guide/components/StackedBar';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { AnyEvent, CastEvent, GetRelatedEvent } from 'parser/core/Events';
import { INFUSION_OF_LIGHT_CONSUME } from '../../normalizers/EventLinks/EventLinkConstants';
import { SPELL_COLORS } from '../../constants';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../guide/Guide';

const WASTED_COLOR = '#A93226';

/** Only Judgment and Flash of Light consume a proc. Holy Light no longer does. */
const SPENDERS: Spell[] = [SPELLS.FLASH_OF_LIGHT, SPELLS.JUDGMENT_CAST_HOLY];

const SPENDER_COLORS: Record<number, string> = {
  [SPELLS.FLASH_OF_LIGHT.id]: SPELL_COLORS.FLASH_OF_LIGHT,
  [SPELLS.JUDGMENT_CAST_HOLY.id]: SPELL_COLORS.JUDGMENT,
};

/**
 * Infusion of Light
 *
 * A flat chance for a Holy Shock cast to make your next Judgment or Flash of Light
 * instant. It holds a single charge, or two with Inflorescence of the Sunwell.
 *
 * Charges are counted as they leave the buff rather than by checking whether the buff
 * happened to be up at the time of a cast -- a single proc can sit through several
 * eligible casts, so only the cast the normalizer links to the removal actually spent it.
 */
class InfusionOfLight extends Analyzer {
  /** Charges spent on a cast. */
  procsUsed = 0;
  /** Charges that ran out before being spent. */
  procsExpired = 0;
  /** Procs that arrived while already at max charges, so were never stored at all. */
  procsOvercapped = 0;
  castsBySpender: Record<number, number> = {};

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.INFUSION_OF_LIGHT_TALENT);
    if (!this.active) {
      return;
    }

    // Every charge leaves via one of these, whether it was spent or expired.
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.INFUSION_OF_LIGHT),
      this.onChargeRemoved,
    );
    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.INFUSION_OF_LIGHT),
      this.onChargeRemoved,
    );
    // A proc at max charges only refreshes the duration, so the proc itself is lost.
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.INFUSION_OF_LIGHT),
      this.onProcOvercapped,
    );
  }

  onChargeRemoved(event: AnyEvent) {
    const spender = GetRelatedEvent<CastEvent>(event, INFUSION_OF_LIGHT_CONSUME);
    if (!spender) {
      this.procsExpired += 1;
      return;
    }

    this.procsUsed += 1;
    const spellId = spender.ability.guid;
    this.castsBySpender[spellId] = (this.castsBySpender[spellId] ?? 0) + 1;
  }

  onProcOvercapped() {
    this.procsOvercapped += 1;
  }

  /** Every proc the fight gave you, whether it was storable or not. */
  get procs() {
    return this.procsUsed + this.procsExpired + this.procsOvercapped;
  }

  get procsWasted() {
    return this.procsExpired + this.procsOvercapped;
  }

  get procsUsedPercentage() {
    return this.procs === 0 ? 0 : this.procsUsed / this.procs;
  }

  private get maxCharges() {
    return this.selectedCombatant.hasTalent(TALENTS.INFLORESCENCE_OF_THE_SUNWELL_TALENT) ? 2 : 1;
  }

  private get explanation() {
    return (
      <>
        <p>
          <SpellLink spell={TALENTS.INFUSION_OF_LIGHT_TALENT} /> gives{' '}
          <SpellLink spell={TALENTS.HOLY_SHOCK_TALENT} /> a chance to make your next{' '}
          <SpellLink spell={SPELLS.JUDGMENT_CAST_HOLY} /> or{' '}
          <SpellLink spell={SPELLS.FLASH_OF_LIGHT} /> instant. It holds{' '}
          {this.maxCharges === 2 ? (
            <>
              two charges, thanks to{' '}
              <SpellLink spell={TALENTS.INFLORESCENCE_OF_THE_SUNWELL_TALENT} />
            </>
          ) : (
            'a single charge'
          )}
          .
        </p>
        <p>
          Spend your procs before they expire, and don't sit at max charges. Once you are capped,
          the next proc is lost entirely -- the buff simply refreshes and you gain nothing from it.
        </p>
      </>
    );
  }

  private get stats() {
    return [
      {
        value: `${this.procs}`,
        label: 'Procs Gained',
        tooltip: (
          <>
            Every <SpellLink spell={TALENTS.INFUSION_OF_LIGHT_TALENT} /> charge you gained, counted
            from the buff itself.
          </>
        ),
      },
      {
        value: `${this.procsUsed}`,
        label: 'Procs Used',
        tooltip: <>{formatPercentage(this.procsUsedPercentage, 0)}% of your procs were spent.</>,
      },
      {
        value: `${this.procsWasted}`,
        label: 'Procs Wasted',
        tooltip: (
          <>
            {this.procsExpired} expired before you spent them, {this.procsOvercapped} arrived while
            you were already at max charges.
          </>
        ),
      },
    ];
  }

  private get spenderSegments(): StackedBarSegment[] {
    const segments: StackedBarSegment[] = SPENDERS.map((spell) => ({
      spell,
      casts: this.castsBySpender[spell.id] ?? 0,
    }))
      .filter(({ casts }) => casts > 0)
      .sort((a, b) => b.casts - a.casts)
      .map(({ spell, casts }) => ({
        label: spell.name,
        value: casts,
        color: SPENDER_COLORS[spell.id],
        tooltip: (
          <>
            {casts} procs spent on <SpellLink spell={spell} />
          </>
        ),
      }));

    if (this.procsWasted > 0) {
      segments.push({
        label: 'Wasted',
        value: this.procsWasted,
        color: WASTED_COLOR,
        tooltip: (
          <>
            {this.procsExpired} procs expired before you spent them, {this.procsOvercapped} arrived
            while you were already at max charges.
          </>
        ),
      });
    }

    return segments;
  }

  get guideSubsection(): JSX.Element {
    return (
      <SubSection title="Infusion of Light">
        <GuideSection
          explanation={this.explanation}
          explanationPercent={GUIDE_CORE_EXPLANATION_PERCENT}
        >
          <CastOverview
            spell={SPELLS.INFUSION_OF_LIGHT}
            title="Infusion of Light Overview"
            stats={this.stats}
            additionalContent={{
              title: 'Proc Usage',
              content: <StackedBar segments={this.spenderSegments} />,
            }}
          />
        </GuideSection>
      </SubSection>
    );
  }
}

export default InfusionOfLight;
