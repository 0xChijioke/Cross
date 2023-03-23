import { init } from 'arweave';
import { cross } from "../cross.json";
import { jwk } from "../../../ar.json";
const arweave = init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https',
    timeout: 20000,
    logging: false
});

const data = JSON.stringify(cross);
const transaction = await arweave.createTransaction({ data }, jwk);
transaction.addTag('Content-Type', 'application/json');
await arweave.transactions.sign(transaction, jwk);
await arweave.transactions.post(transaction);

// To retrive data
const dataRes = await arweave.transactions.getData('abc123', { decode: true, string: true });
const nftMetadata = JSON.parse(dataRes);