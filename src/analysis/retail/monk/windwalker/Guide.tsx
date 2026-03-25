import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { formatPercentage } from 'common/format';
import { SpellLink } from 'interface';
import { GuideProps, Section, SubSection } from 'interface/guide';
import { AplSectionData } from 'interface/guide/components/Apl';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import PreparationSection from 'interface/guide/components/Preparation/PreparationSection';
import CombatLogParser from './CombatLogParser';
import * as AplCheck from './modules/apl/AplCheck';
import windwalkerApl from './modules/apl/WindwalkerApl';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

export default function Guide({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  const hasStrikeOfTheWindlord = info.combatant.hasTalent(
    TALENTS_MONK.STRIKE_OF_THE_WINDLORD_TALENT,
  );
  const hasCelestialConduit = info.combatant.hasTalent(
    TALENTS_MONK.CELESTIAL_CONDUIT_WINDWALKER_TALENT,
  );

  return (
    <>
      <Section title="Preface & Disclaimers">
        <>
          The analysis in this guide is provided in collaboration with the{' '}
          <a href="https://discord.com/invite/peakofserenity">Peak of Serenity</a> Discord. Keep in
          mind that WoWAnalyzer is limited to what is present in your combat log, and we cannot
          always detect intentional deviations such as holding cooldowns for a specific strategy.
          <br />
          <br />
          If you notice any issues or errors in this analysis or have feature requests, please reach
          out to <code>@durpn</code> in the{' '}
          <a href="https://discord.com/invite/peakofserenity">Peak of Serenity</a> Discord.
        </>
      </Section>
      <Section title="Core Spells and Buffs">
        <>
          <p>
            Windwalker is a two-resource spec. <SpellLink spell={RESOURCE_TYPES.ENERGY} /> is the
            fuel that lets you build <SpellLink spell={RESOURCE_TYPES.CHI} />, and{' '}
            <SpellLink spell={RESOURCE_TYPES.CHI} /> is what turns into your meaningful damage. Good
            play is mostly about managing both at the same time: do not overcap either resource, but
            do not spend so freely that you starve yourself right before an important button becomes
            available.
          </p>
          <p>
            <SpellLink spell={SPELLS.TIGER_PALM} /> and <SpellLink spell={SPELLS.BLACKOUT_KICK} />{' '}
            are where this usually goes wrong. <SpellLink spell={SPELLS.TIGER_PALM} /> builds the
            resources you need, while <SpellLink spell={SPELLS.BLACKOUT_KICK} /> helps keep the spec
            moving and can be excellent value, but neither is usually the payoff. Their job is to
            support spells like <SpellLink spell={TALENTS_MONK.RISING_SUN_KICK_TALENT} />,{' '}
            <SpellLink spell={TALENTS_MONK.FISTS_OF_FURY_TALENT} />
            {hasStrikeOfTheWindlord && (
              <>
                , <SpellLink spell={TALENTS_MONK.STRIKE_OF_THE_WINDLORD_TALENT} />
              </>
            )}{' '}
            and proc-driven casts, not to crowd them out. A common mistake is pressing{' '}
            <SpellLink spell={SPELLS.BLACKOUT_KICK} /> when you are low on{' '}
            <SpellLink spell={RESOURCE_TYPES.ENERGY} />, sitting at only enough{' '}
            <SpellLink spell={RESOURCE_TYPES.CHI} /> for a medium spender, and{' '}
            <SpellLink spell={TALENTS_MONK.FISTS_OF_FURY_TALENT} /> is about to come up. That often
            forces extra <SpellLink spell={SPELLS.TIGER_PALM} /> casts and delays your real damage
            window.
          </p>
          <p>
            This is the downtime trap: sometimes the correct play is to do nothing for a moment. If{' '}
            <SpellLink spell={TALENTS_MONK.FISTS_OF_FURY_TALENT} />
            {hasStrikeOfTheWindlord && (
              <>
                {' '}
                or <SpellLink spell={TALENTS_MONK.STRIKE_OF_THE_WINDLORD_TALENT} />
              </>
            )}{' '}
            is about to be ready, you are low on <SpellLink spell={RESOURCE_TYPES.ENERGY} />, and
            spending <SpellLink spell={SPELLS.BLACKOUT_KICK} /> would leave you unable to use the
            stronger button on time, waiting is better than filling the global. These panels are
            useful because they show whether you were feeding your priority spells correctly or
            spending resources in ways that made them late.
            {hasCelestialConduit && (
              <>
                {' '}
                When playing Conduit of the Celestials,{' '}
                <SpellLink spell={SPELLS.HEART_OF_THE_JADE_SERPENT_BUFF} /> adds another layer to
                that planning because it changes the value and timing of several of the spells shown
                in this section.
              </>
            )}
          </p>
        </>
        <MasteryGraph modules={modules} events={events} info={info} />
        {hasCelestialConduit &&
          modules.heartOfTheJadeSerpent.guideSubsection(modules.celestialConduit.clipAnalysis)}
        {modules.risingSunKick.guideSubsection}
        {modules.fistsofFury.guideSubsection}
        {hasStrikeOfTheWindlord && modules.strikeoftheWindlord.guideSubsection}
        {info.combatant.hasTalent(TALENTS_MONK.SLICING_WINDS_TALENT) &&
          modules.slicingWinds.guideSubsection}
      </Section>
      <Section title="Major cooldowns">
        <p>
          In general, use cooldowns as close to cooldown as possible. If you can stack them without
          losing a cast, that is usually better than desyncing them for no reason.{' '}
          <SpellLink spell={TALENTS_MONK.ZENITH_TALENT} /> is always part of that plan, so go into
          each Zenith window with enough resources to spend strong globals immediately instead of
          fixing chi with multiple <SpellLink spell={SPELLS.TIGER_PALM} /> casts.
        </p>
        <p>
          When playing Conduit of the Celestials, your biggest burst window is still{' '}
          <SpellLink spell={TALENTS_MONK.INVOKE_XUEN_THE_WHITE_TIGER_TALENT} /> into{' '}
          <SpellLink spell={TALENTS_MONK.CELESTIAL_CONDUIT_WINDWALKER_TALENT} />. Plan ahead so you
          are not spending a low-value global summoning Xuen when you want to be channeling Conduit,
          and keep one <SpellLink spell={TALENTS_MONK.ZENITH_TALENT} /> charge ready for that
          package. Peak of Serenity currently recommends delaying{' '}
          {hasStrikeOfTheWindlord ? (
            <>
              <SpellLink spell={TALENTS_MONK.STRIKE_OF_THE_WINDLORD_TALENT} /> or{' '}
              <SpellLink spell={TALENTS_MONK.WHIRLING_DRAGON_PUNCH_TALENT} />
            </>
          ) : (
            <SpellLink spell={TALENTS_MONK.WHIRLING_DRAGON_PUNCH_TALENT} />
          )}{' '}
          if that burst starts within about 10 seconds, or delaying Xuen instead if those buttons
          will be ready in the next 10 seconds.
        </p>
        <p>
          Conduit-specific <SpellLink spell={TALENTS_MONK.CELESTIAL_CONDUIT_WINDWALKER_TALENT} />{' '}
          usage is also about <SpellLink spell={SPELLS.HEART_OF_THE_JADE_SERPENT_BUFF} /> timing.
          Since that buff can also come from{' '}
          {hasStrikeOfTheWindlord ? (
            <>
              <SpellLink spell={TALENTS_MONK.STRIKE_OF_THE_WINDLORD_TALENT} /> and{' '}
              <SpellLink spell={TALENTS_MONK.WHIRLING_DRAGON_PUNCH_TALENT} />
            </>
          ) : (
            <SpellLink spell={TALENTS_MONK.WHIRLING_DRAGON_PUNCH_TALENT} />
          )}
          , stagger those uses instead of overlapping them blindly so you get more total uptime and
          value.
        </p>
        <p>
          <SpellLink spell={TALENTS_MONK.ZENITH_TALENT} /> itself is still not just a button to hit
          mindlessly. Use it where its reduced chi costs and extra{' '}
          <SpellLink spell={SPELLS.BLACKOUT_KICK} /> cooldown reduction convert into real value, and
          avoid spending the window on low-impact setup globals. This matters even more with{' '}
          <SpellLink spell={TALENTS_MONK.OBSIDIAN_SPIRAL_TALENT} />, where reducing{' '}
          <SpellLink spell={SPELLS.TIGER_PALM} /> usage inside Zenith is part of correct play.
        </p>
        {info.combatant.hasTalent(TALENTS_MONK.INVOKE_XUEN_THE_WHITE_TIGER_TALENT) &&
          modules.invokeXuen.guideSubsection}
        {info.combatant.hasTalent(TALENTS_MONK.ZENITH_TALENT) && modules.zenith.guideSubsection}
      </Section>
      <Section title="Other cooldowns, buffs and procs">
        {info.combatant.hasTalent(TALENTS_MONK.CHI_BURST_TALENT) &&
          modules.chiBurst.guideSubsection}
        {info.combatant.hasTalent(TALENTS_MONK.DANCE_OF_CHI_JI_WINDWALKER_TALENT) &&
          modules.danceOfChiJi.guideSubsection}
        {(info.combatant.hasTalent(TALENTS_MONK.COMBO_BREAKER_TALENT) ||
          info.combatant.hasTalent(TALENTS_MONK.SEQUENCED_STRIKES_TALENT)) &&
          modules.comboBreaker.guideSubsection}
        {info.combatant.hasTalent(TALENTS_MONK.RUSHING_WIND_KICK_WINDWALKER_TALENT) &&
          modules.rushingWindKick.guideSubsection}
        {modules.touchOfKarma.guideSubsection}
      </Section>
      <Section title="Core Rotation">
        <SubSection title="Overview">
          <p>
            Windwalker is not played by mindlessly following the next line of the APL. The core of
            the spec is maintaining <SpellLink spell={SPELLS.COMBO_STRIKES} />, avoiding repeated
            casts, and weaving <SpellLink spell={SPELLS.TIGER_PALM} /> and{' '}
            <SpellLink spell={SPELLS.BLACKOUT_KICK} /> so you do not over-cap{' '}
            <SpellLink spell={RESOURCE_TYPES.ENERGY} /> or get stranded without enough{' '}
            <SpellLink spell={RESOURCE_TYPES.CHI} /> for your important spenders.
          </p>
          <p>
            In practice, most of your rotational decisions are about feeding high-value buttons
            cleanly. <SpellLink spell={TALENTS_MONK.FISTS_OF_FURY_TALENT} />,{' '}
            <SpellLink spell={TALENTS_MONK.RISING_SUN_KICK_TALENT} />
            {hasStrikeOfTheWindlord && (
              <>
                , <SpellLink spell={TALENTS_MONK.STRIKE_OF_THE_WINDLORD_TALENT} />
              </>
            )}
            , <SpellLink spell={TALENTS_MONK.WHIRLING_DRAGON_PUNCH_TALENT} />, and hero-specific
            payoffs should be given room in the next few globals. That means using{' '}
            <SpellLink spell={SPELLS.TIGER_PALM} /> proactively when you need chi for an upcoming
            spender, but minimizing extra <SpellLink spell={SPELLS.TIGER_PALM} /> casts inside burst
            windows where stronger abilities are available.
          </p>
          <p>
            Procs matter as much as cooldown order. Spend{' '}
            <SpellLink spell={SPELLS.DANCE_OF_CHI_JI_BUFF} /> before it expires, use{' '}
            <SpellLink spell={SPELLS.COMBO_BREAKER_BUFF} /> without overcapping it, and avoid
            sitting on high-impact cooldowns for filler globals. The APL should be read as your
            ordered tiebreaker once mastery, resource flow, and proc management are already being
            respected.
          </p>
          <p>
            More complete and up-to-date rotation guidance is available in the{' '}
            <a href="https://www.peakofserenity.com/tww/windwalker/pve-guide/#Priority_Lists">
              Peak of Serenity Windwalker guide
            </a>
            .
          </p>
        </SubSection>
        <SubSection title="APL Analysis">
          <AplSectionData checker={AplCheck.check} apl={windwalkerApl(info)} />
        </SubSection>
      </Section>
      <PreparationSection />
    </>
  );
}

function MasteryGraph({ modules, events, info }: GuideProps<typeof CombatLogParser>) {
  const styleObj = {
    fontSize: 20,
  };
  const explanation = (
    <>
      <p>
        <b>
          <SpellLink spell={SPELLS.COMBO_STRIKES} />
        </b>{' '}
        is an extremely important part of playing Windwalker effectively. Dropping stacks of your
        mastery is particularly dangerous when also running{' '}
        <SpellLink spell={TALENTS_MONK.HIT_COMBO_TALENT} /> as it causes the mastery drop to double
        dip.
        {info.combatant.hasTalent(TALENTS_MONK.HIT_COMBO_TALENT) && (
          <>
            <br />
            <br />
            The graph visualizes all drops, and the time it takes to get back to the full effect.
          </>
        )}
      </p>
    </>
  );

  const data = (
    <div>
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={SPELLS.COMBO_STRIKES} /> maintenance
          </strong>
          <div style={styleObj}>{modules.comboStrikes.subStatistic}</div>
          {info.combatant.hasTalent(TALENTS_MONK.HIT_COMBO_TALENT) && (
            <>
              <strong>
                <SpellLink spell={SPELLS.HIT_COMBO_BUFF} /> maintenance
              </strong>
              {modules.hitComboGraph.plot}
            </>
          )}
        </RoundedPanel>
      </div>
    </div>
  );

  return <SubSection>{explanationAndDataSubsection(explanation, data)}</SubSection>;
}
