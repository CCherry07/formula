import React from 'react';
import { createRoot } from 'react-dom/client';
import Input from "./components/Input"
import { createForm } from "@signals-form/react"
import { FieldBuilder } from "@signals-form/core"
import { App } from './App';

const graph = Array.from({ length: 2000 }).map((_, i) => {
  return new FieldBuilder().component({
    id: `input${i}`,
    component: Input,
  })
  .props({
    label: `input${i}`,
  })

})

const { app, form } = createForm({
  defaultValidatorEngine: "zod",
  boolsConfig: {},
  graph,
  id: 'form1',
  components: {
    input: Input,
  }
})

const div = document.createElement('div');

const root = createRoot(div);

root.render(<App app={app} form={form} />);

document.body.appendChild(div);
