# -*- coding: utf-8 -*-
"""
Created on Mon May 31 11:28:57 2021

@author: simran
"""

import pandas as pd
import numpy as np
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.ensemble import IsolationForest
import pymongo
from flask import Flask
from flask import render_template
from pymongo import MongoClient
import json
from bson import json_util
from bson.json_util import dumps

app = Flask(__name__)


#main file where we can show or data visualization 

@app.route("/")
def index():
    
        client  = pymongo.MongoClient("mongodb://localhost:27017")    ## connection with mongodb
        db = client["SensorData"]
        mycollection = db["Realdata"]
        all_records = mycollection.find()
        list_cursor = list(all_records)
        train = pd.DataFrame(list_cursor)
        print(train)
        train=train.drop(['_id'],axis=1)
        test= pd.DataFrame(train.values * 1.5, columns = ['X axis', 'Y axis', 'Z axis'], index= train.index)
        test=test[850000:]
        
        def resample_data(dataframe, time, timeformat):                  # function to resample data here into 3 mins
            dataframe['Time'] = 1
            dataframe['new_time'] = (pd.to_datetime(timeformat) + 
                            pd.to_timedelta(dataframe.Time.shift().cumsum(), unit='s')
                            )
            dataframe.drop('Time', axis='columns', inplace=True)
            dataframe['Datetime'] = pd.to_datetime(dataframe['new_time'])
            dataframe = dataframe.set_index(['Datetime'])
            dataframe=dataframe.resample(time).mean()
            print("inside resample")
            return dataframe
         
        
        def scale_pca(resampled_dataframe):                  ## function to scale data and apply pca 
            names=resampled_dataframe.columns
            columns = resampled_dataframe[names]
            scaler = StandardScaler()
            pca = PCA()
            pipeline = make_pipeline(scaler, pca)
            pipeline.fit(columns)
            print("inside scale")
            pca = PCA(n_components=1)
            principalComponents = pca.fit_transform(columns)
            data = pd.DataFrame(data = principalComponents, columns=['vibration'],index=resampled_dataframe.index)
            return data
        
        
        def IsolationForest_func(train_df, test_df):                          ## function for isolation forest
            clf=IsolationForest(n_estimators=100, max_samples='auto', contamination=0.020)
            clf.fit(train_df)
            pred_train = clf.predict(train_df)
            train_df['anomaly']=pred_train
            pred_test = clf.predict(test_df)
            test_df['anomaly']=pred_test
            print("inside isolation forest")
            print("For train data Anomalies: ")
            print(train_df['anomaly'].value_counts())
            print("For test data Anomalies: ")
            print(test_df['anomaly'].value_counts())
            threshold1 = train_df['vibration'].min()
            threshold2 = train_df['vibration'].max()
            
            for value1, value2 in zip(train_df['vibration'].values, train_df['anomaly'].values):            ## threshold 1 for below
                if((value1<0) and (value2 == -1)):
                    if value1>=threshold1:
                        threshold1 = value1
            
            for value1, value2 in zip(train_df['vibration'].values, train_df['anomaly'].values):          ## threshold 2 for above
                if((value1>0)  & (value2==-1)):
                   if value1 <= threshold2:
                        threshold2 = value1
           
            train_df['threshold1'] = threshold1
            train_df['threshold2'] = threshold2
            test_df['threshold1'] = threshold1
            test_df['threshold2'] = threshold2
            result = pd.concat([train_df, test_df])
            return result
            
            
            
        time= '3Min'
        resampled_train =resample_data(train,time,'2021-04-15 01:00:00.000')
        resampled_test=resample_data(test, time,'2021-04-27 04:18:00.000')
        train_df = scale_pca(resampled_train)
        test_df = scale_pca(resampled_test)
        anomalies = IsolationForest_func(train_df, test_df)
        anomalies.reset_index(inplace=True)
        
        chart_data = anomalies.to_dict(orient='records')
        chart_data = json.dumps(chart_data, indent=3, default=str)
        data = {'chart_data': chart_data}
        return render_template("index.html", data=data)

        
#     # def AlertSystem(anomaly_array, constraint):
#     #     count=0;
#     #     for index, value in enumerate(anomaly_array): 
#     #         if(value == -1):
#     #             while(count<constraint):
#     #                 count=count+1;
#     #                 break;
#     #             if count==constraint:
#     #                 print("ALERT ",index)
#     #                 break;
#     #         else:
#     #             count=0;
    
  
if __name__ == "__main__":
    app.run(debug=True)
