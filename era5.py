from tokenize import String
import netCDF4 as nc
import numpy as np
import pandas as pd

#specify path to the data
path_in="C:/Users/User/Desktop/"
path_out="./"

#open the data
df=nc.Dataset(path_in+"era5_200.nc")

print(df)

temp=df.variables['t']

print(temp)

lats = df.variables['latitude'][:] 
lons = df.variables['longitude'][:]


latit=np.argmin( np.abs( lats - 41.2995  ) )
longit=np.argmin( np.abs( lons - 69.2401 ) )

k=1

print("Temperature:  for 200hPa ")
for i in range(1,744,24):

    new_temp=temp[i,latit,longit]
    a=new_temp-273.15
    print("December "+str(k)+", 2008: ", a)
    k=k+1
