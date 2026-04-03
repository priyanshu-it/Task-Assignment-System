import { Task, TeamMember, MatchResult } from "./types";

/**
 * Local function to analyze task-member matching without AI.
 * Returns an array of MatchResult objects, fully matching AI JSON format.
 */
export const getMatchingAnalysis = async (
  task: Task,
  members: TeamMember[]
): Promise<MatchResult[]> => { // ⏱ 3 seconds
  await new Promise(resolve => setTimeout(resolve, 3000));

  return members
    .map(member => {
      // ----------------------------
      // 1️⃣ Skill Match Calculation
      // ----------------------------
      const requiredSkills = task.requiredSkills;
      const memberSkills = member.skills;

      let matchedSkillsCount = 0;

      requiredSkills.forEach(reqSkill => {
        const found = memberSkills.find(
          s =>
            s.name.toLowerCase() === reqSkill.name.toLowerCase() &&
            s.level >= reqSkill.level
        );
        if (found) matchedSkillsCount++;
      });

      const skillMatch =
        requiredSkills.length > 0
          ? Math.round((matchedSkillsCount / requiredSkills.length) * 100)
          : 100;

      // ❌ Skip members with no matching skills
      if (requiredSkills.length > 0 && matchedSkillsCount === 0) return null;

      // ----------------------------
      // 2️⃣ Workload Fit Calculation
      // ----------------------------
      const workloadFit = Math.max(0, 100 - member.workload);

      // ❌ Skip members with 0% availability
      if (workloadFit === 0) return null;

      // ----------------------------
      // 3️⃣ Overall Match Score
      // ----------------------------
      const matchScore = Math.round(skillMatch * 0.7 + workloadFit * 0.3);

      // ❌ Skip 0% matches
      if (matchScore === 0) return null;

      // ----------------------------
      // 4️⃣ Reasoning
      // ----------------------------
      const reasoningParts: string[] = [];

      if (requiredSkills.length > 0) {
        reasoningParts.push(
          `Has ${matchedSkillsCount}/${requiredSkills.length} required skills (${skillMatch}%).`
        );
      } else {
        reasoningParts.push("No specific skills are required for this task.");
      }

      reasoningParts.push(
        `Availability is ${workloadFit}% (current workload: ${member.workload}%).`
      );

      if (skillMatch === 100 && requiredSkills.length > 0)
        reasoningParts.push("Fully meets all skill requirements.");

      const reasoning = reasoningParts.join(" ");

      // ----------------------------
      // 5️⃣ Result
      // ----------------------------
      return {
        memberId: member.id,
        matchScore,
        skillMatch,
        workloadFit,
        reasoning
      } as MatchResult;
    })
    .filter((result): result is MatchResult => result !== null);
};
