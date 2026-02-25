//////////////////////////////////////
//////////// UI FUNCTIONS ////////////
//////////////////////////////////////

/**
 *  Get HTML for a single "feeling circle"
 */
function getCircle(color) {
	let radius = 11;
	return `<span class="circle" style="width:${radius * 2}px; 
              height:${radius * 2}px; background-color: ${color}; "></span>`;
}

/**
 *  Get HTML for an option in the select drop down
 */
function getOption(id, feeling, color) {
	return `
		<div class="option">
            ${getCircle(color)}
			<input type="radio" class="radio" id="${id}" name="feelings" />
			<label for="${id}">${feeling}</label>
        </div>`;
}


// logo blur effect
let logo = document.querySelector("svg.logo");
let blurInterval, blurValue, blurMax = 15, blurMin = .1, blurStep = .5;
function showBlur(blurValue, step) {
	if (blurInterval) return;
	blurInterval = setInterval(function () {
		blurValue += step;
		// console.log("blurValue", blurValue);
		logo.style.filter = `blur(${blurValue}px)`;
		if (blurValue <= blurMin) {
			clearInterval(blurInterval);
			blurInterval = undefined;
			logo.style.filter = `blur(0px)`;
		} else if (blurValue > blurMax){
			clearInterval(blurInterval);
			blurInterval = undefined;
			showBlur(blurMax, -blurStep);
		}
	}, 90);
}
showBlur(blurMax, -blurStep);
logo.addEventListener("click", function () {
	showBlur(1, blurStep);
});



/**
 *  Create the list of options in the drop down (with color circles)
 */

function updateOptions(colors) {
	let optionsContainer = document.querySelector(".options-container");
	if (!optionsContainer) {
		// console.log("optionsContainer not defined");
		return;
	}
	let selected = document.querySelector(".selected");
	let options = "";
	// for each option
	for (let row in colors) {
		options += getOption(row, colors[row].feeling, colors[row].color);
	}
	// append custom


	let colorValue = "#" + randomHex()


	options += getOption(colors.length, "Add your own!", colorValue);
	// insert into html
	optionsContainer.innerHTML = options;

	// show dropdown
	selected.addEventListener("click", () => {
		optionsContainer.classList.toggle("active");
	});

	// add listener to each
	let optionsList = document.querySelectorAll(".option");

	optionsList.forEach((option) => {
		option.addEventListener("click", () => {
			selected.innerHTML = option.innerHTML;
			// console.log(selected.innerHTML);
			checkOne(selected.querySelector("input").id, colors);
			// hide dropdown
			optionsContainer.classList.remove("active");
		});
	});

	document.querySelector("#color").setAttribute("value", colorValue);
	document.querySelector("#color").style.color = colorValue;
}
// display an option as checked
function checkOne(id, colors) {
	let inputList = document.querySelectorAll('input[name="feelings"]');
	inputList.forEach((input) => {
		input.checked = false;
		if (input.id == id) input.checked = true;
	});
	// console.log("checkOne()", id, colors.length);

	let addYourOwn = document.querySelector(".addYourOwn");
	if (!addYourOwn) {
		console.log("addYourOwn not defined");
		return;
	}
	// show / hide "addYourOwn" input
	if (id == colors.length) {
		addYourOwn.style.display = "block";
	} else {
		addYourOwn.style.display = "none";
	}
}


function showSuccessMsg(str, color = "white") {
	let msg = document.querySelector(".msg");
	if (!msg) {
		console.log("msg not defined");
		return;
	}
	console.log("showSuccessMsg()", str);
	msg.innerHTML = str;
	msg.style.color = color;
	msg.classList.add("visible");
	setTimeout(function () {
		msg.classList.remove("visible");
	}, 2600);
}

function randomHex() {
	let hex = "", chars = "0123456789abcdef";
	for (let i = 0; i < 6; i++) {
		hex += chars[randomInt(0, chars.length - 1)];
	}
	return hex;
}
function randomInt(min = 1, max = 100) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
