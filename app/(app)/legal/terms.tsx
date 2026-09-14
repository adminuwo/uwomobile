import React from 'react';
import { Screen } from '../../../src/components/Screen';
import { LegalDocumentViewer } from '../../../src/components/legal/LegalDocumentViewer';
import { TERMS_AND_CONDITIONS } from '../../../src/constants/legal';

export default function TermsScreen() {
  return (
    <Screen safeAreaEdges={['top', 'left', 'right', 'bottom']}>
      <LegalDocumentViewer document={TERMS_AND_CONDITIONS} />
    </Screen>
  );
}
