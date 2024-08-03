import LanguageSwitcher from '../LanguageSwitcher';
import NavigationBar from '../NavigationBar';

declare global {
  interface Window {
    __cmp?: (v: string) => void;
  }
}

let optOutCounter = 0;
function setCookie(cname: string, cvalue: string, exdays: number) {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  const expires = 'expires=' + d.toUTCString();
  document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
  if (optOutCounter === 0) {
    const cookieP = document.getElementById('cookieP');
    const successCookie = document.createElement('h3');
    successCookie.innerHTML = 'Optout Success!';
    successCookie.setAttribute('style', 'color:green');
    cookieP!.appendChild(successCookie);
    optOutCounter += 1;
  }
}

function euOptOut() {
  if (window.__cmp === undefined) {
    console.warn(
      'User is not in the EU - Consent Choices can only be configured when User is in the EU',
    );
  } else {
    window.__cmp('showConsentTool');
  }
}

export function Component() {
  return (
    <div className="home-page">
      <NavigationBar>
        <LanguageSwitcher />
      </NavigationBar>
      <main className="container">
        <h2>WoWAnalyzer Privacy Policy</h2>
        <p>Last Updated on January 17, 2022.</p>
        <p>
          This Privacy Policy describes our policies on the collection, use, and disclosure of
          information about you in connection with your use of our services, including those offered
          through our websites, emails, and mobile applications (collectively, the "Service"). The
          terms "we", "us", "WoWAnalyzer", and "Warcraft Logs" refer to RPGLogs, LLC, a Delaware
          corporation with its headquarters in Houston, Texas. When you use the Service, you consent
          to our collection, use, and disclosure of information about you as described in this
          Privacy Policy.
        </p>
        <h3>TABLE OF CONTENTS</h3>
        <ol>
          <li>
            <a href="#section1">Information We Collect and How We Use It</a>
          </li>
          <li>
            <a href="#section2">Cookies</a>
          </li>
          <li>
            <a href="#section3">Third Parties</a>
          </li>
          <li>
            <a href="#section4">Controlling Your Personal Data</a>
          </li>
          <li>
            <a href="#section5">Data Retention and Account Termination</a>
          </li>
          <li>
            <a href="#section6">Children</a>
          </li>
          <li>
            <a href="#section7">Security</a>
          </li>
          <li>
            <a href="#section8">Contact Information</a>
          </li>
          <li>
            <a href="#section9">Modifications to This Privacy Policy</a>
          </li>
          <li>
            <a href="#section10">California Residents: Your California Privacy Rights</a>
          </li>
        </ol>
        <h4 id="section1">1. INFORMATION WE COLLECT AND HOW WE USE IT</h4>
        <p>
          We may collect and store information about you in connection with your use of the Service,
          including any information you transmit to or through the Service. We use that information
          to provide the Service’s functionality, fulfill your requests, improve the Service’s
          quality, engage in research and analysis relating to the Service, personalize your
          experience, track usage of the Service, display relevant advertising, market the Service,
          provide customer support, contact you, back up our systems, allow for disaster recovery,
          enhance the security of the Service, and comply with legal obligations. Even when we do
          not retain such information, it still must be transmitted to our servers initially and
          stored long enough to process.
        </p>
        <p>Please also note:</p>
        <ol>
          <li>
            <strong>Account Information:</strong> If you create an account, we may store and use the
            information you provide during that process, such as your email address, username, and
            other information you may provide with your account. We may publicly display your
            username. You can modify some of the information associated with your account through
            your account settings. If you believe that someone has created an unauthorized account
            depicting you or your likeness, you can request its removal by flagging it.
          </li>
          <li>
            <strong>Public Content:</strong> Your contributions to the Service are intended for
            public consumption and are therefore viewable by the public, including your game logs.
            Your account profile is also intended for public consumption, as is some of your other
            activity through the Service, like your uploaded game logs. You can limit the public
            nature of some of these activities through your account settings. In accordance with{' '}
            <a href="http://us.blizzard.com/en-us/company/legal/eula.html">
              Blizzard’s User Agreement
            </a>
            , characters, character names, character data, virtual items, character profile
            information are owned by the game company or its licensors. This information is not
            protected as personal information, and may be displayed on the site.
          </li>
          <li>
            <strong>Communications:</strong> When you sign up for an account or use certain
            features, you are opting to receive messages from us. You can manage some of your
            messaging preferences through your account settings, but note that you cannot opt out of
            receiving certain administrative, transactional, or legal messages from us. For example,
            if you request a password reset, we may send you messages about your transaction using
            the contact information you provide. We may also track your actions in response to the
            messages you receive from us or through the Service, such as whether you deleted,
            opened, or forwarded such messages. We may also store information that you provide
            through communications to us, including from phone calls, letters, emails and other
            electronic messages, or in person.{' '}
          </li>
          <li>
            <strong>Transactions:</strong> If you initiate a transaction through the Service, we may
            collect and store information about you, such as your name, phone number, address,
            email, and payment information (such as a credit card number and expiration date), as
            well as any other information you provide to us, in order to process your transaction,
            send communications about them to you, and populate forms for future transactions. When
            you submit credit card numbers, we encrypt that information using industry standard
            technology.
          </li>
          <li>
            <strong>Activity:</strong> We may store information about your use of the Service, such
            as your search activity, the pages you view, and the date and time of your visit. We
            also may store information that your computer or mobile device may provide to us in
            connection with your use of the Service, such as your browser type, type of computer or
            mobile device, browser language, IP address, WiFi information such as SSID, mobile
            carrier, phone number, unique device identifier, advertising identifier, location
            (including geolocation, beacon based location, and GPS location), and requested and
            referring URLs. You may be able to limit or disallow our use of certain location data
            through your device or browser settings, for example by adjusting the "Location
            Services" settings for our applications in iOS privacy settings.
          </li>
          <li>
            <strong>Different Devices:</strong> You may access the Service through different devices
            (e.g., your mobile phone or desktop computer) and different platforms (e.g., the
            WoWAnalyzer website or the Warcraft Logs website). The information that we collect and
            store through those different uses may be cross-referenced and combined, and your
            contributions through one Warcraft Logs platform will typically be similarly visible and
            accessible through all other Warcraft Logs platforms.
          </li>
        </ol>
        <h4 id="section2">2. COOKIES</h4>
        <p>
          We, and third parties with whom we partner, may use cookies, web beacons, tags, scripts,
          local shared objects such as HTML5 and Flash (sometimes called "flash cookies"),
          advertising identifiers (including mobile identifiers such as Apple’s IDFA or Google’s
          Advertising ID) and similar technology ("Cookies") in connection with your use of the
          Service, third party websites, and mobile applications. Cookies may have unique
          identifiers, and reside, among other places, on your computer or mobile device, in emails
          we send to you, and on our web pages. Cookies may transmit information about you and your
          use of the Service, such as your browser type, search preferences, IP address, data
          relating to advertisements that have been displayed to you or that you have clicked on,
          and the date and time of your use. Cookies may be persistent or stored only during an
          individual session.
        </p>
        <p>The purposes for which we use Cookies in the Service include:</p>
        <table className="table table-bordered table-condensed">
          <tbody>
            <tr>
              <td>Purpose</td>
              <td>Explanation</td>
            </tr>
            <tr>
              <td>Processes</td>
              <td>
                Intended to make the Service work in the way you expect. For example, we use a
                Cookie that tells us whether you have already signed up for an account.
              </td>
            </tr>
            <tr>
              <td>Authentication, Security, and Compliance</td>
              <td>
                Intended to prevent fraud, protect your data from unauthorized parties, and comply
                with legal requirements. For example, we use Cookies to determine if you are logged
                in.
              </td>
            </tr>
            <tr>
              <td>Preferences</td>
              <td>
                Intended to remember information about how you prefer the Service to behave and
                look. For example, we use a Cookie that tells us whether you have declined to allow
                us to send push notifications to your phone.
              </td>
            </tr>
            <tr>
              <td>Notifications</td>
              <td>
                Intended to allow or prevent notices of information or options that we think could
                improve your use of the Service. For example, we use a Cookie that stops us from
                showing you the signup notification if you have already seen it.
              </td>
            </tr>
            <tr>
              <td>Advertising</td>
              <td>
                Intended to make advertising more relevant to users and more valuable to
                advertisers. For example, we may use Cookies to serve you interest-based ads, such
                as ads that are displayed to you based on your visits to other websites, or to tell
                us if you have recently clicked on an ad.
              </td>
            </tr>
            <tr>
              <td>Analytics</td>
              <td>
                Intended to help us understand how visitors use the Service. We use Google Analytics
                for this support.
              </td>
            </tr>
          </tbody>
        </table>
        <p>
          You can set some Cookie preferences through your device or browser settings, but doing so
          may affect the functionality of the Service. The method for disabling Cookies may vary by
          device and browser, but can usually be found in your device or browser preferences or
          security settings. For example, iOS and Android devices each have settings which are
          designed to limit forms of ad tracking. Please note that changing any of these settings
          does not prevent the display of certain advertisements to you.
        </p>
        <h3>Common ID Cookie</h3>{' '}
        <p id="cookieP">
          This site uses cookies and similar tracking technologies such as the Common ID cookie to
          provide its services. Cookies are important devices for measuring advertising
          effectiveness and ensuring a robust online advertising industry. The Common ID cookie
          stores a unique user id in the first party domain and is accessible to our ad partners.
          This simple ID that can be utilized to improve user matching, especially for delivering
          ads to iOS and MacOS browsers. Users can opt out of the Common ID tracking cookie by
          clicking{' '}
          <a onClick={() => setCookie('_pubcid_optout', '1', 1825)} href="#opt-out">
            here
          </a>
          .
        </p>{' '}
        <h3>Advertising Privacy Settings</h3>{' '}
        <p>
          FOR EU USERS ONLY: When you use our site, pre-selected companies may access and use
          certain information on your device and about your interests to serve ads or personalized
          content. You may revisit or change consent-choices at any time by clicking{' '}
          <a href="#cmp" onClick={() => euOptOut()}>
            here
          </a>
          .
        </p>
        <h4 id="section3">3. THIRD PARTIES</h4>
        <p>Third parties may receive information about you as follows:</p>
        <ol>
          <li>
            <strong>Advertisers:</strong> We may allow third parties to use Cookies through the
            Service to collect the same type of information for the same purposes as we do. In doing
            so, we adhere to the Digital Advertising Alliance’s Self-Regulatory Principles for
            Online Behavioral Advertising. Third parties may be able to associate the information
            they collect with other information they have about you from other sources. We do not
            necessarily have access to or control over the Cookies they use, but you may be able to
            opt out of some of their practices by visiting the following links:{' '}
            <a
              target="_blank"
              href="
http://www.networkadvertising.org/choices/"
            >
              Network Advertising Initiative
            </a>
            ,{' '}
            <a
              target="_blank"
              rel="noreferrer"
              href="https://www.d1.sc.omtrdc.net/optout.html?omniture=1&amp;popup=1&amp;locale=en_US&amp;second=1&amp;second_has_cookie=0"
            >
              Omniture
            </a>
            , and{' '}
            <a target="_blank" href="http://www.aboutads.info/choices/" rel="noreferrer">
              Digital Advertising Alliance
            </a>
            . Please note that opting out does not prevent the display of all advertisements to you.
            Additionally, we may share non-personally identifiable information from or about you
            with third parties, such as location data, advertising identifiers, or a cryptographic
            hash of a common account identifier (such as an email address) to facilitate the display
            of targeted advertising. You may be able to limit our sharing of some of this
            information through your mobile device settings, as described in Section 2 above, or
            through the Service’s settings.
          </li>
          <li>
            <strong>Aggregate or Anonymous Information:</strong> We may share user information in
            the aggregate with third parties, such as content distributors. For example, we may
            disclose the number of users that have been exposed to, or clicked on, advertisements.{' '}
          </li>
          <li>
            <strong>Business Transfers:</strong> We may share information from or about you with our
            parent companies, subsidiaries, joint ventures, or other companies under common control,
            in which case we will require them to honor this Privacy Policy. If another company
            acquires Warcraft Logs, or all or substantially all of our assets, that company will
            possess the same information, and will assume the rights and obligations with respect to
            that information as described in this Privacy Policy.
          </li>
          <li>
            <strong>Investigations and Legal Disclosures:</strong> We may investigate and disclose
            information from or about you if we have a good faith belief that such investigation or
            disclosure: (a) is reasonably necessary to comply with legal process and law enforcement
            instructions and orders, such as a search warrant, subpoena, statute, judicial
            proceeding, or other legal process or law enforcement requests served on us; or (b) is
            helpful to prevent, investigate, or identify possible wrongdoing in connection with the
            Service.{' '}
          </li>
          <li>
            <strong>Links:</strong> The Service may link to third party services, like another
            site’s URL. Except as set forth herein, we do not share your personal information with
            them, and are not responsible for their privacy practices. We suggest you read the
            privacy policies on or applicable to all such third party services.
          </li>
          <li>
            <strong>Third Party Accounts:</strong> If you sign up for, or log into, WoWAnalyzer
            using a third party service (e.g., GitHub or Patreon), we may receive information about
            you from such third party service.{' '}
          </li>
        </ol>
        <h4 id="section4">4. CONTROLLING YOUR PERSONAL DATA</h4>
        <p>
          Other users may be able to identify you, or associate you with your account, if you
          include personal information in the content you post publicly. You can reduce the risk of
          being personally identified by using the Service pseudonymously, though doing so could
          detract from the credibility of your contributions to the Service.{' '}
        </p>
        <h4 id="section5">5. DATA RETENTION AND ACCOUNT TERMINATION</h4>
        <p>
          You can close your account by email. We will remove certain information from view and/or
          dissociate them from your account profile, but we may retain information about you for the
          purposes authorized under this Privacy Policy unless prohibited by law. For example, we
          may retain information to prevent, investigate, or identify possible wrongdoing in
          connection with the Service or to comply with legal obligations.
        </p>
        <h4 id="section6">6. CHILDREN</h4>
        <p>
          The Service is intended for general audiences and is not directed to children under 13. We
          do not knowingly collect personal information from children under 13. If you become aware
          that a child has provided us with personal information without parental consent, please
          contact us <a href="mailto:support@warcraftlogs.com">here</a>. If we become aware that a
          child under 13 has provided us with personal information without parental consent, we take
          steps to remove such information and terminate the child's account.
        </p>
        <h4 id="section7">7. SECURITY</h4>
        <p>
          We use various safeguards to protect the personal information submitted to us, both during
          transmission and once we receive it. However, no method of transmission over the Internet
          or via mobile device, or method of electronic storage, is 100% secure. Therefore, while we
          strive to use commercially acceptable means to protect your personal information, we
          cannot guarantee its absolute security.
        </p>
        <h4 id="section8">8. CONTACT</h4>
        <p>
          You may contact us online concerning our Privacy Policy, or write to us at the following
          address:
          <br />
          RPGLogs, Attn: Data Privacy Manager <br />
          1301 Fannin St #2440 <br />
          Houston, TX 77002
        </p>
        <h4 id="section9">9. MODIFICATIONS TO THIS PRIVACY POLICY</h4>
        <p>
          We may revise this Privacy Policy from time to time. The most current version of the
          Privacy Policy will govern our collection, use, and disclosure of information about you
          and will be located at <a href="/privacy">https://wowanalyzer.com/privacy</a>. If we make
          material changes to this Privacy Policy, we will notify you by email or by posting a
          notice on the Service prior to the effective date of the changes. By continuing to access
          or use the Service after those changes become effective, you acknowledge the revised
          Privacy Policy.
        </p>
        <h4 id="section10">10. CALIFORNIA RESIDENTS: YOUR CALIFORNIA PRIVACY RIGHTS</h4>
        <p>
          We do not disclose your personal information to third parties for the purpose of directly
          marketing their goods or services to you unless you first agree to such disclosure. If you
          have any questions regarding this policy, or would like to change your preferences, you
          may contact us at the address listed above in Section 8.
        </p>
      </main>
    </div>
  );
}
