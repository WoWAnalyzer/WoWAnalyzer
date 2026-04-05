### Enchantment Generation Script Usage

The scripts in `scripts/enchants` are used to automatically update the enchantment data for the application by fetching the latest definitions from Raidbots and Wago Tools.

#### Running the Script

You can run these scripts using `pnpm` from the repository root.

**For Live Data:**

```bash
pnpm run generate-enchants
```

**For PTR Data:**

```bash
pnpm run generate-enchants:ptr
```

#### Updating WoW Build Numbers

If the data becomes outdated or the script fails to find new items, update the build numbers in `scripts/enchants/enchants-helpers.ts`:

```typescript
export const LIVE_WOW_BUILD_NUMBER = '12.0.1.66220';
export const PTR_WOW_BUILD_NUMBER = '12.0.1.66220';
```

#### Troubleshooting

- **Cache**: The script caches external data in a `.cache` folder. If you need to force a fresh download, delete this folder.
- **Output**: The generated data is written directly to `src/common/ITEMS/midnight/enchants.ts`. Avoid manual edits to that file as they will be overwritten.
