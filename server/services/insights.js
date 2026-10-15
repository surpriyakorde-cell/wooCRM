const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL;

export const aiConfigured = Boolean(apiKey && model);

export async function summarizeReviews(reviews) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: 'Summarize customer feedback, recurring complaints, and practical follow-up actions. Cite supporting evidence using review IDs and customer names. Do not infer facts absent from input.' },
        { role: 'user', content: JSON.stringify(reviews) }
      ],
      temperature: 0.2
    }),
    signal: AbortSignal.timeout(20000)
  });
  if (!response.ok) throw new Error(`AI provider returned ${response.status}`);
  const result = await response.json();
  return { available: true, provider: 'OpenAI', model, summary: result.choices?.[0]?.message?.content || '', evidence: reviews.map(r => ({ id: r.id, customer: r.customer, rating: r.rating, text: r.text })) };
}
