#!/usr/bin/env node
"use strict";

// Очищаем консоль
process.stdout.write("\x1Bc");

// Модули
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

    // Перебираем сценарии
    scripts.forEach((currentScript) => {
        const currentCondition = currentScript.condition ? swig.compile(currentScript.condition)(data) : true; // Проверяем и шаблонизируем условия обработки сценария
        if (eval(currentCondition)) {
            const currentTemplateFilename = swig.compile(currentScript.src)(data); // Имя файла текущего шаблона
            const currentTemplate = swig.compileFile(currentTemplateFilename)(data); // Текущий шаблон
            const currentDestinationFileName = swig.compile(currentScript.dest)(data); // Имя файла назначения

            if (currentScript.action === "file") { // Тут надо создать файл
                console.log("file");
                console.log(currentTemplate);
                console.log(currentDestinationFileName);
            }
            if (currentScript.action === "before") {
                console.log("before");
                // Тут надо вставить шаблон до
            }
            if (currentScript.action === "after") {
                console.log("after");
                // Тут надо вставить шаблон после
            }
        }
    });
});
