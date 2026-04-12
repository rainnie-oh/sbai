/*
Style reminder for this file:
- Data and calculation layer for a 16Personalities-inspired experience.
- Keep the logic clean, deterministic, and easy to replace when the final copy changes.
- All editable text and mapping rules live in standalone JSON files.
*/

import personalitiesJson from "@/data/personality-types.json";
import questionsJson from "@/data/questions.json";
import scoringRulesJson from "@/data/scoring-rules.json";
import siteCopyJson from "@/data/site-copy.json";

export type PoleKey = "F" | "A" | "D" | "S" | "C" | "E" | "P" | "V";

export interface AxisMeta {
  id: string;
  left: {
    key: PoleKey;
    label: string;
    labelZh: string;
    description: string;
  };
  right: {
    key: PoleKey;
    label: string;
    labelZh: string;
    description: string;
  };
  defaultTie: PoleKey;
}

export interface QuizOption {
  id: string;
  label: string;
  effects: Partial<Record<PoleKey, number>>;
}

export interface QuizQuestion {
  id: number;
  axis: string;
  prompt: string;
  options: QuizOption[];
}

export interface PersonalityIllustration {
  skin: string;
  hair: string;
  jacket: string;
  shirt: string;
  pants: string;
  shoe: string;
  pose: string;
  prop: string;
}

export interface PersonalityType {
  type: string;
  code: string;
  nameZh: string;
  nameEn: string;
  camp: string;
  campKey: string;
  subtitle: string;
  tagline: string;
  description: string;
  why: string;
  strengths: string[];
  risks: string[];
  palette: {
    accent: string;
    soft: string;
    ink: string;
  };
  illustration: PersonalityIllustration;
  innateAIName: string;
  innateAIDescription: string;
}

export interface SiteCopy {
  brand: {
    name: string;
    tagline: string;
    legalNote: string;
  };
  nav: Array<{ label: string; href: string }>;
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    stats: Array<{ label: string; value: string }>;
  };
  about: {
    title: string;
    description: string;
  };
  dimensionsIntro: {
    title: string;
    description: string;
  };
  typesIntro: {
    title: string;
    description: string;
  };
  editor: {
    title: string;
    description: string;
    goodTitle: string;
    good: string[];
    badTitle: string;
    bad: string[];
    sourceTitle: string;
    sources: Array<{ label: string; path: string }>;
    exampleTitle: string;
    exampleQuestion: {
      prompt: string;
      options: string[];
    };
  };
  quiz: {
    title: string;
    intro: string;
    nextLabel: string;
    restartLabel: string;
    submitLabel: string;
    progressLabel: string;
  };
  loading: {
    title: string;
    lines: string[];
  };
  result: {
    shareLabel: string;
    downloadLabel: string;
    downloadAvatarLabel: string;
    retakeLabel: string;
    axisTitle: string;
    whyTitle: string;
    combinationTitle: string;
    shareText: string;
  };
}

export const questions = questionsJson as QuizQuestion[];
export const personalities = personalitiesJson as PersonalityType[];
export const siteCopy = siteCopyJson as SiteCopy;
export const scoringRules = scoringRulesJson as {
  version: number;
  axes: AxisMeta[];
  questionsPerAxis: string;
  optionScoreRule: string;
  resolutionRule: Record<string, string>;
  codeOrder: string[];
  mapping: Record<string, string | string[]>;
  secondaryRules: Record<string, { description: string; logic: string }>;
};

export const poleOrder: PoleKey[] = ["F", "A", "D", "S", "C", "E", "P", "V"];

export const campMeta: Record<
  string,
  { label: string; color: string; soft: string; description: string }
