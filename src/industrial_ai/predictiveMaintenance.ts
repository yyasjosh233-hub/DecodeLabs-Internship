/**
 * Industrial AI - Predictive Maintenance Engine
 * Calculates Remaining Useful Life (RUL), component wear indices,
 * and preventive maintenance schedules based on operating cycles & thermal stress.
 */

export interface ComponentHealth {
  componentId: string;
  name: string;
  wearPercentage: number; // 0% (new) to 100% (failed)
  estimatedRULHours: number; // Remaining Useful Life in hours
  status: 'EXCELLENT' | 'GOOD' | 'ATTENTION' | 'CRITICAL';
  nextMaintenanceDate: string;
}

export interface RobotHealthSummary {
  overallHealthScore: number; // 0 to 100
  components: ComponentHealth[];
  recommendedAction: string;
}

export class PredictiveMaintenanceEngine {
  /**
   * Calculates joint bearing and motor health based on operating cycles, average payload, and thermal exposure.
   */
  public static evaluateRobotHealth(
    operatingHours: number,
    totalCycles: number,
    avgPayloadKg: number,
    peakTemperatureC: number
  ): RobotHealthSummary {
    // Base wear factors
    const payloadFactor = Math.pow(avgPayloadKg / 5.0, 1.5); // normalized against 5kg rated load
    const tempFactor = Math.exp((peakTemperatureC - 40) / 20.0); // thermal stress exponent
    const cycleFactor = totalCycles / 1000000; // normalized against 1M cycles MTBF

    const joint1Wear = Math.min(99, Math.round((operatingHours / 5000) * 100 * payloadFactor * (1 + cycleFactor) * 0.8));
    const joint2Wear = Math.min(99, Math.round((operatingHours / 4000) * 100 * payloadFactor * 1.1));
    const joint3Wear = Math.min(99, Math.round((operatingHours / 4500) * 100 * payloadFactor * 1.0));
    const wristWear = Math.min(99, Math.round((operatingHours / 6000) * 100 * tempFactor * 0.7));

    const buildComp = (id: string, name: string, wear: number, baseLifeHrs: number): ComponentHealth => {
      const remainingLife = Math.max(0, Math.round(baseLifeHrs * (1 - wear / 100)));
      let status: ComponentHealth['status'] = 'EXCELLENT';
      if (wear >= 85) status = 'CRITICAL';
      else if (wear >= 65) status = 'ATTENTION';
      else if (wear >= 35) status = 'GOOD';

      const daysRemaining = Math.max(1, Math.round(remainingLife / 16)); // 16 hrs/day operation
      const maintDate = new Date(Date.now() + daysRemaining * 86400000).toISOString().split('T')[0];

      return {
        componentId: id,
        name,
        wearPercentage: wear,
        estimatedRULHours: remainingLife,
        status,
        nextMaintenanceDate: maintDate
      };
    };

    const components: ComponentHealth[] = [
      buildComp('J1-GEAR', 'Joint 1 Harmonic Drive Gearbox', joint1Wear, 5000),
      buildComp('J2-MOTOR', 'Joint 2 Brushless Servo Motor', joint2Wear, 4000),
      buildComp('J3-BEARING', 'Joint 3 Main Arm Bearing', joint3Wear, 4500),
      buildComp('WRIST-ASSY', 'Wrist Assembly (J4-J6)', wristWear, 6000),
    ];

    const avgWear = components.reduce((acc, c) => acc + c.wearPercentage, 0) / components.length;
    const overallHealthScore = Math.max(0, Math.round(100 - avgWear));

    let recommendedAction = 'Continue routine operation. Next inspection per standard maintenance schedule.';
    if (overallHealthScore < 40) {
      recommendedAction = 'URGENT: Schedule component replacement during upcoming maintenance window.';
    } else if (overallHealthScore < 70) {
      recommendedAction = 'ADVISORY: Inspect Joint 2 motor lubricant and wrist assembly seals within 100 operating hours.';
    }

    return {
      overallHealthScore,
      components,
      recommendedAction
    };
  }
}
