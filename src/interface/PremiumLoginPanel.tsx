import { Trans } from '@lingui/macro';
import CyclingVideo from 'interface/CyclingVideo';
import GitHubMarkIcon from 'interface/icons/GitHubMarkLarge';
import LogoutIcon from 'interface/icons/Logout';
import PatreonIcon from 'interface/icons/PatreonTiny';
import { Textfit } from 'react-textfit';
import { useWaDispatch } from 'interface/utils/useWaDispatch';
import { useWaSelector } from 'interface/utils/useWaSelector';
import { MouseEvent, useRef } from 'react';

import './PremiumLoginPanel.scss';
import { logout } from './reducers/user';
import { CSSTransition } from 'react-transition-group';
import React from 'react';

const INITIAL_BACKGROUNDS = [
  '7TqE3VIAU2odkmneHU', // human salute https://giphy.com/gifs/warcraft-video-games-7TqE3VIAU2odkmneHU
  '5kFzxK6ENfjrcoMgt1', // orc salute https://giphy.com/gifs/warcraft-video-games-5kFzxK6ENfjrcoMgt1
  'PoCoePEEB1EC6buvFU', // blood elf salute https://giphy.com/gifs/warcraft-video-games-PoCoePEEB1EC6buvFU
  '8cv2DoGyUClMuCKalT', // human bow https://giphy.com/gifs/warcraft-video-games-8cv2DoGyUClMuCKalT
  'fUZW0LIJhtbDnBtqkX', // orc bow https://giphy.com/gifs/warcraft-video-games-fUZW0LIJhtbDnBtqkX
  '2erqKiXvYpXeGH9XJ5', // gnome bow https://giphy.com/gifs/warcraft-video-games-2erqKiXvYpXeGH9XJ5
].map((code) => `https://media.giphy.com/media/${code}/giphy.mp4`);
// const LOGIN_SUCCESSFUL_BACKGROUNDS = [
//   '1AdZe53o36pL2ifJrW', // approve https://giphy.com/gifs/warcraft-video-games-1AdZe53o36pL2ifJrW
//   '12gdy23jcbqdvqID9D', // human cheer https://giphy.com/gifs/warcraft-video-games-12gdy23jcbqdvqID9D
//   '2fRB16C8fbWsHTogzJ', // orc cheer https://giphy.com/gifs/warcraft-video-games-2fRB16C8fbWsHTogzJ
//   '55kiNDmHdIkd2NJ9L1', // ...gnome cheer  https://giphy.com/gifs/warcraft-video-games-55kiNDmHdIkd2NJ9L1
//   'cQ29kUD2CstrP0Cyyz', // blood elf dh cheer https://giphy.com/gifs/warcraft-video-games-cQ29kUD2CstrP0Cyyz
// ];
// const LOGIN_UNSUCCESSFUL_BACKGROUNDS = [
//   '4N1IhWlgeurYEqBpbd', // no https://giphy.com/gifs/warcraft-video-games-4N1IhWlgeurYEqBpbd
//   'fdGbKBJRylAQ3Gj1f8', // please https://giphy.com/gifs/warcraft-video-games-fdGbKBJRylAQ3Gj1f8
//   '1zgvoYwvgm7LnHpYp4', // blood elf dh no https://giphy.com/gifs/warcraft-video-games-1zgvoYwvgm7LnHpYp4
//   '8h0dtWORphvPgH4O20', // orc no https://giphy.com/gifs/warcraft-video-games-8h0dtWORphvPgH4O20
//   '4a4w6CzSj1t2Hl6gYy', // orc please https://giphy.com/gifs/warcraft-video-games-4a4w6CzSj1t2Hl6gYy
// ];

const LoggedIn = React.forwardRef<HTMLDivElement, unknown>((props, ref) => {
  const dispatch = useWaDispatch();
  const user = useWaSelector((state) => state.user);

  // this is only intended to be rendered if we have a user, but some quirks of oauth
  // can get you a user-without-a-user when doing local development
  if (!user) {
    return null;
  }

  const hasPremium = user.premium;
  const platform = user.github && user.github.premium ? 'github' : 'patreon';

  const handleClick = (event: MouseEvent) => {
    event.preventDefault();
    dispatch(logout());
  };

  return (
    <div className={`logged-in ${platform}`} ref={ref}>
      <div>
        <div className="logo">
          {platform === 'github' && <GitHubMarkIcon style={{ marginTop: 0 }} />}
          {platform === 'patreon' && <PatreonIcon style={{ marginTop: 0 }} />}
        </div>

        <div className="text">
          <h1>
            <Textfit mode="single">
              <Trans id="interface.premiumLoginPanel.logged-in.greeting">
                Hello {user.name?.trim()}.
              </Trans>
            </Textfit>
          </h1>
          {hasPremium ? (
            <div className="description">
              <Trans id="interface.premiumLoginPanel.logged-in.hasPremium">
                Super thank you for your support! We hope you'll enjoy WoWAnalyzer Premium.
              </Trans>
            </div>
          ) : (
            <div className="description">
              <Trans id="interface.premiumLoginPanel.logged-in.premiumNotUnlocked">
                You haven't unlocked Premium yet. See the panel to the right for more info.
              </Trans>
            </div>
          )}
          <div className="logout">
            <a href="/logout" onClick={handleClick}>
              <LogoutIcon /> <Trans id="interface.premiumLoginPanel.logged-in.logout">Logout</Trans>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
});

const PremiumLoginPanel = () => {
  const user = useWaSelector((state) => state.user);
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div className="panel">
      <div className="panel-body" style={{ padding: '0 15px', position: 'relative' }}>
        <CSSTransition
          nodeRef={ref}
          in={Boolean(user)}
          timeout={1000}
          classNames="logged-in"
          onEnter={(...args) => console.log(...args)}
        >
          <LoggedIn ref={ref} />
        </CSSTransition>

        <div
          className="row image-background"
          style={{ position: 'relative', paddingTop: 300, paddingBottom: 15 }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              pointerEvents: 'none',
              overflow: 'hidden',
            }}
          >
            <CyclingVideo
              videos={INITIAL_BACKGROUNDS}
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            />
          </div>
          <div className="col-md-12">
            <h1>
              <Trans id="interface.premiumLoginPanel.panel.sign-in">Premium sign in</Trans>
            </h1>
            <div className="description">
              <Trans id="interface.premiumLoginPanel.panel.sign-in.description">
                Sign in with your Patreon or GitHub account using the buttons below.
              </Trans>
            </div>
          </div>
        </div>
        <div className="row" style={{ position: 'relative' }}>
          <div className="loginBubble">Already unlocked Premium? Login here!</div>
          <div className="col-lg-6" style={{ padding: 0 }}>
            <a
              href={`${import.meta.env.VITE_SERVER_BASE}login/patreon`}
              className="btn btn-block patreon-login"
            >
              <PatreonIcon /> Patreon
            </a>
          </div>
          <div className="col-lg-6" style={{ padding: 0 }}>
            <a
              href={`${import.meta.env.VITE_SERVER_BASE}login/github`}
              className="btn btn-block github-login"
            >
              <GitHubMarkIcon /> GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumLoginPanel;
