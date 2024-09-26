import fse from 'fs-extra';
import { ES_DIR } from './common.js';

const { remove } = fse;

export async function clean() {
  await Promise.all([remove(ES_DIR)]);
}