> = {
  exploiters: {
    label: "算力资本家",
    color: "#8f77c6",
    soft: "#f0e9fb",
    description: "把 AI 当生产力资产来盘的人，熟悉订阅、额度、ROI 和效率幻觉。",
  },
  trainers: {
    label: "AI调教师",
    color: "#4ca8af",
    soft: "#e4f4f3",
    description: "控制感比结果更重要。和 AI 互动，本质上是在做一场漫长的调教。",
  },
  empaths: {
    label: "情感共生体",
    color: "#78b56e",
    soft: "#edf8e8",
    description: "愿意把情绪、困惑和软弱交给 AI 暂存，边界通常也跟着一起变软。",
  },
  makers: {
    label: "赛博造物主",
    color: "#d1a24d",
    soft: "#fbf2de",
    description: "把 AI 当灵感触发器、节目效果放大器，结果有时惊艳，有时事故。",
  },
};

export const groupedPersonalities = Object.entries(campMeta).map(([key, meta]) => ({
  key,
  meta,
  items: personalities.filter((item) => item.campKey === key),
}));

export interface AxisResult {
  axisId: string;
  label: string;
  leftKey: PoleKey;
  rightKey: PoleKey;
  leftLabel: string;
  rightLabel: string;
  leftDescription: string;
  rightDescription: string;
  leftScore: number;
  rightScore: number;
  leftPercent: number;
  rightPercent: number;
  winner: PoleKey;
}

export interface QuizResult {
  code: string;
  personality: PersonalityType;
  axes: AxisResult[];
  totals: Record<PoleKey, number>;
}

/**
 * Secondary differentiation for groups that share the same 4-letter code.
 * Uses specific question answers to disambiguate within a group.
 */
function resolveSecondary(code: string, answers: Record<number, string>): string {
  // Map various result codes to the groups defined in secondaryRules
  const groupKey = (() => {
    if (["ASCP", "ASCE", "ASCV"].includes(code)) return "ASCP";
    if (["ADCP", "ADCE", "ADEP"].includes(code)) return "ADCP";
    if (["ASEV", "ASEP", "FSEV"].includes(code)) return "ASEV";
    if (["FDCV", "FSCV", "FDEV"].includes(code)) return "FDCV";
    if (["FDCP"].includes(code)) return "FDCP";
    return code;
  })();

  switch (groupKey) {
    case "ASCP": {
      // 企业吸血鬼 vs 复制粘贴侠 vs 一人公司CEO
      if (answers[6] === "c") return "SOLO";
      if (answers[2] === "c" || answers[11] === "c") return "LAZY";
      if (answers[1] === "c" || answers[10] === "b") return "RICH";
      return "RICH"; // default
    }
    case "ADCP": {
      // PUA大师 vs 人形AI vs 职业杠精
      if (answers[3] === "a") return "SPEC";
      if (answers[2] === "a" || answers[11] === "a") return "PUAA";
      return "ANTI"; // default
    }
    case "ASEV": {
      // 心碎小狗 vs 命理大师 vs 电子妈宝
      if (answers[18] === "a") return "MING";
      if (answers[7] === "c" && answers[12] === "c") return "LOVE";
      if (answers[18] === "c") return "BABY";
      return "LOVE"; // default
    }
    case "FDCV": {
      // 意识流艺术家 vs 乐子人
      if (answers[9] === "c" || answers[16] === "c") return "MEME";
      return "MUSE"; // default
    }
    case "FDCP": {
      // 提示词诗人 vs 蒸馏大师
      if (answers[13] === "a") return "DIST";
      return "PROMPT"; // default
    }
    default:
      return "";
  }
}

