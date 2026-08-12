/**
 * Industrial AI - Natural Language Assistant & Prompt Processor
 * High-performance, secure NLP engine for industrial automation query parsing.
 */

export interface ParsedIndustrialCommand {
  intent: 'INSPECT_PART' | 'PLAN_ROBOT_PATH' | 'NAVIGATE_AMR' | 'GET_TELEMETRY' | 'SAFETY_ESTOP' | 'UNKNOWN';
  targetComponent?: string;
  coordinates?: { x: number; y: number; z?: number };
  parameters: Record<string, string | number | boolean>;
  confidence: number;
  securityClean: boolean;
}

export class IndustrialAIAssistantEngine {
  private static injectionPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /DROP TABLE/gi,
    /DELETE FROM/gi,
    /SYSTEM_OVERRIDE/gi,
    /DISABLE_SAFETY_LIMITS/gi
  ];

  /**
   * Sanitizes input prompt and extracts intent and entities safely.
   */
  public static parseUserPrompt(prompt: string): ParsedIndustrialCommand {
    let cleanPrompt = prompt;
    let securityClean = true;

    // Check prompt security
    for (const pattern of this.injectionPatterns) {
      if (pattern.test(prompt)) {
        securityClean = false;
        cleanPrompt = cleanPrompt.replace(pattern, '[REDACTED_SECURITY_THREAT]');
      }
    }

    const lower = cleanPrompt.toLowerCase();

    // Safety E-Stop check
    if (lower.includes('estop') || lower.includes('e-stop') || lower.includes('emergency stop') || lower.includes('halt')) {
      return {
        intent: 'SAFETY_ESTOP',
        parameters: { action: 'TRIGGER_ESTOP' },
        confidence: 0.99,
        securityClean
      };
    }

    // Inspect Part
    if (lower.includes('inspect') || lower.includes('defect') || lower.includes('quality') || lower.includes('gear') || lower.includes('bolt')) {
      return {
        intent: 'INSPECT_PART',
        targetComponent: lower.includes('gear') ? 'Gear' : lower.includes('bolt') ? 'Bolt' : 'General Industrial Component',
        parameters: { runPipeline: true, stageCount: 15 },
        confidence: 0.95,
        securityClean
      };
    }

    // Plan Robot Path
    if (lower.includes('kinematics') || lower.includes('robot arm') || lower.includes('trajectory') || lower.includes('ik') || lower.includes('fk')) {
      return {
        intent: 'PLAN_ROBOT_PATH',
        targetComponent: 'Industrial 6-DOF Manipulator',
        parameters: { solver: 'DampedLeastSquares', selfCollisionCheck: true },
        confidence: 0.92,
        securityClean
      };
    }

    // AMR Navigation
    if (lower.includes('navigate') || lower.includes('amr') || lower.includes('lidar') || lower.includes('costmap') || lower.includes('pathfinding')) {
      return {
        intent: 'NAVIGATE_AMR',
        targetComponent: 'Differential Drive AMR',
        parameters: { planner: 'AStarManhattan', ekfFusion: true },
        confidence: 0.94,
        securityClean
      };
    }

    return {
      intent: 'UNKNOWN',
      parameters: { rawText: cleanPrompt },
      confidence: 0.35,
      securityClean
    };
  }
}
