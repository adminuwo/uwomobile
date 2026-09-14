import React from 'react';
import { EmailHubScreen } from '../../src/components/email/EmailHubScreen';
import { GmailLogo } from '../../src/components/email/EmailHubScreen';
import { ComingSoonScreen } from '../../src/components/ComingSoonScreen';
import { useChannelAccess } from '../../src/hooks/useChannelAccess';

export default function GmailScreen() {
  const { isChannelComingSoon } = useChannelAccess();

  if (isChannelComingSoon('gmail')) {
    return (
      <ComingSoonScreen
        channelName="Gmail & Google Workspace"
        category="Email Integration"
        description="Gmail synchronization is currently deactivated by the platform administrator and will be available in an upcoming release."
        icon={<GmailLogo size={36} />}
      />
    );
  }

  return <EmailHubScreen provider="gmail" />;
}

