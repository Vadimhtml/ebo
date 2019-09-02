"use strict";

const questions = [
    {
        "type": "list",
        "name": "scenario",
        "message": "Scenario: ",
        "choices": ["Component", "Markup"]
    },
    {
        "type": "list",
        "name": "a",
        "message": "AAA: ",
        "choices": ["Organism", "Group"],
        "when": (e) => {
            return e["scenario"] === "Markup"
        }
    },
    {
        "type": "list",
        "name": "b",
        "message": "BBB: ",
        "choices": ["Page", "Popup"],
        "when": false
    },
    {
        "type": "input",
        "name": "name",
        "message": "Component name with spaces: ",
        "when": false
    },
    {
        "type": "list",
        "name": "template",
        "message": "Create templates: ",
        "choices": ["all", "js", "styl"],
        "when": false
    }
];

module.exports = questions;
