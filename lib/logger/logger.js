'use strict';

const chalk = require('chalk');
const event = chalk.blue;
const eventName = chalk.underline;
const majorEvent = chalk.blue.bold;
const detail = chalk.magenta;
const detailValue = chalk.magenta.underline;

module.exports.dictionary = (dictionary) => {
    console.log(majorEvent('Dictionary ready!'));
    console.log(detail('Dictionary size ='), detailValue(dictionary.size));
};

module.exports.neuronIteration = (category, left) => {
    console.log(detail('Neuron'), eventName(category), detail('iteration complete; left:'), detailValue(left));
};

module.exports.neuronReady = (category) => {
    console.log(event('Neuron'), eventName(category), event('prepared'));
};

module.exports.neuronsReady = () => {
    console.log(majorEvent('All neurons prepared!'));
};
