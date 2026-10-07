import { createData, createFile, readDir } from "#modules/utils"
import { dataTypes, type BeanPath, type beanType, type SmallBeanType } from '#types/index';
import fsPromises from 'fs/promises'
import path from "node:path"
import { v4 as uuidv4 } from 'uuid';
import { DefaultRecipes } from "../constants/index.ts";

async function getBeans(withPath: boolean = false, typeFilter: string = 'all') {
    const response = await readDir(path.join('data', 'beans'))
    const allBeans:beanType[] = []
    const allBeansWithPath:BeanPath[]  = []

    if(response.type === dataTypes.ERROR){
        return response
    }

    try {
        for (const path of response.data){
                const bean = await fsPromises.readFile(path, 'utf-8')

                const parsedBean = JSON.parse(bean) as beanType

                if (typeFilter && typeFilter.toLowerCase() !== 'all') {
                    const currentType = (parsedBean.type || '').toLowerCase();
                    
                    if (currentType !== typeFilter.toLowerCase()) {
                        continue;
                    }
                }

                if(withPath){
                    allBeansWithPath.push({
                        bean: parsedBean,
                        path
                    })
                } else {
                    allBeans.push(parsedBean)
                }
            }

            return  createData(dataTypes.SUCCESS, withPath ? allBeansWithPath :  allBeans)
        }catch(err){
            return createData(dataTypes.ERROR, (err as { message: string })?.message || 'Failed read some bean file')
        }
}

function parseBeans(beansArr:beanType[]):SmallBeanType[]{
    return beansArr.map(bean => ({
        id: bean.id,
        title: bean.title,
        type: bean.type,
        description: bean.description,
        imageUrl: bean.imageUrl
    }))
}

function checkBeansData(bean:beanType) {
    if(!bean.title) return createData(dataTypes.ERROR, 'Title is missing')

    if(!bean.country) return createData(dataTypes.ERROR, 'Country is missing')

    return createData(dataTypes.SUCCESS, 'All done')
}

function addRecipesAndId(bean:beanType) {
    if(!bean.recipes || bean.recipes?.length === 0){
        bean.recipes = DefaultRecipes
    }

    bean.id = uuidv4()

    return bean
}

async function createBeanFile(bean:beanType){
    const fileName = `${bean.details.region.toLowerCase()}-${bean.details.process.toLowerCase()}`

    const response = await createFile(path.join('data', 'beans', `${fileName}.json`), JSON.stringify(bean, null, 2))

    if(response.type === dataTypes.SUCCESS){
        return createData(dataTypes.SUCCESS, { id: bean.id })
    }

    return response
}

async function removeBean(beansArr:BeanPath[], id: string) {
    const bean = beansArr.find(item => item.bean.id === id)

    if(!bean) return createData(dataTypes.ERROR, `File with id:${id} not found`)

    try {
        await fsPromises.unlink(bean.path);
        return createData(dataTypes.SUCCESS, 'Removed success')
    }catch (err){
        return createData(dataTypes.ERROR, err)
    }
}

async function updateBean(beansArr:BeanPath[], id: string, body: beanType) {
    const oldBean = beansArr.find(item => item.bean.id === id)

    if(!oldBean) return createData(dataTypes.ERROR, `File with id:${id} not found`)

    const recipes = oldBean.bean.recipes
    const pathToFile = oldBean.path

    const newBean = {
        ...body,
        recipes,
        id
    }

    const response = await createFile(pathToFile, JSON.stringify(newBean, null, 2), true)

    if(response.type === dataTypes.SUCCESS){
        return createData(dataTypes.SUCCESS, 'File updated successfully')
    }

    return response
}
export const beansService = {
    getBeans,
    parseBeans,
    checkBeansData,
    addRecipesAndId,
    createBeanFile,
    removeBean,
    updateBean
}