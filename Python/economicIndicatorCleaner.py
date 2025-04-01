import pandas as pd

# Read GDP figures from csv
def get_gdp():
    gdpDf = pd.read_csv("gdp.csv")
    
    gdp = pd.DataFrame(gdpDf[gdpDf["Statistic Label"] == "GDP at Constant Market Prices"])
    gdp = gdp.drop(columns=["Statistic Label", "STATISTIC", "TLIST(Q1)", "C02196V02652", "State", "UNIT"], axis=1, inplace=False)
    
    # Drop all figures before 2020
    gdp = gdp[gdp["Quarter"].str[:4].astype(int) >= 2020]

    return gdp

# Read vacancies from csv
def get_jobVacancies():
    jobVacancies = pd.read_csv("jobVacancies.csv")
    
    jobVacancies = pd.DataFrame(jobVacancies[jobVacancies["Statistic Label"] == "Number of Job Vacancies"])
    jobVacancies = pd.DataFrame(jobVacancies[jobVacancies["Private or Public Sector"] == "All sectors"])
    jobVacancies = jobVacancies.drop(columns=["Statistic Label", "STATISTIC", "TLIST(Q1)", "C02665V03225", "UNIT", "C02511V03040",], axis=1, inplace=False)

    # Drop all figures before 2020
    jobVacancies = jobVacancies[jobVacancies["Quarter"].str[:4].astype(int) >= 2020]
    return jobVacancies


