import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from 'langchain/prompts';
import dotenv from 'dotenv';

dotenv.config();

const SIMULATION_MODE = !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_key_here';

class AIService {
  private model: ChatOpenAI | null = null;

  constructor() {
    if (!SIMULATION_MODE) {
      this.model = new ChatOpenAI({
        modelName: 'gpt-4',
        temperature: 0.3,
        openAIApiKey: process.env.OPENAI_API_KEY,
      });
    } else {
      console.log('⚠️  AIService running in SIMULATION MODE');
    }
  }

  async validateWorkQuality(submissionContent: string): Promise<{
    score: number;
    feedback: string;
    passed: boolean;
  }> {
    if (SIMULATION_MODE) {
      const score = 60 + Math.random() * 40;
      return {
        score: Math.round(score),
        feedback: `[SIMULATION] Quality check completed. Score: ${Math.round(score)}/100`,
        passed: score >= 50,
      };
    }

    const prompt = PromptTemplate.fromTemplate(`
You are a professional work quality assessor. Analyze the following submission for quality standards.

Submission Content:
{submission}

Evaluate on these criteria:
1. Professional presentation and formatting
2. Clarity and coherence
3. Attention to detail
4. Completeness of deliverables mentioned

Provide a JSON response with:
- score (0-100)
- feedback (brief explanation)
- passed (true if score >= 50, false otherwise)
    `);

    try {
      const formattedPrompt = await prompt.format({ submission: submissionContent });
      const response = await this.model!.invoke(formattedPrompt);
      const result = JSON.parse(response.content as string);
      return result;
    } catch (error) {
      console.error('AI Quality Validation Error:', error);
      return { score: 50, feedback: 'AI validation unavailable, defaulting to manual review', passed: true };
    }
  }

  async validateRequirements(submissionContent: string, taskDescription: string, taskTitle: string): Promise<{
    score: number;
    feedback: string;
    missingElements: string[];
    passed: boolean;
  }> {
    if (SIMULATION_MODE) {
      const score = 65 + Math.random() * 35;
      return {
        score: Math.round(score),
        feedback: `[SIMULATION] Requirements check completed. Score: ${Math.round(score)}/100`,
        missingElements: score < 85 ? ['Minor detail in section 2'] : [],
        passed: score >= 70,
      };
    }

    const prompt = PromptTemplate.fromTemplate(`
You are a requirements validation expert. Compare the submission against the task requirements.

Task Title: {title}

Task Requirements:
{requirements}

Submission Content:
{submission}

Carefully check if the submission addresses ALL requirements. Identify any missing elements.

Provide a JSON response with:
- score (0-100, based on how well requirements are met)
- feedback (detailed analysis)
- missingElements (array of specific missing items)
- passed (true if score >= 70, false otherwise)
    `);

    try {
      const formattedPrompt = await prompt.format({
        title: taskTitle,
        requirements: taskDescription,
        submission: submissionContent,
      });
      const response = await this.model!.invoke(formattedPrompt);
      const result = JSON.parse(response.content as string);
      return result;
    } catch (error) {
      console.error('AI Requirements Validation Error:', error);
      return { score: 70, feedback: 'AI validation unavailable, defaulting to manual review', missingElements: [], passed: true };
    }
  }

  async validateContent(submissionContent: string): Promise<{
    score: number;
    feedback: string;
    originalityScore: number;
    depthScore: number;
    passed: boolean;
  }> {
    if (SIMULATION_MODE) {
      const score = 70 + Math.random() * 30;
      return {
        score: Math.round(score),
        feedback: `[SIMULATION] Content verification completed. Score: ${Math.round(score)}/100`,
        originalityScore: Math.round(75 + Math.random() * 25),
        depthScore: Math.round(70 + Math.random() * 30),
        passed: true,
      };
    }

    const prompt = PromptTemplate.fromTemplate(`
You are a content authenticity and quality expert. Analyze the following submission.

Submission Content:
{submission}

Evaluate on these criteria:
1. Originality: Does it appear to be original work? Any signs of plagiarism or template usage?
2. Depth: Is the work thorough and well-researched, or superficial?
3. Effort level: Does it demonstrate significant effort and expertise?

Provide a JSON response with:
- score (0-100, overall content quality)
- feedback (detailed analysis)
- originalityScore (0-100)
- depthScore (0-100)
- passed (true if no major concerns, false otherwise)
    `);

    try {
      const formattedPrompt = await prompt.format({ submission: submissionContent });
      const response = await this.model!.invoke(formattedPrompt);
      const result = JSON.parse(response.content as string);
      return result;
    } catch (error) {
      console.error('AI Content Validation Error:', error);
      return { score: 75, feedback: 'AI validation unavailable, defaulting to manual review', originalityScore: 75, depthScore: 75, passed: true };
    }
  }

