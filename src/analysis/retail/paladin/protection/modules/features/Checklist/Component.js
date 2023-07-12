import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import { SpellLink } from 'interface';
import PreparationRule from 'parser/retail/modules/features/Checklist/PreparationRule';
import AplRule from 'parser/shared/metrics/apl/ChecklistRule';
import Checklist from 'parser/shared/modules/features/Checklist';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import PropTypes from 'prop-types';

const ProtectionPaladinChecklist = (props) => {
  const { castEfficiency, thresholds, extras } = props;
  const AbilityRequirement = (props) => (
    <GenericCastEfficiencyRequirement
      castEfficiency={castEfficiency.getCastEfficiencyForSpellId(props.spell)}
      {...props}
    />
  );
  AbilityRequirement.propTypes = {
    spell: PropTypes.number.isRequired,
  };

  return (
    <Checklist>
      <Rule
        name={
          <>
            Mitigate incoming damage with <SpellLink spell={SPELLS.SHIELD_OF_THE_RIGHTEOUS} /> and{' '}
            <SpellLink spell={SPELLS.CONSECRATION_CAST} />
          </>
        }
        description={
          <>
            Maintain <SpellLink spell={SPELLS.CONSECRATION_CAST} /> to reduce all incoming damage by
            a flat amount and use it as a rotational filler if necessary.
            <br />
            Use <SpellLink spell={SPELLS.SHIELD_OF_THE_RIGHTEOUS} /> to smooth out your physical
            damage taken. <SpellLink spell={TALENTS.ARDENT_DEFENDER_TALENT} /> can be used either as
            a cooldown to mitigate boss abilities or to cover time when{' '}
            <SpellLink spell={SPELLS.SHIELD_OF_THE_RIGHTEOUS} /> is unavailable.
          </>
        }
      >
        <Requirement name="Use your Holy Power efficiently" thresholds={thresholds.hpWaste} />
        <Requirement
          name={
            <>
              Hits Mitigated with <SpellLink spell={SPELLS.SHIELD_OF_THE_RIGHTEOUS} />
            </>
          }
          thresholds={thresholds.sotrHitsMitigated}
          tooltip="Only counts physical hits. Some spells that generate a large number of low-damage events are excluded."
        />
        <Requirement
          name={
            <>
              Hits Mitigated with <SpellLink spell={SPELLS.CONSECRATION_CAST} />
            </>
          }
          thresholds={thresholds.consecration}
        />
      </Rule>
      <Rule
        name={
          <>
            Use <SpellLink spell={SPELLS.WORD_OF_GLORY} /> to heal yourself
          </>
        }
        description={
          <>
            You should use <SpellLink spell={SPELLS.WORD_OF_GLORY} /> to heal yourself (or others,
            with <SpellLink spell={TALENTS.HAND_OF_THE_PROTECTOR_TALENT} />
            ). However, you should <b>not</b> do this at the expense of{' '}
            <SpellLink spell={SPELLS.SHIELD_OF_THE_RIGHTEOUS} /> uptime. Instead, take advantage of{' '}
            <SpellLink spell={SPELLS.SHINING_LIGHT} /> to make most of your{' '}
            <SpellLink spell={SPELLS.WORD_OF_GLORY} /> casts free.
            <br />
            <em>Section under construction.</em>
          </>
        }
      >
        <Requirement
          name={
            <>
              <SpellLink spell={SPELLS.WORD_OF_GLORY} /> casts with large overhealing
            </>
          }
          tooltip="Critical heals are excluded. A cast is counted as having large overhealing if at least 25% of it overhealed."
          thresholds={thresholds.wogOverheal}
        />
        <Requirement
          name={
            <>
              Free casts from <SpellLink spell={SPELLS.SHINING_LIGHT} /> wasted
            </>
          }
          tooltip="A cast is wasted if the Shining Light buff expires without being used."
          thresholds={thresholds.wogSlWaste}
        />
      </Rule>
      <AplRule {...props} cooldowns={[SPELLS.AVENGING_WRATH, TALENTS.DIVINE_TOLL_TALENT]} />
      <PreparationRule thresholds={thresholds} />
    </Checklist>
  );
};

ProtectionPaladinChecklist.propTypes = {
  castEfficiency: PropTypes.object.isRequired,
  combatant: PropTypes.shape({
    hasTalent: PropTypes.func.isRequired,
  }).isRequired,
  thresholds: PropTypes.object.isRequired,
  extras: PropTypes.object.isRequired,
};

export default ProtectionPaladinChecklist;
