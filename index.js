#!/usr/bin/env node
"use strict";

// Очищаем консоль
process.stdout.write("\x1Bc");

// Модули
/** @type Object */
const fs = require("fs-extra");
const twig = require("twig").twig;
const inquirer = require("inquirer");
const _ = require("lodash");

// Вспомогательные функции
const cases = (value) => {
    return {
        given: value,
        camel: _.camelCase(value),
        kebab: _.kebabCase(value),
        lower: _.lowerCase(value),
        snake: _.snakeCase(value),
        start: _.startCase(value),
        upper: _.upperCase(value),
        firstSnake: _.upperFirst(_.snakeCase(value)),
        firstCamel: _.upperFirst(_.camelCase(value)),
        firstKebab: _.upperFirst(_.kebabCase(value)),
    };
};

// Грузим вопросы
/** @type Object */
const questions = require("./.ebo/questions.json");

// Грузим сценарии
/** @type Array */
const scripts = require("./.ebo/scripts.json");


// Начинваем опрос
inquirer.prompt(questions).then(answers => {

    // Делаем много вариантов написания ответов
    for (let [key, value] of Object.entries(answers)) {
        answers[key] = cases(value);
    }

    const data = { // Объект с данными для шаблонизации
        answers: answers
    };

    const checkMessages = []; // Список сообщений после проверки сценариев

    // Перебираем сценарии, два раза, первый прогон на проверки
    [true, false].forEach((isCheck) => {

        /**
         * @param {{action:string, src:string, dest:string, place:string, expression:string, condition:string}} currentScript
         */
        scripts.forEach((currentScript) => {
            const currentCondition = currentScript.condition ? twig({data: currentScript.condition}).render(data) : true; // Проверяем и шаблонизируем условия обработки сценария

            if (eval(currentCondition)) {
                // Эти конструкции и наличие всего необходимого проверятся движком js
                const currentTemplateFilename = twig({data: currentScript.src}).render(data); // Имя файла текущего шаблона
                const currentTemplateFile = fs.readFileSync(currentTemplateFilename, "utf8"); // Не обработанный шаблон
                const currentTemplate = twig({data: currentTemplateFile}).render(data); // Текущий шаблон
                const currentDestinationFileName = twig({data: currentScript.dest}).render(data); // Имя файла назначения

                if (currentScript.action === "new") {
                    if (isCheck) {
                        if (fs.pathExistsSync(currentDestinationFileName)) {
                            checkMessages.push(`File ${currentDestinationFileName} already exist`);
                        }
                    } else {
                        fs.outputFileSync(currentDestinationFileName, currentTemplate, "utf8");
                        console.log(`new\t->\t${currentDestinationFileName}`);
                    }
                }

                if (currentScript.action === "inject") {
                    if (isCheck) {
                        if (!fs.pathExistsSync(currentDestinationFileName)) {
                            checkMessages.push(`File ${currentDestinationFileName} does not exist`);
                        }
                        if ((currentScript.place === "after" || currentScript.place === "before") && !currentScript.hasOwnProperty("expression")) { // Если в скрипте нет ключа с выражением
                            checkMessages.push({"Expression key required in ": currentScript});
                        }
                    } else {
                        if (currentScript.place === "after" || currentScript.place === "before") {
                            const currentExpression = twig({data: currentScript.expression}).render(data); // Текущее выражение для инжекта
                            let currentDestinationFile = fs.readFileSync(currentDestinationFileName, "utf8");
                            if (currentScript.place === "after") {
                                currentDestinationFile = currentDestinationFile.replace(currentExpression, currentExpression + currentTemplate);
                            }
                            if (currentScript.place === "before") {
                                currentDestinationFile = currentDestinationFile.replace(currentExpression, currentTemplate + currentExpression);
                            }
                            fs.outputFileSync(currentDestinationFileName, currentDestinationFile, "utf8");
                            console.log(`inject\t->\t${currentDestinationFileName}`);
                        } else if (currentScript.place === "append" || currentScript.place === "prepend") {
                            let currentDestinationFile = fs.readFileSync(currentDestinationFileName, "utf8");
                            if (currentScript.place === "append") {
                                currentDestinationFile = currentDestinationFile + currentTemplate;
                            }
                            if (currentScript.place === "prepend") {
                                currentDestinationFile = currentTemplate + currentDestinationFile;
                            }
                            fs.outputFileSync(currentDestinationFileName, currentDestinationFile, "utf8");
                            console.log(`inject\t->\t${currentDestinationFileName}`);
                        }
                    }
                }
            }
        });

        if (0 < checkMessages.length) { // Если столкнулись с ошибками при первом прогоне
            throw new Error(JSON.stringify(checkMessages, null, 2));
        }
    });
});
