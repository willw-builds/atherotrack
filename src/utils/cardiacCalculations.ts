import { LipidClassification, NutritionTargets, TargetPreset } from '../types';

export const TARGET_PRESETS: Record<TargetPreset, { title: string; subtitle: string; targets: NutritionTargets }> = {
  aha_high_risk: {
    title: 'AHA High-Risk / Existing CVD',
    subtitle: 'Strict cardioprotective limits: <200mg cholesterol, <11g (5%) saturated fat, high soluble fiber.',
    targets: {
      preset: 'aha_high_risk',
      maxCholesterolMg: 200,
      maxSaturatedFatG: 11,
      maxTransFatG: 0,
      minSolubleFiberG: 12,
      minTotalFiberG: 32,
      maxSodiumMg: 1500,
      targetCalories: 2000,
    },
  },
  standard_adult: {
    title: 'Standard Prevention (Adult)',
    subtitle: 'General population guidelines: <300mg cholesterol, <15g (7%) saturated fat, 10g soluble fiber.',
    targets: {
      preset: 'standard_adult',
      maxCholesterolMg: 300,
      maxSaturatedFatG: 15,
      maxTransFatG: 0,
      minSolubleFiberG: 10,
      minTotalFiberG: 28,
      maxSodiumMg: 2000,
      targetCalories: 2000,
    },
  },
  mediterranean: {
    title: 'Mediterranean Heart Shield',
    subtitle: 'Plant-forward & healthy oils: <180mg cholesterol, <12g saturated fat, 14g soluble fiber, rich in MUFA/PUFA.',
    targets: {
      preset: 'mediterranean',
      maxCholesterolMg: 180,
      maxSaturatedFatG: 12,
      maxTransFatG: 0,
      minSolubleFiberG: 14,
      minTotalFiberG: 35,
      maxSodiumMg: 1800,
      targetCalories: 2000,
    },
  },
  custom: {
    title: 'Customized Protocol',
    subtitle: 'Custom target thresholds tailored by your cardiologist or dietitian.',
    targets: {
      preset: 'custom',
      maxCholesterolMg: 200,
      maxSaturatedFatG: 13,
      maxTransFatG: 0,
      minSolubleFiberG: 10,
      minTotalFiberG: 30,
      maxSodiumMg: 2000,
      targetCalories: 2000,
    },
  },
};

/**
 * Classifies a blood lipid panel according to NCEP ATP III and AHA guidelines
 */
export function classifyLipidPanel(
  totalCholesterol: number,
  ldl: number,
  hdl: number,
  triglycerides: number
): LipidClassification {
  const nonHdl = Math.max(0, totalCholesterol - hdl);
  const totalToHdlRatio = hdl > 0 ? Number((totalCholesterol / hdl).toFixed(2)) : 0;

  // Total Cholesterol
  let total: 'optimal' | 'borderline' | 'high' = 'optimal';
  if (totalCholesterol >= 240) total = 'high';
  else if (totalCholesterol >= 200) total = 'borderline';

  // LDL Cholesterol
  let ldlClass: 'optimal' | 'near-optimal' | 'borderline' | 'high' | 'very-high' = 'optimal';
  if (ldl >= 190) ldlClass = 'very-high';
  else if (ldl >= 160) ldlClass = 'high';
  else if (ldl >= 130) ldlClass = 'borderline';
  else if (ldl >= 100) ldlClass = 'near-optimal';

  // HDL Cholesterol
  let hdlClass: 'low' | 'normal' | 'optimal' = 'normal';
  if (hdl >= 60) hdlClass = 'optimal';
  else if (hdl < 40) hdlClass = 'low';

  // Triglycerides
  let trigClass: 'normal' | 'borderline' | 'high' | 'very-high' = 'normal';
  if (triglycerides >= 500) trigClass = 'very-high';
  else if (triglycerides >= 200) trigClass = 'high';
  else if (triglycerides >= 150) trigClass = 'borderline';

  // Ratio
  let ratioStatus: 'ideal' | 'normal' | 'elevated' = 'normal';
  if (totalToHdlRatio < 3.5) ratioStatus = 'ideal';
  else if (totalToHdlRatio > 4.5) ratioStatus = 'elevated';

  return {
    total,
    ldl: ldlClass,
    hdl: hdlClass,
    triglycerides: trigClass,
    nonHdl,
    totalToHdlRatio,
    ratioStatus,
  };
}

/**
 * Calculates daily AtheroRisk index (0 to 100).
 * 0-25: Heart Shield (Optimal cardioprotective)
 * 26-50: Balanced (Mild risk)
 * 51-75: Elevated (Noticeable risk factors)
 * 76-100: Critical Atherogenic Load
 */
export function calculateAtheroRiskScore(
  cholesterolMg: number,
  satFatG: number,
  transFatG: number,
  solubleFiberG: number,
  targets: NutritionTargets
): {
  score: number;
  level: 'optimal' | 'moderate' | 'elevated' | 'critical';
  label: string;
  advice: string;
} {
  // Base risk points from Saturated Fat (up to 40 pts)
  const satFatRatio = satFatG / Math.max(1, targets.maxSaturatedFatG);
  const satFatPoints = Math.min(45, satFatRatio * 25);

  // Risk points from Dietary Cholesterol (up to 30 pts)
  const cholRatio = cholesterolMg / Math.max(1, targets.maxCholesterolMg);
  const cholPoints = Math.min(35, cholRatio * 20);

  // Risk points from Trans Fat (immediate 20 pts per gram)
  const transFatPoints = Math.min(25, transFatG * 20);

  // Soluble Fiber Protective Offset (subtracts up to 25 pts)
  const fiberProtection = Math.min(25, (solubleFiberG / Math.max(1, targets.minSolubleFiberG)) * 25);

  const rawScore = satFatPoints + cholPoints + transFatPoints - fiberProtection;
  const score = Math.max(0, Math.min(100, Math.round(rawScore + 10))); // baseline 10

  if (score <= 30) {
    return {
      score,
      level: 'optimal',
      label: 'Optimal Cardioprotection',
      advice: 'Outstanding! Low saturated fat with strong soluble fiber buffers LDL uptake and promotes reverse cholesterol transport.',
    };
  } else if (score <= 55) {
    return {
      score,
      level: 'moderate',
      label: 'Moderate Atherogenic Load',
      advice: 'Fair balance. Consider boosting soluble fiber (oats, legumes, chia) or swapping 1 saturated fat source for cold-pressed olive oil.',
    };
  } else if (score <= 75) {
    return {
      score,
      level: 'elevated',
      label: 'Elevated Atherogenic Risk',
      advice: 'Dietary cholesterol or saturated fat is approaching or above the threshold. Check for egg yolks, butter, or fatty meats.',
    };
  } else {
    return {
      score,
      level: 'critical',
      label: 'Critical Lipid Surge',
      advice: 'Intake exceeds high-risk cardiovascular limits. Increase water and soluble fiber today to bind digestive bile and dietary lipids.',
    };
  }
}