  async makeFinalDecision(
    qualityScore: number,
    requirementScore: number,
    contentScore: number,
    taskTitle: string
  ): Promise<{
    finalScore: number;
    decision: 'auto_approve' | 'pending_review' | 'reject';
    feedback: string;
    breakdown: any;
  }> {
    const QUALITY_WEIGHT = 0.3;
    const REQUIREMENT_WEIGHT = 0.5;
    const CONTENT_WEIGHT = 0.2;

    const finalScore = qualityScore * QUALITY_WEIGHT + requirementScore * REQUIREMENT_WEIGHT + contentScore * CONTENT_WEIGHT;

    let decision: 'auto_approve' | 'pending_review' | 'reject';
    let feedback: string;

    if (finalScore >= 80) {
      decision = 'auto_approve';
      feedback = `Excellent work! All validation stages passed with a strong score of ${finalScore.toFixed(1)}/100. Payment will be released automatically.`;
    } else if (finalScore >= 60) {
      decision = 'pending_review';
      feedback = `The submission scored ${finalScore.toFixed(1)}/100. Some areas need client review before payment release.`;
    } else {
      decision = 'reject';
      feedback = `The submission scored ${finalScore.toFixed(1)}/100, which is below the acceptance threshold. Please review the feedback and resubmit improved work.`;
    }

    console.log(`
📊 AI Validation Complete for: ${taskTitle}
   Quality Score: ${qualityScore}/100 (weight: ${QUALITY_WEIGHT * 100}%)
   Requirements Score: ${requirementScore}/100 (weight: ${REQUIREMENT_WEIGHT * 100}%)
   Content Score: ${contentScore}/100 (weight: ${CONTENT_WEIGHT * 100}%)
   ─────────────────────────────
   Final Score: ${finalScore.toFixed(1)}/100
   Decision: ${decision.toUpperCase()}
    `);

    return {
      finalScore: Math.round(finalScore * 100) / 100,
      decision,
      feedback,
      breakdown: {
        quality: { score: qualityScore, weight: QUALITY_WEIGHT },
        requirements: { score: requirementScore, weight: REQUIREMENT_WEIGHT },
        content: { score: contentScore, weight: CONTENT_WEIGHT },
      },
    };
  }

  async collectDisputeEvidence(
    taskDescription: string,
    submissionContent: string,
    clientReason: string,
    freelancerResponse?: string
  ): Promise<any> {
    if (SIMULATION_MODE) {
      return {
        summary: '[SIMULATION] Evidence collected from both parties',
        clientClaims: ['Issue with deliverable quality', 'Missing requirements'],
        freelancerClaims: freelancerResponse ? ['Requirements were ambiguous', 'Delivered as agreed'] : [],
        keyPoints: ['Need to review original requirements', 'Check communication history'],
      };
    }

    const prompt = PromptTemplate.fromTemplate(`
You are a dispute evidence collector. Organize and summarize the evidence from both parties.

Task Description:
{taskDescription}

Submission:
{submission}

Client's Complaint:
{clientReason}

Freelancer's Response:
{freelancerResponse}

Provide a JSON response with:
- summary (brief overview)
- clientClaims (array of key claims)
- freelancerClaims (array of key defenses)
- keyPoints (important factors to consider)
    `);

    try {
      const formattedPrompt = await prompt.format({
        taskDescription,
        submission: submissionContent,
        clientReason,
        freelancerResponse: freelancerResponse || 'No response provided yet',
      });
      const response = await this.model!.invoke(formattedPrompt);
      return JSON.parse(response.content as string);
    } catch (error) {
      console.error('AI Evidence Collection Error:', error);
      return { summary: 'Evidence collection failed', clientClaims: [], freelancerClaims: [], keyPoints: [] };
    }
  }

