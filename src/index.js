const DEFAULT_EXPECTANCY = 90;
const WEEKS_IN_YEAR = 52;

const fetchData = async (url, caption) => {
  try {
    const response = await fetch(
      `https://en.wikipedia.org/w/api.php?action=parse&page=${url}&prop=text&format=json&origin=*`
    );
    const json = await response.json();
    const html = json.parse.text["*"];

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const table = Array.from(doc.querySelectorAll("table.wikitable")).find(
      (table) => table.querySelector("caption")?.textContent.includes(caption)
    );
    const rows = table.querySelectorAll("tr");

    const data = Array.from(rows)
      .slice(2)
      .reduce((acc, row) => {
        const cells = row.querySelectorAll("td, th");
        const country = cells[0]?.textContent.trim();
        const male = Math.round(parseFloat(cells[2].textContent.trim()));
        const female = Math.round(parseFloat(cells[3].textContent.trim()));

        return { ...acc, [country]: { male, female } };
      }, {});

    return data;
  } catch (error) {
    console.error("Error fetching Wikipedia data:", error);
    return null;
  }
};

const renderTable = (rows) => {
  const years = document.getElementById("years");
  const table = document.getElementById("table");

  years.innerHTML = Array.from({ length: rows / 5 + 1 }, (_, i) => i * 5)
    .map((year) => `<li class="year">${year}</li>`)
    .join("");

  table.innerHTML = "";
  for (let i = 0; i < rows * WEEKS_IN_YEAR; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    table.appendChild(cell);
  }
};

const render = () => {
  const link = document.getElementById("link");
  const weeks = document.getElementById("weeks");
  const version = document.getElementById("version");

  link.href = `https://en.wikipedia.org/wiki/${
    import.meta.env.VITE_WIKI_PAGE_URL
  }#${import.meta.env.VITE_WIKI_TABLE_CAPTION.replace(/ /g, "_")}`;

  weeks.innerHTML = [1, 10, 20, 30, 40, 50]
    .map((week) => `<li class="week">${week}</li>`)
    .join("");

  renderTable(DEFAULT_EXPECTANCY);

  version.textContent = APP_VERSION;
};

const renderOptions = (data) => {
  const select = document.getElementById("country");

  Object.keys(data)
    .sort()
    .forEach((country) => {
      const option = document.createElement("option");
      option.value = JSON.stringify({
        country,
        male: data[country].male,
        female: data[country].female,
      });
      option.textContent = country;
      select.appendChild(option);
    });
};

const setExpectancy = (expectancy) => {
  const el = document.getElementById("expectancy");
  el.textContent = expectancy;
};

const getCurrentWeek = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  return Math.floor(diff / 7);
};

const fillTable = (age) => {
  const cells = document.querySelectorAll(".cell");

  const lived = age * WEEKS_IN_YEAR + getCurrentWeek();
  cells.forEach((cell, index) => {
    if (index <= lived) {
      cell.classList.add("lived");
    }
  });
};

const handleFormChange = (event) => {
  const form = event.currentTarget;
  const sex = form.querySelector('[name="sex"]:checked');
  const age = form.querySelector('[name="age"]').value.trim();
  const country = form.querySelector('[name="country"]').value.trim();

  if (age === "" || country === "" || sex === null) {
    return;
  }

  const selected = JSON.parse(country || "{}");
  const expectancy = selected[sex.value];

  setExpectancy(expectancy);
  renderTable(expectancy);
  fillTable(age);
};

const init = () => {
  render();

  fetchData(
    import.meta.env.VITE_WIKI_PAGE_URL,
    import.meta.env.VITE_WIKI_TABLE_CAPTION
  ).then(renderOptions);

  const form = document.getElementById("form");
  form?.addEventListener("change", handleFormChange);
};

document.addEventListener("DOMContentLoaded", init);
