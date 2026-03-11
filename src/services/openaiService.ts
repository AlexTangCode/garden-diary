export interface OpenAiRecipe {
  recipeName: string;
  eggsNeeded: number;
  whyChloeLikes: string;
  secret: string;
  steps: string[];
}

export async function getOpenAiRecipe(eggCount: number, apiKey: string): Promise<OpenAiRecipe> {
  const prompt = `你是一位专业的儿童营养师，请为一个3岁的小女孩Chloe设计一道使用鸡蛋的营养食谱。
  
当前储蛋盒里有 ${eggCount} 枚鸡蛋可用。

请设计一道美味、营养、适合3岁幼儿的蛋类食谱，用JSON格式返回，字段如下：
- recipeName: 食谱名称（创意有趣的中文名）
- eggsNeeded: 需要几枚蛋（不超过 ${Math.min(eggCount, 4)} 枚）
- whyChloeLikes: Chloe会喜欢的原因（从孩子视角，活泼可爱的语气，1-2句话）
- secret: 制作小秘诀（1句话，让味道更好的关键步骤）
- steps: 制作步骤数组（3-5个简洁步骤，每步控制在30字以内）

只返回JSON，不要任何其他文字或markdown格式。`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
    }),
  });

  if (response.status === 401) throw new Error('UNAUTHORIZED');
  if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content ?? '';

  try {
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean) as OpenAiRecipe;
  } catch {
    throw new Error('Failed to parse recipe response');
  }
}
