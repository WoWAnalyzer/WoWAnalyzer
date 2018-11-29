import React from 'react';
import { Trans, t } from '@lingui/macro';

import { ApiDownError, CorruptResponseError, JsonParseError, LogNotFoundError } from 'common/fetchWclApi';
import { i18n } from 'interface/RootLocalizationProvider';
import FullscreenError from 'interface/common/FullscreenError';
import ApiDownBackground from 'interface/common/images/api-down-background.gif';
import ThunderSoundEffect from 'interface/audio/Thunder Sound effect.mp3';
import { EventsParseError } from 'interface/report/EventParser';

export default function handleApiError(error, onBack) {
  console.error(error);
  if (error instanceof LogNotFoundError) {
    return (
      <FullscreenError
        error={i18n._(t`Report not found.`)}
        details={i18n._(t`Either you entered a wrong report, or it is private.`)}
        background="https://media.giphy.com/media/DAgxA6qRfa5La/giphy.gif"
      >
        <div className="text-muted">
          <Trans>Private reports can not be used, if your guild has private reports you will have to <a href="https://www.warcraftlogs.com/help/start/">upload your own logs</a> or change the existing reports to the <i>unlisted</i> privacy option instead.</Trans>
        </div>
        <div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onBack}
          >
            &lt; <Trans>Back</Trans>
          </button>
        </div>
      </FullscreenError>
    );
  } else if (error instanceof ApiDownError) {
    return (
      <FullscreenError
        error={i18n._(t`The API is down.`)}
        details={i18n._(t`This is usually because we're leveling up with another patch.`)}
        background={ApiDownBackground}
      >
        <div className="text-muted">
          <Trans>Aside from the great news that you'll be the first to experience something new that is probably going to pretty amazing, you'll probably also enjoy knowing that our updates usually only take less than 10 seconds. So just <a href={window.location.href}>give it another try</a>.</Trans>
        </div>
        {/* I couldn't resist */}
        <audio autoPlay>
          <source src={ThunderSoundEffect} />
        </audio>
      </FullscreenError>
    );
  } else if (error instanceof CorruptResponseError) {
    return (
      <FullscreenError
        error={i18n._(t`Corrupt Warcraft Logs API response`)}
        details={i18n._(t`Corrupt Warcraft Logs API response received, this report can not be processed.`)}
        background="https://media.giphy.com/media/m4TbeLYX5MaZy/giphy.gif"
      >
        <div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onBack}
          >
            &lt; <Trans>Back</Trans>
          </button>
        </div>
      </FullscreenError>
    );
  } else if (error instanceof JsonParseError) {
    return (
      <FullscreenError
        error={i18n._(t`Failed to parse API response`)}
        details={i18n._(t`JSON parse error, the API response is probably corrupt. Let us know on Discord and we may be able to fix it for you.`)}
        background="https://media.giphy.com/media/m4TbeLYX5MaZy/giphy.gif"
      >
        <div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onBack}
          >
            &lt; <Trans>Back</Trans>
          </button>
        </div>
      </FullscreenError>
    );
  } else if (error instanceof EventsParseError) {
    return (
      <FullscreenError
        error={i18n._(t`An error occured during our analysis`)}
        details={i18n._(t`We fucked up and our code broke like the motherfucker that it is. Please let us know on Discord and we will fix it for you.`)}
        background="https://media.giphy.com/media/2sdHZ0iBuI45s6fqc9/giphy.gif"
      >
        <div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onBack}
          >
            &lt; <Trans>Back</Trans>
          </button>
        </div>
      </FullscreenError>
    );
  } else {
    // Some kind of network error, internet may be down.
    return (
      <FullscreenError
        error={i18n._(t`A connection error occured.`)}
        details={i18n._(t`Something went wrong talking to our servers, please try again.`)}
        background="https://media.giphy.com/media/m4TbeLYX5MaZy/giphy.gif"
      >
        <div className="text-muted">
          {error.message}
        </div>
        <div>
          <a className="btn btn-primary" href={window.location.href}><Trans>Refresh</Trans></a>
        </div>
      </FullscreenError>
    );
  }
}
