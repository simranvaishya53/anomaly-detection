# Anomaly Detection
Anomaly detection, also known as outlier detection, is the process of identifying data points, events, or observations that deviate significantly from the dataset's normal behavior. 
Anomalous data can indicate critical incidents, such as a change in a system, structural defects, fraudulent behavior, or errors.

## Introduction
This repository contains the implementation of a machine learning system designed to detect anomalies in vibrational data from a three-axis sensor. 
The data reflects vibrations in the X, Y, and Z axes, indicative of the operational state of the machinery. By analyzing this data, we aim to identify irregular patterns that could signify potential malfunctions.

## System Overview
The system fetches vibrational sensor data stored in MongoDB and processes it using a Python application with Flask. It then performs a series of data transformation and machine learning tasks to detect anomalies:

1) Data Retrieval: The sensor data is retrieved from a MongoDB database.
2) Data Splitting: The data is split into training and testing sets for model validation.
3) Time Series Conversion: Both datasets are resampled to create time series data suitable for anomaly detection.
4) Principal Component Analysis (PCA): PCA is applied to identify the most significant features and reduce dimensionality.
5) Standard Scaling: The data is scaled to normalize its range.
6) Anomaly Detection: The Isolation Forest algorithm is used to detect anomalies within the dataset.
7) Threshold Setting: Thresholds are determined to classify anomalies based on the trained model.
8) Visualization: The data, along with the thresholds, are sent to an HTML file and visualized using D3.js.

## Getting Started
### Prerequisites
Ensure you have the following installed:
Python 3.x
MongoDB
Flask
Required Python libraries: pandas, numpy, scikit-learn, pymongo
d3.js

### Visualization
The D3.js visualization provides an interactive view of the vibrational data, highlighting anomalies against the normal operational patterns. 
Users can explore the data in the context of the detected thresholds, providing intuitive insights into the machine's condition.
