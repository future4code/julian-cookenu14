import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import { AddressInfo } from 'net';
import { IdGenerator } from './services/IdGenerator';
import { Authenticator } from './services/Authenticator';
import { UserDatabase } from './data/UserDatabase';

dotenv.config();

const app = express();

app.use(express.json());

app.post('/signup', async (req: Request, res: Response) => {
    try {
        if(!req.body.email || req.body.email.indexOf('@') === -1) {
            throw new Error('Invalid Email');
        };

        if(!req.body.password || req.body.password.length < 6) {
            throw new Error('Invalid Password')
        };
        const userData = {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        };

        const idGenerator =  new IdGenerator();
        const id = idGenerator.generate();

        const userDb = new UserDatabase();
        await userDb.create(id, userData.name, userData.email, userData.password);

        const authenticator = new Authenticator();
        const token = authenticator.generateToken({
            id
        });

        res.status(200).send({
            token
        });

    } catch (error) {
        res.status(400).send({
            message: error.message
        });
    }
});




const server = app.listen(process.env.PORT || 3003, () => {
    if (server) {
        const address = server.address() as AddressInfo;
        console.log(`Server is running in http://localhost:${address.port}`);
    } else {
        console.error(`Failure upon starting server.`);
    }
});