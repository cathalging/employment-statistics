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


    // For Job Churn
    const jobChurn = DataFrame.sql.request("SELECT * FROM tmp WHERE Statistic = 'Job Churn'")
        .toArray()
        .filter(row => {
            const quarter = row[1]; // Quarter is at index 1
            const sectorOfRow = row[2]; // sector at index 2
            const year = parseInt(quarter.substring(0, 4));
            return year >= 2021 && sectorOfRow === sector;
        })
        .map(row => row[3]); // Value is at index 3

    // For Separations
    const separations = DataFrame.sql.request("SELECT * FROM tmp WHERE Statistic = 'Separations'")
        .toArray()
        .filter(row => {
            const quarter = row[1]; // Quarter is at index 1
            const sectorOfRow = row[2]; // sector at index 2
            const year = parseInt(quarter.substring(0, 4));
            return year >= 2021 && sectorOfRow === sector;
        })
        .map(row => row[3]); // Value is at index 3

    const jobVacancies = await getJobVacanciesBySector(sector)

    // Get Average Values
    function getAverage(list) {
        let count = 0;
        for (let i = 0; i < list.length; i++) {
            count += list[i];
        }
        let average = count / list.length;
        console.log("length: " + list.length);
        return average;
    }
    console.log("Job Churn")
    const averageJobChurn = getAverage(jobChurn);
    console.log("Separations")
    const averageSeparations = getAverage(separations);
    console.log("Vacancies")
    const averageVacancies = getAverage(jobVacancies);

    console.log("Average Churn: " + averageJobChurn);
    console.log("Average Separations: " + averageSeparations);
    console.log("Average Vacancies: " + averageVacancies);

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
        console.log("High Churn: " + highChurnLevel);
    }
    if (currentSeparations >= averageSeparations) {
        highSeparationLevel = true
        console.log("High Separations: " + highSeparationLevel);
    }
    if (currentVacancies >= averageVacancies) {
        highVacanciesLevel = true
        console.log("High Vacancies level: " + highVacanciesLevel);
    }

    // Make Recommendations
    let marketType
    if (highVacanciesLevel && !highSeparationLevel && highChurnLevel) {
        marketType = "Strong Job Market"
    } else if (!highVacanciesLevel && highSeparationLevel && !highChurnLevel) {
        marketType = "Weak Job Market"
    } else if (highVacanciesLevel && highSeparationLevel && highChurnLevel) {
        marketType = "Hiring Surge with Job Instability"
    } else if (!highVacanciesLevel && !highSeparationLevel && !highChurnLevel) {
        marketType = "Hiring Freeze but Job Security"
    } else if (!highVacanciesLevel && !highSeparationLevel && highChurnLevel) {
        marketType = "High Job Switching with Few Openings"
    } else if (highVacanciesLevel && !highSeparationLevel && !highChurnLevel) {
        marketType = "Many Openings but Few Switching"
    } else if (!highVacanciesLevel && highSeparationLevel && highChurnLevel) {
        marketType = "Many Layoffs but High Job Switching"
    } else if (!highVacanciesLevel && highSeparationLevel && !highChurnLevel) {
        marketType = "Hiring Freeze & Job Losses"
    }
    console.log("market: ",marketType)

    returnData(marketType)

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

function returnData(market) {
    const outputBox = document.getElementById("outputBox");
    let recommendation
    switch (market) {
        case "Strong Job Market":
            recommendation = "<ul>" +
                "<li>Actively search now – easy to get hired.</li>" +
                "<li>Negotiate for higher pay – employers compete for workers.</li>" +
                "<li>Great time to switch jobs for better pay/benefits.</li>" +
                "</ul>";
            break;
        case "Weak Job Market":
            recommendation = "<ul>" +
                "<li>Hold onto your current job if possible.</li>" +
                "<li>Expect a longer job search if unemployed.</li>" +
                "<li>Upskill & improve qualifications to stay competitive.</li>" +
                "</ul>";
            break;
        case "Hiring Surge with Job Instability":
            recommendation = "<ul>" +
                "<li>Look for work, but be cautious – some industries are volatile.</li>" +
                "<li>Stick to stable employers (avoid risky startups/companies with layoffs).</li>" +
                "<li>Make sure a new job is secure before switching.</li>" +
                "</ul>";
            break;
        case "High Job Switching with Few Openings":
            recommendation = "<ul>" +
                "<li>You can still find a job if you’re persistent.</li>" +
                "<li>Expect fewer job offers but a chance to replace those leaving.</li>" +
                "<li>Focus on networking to find opportunities.</li>" +
                "</ul>";
            break;
        case "Many Openings but Few Switching":
            recommendation = "<ul>" +
                "<li>Easier to find an entry-level job.</li>" +
                "<li>Job hoppers might struggle if people aren’t switching much.</li>" +
                "<li>Target industries with high hiring demand.</li>" +
                "</ul>";
            break;
        case "Many Layoffs but High Job Switching":
            recommendation = "<ul>" +
                "<li>Be cautious when switching jobs – risk of being laid off.</li>" +
                "<li>Only switch if the new job is stable.</li>" +
                "<li>Build financial security in case of job loss.</li>" +
                "</ul>";
            break;
        case "Hiring Freeze But Job Security":
            recommendation = "<ul>" +
                "<li>Hard to switch jobs, but those employed are secure.</li>" +
                "<li>Wait for better conditions before switching.</li>" +
                "<li>Develop skills to be competitive when hiring picks up.</li>" +
                "</ul>";
            break;
        case "Hiring Freeze & Job Losses":
            recommendation = "<ul>" +
                "<li>Avoid quitting without a secure offer.</li>" +
                "<li>Expect a longer job search.</li>" +
                "<li>Consider retraining or waiting for market improvement.</li>" +
                "</ul>";
            break;
    }


    outputBox.innerHTML = `<h3>Market Type: ${market}</h3> <div>${recommendation}</div>`
}