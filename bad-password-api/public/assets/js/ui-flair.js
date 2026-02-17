// additional flair for the UI (frontend)
// https://tenor.com/view/flair-office-space-we-need-to-talk-about-your-flair-gif-16786213

const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
const tooltipInstance = new bootstrap.Tooltip(password);

/**
 * Add mouseenter message
 */
password.addEventListener("mouseenter", async function (event) {
    // use bootstrap tooltip
    tooltipInstance.setContent({ '.tooltip-inner': `Click to copy your ${getSynonym()} password!` });
    // a custom message
    // displayInfo(`Click to copy your <i>${getSynonym()}</i> password!`);
});
password.addEventListener("mouseleave", async function (event) {
    // displayInfo(``);
});

/**
 * Copy to clipboard
 */
password.addEventListener("click", async function (event) {
    try {
        await navigator.clipboard.writeText(this.value);
        tooltipInstance.setContent({ '.tooltip-inner': "Bad password copied!" });
        // displayInfo("Bad password copied!");
    } catch (err) {
        // displayInfo("password failed to copy! " + err);
    }
});

/**
 * Display info message
 */
let timeout;
function displayInfo(str) {
    clearTimeout(timeout);
    // if (info.innerHTML != "") return;
    info.innerHTML = str;
    timeout = setTimeout(function () {
        info.innerHTML = "";
        timeout = undefined;
    }, 3000);
}

/**
 * Get a synonym for "bad"
 */
function getSynonym() {
    return randomFromArray(badSynonyms);
}
/**
 * Get the correct indefinite article
 */
function getArticle(str) {
    if (/^[aeiou]$/i.test(str.charAt(0)))
        return "an " + str;
    else
        return "a " + str;
}
let badSynonyms = `bad
        atrocious
        awful
        cheap
        crummy
        dreadful
        regrettable
        dreadful
        unusable
        lousy
        poor
        sad
        unacceptable
        garbage
        imperfect
        inferior
        abominable
        careless
        crappy
        defective
        deficient
        erroneous
        fallacious
        faulty
        inadequate
        slipshod
        substandard
        unsatisfactory
        `
    .trim()
    .split(/\W+/);

/**
 * Get random array index
 */
function randomFromArray(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}






/********************************************************************
 Alternate version sends data to server in the body of a POST request
 ********************************************************************/

// async function updatePasswordPost() {
//     // store form data in an object to send to server
//     let formData = {
//         common: common.checked || false,
//         endearments: endearments.checked || false,
//         pets: pets.checked || false,
//         patterns: patterns.checked || false,
//         colors: colors.checked || false,
//         dates: dates.checked || false,
//         cities: cities.checked || false,
//         // lowercase: lowercase.checked || false,
//     }
//     console.log(formData)
//     // create options object to send data, options
//     let options = {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//         },
//         body: JSON.stringify(formData),
//     }
//     // request data
//     await fetch('https://bad-password-api.glitch.me/api/custom', options)
//         .then(response => response.json())
//         .then(json => {
//             console.log("fetch() response", json);
//             password.value = json.password;
//         });
// }
