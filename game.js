// == HTML ==
const SZEPTUCH = document.getElementById("szeptuch");
const WYNIK = document.getElementById("wynik");
const WARNING = document.getElementById("warning");
const SHOP = document.getElementById("shop");
const REBIRTH_SHOP = document.getElementById("rebirth");
const INFO = document.getElementById("info");

// == GLOBALNE ZMIENNE ==
const TICKS_IN_SECOND = 10;
const BASE_CLICK_MULTIPLIER = 0.1;
const BASE_IDLE_MULTIPLIER = 0.01;

let rebirth_count = 0;
let wynik = 0;
let click_power = 1.0;
let multiplier = 0.0;

let multiplier_items = [
	0
];

let click_items = [
	0
];

let idle_items = [
	0,
];

// == BACKEND ==
// wzór:
// C(n) = C(0) * r ^ item_count * (item_count + 1) ^ 0,5
function calculate_price(base_price, item_idx, item_count) {
	return base_price * Math.pow(1.18, item_count) * Math.pow(item_count + 1, 0,5);
}

function throw_warning(html) {
	WARNING.innerHTML = html;
	WARNING.className = "";
}

function formatted_weight(grams) {
	let i = 0;
	while (grams > 1000) {
		i++;
		grams /= 1000;
	}
	grams = Number.parseFloat(grams).toFixed(3);
	switch (i) {
		case 0:
			return `${grams}ng`;
		case 1:
			return `${grams}g`;
		case 2:
			return `${grams}kg`;
		case 3:
			return `${grams}t`;
		case 4:
			return `${grams}kt`;
		case 5:
			return `${grams}Mt`;
	}
}

function idle_multiplier() {
	return BASE_IDLE_MULTIPLIER + multiplier;
}

function update() {
	// Backend update
	let idle_income = 1.0;
	for (let i = 0; i < idle_items.length; i++) {
		idle_income = idle_items[i] * Math.pow(10, i);
	}
	wynik += idle_income * idle_multiplier();
	let wynik_display = formatted_weight(wynik);
	
	// Update UI
	WYNIK.innerHTML = `Waga: ${wynik_display}`;

	let per_click = formatted_weight(click_power * (BASE_CLICK_MULTIPLIER + multiplier));
	let idle_per_second = formatted_weight(idle_income * idle_multiplier() * TICKS_IN_SECOND);
	INFO.innerHTML = `<i>(per click: ${per_click}, idle income: ${idle_per_second}/s, wskaźnik: x${(idle_multiplier() * 100.0).toFixed(2)})</i>`

}

function buy_idle(idx) {
	// później będzie czas na sprawdzanie ceny
	let price = calculate_price(Math.pow(10, idx), idx, idle_items[idx]);
	if (Math.abs(wynik - price) <= 0) {
		console.log(wynik, price);
		throw_warning(`Nie stać cię na zakup! Brakuje ci ${formatted_weight(price - wynik)}`);
	} else {
		wynik -= price;
		wynik = Math.abs(wynik);
		idle_items[idx]++;
		update_shops();
	}
}
function buy_click(idx) {
	let price = calculate_price(Math.pow(18, idx), idx, click_items[idx]);
	if (Math.abs(wynik - price) <= 0) {
		console.log(wynik, price);
		throw_warning(`Nie stać cię na zakup! Brakuje ci ${formatted_weight(price - wynik)}`);
	} else {
		wynik -= price;
		wynik = Math.abs(wynik);
		click_items[idx]++;
		click_power += Math.pow(10, idx);
		update_shops();
	}
}
function buy_multiplier(idx) {
	console.log(idx);
	let price = calculate_price(Math.pow(14, idx), idx, multiplier_items[idx]);
	if (Math.abs(wynik - price) <= 0) {
		throw_warning(`Nie stać cię na zakup! Brakuje ci ${formatted_weight(price - wynik)}`);
	} else {
		wynik -= price;
		wynik = Math.abs(wynik);
		multiplier_items[idx]++;
		multiplier += Math.pow(0.01, idx + 1) / 100;
		update_shops();
	}
}

