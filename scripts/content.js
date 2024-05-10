let allowedMap = new Map();

// Function to fetch JSON data
async function fetchAllowedPokemonData() {
    await chrome.storage.local.get('meta', function(items){
        const xhr = new XMLHttpRequest();
        const date = new Date(items['meta']);
        const fileName = 'https://samuel-peter-chowdhury.github.io/35PokesShowdownFilter/dates/' + date.getUTCFullYear() + '_' + (date.getUTCMonth() + 1) + '.json';
        console.log(fileName);
        xhr.open('GET', fileName, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                const data = JSON.parse(xhr.responseText);
                data.forEach(item => {
                    allowedMap.set(item.toLowerCase(), true);
                });
                console.log(allowedMap);
            }
        }
        xhr.send();
    })
}

// Call the function to fetch JSON data
fetchAllowedPokemonData();

let removedElements = [];

const observer = new MutationObserver(onMutation);

chrome.storage.local.get(['toggleState'], function(items) {
    if (items['toggleState']) {
        observer.observe(document, {
            childList: true,
            subtree: true,
        });
    }
});

function onMutation(mutations) {
    for (const { addedNodes } of mutations) {
        for (const node of addedNodes) {
            if (!node.tagName) continue;
            const elements = node.getElementsByClassName('teambuilder-results');
            if (elements[0]) {
                filterChart(elements[0]);
                return;
            }
            const results = node.getElementsByClassName('result');
            if (results) {
                for (const result of results) {
                    const resultChild = result.querySelector('a[data-entry^="pokemon|"]');
                    if (resultChild) {
                        filterChart(results[0].parentElement.parentElement);
                        return;
                    }
                }
            }
        }
    }
}

function filterChart(chart) {
    if (chart) {
        console.log('Filtering Chart...');
        chart.scrollTop = chart.scrollHeight;
        setTimeout(function() {
            chart.scrollTop = 0;
            removedElements = [];
            filterPokemon(chart);
            filterHeaders(chart);
            unsetHeight(chart);
        }, 50);
    }
}

function filterPokemon(parentElement) {
    const entries = parentElement.querySelectorAll('li.result');
    entries.forEach(entry => {
        const pokemonName = entry.querySelector('a[data-entry^="pokemon|"]')?.getAttribute('data-entry')?.split('|')[1];
        if (pokemonName && !allowedMap.has(pokemonName.toLowerCase())) {
            entry.style.display = 'none';
            removedElements.push(entry);
        }
    });
}

function filterHeaders(parentElement) {
    const results = [...parentElement.querySelectorAll('li.result')];
    const headers = results.map((element) => element.querySelector('h3')).filter(e => e);
    headers.forEach(value => {
        value.parentElement.style.display = 'none';
        removedElements.push(value.parentElement);
    });
}

function unsetHeight(parentElement) {
    const childElement = parentElement.querySelector('ul.utilichart');
    if (childElement) {
        childElement.style = null;
    }
}