  async assessEachParty(evidence: any): Promise<{
    clientClaimScore: number;
    freelancerDefenseScore: number;
    analysis: string;
  }> {
    if (SIMULATION_MODE) {
      return {
        clientClaimScore: Math.round(50 + Math.random() * 40),
        freelancerDefenseScore: Math.round(50 + Math.random() * 40),
        analysis: '[SIMULATION] Both parties have valid points. Further analysis needed.',
      };
    }

    const prompt = PromptTemplate.fromTemplate(`
You are a neutral dispute arbitrator. Assess the validity of each party's position.

Evidence:
{evidence}

Evaluate objectively:
1. Client's claim validity (0-100)
2. Freelancer's defense strength (0-100)

Provide a JSON response with:
- clientClaimScore (0-100)
- freelancerDefenseScore (0-100)
- analysis (detailed reasoning)
    `);

    try {
      const formattedPrompt = await prompt.format({ evidence: JSON.stringify(evidence) });
      const response = await this.model!.invoke(formattedPrompt);
      return JSON.parse(response.content as string);
    } catch (error) {
      console.error('AI Party Assessment Error:', error);
      return { clientClaimScore: 50, freelancerDefenseScore: 50, analysis: 'Assessment unavailable' };
    }
  }

  async revalidateSubmission(
    submissionContent: string,
    taskDescription: string,
    disputeContext: any
  ): Promise<{
    revalidationScore: number;
    findings: string;
    comparisonWithOriginal: string;
  }> {
    if (SIMULATION_MODE) {
      return {
        revalidationScore: Math.round(60 + Math.random() * 30),
        findings: '[SIMULATION] Re-validation shows some discrepancies with original requirements',
        comparisonWithOriginal: 'Score adjusted based on dispute context',
      };
    }

    const prompt = PromptTemplate.fromTemplate(`
You are re-validating a submission in light of a dispute. Be thorough and critical.

Task Description:
{taskDescription}

Submission:
{submission}

Dispute Context:
{disputeContext}

Re-evaluate the work considering the client's specific complaints. Be objective.

Provide a JSON response with:
- revalidationScore (0-100)
- findings (what you discovered)
- comparisonWithOriginal (how this differs from initial validation)
    `);

    try {
      const formattedPrompt = await prompt.format({
        taskDescription,
        submission: submissionContent,
        disputeContext: JSON.stringify(disputeContext),
      });
      const response = await this.model!.invoke(formattedPrompt);
      return JSON.parse(response.content as string);
    } catch (error) {
      console.error('AI Revalidation Error:', error);
      return { revalidationScore: 70, findings: 'Revalidation unavailable', comparisonWithOriginal: 'N/A' };
    }
  }

