const app = require("./app");

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`ClipSplit Pro API running on port ${PORT}`);
  console.log(`ENV  : ${process.env.NODE_ENV || "development"}`);
  console.log(`CORS : ${app.locals.allowedOrigins.join(", ")}`);
});
