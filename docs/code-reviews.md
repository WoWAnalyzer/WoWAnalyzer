# Code reviews

When you have made a Pull Request we will review your code. Our primary goal here is to catch any mistakes to prevent bugs, and to ensure your contributions can be maintained by someone else and do not break easily. **It is important to us that the time between creating your PR and publishing the changes in production is minimal.** Please contact an admin in the WoWAnalyzer Discord if you think this is taking unnecessarily long.

## Requirements

These things must be fixed before your PR can be merged.

- Make sure there are no compile errors in your `npm start` window or in the Travis check. These must be fixed or your PR *can't* be merged.
- Please avoid methods with a huge amount of lines of code. If this happens you need to refactor or this will likely become hard to maintain.
- Anything that (could at one point) result in a bug or invalid analysis.

## Guidelines

The following are a subset of common guidelines that may be looked at when reviewing code but usually won't block merging of your PR. We might still point them out so you might solve them in a follow up PR.

The guidelines are written in *do*s and *don't*s to be concise and clear, but most guidelines have exceptions if you have a good reason for doing something else (this often warrants a comment though).

### Functional guidelines

- **Don't** show multiple statistic boxes from 1 module (analyzer).
- **Don't** add tooltips that do not reveal any new information. This is to avoid having a tooltip on everything so that users do not stop reading them because they don't contain anything interesting most of the time.

### Technical guidelines

- Please **do** try to be consistent with other specs. If another spec solves the same problem you should seriously consider solving it the same way.
- Please **don't** copy-paste easily sharable code (e.g. functions). Move them to `common` or `Parser/Core`.
- Please **don't** use [Hungarian notation](https://en.wikipedia.org/wiki/Hungarian_notation) or variants on this.
- Please **do** give *all* your variables a proper name.
- Please **don't** include the name of the class in a property name (no `car.carSpeed`, just `speed` would be enough).
- Please **don't** leave any dead code such as empty methods or commented out code.
- Please **don't** use `for()` if it can be done with `array.forEach` or `array.map`.
- Please **don't** use relative paths ("../../") for things in the shared codebase, e.g. the `common`, `Main`, `Parser/Core` folders.
- Please **do** use relative paths within your namespace, e.g. within your spec folder.
- Please **don't** keep `console.log`s enabled in your code.
- Please **don't** nest if-statements. Instead do a single if-statement per check and just return early.
