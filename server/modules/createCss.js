import fsPromise from 'fs/promises';
import fs from 'fs'
import { getPath } from './filePath.js';
import path from 'node:path'


let stylesDirPath = path.resolve(getPath('./styles'))
let distPath = path.resolve(getPath("./dist"))
let bundlePath = path.join(distPath, './bundle.css')

export function createCss(){
   //Проверка на сущетсвование файла
   fs.access(bundlePath, err=>{
      if(err){
        readStylesDir()

        console.log('Успешно создано');
      }else{
        deleteDir(distPath)
        readStylesDir()

        console.log('Успешно обновнено');
  }
})
}


//Функция удаления файла
function deleteDir(pathTo){
  fs.readdir(pathTo, (err,files) => {
    if(err) {throw err}

      files.forEach(async file => {
        let pathFile = path.join(pathTo, file)

          if(path.extname(pathFile) === ".css"){
            try{
              await fsPromise.unlink(pathFile)
            }catch(err){
              console.log(err);
             }
          }
      })
  })
}

//Функция чтения папки со стилями
async function readStylesDir(){
  let data = await fsPromise.readdir(stylesDirPath, {withFileTypes: true} )
  .catch(err=>console.log('Что то пошло не так'))

  data.forEach(item=>{
    if(item.isFile()){
      let newPath = path.join(stylesDirPath, item.name)

      if(path.extname(newPath) === ".css"){
        readCss(newPath)
      }
    }
  })
}

// добавление прочитанных стилей в финальный файл
async function readCss(newpath){
  let data = await fsPromise.readFile(newpath, 'utf-8')

  fsPromise.appendFile(path.join(distPath, 'bundle.css'), data)
}