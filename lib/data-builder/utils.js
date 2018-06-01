'use strict';

module.exports.shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = module.exports.randomInt(0, i);
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

module.exports.randomInt = (min, max) => {
    let rand = min + Math.random() * (max + 1 - min);
    rand = Math.floor(rand);
    return rand;
};
