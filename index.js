#!/usr/bin/env node
"use strict";

// Очищаем консоль
process.stdout.write("\x1Bc");

// Модули
const fs = require("fs-extra");
const swig = require("swig");
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
        scripts.forEach((currentScript) => {
            const currentCondition = currentScript.condition ? swig.compile(currentScript.condition)(data) : true; // Проверяем и шаблонизируем условия обработки сценария
            if (eval(currentCondition)) {

                // Эти конструкции и наличие всего необходимого проверятся движком js
                const currentTemplateFilename = swig.compile(currentScript.src)(data); // Имя файла текущего шаблона
                const currentTemplate = swig.compileFile(currentTemplateFilename)(data); // Текущий шаблон
                const currentDestinationFileName = swig.compile(currentScript.dest)(data); // Имя файла назначения

                if (currentScript.action === "new") {
                    if (isCheck) {
                        if (fs.pathExistsSync(currentDestinationFileName)) {
                            checkMessages.push(`File ${currentDestinationFileName} already exist`);
                        }
                    } else {
                        fs.outputFileSync(currentDestinationFileName, currentTemplate);
                        console.log("new: ", currentDestinationFileName);
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
                            const currentExpression = swig.compile(currentScript.expression)(data); // Текущее выражение для инжекта
                            console.log(currentExpression);
                        } else if (currentScript.place === "append" || currentScript.place === "prepend") {
                            console.log('2');
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
