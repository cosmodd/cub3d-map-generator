const	nodes = {
	map: document.querySelector("#map"),
	buttons: {
		copy: document.querySelector("#copy"),
	}
}

let	values = {
	width: {
		nodes: {
			slider: document.querySelector("input#width"),
			value: document.querySelector(".range.width .value")
		},
		value: document.querySelector("input#width").value
	},
	height: {
		nodes: {
			slider: document.querySelector("input#height"),
			value: document.querySelector(".range.height .value")
		},
		value: document.querySelector("input#height").value
	}
}

let	map = [];

function	getArray(length, f)
{
	let out = [];
	for (let i = 0; i < length; i++)
		out[i] = f(i);
	return (out);
}

function	get2dArray(width, height, f)
{
	return getArray(height, (y) => {
		return getArray(width, (x) => {
			return f(x, y);
		});
	});
}

function	generateDefaultMap(width, height)
{
	map = get2dArray(
		values.width.value,
		values.height.value,
		(x, y) => {
			return (x == 0 || x == values.width.value - 1 ||
					y == 0 || y == values.height.value - 1);
		}
	)
}

function	updateCell(x, y)
{
	map[y][x] = !map[y][x];
	nodes.map.querySelector(`input[id="${y}:${x}"]`).checked = map[y][x];
}

function	updateMaxWidth()
{
	const checkbox = nodes.map.querySelector("input");
	const newMax = Math.round(
		nodes.map.clientWidth /
		(checkbox.clientWidth + parseFloat(getComputedStyle(checkbox.parentElement).gap))
	);
	values.width.nodes.slider.setAttribute("max", newMax);
	if (values.width.value > newMax)
		setSliderValue("width", newMax);
}

function	setSliderValue(name, value)
{
	values[name].value = value;
	values[name].nodes.value.innerHTML = value;
	values[name].nodes.slider.value = value;
}

function	updateVisualMap()
{
	nodes.map.innerHTML = "";
	for (const [y, line] of map.entries())
	{
		const rowNode = document.createElement("div");
		rowNode.setAttribute("id", `r${y}`);
		rowNode.classList.add("row");
		for (const [x, cell] of line.entries())
		{
			const checkboxNode = document.createElement("input");
			checkboxNode.setAttribute("type", "checkbox");
			checkboxNode.setAttribute("name", `${y}:${x}`);
			checkboxNode.setAttribute("id", `${y}:${x}`);
			checkboxNode.checked = cell;

			// Events
			checkboxNode.addEventListener("click", e => e.preventDefault()); // Prevent default clicking event
			checkboxNode.addEventListener("mousedown", e => { if (e.button == 0) updateCell(x, y); });
			checkboxNode.addEventListener("mouseenter", e => { if (e.button == 0 && e.buttons != 0) updateCell(x, y); })

			rowNode.appendChild(checkboxNode);
		}
		nodes.map.appendChild(rowNode);
	}
}

function	updateMap()
{
	generateDefaultMap(values.width.value, values.height.value);
	updateVisualMap();
}

function	getMapAsCArray()
{
	return (`int	map[${values.height.value}][${values.width.value}] = {\n${map.map(l => `\t{ ${l.map(v => +v).join(',')} }`).join(',\n')}\n}`);
}

function	getFileMap()
{
	return [
		"NO ./path_to_the_north_texture",
		"SO ./path_to_the_south_texture",
		"WE ./path_to_the_west_texture",
		"EA ./path_to_the_east_texture",
		"",
		"F R,G,B",
		"C R,G,B",
		"",
		...map.map(l => l.map(v => +v).join("")),
	].join("\n");
}

// Buttons functions
function	reset()
{
	setSliderValue("width", 7);
	setSliderValue("height", 7);
	updateMap();
}

function copyToClipboard(content) {
	if (navigator.clipboard != null) return navigator.clipboard.writeText(content);
	const	textarea = document.createElement("textarea");
	textarea.value = content;
	document.body.append(textarea);
	textarea.select();
	document.execCommand("copy");
	document.body.removeChild(textarea);
}

function	saveMap()
{
	const blob = new Blob(getFileMap().split("\n").map(l => `${l}\n`));
	saveAs(blob, "map.cub");
}

function	copy()
{
	copyToClipboard(getMapAsCArray());
	nodes.buttons.copy.classList.add("valid");
	setTimeout(() => {
		nodes.buttons.copy.classList.remove("valid");
	}, 500);
}

[...Object.entries(values)].forEach(([prop, content]) => {
	values[prop].nodes.value.innerHTML = content.value;
	content.nodes.slider.addEventListener("input", function update() {
		values[prop].value = this.value;
		values[prop].nodes.value.innerHTML = this.value;
		updateMap();
	});
});

updateMap();

document.addEventListener("readystatechange", event => {
	if (event.target.readyState == "complete")
	{
		hljs.highlightAll();
		updateMaxWidth();
	}
});

new ResizeObserver(updateMaxWidth).observe(nodes.map);
