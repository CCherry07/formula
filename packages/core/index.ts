import "reflect-metadata/lite"
export * from "./controls/field"
export * from "./model/form"
export * from "./model/form_group"
export * from "./controls/decorator"
export * from "./boolless"
export * from "@rxform/shared"
export {
  setup as setupValidator,
  validate
} from "./validator"
export type { ValidateItem } from "./validator"

export { createTemplateLiterals as js } from "@rxform/shared"
