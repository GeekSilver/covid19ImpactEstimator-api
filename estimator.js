const xml = require('xml2js');

const xmlBuilder = new xml.Builder();

const fs = require('fs');

const path = require('path');

// money lost due to workers being sick
const moneyLost = (infectedByRequestedTime, data) => {
  const income = data.region.avgDailyIncomeInUSD;
  const popRatio = data.region.avgDailyIncomePopulation;
  let dollarsInFlight;
  let multiplier;
  if (data.periodType === 'days') {
    multiplier = infectedByRequestedTime * popRatio * income;
    dollarsInFlight = multiplier / data.timeToElapse;
  } else if (data.periodType === 'weeks') {
    const time = data.timeToElapse * 7;
    multiplier = infectedByRequestedTime * popRatio * income;
    dollarsInFlight = multiplier / time;
  } else if (data.periodType === 'months') {
    const duration = data.timeToElapse * 30;
    multiplier = infectedByRequestedTime * popRatio * income;
    dollarsInFlight = multiplier / duration;
  }

  return Math.trunc(dollarsInFlight);
};

// time based
const casesByTime = (currentlyInfected, data) => {
  let cases;
  const duration = data.timeToElapse;
  if (data.periodType === 'days') {
    cases = currentlyInfected * (2 ** Math.trunc(duration / 3));
  } else if (data.periodType === 'weeks') {
    const time = duration * 7;
    cases = currentlyInfected * (2 ** Math.trunc(time / 3));
  } else if (data.periodType === 'months') {
    cases = currentlyInfected * (2 ** (duration * 10));
  }
  return Math.trunc(cases);
};

// available beds in hospital
const availableBedsByRequestedTime = (severeCasesByRequestedTime, data) => {
  let availableBeds;

  const estAvailableBeds = 0.35 * data.totalHospitalBeds;
  if (estAvailableBeds < severeCasesByRequestedTime) {
    availableBeds = estAvailableBeds - severeCasesByRequestedTime;
  } else {
    availableBeds = estAvailableBeds;
  }
  return Math.trunc(availableBeds);
};

// fn
const covid19ImpactEstimator = (data) => {
  const severeImpact = {};
  const impact = {};

  // 10 times reported cases best case
  impact.currentlyInfected = data.reportedCases * 10;
  // 50 times reported cases worst case
  severeImpact.currentlyInfected = data.reportedCases * 50;

  // infections by requested time
  impact.infectionsByRequestedTime = casesByTime(impact.currentlyInfected, data);
  severeImpact.infectionsByRequestedTime = casesByTime(severeImpact.currentlyInfected, data);

  // those that require hospitalization
  impact.severeCasesByRequestedTime = Math.trunc(0.15 * impact.infectionsByRequestedTime);
  const svr1 = severeImpact.infectionsByRequestedTime;
  severeImpact.severeCasesByRequestedTime = Math.trunc(0.15 * svr1);

  // 35% totalHospitalBeds are estimated to be available
  const svr2 = impact.severeCasesByRequestedTime;
  impact.hospitalBedsByRequestedTime = availableBedsByRequestedTime(svr2, data);
  const impact1 = severeImpact.severeCasesByRequestedTime;
  severeImpact.hospitalBedsByRequestedTime = availableBedsByRequestedTime(impact1, data);
  // 5% infectionsByRequestedTime are ICU cases
  impact.casesForICUByRequestedTime = Math.trunc(0.05 * impact.infectionsByRequestedTime);
  const impact2 = severeImpact.infectionsByRequestedTime;
  severeImpact.casesForICUByRequestedTime = Math.trunc(0.05 * impact2);
  // 2% infectionsByRequestedTime require ventilators
  impact.casesForVentilatorsByRequestedTime = Math.trunc(0.02 * impact.infectionsByRequestedTime);
  const infct = severeImpact.infectionsByRequestedTime;
  severeImpact.casesForVentilatorsByRequestedTime = Math.trunc(0.02 * infct);
  // amount of income lost due to illness
  impact.dollarsInFlight = moneyLost(impact.infectionsByRequestedTime, data);
  severeImpact.dollarsInFlight = moneyLost(severeImpact.infectionsByRequestedTime, data);

  return {
    data,
    impact,
    severeImpact,
  };
};


const controller = (req, res) => {
  let data;
  if (req.body !== undefined || null) {
    data = covid19ImpactEstimator(req.body);
    if (req.params.type === 'xml') {
      res.type('application/xml');
      return res.status(201).send(xmlBuilder.buildObject(data));
    }
    return res.status(201).json(data);
  }
  if (req.params.type === 'xml') {
    res.type('application/xml');
    return res.status(500).send(xmlBuilder.buildObject('invalid input'));
  }
  return res.status(500).json('invalid input');
};

// logger
const logger = (req, res) => {
  const readStream = fs.createReadStream(path.join(__dirname, 'logs.txt'));
  readStream.on('error', (error) => {
    return res.status(500).json(error);
  });
  readStream.on('open', () => {
    res.status(200);
    return readStream.pipe(res);
  });
};

const wildGet = (req, res) => {
  return res.status(200).json('your GET request did not match any path');
};

module.exports = {
  controller,
  logger,
  wildGet,
};
