import { t } from '@lingui/macro';
import { setLanguage } from 'interface/actions/language';
import ReadableListing from 'interface/ReadableListing';
import { getLanguage } from 'interface/selectors/language';
import { TooltipElement } from 'interface/Tooltip';
import { useWaSelector } from 'interface/utils/useWaSelector';
import { useState } from 'react';
import { useDispatch } from 'react-redux';

import languages from './languages';

const LanguageSwitcher = () => {
  const [expanded, setExpanded] = useState(false);

  const language = useWaSelector(getLanguage);
  const dispatch = useDispatch();

  const selectLanguage = (code: string) => {
    setExpanded(false);
    dispatch(setLanguage(code));
  };

  if (expanded) {
    return (
      <ReadableListing groupType="or">
        {Object.keys(languages).map((code) => (
          // eslint-disable-next-line jsx-a11y/anchor-is-valid
          <a key={code} onClick={() => selectLanguage(code)}>
            {languages[code].localName}
          </a>
        ))}
      </ReadableListing>
    );
  }

  return (
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    <a onClick={() => setExpanded(true)}>
      <TooltipElement
        content={t({
          id: 'interface.languageSwitcher.clickToSwitch',
          message: `Click to switch languages. We've only just started localizing the app, it will take some time until everything is localized.`,
        })}
      >
        {languages[language].localName}
      </TooltipElement>
    </a>
  );
};

export default LanguageSwitcher;
