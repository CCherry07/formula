import React from 'react';
import { createRoot } from 'react-dom/client';
import { Field, Component } from "@rxform/core"
import Input from "./components/Input"
import { createForm } from "@rxform/react"
import { App } from "./App1"

@Component({
  id: 'input',
  component: 'input',
  props: {
    title: "Phone Number"
  }
})
class InputCentral extends Field {
  constructor(id: string) {
    super()
    this.id = id
  }
}

const graph = Array.from({ length: 2000 }).map((_, i) => {
  return new InputCentral(`input${i}`)
}) as any[]

const { app, form } = createForm({
  defaultValidatorEngine: "zod",
  boolsConfig: {},
  graph,
  id: 'form1',
  components: {
    input: Input,
  }
})

const root = createRoot(document.getElementById('root')!);
root.render(<App app={app} form={form} />);
