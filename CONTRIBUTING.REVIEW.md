# Code review guidelines

The following are a subset of common guidelines that will be looked at when reviewing code. The guidelines are written in *do*s and *don't*s to be concise and clear, but most guidelines have exceptions if you have a good reason for doing something else (this often warrants a comment though).

**Make sure there are no compile errors in your `npm start` window or in the Travis check. These must be fixed or your PR *can't* be merged.**

## Functionally:

- **Don't** show multiple statistic boxes from 1 module (analyzer).
- **Don't** add tooltips that do not reveal any new information. This is to avoid having a tooltip on everything so that users do not stop reading them because they don't contain anything interesting most of the time.

## Technically:

- **Don't** copy-paste easily sharable code (e.g. functions).
- **Don't** use [Hungarian notation](https://en.wikipedia.org/wiki/Hungarian_notation) or variants on this.
- **Do** give *all* your variables a proper name.
- **Don't** include the name of the class in a property name (no `car.carSpeed`, just `speed` would be enough).
- **Don't** leave any dead code such as empty methods or commented out code.
- **Don't** use `for()` if it can be done with `array.forEach` or `array.map`.
- **Don't** use relative paths for things in the shared codebase, e.g. the `common`, `Main`, `Parser/Core` folders.
- **Do** use relative paths within your namespace, e.g. within your spec folder.
- **Don't** keep `console.log`s enabled in your code.
- **Don't** keep methods with a huge amount of lines of code. If this happens you need to refactor.
- **Don't** nest if-statements. Instead do a single if-statement per check and just return early.

## Vague guidelines:

- **Do** try to be consistent with other specs. If another spec solves the same problem you should seriously consider solving it the same way.
