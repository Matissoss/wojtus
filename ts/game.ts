// == HTML ELEMENTS ==
const WOJTEK: any = document.getElementById("szeptuch");
const STATS: any = document.getElementById("stats");
const WARNING: any = document.getElementById("warning");

const SHOP: any = document.getElementById("shop");
const REBIRTH_BUTTON: any = document.getElementById("rebirth"); // for now

// == FORMATTING FUNCTIONS ==
function weight(w: number): string {
	let i = 0;
	while (w >= 1000) {
		w /= 1000;
		i++;
	}
	let wt = w.toFixed(2);
	switch (i) {
		case 1:
			return `${wt}kg`;
		case 2:
			return `${wt}t`;
		case 3:
			return `${wt}kt`;
		case 4:
			return `${wt}Mt`;
		case 5:
			return `${wt}Gt`;
		default:
		case 0:
			return `${wt}g`;
	}
}

// == TYPES ==
type GameState = {
	rebirth_count: number,
	wynik: number,
	last_played: number,
	items: ShopItemSaved[],
};

enum ShopItemType {
	Click,
	Idle,
	Multiplier,
}

type ShopItemSaved = {
	idx: number,
	type: ShopItemType,
	count: number,
}

type ShopItem = {
	name: string,
	desc: string,
	// if type == Click:
	// 	click_power += effect;
	// else if type == Idle:
	// 	idle_income += effect; 
// else if type == Multiplier:
	// 	multiplier += effect / 100;
	effect: number,
	img: string,
	type: ShopItemType,
	base_price: number,
	count: number,
};

// == CONFIG ==
const TICKS_PER_SECOND = 10;

const SHOP_ITEMS: ShopItem[] = [
	{
		name: "Mrówka",
		desc: "Mrówka to najmniejsza i najtańsza rzecz jaką możemy nakarmić wojtusia. Nie jest ona odżywcza, ale lepsze to niż nic.",
		type: ShopItemType.Idle,
		base_price: 12,
		img: "assets/idle0.png",
		effect: 1 / TICKS_PER_SECOND,
		count: 0,
	},
	{
		name: "Talerz",
		desc: "Może i mały, ale przynajmniej nie musisz używać do tego swych dłoni.",
		type: ShopItemType.Click,
		base_price: 100,
		img: "",
		effect: 10,
		count: 0,
	},
	{
		name: "Buty",
		desc: "W końcu nie musisz dostarczać wojtusiowi jedzenia boso niczym Cejrowski.",
		type: ShopItemType.Multiplier,
		base_price: 1000,
		img: "",
		effect: 0.1,
		count: 0,
	}
];

const IDLE_ITEMS: number[] = [
	0,
];
const CLICK_ITEMS: number[] = [
	1,
];
const MULTIPLIER_ITEMS: number[] = [
	2
];

// == GLOBALNE ZMIENNE ==
let gamestate: GameState = {
	rebirth_count: 0,
	wynik: 0,
	last_played: Date.now(),
	items: [],
};
let local_click_power = 1;
let local_idle_income = 0;
let local_multiplier = 1;

// == FUNKCJE ==
function setup_shop() {
	SHOP.innerHTML = "";
	for (let i = 0; i < SHOP_ITEMS.length; i++) {
		let card = document.createElement("div");
		card.className = "shop-card";
		card.id = `shop-card-${i}`;
			let ccolumn = document.createElement("div");
			ccolumn.className = "shop-card-column";
				let img = document.createElement("img");
				if (SHOP_ITEMS[i].img != "") {
					img.src = SHOP_ITEMS[i].img;
				} else {
					img.src = "assets/favicon.jpg";
				}
				ccolumn.appendChild(img);
				let shop_card_text = document.createElement("div");
				shop_card_text.className = "shop-card-text";
					let h2 = document.createElement("h2");
					h2.innerHTML = SHOP_ITEMS[i].name;
					shop_card_text.appendChild(h2);
					
					let desc = document.createElement("i");
					desc.className = "shop-card-text-desc";
					desc.innerText = `"${SHOP_ITEMS[i].desc}"`;
					shop_card_text.appendChild(desc);
					
					let effect = document.createElement("p");
					effect.className = "shop-card-text-effect";
					if (SHOP_ITEMS[i].type == ShopItemType.Click) {
						if (SHOP_ITEMS[i].count == 0) {
							effect.innerHTML = `<p>Efekt: +${weight(SHOP_ITEMS[i].effect)} per click | Dostępne: 1</p>`;
						} else {
							effect.innerHTML = `<p>Efekt: +${weight(SHOP_ITEMS[i].effect)} per click | Dostępne: Wyprzedane</p>`;
							card.className = "hidden";
						}
					} else if (SHOP_ITEMS[i].type == ShopItemType.Multiplier) {
						if (SHOP_ITEMS[i].count == 0) {
							effect.innerHTML = `<p>Efekt: +${SHOP_ITEMS[i].effect}% do wskaźnika | Dostępne: 1</p>`;
						} else {
							effect.innerHTML = `<p>Efekt: +${SHOP_ITEMS[i].effect}% do wskaźnika | Dostępne: Wyprzedane</p>`;
							card.className = "hidden";
						}
					} else {
						effect.innerHTML = `Efekt: +${weight(SHOP_ITEMS[i].effect * TICKS_PER_SECOND)} na sekundę | Posiadane: ${SHOP_ITEMS[i].count}`;
					}
					shop_card_text.appendChild(effect);

				ccolumn.appendChild(shop_card_text);
					let bbutton = document.createElement("button");
					bbutton.className = "shop-card-buy";
					
					bbutton.innerHTML = `1x<br>(${weight(get_price(SHOP_ITEMS[i].base_price, SHOP_ITEMS[i].count))})`;
					bbutton.onclick = function() {
						buy(i);
					}
				ccolumn.appendChild(bbutton);
		card.appendChild(ccolumn);
		SHOP.appendChild(card);
	}
}
function update_shop_part(idx: number) {
	let card = SHOP.querySelector(`#shop-card-${idx}`);
	let button = card.querySelector(".shop-card-buy");
	let effects = card.querySelector(".shop-card-text-effect");
	if (SHOP_ITEMS[idx].type == ShopItemType.Click) {
		if (SHOP_ITEMS[idx].count == 0) {
			effects.innerHTML = `Efekt: +${weight(SHOP_ITEMS[idx].effect)} per click | Dostępne: Tak`;
		} else {
			card.className = "hidden";
		}
	} else if (SHOP_ITEMS[idx].type == ShopItemType.Multiplier) {
		if (SHOP_ITEMS[idx].count == 0) {
			effects.innerHTML = `Efekt: +${SHOP_ITEMS[idx].effect * 100}% do wskaźnika | Dostępne: Tak`;
		} else {
			card.className = "hidden";
		}
	} else {
		effects.innerHTML = `Efekt: +${weight(SHOP_ITEMS[idx].effect * TICKS_PER_SECOND)} na sekundę | Posiadane: ${SHOP_ITEMS[idx].count}`;
	}
	button.innerHTML = `1x<br>(${weight(get_price(SHOP_ITEMS[idx].base_price, SHOP_ITEMS[idx].count))})`;
}
function update_shop_full() {
	for (let i = 0; i < SHOP_ITEMS.length; i++) {
		update_shop_part(i);
	}
}
function get_price(base_price: number, item_count: number): number {
	return Math.round(base_price * Math.pow(1.18, item_count) * Math.pow(item_count + 1, 0.5));
}
function throw_warning(msg: string) {
	if (WARNING != null) {
		WARNING.className = "";
		WARNING.innerHTML = msg;
	} else {
		alert("z jakiegoś powodu nie ma elementu o id #warning")
	}
}

