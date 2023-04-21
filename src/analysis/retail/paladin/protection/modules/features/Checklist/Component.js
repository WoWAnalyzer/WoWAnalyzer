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
            Mitigate incoming damage with <SpellLink id={SPELLS.SHIELD_OF_THE_RIGHTEOUS.id} /> and{' '}
            <SpellLink id={SPELLS.CONSECRATION_CAST.id} />
          </>
        }
        description={
          <>
            Maintain <SpellLink id={SPELLS.CONSECRATION_CAST.id} /> to reduce all incoming damage by
            a flat amount and use it as a rotational filler if necessary.
            <br />
            Use <SpellLink id={SPELLS.SHIELD_OF_THE_RIGHTEOUS.id} /> to smooth out your physical
            damage taken. <SpellLink id={TALENTS.ARDENT_DEFENDER_TALENT.id} /> can be used either as
            a cooldown to mitigate boss abilities or to cover time when{' '}
            <SpellLink id={SPELLS.SHIELD_OF_THE_RIGHTEOUS.id} /> is unavailable.
          </>
        }
      >
        <Requirement name="Use your Holy Power efficiently" thresholds={thresholds.hpWaste} />
        <Requirement
          name={
            <>
              Hits Mitigated with <SpellLink id={SPELLS.SHIELD_OF_THE_RIGHTEOUS.id} />
            </>
          }
          thresholds={thresholds.sotrHitsMitigated}
          tooltip="Only counts physical hits. Some spells that generate a large number of low-damage events are excluded."
        />
        <Requirement
          name={
            <>
              Hits Mitigated with <SpellLink id={SPELLS.CONSECRATION_CAST.id} />
            </>
          }
          thresholds={thresholds.consecration}
        />
      </Rule>
      <Rule
        name={
          <>
            Use <SpellLink id={SPELLS.WORD_OF_GLORY.id} /> to heal yourself
          </>
        }
        description={
          <>
            You should use <SpellLink id={SPELLS.WORD_OF_GLORY.id} /> to heal yourself (or others,
            with <SpellLink id={TALENTS.HAND_OF_THE_PROTECTOR_TALENT.id} />
            ). However, you should <b>not</b> do this at the expense of{' '}
            <SpellLink id={SPELLS.SHIELD_OF_THE_RIGHTEOUS.id} /> uptime. Instead, take advantage of{' '}
            <SpellLink id={SPELLS.SHINING_LIGHT.id} /> to make most of your{' '}
            <SpellLink id={SPELLS.WORD_OF_GLORY.id} /> casts free.
            <br />
            <em>Section under construction.</em>
          </>
        }
      >
        <Requirement
          name={
            <>
              <SpellLink id={SPELLS.WORD_OF_GLORY.id} /> casts with large overhealing
            </>
          }
          tooltip="Critical heals are excluded. A cast is counted as having large overhealing if at least 25% of it overhealed."
          thresholds={thresholds.wogOverheal}
        />
        <Requirement
          name={
            <>
              Free casts from <SpellLink id={SPELLS.SHINING_LIGHT.id} /> wasted
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
