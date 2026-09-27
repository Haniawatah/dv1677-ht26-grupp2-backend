import express from "express";
import documents from "../docs.mjs";

const apiRouter = express.Router();

apiRouter.get("/getall", async (req, res) => {
    try {
        const tempdata = await documents.getAll();

        res.status(200).json({ data: tempdata });
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
    
});

apiRouter.post("/insertone/:title/:content", async (req, res) => {
    const tempdata = {
        title: req.params.title,
        content: req.params.content
    };

    console.log(tempdata);

    const result = await documents.addOne(tempdata);

    console.log(result);
});


export default apiRouter;