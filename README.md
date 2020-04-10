# covid19ImpactEstimator-api
A simple API which estimates impact of COVID19 disease based on input data.

Feel free to try the [covid19ImpactEstimatorAPI](https://covid19impactestimator.herokuapp.com/api/v1/on-covid-19/) after finishing going through the README.

The API supports POST requests only.
   it has 3 endpoints:
      1: https://covid19impactestimator.herokuapp.com/api/v1/on-covid-19/xml
      2: https://covid19impactestimator.herokuapp.com/api/v1/on-covid-19/json
      3: https://covid19impactestimator.herokuapp.com/api/v1/on-covid-19/
      
The first endpoint response is in xml format.
The second endpoint response is json in format.
The third endpoint is a wildcard to catch all POST requests which dont match /xml or /json and its response is json and exactly same with the second endpoint response.

The POST body in all three endpoints is a json object of the format:
```javascript
{
   "region":{
      "name":"Africa",
      "avgAge":19.7,
      "avgDailyIncomeInUSD":5,
      "avgDailyIncomePopulation":0.71
   },
   "periodType":"days",
   "timeToElapse":58,
   "reportedCases":674,
   "population":66622705,
   "totalHospitalBeds":1380614
}
```

The API has two response types:
  json and xml.
The default response type is json.
 
 The json response looks like this:
 ```javascript
 {
    "data": {
        "region": {
            "name": "Africa",
            "avgAge": 19.7,
            "avgDailyIncomeInUSD": 5,
            "avgDailyIncomePopulation": 0.71
        },
        "periodType": "days",
        "timeToElapse": 58,
        "reportedCases": 674,
        "population": 66622705,
        "totalHospitalBeds": 1380614
    },
    "impact": {
        "currentlyInfected": 6740,
        "infectionsByRequestedTime": 3533701120,
        "severeCasesByRequestedTime": 530055168,
        "hospitalBedsByRequestedTime": -529571954,
        "casesForICUByRequestedTime": 176685056,
        "casesForVentilatorsByRequestedTime": 70674022,
        "dollarsInFlight": 727589060608
    },
    "severeImpact": {
        "currentlyInfected": 33700,
        "infectionsByRequestedTime": 17668505600,
        "severeCasesByRequestedTime": 2650275840,
        "hospitalBedsByRequestedTime": -2649792626,
        "casesForICUByRequestedTime": 883425280,
        "casesForVentilatorsByRequestedTime": 353370112,
        "dollarsInFlight": 3637945303040
    }
}
```

and the xml response looks like this:
```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<root>
    <data>
        <region>
            <name>Africa</name>
            <avgAge>19.7</avgAge>
            <avgDailyIncomeInUSD>5</avgDailyIncomeInUSD>
            <avgDailyIncomePopulation>0.71</avgDailyIncomePopulation>
        </region>
        <periodType>days</periodType>
        <timeToElapse>58</timeToElapse>
        <reportedCases>674</reportedCases>
        <population>66622705</population>
        <totalHospitalBeds>1380614</totalHospitalBeds>
    </data>
    <impact>
        <currentlyInfected>6740</currentlyInfected>
        <infectionsByRequestedTime>3533701120</infectionsByRequestedTime>
        <severeCasesByRequestedTime>530055168</severeCasesByRequestedTime>
        <hospitalBedsByRequestedTime>-529571954</hospitalBedsByRequestedTime>
        <casesForICUByRequestedTime>176685056</casesForICUByRequestedTime>
        <casesForVentilatorsByRequestedTime>70674022</casesForVentilatorsByRequestedTime>
        <dollarsInFlight>727589060608</dollarsInFlight>
    </impact>
    <severeImpact>
        <currentlyInfected>33700</currentlyInfected>
        <infectionsByRequestedTime>17668505600</infectionsByRequestedTime>
        <severeCasesByRequestedTime>2650275840</severeCasesByRequestedTime>
        <hospitalBedsByRequestedTime>-2649792626</hospitalBedsByRequestedTime>
        <casesForICUByRequestedTime>883425280</casesForICUByRequestedTime>
        <casesForVentilatorsByRequestedTime>353370112</casesForVentilatorsByRequestedTime>
        <dollarsInFlight>3637945303040</dollarsInFlight>
    </severeImpact>
</root>
```

where the data object is jusst the input posted to the api,
the impact object is an object containing best case scenario
and severeImpact object contains worst case scenario of COVID19 based on the data in the data object.

The hosted interactive openapi3 documentation is coming soon.
Thanks Geeksilver.
