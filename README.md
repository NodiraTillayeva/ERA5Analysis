# ERA5 Data Retrieval Repository

## Introduction
This repository contains scripts and tools for retrieving and processing ERA5 datasets. ERA5 provides hourly updates of a large number of atmospheric, land, and oceanic climate variables. These datasets are invaluable for climate research, weather forecasting, and environmental modeling esspecially in the context of Uzbekistan. 

## Prerequisites
- Python 3.x
- Access to ERA5 data through the [Copernicus Climate Data Store](https://cds.climate.copernicus.eu/).
- Required Python libraries: `cdsapi`, `numpy`, `pandas`, `xarray` (installation instructions below).

## Installation

### Clone the Repository
```bash
git clone https://github.com/your-username/era5-retrieval-repo.git
cd era5-retrieval-repo
```
### Install Required Libraries
```
pip install cdsapi numpy pandas xarray
```

### Usage
Setting up CDS API Credentials
Before using the scripts, set up your CDS API credentials. Register at the [CDS website](https://cds.climate.copernicus.eu/#!/home) and obtain your API key and URL.


Create a file named .cdsapirc in your home directory with the following content:
```
url: https://cds.climate.copernicus.eu/api/v2
key: YOUR_CDS_API_KEY
```
