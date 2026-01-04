// services/ai.service.ts
import axios from 'axios';

export interface ChatEvent {
  type: 'text' | 'dataframe' | 'chart' | 'html' | 'image' | 'error' | 'status';
  content?: string;
  data?: any;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function streamChatResponse(
  message: string,
  onEvent: (event: ChatEvent) => void,
  onDone?: () => void
) {
  try {
    const response = await fetch(`${BASE_URL}/api/vanna/v2/chat_sse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.body) throw new Error('No response body');

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        onDone?.();
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split('\n\n');

      for (const part of parts.slice(0, -1)) {
        if (!part.startsWith('data:')) continue;
        try {
          const json = JSON.parse(part.replace(/^data:\s*/, ''));
          if (json.rich) {
            onEvent({
              type: json.rich.type === 'status_bar_update' ? 'status' : json.rich.type,
              content: json.rich.data?.content || '',
              data: json.rich.data
            });
          }
        } catch (e) {
          console.error("Parse error", e);
        }
      }
      buffer = parts[parts.length - 1];
    }
  } catch (error) {
    console.error("Stream error", error);
    onEvent({ type: 'error', content: 'Lỗi kết nối server AI.' });
    onDone?.();
  }
}