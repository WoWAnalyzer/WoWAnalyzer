## Background Images

There are two types of background images: boss images, and zone/dungeon images.

### Dependencies

To optimize images, you need:

- `jpegoptim` for .jpg files
- `oxipng` for .png files

### Boss Images

These are taken from WCL assets for boss tiles. @emallson can get the full-size versions. These are resized to x1080 and optimized with:

```bash
node optimize.mjs <image-path>
```

### Zone/Dungeon Images

These come from game loading screens. New zones have nice artwork-only loading screen images that the game itself composites with the expansion logo / bars.

However, older zones (which are relevant for M+) typically have baked-in expansion logos / bars. The `instance-loading-screen.mjs` script will do some aggressive cropping to produce an artwork-only image.

```bash
node instance-loading-screen.mjs <map-id> <image-path>
```

To find the `<map-id>`, look up the instance in the [`Map` DBC](https://wago.tools/db2/Map).

If the crop is bad, you can try adjusting the margins _or_ just load it up in your favorite paint-equivalent and do a manual crop.