function multiplier(): number {
	let toret: number = 1.00;
	for (let i = 0; i < MULTIPLIER_ITEMS.length; i++) {
		toret += SHOP_ITEMS[MULTIPLIER_ITEMS[i]].count * SHOP_ITEMS[MULTIPLIER_ITEMS[i]].effect;
	}
	return toret;
}

function get_idleincome(): number {
	let toret: number = 0;
	for (let i = 0; i < IDLE_ITEMS.length; i++) {
		toret += SHOP_ITEMS[IDLE_ITEMS[i]].count * SHOP_ITEMS[IDLE_ITEMS[i]].effect;
	}
	toret *= local_multiplier;
	return toret;
}
function get_idleincome_per_second(): number {
	return get_idleincome() / TICKS_PER_SECOND;
}
function get_clickincome(): number {
	let toret: number = 1;
	for (let i = 0; i < CLICK_ITEMS.length; i++) {
		toret += SHOP_ITEMS[CLICK_ITEMS[i]].count * SHOP_ITEMS[CLICK_ITEMS[i]].effect;
	}
	toret *= local_multiplier;
	return toret;
}
function buy(idx: number) {
	SHOP_ITEMS[idx] = buyitem(SHOP_ITEMS[idx]);
	update_shop_part(idx);
	update_expensive();
}
function buyitem(item: ShopItem): ShopItem {
	let price = get_price(item.base_price, item.count);
	if (gamestate.wynik < price) {
		throw_warning(`Nie stać cię na zakup wybranego przedmiotu! Brakuje ci ${weight(Math.abs(gamestate.wynik - price))}`);
	} else if (item.count == 1 && (item.type == ShopItemType.Click || item.type == ShopItemType.Multiplier)) {
		throw_warning("Ten przedmiot już został zakupiony.");
	} else {
		gamestate.wynik -= price;
		item.count++;
	}
	return item;
}

// other stats that require get_clickincome and/or get_idleincome, which is expensive
// to compute every tick
function update_expensive() {
	local_multiplier = multiplier();
	local_click_power = get_clickincome();
	local_idle_income = get_idleincome();
	if (STATS != null) {
		STATS.querySelector("#stat-perclick").innerHTML = `${weight(local_click_power)}<br>na kliknięcie`;
		STATS.querySelector("#stat-idleincome").innerHTML = `${weight(local_idle_income * TICKS_PER_SECOND)}<br>na sekundę`;
		STATS.querySelector("#stat-multiplier").innerHTML = `${Math.round(local_multiplier * 100.0)}%`;
	} else {
		alert ("element o id #stats nie istnieje, a musi");
		return;
	}
}

function update_weight() {
	if (STATS != null) {
		STATS.querySelector("#stat-wynik").innerHTML = weight(gamestate.wynik);
	} else {
		alert ("element o id #stats nie istnieje, a musi");
		return;
	}
}

function tick() {
	gamestate.wynik += local_idle_income;
	update_weight();
}

// == START ==
update_expensive();
setup_shop();
setInterval(tick, 1000 / TICKS_PER_SECOND);
WOJTEK.onclick = function() {
	gamestate.wynik += local_click_power;
	WOJTEK.src = "assets/szeptuch-jedzenie.png";
	setTimeout(function() {
		WOJTEK.src = "assets/szeptuch.png";
	}, 300)
}
let button: any = document.querySelector("#shop-toggle");
button.onclick = function() {
	if (SHOP.className == "") {
		SHOP.className = "hidden";
	} else {
		SHOP.className = "";
	}
}
