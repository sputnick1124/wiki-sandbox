// ==UserScript==
// @name            Mermaid Diagrams
// @namespace       https://gist.github.com/kiennq
// @version         1.0.1.0
// @author          Kien Nguyen <kien.n.quang at gmail dot com>
// @description     Enable `Mermaid diagrams` on github wiki and markdown files
// @homepage        https://github.com/Redisrupt/mermaid-diagrams
// @updateURL       https://gist.github.com/kiennq/890bebf82a801867ba2366b03ea47d35/raw/mermaid-diagrams.user.js
// @match           https://*.visualstudio.com/*
// @match           https://dev.azure.com/*
// @match           https://github.com/*
// @match           https://gist.github.com/*
// @match           https://bitbucket.org/*
// @match           file:///*
// @require         https://unpkg.com/mermaid@latest/dist/mermaid.min.js
// @run-at          document-idle
// @grant           none
// ==/UserScript==

(() => {
    'use strict';

    const $ = (selector, ctx = document) => [].slice.call(ctx.querySelectorAll(selector));
    const mermaidAPI = window.mermaid.mermaidAPI;
    mermaidAPI.initialize({
        startOnLoad: false,
        theme: 'forest',
    });

    function addGlobalStyle(css) {
        let head = $('head')[0];
        if (!head) { return; }
        let style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = css;
        head.appendChild(style);
    }

    addGlobalStyle(`@keyframes mermaidDiagramCodeInserted {
        from { opacity: 0.99; }
        to { opacity: 1; }
    }`);
    addGlobalStyle(`.language-mermaid, [lang="mermaid"], .hljs {
        animation-duration: 0.001s;
        animation-name: mermaidDiagramCodeInserted;
    }`);

    function setupChart(elem, code) {
        var sourceName = elem.id;

        if (elem.id == "") {
            const postfix = Math.random().toString(36).substr(2, 9);
            sourceName = 'id-' + postfix;
            elem.id = sourceName;
        }

        var mermaidName = 'mermaid-' + sourceName;
        let existingDiagrams = $(`#${mermaidName}`);
        let existingDiagram = null;
        if (existingDiagrams.length > 0) {
            existingDiagram = existingDiagrams[0];
            existingDiagram.innerHTML = code;
        } else {
            // Create the element that will house the rendered diagram.
            elem.insertAdjacentHTML('afterend', `<div id="${mermaidName}" />`);
            elem.style.display = 'none';
            existingDiagram = $(`#${mermaidName}`)[0];

            // Create an observer to track changes to the diagram code.
            const observer = new MutationObserver(() => { processElement(elem) });
            observer.observe(elem, { characterData: true });
        }

        try {
            // Generate or regenerate diagram if it is existing.
            mermaidAPI.render('svg-' + mermaidName, code, (svgCode, _bindFuncs) => {
                existingDiagram.innerHTML = svgCode;
            }, existingDiagram);
        }
        catch (error) {
            console.log("Err: " + error);
            existingDiagram.style.display = 'none';
            elem.style.display = 'block';
        }
    };

    function processElement(elem) {
        const codeElem = $('code', elem)[0];
        if (codeElem !== undefined) {
            const code = codeElem.textContent;
            setupChart(elem, code);
        } else {
            const code = elem.textContent;
            setupChart(elem, code);
        }
    };

    function onElementInsert(event) {
        // We are only interested in the diagrams that trigger the css animation
        // called "mermaidDiagramCodeInserted". This is determined by the file
        // "on_change_animations.css".
        if (event.animationName !== "mermaidDiagramCodeInserted") {
            return
        }
        processElement(event.target);
    }

    // These will be run after DOMContentLoaded
    // Github
    $('[lang="mermaid"]').forEach(processElement);
    $('.language-mermaid').forEach(processElement);
    // This catches diagrams that are added to the page after it is loaded.
    // This might include comments from other users.
    document.addEventListener("animationstart", onElementInsert, false);

})();
