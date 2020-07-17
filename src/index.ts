import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import { AddressInfo } from 'net';
import { IdGenerator } from './services/IdGenerator';
import { Authenticator } from './services/Authenticator';
import { UserDatabase } from './data/UserDatabase';
import { RecipeDatabase } from './data/RecipeDatabase';
import { FollowDatabase } from './data/FollowDatabase';
import { HashManager } from './services/HashManager';
import { title } from 'process';

dotenv.config();

const app = express();

app.use(express.json());

app.get("/user/feed", async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization as string;

        const authenticator = new Authenticator();
        const authenticationData = authenticator.getData(token);

        const userDb = new UserDatabase();
        const user = await userDb.getById(authenticationData.id);

        const recipeDb = new RecipeDatabase();
        const recipes = await recipeDb.getAllByUserId(user.id);

        res.status(200).send({recipes});

    } catch (error) {
        res.status(400).send({
            message: error.message,
        });
    }
});

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

        const hashManager = new HashManager();
        const cipherPassword= await hashManager.hash(userData.password);

        const idGenerator =  new IdGenerator();
        const id = idGenerator.generate();

        const userDb = new UserDatabase();
        await userDb.create(id, userData.name, userData.email, cipherPassword);

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
            throw new Error("Invalid credentials");
        };

        const userData = {
            email: req.body.email,
            password: req.body.password
        };

        const userDatabase = new UserDatabase();
        const user = await userDatabase.getByEmail(userData.email);

        const hashManager = new HashManager();
        const passwordIsCorrect = await hashManager.compare(
            userData.password,
            user.password
        );

        if (!passwordIsCorrect) {
            throw new Error("Invalid credentials");
        };

        const authenticator = new Authenticator();
        const token = authenticator.generateToken({
            id: user.id,
        });

        res.status(200).send({
            token
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
            name: user.name,
            email: user.email
        });
    } catch (error) {
        res.status(400).send({
            message: error.message
        });
    }
});

app.get("/user/:id", async (req: Request, res: Response) => {
    try {
        const id = req.params.id;

        const userDb = new UserDatabase();
        const user = await userDb.getById(id);

        res.status(200).send({
            id: user.id,
            name: user.name,
            email: user.email
        });
    } catch (error) {
        res.status(400).send({
            message: error.message
        });
    }
});

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

        res.status(200).send({
            id: recipe.id,
            title: recipe.title,
            description: recipe.description,
            created_date: recipe.created_date
        });
    } catch (error) {
        res.status(400).send({
            message: error.message
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
        
        res.status(200).send({
            message: "Followed successfully"
        });

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