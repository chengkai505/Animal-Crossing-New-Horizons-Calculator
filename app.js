let xhr = new XMLHttpRequest();
let data;
let index = {};
let label;
let modifier = 1;
let doublePrice = "";
xhr.addEventListener("load", function () {
    data = JSON.parse(this.responseText);
    label = data["type"];
/* Make index */
    label.forEach(function (l) {
        data[l].forEach(function (d, i) {
            index[d["名稱"]] = {};
            index[d["名稱"]]["type"] = l;
            index[d["名稱"]]["index"] = i;
        });
    });
/* Selling destination */
    document.getElementById("sell-destination").addEventListener("change", function () {
        let opt = document.getElementById("sell-destination").getElementsByTagName("input");
        for (let i = 0; i < opt.length; i++) {
            if (opt[i].checked) {
                modifier = opt[i].value;
                notice("normal", "以「" + opt[i].nextElementSibling.innerText + "」方式計價");
                break;
            }
        }
        priceUpdate();
    });
/* Nook high price settings */
    document.getElementById("high-price-search-bar").addEventListener("input change", function () {
        let keyword = this.value;
        document.getElementById("high-price-result-list").innerHTML = "";
        if (keyword != "") {
            let fragment = document.createDocumentFragment();
            label.forEach(function (l) {
                data[l].forEach(function (obj) {
                    if (obj["名稱"].includes(keyword)) {
                        let li = document.createElement("li");
                        li.classList.add("high-price-result-item");
                        li.innerText = obj["名稱"];
                        if (doublePrice == obj["名稱"]) {
                            li.classList.add("selected");
                        }
                        fragment.appendChild(li);
                    }
                });
            });
            if (fragment.children.length == 0) {
                let li = document.createElement("li");
                li.innerText = "找不到結果";
                fragment.appendChild(li);
            }
            document.getElementById("high-price-result-list").appendChild(fragment);
        }
    });
    document.getElementById("high-price-result-list").addEventListener("click", function (e) {
        if (e.target.classList.contains("high-price-result-item")) {
            let selected = e.target.parentElement.getElementsByClassName("selected");
            if (selected.length > 0) {
                for (let i = 0; i < selected.length; i++) {
                    selected[i].classList.remove("selected");
                }
            }
            e.target.classList.add("selected");
            notice("successful", "成功指定「" + e.target.innerText + "」為商店高價收購品");
            doublePrice = e.target.innerText;
            priceUpdate();
        }
    });
/* Search */
    document.getElementById("search-bar").addEventListener("input change", function () {
        let keyword = this.value;
        document.getElementById("result-list").innerHTML = "";
        if (keyword != "") {
            let fragment = document.createDocumentFragment();
            label.forEach(function (l) {
                data[l].forEach(function (obj) {
                    if (obj["名稱"].includes(keyword)) {
                        let li = document.createElement("li");
                        li.classList.add("result-item");
                        li.innerText = obj["名稱"];
                        fragment.appendChild(li);
                    }
                });
            });
            if (fragment.children.length == 0) {
                let li = document.createElement("li");
                li.innerText = "找不到結果";
                fragment.appendChild(li);
            }
            document.getElementById("result-list").appendChild(fragment);
        }
    });
    document.getElementById("result-list").addEventListener("click", function (e) {
        if (e.target.classList.contains("result-item")) {
            let target = e.target.innerText;
            let div = createRow();
            let type = div.getElementsByClassName("type")[0];
            let item = div.getElementsByClassName("item")[0];
            let price = div.getElementsByClassName("price")[0];
            let quantity = div.getElementsByClassName("quantity")[0];
            item.disabled = false;
            for (let i = 0; i < type.children.length; i++) {
                if (type.children[i].innerText == index[target]["type"]) {
                    type.children[i].selected = true;
                }
            }
            data[index[target]["type"]].forEach(function (obj) {
                let option = document.createElement("option");
                option.value = obj["名稱"];
                option.innerText = obj["名稱"];
                if (obj["名稱"] == target) {
                    option.selected = true;
                    price.readOnly = target == "大頭菜" ? false : true;
                    price.value = target == "大頭菜" ? "" : Math.floor(obj["價格"] * (doublePrice == target ? 2 : modifier));
                    quantity.placeholder = target == "大頭菜" ? "單位：顆" : "";
                }
                item.appendChild(option);
            });
            document.getElementById("list-body").appendChild(div);
            notice("successful", "成功新增「" + target + "」");
        }
    });
/* List */
    document.getElementById("list-body").addEventListener("change", function (e) {
        let parent = e.target.parentElement;
        let type = parent.getElementsByClassName("type")[0];
        let item = parent.getElementsByClassName("item")[0];
        let price = parent.getElementsByClassName("price")[0];
        let quantity = parent.getElementsByClassName("quantity")[0];
        let subtotal = parent.getElementsByClassName("subtotal")[0];
        let fragment = document.createDocumentFragment();
        switch (e.target.getAttribute("class")) {
        case "type":
            item.innerHTML = "<option value='NULL'>請選擇</option>";
            price.value = "0";
            subtotal.value = "0";
            if (e.target.value != "NULL") {
                data[e.target.value].forEach(function (obj) {
                    let option = document.createElement("option");
                    option.value = obj["名稱"];
                    option.innerText = obj["名稱"];
                    fragment.appendChild(option);
                });
                item.appendChild(fragment);
                item.disabled = false;
            }
            else {
                item.disabled = true;
            }
            break;
        case "item":
            price.value = "0";
            subtotal.innerText = "0";
            if (e.target.value != "NULL") {
                price.readOnly = e.target.value == "大頭菜" ? false : true;
                price.value = e.target.value == "大頭菜" ? "" : Math.floor(data[index[e.target.value]["type"]][index[e.target.value]["index"]]["價格"] * (doublePrice == e.target.value ? 2 : modifier));
                quantity.placeholder = e.target.value == "大頭菜" ? "單位：顆" : "";
            }
            break;
        }
        if (quantity.value != "") {
            subtotal.value = price.value * quantity.value;
        }
        totalUpdate();
    });
/* Button Event */
    document.getElementById("list-body").addEventListener("click", function (e) {
        if (e.target.classList.contains("remove")) {
            let name = e.target.parentElement.getElementsByClassName("item")[0].value;
            e.target.parentElement.remove();
            totalUpdate();
            notice("successful", "成功刪除「" + (name != "NULL" ? name : "請選擇") + "」");
        }
    });
    document.getElementById("add-new-row").addEventListener("click", function () {
        document.getElementById("list-body").appendChild(createRow());
        notice("successful", "成功新增一欄");
    });
    document.getElementById("clear-row").addEventListener("click", function () {
        let list = document.getElementById("list-body");
        if (list.innerHTML == "") {
            notice("normal", "清單已空");
        }
        else {
            document.getElementById("list-body").innerHTML = "";
            totalUpdate();
            notice("successful", "成功清空清單");
        }
    });
});
xhr.open("GET", "data.json");
xhr.send();

