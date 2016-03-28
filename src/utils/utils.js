/**
 * Creates a DOM element from a string
 * @param {String} html
 * @return {HTMLElement}
 */
export function string2Element(html) {
    let div = document.createElement('div');
    div.innerHTML = html.trim();
    return div.firstChild;
}

/**
 * Converts {h: "hours", m: "minutes"} into total minutes
 * It's used to be able to compare
 * @param {Object} duration - {h: "hours", m: "minutes"}
 * @return {Number}
 */
export function duration2Minutes(duration) {
    const hours = parseInt(duration.h, 10);
    const mins = parseInt(duration.m, 10);
    return hours*60 + mins;
}

/**
 * Opposite to the previous one
 * @param {Number} mins
 * @return {Object} duration - {h: "hours", m: "minutes"}
 */
export function minutes2Duration(mins) {
    const h = Math.floor(mins / 60);
    const m = mins - h*60;
    return {h, m};
}

/**
 * Returns a template replacing placeholders with values
 * @param {String} tmpl
 * @param {Object} key/value map
 * @return {String}
 */
export function compileTemplate(tmpl, keyMap) {
    for(let key of Object.keys(keyMap)) {
        tmpl = tmpl.replace(new RegExp(`%${key}%`, 'g'), keyMap[key]);
    }

    return tmpl;
}

/**
 * Finds an element in the parents of the given element
 * @param {HTMLElement} child
 * @param {String} selector
 * @return {HTMLElement}
 */
export function findElementInParents(child, selector) {
    let parent = child.parentElement;
    if (parent) {
        const element = parent.querySelector(selector);
        if (element) {
            return element;
        } else {
            return findElementInParents(parent, selector);
        }
    }
}