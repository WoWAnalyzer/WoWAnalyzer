# WoW Analyzer [![Build Status](https://travis-ci.org/MartijnHols/WoWAnalyzer.svg?branch=master)](https://travis-ci.org/MartijnHols/WoWAnalyzer)

Use this tool to analyze your performance based on important metrics for your spec using a Warcraft Logs report.

You will need a Warcraft Logs report with advanced combat logging enabled to start. Private logs can not be used, if your guild has private logs you will have to [upload your own logs](https://www.warcraftlogs.com/help/start/) or change the existing logs to the unlisted privacy option instead.

Run it: [https://wowanalyzer.com](https://wowanalyzer.com)

Feature requests (and bug reports provided that you're not using one of Microsoft's browsers) are welcome! On our Discord: https://discord.gg/AxphPxU or create an issue [here](https://github.com/MartijnHols/WoWAnalyzer/issues).

## Contributing

You don't need to to do anything special to add a spec. The real issue preventing specs from being added is that in order to add a spec, you need to have the following 3 properties:
1. Know the spec well enough to actually create something useful
2. Know how to program well enough to implement the analysis
3. Have the time and motivation to actually do it

See the [contributing guidelines](CONTRIBUTING.md) if you want to give it a try.

## Current specs:

See the site for a list of current specs. The following specs bothered to make a custom readme:
 * [Resto Druid](src/Parser/RestoDruid/README.md) (maintained by @blazyb)
 * [Resto Shaman](src/Parser/RestorationShaman/README.md) (maintained by @versaya)
 * [Mistweaver Monk](src/Parser/MistweaverMonk/README.md) (maintained by @anom0ly)

## License

See the [LICENSE](LICENSE) file. Usage of any API keys found in the source is not allowed for other purposes than described in the source code and/or its documentation. You must at all times use your own API keys.
