import dotenv from 'dotenv';

dotenv.config();

const MONGO_USERNAME = process.env.MONGO_USERNAME || '';
// roofi_123;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || '';
// uFCJwbxKbAxiGAVO;
const MONGO_URL = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@cluster0.xra7h.mongodb.net/library`;

const SERVER_PORT = process.env.SERVER_PORT ? Number(process.env.SERVER_PORT) : 1337;

export const config = {
    mongo: {
        url: MONGO_URL
    },
    server: {
        port: SERVER_PORT
    }
};
