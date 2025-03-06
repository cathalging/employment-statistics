const { DataFrame } = dfjs;

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
    const df = new DataFrame(rows);

    df.show()
  })

function submitGraph() {

    let sector = document.getElementById('sector').value;
    let statistic = document.getElementById('statistic').value;

    if (document.getElementById("useEconomicIndicator").checked) {
        let economicIndicator = document.getElementById('economicIndicator').value;
    } else {

    }
}






