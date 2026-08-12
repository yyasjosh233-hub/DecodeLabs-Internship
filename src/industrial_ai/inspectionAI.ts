/**
 * Industrial AI - Inspection & Defect Classification Module
 * Computer Vision quality inspection AI evaluator for industrial parts
 * (Gears, Bolts, PCBs, Machined Surface Plates).
 */

export interface InspectionDefect {
  defectId: string;
  type: 'CRACK' | 'CORROSION' | 'DIMENSIONAL_OUT_OF_TOLERANCE' | 'SURFACE_SCRATCH' | 'MISSING_FEATURE';
  severity: 'MINOR' | 'MAJOR' | 'CRITICAL';
  locationPixel: [number, number];
  areaMm2: number;
  confidenceScore: number;
}

export interface DefectClassificationResult {
  inspectionId: string;
  partCategory: 'Gear' | 'Bolt' | 'PCB' | 'Surface Plate';
  overallStatus: 'PASS' | 'FAIL';
  qualityConfidence: number; // 0.0 to 1.0
  defectsDetected: InspectionDefect[];
  telecentricMeasurementMm: {
    outerDiameter: number;
    innerDiameter: number;
    concentricityErrorMm: number;
    pitchCircleMm: number;
  };
  stageExecutionTimesMs: Record<string, number>;
}

export class InspectionAIClassifier {
  /**
   * Evaluates part quality metrics and stage features to produce final PASS/FAIL classification.
   */
  public static classifyInspection(
    partCategory: DefectClassificationResult['partCategory'],
    defects: InspectionDefect[],
    concentricityErrorMm: number
  ): { status: 'PASS' | 'FAIL'; confidence: number; summary: string } {
    let hasCritical = false;
    let hasMajor = false;
    let totalScore = 1.0;

    for (const d of defects) {
      if (d.severity === 'CRITICAL') {
        hasCritical = true;
        totalScore -= 0.45;
      } else if (d.severity === 'MAJOR') {
        hasMajor = true;
        totalScore -= 0.25;
      } else {
        totalScore -= 0.08;
      }
    }

    if (concentricityErrorMm > 0.15) {
      totalScore -= 0.3;
    }

    const confidence = Number(Math.max(0.05, Math.min(0.99, totalScore)).toFixed(3));
    const status: 'PASS' | 'FAIL' = (hasCritical || hasMajor || concentricityErrorMm > 0.15 || confidence < 0.70) ? 'FAIL' : 'PASS';

    let summary = `${partCategory} passed 15-stage inspection with high confidence (${(confidence * 100).toFixed(1)}%). Zero critical defects detected.`;
    if (status === 'FAIL') {
      summary = `${partCategory} REJECTED: ${defects.length} defect(s) detected. Concentricity error = ${concentricityErrorMm.toFixed(3)}mm (tolerance limit 0.150mm).`;
    }

    return { status, confidence, summary };
  }
}
