/**
 * Report Validation Middleware - AUREX Civic Issue Reporting System
 *
 * Validates category-specific report details and incident date/time.
 */

const categoryFieldRules = {
  roads: ['problemType', 'roadName', 'landmark', 'damageSize', 'accidentRisk'],
  water_supply: ['issueType', 'areaName', 'duration', 'waterQuality'],
  electricity: ['issueType', 'areaName', 'poleNumber', 'duration', 'dangerous'],
  sanitation: ['issueType', 'areaName', 'smellLevel', 'healthRisk'],
  garbage: ['garbageType', 'areaName', 'collectionDelayDays', 'spreading'],
  streetlights: ['poleNumber', 'lightCondition', 'areaName', 'sinceWhen'],
  public_transport: ['transportType', 'vehicleNumber', 'route', 'stopName', 'incidentTime', 'issueType'],
  parks: ['parkName', 'issueType', 'areaName', 'safetyConcern'],
  noise_pollution: ['noiseSource', 'timeOfDay', 'duration', 'areaName'],
  air_pollution: ['pollutionSource', 'areaName', 'breathingDifficulty'],
  illegal_construction: ['constructionType', 'location', 'blockingPublicPath', 'sinceWhen'],
  traffic: ['issueType', 'roadName', 'peakTime', 'accidentRisk'],
  safety: ['issueType', 'location', 'time', 'emergencyLevel'],
  healthcare: ['facilityName', 'issueType', 'areaName', 'emergency'],
  education: ['institutionName', 'issueType', 'areaName'],
  other: ['customIssueType', 'areaName', 'additionalDetails']
};

const parseJsonObject = (value) => {
  if (!value) return {};
  if (typeof value === 'object') return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
      return {};
    }
  }
  return {};
};

const isEmptyValue = (value) => {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  return false;
};

const validateCategoryDetails = (category, details = {}) => {
  const requiredFields = categoryFieldRules[category];
  if (!requiredFields || requiredFields.length === 0) return [];
  return requiredFields.filter((field) => isEmptyValue(details[field]));
};

exports.validateReportPayload = (req, res, next) => {
  const { category, incidentAt } = req.body;

  if (incidentAt) {
    const parsedIncidentAt = new Date(incidentAt);
    if (Number.isNaN(parsedIncidentAt.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid date and time'
      });
    }
    req.body.incidentAt = parsedIncidentAt;
  }

  if (category) {
    const parsedCategoryDetails = parseJsonObject(req.body.categoryDetails);
    req.body.categoryDetails = parsedCategoryDetails;
    const missingFields = validateCategoryDetails(category, parsedCategoryDetails);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Please provide required category details: ${missingFields.join(', ')}`
      });
    }
  }

  next();
};