function createRow() {
    let optText = ["請選擇"].concat(data["type"]);
    let div = document.createElement("div");
    let type = document.createElement("select");
    let item = document.createElement("select");
    let price = document.createElement("input");
    let quantity = document.createElement("input");
    let subtotal = document.createElement("input");
    let remove = document.createElement("button");
    let defaultOpt = document.createElement("option");
    div.classList.add("row");
    type.classList.add("type");
    item.classList.add("item");
    price.classList.add("price");
    quantity.classList.add("quantity");
    subtotal.classList.add("subtotal");
    remove.classList.add("remove");
    remove.classList.add("button");
    remove.classList.add("warn");
    item.disabled = true;
    price.value = "0";
    price.readOnly = true;
    price.type = "number";
    price.placeholder = "請輸入價格";
    quantity.type = "number";
    subtotal.type = "number";
    subtotal.value = "0";
    subtotal.readOnly = true;
    remove.innerHTML = "<span class='fas fa-times'></span>";
    defaultOpt.value = "NULL";
    defaultOpt.innerText = "請選擇";
    item.appendChild(defaultOpt);
    optText.forEach(function (l) {
        let option = document.createElement("option");
        option.value = l == "請選擇" ? "NULL" : l;
        option.innerText = l;
        type.appendChild(option);
    });
    let tag = ["種類", "名稱", "單價", "數量", "小計", "刪除"], order = [type, item, price, quantity, subtotal, remove];
    for (let i = 0; i < tag.length; i++) {
        let temp = document.createElement("span");
        temp.classList.add("tag");
        temp.innerText = tag[i];
        div.appendChild(temp);
        div.appendChild(order[i]);
    }
    return div;
}
function totalUpdate() {
    let sum = 0;
    let rows = document.getElementById("list-body").getElementsByClassName("row");
    for (let i = 0; i < rows.length; i++) {
        sum += parseInt(rows[i].getElementsByClassName("subtotal")[0].value);
    }
    document.getElementById("total-number").innerText = sum;
}
function notice(cls, content) {
    let notice = document.getElementById("notice");
    let row = document.createElement("div");
    let label = document.createElement("span");
    row.classList.add(cls);
    row.classList.add("row");
    row.classList.add("show");
    label.classList.add("label");
    label.innerText = content;
    row.appendChild(label);
    notice.appendChild(row);
    setTimeout(function () {
        row.remove();
    }, 10000, false);
}
function priceUpdate() {
    let rows = document.getElementById("list-body").getElementsByClassName("row");
    for (let i = 0; i < rows.length; i++) {
        let type = rows[i].getElementsByClassName("type")[0];
        let item = rows[i].getElementsByClassName("item")[0];
        let price = rows[i].getElementsByClassName("price")[0];
        let quantity = rows[i].getElementsByClassName("quantity")[0];
        let subtotal = rows[i].getElementsByClassName("subtotal")[0];
        if (type.value == "NULL" || item.value == "大頭菜") {
            continue;
        }
        price.value = Math.floor(data[type.value][index[item.value]["index"]]["價格"] * (modifier == 1 && doublePrice == item.value ? 2 : modifier));
        subtotal.value = parseInt(quantity.value != "" ? quantity.value : 0) * price.value;
        totalUpdate();
    }
}