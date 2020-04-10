const xml = require('xml2js');

const xmlBuilder = new xml.Builder();

// money lost due to workers being sick
const moneyLost = (infectedByRequestedTime, data) => {
  const income = data.region.avgDailyIncomeInUSD;
  const popRatio = data.region.avgDailyIncomePopulation;
  const dollarsInFlight = infectedByRequestedTime * popRatio * income * data.timeToElapse;
  return dollarsInFlight;
};

// time based
const casesByTime = (currentlyInfected, data) => {
  let cases;
  const duration = data.timeToElapse;
  if (data.periodType === 'days') {
    cases = currentlyInfected * (2 ** Math.floor(duration / 3));
  } else if (data.periodType === 'weeks') {
    cases = currentlyInfected * (2 ** Math.floor((duration * 7) / 3));
  } else if (data.periodType === 'months') {
    cases = currentlyInfected * (2 ** Math.floor((duration * 30) / 3));
  }
  return cases;
};

// available beds in hospital
const availableBedsByRequestedTime = (severeCasesByRequestedTime, data) => {
  let availableBeds;

  const estAvailableBeds = Math.floor(0.35 * data.totalHospitalBeds);
  if (estAvailableBeds < severeCasesByRequestedTime) {
    availableBeds = estAvailableBeds - severeCasesByRequestedTime;
  } else {
    availableBeds = estAvailableBeds;
  }
  return availableBeds;
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
  impact.severeCasesByRequestedTime = Math.floor(0.15 * impact.infectionsByRequestedTime);
  severeImpact.severeCasesByRequestedTime = Math.floor(0.15 * severeImpact.infectionsByRequestedTime);

  // 35% totalHospitalBeds are estimated to be available
  impact.hospitalBedsByRequestedTime = availableBedsByRequestedTime(impact.severeCasesByRequestedTime, data);
  severeImpact.hospitalBedsByRequestedTime = availableBedsByRequestedTime(severeImpact.severeCasesByRequestedTime, data);
  // 5% infectionsByRequestedTime are ICU cases
  impact.casesForICUByRequestedTime = Math.floor(0.05 * impact.infectionsByRequestedTime);
  severeImpact.casesForICUByRequestedTime = Math.floor(0.05 * severeImpact.infectionsByRequestedTime);
  // 2% infectionsByRequestedTime require ventilators
  impact.casesForVentilatorsByRequestedTime = Math.floor(0.02 * impact.infectionsByRequestedTime);
  severeImpact.casesForVentilatorsByRequestedTime = Math.floor(0.02 * severeImpact.infectionsByRequestedTime);
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
      res.set('Content-Type', 'text/xml');
      return res.status(201).send(xmlBuilder.buildObject(data));
    }

    return res.status(201).json(data);
  }
  if (req.params.type === 'xml') {
    res.set('Content-Type', 'text/xml');
    return res.status(500).send(xmlBuilder.buildObject('invalid input'));
  }

  return res.status(500).json('invalid input');
};

module.exports = {
  controller,
};
