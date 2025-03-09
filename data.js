const { DataFrame } = dfjs;

let df
// Fetch the jobchurn and convert to json
fetch('https://ws.cso.ie/public/api.restful/PxStat.Data.Cube_API.ReadDataset/JCQ01/JSON-stat/2.0/en')
  .then(response => response.json())
  .then(data => {
    const statLabels = data.dimension.STATISTIC.category.label;
    const quarterLabels = data.dimension['TLIST(Q1)'].category.label;
    const sectorLabels = data.dimension.C02598V03152.category.label;

    const rows = [];
    let valueIndex = 0;

    for (const statKey in statLabels) {
      for (const quarterKey in quarterLabels) {
        for (const sectorKey in sectorLabels) {
          // Generate the row for each combination
          const row = {
            "Statistic": statLabels[statKey],
            "Quarter": quarterLabels[quarterKey],
            "Sector": sectorLabels[sectorKey],
            "Value": data.value[valueIndex]
          };

          rows.push(row);
          valueIndex++;
        }
      }
    }

    // Create dataframe of jobchurn json
      df = new DataFrame(rows);
      df.sql.register("tmp")
  })



async function getJobVacanciesBySector(sector) {
    const response = await fetch("https://ws.cso.ie/public/api.restful/PxStat.Data.Cube_API.ReadDataset/EHQ16/JSON-stat/2.0/en");
    const data = await response.json();

    const statLabels = data.dimension.STATISTIC.category.label;
    const quarterLabels = data.dimension['TLIST(Q1)'].category.label;
    const sectorLabels = data.dimension.C02665V03225.category.label;
    const sectorTypeLabels = data.dimension.C02511V03040.category.label;

    const values = data.value;
    let valueIndex = 0;

    const jobVacancies = [];

    // Go through each dimension
    for (const statKey in statLabels) {
        for (const quarterKey in quarterLabels) {
            for (const sectorKey in sectorLabels) {
                for (const sectorTypeKey in sectorTypeLabels) {
                    // Check if the statistic is "Number of Job Vacancies"
                    if (statLabels[statKey] === "Number of Job Vacancies") {
                        // Check if the sector matches and the quarter is after 2020Q2
                        if (sectorLabels[sectorKey] === sector && quarterKey >= "20202") {
                            // Only include data for "All sectors" in the C02511V03040 dimension
                            if (sectorTypeLabels[sectorTypeKey] === "All sectors") {
                                jobVacancies.push(values[valueIndex]);
                            }
                        }
                    }
                    valueIndex++;
                }
            }
        }
    }

    return jobVacancies;
}

async function getGDPAtConstantMarketPrices() {
    const response = await fetch("https://ws.cso.ie/public/api.restful/PxStat.Data.Cube_API.ReadDataset/NAQ03/JSON-stat/2.0/en");
    const data = await response.json();

    // Access the dimensions and values from the JSON
    const statLabels = data.dimension.STATISTIC.category.label;
    const quarterLabels = data.dimension['TLIST(Q1)'].category.label;
    const values = data.value;

    let valueIndex = 0;
    const gdpValues = [];

    // Go through all dimensions in the correct order
    for (const statKey in statLabels) {
        for (const quarterKey in quarterLabels) {
            // Check if the statistic is "GDP at Constant Market Prices" and the quarter is after 2022Q2
            if (statLabels[statKey] === "GDP at Constant Market Prices" && quarterKey >= "20202") {
                // Push the value to the gdpValues array
                gdpValues.push(values[valueIndex]);
            }
            valueIndex++;
        }
    }

    return gdpValues;
}


function getStatTable(statWanted) {

    switch(statWanted) {
        case "hirings":
            return DataFrame.sql.request("SELECT * FROM tmp WHERE Statistic = 'Hirings'")
        case "jobChurn":
            return DataFrame.sql.request("SELECT * FROM tmp WHERE Statistic = 'Job Churn'")
        case "jobChurnRate":
            return DataFrame.sql.request("SELECT * FROM tmp WHERE Statistic = 'Job Churn Rate'")
        case "jobCreation":
            return DataFrame.sql.request("SELECT * FROM tmp WHERE Statistic = 'Job Creation'")
        case "jobDestruction":
            return DataFrame.sql.request("SELECT * FROM tmp WHERE Statistic = 'Job Destruction'")
        case "separations":
            return DataFrame.sql.request("SELECT * FROM tmp WHERE Statistic = 'Separations'")
        case "stayers":
            return DataFrame.sql.request("SELECT * FROM tmp WHERE Statistic = 'Stayers'")
    }
}


