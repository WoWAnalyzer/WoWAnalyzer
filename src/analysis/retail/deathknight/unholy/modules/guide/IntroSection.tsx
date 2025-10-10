import { Section } from 'interface/guide';

export function IntroSection() {
  return (
    <Section title="Introduction">
      <div>
        <p>
          Hello and welcome to the analyzer for the Unholy Death Knight specialization! All
          information is sourced from the latest class guides on{' '}
          <a href="https://www.wowhead.com/unholy-death-knight-guide">Wowhead</a> and{' '}
          <a href="https://www.icy-veins.com/wow/unholy-death-knight-pve-dps-guide">Icy Veins</a>.
        </p>
      </div>

      <div>
        <p>
          Unholy is all about spreading diseases, managing your undead army, and syncing your
          cooldowns to deliver devastating burst windows. This tool helps identify room for
          improvement in rotation, buff uptime, cooldown usage, and overall execution.
        </p>
      </div>

      <div>
        <p>
          The analysis here is based on general guidelines and doesn’t always account for specific
          fight mechanics or edge cases. For the most accurate benchmarking, compare your
          performance to other top Unholy Death Knights in the same encounter using{' '}
          <a href="https://www.warcraftlogs.com/">Warcraft Logs</a>.
        </p>
      </div>

      <div>
        <p>
          If you have any questions, feedback, or suggestions, feel free to reach out in the{' '}
          <a href="https://discord.gg/acherus">Acherus Discord</a>.
        </p>
      </div>

      <div
        style={{
          backgroundColor: '#1e1e1e', // dark gray to match the theme
          padding: '1rem',
          borderLeft: '4px solid #f59e0b', // orange highlight
          borderRadius: '4px',
          marginTop: '1rem',
          fontStyle: 'italic',
          color: '#fbbf24', // warm yellow/orange text
        }}
      >
        <strong>Note:</strong> This analyzer is specifically tuned toward the{' '}
        <em>San’layn Hero Tree</em> and Wowhead’s{' '}
        <a
          href="https://www.wowhead.com/guide/classes/death-knight/unholy/talent-builds-pve-dps#commander-sanlayn"
          style={{ color: '#facc15', textDecoration: 'underline' }}
        >
          Commander Raid Single Target Build
        </a>
        .
      </div>
    </Section>
  );
}
