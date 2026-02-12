const createApp = require("./app");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const port = process.env.APP_PORT ?? 10001;
const app = createApp();

app.listen(port, () => console.info(`Server is running on port ${port}`));
