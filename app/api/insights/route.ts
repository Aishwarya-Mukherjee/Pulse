import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { teamScore, currentLag, currentMeetings, currentMood } = body;

    // Simulate LLM generation latency
    await new Promise((resolve) => setTimeout(resolve, 1500));

    let text = "Metrics are stable. Collaboration across pods is proceeding as expected, though minor fluctuations in response time are visible.";
    
    if (teamScore >= 85) {
      text = "The team is in a highly productive state. Psychological safety signals are strong, and communication is flowing organically without excessive meeting overhead. Keep up the current cadence.";
    } else if (currentLag > 5) {
      text = "Response lag has spiked this week. This often indicates context-switching burnout or that engineers are stuck in deep-work without designated sync times. Consider checking in on blocked PRs.";
    } else if (currentMood !== null && currentMood < 3.2) {
      text = "Sentiment has dipped noticeably. A recent process change or impending deadline may be causing friction. A quick pulse-check in the next standup is recommended.";
    } else if (currentMeetings < 3) {
      text = "Meeting frequency is low, but if lag is moderate, silos might be forming. Watch for isolated pods in the collaboration network.";
    }

    return NextResponse.json({ insight: text });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 });
  }
}
