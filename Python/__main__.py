from grapher import *

def main():
    # Whether Bar Chart or Trend Chart wanted
    graphWanted: int = int(input("Bar chart of a quarter / Trends over all quarters (1/2): "))

    # Bar Chart
    if graphWanted == 1:
        # What Quarter wanted
        timeFrameInput: str = input("Enter year & quarter (xxxxQx): ")
        # What stats are wanted
        statisticInput: str = input("Enter statistic: ") 
        
        allSectorsGraph(timeFrame = timeFrameInput, statistic = statisticInput)

    elif graphWanted == 2:
        # What stats are wanted
        statisticInput: str = input("Enter statistic: ") 
        # Graph all sectors or just one
        sectorInput: int = int(input("All Sectors / Single Sector (1/2): "))

        # If all sectors wanted
        if sectorInput == 1:
            sectorToGraphInput = "all"
        
        # Choose specific sector
        elif sectorInput == 2:
            sectorToGraphInput = input("Enter sector: ")

        trendGraph(statistic = statisticInput, sectorToGraph = sectorToGraphInput)


if __name__ == "__main__":
    main()

