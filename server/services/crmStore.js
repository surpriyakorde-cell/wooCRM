import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const serverDirectory = path.dirname(fileURLToPath(import.meta.url));
const file = process.env.CRM_DATA_FILE || path.join(serverDirectory, '..', 'data', 'crm.json');

export async function readStore() {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return { customers: {}, reviews: null, notes: {}, tasks: [] };
  }
}

export async function saveStore(data) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(data, null, 2));
}
