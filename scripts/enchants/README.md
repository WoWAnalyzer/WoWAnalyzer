### Enchantment Generation Script Usage

The scripts in `scripts/enchants` are used to automatically update the enchantment data for the application by fetching the latest definitions from Raidbots and DBC.

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

#### New Expansions

When generating enchants for a new expansion, you will need to update the `EXPANSION` / `ENCHANTS_FILE` constants in `scripts/enchants/generate-enchants.ts` to match the new expansion.

#### Troubleshooting

- **Cache**: The script caches external data in a `.cache` folder. If you need to force a fresh download, delete this folder.
- **Output**: The generated data is written directly to `src/common/ITEMS/midnight/enchants.ts`. Avoid manual edits to that file as they will be overwritten.
