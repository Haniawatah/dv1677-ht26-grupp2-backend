import express from "express";

const testRouter = express.Router();

testRouter.get("/hej", (req, res) => {
    res.json({ 
        data: {
            first: "ett",
            last: "five",
            everything: "42"
        }
    });
});

export default testRouter;