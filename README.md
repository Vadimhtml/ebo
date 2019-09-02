# ebo

A simple and small tool for quickly creating application components from templates by script.

---
#### To get started, you must install the module
`npm install ebo --saveDev` or `npm install ebo --global`

---
#### Create a questionnaire configuration file

`./.ebo/questions.js`
```$js
"use strict";

const questions = [
    {
        "type": "list",
        "name": "scenario",
        "message": "Scenario:",
        "choices": ["Component", "Markup"]
    },
    {
        "type": "list",
        "name": "hierarchy",
        "message": "Atomic hierarchy:",
        "choices": ["Organism", "Group"],
        "when": (e) => {
            return e["scenario"] === "Component"
        }
    },
    {
        "type": "list",
        "name": "type",
        "message": "Markup type: ",
        "choices": ["Page", "Popup"],
        "when": (e) => {
            return e["scenario"] === "Markup"
        }
    },
    {
        "type": "input",
        "name": "name",
        "message": "Name with spaces:"
    }
];

module.exports = questions;
```
More information: https://www.npmjs.com/package/inquirer

---
#### Create a deployment script
`./.ebo/scripts.json`
```$json
[
  {
    "condition": "answers.scenario.given === 'Component'",
    "action": "new",
    "src": "./.ebo/component.js.twig",
    "dest": "./example/component/{{answers.hierarchy.lower}}/{{answers.name.camel}}.js"
  },
  {
    "condition": "answers.scenario.given === 'Markup'",
    "action": "new",
    "src": "./.ebo/markup.html.twig",
    "dest": "./example/markup/{{answers.type.lower}}/{{answers.name.camel}}.html"
  },
  {
    "condition": "answers.scenario.given === 'Component'",
    "action": "inject",
    "expression": "//@ebo inject {{answers.hierarchy.lower}}",
    "place": "before",
    "src": "const {{answers.hierarchy.lower}}{{answers.name.firstCamel}} = require('./component/{{answers.hierarchy.lower}}/{{answers.name.camel}}');\n",
    "dest": "./example/main.js"
  }
]
```

---
#### Create templates
`./.ebo/component.js.twig`
```$js
"use strict";

console.log("{{answers.hierarchy.lower}}", "{{answers.name.camel}}");
```
More information: https://www.npmjs.com/package/swig