  async makeDisputeDecision(
    originalValidationScore: number,
    clientClaimScore: number,
    freelancerDefenseScore: number,
    revalidationScore: number,
    evidence: any
  ): Promise<{
    outcome: 'full_payment' | 'partial_75' | 'partial_50' | 'partial_25' | 'full_refund';
    freelancerPercent: number;
    resolution: string;
    reasoning: string;
  }> {
    const ORIGINAL_WEIGHT = 0.3;
    const CLIENT_WEIGHT = 0.25;
    const FREELANCER_WEIGHT = 0.25;
    const REVALIDATION_WEIGHT = 0.2;

    const aggregateScore =
      originalValidationScore * ORIGINAL_WEIGHT +
      (100 - clientClaimScore) * CLIENT_WEIGHT +
      freelancerDefenseScore * FREELANCER_WEIGHT +
      revalidationScore * REVALIDATION_WEIGHT;

    let outcome: 'full_payment' | 'partial_75' | 'partial_50' | 'partial_25' | 'full_refund';
    let freelancerPercent: number;

    if (aggregateScore >= 80) {
      outcome = 'full_payment';
      freelancerPercent = 100;
    } else if (aggregateScore >= 70) {
      outcome = 'partial_75';
      freelancerPercent = 75;
    } else if (aggregateScore >= 50) {
      outcome = 'partial_50';
      freelancerPercent = 50;
    } else if (aggregateScore >= 30) {
      outcome = 'partial_25';
      freelancerPercent = 25;
    } else {
      outcome = 'full_refund';
      freelancerPercent = 0;
    }

    const reasoning = `
DISPUTE RESOLUTION ANALYSIS
═══════════════════════════════════════════

SCORING BREAKDOWN:
- Original Validation: ${originalValidationScore}/100 (weight: ${ORIGINAL_WEIGHT * 100}%)
- Client Claim Validity: ${clientClaimScore}/100 (weight: ${CLIENT_WEIGHT * 100}%)
- Freelancer Defense: ${freelancerDefenseScore}/100 (weight: ${FREELANCER_WEIGHT * 100}%)
- Re-validation Score: ${revalidationScore}/100 (weight: ${REVALIDATION_WEIGHT * 100}%)

AGGREGATE SCORE: ${aggregateScore.toFixed(1)}/100

DECISION: ${outcome.toUpperCase().replace(/_/g, ' ')}
Payment Split: Freelancer ${freelancerPercent}%, Client ${100 - freelancerPercent}%

RATIONALE:
${this.generateRationale(aggregateScore, outcome, evidence)}

RECOMMENDATIONS FOR BOTH PARTIES:
${this.generateRecommendations(aggregateScore, evidence)}
    `.trim();

    const resolution = `After thorough AI analysis, the dispute is resolved with a ${freelancerPercent}% payment to the freelancer. ${
      freelancerPercent === 100
        ? 'The work meets requirements despite the complaint.'
        : freelancerPercent === 0
          ? 'The work does not meet basic requirements.'
          : 'Partial payment reflects the value delivered vs. expectations.'
    }`;

    console.log(reasoning);

    return {
      outcome,
      freelancerPercent,
      resolution,
      reasoning,
    };
  }

  private generateRationale(score: number, outcome: string, evidence: any): string {
    if (score >= 80) {
      return 'The work substantially meets the requirements. Client complaints appear to be based on subjective preferences or minor issues that do not justify withholding payment.';
    } else if (score >= 70) {
      return 'The work is largely complete but has some legitimate shortcomings identified by the client. A 75% payment is fair compensation for the value delivered.';
    } else if (score >= 50) {
      return 'The work has significant issues but provides some value. A 50/50 split acknowledges both partial completion and legitimate complaints.';
    } else if (score >= 30) {
      return 'The work falls significantly short of requirements. Only 25% payment is justified for minimal effort shown.';
    } else {
      return 'The work does not meet basic requirements or demonstrates fundamental misunderstanding of the task. Full refund is warranted.';
    }
  }

  private generateRecommendations(score: number, evidence: any): string {
    return `
For Clients: Be specific in task requirements. Provide examples and clear success criteria.
For Freelancers: Communicate early if requirements are unclear. Request feedback during work.
For Both: Use the AI chat to clarify expectations before disputes arise.
    `.trim();
  }

  async calculateReputation(userHistory: any): Promise<{
    newScore: number;
    trend: 'improving' | 'stable' | 'declining';
    summary: string;
  }> {
    if (SIMULATION_MODE) {
      const newScore = Math.round(50 + Math.random() * 50);
      return {
        newScore,
        trend: 'stable',
        summary: `[SIMULATION] Reputation calculated: ${newScore}/100`,
      };
    }

    const prompt = PromptTemplate.fromTemplate(`
You are a reputation scoring system. Calculate a fair reputation score for this user.

User History:
{history}

Consider:
- Completed tasks count
- Average AI validation scores
- Dispute outcomes (wins vs losses)
- Consistency over time

Provide a JSON response with:
- newScore (0-100)
- trend (improving/stable/declining)
- summary (brief explanation)
    `);

    try {
      const formattedPrompt = await prompt.format({ history: JSON.stringify(userHistory) });
      const response = await this.model!.invoke(formattedPrompt);
      return JSON.parse(response.content as string);
    } catch (error) {
      console.error('AI Reputation Calculation Error:', error);
      return { newScore: 50, trend: 'stable', summary: 'Reputation calculation unavailable' };
    }
  }

  isSimulationMode(): boolean {
    return SIMULATION_MODE;
  }
}

export default new AIService();
