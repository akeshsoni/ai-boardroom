import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json();

    // Fetch user memory from Supabase
    const { data: memories, error } = await supabase
      .from('user_memory')
      .select('category, key, value')
      .order('category', { ascending: true });

    if (error) {
      console.error('Error fetching memories:', error);
    }

    // Build context from memories
    let contextPrompt = "You are ChatGPT in an AI Boardroom conversation. ";
    
    if (memories && memories.length > 0) {
      contextPrompt += "Here's what you know about the user:\n\n";
      
      const groupedMemories: Record<string, string[]> = {};
      memories.forEach((mem: any) => {
        if (!groupedMemories[mem.category]) {
          groupedMemories[mem.category] = [];
        }
        groupedMemories[mem.category].push(mem.value);
      });

      Object.entries(groupedMemories).forEach(([category, values]) => {
        contextPrompt += `${category.toUpperCase()}:\n`;
        values.forEach(val => {
          contextPrompt += `- ${val}\n`;
        });
        contextPrompt += '\n';
      });
    }

    contextPrompt += "Respond naturally and conversationally, using this context when relevant. Keep responses concise unless asked for detail.";

    const messages = [
      { role: 'system', content: contextPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY || ''}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        max_tokens: 2000,
        messages: messages,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return NextResponse.json(
        { error: 'Failed to get response from ChatGPT' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const responseMessage = data.choices[0].message.content;

    // Save message to Supabase
    await supabase.from('messages').insert([
      { sender: 'user', content: message },
      { sender: 'chatgpt', content: responseMessage }
    ]);

    return NextResponse.json({ message: responseMessage });
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}