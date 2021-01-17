import React from 'react';
import PropTypes from 'prop-types';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Checklist from 'parser/shared/modules/features/Checklist';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';
import PreparationRule from 'parser/shared/modules/features/Checklist/PreparationRule';
import Requirement from 'parser/shared/modules/features/Checklist/Requirement';
import COVENANTS from 'game/shadowlands/COVENANTS';

const VengeanceDemonHunterChecklist = ({ combatant, castEfficiency, thresholds }) => {
  const AbilityRequirement = props => (
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
        name="Use your short cooldowns"
        description={(
          <>
            These should generally always be on recharge to maximize DPS, HPS and efficiency.<br />
            <a href="http://www.wowhead.com/vengeance-demon-hunter-rotation-guide#rotation-priority-list" target="_blank" rel="noopener noreferrer">More info.</a>
          </>
        )}
      >
        <AbilityRequirement spell={SPELLS.IMMOLATION_AURA.id} />
        {!(combatant.hasCovenant(COVENANTS.KYRIAN.id) && combatant.hasLegendaryByBonusID(SPELLS.RAZELIKHS_DEFILEMENT.bonusID)) && <AbilityRequirement spell={SPELLS.SIGIL_OF_FLAME_CONCENTRATED.id} />}
        <AbilityRequirement spell={SPELLS.FEL_DEVASTATION.id} />
        {combatant.hasTalent(SPELLS.FRACTURE_TALENT.id) && <AbilityRequirement spell={SPELLS.FRACTURE_TALENT.id} />}
        {combatant.hasTalent(SPELLS.FELBLADE_TALENT.id) && <AbilityRequirement spell={SPELLS.FELBLADE_TALENT.id} />}
        {combatant.hasCovenant(COVENANTS.KYRIAN.id) && <AbilityRequirement spell={SPELLS.ELYSIAN_DECREE.id} />}
        {combatant.hasCovenant(COVENANTS.VENTHYR.id) && <AbilityRequirement spell={SPELLS.SINFUL_BRAND.id} />}
        {combatant.hasCovenant(COVENANTS.NECROLORD.id) && <AbilityRequirement spell={SPELLS.FODDER_TO_THE_FLAME.id} />}
        {combatant.hasCovenant(COVENANTS.NIGHT_FAE.id) && <AbilityRequirement spell={SPELLS.THE_HUNT.id} />}
      </Rule>

      <Rule
        name="Use your rotational defensive/healing abilities"
        description={(
          <>
            Use these to block damage spikes and keep damage smooth to reduce external healing required.<br />
            <a href="http://www.wowhead.com/vengeance-demon-hunter-rotation-guide#rotation-priority-list" target="_blank" rel="noopener noreferrer">More info.</a>
          </>
        )}
      >
        <Requirement
          name={(
            <>
              <SpellLink id={SPELLS.DEMON_SPIKES.id} />
            </>
          )}
          thresholds={thresholds.demonSpikes}
        />
        {combatant.hasTalent(SPELLS.SPIRIT_BOMB_TALENT.id) && !combatant.hasTalent(SPELLS.FEED_THE_DEMON_TALENT.id) && (
          <Requirement
            name={(
              <>
                <SpellLink id={SPELLS.SPIRIT_BOMB_TALENT.id} /> casted at 4+ souls 
              </>
            )}
            thresholds={thresholds.spiritBombSoulsConsume}
          />
        )}
        {(!combatant.hasTalent(SPELLS.FEED_THE_DEMON_TALENT.id) && combatant.hasTalent(SPELLS.SPIRIT_BOMB_TALENT.id)) && (
          <Requirement
            name={(
              <>
                <SpellLink id={SPELLS.SOUL_CLEAVE.id} /> minimizing souls consumed
              </>
            )}
            thresholds={thresholds.soulCleaveSoulsConsumed}
          />
        )}
        {combatant.hasTalent(SPELLS.SOUL_BARRIER_TALENT.id) && <AbilityRequirement spell={SPELLS.SOUL_BARRIER_TALENT.id} />}
      </Rule>

      <Rule
        name="Use your long defensive/healing cooldowns"
        description={(
          <>
            Use these to mitigate large damage spikes or in emergency situations.<br />
            <a href="http://www.wowhead.com/vengeance-demon-hunter-rotation-guide#rotation-priority-list" target="_blank" rel="noopener noreferrer">More info.</a>
          </>
        )}
      >
        <AbilityRequirement spell={SPELLS.METAMORPHOSIS_TANK.id} />
        <AbilityRequirement spell={SPELLS.FIERY_BRAND.id} />
      </Rule>

      {(combatant.hasTalent(SPELLS.SPIRIT_BOMB_TALENT.id) || combatant.hasTalent(SPELLS.VOID_REAVER_TALENT.id)) && (
        <Rule
          name="Maintain your buffs and debuffs"
          description={(
            <>
              It is important to maintain these as they contribute a large amount to your DPS and HPS.<br />
              <a href="http://www.wowhead.com/vengeance-demon-hunter-rotation-guide#rotation-priority-list" target="_blank" rel="noopener noreferrer">More info.</a>
            </>
          )}
        >
          {combatant.hasTalent(SPELLS.SPIRIT_BOMB_TALENT.id) && (
            <Requirement
              name={(
                <>
                  <SpellLink id={SPELLS.FRAILTY_SPIRIT_BOMB_DEBUFF.id} /> debuff uptime
                </>
              )}
              thresholds={thresholds.spiritBombFrailtyDebuff}
            />
          )}
          {combatant.hasTalent(SPELLS.VOID_REAVER_TALENT.id) && (
            <Requirement
              name={(
                <>
                  <SpellLink id={SPELLS.VOID_REAVER_TALENT.id} /> debuff uptime
                </>
              )}
              thresholds={thresholds.voidReaverDebuff}
            />
          )}
        </Rule>
      )}

      <Rule
        name="Manage your resources properly"
        description={(
          <>
            You should always avoid capping your Fury/Souls and spend them regularly.
          </>
        )}
      >
        <Requirement
          name="Total Fury Waste"
          thresholds={thresholds.furyDetails}
        />
        {combatant.hasTalent(SPELLS.IMMOLATION_AURA.id) && (
          <Requirement
            name={(
              <>
                <SpellLink id={SPELLS.IMMOLATION_AURA.id} /> Fury wasted
              </>
            )}
            thresholds={thresholds.immolationAuraEfficiency}
          />
        )}

        
{!combatant.hasTalent(SPELLS.FRACTURE_TALENT.id) &&
        <Requirement
          name={(
            <>
                <SpellLink id={SPELLS.SHEAR.id} /> bad casts
            </>
          )}
          thresholds={thresholds.shearFracture}
        />}

        {combatant.hasTalent(SPELLS.FRACTURE_TALENT.id) &&
        <Requirement
          name={(
            <>
                <SpellLink id={SPELLS.FRACTURE_TALENT.id}/> bad casts
            </>
          )}
          thresholds={thresholds.shearFracture}
        />}
      </Rule>

      <PreparationRule thresholds={thresholds} />

    </Checklist>
  );
};

VengeanceDemonHunterChecklist.propTypes = {
  castEfficiency: PropTypes.object.isRequired,
  combatant: PropTypes.shape({
    hasTalent: PropTypes.func.isRequired,
    hasCovenant: PropTypes.func.isRequired,
    hasLegendaryByBonusID: PropTypes.func.isRequired,
  }).isRequired,
  thresholds: PropTypes.object.isRequired,
};

export default VengeanceDemonHunterChecklist;
