
export interface notificationJob {
  client: {
    nip: string;
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
  payload: {
    title: string;
    body: string;
    icon?: string;
    url?: string;
    tag?: string;
    actions?: Array<{
      action: string;
      title: string;
      icon?: string;
    }>;
    data?: {
      url: string;
    };
  };
  attemptsMade?: number;
  attempts?: number;
  maxAttempts: number;
  delay?: number;
}
