const { DataFrame } = dfjs;
let df
fetch('https://ws.cso.ie/public/api.restful/PxStat.Data.Cube_API.ReadDataset/JCQ01/JSON-stat/2.0/en')
    .then(response => response.json())
    .then(async data => {
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

async function submit() {

    const sector = document.getElementById("sectors").value;


        const jobChurn = DataFrame.sql.request("SELECT * FROM tmp WHERE Statistic = 'Job Churn'")
            .filter(row => {
                // Add null check and type validation
                if (!row.Quarter || typeof row.Quarter !== 'string') return false;
                const year = parseInt(row.Quarter.substring(0, 4));
                return year >= 2021;
            })
            .select("Value").toArray().flat();
        const separations = DataFrame.sql.request("SELECT * FROM tmp WHERE Statistic = 'Separations'")
            .filter(row => {
                if (!row.Quarter || typeof row.Quarter !== 'string') return false;
                const year = parseInt(row.Quarter.substring(0, 4));
                return year >= 2021;
            })
            .select("Value").toArray().flat();

        const jobVacancies = await getJobVacanciesBySector(sector)

        // Get Average Values
        function getAverage(list) {
            let count = 0;
            for (let i = 0; i < list.length; i++) {
                count += list[i];
            }
            return count / list.length;
        }
        const averageJobChurn = getAverage(jobChurn);
        const averageSeparations = getAverage(separations);
        const averageVacancies = getAverage(jobVacancies);

        // Get Most Recent Value
        const currentJobChurn = jobChurn[jobChurn.length - 1];
        const currentSeparations = separations[separations.length - 1];
        const currentVacancies = jobVacancies[jobVacancies.length - 1];

        // Is it high or low
        let highChurnLevel = false
        let highSeparationLevel = false
        let highVacanciesLevel = false

        if (currentJobChurn >= averageJobChurn) {
            highChurnLevel = true
        }
        if (currentSeparations >= averageSeparations) {
            highSeparationLevel = true
        }
        if (currentVacancies >= averageVacancies) {
            highVacanciesLevel = true
        }

        // Make Recommendations
        let marketType
        if (highVacanciesLevel && !highSeparationLevel && highChurnLevel) {
            marketType = "Strong Job Market"
        } else if (!highVacanciesLevel && highSeparationLevel && !highChurnLevel) {
            marketType = "Weak Job Market"
        } else if (highVacanciesLevel && highSeparationLevel && highChurnLevel) {
            marketType = " Hiring Surge with Job Instability"
        } else if (!highVacanciesLevel && !highSeparationLevel && !highChurnLevel) {
            marketType = "Hiring Freeze but Job Security"
        } else if (!highVacanciesLevel && !highSeparationLevel && highChurnLevel) {
            marketType = "High Job Switching with Few Openings"
        } else if (!highVacanciesLevel && !highSeparationLevel && highChurnLevel) {
            marketType = "High Job Switching with Few Openings"
        } else if (highVacanciesLevel && !highSeparationLevel && !highChurnLevel) {
            marketType = "Many Openings but Few Switching"
        } else if (!highVacanciesLevel && highSeparationLevel && highChurnLevel) {
            marketType = "Many Layoffs but High Job Switching"
        } else if (!highVacanciesLevel && highSeparationLevel && !highChurnLevel) {
            marketType = "Hiring Freeze & Job Losses"
        }
        alert(marketType)

}

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
                        // Check if the sector matches and the quarter is after 2021Q1
                        if (sectorLabels[sectorKey] === sector && quarterKey >= "20211") {
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