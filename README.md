# ebo

`npm install ebo --saveDev`

---
`./.ebo/questions.json`
```$json
[
  {
    "type": "list",
    "name": "hierarchy",
    "message": "Atomic hierarcy: ",
    "choices": ["Organism", "Group"]
  },
  {
    "type": "input",
    "name": "name",
    "message": "Component name with spaces: "
  },
  {
    "type": "list",
    "name": "template",
    "message": "Create templates: ",
    "choices": ["all", "js", "styl"]
  }
]
```
guide: https://www.npmjs.com/package/inquirer

---
`./.ebo/scripts.json`
```$json
[
  {
    "action": "new",
    "src": "./.ebo/make.js.swig",
    "dest": "./UiKit/scripts/make_{{answers.hierarchy.lower}}-{{answers.name.camel}}_{{answers.template.lower}}.js"
  },
  {
    "action": "inject",
    "place": "before",
    "expression": "//before",
    "src": "./.ebo/inject.js.swig",
    "dest": "./.ebo/test.js"
  },
  {
    "action": "inject",
    "place": "after",
    "expression": "//{{answers.template.lower}}",
    "src": "./.ebo/inject.js.swig",
    "dest": "./.ebo/test.js"
  },
  {
    "action": "inject",
    "place": "append",
    "src": "./.ebo/inject.js.swig",
    "dest": "./.ebo/test.js"
  },
  {
    "action": "inject",
    "place": "prepend",
    "src": "./.ebo/inject.js.swig",
    "dest": "./.ebo/test.js"
  },
  {
    "condition": "answers.template.lower === 'all'",
    "action": "inject",
    "place": "prepend",
    "src": "./.ebo/inject.js.swig",
    "dest": "./.ebo/test.js"
  }
]
```

---
`./.ebo/make.js.swig`
```$js
"use strict";

module.exports = (done) => {
    const src = ["{{answers.hierarchy.lower}}", "{{answers.name.camel}}"];
    const data = require("./common/dataByArray")(src, require("../src/stb-flat-css"));
    const InterpreterClass = require("./common/interpreterClass");
    const I = new InterpreterClass();

    const keyInterpreter = {};

    const keyIgnore = [];

    I.init(data, keyInterpreter, keyIgnore, src);
    const Result = I.make();

    const writeFile = require("./common/writeFile");
    const nameByArray = require("./common/nameByArray");
    const dest = require("path").join(__dirname, "..", "build");

    {% if template === "all" %}const writeTs = () => {
        writeFile(dest, `${nameByArray.camel(src)}.ts`, Result.ts, done);
    };

    writeFile(dest, `${nameByArray.camel(src)}.styl`, Result.stylus, writeTs);{% endif %}{% if template === "js" %}writeFile(dest, `${nameByArray.camel(src)}.ts`, Result.ts, done);{% endif %}{% if template === "styl" %}writeFile(dest, `${nameByArray.camel(src)}.styl`, Result.stylus, done);{% endif %}
};
```
guide: https://www.npmjs.com/package/swig

