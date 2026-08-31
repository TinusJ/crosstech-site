/* Firestore security-rules test for the `leads` collection.
   Runs the EXACT payload the website's contact form writes against the real
   rules engine (Firestore emulator).

   Run from tests/:  npm install && npm run test:rules
   (Downloads the Firestore emulator on first run; needs Java.) */
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { doc, collection, addDoc, getDoc, getDocs, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';

const rulesPath = new URL('../firestore.rules', import.meta.url);
const [host, port] = (process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080').split(':');

const env = await initializeTestEnvironment({
  projectId: 'demo-crosstech',
  firestore: { rules: readFileSync(rulesPath, 'utf8'), host, port: Number(port) },
});

const anon = env.unauthenticatedContext().firestore();
const results = [];
const t = async (name, promise, expect) => {
  try {
    await (expect === 'allow' ? assertSucceeds(promise) : assertFails(promise));
    results.push('PASS  ' + name);
  } catch (e) {
    results.push('FAIL  ' + name + '  ->  ' + String(e.message).split('\n')[0]);
  }
};

const ref = 'CUDX6qeHop';
const validLead = () => ({
  name: 'Test Person',
  subject: 'Hello there',
  to: 'test@example.com',
  query: 'I would like an AI product.',
  message: {
    subject: 'CrossTech website query - ' + ref,
    html: '<p>Thank you for your email.</p>',
    text: 'Thank you for your email. Your reference number is ' + ref,
    ccUids: 'h2irRfsH1pEk5vmx3oNn',
  },
  timestamp: Timestamp.now(),
  actioned: false,
  emailSent: false,
  leadFrom: 'Website',
  reference: ref,
});

await t('create: exact website payload allowed', addDoc(collection(anon, 'leads'), validLead()), 'allow');
await t('read: single lead denied', getDoc(doc(anon, 'leads/some-id')), 'deny');
await t('read: listing leads denied', getDocs(collection(anon, 'leads')), 'deny');
await t('update: denied', updateDoc(doc(anon, 'leads/some-id'), { actioned: true }), 'deny');
await t('delete: denied', deleteDoc(doc(anon, 'leads/some-id')), 'deny');
await t('create: short name denied', addDoc(collection(anon, 'leads'), { ...validLead(), name: 'ab' }), 'deny');
await t('create: bad email denied', addDoc(collection(anon, 'leads'), { ...validLead(), to: 'not-an-email' }), 'deny');
await t('create: short subject denied', addDoc(collection(anon, 'leads'), { ...validLead(), subject: 'hi' }), 'deny');
await t('create: empty message denied', addDoc(collection(anon, 'leads'), { ...validLead(), query: '' }), 'deny');
await t('create: oversized message denied', addDoc(collection(anon, 'leads'), { ...validLead(), query: 'x'.repeat(5001) }), 'deny');
await t('create: wrong leadFrom denied', addDoc(collection(anon, 'leads'), { ...validLead(), leadFrom: 'Spam' }), 'deny');
await t('create: pre-actioned denied', addDoc(collection(anon, 'leads'), { ...validLead(), actioned: true }), 'deny');
await t('other collection: write denied', addDoc(collection(anon, 'users'), { a: 1 }), 'deny');
await t('other collection: read denied', getDoc(doc(anon, 'users/x')), 'deny');

await env.cleanup();
console.log(results.join('\n'));
const failed = results.filter(r => r.startsWith('FAIL')).length;
console.log(failed ? '\n' + failed + ' FAILED' : '\nAll rules tests passed.');
process.exit(failed ? 1 : 0);
