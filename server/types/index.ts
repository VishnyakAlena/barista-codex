export enum dataTypes {
  ERROR ='error',
  SUCCESS ='success'
}

type BeanDetailsType = {
    process: string,
    region: string,
    variety: string[],
    scaScore: number
}

type FlavourType = {
    notes: string[],
    acidity: number,
    sweetness: number,
    bitterness: number
}

type RecipeType = {
    id: string, 
    method: string, 
    grindSize: string, 
    waterTemp: number, 
    doseIn: number,
    doseOut: number, 
    timeTotal: string,
    steps: string[]
}

export type beanType = {
  id: string,
  title: string,
  type: string,
  country: string,
  description: string,
  roasterComment: string,
  imageUrl: string,
  details: BeanDetailsType,
  flavorProfile: FlavourType,
  recipes: RecipeType[]
}

export type SmallBeanType = Pick<beanType, 'id' | 'title' | 'type' | 'description' | 'imageUrl'>

export type BeanPath = {
  bean: beanType,
  path: string
}
