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

// Рабочие константы
const cwd = process.cwd();
const configPath = cwd + "/.ebo/";
const questionsJsPath = configPath + "questions.js";
const questionsJsonPath = configPath + "questions.json";

// Грузим вопросы
/** @type Object */
let questions;
try {
    questions = require(questionsJsPath);
} catch (jsError) {
    try {
        questions = require(questionsJsonPath);
    } catch (jsonError) {
        throw jsError;
    }
}

// Грузим сценарии
/** @type Array */
const scripts = require(configPath + "scripts.json");


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
            const currentCondition = currentScript.hasOwnProperty("condition") ? twig({data: currentScript.condition}).render(data) : true; // Проверяем и шаблонизируем условия обработки сценария
            if (eval(currentCondition)) {

                const currentSrc = twig({data: currentScript.src}).render(data); // Отшаблонизированный текущий источник
                const currentDest = twig({data: currentScript.dest}).render(data); // Имя файла назначения

                if (currentScript.action === "new") {
                    const newTemplate = twig({data: fs.readFileSync(currentSrc, "utf8")}).render(data); // Новый шаблон
                    if (isCheck) {
                        if (fs.pathExistsSync(currentDest)) {
                            checkMessages.push(`File ${currentDest} already exist`);
                        }
                    } else {
                        fs.outputFileSync(currentDest, newTemplate, "utf8");
                        console.log(`new\t->\t${currentDest}`);
                    }
                }

                if (currentScript.action === "inject") {
                    const injectTemplate = currentSrc; // Шаблон для инъекции
                    if (isCheck) {
                        if (!fs.pathExistsSync(currentDest)) {
                            checkMessages.push(`File ${currentDest} does not exist`);
                        }
                        if ((currentScript.place === "after" || currentScript.place === "before") && !currentScript.hasOwnProperty("expression")) { // Если в скрипте нет ключа с выражением
                            checkMessages.push({"Expression key required in ": currentScript});
                        }
                    } else {
                        if (currentScript.place === "after" || currentScript.place === "before") {
                            const currentExpression = twig({data: currentScript.expression}).render(data); // Текущее выражение для инжекта
                            let currentDestinationFile = fs.readFileSync(currentDest, "utf8");
                            if (currentScript.place === "after") {
                                currentDestinationFile = currentDestinationFile.replace(currentExpression, currentExpression + injectTemplate);
                            }
                            if (currentScript.place === "before") {
                                currentDestinationFile = currentDestinationFile.replace(currentExpression, injectTemplate + currentExpression);
                            }
                            fs.outputFileSync(currentDest, currentDestinationFile, "utf8");
                            console.log(`inject\t->\t${currentDest}`);
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
