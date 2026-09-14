import React from 'react';
import { Screen } from '../../src/components/Screen';
import { LegalDocumentViewer } from '../../src/components/legal/LegalDocumentViewer';
import { PRIVACY_POLICY } from '../../src/constants/legal';

export default function AuthPrivacyScreen() {
  return (
    <Screen safeAreaEdges={['top', 'left', 'right', 'bottom']}>
      <LegalDocumentViewer document={PRIVACY_POLICY} showThirdPartyTable={true} />
    </Screen>
  );
}
