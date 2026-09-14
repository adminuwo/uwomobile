import React from 'react';
import { EmailHubScreen } from '../../src/components/email/EmailHubScreen';
import { OutlookLogo } from '../../src/components/email/EmailHubScreen';
import { ComingSoonScreen } from '../../src/components/ComingSoonScreen';
import { useChannelAccess } from '../../src/hooks/useChannelAccess';

export default function EmailScreen() {
  const { isChannelComingSoon } = useChannelAccess();

  if (isChannelComingSoon('outlook')) {
    return (
      <ComingSoonScreen
        channelName="Microsoft Outlook 365"
        category="Email Integration"
        description="Microsoft Outlook email synchronization is currently deactivated by the platform administrator and will be available in an upcoming release."
        icon={<OutlookLogo size={36} />}
      />
    );
  }

  return <EmailHubScreen provider="outlook" />;
}