export function calculateQuizResult(responses: any): QuizResult {
  const totals = Object.fromEntries(poleOrder.map((key) => [key, 0])) as Record<PoleKey, number>;

  // Sum up effects from each response
  for (const question of questions) {
    // Ensure we handle both numeric and string keys
    const answerId = responses[question.id] || responses[String(question.id)];
    if (!answerId) continue;

    const option = question.options.find((item: any) => item.id === answerId);
    if (!option || !option.effects) continue;

    for (const [key, value] of Object.entries(option.effects) as Array<[PoleKey, number]>) {
      if (totals.hasOwnProperty(key)) {
        totals[key] += value;
      }
    }
  }

  // Calculate winner for each axis in order
  const axisResults: AxisResult[] = scoringRules.axes.map((axis) => {
    const leftKey = axis.left.key;
    const rightKey = axis.right.key;
    const leftScore = totals[leftKey] || 0;
    const rightScore = totals[rightKey] || 0;
    const total = leftScore + rightScore || 1;

    let winner: PoleKey;
    if (leftScore === 0 && rightScore === 0) {
      winner = axis.defaultTie;
    } else if (leftScore >= rightScore) {
      winner = leftKey;
    } else {
      winner = rightKey;
    }

    return {
      axisId: axis.id,
      label: `${axis.left.labelZh} / ${axis.right.labelZh}`,
      leftKey,
      rightKey,
      leftLabel: axis.left.labelZh,
      rightLabel: axis.right.labelZh,
      leftDescription: axis.left.description,
      rightDescription: axis.right.description,
      leftScore,
      rightScore,
      leftPercent: Math.round((leftScore / total) * 100),
      rightPercent: Math.round((rightScore / total) * 100),
      winner,
    };
  });

  // Sort axes by codeOrder and join winners to form a 4-letter code
  const code = scoringRules.codeOrder
    .map((axisId) => {
      const axisRes = axisResults.find((a) => a.axisId === axisId);
      return axisRes ? axisRes.winner : "";
    })
    .join("");

  // Look up in mapping — may be a single string or an array (requires secondary differentiation)
  const mappingValue = (scoringRules.mapping as Record<string, any>)[code];
  let personalityKey: string;

  if (Array.isArray(mappingValue)) {
    personalityKey = resolveSecondary(code, responses);
  } else if (typeof mappingValue === "string") {
    personalityKey = mappingValue;
  } else {
    // Fallback: if code is unknown, try to find a personality with the same code string
    const fallback = personalities.find((p) => p.code === code);
    personalityKey = fallback ? fallback.type : personalities[0].type;
  }

  const personality =
    personalities.find((p) => p.type === personalityKey) || personalities[0];

  return {
    code,
    personality,
    axes: axisResults,
    totals,
  };
}

/**
 * Find 2-3 similar personalities based on camp and dimension distance.
 */
export function getSimilarPersonalities(
  current: PersonalityType,
  all: PersonalityType[],
  limit: number = 3,
): PersonalityType[] {
  return all
    .filter((p) => p.type !== current.type) // Exclude current
    .map((p) => {
      let score = 0;

      // Rule 1: Same Camp (High priority)
      if (p.campKey === current.campKey) {
        score += 10;
      }

      // Rule 2: Hamming Distance (Similarity between 4-letter codes)
      const currentCode = current.code;
      const otherCode = p.code;
      for (let i = 0; i < 4; i++) {
        if (currentCode[i] === otherCode[i]) {
          score += 5;
        }
      }

      return { personality: p, score };
    })
    .sort((a, b) => b.score - a.score) // Sort by descending score
    .slice(0, limit)
    .map((item) => item.personality);
}

/**
 * Get the descriptive traits for each axis of a personality based on its 4-letter code.
 */
export function getPersonalityPoles(code: string) {
  return scoringRules.axes.map((axis, index) => {
    const winnerKey = code[index] as PoleKey;
    const isLeft = axis.left.key === winnerKey;
    const pole = isLeft ? axis.left : axis.right;
    
    return {
      axisId: axis.id,
      label: axis.id === "economy" ? "消费观" : 
             axis.id === "control" ? "控制欲" : 
             axis.id === "emotion" ? "情感值" : "创作力",
      winnerLabel: pole.labelZh,
      description: pole.description,
      isLeft,
      percent: 100 // Visual only for the meter
    };
  });
}

