// generate-email.js - Serverless function (same folder as index.html)
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Get the API key from environment variables (your key is safe here!)
        const apiKey = process.env.api_deepseek;

        if (!apiKey) {
            console.error('DeepSeek API key not found in environment variables');
            return res.status(500).json({ error: 'API configuration error' });
        }

        console.log('Calling DeepSeek API with prompt:', prompt.substring(0, 50) + '...');

        // Call DeepSeek API
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a professional email writer. Generate clean, well-formatted emails. Always start with "Subject:" on the first line, followed by the email body. Use proper email formatting with paragraphs.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 1000,
                top_p: 0.9,
                frequency_penalty: 0.3,
                presence_penalty: 0.3
            })
        });

        const data = await response.json();

        // Check if DeepSeek returned an error
        if (!response.ok) {
            console.error('DeepSeek API error:', data);
            return res.status(response.status).json({ 
                error: data.error?.message || 'DeepSeek API error' 
            });
        }

        // Return the API response to your frontend
        res.status(200).json(data);

    } catch (error) {
        console.error('Error calling DeepSeek API:', error);
        res.status(500).json({ error: 'Failed to generate email: ' + error.message });
    }
}