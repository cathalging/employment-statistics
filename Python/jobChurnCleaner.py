import pandas as pd

# Make job churn dataframe
df = pd.read_csv("jobChurn.csv")

# Split statistic types into sub dataframes and remove unneccessary columns
def get_hirings() -> pd.DataFrame:
    hirings = pd.DataFrame(df[df["Statistic Label"] == "Hirings"])
    hirings = hirings.drop(columns=["Statistic Label", "UNIT"], axis=1, inplace=False)
    return hirings

def get_jobChurn() -> pd.DataFrame:
    jobChurn = pd.DataFrame(df[df["Statistic Label"] == "Job Churn"])
    jobChurn = jobChurn.drop(columns=["Statistic Label", "UNIT"], axis=1, inplace=False)
    return jobChurn

def get_jobChurnRate() -> pd.DataFrame:
    jobChurnRate = pd.DataFrame(df[df["Statistic Label"] == "Job Churn Rate"])
    jobChurnRate = jobChurnRate.drop(columns=["Statistic Label", "UNIT"], axis=1, inplace=False)
    return jobChurnRate

def get_jobCreation() -> pd.DataFrame:
    jobCreation = pd.DataFrame(df[df["Statistic Label"] == "Job Creation"])
    jobCreation = jobCreation.drop(columns=["Statistic Label", "UNIT"], axis=1, inplace=False)
    return jobCreation

def get_jobDestruction() -> pd.DataFrame:
    jobDestruction = pd.DataFrame(df[df["Statistic Label"] == "Job Destruction"])
    jobDestruction = jobDestruction.drop(columns=["Statistic Label", "UNIT"], axis=1, inplace=False)
    return jobDestruction

def get_separations() -> pd.DataFrame:
    separations = pd.DataFrame(df[df["Statistic Label"] == "Separations"])
    separations = separations.drop(columns=["Statistic Label", "UNIT"], axis=1, inplace=False)
    return separations

def get_stayers() -> pd.DataFrame:
    stayers = pd.DataFrame(df[df["Statistic Label"] == "Stayers"])
    stayers = stayers.drop(columns=["Statistic Label", "UNIT"], axis=1, inplace=False)
    return stayers

# Quarters
def get_quarters() -> pd.DataFrame:
    quarters = pd.DataFrame(df["Quarter"])
    quarters = quarters.drop_duplicates()
    return quarters

# All sectors
def get_sectors() -> pd.DataFrame:
    sectors = pd.DataFrame(df["NACE Rev. 2 Sector"])
    sectors = sectors.drop_duplicates()
    return sectors

