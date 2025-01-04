import { validate, type ValidateItem, setupValidator } from "@rxform/core"
import { zodResolver } from "@rxform/resolvers"
import { toValue } from "@rxform/shared"
import { z } from "zod"
import { describe, it, expect } from "vitest"
import { D, setup } from "../../packages/core/boolless"
import { ReadonlySignal, signal } from "alien-signals"
setupValidator("zod", zodResolver as any)
const context = signal({
  name: signal('cherry'),
  age: signal(18),
  addr: signal({
    city: signal('重庆')
  }),
  d: signal('dd'),
  userinfo: signal({ name: signal('Tom'), age: signal(18) })
})

type Context = typeof context

const bools = {
  isD: (context: Context) => toValue(context).d.value === 'd',
  isTom: (context: Context) => toValue(context).userinfo.value.name.value === 'Tom',
} as const

const boolValues = setup(bools, context) as Record<keyof typeof bools, ReadonlySignal<boolean>>;

describe("validate", () => {
  const rules: ValidateItem[] = [
    {
      schema: z.object({
        name: z.string(),
        age: z.number(),
        addr: z.object({
          city: z.string()
        })
      })
    }
  ]

  it("validate success", async () => {
    const result = await validate({
      state: {
        name: "cherry",
        age: 18,
        addr: {
          city: '重庆'
        }
      },
      updateOn: "change"
    }, rules, boolValues, context)
    expect(result).toMatchInlineSnapshot(`{}`)
  })

  it("validate fail", async () => {
    const result = await validate({
      state: {
        name: "cherry",
        age: "18",
        addr: {
          city: '重庆'
        }
      },
      updateOn: "change"
    }, rules, boolValues, context)

    expect(result).toMatchInlineSnapshot(`
      {
        "age": {
          "message": "Expected number, received string",
          "type": "invalid_type",
        },
      }
    `)
  })

  it('fact success', async () => {
    const rules: ValidateItem[] = [
      {
        fact: {
          $state: "$state",
          userinfo: {
            addr: "朝阳区",
            name: "$.value.userinfo.value.name.value",
            age: "$.value.userinfo.value.age.value"
          }
        },
        schema: z.object({
          $state: z.object({
            name: z.string(),
            age: z.number(),
            addr: z.object({
              city: z.string()
            })
          }),
          userinfo: z.object({
            name: z.string(),
            age: z.number(),
            addr: z.string()
          })
        })
      }
    ]

    const result = await validate({
      state: {
        name: "cherry",
        age: 18,
        addr: {
          city: '重庆'
        }
      },
      updateOn: "change"
    }, rules, boolValues, context)
    expect(result).toMatchInlineSnapshot(`{}`)
  })

  it("needValidate", async () => {
    const rules: ValidateItem[] = [
      {
        needValidate: D.not("isTom"),
        schema: z.object({
          name: z.string(),
          age: z.number(),
          addr: z.object({
            city: z.string()
          })
        })
      }
    ]
    const result = await validate({
      state: {
        name: "cherry",
        age: 18,
        addr: {
          city: '重庆'
        }
      },
      updateOn: "change"
    }, rules, boolValues, context)
    expect(result).toMatchInlineSnapshot(`{}`)
  })
})
