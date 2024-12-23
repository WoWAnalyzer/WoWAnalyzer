import { Section } from 'interface/guide';

export function IntroSection() {
  return (
    <Section title="Preface">
      <p>
        <strong>
          Disclaimer: This Analyzer currently is only supported for Single Target Pack-Leader.
          Analyze with care for fights that involve AoE or when using Sentinel!
        </strong>{' '}
        <br></br>
        Hello and welcome to the analyzer for the Survival Hunter spec! All the theorycrafting comes
        from summarizing the guides over at{' '}
        <a href="https://www.wowhead.com/guide/classes/hunter/survival/overview-pve-dps">Wowhead</a>
        , <a href="https://www.icy-veins.com/wow/survival-hunter-pve-dps-guide">Icy Veins</a>, and
        the <a href="https://discord.com/invite/trueshot">Hunter Discord</a>.
      </p>
      <p>
        The accuracy and problems pointed out here are <b>guidelines</b> and don't factor in raid
        conditions or edge cases. To find a good measure of success, you should compare your results
        to other top Hunters in the same fight with Warcraft Logs (e.g{' '}
        <a href="https://www.warcraftlogs.com/zone/rankings/38#boss=2898&class=Hunter&spec=Survival">
          Mythic Sikran Top 100
        </a>
        ).
      </p>
      <p>
        If you have any questions, corrections, complaints, or want to help, I'm happy to talk over
        at <code>#survival</code> in the{' '}
        <a href="https://discord.com/invite/trueshot">Hunter Discord</a>.
      </p>
    </Section>
  );
}
