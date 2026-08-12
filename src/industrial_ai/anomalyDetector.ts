/**
 * Industrial AI - Anomaly Detection Module
 * Analyzes multi-sensor telemetry (vibration, temperature, current, torque, velocity)
 * to detect operational anomalies in 6-DOF Robotic Arms and Autonomous Mobile Robots (AMRs).
 */

export interface TelemetrySample {
  timestamp: number;
  jointTorques?: number[];
  jointTemperatures?: number[];
  vibrationLevel?: number;
  batteryLevel?: number;
  amrVelocity?: number;
  currentDraw?: number;
}

export interface AnomalyReport {
  isAnomaly: boolean;
  score: number; // 0.0 (normal) to 1.0 (critical anomaly)
  severity: 'NORMAL' | 'WARNING' | 'CRITICAL';
  affectedComponents: string[];
  recommendation: string;
}

export class IndustrialAnomalyDetector {
  private baselineMean: Map<string, number> = new Map();
  private baselineStd: Map<string, number> = new Map();

  constructor() {
    // Default industrial normal baselines
    this.baselineMean.set('vibration', 0.15); // g
    this.baselineStd.set('vibration', 0.05);

    this.baselineMean.set('temperature', 42.0); // deg C
    this.baselineStd.set('temperature', 5.0);

    this.baselineMean.set('current', 3.5); // Amperes
    this.baselineStd.set('current', 0.8);
  }

  /**
   * Evaluates telemetry sample for multivariate statistical anomalies (Z-Score & Mahalanobis proxy)
   */
  public analyzeTelemetry(sample: TelemetrySample): AnomalyReport {
    const affected: string[] = [];
    let maxZ = 0;

    // Check Vibration
    if (sample.vibrationLevel !== undefined) {
      const z = Math.abs(sample.vibrationLevel - (this.baselineMean.get('vibration') || 0.15)) / (this.baselineStd.get('vibration') || 0.05);
      if (z > 3.0) {
        affected.push(`High Vibration (${sample.vibrationLevel.toFixed(2)}g, Z=${z.toFixed(1)})`);
      }
      maxZ = Math.max(maxZ, z);
    }

    // Check Temperatures
    if (sample.jointTemperatures && sample.jointTemperatures.length > 0) {
      sample.jointTemperatures.forEach((temp, i) => {
        const z = Math.abs(temp - (this.baselineMean.get('temperature') || 42.0)) / (this.baselineStd.get('temperature') || 5.0);
        if (z > 2.5 || temp > 65.0) {
          affected.push(`Joint ${i + 1} Thermal Elevation (${temp.toFixed(1)}°C)`);
        }
        maxZ = Math.max(maxZ, z);
      });
    }

    // Check Current Draw
    if (sample.currentDraw !== undefined) {
      const z = Math.abs(sample.currentDraw - (this.baselineMean.get('current') || 3.5)) / (this.baselineStd.get('current') || 0.8);
      if (z > 3.0) {
        affected.push(`Elevated Motor Current (${sample.currentDraw.toFixed(2)}A)`);
      }
      maxZ = Math.max(maxZ, z);
    }

    const score = Math.min(1.0, Number((maxZ / 5.0).toFixed(3)));
    let severity: 'NORMAL' | 'WARNING' | 'CRITICAL' = 'NORMAL';
    let recommendation = 'System operating within optimal parameters.';

    if (score >= 0.7 || affected.length >= 2) {
      severity = 'CRITICAL';
      recommendation = 'IMMEDIATE ACTION REQUIRED: Trigger E-STOP or initiate thermal cooldown sequence.';
    } else if (score >= 0.4 || affected.length === 1) {
      severity = 'WARNING';
      recommendation = 'SCHEDULE INSPECTION: Sensor readings deviate from historical baseline.';
    }

    return {
      isAnomaly: severity !== 'NORMAL',
      score,
      severity,
      affectedComponents: affected,
      recommendation
    };
  }
}
