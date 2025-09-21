import React from 'react';

// Test the planFeatures object with safety checks
const planFeatures = {
  free: [
    'Accès limité au contenu',
    'Avec publicités',
    '1 appareil simultané',
    'Support basique'
  ],
  basic: [
    'Accès à tout le contenu',
    'Qualité Standard (SD)',
    '1 appareil simultané',
    'Support client'
  ],
  standard: [
    'Accès à tout le contenu',
    'Qualité HD',
    '2 appareils simultanés',
    'Téléchargement hors ligne',
    'Support prioritaire'
  ],
  premium: [
    'Accès à tout le contenu',
    'Qualité 4K Ultra HD',
    '4 appareils simultanés',
    'Téléchargement illimité',
    'Support VIP 24/7',
    'Contenu exclusif'
  ],
  vip: [
    'Accès à tout le contenu',
    'Qualité 4K Ultra HD',
    'Appareils illimités',
    'Téléchargement illimité',
    'Support VIP 24/7',
    'Contenu exclusif',
    'Accès anticipé aux nouveautés'
  ]
};

// Test the planIcons object
const planIcons = {
  free: 'Globe',
  basic: 'Shield',
  standard: 'Star',
  premium: 'Crown',
  vip: 'Zap'
};

// Test accessing plan features with safety checks (similar to what we fixed in subscription.tsx)
const testPlanFeatures = (planId: string) => {
  // This is the fix we implemented - using optional chaining and providing a fallback
  const features = planFeatures[planId as keyof typeof planFeatures];
  if (features && Array.isArray(features)) {
    return features.map((feature, index) => (
      <li key={index}>{feature}</li>
    ));
  } else {
    return <li>Aucune fonctionnalité disponible</li>;
  }
};

// Test with different plan IDs including ones that don't exist
console.log('Testing plan features access:');
console.log('Free plan features:', testPlanFeatures('free'));
console.log('Basic plan features:', testPlanFeatures('basic'));
console.log('Standard plan features:', testPlanFeatures('standard'));
console.log('Premium plan features:', testPlanFeatures('premium'));
console.log('VIP plan features:', testPlanFeatures('vip'));
console.log('Non-existent plan features:', testPlanFeatures('nonexistent'));

// Test accessing plan icons with safety checks
const testPlanIcons = (planId: string) => {
  const icon = planIcons[planId as keyof typeof planIcons];
  return icon || 'DefaultIcon';
};

console.log('Testing plan icons access:');
console.log('Free plan icon:', testPlanIcons('free'));
console.log('Basic plan icon:', testPlanIcons('basic'));
console.log('Standard plan icon:', testPlanIcons('standard'));
console.log('Premium plan icon:', testPlanIcons('premium'));
console.log('VIP plan icon:', testPlanIcons('vip'));
console.log('Non-existent plan icon:', testPlanIcons('nonexistent'));

export { testPlanFeatures, testPlanIcons };