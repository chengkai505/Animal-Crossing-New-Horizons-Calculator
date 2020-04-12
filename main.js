﻿let xhr = new XMLHttpRequest();
xhr.addEventListener("load", function(){
	let data = JSON.parse(this.responseText);
	let index = {};
	let label = data["type"];
	let modifier = 1;
	/* Event settings */
	let rowUpdate = new Event("change");
	/* Make index */
	label.forEach(function(l){
		data[l].forEach(function(d, i){
			index[d["名稱"]] = {};
			index[d["名稱"]]["type"] = l;
			index[d["名稱"]]["index"] = i;
		});
	});
	/* Selling destination */
	document.getElementById("sell-destination").addEventListener("change", function(){
		let opt = document.getElementById("sell-destination").getElementsByTagName("input");
		for (let i = 0; i < opt.length; i++) {
			if (opt[i].checked) {
				modifier = opt[i].value;
				break;
			}
		}
		let rows = document.getElementById("list-body").getElementsByClassName("row");
		let sum = 0;
		for (let i = 0; i < rows.length; i++) {
			let type = rows[i].getElementsByClassName("type")[0];
			let item = rows[i].getElementsByClassName("item")[0];
			let price = rows[i].getElementsByClassName("price")[0];
			let quantity = rows[i].getElementsByClassName("quantity")[0];
			let subtotal = rows[i].getElementsByClassName("subtotal")[0];
			if (type.value == "NULL") {
				continue;
			}
			price.innerText = data[index[item.value]["type"]][index[item.value]["index"]]["售價"] * modifier;
			subtotal.innerText = parseInt(quantity.value != "" ? quantity.value : 0) * data[index[item.value]["type"]][index[item.value]["index"]]["售價"] * modifier;
			sum += parseInt(subtotal.innerText);
		}
		document.getElementById("total-number").innerText = sum;
	});
	/* Search */
	document.getElementById("search-bar").addEventListener("change", function(){
		let keyword = this.value;
		document.getElementById("result-list").innerHTML = "";
		if (keyword != "") {
			let fragment = document.createDocumentFragment();
			label.forEach(function(l){
				data[l].forEach(function(obj){
					if (obj["名稱"].includes(keyword)) {
						let li = document.createElement("li");
						li.classList.add("result-item");
						li.innerText = obj["名稱"];
						fragment.appendChild(li);
					}
				});
			});
			if (fragment.children.length == 0) {
				let empty = document.createElement("li");
				empty.innerText = "找不到結果";
				fragment.appendChild(empty);
			}
			document.getElementById("result-list").appendChild(fragment);
		}
	});
	document.getElementById("result-list").addEventListener("click", function(e){
		if (e.target.classList.contains("result-item")) {
			let target = e.target.innerText;
			let div = createRow(data);
			let item = div.getElementsByClassName("item")[0];
			let price = div.getElementsByClassName("price")[0];
			let quantity = div.getElementsByClassName("quantity")[0];
			let subtotal = div.getElementsByClassName("subtotal")[0];
			item.disabled = false;
			for (let i = 0; i < div.getElementsByClassName("type")[0].children.length; i++) {
				if (div.getElementsByClassName("type")[0].children[i].innerText == index[target]["type"]) {
					div.getElementsByClassName("type")[0].children[i].selected = true;
				}
			}
			data[index[target]["type"]].forEach(function(obj){
				let opt = document.createElement("option");
				opt.value = obj["名稱"];
				opt.innerText = obj["名稱"];
				if (obj["名稱"] == target) {
					opt.selected = true;
					price.innerText = obj["售價"] * modifier;
				}
				item.appendChild(opt);
			});
			document.getElementById("list-body").appendChild(div);
		}
	});
	/* List */
	document.getElementById("list-body").addEventListener("change", function(e){
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
			price.innerText = "0";
			subtotal.innerText = "0";
			if (e.target.value != "NULL") {
				data[e.target.value].forEach(function(obj){
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
			price.innerText = "0";
			subtotal.innerText = "0";
			if (e.target.value != "NULL") {
				data[type.value].forEach(function(obj){
					if (e.target.value == obj["名稱"]) {
						price.innerText = obj["售價"] * modifier;
						return;
					}
				});
			}
			break;
		}
		if (quantity.value != "") {
			subtotal.innerText = parseInt(price.innerText) * quantity.value;
		}
		totalUpdate();
	});
	document.getElementById("list-body").addEventListener("click", function(e){
		if (e.target.classList.contains("remove")) {
			e.target.parentElement.remove();
			totalUpdate();
		}
	});
	document.getElementById("add-new-row").addEventListener("click", function(e){
		document.getElementById("list-body").appendChild(createRow(data));
	});
});
xhr.open("GET","data.json");
xhr.send();

function createRow(data) {
	let label = ["請選擇"].concat(data["type"]);
	let div = document.createElement("div");
	let type = document.createElement("select");
	let item = document.createElement("select");
	let price = document.createElement("span");
	let quantity = document.createElement("input");
	let subtotal = document.createElement("span");
	let remove = document.createElement("button");
	let defaultOpt = document.createElement("option");
	div.classList.add("row");
	type.classList.add("type");
	item.classList.add("item");
	price.classList.add("price");
	quantity.classList.add("quantity");
	subtotal.classList.add("subtotal");
	remove.classList.add("remove");
	quantity.type = "number";
	item.disabled = true;
	price.innerText = "0";
	subtotal.innerText = "0";
	remove.innerHTML = "<span class='fas fa-times'></span>";
	defaultOpt.value = "NULL";
	defaultOpt.innerText = "請選擇";
	item.appendChild(defaultOpt);
	label.forEach(function(l){
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
		sum += parseInt(rows[i].getElementsByClassName("subtotal")[0].innerText);
	}
	document.getElementById("total-number").innerText = sum;
}