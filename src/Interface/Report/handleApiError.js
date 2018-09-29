import React from 'react';

import { ApiDownError, CorruptResponseError, JsonParseError, LogNotFoundError } from 'common/fetchWclApi';
import FullscreenError from 'Interface/common/FullscreenError';
import ApiDownBackground from 'Interface/common/Images/api-down-background.gif';
import ThunderSoundEffect from 'Interface/Audio/Thunder Sound effect.mp3';

export default function handleApiError(error, onBack) {
  console.error(error);
  if (error instanceof LogNotFoundError) {
    return (
      <FullscreenError
        error="Report not found."
        details="Either you entered a wrong report, or it is private."
        background="https://media.giphy.com/media/DAgxA6qRfa5La/giphy.gif"
      >
        <div className="text-muted">
          Private reports can not be used, if your guild has private reports you will have to <a href="https://www.warcraftlogs.com/help/start/">upload your own logs</a> or change the existing reports to the <i>unlisted</i> privacy option instead.
        </div>
        <div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onBack}
          >
            &lt; Back
          </button>
        </div>
      </FullscreenError>
    );
  } else if (error instanceof ApiDownError) {
    return (
      <FullscreenError
        error="The API is down."
        details="This is usually because we're leveling up with another patch."
        background={ApiDownBackground}
      >
        <div className="text-muted">
          Aside from the great news that you'll be the first to experience something new that is probably going to pretty amazing, you'll probably also enjoy knowing that our updates usually only take less than 10 seconds. So just <a href={window.location.href}>give it another try</a>.
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
        error="Corrupt Warcraft Logs API response"
        details="Corrupt Warcraft Logs API response received, this report can not be processed."
        background="https://media.giphy.com/media/m4TbeLYX5MaZy/giphy.gif"
      >
        <div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onBack}
          >
            &lt; Back
          </button>
        </div>
      </FullscreenError>
    );
  } else if (error instanceof JsonParseError) {
    return (
      <FullscreenError
        error="Failed to parse API response"
        details="JSON parse error, the API response is probably corrupt. Let us know on Discord and we may be able to fix it for you."
        background="https://media.giphy.com/media/m4TbeLYX5MaZy/giphy.gif"
      >
        <div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onBack}
          >
            &lt; Back
          </button>
        </div>
      </FullscreenError>
    );
  } else {
    // Some kind of network error, internet may be down.
    return (
      <FullscreenError
        error="A connection error occured."
        details="Something went wrong talking to our servers, please try again."
        background="https://media.giphy.com/media/m4TbeLYX5MaZy/giphy.gif"
      >
        <div className="text-muted">
          {error.message}
        </div>
        <div>
          <a className="btn btn-primary" href={window.location.href}>Refresh</a>
        </div>
      </FullscreenError>
    );
  }
}
