import matplotlib.pyplot as plt
from jobChurnCleaner import *
from economicIndicatorCleaner import *

def allSectorsGraph(timeFrame, statistic) -> None:
    # Retrieve necessary figures for the requested quarter
    statisticData = globals()[f"get_{statistic}"]()
    statisticData = pd.DataFrame(statisticData[statisticData["Quarter"] == timeFrame])

    values = statisticData["VALUE"].to_list()

    # Get list of sectors for graph labels
    sectors = get_sectors()
    
    x = sectors["NACE Rev. 2 Sector"].to_list()
    y = values

    # Should "All NACE economic sectors" be included
    includeAllSectors = input("Include all sectors in one bar in graph (y/n): ")    
    if includeAllSectors == "n":
        # Remove "All NACE economic sectors" from list to be graphed
        x.pop(0)
        y.pop(0)

    # Colours:
    plt.gca().set_facecolor('#242423')  
    plt.gcf().set_facecolor('#242423')  
    plt.xticks(color='#E8EDDF')  
    plt.yticks(color='#E8EDDF')  
    plt.title(plt.gca().get_title(), color='#E8EDDF')  
    plt.xlabel(plt.gca().get_xlabel(), color='#E8EDDF')  
    plt.ylabel(plt.gca().get_ylabel(), color='#E8EDDF')  

    plt.title(statistic.capitalize())

    plt.barh(x,y, color="#F5CB5C")
    plt.show()

def trendGraph(statistic, sectorToGraph) -> None:
    # Set x labels as each quarter
    quarters = get_quarters()
    x = quarters["Quarter"].to_list()
    
    # Graph all sectors
    if sectorToGraph == "all":
        sectors = get_sectors()
        sectorsList = sectors.to_numpy().tolist()
        
        # Should "All NACE economic sectors" be included
        includeAllSectors = input("Include all sectors in one line in graph (y/n): ")    
        if includeAllSectors == "n":
            # Remove "All NACE economic sectors" from list to be graphed
            sectorsList.pop(0)

        # Plot each sector
        for sector in sectorsList:
            # Get requested statistic
            statisticData = globals()[f"get_{statistic}"]()
            statisticData = pd.DataFrame(statisticData[statisticData["NACE Rev. 2 Sector"] == sector[0]])
            
            values = statisticData["VALUE"].to_list()
            
            y = values

            plt.plot(x, y, label = sector[0])
        
        plt.ylabel(statistic.capitalize())
        plt.title(statistic.capitalize())
        
    # Graph a single sector
    else:
        # Get requested statistic
        statisticData = globals()[f"get_{statistic}"]()
            
        statisticData = pd.DataFrame(statisticData[statisticData["NACE Rev. 2 Sector"] == sectorToGraph])
        values = statisticData["VALUE"].to_list()
            
        y = values

        plt.plot(x, y, label = sectorToGraph)
   
    # Graph against economic idicator:
        if input("Graph against economic indicator (y/n): ") == "y":
            indicatorWanted = input("Indicator to graph: ")
            
            # Dictionay of functions to graph indicators
            indicators = {
                "gdp": graphGdp,
                "jobVacancies": graphVacancies
                }
            
            indicators[indicatorWanted](x, statistic, sectorToGraph)
            
        
            # Get correlation between chosen stat and GDP
            points = {"indicator": yIndicator[:3], "values": y[:3]}
            pointsDf = pd.DataFrame(points)

            rPoints = pointsDf["indicator"].corr(pointsDf["values"])

            print(f"Correlation: {rPoints}")
            

        else:
            # Set Y label and title to the statistic name if GDP not included
            plt.ylabel(statistic.capitalize())
            plt.title(statistic.capitalize())
    
    plt.xlabel("Quarter")
    plt.legend()
    
    # Colours:
    plt.gca().set_facecolor('#242423')  
    plt.gcf().set_facecolor('#242423')  
    plt.xticks(color='#E8EDDF')  
    plt.yticks(color='#E8EDDF')  
    plt.title(plt.gca().get_title(), color='#E8EDDF')  
    plt.xlabel(plt.gca().get_xlabel(), color='#E8EDDF')  
    plt.ylabel(plt.gca().get_ylabel(), color='#E8EDDF')  
    plt.legend(facecolor='#E8EDDF', edgecolor='#E8EDDF', loc="center left", bbox_to_anchor=(1, 0.5))


    plt.show()

# Graph GDP values    
def graphGdp(x, statistic, _):
    global yIndicator
    yIndicator = get_gdp()["VALUE"].to_list()
    # Remove 2020 Q1 as job churn data not available
    yIndicator.pop(0)

    plt.plot(x, yIndicator, label="GDP")
    plt.title(f"{statistic.capitalize()} and GDP")

# Economic Indicator
def graphVacancies(x, statistic, sector):
    global yIndicator
    jobVacancies = get_jobVacancies()
    jobVacancies = pd.DataFrame(jobVacancies[jobVacancies["Economic Sector NACE Rev 2"] == sector])
    yIndicator = jobVacancies["VALUE"].to_list()
    yIndicator.pop(0)
    plt.plot(x, yIndicator, label="Vacancies")
    plt.title(f"{statistic.capitalize()} and Job Vacancies")