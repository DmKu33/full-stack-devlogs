// main.js - client-side code to connect to the bad password API

// REFERENCES
let password = document.querySelector("#password");
let button = document.querySelector("#submit");

// EVENTS
window.addEventListener("load", updatePassword);
document.addEventListener("submit", (e) => {
    e.preventDefault();
    updatePassword();
});

// add a change event listener to each option
document.querySelectorAll("input[type=radio]").forEach((ele) => {
    ele.addEventListener("change", updatePassword);
});

// called from load and user events
async function updatePassword() {
    let group1 = document.querySelector("input[name=group1]:checked");
    let group2 = document.querySelector("input[name=group2]:checked");

    let url = "/api/custom?params=" + group1.value + "," + group2.value;
    console.log("Fetching:", url);

    await fetch(url)
        .then((response) => response.json())
        .then((json) => {
            console.log("Response:", json);
            password.value = json.message;
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}
