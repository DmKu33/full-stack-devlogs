// main.js (client side, run by the browser) 

//////////////////////////////////////
/////////////// INIT /////////////////
//////////////////////////////////////

// base url for 10.3
// 👉 add new base url to pull from your own database (Chapter 10 wiki) ...
let baseurl = ""; // same origin when running locally or on Vercel
// 👈


// declare data in global scope so to access from other functions
let data = [];

async function main() {
    // 👉 add code inside this function (Chapter 10) ...
    data = await fetchFeelings();
    updateMap(data);
    // 👈
}
main();

// create interface
(async () => {
    // update drop down
    updateOptions(colors);
})();


//////////////////////////////////////
///////////// FUNCTIONS //////////////
//////////////////////////////////////

// Fetch feelings data from the API server 
async function fetchFeelings() {
    return await fetchData(baseurl + "/api/feelings");
}
// a test file
async function fetchTestFeelings() {
    return await fetchData("/assets/data/test-feelings.json");
}

/**
 *  Fetch data from a URL
 */
async function fetchData(url) {
    return await fetch(url)
        .then((response) => response.json())
        .then((json) => {
            // console.log("fetch() response", json);
            return json;
        })
        .catch((err) => {
            throw new Error("Issue retrieving data from API");
        });
}



/**
 * Submit form handler
 */
function submitForm(e) {
    try {
        // 👉 add code inside this function (Chapter 10 wiki) ...
        e.preventDefault();
        let data = getFormData();
        let options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        };
        fetch(baseurl + "/api/feeling", options)
            .then((response) => response.json())
            .then(async (json) => {
                await updateMap(json);
                showSuccessMsg("feeling was added");
            });
        // 👈
    } catch (e) {
        showSuccessMsg("Please add a feeling and select a location", "white");
    }
}



/**
 *  Get form data
 */
function getFormData() {
    // references
    let location = document.querySelector("#location");
    // get checked option
    let id = document.querySelector('input[name="feelings"]:checked').id;

    // update
    let feeling = "";
    let color = "";

    // if the checked option is in colors
    if (id < colors.length) {
        feeling = colors[id].feeling;
        color = colors[id].color;
    } else {
        // they chose "addYourOwn"
        feeling = this.text.value;
        color = this.color.value;
    }
    // split the value of
    let [lat, lng] = location.value.split(",");
    // console.log(feeling, color, lat, lng);

    return {
        feeling: feeling,
        color: color,
        lat: lat,
        lng: lng,
    };
}

