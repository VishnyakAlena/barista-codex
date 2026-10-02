import { getPath } from "#modules/filePath"
import { createData } from "#modules/utils"
import { dataTypes } from '#types/index';
import fsPromises from 'fs/promises'
import path from "node:path"
import { promisify } from "node:util"
// @ts-ignore-next-line
import xliff from 'xliff'


async function getLangFile(lang:string) {
    const fullPath = getPath(path.join('data', 'locales', `${lang}.xlf`))

    try {
        const langFile = await fsPromises.readFile(fullPath, 'utf-8')

        return  createData(dataTypes.SUCCESS, langFile)
    } catch (err){
        return createData(dataTypes.ERROR, (err as { message: string })?.message || 'File not found')
    }
}

async function parseXliff(file:string) {
    const xliff2js = promisify(xliff.xliff2js)

    try{
        let parsedXlif = await xliff2js(file)

        if(parsedXlif) {
            parsedXlif = parsedXlif?.resources?.f1
        }

        return createData(dataTypes.SUCCESS, parsedXlif)
    } catch (err){
        return createData(dataTypes.ERROR, (err as { message: string })?.message || 'Failed parse xliff')
    }
}



export const languageService = {
    getLangFile,
    parseXliff
}