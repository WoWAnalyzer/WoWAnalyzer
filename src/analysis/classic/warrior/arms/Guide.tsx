import SPELLS from 'common/SPELLS/classic';
import { maybeGetTalentOrSpell } from 'common/maybeGetTalentOrSpell';
import { CLASSIC_EXPANSION } from 'game/Expansion';
import { Section, useInfo } from 'interface/guide';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import { FoundationCooldownSection } from 'interface/guide/foundation/FoundationCooldownSection';
import { FoundationDowntimeSection } from 'interface/guide/foundation/FoundationDowntimeSection';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import { useMemo } from 'react';

const COOLDOWN_BLACKLIST = [SPELLS.BLADESTORM.id, SPELLS.SWEEPING_STRIKES.id];

export default function Guide() {
  const abilities = useInfo()?.abilities;
  // want to exclude some aoe-only cooldowns from the cd list.
  // these probably warrant special handling for aoe fights but I'm not certain what that should look like
  const cooldowns = useMemo(() => {
    return abilities
      ?.filter(
        (ability) =>
          ability.category === SPELL_CATEGORY.COOLDOWNS &&
          ability.enabled &&
          !COOLDOWN_BLACKLIST.includes(ability.primarySpell),
      )
      .sort((a, b) => b.cooldown - a.cooldown)
      .map((ability) => ({
        spell: maybeGetTalentOrSpell(ability.primarySpell)!,
      }));
  }, [abilities]);
  return (
    <>
      <Section title="Core Skills">
        <FoundationDowntimeSection />
        <FoundationCooldownSection cooldowns={cooldowns ?? []} />
      </Section>
      <PreparationSection expansion={CLASSIC_EXPANSION} />
    </>
  );
}
