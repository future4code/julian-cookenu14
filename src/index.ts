import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import { AddressInfo } from 'net';
import { IdGenerator } from './services/IdGenerator';
import { Authenticator } from './services/Authenticator';
import { UserDatabase } from './data/UserDatabase';
import { RecipeDatabase } from './data/RecipeDatabase';
import { FollowDatabase } from './data/FollowDatabase';


dotenv.config();

const app = express();

app.use(express.json());

app.post("/signup", async (req: Request, res: Response) => {
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

app.post("/login", async (req: Request, res: Response) => {
    try {
        if (!req.body.email || req.body.email.indexOf("@") === -1) {
            throw new Error("Invalid email");
        };

        const userData = {
            email: req.body.email,
            password: req.body.password,
        };

        const userDatabase = new UserDatabase();
        const user = await userDatabase.getByEmail(userData.email);

        if (user.password !== userData.password) {
            throw new Error("Invalid credentials");
        };

        const authenticator = new Authenticator();
        const token = authenticator.generateToken({
            id: user.id,
        });

        res.status(200).send({
            token,
        });
    } catch (error) {
        res.status(400).send({
            message: error.message,
        });
    };
});

app.get("/user/profile", async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization as string;

        const authenticator = new Authenticator();
        const authenticationData = authenticator.getData(token);

        const userDb = new UserDatabase();
        const user = await userDb.getById(authenticationData.id);

        res.status(200).send({
            id: user.id,
            email: user.email,
        });
    } catch (err) {
        res.status(400).send({
            message: err.message,
        });
    }
});

//TODO: remover id deste endpoint
app.get("/user/:id", async (req: Request, res: Response) => {
    try {
        const id = req.params.id;

        const userDb = new UserDatabase();
        const user = await userDb.getById(id);

        res.status(200).send(user)
    } catch (error) {
        res.status(400).send({
            message: error.message,
        });
    }
});

//TODO: não está gravando no DB
app.post("/recipe", async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization as string;
        
        const authenticator = new Authenticator();
        const authenticationData = authenticator.getData(token);

        const recipeData = {
            title: req.body.title,
            description: req.body.description,
        };

        const userDb = new UserDatabase();
        const user = await userDb.getById(authenticationData.id);

        const idGenerator =  new IdGenerator();
        const id = idGenerator.generate();

        const recipeDb = new RecipeDatabase();
        await recipeDb.create(id, recipeData.title, recipeData.description, user.id);

        res.status(200).send();

    } catch (error) {
        res.status(400).send({
            message: error.message,
        });
    }
});

app.get("/recipe/:id", async (req: Request, res: Response) => {
    try {
        const id = req.params.id;

        const recipeDb = new RecipeDatabase();
        const recipe = await recipeDb.getById(id);

        res.status(200).send(recipe)
    } catch (error) {
        res.status(400).send({
            message: error.message,
        });
    }
});

app.post("/user/follow", async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization as string;

        const authenticator = new Authenticator();
        const authenticationData = authenticator.getData(token);

        const userDb = new UserDatabase();
        const followerId = await userDb.getById(authenticationData.id);

        const followData = {
            followedId: req.body.followedId
        };

        const followDb = new FollowDatabase();
        await followDb.create(followerId.id, followData.followedId);
        
        res.status(200).send();

    } catch (error) {
        res.status(400).send({
            message: error.message,
        });
    }

});

app.post("/user/unfollow", async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization as string;

        const authenticator = new Authenticator();
        const authenticationData = authenticator.getData(token);

        const userDb = new UserDatabase();
        const followerId = await userDb.getById(authenticationData.id);

        const followData = {
            followedId: req.body.followedId
        };

        const followDb = new FollowDatabase();
        await followDb.delete(followerId.id, followData.followedId);
        
        res.status(200).send({
            message: "Unfollowed successfully"
        });

    } catch (error) {
        res.status(400).send({
            message: error.message,
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