import * as opt from './optimize.mjs';
import * as udsv from 'udsv';
import BLPFile from 'js-blp';
import sharp from 'sharp';

async function fetch_table(url, filters) {
  const query = new URLSearchParams();
  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      query.append(`filter[${key}]`, value);
    }
  }

  const requestUrl = `${url}?${query.toString()}`;

  const response = await fetch(requestUrl);

  const rawMapData = await response.text();
  const schema = udsv.inferSchema(rawMapData);
  const parser = udsv.initParser(schema);
  return parser.typedObjs(rawMapData);
}

async function download_image(mapId) {
  const data = await fetch_table(`https://wago.tools/db2/Map/csv`, {
    ID: `exact:${mapId}`,
  });

  const { LoadingScreenID } = data[0];

  console.info('loading screen ID: ', LoadingScreenID);

  const loading_screens = await fetch_table(`https://wago.tools/db2/LoadingScreens/csv`, {
    ID: `exact:${LoadingScreenID}`,
  });

  const { MainImageFileDataID, WideScreen169FileDataID, NarrowScreenFileDataID } =
    loading_screens[0];

  const fileId = [MainImageFileDataID, WideScreen169FileDataID, NarrowScreenFileDataID].find(
    (id) => id > 0,
  );
  const isWideScreen = !MainImageFileDataID && WideScreen169FileDataID;
  const isNarrowScreen = !MainImageFileDataID && NarrowScreenFileDataID;

  if (fileId === 0) {
    throw new Error('could not locate loading screen file ID for map ' + mapId);
  }

  console.info('downloading file: ', fileId);

  const response = await fetch(`https://wago.tools/api/casc/${fileId}?download`);

  const blob = await response.blob();

  const blp = new BLPFile(await blob.arrayBuffer());
  const pixels = blp.getPixels();

  let image = sharp(pixels.raw, {
    raw: {
      width: blp.width,
      height: blp.height,
      channels: 4,
    },
  }).png({});

  if (isWideScreen) {
    const scale = blp.width / 1280;
    image = image.extract({
      left: 0,
      top: 190 * scale,
      width: 1280 * scale,
      height: (1024 - 2 * 190) * scale,
    });
  } else if (isNarrowScreen) {
    // some of these are 1024 square, some are 2048 square
    const scale = blp.width / 1024;
    image = image.extract({
      left: 0,
      width: 1024 * scale,
      top: 310 * scale,
      height: (1024 - 2 * 310) * scale,
    });
  } else {
    const scale = blp.width / 2992;
    image = image.extract({
      left: 0,
      width: blp.width,
      top: 295 * scale,
      height: (1684 - 2 * 295) * scale,
    });
  }

  return image;
}

async function resize_image(image, width, height) {
  return image.resize(width, height);
}

if (import.meta.main) {
  const [, , mapId, fileName] = process.argv;
  if (!mapId || !fileName) {
    throw new Error('Usage: instance-loading-screen.mjs <mapId> <outputFileName>');
  }

  const originalImage = await download_image(mapId);
  let image = await resize_image(originalImage, 1920, 1080);
  if (fileName.endsWith('.jpg')) {
    image = image.jpeg({});
  }
  await image.toFile(fileName);
  opt.optimize_image(fileName);
}
