import { Plural, Trans } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import isLatestPatch from 'game/isLatestPatch';
import AlertInfo from 'interface/AlertInfo';
import AlertWarning from 'interface/AlertWarning';
import Contributor from 'interface/ContributorButton';
import DiscordButton from 'interface/DiscordButton';
import Panel from 'interface/Panel';
import ReadableListing from 'interface/ReadableListing';
import Config, { SupportLevel } from 'parser/Config';
import { Link } from 'react-router-dom';

interface Props {
  config: Config;
}

const About = ({ config }: Props) => {
  const { spec, contributors, patchCompatibility, supportLevel } = config;
  const { i18n } = useLingui();
  const isPartial = supportLevel === SupportLevel.MaintainedPartial;
  const contributorinfo =
    contributors.length !== 0 ? (
      contributors.map((contributor) => <Contributor key={contributor.nickname} {...contributor} />)
    ) : (
      <Trans id="interface.report.results.about.unmaintained">CURRENTLY UNMAINTAINED</Trans>
    );

  const description = config.description ?? <DefaultDescription {...config} />;

  return (
    <Panel
      title={
        <Trans id="interface.report.results.about.aboutSpecnameClassname">
          About {spec.specName && i18n._(spec.specName)} {i18n._(spec.className)}
        </Trans>
      }
      actions={
        <>
          <div>
            <Link to="../events">
              <Trans id="interface.report.results.about.viewEvents">View all events</Trans>
            </Link>
          </div>
          <div>
            <Link to="../debug">
              <Trans id="interface.report.results.about.viewDebug">View debug info</Trans>
            </Link>
          </div>
        </>
      }
    >
      {description}

      <div className="row" style={{ marginTop: '1em' }}>
        <div className="col-lg-4" style={{ fontWeight: 'bold', paddingRight: 0 }}>
          <Plural
            id="common.about.contributor"
            value={contributors.length}
            one="Contributor"
            other="Contributors"
          />
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
            The analysis for this spec is outdated. Analysis for spells that were changed after
            patch {patchCompatibility} may be inaccurate.
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

const DefaultDescription = ({ spec, supportLevel }: Config) => {
  const i18n = useLingui();

  const specTitle = (
    <>
      {spec.specName && i18n._(spec.specName)} {i18n._(spec.className)}
    </>
  );

  const supportDesc =
    supportLevel === SupportLevel.Foundation ? (
      <p>
        <Trans id="interface.report.results.about.foundationDescription">
          {specTitle} has support for core spells and abilities, but may be missing spec-specific
          analysis.
        </Trans>
      </p>
    ) : (
      <p>
        <Trans id="interface.report.results.about.unmaintainedDescription">
          {specTitle} is not currently maintained.
        </Trans>{' '}
      </p>
    );

  return (
    <div>
      {supportDesc}
      <AlertInfo>
        Interested in contributing to {specTitle} analysis? Check out our{' '}
        <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/wiki#getting-started">
          getting started guide
        </a>{' '}
        or visit our <DiscordButton style={{ padding: '1px 5px', height: 'unset' }} /> to help out!
      </AlertInfo>
    </div>
  );
};

export default About;
