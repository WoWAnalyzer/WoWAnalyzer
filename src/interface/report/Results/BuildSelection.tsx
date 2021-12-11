import { TooltipElement } from 'interface';
import { Builds } from 'parser/Config';
import DEFAULT_BUILD from 'parser/DEFAULT_BUILD';
import { HTMLAttributes } from 'react';
import { Link } from 'react-router-dom';

interface Props extends HTMLAttributes<HTMLDivElement> {
  builds: Builds;
  activeBuild?: string;
  makeUrl: (build: string) => string;
}

const BuildSelection = ({
  builds: { default: defaultBuild = DEFAULT_BUILD, ...builds },
  activeBuild,
  makeUrl,
  ...others
}: Props) => (
  <div {...others}>
    Build:
    {[...Object.values(builds), defaultBuild].map((build) => (
      <Link key={build.url} to={makeUrl(build.url)}>
        <span
          className={
            'build ' +
            (activeBuild === build.url || (activeBuild === 'standard' && build === defaultBuild)
              ? 'active'
              : '')
          }
        >
          <TooltipElement content={build.name}>{build.icon}</TooltipElement>
        </span>
      </Link>
    ))}
  </div>
);

export default BuildSelection;
