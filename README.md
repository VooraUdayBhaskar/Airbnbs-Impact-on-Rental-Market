# Airbnb's Impact

This is the study that investigates the impact of Airbnb on local housing markets, focusing on whether neighbourhoods with a high concentration of Airbnb listings experience increased real estate prices or reduced long-term rental availability. Using datasets from Airbnb and Zillow, the analysis incorporates enhanced visualizations created with D3, including heatmaps, choropleth maps, and bubble plots, to illustrate spatial trends and market dynamics.


The team includes:

* Uday Bhaskar Voora (University of Illinois Chicago)
* Sravan Kilaru (University of Illinois Chicago)
* Om Naga Sai Mani Pavan Chamarthi (University of Illinois Chicago)

## Project Report
Our Project Report Can be accessed Here
* Project Report : [Report](https://drive.google.com/file/d/1n9_TVA_K15iqKD7MOheAKIiJY_6PkhZv/view?usp=sharing)

## Table of contents

   * [Problem Description](#Problem-Description)
   * [Data Summary](#Data-Summary)
   * [Running AirBNB's Impact](#Running-AirBNB's-Impact)
   * [Results](#Results)
   * [Technical Implementation](#Technical-Implementation)
   * [Future Contributions](#Future-contributions)


## Problem Description

This project focuses on the United States housing market to examine the extent of Airbnb's influence on real estate prices and the availability of long-term rentals. Specifically, it investigates whether neighbourhoods with a high density of Airbnb listings experience a significant increase in real estate prices or a reduction in long-term rental availability. The study leverages comprehensive datasets, including over 280,000 Airbnb listings spanning 2020–2023, and integrates them with Zillow property price data. By employing advanced data cleaning techniques and focusing on geographic attributes such as neighbourhoods and zip codes, the analysis ensures a contextually accurate representation of local market dynamics. 


## Data Summary
### Dataset Overview

#### Airbnb Dataset:
The Airbnb dataset, sourced from the Inside Airbnb platform, contains detailed information about Airbnb listings across various cities. For this analysis, dataset includes the following attributes: 

* Property Name: Identifies the Airbnb listing by name. 

* Price: Specifies the rental cost of the property per day or night. 

* Geolocation: Provides latitude and longitude details for mapping and spatial analysis. 

* Availability: Indicates the average number of days the property is available for rental. 

* Neighbourhood Region: Categorizes listings into specific neighbourhoods for localized analysis. 

This dataset, spanning 2020–2023, contains over 280,000 records, enabling an extensive evaluation of Airbnb trends and their influence on the housing market.

#### Zillow-Dataset: 
The Zillow dataset complements the Airbnb data by providing detailed property rental values for each neighbourhood in Chicago for understanding. It includes: 

* Rental Values: Monthly rental prices for properties in different neighbourhood’s 

* Time Frame: Covers the last five years, offering historical context to observe trends over time. 

* Zip codes: Contains the region names (neighbourhood names) in zip code format for each specific region/neighbourhood. 

### Dataset Access
The datasets can be accessed through : 
* Air BNB Dataset : [AirBNB](https://insideairbnb.com/get-the-data/)
* Zillow Dataset : [Zillow](https://www.zillow.com/research/data/)


## Running AirBNB's Impact
The following are prerequisites for all systems:
* Node.js (v14 or latest version)
* Python 3.8+

### Setup 
Install Node.js dependencies:
	
 	npm install

Start the application :

 	 npm start

You can access the application at (```http://localhost:3000```)
## Results
### Key Findings:
![Key Findings](./images/neighboorhood-analysis.png)
![Key Findings](./images/heatmap.png)
![Key Findings](./images/chrolopeth.png)
![Key Findings](./images/bubblemap.png)
![Key Findings](./images/analysis.png)
![Key Findings](./images/west-pullman.png)
![Key Findings](./images/loop.png)
## Technical Implementation
### Technical Stack
* React for UI components
* Visual Studio tool to run the application
* Material-UI for styling
* Leaflet Open street map for mappings
* D3.js for data visualization
* Recharts for data visualization

## Future Contributions
* Fork this repository
* Create a new branch (```git checkout -b branch name```)
* Commit your contribution to the branch (```git commit -m 'your contribution'```)
* Push the work to the orginal branch (```git push origin branch name```)
* Open a Pull Request


