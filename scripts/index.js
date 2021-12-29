let map = [];
const mapNode = document.querySelector("#map");

const ranges = {
	width: {
		parent: document.querySelector("#width"),
		value: document.querySelector("#width input").value,
	},
	height: {
		parent: document.querySelector("#height"),
		value: document.querySelector("#height input").value,
	},
};

function newArray(length, f)
{
	let arr = [];
	for (let i = 0; i < length; i++)
		arr[i] = f(i);
	return (arr);
}

function new2DArray(width, height, f)
{
	return newArray(height, (y) => {
		return newArray(width, (x) => {
			return f(x, y);
		});
	});
}

[...Object.entries(ranges)].forEach(([key, {parent}]) => {
	const valueNode = parent.querySelector(".value");
	const slider = parent.querySelector("input");
	valueNode.innerHTML = slider.value;

	map = new2DArray(ranges.width.value, ranges.height.value, (x, y) => {
		return x == 0 || x == ranges.width.value - 1
			|| y == 0 || y == ranges.height.value - 1;
	});

	slider.addEventListener("input", function updateValue(event) {
		ranges[key].value = this.value;
		valueNode.innerHTML = this.value;
		generateMap(ranges.width.value, ranges.height.value);
	});
});

function generateMap(width, height)
{
	mapNode.innerHTML = '';
	map = new2DArray(ranges.width.value, ranges.height.value, (x, y) => {
		return x == 0 || x == ranges.width.value - 1
			|| y == 0 || y == ranges.height.value - 1;
	});
	for (let [row, y] of map.map((v,i) => [v, i]))
	{
		const rowNode = document.createElement("div");
		rowNode.classList.add(`row-${y}`);
		for (let [cell, x] of row.map((v,i) => [v, i]))
		{
			const checkbox = document.createElement("input");
			checkbox.setAttribute("type", "checkbox");
			checkbox.setAttribute("name", `${y}${x}`);
			checkbox.setAttribute("id", `${y}${x}`);
			checkbox.checked = x == 0 || x == width - 1 || y == 0 || y == height - 1;
			checkbox.addEventListener("input", function onCheck(event) {
				map[y][x] = !map[y][x];
			});
			rowNode.appendChild(checkbox);
		}
		mapNode.appendChild(rowNode);
	}
}

function getFormattedMap()
{
	const rows = map.map(r => {
		return `\t{${r.map(v => v ? 1 : 0).join(',')}}`;
	}).join(",\n");
	return `int	map[${ranges.height.value}][${ranges.width.value}] = {\n${rows}\n};`
}

function exportMap()
{
	const blob = new Blob([getFormattedMap()], {type: "text/plain;charset=utf-8"});
	saveAs(blob, "map.txt");
}

function toClipboard()
{
	navigator.clipboard.writeText(getFormattedMap());
}

generateMap(ranges.width.value, ranges.height.value);
