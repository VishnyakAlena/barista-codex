import { fileURLToPath } from 'url';
import path from 'node:path'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getPath(file: string ){
    const pathToFile = path.join(__dirname,'../', file)
  
    return pathToFile
}