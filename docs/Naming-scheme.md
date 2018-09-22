# Naming scheme

# Classes

- **Class names** (e.g. analyzers, normalizers and other modules) should be named using PascalCasing.
- **The class's file name** should match the class name.
- ***Public* property names** should be named using camelCasing.
- ***Private* property names** should be named like public method names, but prefixed with an underscore to denote they should not be accessed outside the class (though you can when inheriting).
- ***Public* method names** should be named using camelCasing
- ***Private* method names** should be named like public method names, but prefixed with an underscore to denote they should not be accessed outside the class.
- **Log-event listeners** should be named using `on_<eventname>`.

# Components

- **Component names** (e.g. a custom tab, or a new StatisticBox type) should be named using PascalCasing.
- **The component's file name** should match the class name.
- **Property names** should be named using camelCasing. Event handlers (via props) should be named on*Something*.
- **State** should be named using camelCasing.
- **Event handlers** should be named handle*Something*.

# CSS

A CSS file used in a component should generally use the same name as that component. If it's used in an `index.js`, it should take the foldername.

# Functions

Functions that aren't part of a class should be camelCased.

# Variables

**Variables within a method** that are defined as `const`, `let`, or `var` should always be camelCased.

# Constants

- **Constants** should be UPPER_CASED with underscores separating words. You're encouraged to make them as descriptive as possible, so they can be somewhat lengthy.
- If you export a constant *as a default* in a file, it should match the constant naming.
- A "constants.js" file with multiple constants should be lower-cased.

# Folders

If you put an `index.js` in a folder that is a Class or Component, use the applicable naming scheme (basically, the folder name should be PascalCased). In any other case the folder should be lowercased or camelCased. Single word folder names are preferred, and generally lower-casing is preferred (e.g. deathknight, demonhunter).

> At the time of writing this not all folders follow this naming scheme yet. We're slowly renaming them but it's slowed down because it causes issues for developers running Windows.
