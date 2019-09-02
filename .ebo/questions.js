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
