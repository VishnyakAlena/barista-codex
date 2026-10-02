import express from 'express'
import {languageService} from '#services/languageService'
import { dataTypes } from '#types/index';

export const languageRouter = express.Router()

languageRouter.get('/:lang', async (req, res) => {
    const curLang = req.params.lang
    let response = await languageService.getLangFile(curLang)

    if( response.type === dataTypes.ERROR ){
        response = await languageService.getLangFile('en')
    }

    const parseData = await languageService.parseXliff(response.data as string)

    if( parseData.type === dataTypes.ERROR ){
        res.status(400).json(parseData)

        return
    }

    res.status(200).json(parseData)
});