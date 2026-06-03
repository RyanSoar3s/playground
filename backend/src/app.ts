import bootstrap from "./server";

bootstrap()
.then(() => console.log("Server is running"))
.catch((error) => {
  console.error(`Failed to start server: ${error}`);
  process.exit(1);

});
