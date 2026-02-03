import { Trans } from '@lingui/react/macro';
import { useLingui } from '@lingui/react';
import CORE_CHANGELOG from 'CHANGELOG';
import AVAILABLE_CONFIGS from 'parser';
import { useState } from 'react';

import Changelog from './Changelog';
import Panel from './Panel';

const ChangelogPanel = () => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [changelogType, setChangelogType] = useState<number>(0);
  const { i18n } = useLingui();

  const limit = expanded ? undefined : 10;

  return (
    <Panel
      title={<Trans id="interface.changelogPanel.heading">Changelog</Trans>}
      anchor="changelog"
    >
      <select
        className="form-control"
        value={changelogType}
        onChange={(e) => setChangelogType(Number(e.target.value))}
      >
        <option value={0}>
          {i18n.t({ id: 'interface.changelogPanel.option.core', message: 'Core' })}
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
        <button
          className="btn btn-link"
          onClick={() => setExpanded(true)}
          style={{ padding: 0 }}
          type="button"
        >
          More
        </button>
      )}
    </Panel>
  );
};

export default ChangelogPanel;
