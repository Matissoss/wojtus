// == HTML ==
const SZEPTUCH = document.getElementById("szeptuch");
const WYNIK = document.getElementById("wynik");
const WARNING = document.getElementById("warning");
const SHOP = document.getElementById("shop");
const IDLE_SHOP = document.getElementById("idle-shop");
const CLICK_SHOP = document.getElementById("click-shop");
const MULTIPLIER_SHOP = document.getElementById("multiplier-shop");
const INFO = document.getElementById("info");

// == GLOBALNE ZMIENNE ==
const TICKS_IN_SECOND = 10;
const BASE_CLICK_MULTIPLIER = 0.1;
const BASE_IDLE_MULTIPLIER = 0.01;

let wynik = 0;
let click_power = 1.0;
let idle_power = 0.0;
let idle_items = [
	0,
];

// == BACKEND ==
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
	return BASE_IDLE_MULTIPLIER + idle_power;
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

	let per_click = formatted_weight(click_power * BASE_CLICK_MULTIPLIER);
	let idle_per_second = formatted_weight(idle_income * idle_multiplier() * TICKS_IN_SECOND);
	INFO.innerHTML = `<i>(per click: ${per_click}, idle income: ${idle_per_second}/s, wskaźnik: x${(idle_multiplier() * 100.0).toFixed(2)})</i>`

}

function buy_idle(idx) {
	// później będzie czas na sprawdzanie ceny
	idle_items[idx]++;
	update_shops();
}
function buy_click(idx) {
	// później będzie czas na sprawdzanie ceny
	click_power += Math.pow(10, idx);
	update_shops();
}
function buy_idle_multiplier(idx) {
	// później będzie czas na sprawdzanie ceny
	idle_power += Math.pow(0.01, idx + 1) / 100;
	update_shops();
}

function reset_szeptuch_img() {
	SZEPTUCH.src = "assets/szeptuch.png";
}


// == SETUP ==
SZEPTUCH.onclick = function() {
	wynik += click_power * BASE_CLICK_MULTIPLIER;
	SZEPTUCH.src = "assets/szeptuch-jedzenie.png";
	setTimeout(reset_szeptuch_img, 300);
};

function update_shops() {
	// ustawiamy sklep z rzeczami dla idle
	for (let i = 0; i < IDLE_SHOP.children.length; i++) {
		// narazie oczekujemy tylko dodawania do idle (muszą zostać dodane dla click power + dla multiplierów)
		let card = IDLE_SHOP.children[i];
		let button = card.querySelector(".shop-buy");
		let desc = card.querySelector("p");
		switch (i) {
			case 0:
				let value = formatted_weight(1.0 * idle_multiplier() * TICKS_IN_SECOND);
				desc.innerHTML = `Koszt: ${null} | Efekt: idle income +${value} | Posiadane: ${idle_items[0]}`
				break;
		}
		button.onclick = function() {
			buy_idle(i)
		}
	}

	// ustawiamy sklep z rzeczami dla wzmacniania clicków
	for (let i = 0; i < CLICK_SHOP.children.length; i++) {
		let card = CLICK_SHOP.children[i];
		let button = card.querySelector(".shop-buy");
		let desc = card.querySelector("p");
		switch (i) {
			case 0:
				let w = formatted_weight(1.00 * BASE_CLICK_MULTIPLIER);
				desc.innerHTML = `Koszt: ${null} | Efekt: +${w} per click`;
				break;
		}
		button.onclick = function() {
			buy_click(i);
		}
	}

	// ustawiamy sklep z rzeczami dla wzmacniania idle rzeczy
	for (let i = 0; i < MULTIPLIER_SHOP.children.length; i++) {
		let card = MULTIPLIER_SHOP.children[i];
		let button = card.querySelector(".shop-buy");
		let desc = card.querySelector("p");
		switch (i) {
			case 0:
				let w = Math.pow(10, i);
				desc.innerHTML = `Koszt: ${null} | Efekt: +${w}% do wskaźnika`
				break;
		}
		button.onclick = function() {
			buy_idle_multiplier(i);
		}
	}
}

// ustawiamy sklep ogólnie (by dało się z nim prowadzić interakcje (pisałem ten komentarz 4 razy btw))
document.getElementById("shop-toggle").onclick = function() {
	if (shop.className == "hidden") {
		shop.className = "";
	} else {
		shop.className = "hidden";
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
