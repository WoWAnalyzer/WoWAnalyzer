import { t, Trans } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import CORE_CHANGELOG from 'CHANGELOG';
import AVAILABLE_CONFIGS from 'parser';
import { useState } from 'react';

import Changelog from './Changelog';

const ChangelogPanel = () => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [changelogType, setChangelogType] = useState<number>(0);
  const { i18n } = useLingui();

  const limit = expanded ? undefined : 10;

  return (
    <div className="panel">
      <div className="panel-heading">
        <h1>
          <Trans id="interface.changelogPanel.heading">Changelog</Trans>
        </h1>
      </div>
      <div className="panel-body pad">
        <select
          className="form-control"
          value={changelogType}
          onChange={(e) => setChangelogType(Number(e.target.value))}
        >
          <option value={0}>
            {t({ id: 'interface.changelogPanel.option.core', message: 'Core' })}
          </option>
          {AVAILABLE_CONFIGS.map((config) => (
            <option value={config.spec.id} key={config.spec.id}>
              {config.spec.specName && i18n._(config.spec.specName)} {i18n._(config.spec.className)}
            </option>
          ))}
        </select>

        <div style={{ margin: '30px -30px 0 -30px' }}>
          <Changelog
            changelog={
              (changelogType
                ? AVAILABLE_CONFIGS.find((config) => config.spec.id === changelogType)!.changelog
                : CORE_CHANGELOG) ?? []
            }
            limit={limit}
            includeCore={false}
          />
        </div>
        {limit !== null && (
          <button className="btn btn-link" onClick={() => setExpanded(true)} style={{ padding: 0 }}>
            More
          </button> // eslint-disable-line jsx-a11y/anchor-is-valid
        )}
      </div>
    </div>
  );
};

export default ChangelogPanel;
