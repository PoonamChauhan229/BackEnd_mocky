const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
const connection = require("./db/connection"); 
const userRoute = require("./routes/userRoute");
const mockapiRoute = require("./routes/mockapiRoute");

dotenv.config()

app.use(cors());
app.use(express.json());

connection();

app.use(userRoute);
app.use(mockapiRoute)
const PORT=process.env.PORT || 8000
app.listen(PORT, () => {
    console.log(`app listening on port ${PORT}`);
});