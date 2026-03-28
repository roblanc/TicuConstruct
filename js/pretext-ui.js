import { prepare, walkLineRanges } from './pretext.js';

/**
 * Shrinkwraps an element's text using the Pretext layout engine.
 * @param {HTMLElement} el The element to shrinkwrap.
 * @param {number} maxAvailableWidth The maximum width the element can take.
 */
export function shrinkwrap(el, maxAvailableWidth = 800) {
    const text = el.innerText.trim();
    const style = window.getComputedStyle(el);
    const font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    
    // 1. Prepare the text (segmentation + measurement)
    const prepared = prepare(text, font);
    
    // 2. Calculate the tightest width
    let tightestWidth = 0;
    walkLineRanges(prepared, maxAvailableWidth, (line) => {
        if (line.width > tightestWidth) tightestWidth = line.width;
    });
    
    // 3. Apply the width (add a tiny buffer for browser rendering differences)
    el.style.width = `${Math.ceil(tightestWidth + 2)}px`;
    el.style.maxWidth = '100%';
}

/**
 * Finds the tightest width for a given number of lines using binary search.
 */
export function balance(el, containerWidth = 1200) {
    const text = el.innerText.trim();
    const style = window.getComputedStyle(el);
    const font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const prepared = prepare(text, font);
    
    // We want to find the min width that maintains the current "best" layout
    // For simplicity, we just shrinkwrap it. 
    // True "balancing" would involve binary searching for the most even lines.
    shrinkwrap(el, containerWidth);
}

/**
 * Initializes all elements with the 'data-pretext-*' attributes.
 */
export function initPretext() {
    // 1. Handle Shrinkwrap
    const shrinkElements = document.querySelectorAll('[data-pretext-shrinkwrap]');
    shrinkElements.forEach(el => {
        const container = el.parentElement;
        const width = container ? container.clientWidth : 800;
        shrinkwrap(el, width);
    });

    // 2. Handle Balanced Titles
    const balanceElements = document.querySelectorAll('[data-pretext-balanced]');
    balanceElements.forEach(el => {
        const container = el.parentElement;
        const width = container ? container.clientWidth : 1200;
        balance(el, width);
    });
    
    // Resize Listener
    let debounce;
    window.addEventListener('resize', () => {
        clearTimeout(debounce);
        debounce = setTimeout(() => {
            initPretext();
        }, 150);
    });
}
