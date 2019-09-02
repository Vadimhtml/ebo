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

const questions = [];

module.exports = questions;
```
More information: https://www.npmjs.com/package/inquirer

---
#### Create a deployment script
`./.ebo/scripts.json`
```$json
[]
```

---
#### Create templates
`./.ebo/make.js.twig`
```$js
"use strict";

module.exports = (done) => {
    const src = ["{{answers.hierarchy.lower}}", "{{answers.name.camel}}"];
};
```
More information: https://www.npmjs.com/package/swig
