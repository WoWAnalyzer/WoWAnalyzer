import isLatestPatch from 'game/isLatestPatch';
import AlertWarning from 'interface/AlertWarning';
import Contributor from 'interface/ContributorButton';
import Panel from 'interface/Panel';
import ReadableListing from 'interface/ReadableListing';
import Config from 'parser/Config';
import { Link } from 'react-router-dom';
import { plural } from 'common/plural';

interface Props {
  config: Config;
}

const About = ({ config }: Props) => {
  const { spec, description, contributors, patchCompatibility, isPartial } = config;
  const contributorinfo =
    contributors.length !== 0 ? (
      contributors.map((contributor) => <Contributor key={contributor.nickname} {...contributor} />)
    ) : (
      <>CURRENTLY UNMAINTAINED</>
    );

  return (
    <Panel
      title={
        <>
          About {spec.specName} {spec.className}
        </>
      }
      actions={
        <Link to="../events">
          <>View all events</>
        </Link>
      }
    >
      {description}

      <div className="row" style={{ marginTop: '1em' }}>
        <div className="col-lg-4" style={{ fontWeight: 'bold', paddingRight: 0 }}>
          {plural(contributors.length, { one: 'Contributor', other: 'Contributors' })}
        </div>
        <div className="col-lg-8">
          <ReadableListing>{contributorinfo}</ReadableListing>
        </div>
      </div>
      <div className="row" style={{ marginTop: '0.5em' }}>
        <div className="col-lg-4" style={{ fontWeight: 'bold', paddingRight: 0 }}>
          <>Updated for patch</>
        </div>
        <div className="col-lg-8">{patchCompatibility}</div>
      </div>
      {!isLatestPatch(config) && (
        <AlertWarning style={{ marginTop: '1em' }}>
          <>
            The analysis for this spec is outdated. It may be inaccurate for spells that were
            changed since patch {patchCompatibility}.
          </>
        </AlertWarning>
      )}
      {isPartial && (
        <AlertWarning style={{ marginTop: '1em' }}>
          <>
            The analysis for this spec is incomplete. Important elements may be missing or some
            features lack sufficient accuracy.
          </>
        </AlertWarning>
      )}
    </Panel>
  );
};

export default About;
