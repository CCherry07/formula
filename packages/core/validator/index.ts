import { isProd, isArray, isObject, isString, get, isFunction } from "@formula/shared"
import type { AbstractModel } from "../model/abstract_model"
import { FieldErrors } from "../types/field"
import { Resolver } from "../resolvers/type";
import { Decision } from "../boolless";
import { Context, ValidateItem, ValidatorResolvers } from "./types";

export function setup(this: AbstractModel<any>, validator: string, resolver: Resolver) {
  if (!isProd && this.validatorResolvers[validator]) {
    console.warn(`${validator} is already registered`);
  }
  this.validatorResolvers[validator] = resolver
}

/**
 * 
 * @param fact '$.a' | { a: '$.a' , b: "$.b" } $: model
 * @param model Record<string,any>
 * @returns 
 */
const getFactValue = (fact: string | Object | Array<string>, state: any, model: any): any => {
  if (isFunction(fact)) {
    return fact(state, model)
  }
  if (isObject(fact)) {
    return Object.fromEntries(Object.entries(fact).map(([key, value]) => [key, getFactValue(value, state, model)]))
  }
  if (isArray(fact)) {
    return fact.map(item => getFactValue(item, state, model))
  }
  if (isString(fact)) {
    if (fact.startsWith('$')) {
      return get({ $: model, $state: state }, fact)
    }
  }
  return fact
}

export const validate = async <T>({ state, updateOn: _updateOn, model, boolContext, defaultValidatorEngine }: Context<T>, validates: ValidateItem[], validatorResolvers: ValidatorResolvers): Promise<FieldErrors> => {
  const fieldErrors = {} as FieldErrors
  for (const item of validates) {
    const { schema, engine = defaultValidatorEngine, fact, updateOn, schemaOptions, factoryOptions, needValidate } = item
    if (needValidate instanceof Decision && needValidate.not().evaluate(boolContext)) continue
    if (typeof updateOn === "string" && updateOn !== _updateOn || isArray(updateOn) && updateOn.includes(_updateOn)) continue
    if (!isFunction(validatorResolvers[engine])) {
      throw new Error(`validator ${engine} is not registered`)
    }
    const validator = validatorResolvers[engine](schema, schemaOptions, factoryOptions)
    const factValue = fact ? getFactValue(fact, state, model) : state

    const { errors } = await validator(factValue)
    Object.assign(fieldErrors, errors)
  }
  return fieldErrors
}


export const formatValidateItem = (items: ValidateItem [] | ValidateItem | Object): ValidateItem[] => {
  if (isArray(items)) {
    return items.map(i => i?.schema ? i : { schema: i })
  } else if ((items as ValidateItem)?.schema) {
    return [items as ValidateItem]
  } else {
    return [{
      schema: items as Object
    }]
  }
}
