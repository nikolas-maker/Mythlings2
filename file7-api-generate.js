export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Simple rate limiting - optional, can add more sophisticated logic later
  const { name, adventure, trait } = req.body;

  if (!name || !adventure || !trait) {
    return res.status(400).json({ error: 'Missing required fields: name, adventure, trait' });
  }

  const prompt = `You are a beloved children's storybook author. Write a personalized story.

Child's name: ${name}
Adventure: ${adventure.title} — set in ${adventure.scene}
Trait: ${trait}

Write EXACTLY 5 story pages as a JSON object. Each page: 2-3 vivid sentences for ages 4-8. The story must:
- Star ${name} as the hero on every page
- Show how being ${trait.toLowerCase()} is the key to success
- Follow: discovery → journey → challenge → triumph → celebration
- Use magical sensory details kids love (sparkles, sounds, colors, textures)
- End with ${name} celebrated as a legend

Respond with ONLY valid JSON. No markdown. No backticks. No explanation.
{"pages":["page1","page2","page3","page4","page5"],"title":"short evocative title"}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic API error:', data);
      return res.status(500).json({ error: 'Story generation failed' });
    }

    const text = data.content?.find(b => b.type === 'text')?.text || '';
    const clean = text.replace(/```json|```/g, '').trim();

    try {
      const parsed = JSON.parse(clean);
      return res.status(200).json(parsed);
    } catch {
      return res.status(500).json({ error: 'Failed to parse story' });
    }
  } catch (err) {
    console.error('Generate error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
