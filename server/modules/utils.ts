import fsPromises from 'fs/promises';
import fs from 'fs'
import { getPath } from './filePath.ts';
import { colorLog } from './logger.ts';
import path from 'node:path'
import { dataTypes } from '#types/index';

export function createData<T>(type:dataTypes, data: T ) {
  return {
    type,
    data
  }
}

export async function createFile(fileName: string, content: string, isAbsolutePath = false){
  try{
    const path = isAbsolutePath ? fileName : getPath(fileName)

    await fsPromises.writeFile(path, content)

    return createData(dataTypes.SUCCESS,  'File writtten')
  }catch(err){
    return createData(dataTypes.ERROR,  err)
  }
}

export async function readDirSimple(dirName: string){
  try{
    const files = await fsPromises.readdir(getPath(dirName))

    colorLog(files, 'green')
  }catch(err){
    console.log(err);
  }
}

export async function removeFile(path: string) {
    try {
        await fsPromises.unlink(getPath(path));
        console.log(`Файл ${path} удален.`);
    } catch (error) {
    if ((error as {code: string}).code === 'ENOENT') {
          console.log("Файла и так нет, ничего страшного.");
    } else {
      console.log(error);
    }
  }
}

export async function addUser(user: string) {
      const DB_PATH = getPath('./files/db.json')
      // 1. Читаем строку
      const rawData = await fsPromises.readFile(DB_PATH, 'utf-8');
       // 2. Превращаем в массив JS
      const users = JSON.parse(rawData);
       // 3. Меняем данные
      users.push(user);
       // 4. Превращаем обратно в строку и записываем
       // null, 2 — для красивых отступов
      await fsPromises.writeFile(DB_PATH, JSON.stringify(users, null, 2));

      colorLog('User created', 'green')
}

export function copyFile(fileName: string, copyFileName: string) {
    const stream = fs.createReadStream(getPath(fileName));

    const writeableStream = fs.createWriteStream(getPath(copyFileName));

    stream.pipe(writeableStream);

    stream.on('end', () => console.log('Запись файла завершено'));
}

export async function readDir(dirName: string) {
  try {
      const data = await fsPromises.readdir(getPath(dirName),{ withFileTypes: true })
      
      const filesArr:string[] = []

      data.forEach(item=>{
        if(item.isFile()){
          let pathToFile =  path.resolve(getPath(dirName),`./${item.name}`)

          filesArr.push(pathToFile)
        }
      })

      return createData(dataTypes.SUCCESS, filesArr)
  }catch(err){
      return createData(dataTypes.ERROR, (err as { message: string })?.message || 'Failed read dir beans')
  }
}


