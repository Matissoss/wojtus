var WOJTEK = document.getElementById("szeptuch");
var STATS = document.getElementById("stats");
var WARNING = document.getElementById("warning");
var SHOP = document.getElementById("shop");
var REBIRTH_BUTTON = document.getElementById("rebirth");
function weight(w) {
    var i = 0;
    while (w >= 1000) {
        w /= 1000;
        i++;
    }
    var wt = w.toFixed(2);
    switch (i) {
        case 1:
            return "".concat(wt, "kg");
        case 2:
            return "".concat(wt, "t");
        case 3:
            return "".concat(wt, "kt");
        case 4:
            return "".concat(wt, "Mt");
        case 5:
            return "".concat(wt, "Gt");
        default:
        case 0:
            return "".concat(wt, "g");
    }
}
var ShopItemType;
(function (ShopItemType) {
    ShopItemType[ShopItemType["Click"] = 0] = "Click";
    ShopItemType[ShopItemType["Idle"] = 1] = "Idle";
    ShopItemType[ShopItemType["Multiplier"] = 2] = "Multiplier";
})(ShopItemType || (ShopItemType = {}));
var TICKS_PER_SECOND = 10;
var SHOP_ITEMS = [
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
        img: "assets/click0.png",
        effect: 10,
        count: 0,
    },
    {
        name: "Buty",
        desc: "W końcu nie musisz dostarczać wojtusiowi jedzenia boso niczym Cejrowski.",
        type: ShopItemType.Multiplier,
        base_price: 1000,
        img: "assets/multiplier0.png",
        effect: 0.1,
        count: 0,
    },
    {
        name: "Myszka",
        desc: "Nie mylić z myszką komputerową :D",
        type: ShopItemType.Idle,
        base_price: 250,
        img: "assets/idle1.png",
        effect: 12 / TICKS_PER_SECOND,
        count: 0,
    },
    {
        name: "Plecak",
        desc: "Dziwny wybór, ale przynajmniej pozwala przenoszenie większej ilości jedzenia.",
        type: ShopItemType.Click,
        base_price: 3000,
        img: "assets/click1.png",
        effect: 100,
        count: 0,
    }
];
var IDLE_ITEMS = [
    0, 3
];
var CLICK_ITEMS = [
    1, 4
];
var MULTIPLIER_ITEMS = [
    2
];
var gamestate = {
    rebirth_count: 0,
    wynik: 0,
    last_played: Date.now(),
    items: [],
};
var local_click_power = 1;
var local_idle_income = 0;
var local_multiplier = 1;
function setup_shop() {
    SHOP.innerHTML = "";
    var _loop_1 = function (i) {
        var card = document.createElement("div");
        card.className = "shop-card";
        card.id = "shop-card-".concat(i);
        var ccolumn = document.createElement("div");
        ccolumn.className = "shop-card-column";
        var img = document.createElement("img");
        if (SHOP_ITEMS[i].img != "") {
            img.src = SHOP_ITEMS[i].img;
        }
        else {
            img.src = "assets/favicon.jpg";
        }
        ccolumn.appendChild(img);
        var shop_card_text = document.createElement("div");
        shop_card_text.className = "shop-card-text";
        var h2 = document.createElement("h2");
        h2.innerHTML = SHOP_ITEMS[i].name;
        shop_card_text.appendChild(h2);
        var desc = document.createElement("i");
        desc.className = "shop-card-text-desc";
        desc.innerText = "\"".concat(SHOP_ITEMS[i].desc, "\"");
        shop_card_text.appendChild(desc);
        var effect = document.createElement("p");
        effect.className = "shop-card-text-effect";
        if (SHOP_ITEMS[i].type == ShopItemType.Click) {
            if (SHOP_ITEMS[i].count == 0) {
                effect.innerHTML = "<p>Efekt: +".concat(weight(SHOP_ITEMS[i].effect), " per click | Dost\u0119pne: 1</p>");
            }
            else {
                effect.innerHTML = "<p>Efekt: +".concat(weight(SHOP_ITEMS[i].effect), " per click | Dost\u0119pne: Wyprzedane</p>");
                card.className = "hidden";
            }
        }
        else if (SHOP_ITEMS[i].type == ShopItemType.Multiplier) {
            if (SHOP_ITEMS[i].count == 0) {
                effect.innerHTML = "<p>Efekt: +".concat(SHOP_ITEMS[i].effect, "% do wska\u017Anika | Dost\u0119pne: 1</p>");
            }
            else {
                effect.innerHTML = "<p>Efekt: +".concat(SHOP_ITEMS[i].effect, "% do wska\u017Anika | Dost\u0119pne: Wyprzedane</p>");
                card.className = "hidden";
            }
        }
        else {
            effect.innerHTML = "Efekt: +".concat(weight(SHOP_ITEMS[i].effect * TICKS_PER_SECOND), " na sekund\u0119 | Posiadane: ").concat(SHOP_ITEMS[i].count);
        }
        shop_card_text.appendChild(effect);
        ccolumn.appendChild(shop_card_text);
        var bbutton = document.createElement("button");
        bbutton.className = "shop-card-buy";
        bbutton.innerHTML = "1x<br>(".concat(weight(get_price(SHOP_ITEMS[i].base_price, SHOP_ITEMS[i].count)), ")");
        bbutton.onclick = function () {
            buy(i);
        };
        ccolumn.appendChild(bbutton);
        card.appendChild(ccolumn);
        SHOP.appendChild(card);
    };
    for (var i = 0; i < SHOP_ITEMS.length; i++) {
        _loop_1(i);
    }
}
function update_shop_part(idx) {
    var card = SHOP.querySelector("#shop-card-".concat(idx));
    var button = card.querySelector(".shop-card-buy");
    var effects = card.querySelector(".shop-card-text-effect");
    if (SHOP_ITEMS[idx].type == ShopItemType.Click) {
        if (SHOP_ITEMS[idx].count == 0) {
            effects.innerHTML = "Efekt: +".concat(weight(SHOP_ITEMS[idx].effect), " per click | Dost\u0119pne: Tak");
        }
        else {
            card.className = "hidden";
        }
    }
    else if (SHOP_ITEMS[idx].type == ShopItemType.Multiplier) {
        if (SHOP_ITEMS[idx].count == 0) {
            effects.innerHTML = "Efekt: +".concat(SHOP_ITEMS[idx].effect * 100, "% do wska\u017Anika | Dost\u0119pne: Tak");
        }
        else {
            card.className = "hidden";
        }
    }
    else {
        effects.innerHTML = "Efekt: +".concat(weight(SHOP_ITEMS[idx].effect * TICKS_PER_SECOND), " na sekund\u0119 | Posiadane: ").concat(SHOP_ITEMS[idx].count);
    }
    button.innerHTML = "1x<br>(".concat(weight(get_price(SHOP_ITEMS[idx].base_price, SHOP_ITEMS[idx].count)), ")");
}
function update_shop_full() {
    for (var i = 0; i < SHOP_ITEMS.length; i++) {
        update_shop_part(i);
    }
}
function get_price(base_price, item_count) {
    return Math.round(base_price * Math.pow(1.18, item_count) * Math.pow(item_count + 1, 0.5));
}
function throw_warning(msg) {
    if (WARNING != null) {
        WARNING.className = "";
        WARNING.innerHTML = msg;
    }
    else {
        alert("z jakiegoś powodu nie ma elementu o id #warning");
    }
}
function multiplier() {
    var toret = 1.00;
    for (var i = 0; i < MULTIPLIER_ITEMS.length; i++) {
        toret += SHOP_ITEMS[MULTIPLIER_ITEMS[i]].count * SHOP_ITEMS[MULTIPLIER_ITEMS[i]].effect;
    }
    return toret;
}
function get_idleincome() {
    var toret = 0;
    for (var i = 0; i < IDLE_ITEMS.length; i++) {
        toret += SHOP_ITEMS[IDLE_ITEMS[i]].count * SHOP_ITEMS[IDLE_ITEMS[i]].effect;
    }
    toret *= local_multiplier;
    return toret;
}
function get_idleincome_per_second() {
    return get_idleincome() / TICKS_PER_SECOND;
}
function get_clickincome() {
    var toret = 1;
    for (var i = 0; i < CLICK_ITEMS.length; i++) {
        toret += SHOP_ITEMS[CLICK_ITEMS[i]].count * SHOP_ITEMS[CLICK_ITEMS[i]].effect;
    }
    toret *= local_multiplier;
    return toret;
}
function buy(idx) {
    SHOP_ITEMS[idx] = buyitem(SHOP_ITEMS[idx]);
    update_shop_part(idx);
    update_expensive();
}
function buyitem(item) {
    var price = get_price(item.base_price, item.count);
    if (gamestate.wynik < price) {
        throw_warning("Nie sta\u0107 ci\u0119 na zakup wybranego przedmiotu! Brakuje ci ".concat(weight(Math.abs(gamestate.wynik - price))));
    }
    else if (item.count == 1 && (item.type == ShopItemType.Click || item.type == ShopItemType.Multiplier)) {
        throw_warning("Ten przedmiot już został zakupiony.");
    }
    else {
        gamestate.wynik -= price;
        item.count++;
    }
    return item;
}
function update_expensive() {
    local_multiplier = multiplier();
    local_click_power = get_clickincome();
    local_idle_income = get_idleincome();
    if (STATS != null) {
        STATS.querySelector("#stat-perclick").innerHTML = "".concat(weight(local_click_power), "<br>na klikni\u0119cie");
        STATS.querySelector("#stat-idleincome").innerHTML = "".concat(weight(local_idle_income * TICKS_PER_SECOND), "<br>na sekund\u0119");
        STATS.querySelector("#stat-multiplier").innerHTML = "".concat(Math.round(local_multiplier * 100.0), "%");
    }
    else {
        alert("element o id #stats nie istnieje, a musi");
        return;
    }
}
function update_weight() {
    if (STATS != null) {
        STATS.querySelector("#stat-wynik").innerHTML = weight(gamestate.wynik);
    }
    else {
        alert("element o id #stats nie istnieje, a musi");
        return;
    }
}
function tick() {
    gamestate.wynik += local_idle_income;
    update_weight();
}
update_expensive();
setup_shop();
setInterval(tick, 1000 / TICKS_PER_SECOND);
WOJTEK.onclick = function () {
    gamestate.wynik += local_click_power;
    WOJTEK.src = "assets/szeptuch-jedzenie.png";
    setTimeout(function () {
        WOJTEK.src = "assets/szeptuch.png";
    }, 300);
};
var button = document.querySelector("#shop-toggle");
button.onclick = function () {
    if (SHOP.className == "") {
        SHOP.className = "hidden";
    }
    else {
        SHOP.className = "";
    }
};
WARNING.onclick = function () {
    if (WARNING.className == "") {
        WARNING.className = "hidden";
    }
};
