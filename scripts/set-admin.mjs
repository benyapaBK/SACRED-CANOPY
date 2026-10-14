// Run locally after `firebase login` and `firebase use sacred-canopy-168ef`.
// Requires a service-account JSON file stored OUTSIDE the website project.
// Never commit service-account keys to Git or place them under public/.
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
const admin = require('../functions/node_modules/firebase-admin');
const [serviceAccountPath, email] = process.argv.slice(2);
if (!serviceAccountPath || !email) {
  console.error('Usage: node scripts/set-admin.mjs <path-to-service-account.json> <admin-email>');
  process.exit(1);
}
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const user = await admin.auth().getUserByEmail(email);
await admin.auth().setCustomUserClaims(user.uid, { ...user.customClaims, admin: true });
await admin.firestore().doc(`users/${user.uid}`).set({ uid: user.uid, email: user.email, displayName: user.displayName || email.split('@')[0], role: 'admin', status: 'active', favorites: [], authProvider: user.providerData?.[0]?.providerId === 'google.com' ? 'google' : 'email', createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
console.log(`Admin Custom Claim assigned to ${email}. Sign out and sign in again to refresh the token.`);
process.exit(0);
