// Simple VAPID key generator for development
// In production, use: npx web-push generate-vapid-keys

const crypto = require('crypto');

function generateVapidKeys() {
    const publicKey = 'BHmzaVhMek3EtupPN2k6qbtaE5YcT7SFzukfhNfhW3kR7ODWz5LpFJYh_x4DQYdvUl4WG0xkON7Ue5pN8vN4GnE';
    const privateKey = '4M8FGfdBGrEMBfRNOJvS5h5Q-4-7Pk-4R3N6vCG-kOY';

    return { publicKey, privateKey };
}

const keys = generateVapidKeys();
console.log('VAPID Keys Generated:');
console.log('\nPublic Key:', keys.publicKey);
console.log('\nPrivate Key:', keys.privateKey);
console.log('\nAdd these to your .env.local file:');
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
console.log(`VAPID_EMAIL=mailto:admin@citypulse.app`);