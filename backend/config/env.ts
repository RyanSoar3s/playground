import dotenv from "dotenv";

dotenv.config();

const { Origin = null, Port } = process.env;

export {
  Origin,
  Port

};