async function submitGraph() {
    // Get sector value when the user submits the graph
    let sector = document.getElementById('sectors').value;
    let statistic = document.getElementById('statistic').value;
    let values = getGraphValues(sector, statistic);

    // Get job vacancy and gdp figures
    const jobVacancies = await getJobVacanciesBySector(sector);
    const gdp = await getGDPAtConstantMarketPrices();
    drawChart(values, jobVacancies, gdp);
}
let indicatorValues = null

function getGraphValues(sector, statistic) {
    let statTable = getStatTable(statistic);

    // Column index for sector and value
    let sectorIndex = 2;
    let valueIndex = 3;

    // Get rid of unwanted sectors
    let filteredTable = statTable.toArray().filter(row => row[sectorIndex] === sector);

    // Get values from the filtered table
    return filteredTable.map(row => row[valueIndex]);
}

let graph

function drawChart(values, jobVacancies, gdp) {
    // Allows you to resubmit a new graph without refreshing page
    if (graph) {
        graph.destroy();
    }

    const canvas = document.getElementById('graphBox');
    const ctx = canvas.getContext('2d');

    // Set width and height to stop the resizing
    canvas.width = 1124;
    canvas.height = 562;
    canvas.style.width = "100%";
    canvas.style.height = "auto";

    const quarters = [
        "2020Q2", "2020Q3", "2020Q4",
        "2021Q1", "2021Q2", "2021Q3", "2021Q4",
        "2022Q1", "2022Q2", "2022Q3", "2022Q4",
        "2023Q1", "2023Q2", "2023Q3", "2023Q4",
        "2024Q1", "2024Q2", "2024Q3"
    ];

    // List for lines, will include economic indicator if requested
    let dataLists = [{
        label: document.getElementById('statistic').options[document.getElementById('statistic').selectedIndex].text,
        data: values,
        borderColor: '#F5CB5C',
        borderWidth: 2,
        backgroundColor: '#F5CB5C',
        fill: false,
        pointRadius: 4,
        pointHoverRadius: 6
    }]

    if (document.getElementById("useEconomicIndicator").checked) {
        if (document.getElementById('economicIndicator').value === "jobVacancies") {
            dataLists.push({
                label: document.getElementById('economicIndicator').options[document.getElementById('economicIndicator').selectedIndex].text,
                data: jobVacancies,
                borderColor: '#E8EDDF',
                borderWidth: 2,
                backgroundColor: '#E8EDDF',
                fill: false,
                pointRadius: 4,
                pointHoverRadius: 6
            });
        }
        else if (document.getElementById('economicIndicator').value === "GDP") {
            dataLists.push({
                label: document.getElementById('economicIndicator').options[document.getElementById('economicIndicator').selectedIndex].text,
                data: gdp,
                borderColor: '#E8EDDF',
                borderWidth: 2,
                backgroundColor: '#E8EDDF',
                fill: false,
                pointRadius: 4,
                pointHoverRadius: 6
            });
        }
    }


    if (indicatorValues) {

    }

    console.log(dataLists)
    graph = new Chart(ctx, {
        type: 'line',
        data: {
            labels: quarters,
            datasets: dataLists
        },
        options: {
            // Fixes graph resizing issue
            responsive: false,
            maintainAspectRatio: false,
            interaction: {
                mode: 'nearest',
                intersect: false
            },
            plugins: {
                tooltip: { enabled: true },
                legend: {
                    display: true,
                    labels: {color: "#E8EDDF"}
                }
            },
            scales: {
                x: { title: { display: true, text: "Quarter" , color: "#E8EDDF"}, ticks: {color: "#E8EDDF"} },
                y: { title: { display: true, text: "Value",  color: "#E8EDDF" }, ticks: {color: "#E8EDDF"} },
            }
        }
    });
}






