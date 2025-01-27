import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const requestSchema = z.object({
  message: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { message } = requestSchema.parse(json);

    // Get the user from Supabase auth
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's website content
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('website_content')
      .eq('id', user.id)
      .single();

    if (userError) {
      throw userError;
    }

    // Prepare context from website content
    const context = userData.website_content
      ? `Context from the website:\n${userData.website_content
          .map((item: { type: string; text: string }) => item.text)
          .join('\n')}\n\nBased on the above context, please answer the following question:\n${message}`
      : message;

    // Call DeepSeek API
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant that answers questions based on the provided website content. Keep your responses concise and relevant.',
          },
          {
            role: 'user',
            content: context,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get response from DeepSeek');
    }

    const data = await response.json();

    // Store the chat history
    await supabase.from('chat_history').insert({
      user_id: user.id,
      message: message,
      response: data.choices[0].message.content,
      metadata: {
        model: data.model,
        tokens: data.usage,
      },
    });

    return NextResponse.json({
      response: data.choices[0].message.content,
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process chat message' },
      { status: 500 }
    );
  }
} 