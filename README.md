# WoWAnalyzer [![Build Status](https://travis-ci.org/WoWAnalyzer/WoWAnalyzer.svg?branch=master)](https://travis-ci.org/WoWAnalyzer/WoWAnalyzer)

Use this tool to analyze your performance based on important metrics for your spec using a Warcraft Logs report.

You will need a Warcraft Logs report with advanced combat logging enabled to start. Private logs can not be used, if your guild has private logs you will have to [upload your own logs](https://www.warcraftlogs.com/help/start/) or change the existing logs to the unlisted privacy option instead.

[https://wowanalyzer.com](https://wowanalyzer.com)

Feature requests (and bug reports provided that you're not using one of Microsoft's browsers) are welcome! On our Discord: https://discord.gg/AxphPxU or create an issue [here](https://github.com/WoWAnalyzer/WoWAnalyzer/issues).

## Battle for Azeroth

Battle for Azeroth changes will be applied to the [bfa](https://github.com/WoWAnalyzer/WoWAnalyzer/tree/bfa) branch. Any changes to this branch will automatically be deployed here: https://bfa.wowanalyzer.com.

When you make a pull request for the `bfa` branch please include BFA in the title of your PR.

## Contributing

You don't need to to do anything special to add a spec. The real issue preventing specs from being added is that in order to add a spec, you need to have the following 3 properties:
1. Know the spec well enough to actually create something useful
2. Know how to program well enough to implement the analysis
3. Have the time and motivation to actually do it

See the [contributing guidelines](CONTRIBUTING.md) if you want to give it a try.

## Vision

This project aims to give users tools to analyze their performance. The most important part of this is providing automated suggestions towards improving their performance based on recorded fights. This makes it so users can quickly, without any hassle and at any time consult this tool to find out points of improvement for their next pull.

Our focus:
 - Focus on one player at a time. A major reason for this is simplicity and giving the user a feeling of importance, but also because the Warcraft Logs API effectively only makes this available.
 - The priority is raid fights, other environments aren't really supported. While it would be nice to show things like who killed the most Explosive Orbs, we can't really with the API endpoints available to us.
 - Clear and concise suggestions that allow a user to quickly understand what potential issues and changes they need to make to improve. No hassle.

We also provide more advanced statistics such as item performance displays. These can be used to help pick what item to use or to see how effective certain abilities are that you can't find out elsewhere. These are secondary to suggestions and other tools that can be used to improve one's performance.

## Collaboration

All contributions, big or small, are welcome. You are welcome to contribute to this project with whatever level of contribution you are comfortable with. We have no expectations for the amount or frequency of contributions from anyone.

We want to share ownership and responsibility with the community where possible. To help with this we hand out *write access* when we deem pull requests consistently of sufficient quality. This isn't always on our mind though so if you think you qualify please contact an admin.

## License

See the [LICENSE](LICENSE) file.

Usage of any API keys found in the source is not allowed for other purposes than described in the source code and/or its documentation. You must at all times use your own API keys.
