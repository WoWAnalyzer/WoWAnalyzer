import { Trans, Plural } from '@lingui/macro';
import isLatestPatch from 'game/isLatestPatch';
import AlertWarning from 'interface/AlertWarning';
import Contributor from 'interface/ContributorButton';
import Panel from 'interface/Panel';
import ReadableListing from 'interface/ReadableListing';
import Config from 'parser/Config';
import { Link } from 'react-router-dom';
import { makeAnalyzerUrl } from 'interface/index';
import { useReport } from 'interface/report/context/ReportContext';
import { useFight } from 'interface/report/context/FightContext';
import { usePlayer } from 'interface/report/context/PlayerContext';

interface Props {
  config: Config;
}

const About = ({ config }: Props) => {
  const { spec, description, contributors, patchCompatibility, isPartial } = config;
  const contributorinfo =
    contributors.length !== 0 ? (
      contributors.map((contributor) => <Contributor key={contributor.nickname} {...contributor} />)
    ) : (
      <Trans id="interface.report.results.about.unmaintained">CURRENTLY UNMAINTAINED</Trans>
    );

  return (
    <Panel
      title={
        <Trans id="interface.report.results.about.aboutSpecnameClassname">
          About {spec.specName} {spec.className}
        </Trans>
      }
      actions={
        <Link
          to={makeAnalyzerUrl(
            useReport()!.report,
            useFight()!.fight.id,
            usePlayer().player.id,
            'events',
          )}
        >
          <Trans id="interface.report.results.about.viewEvents">View all events</Trans>
        </Link>
      }
    >
      {description}

      <div className="row" style={{ marginTop: '1em' }}>
        <div className="col-lg-4" style={{ fontWeight: 'bold', paddingRight: 0 }}>
          <Plural value={contributors.length} one="Contributor" other="Contributors" />
        </div>
        <div className="col-lg-8">
          <ReadableListing>{contributorinfo}</ReadableListing>
        </div>
      </div>
      <div className="row" style={{ marginTop: '0.5em' }}>
        <div className="col-lg-4" style={{ fontWeight: 'bold', paddingRight: 0 }}>
          <Trans id="interface.report.results.about.updatedForPatch">Updated for patch</Trans>
        </div>
        <div className="col-lg-8">{patchCompatibility}</div>
      </div>
      {!isLatestPatch(config) && (
        <AlertWarning style={{ marginTop: '1em' }}>
          <Trans id="interface.report.results.about.outdated">
            The analysis for this spec is outdated. It may be inaccurate for spells that were
            changed since patch {patchCompatibility}.
          </Trans>
        </AlertWarning>
      )}
      {isPartial && (
        <AlertWarning style={{ marginTop: '1em' }}>
          <Trans id="interface.report.results.about.isPartial">
            The analysis for this spec is incomplete. Important elements may be missing or some
            features lack sufficient accuracy.
          </Trans>
        </AlertWarning>
      )}
    </Panel>
  );
};

export default About;
