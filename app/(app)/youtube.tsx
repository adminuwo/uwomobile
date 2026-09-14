import React from 'react';
import { YouTubeHubScreen } from '../../src/components/youtube/YouTubeHubScreen';
import { ComingSoonScreen } from '../../src/components/ComingSoonScreen';
import { useChannelAccess } from '../../src/hooks/useChannelAccess';
import { Youtube } from 'lucide-react-native';

export default function YouTubeScreen() {
  const { isChannelComingSoon } = useChannelAccess();

  if (isChannelComingSoon('youtube')) {
    return (
      <ComingSoonScreen
        channelName="YouTube Channel Studio"
        category="Video & Media Automation"
        description="YouTube comments auto-replies and community analytics are currently deactivated by the platform administrator."
        icon={<Youtube size={36} color="#FF0000" />}
      />
    );
  }

  return <YouTubeHubScreen />;
}

