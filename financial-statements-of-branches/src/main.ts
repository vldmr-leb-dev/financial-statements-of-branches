// import express from "express";
//
// const app = express()
// const port = 3000
// app.use(express.json())
// app.use(express.urlencoded({extended: true}))

// import post_report from './post_report.ts';
import edit_post_request from './post_report.ts';

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
// })

edit_post_request();



// app.post("/", async (req, res) => {
//   console.log(req.body)
//
//   let rez = await post_report(req.body);
//   console.log(rez);
//
//   // res.status(200).send({ "message": rez})
//   res.status(200).send({rez})
// })