// == SETUP ==
SZEPTUCH.onclick = function() {
	wynik += click_power * (BASE_CLICK_MULTIPLIER + multiplier);
	SZEPTUCH.src = "assets/szeptuch-jedzenie.png";
	setTimeout(function() {
		SZEPTUCH.src = "assets/szeptuch.png";
	}, 300);
};

function update_shops() {
	let cardtype_idx_count = [0, 0, 0];
	// ustawiamy sklep z rzeczami dla idle
	for (let i = 1; i < SHOP.children.length; i++) {
		let card = SHOP.children[i];
		let button = card.querySelector(".shop-buy");
		let desc = card.querySelector("p");
		let cardtype = card.getAttribute("cardtype");
		if (cardtype === "idle") {
			let cost = formatted_weight(calculate_price(Math.pow(10, cardtype_idx_count[0]), cardtype_idx_count[0], idle_items[cardtype_idx_count[0]]));
			switch (cardtype_idx_count[0]) {
				case 0:
					let value = formatted_weight(1.0 * idle_multiplier() * TICKS_IN_SECOND);
					desc.innerHTML = `Koszt: ${cost} | Efekt: idle income +${value} | Posiadane: ${idle_items[0]}`
					break;
			}
			button.onclick = function() {
				buy_idle(cardtype_idx_count[0] - 1);
			}
			cardtype_idx_count[0]++;
		} else if (cardtype === "multiplier") {
			let cost = formatted_weight(calculate_price(Math.pow(14, cardtype_idx_count[1]), cardtype_idx_count[1], multiplier_items[cardtype_idx_count[1]]));
			switch (cardtype_idx_count[1]) {
				case 0:
					let w = Math.pow(10, cardtype_idx_count[1]);
					desc.innerHTML = `Koszt: ${cost} | Efekt: +${w}% do wskaźnika | Kupiono: ${multiplier_items[0]} razy`
					break;
			}
			button.onclick = function() {
				buy_multiplier(cardtype_idx_count[1] - 1);
			}
			cardtype_idx_count[1]++;
		} else if (cardtype === "click") {
			let cost = formatted_weight(calculate_price(Math.pow(18, cardtype_idx_count[2]), cardtype_idx_count[2], click_items[cardtype_idx_count[2]]));
			switch (cardtype_idx_count[2]) {
				case 0:
					let w = formatted_weight(1.00 * BASE_CLICK_MULTIPLIER);
					desc.innerHTML = `Koszt: ${cost} | Efekt: +${w} per click | Kupiono: ${click_items[0]} razy`;
					break;
			}
			button.onclick = function() {
				buy_click(cardtype_idx_count[2] - 1);
			}
			cardtype_idx_count[2]++;
		}
	}
}

// ustawiamy sklep ogólnie (by dało się z nim prowadzić interakcje (pisałem ten komentarz 4 razy btw))
document.getElementById("rebirth-toggle").onclick = function() {
	if (REBIRTH_SHOP.className == "hidden") {
		REBIRTH_SHOP.className = "";
		REBIRTH_SHOP.querySelector("p").innerHTML = `Narazie tu nic nie ma (ale coś zrobię, pozdro :D)`;
		shop.className = "hidden";
	} else {
		REBIRTH_SHOP.className = "hidden";
	}
}
document.getElementById("shop-toggle").onclick = function() {
	if (SHOP.className == "hidden") {
		SHOP.className = "";
		REBIRTH_SHOP.className = "hidden";
	} else {
		SHOP.className = "hidden";
	}
}

// == START ==
// każdy "tick" ma 100ms aka 0.1s
update_shops();
setInterval(update, 1000 / TICKS_IN_SECOND);

document.body.onmousedown = function() {
	if (WARNING.className != "hidden") {
		WARNING.className = "hidden";
	}
}
