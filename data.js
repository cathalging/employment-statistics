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
    
    // Iterate over all STATISTIC, TLIST(Q1), and C02598V03152 combinations
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

  })



function getStatTable(statWanted) {
    df.sql.register("tmp")
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

function submitGraph() {
    let sector = document.getElementById('sectors').value;  // Correct ID here
    let statistic = document.getElementById('statistic').value;
    let economicIndicator

    if (document.getElementById("useEconomicIndicator").checked) {
        economicIndicator = document.getElementById('economicIndicator').value;
    }
    else {
        economicIndicator = null
    }
    getGraphValues(sector, statistic, economicIndicator);
}

let values

function getGraphValues(sector, statistic, economicIndicator) {
    let statTable = getStatTable(statistic);

    // Column index for sector and value
    let sectorIndex = 2;
    let valueIndex = 3;

    // Get rid of unwanted sectors
    let filteredTable = statTable.toArray().filter(row => row[sectorIndex] === sector);

    // Get values from the filtered table
    values = filteredTable.map(row => row[valueIndex]);

}


