import React from 'react';
import { GoogleNewsScreen } from '../../src/components/news/GoogleNewsScreen';
import { useChannelAccess } from '../../src/hooks/useChannelAccess';
import { ComingSoonScreen } from '../../src/components/ComingSoonScreen';

export default function GoogleNewsRoute() {
  const { isChannelComingSoon } = useChannelAccess();

  if (isChannelComingSoon('google_news')) {
    return (
      <ComingSoonScreen
        channelName="Google News Feed"
        category="Market Intelligence"
        description="Google News AI radar and real-time market updates are currently deactivated by your platform administrator."
      />
    );
  }

  return <GoogleNewsScreen />;
}
