import { execSync } from 'node:child_process';

export function optimize_jpg(filename) {
  execSync(`jpegoptim -m80 ${filename}`);
}

export function optimize_png(filename) {
  execSync(`oxipng -o max --alpha --strip all ${filename}`);
}

export function optimize_image(targetFileName) {
  if (targetFileName.endsWith('.jpg')) {
    optimize_jpg(targetFileName);
  } else if (targetFileName.endsWith('.png')) {
    optimize_png(targetFileName);
  } else {
    throw new Error(`unsupported file type: ${targetFileName}`);
  }
}

if (import.meta.main) {
  const targetFileName = process.argv[2];
  optimize_image(targetFileName);
}
