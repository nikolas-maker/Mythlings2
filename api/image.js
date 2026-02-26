export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, prompt, photo } = req.body;
  const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;

  if (!REPLICATE_TOKEN) {
    return res.status(500).json({ error: 'Missing Replicate API token' });
  }

  try {
    if (type === 'illustration') {
      // Generate a children's book illustration using Flux Schnell
      const response = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${REPLICATE_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: {
            prompt: prompt,
            num_outputs: 1,
            aspect_ratio: "16:9",
            output_format: "webp",
            output_quality: 80,
          },
        }),
      });

      const prediction = await response.json();
      
      // Flux Schnell is fast enough to return directly in many cases
      // But we need to poll for the result
      let result = prediction;
      let attempts = 0;
      
      while (result.status !== 'succeeded' && result.status !== 'failed' && attempts < 30) {
        await new Promise(r => setTimeout(r, 1000));
        const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
          headers: { 'Authorization': `Bearer ${REPLICATE_TOKEN}` },
        });
        result = await pollRes.json();
        attempts++;
      }

      if (result.status === 'succeeded' && result.output) {
        const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output;
        return res.status(200).json({ url: imageUrl });
      } else {
        return res.status(500).json({ error: 'Image generation failed', details: result.error });
      }

    } else if (type === 'cartoon') {
      // Generate cartoon avatar from uploaded photo
      const response = await fetch('https://api.replicate.com/v1/models/fofr/face-to-many/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${REPLICATE_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: {
            image: photo, // base64 data URI
            style: "3D",
            prompt: "a cute animated 3D cartoon character for a children's storybook, pixar style, big expressive eyes, friendly smile, warm lighting, adorable",
            negative_prompt: "realistic, scary, ugly, deformed, blurry",
            lora_scale: 0.9,
            instant_id_strength: 0.7,
          },
        }),
      });

      const prediction = await response.json();
      let result = prediction;
      let attempts = 0;

      while (result.status !== 'succeeded' && result.status !== 'failed' && attempts < 60) {
        await new Promise(r => setTimeout(r, 2000));
        const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
          headers: { 'Authorization': `Bearer ${REPLICATE_TOKEN}` },
        });
        result = await pollRes.json();
        attempts++;
      }

      if (result.status === 'succeeded' && result.output) {
        const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output;
        return res.status(200).json({ url: imageUrl });
      } else {
        return res.status(500).json({ error: 'Cartoon generation failed', details: result.error });
      }
    }

    return res.status(400).json({ error: 'Invalid type. Use "illustration" or "cartoon".' });

  } catch (err) {
    console.error('Image generation error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
