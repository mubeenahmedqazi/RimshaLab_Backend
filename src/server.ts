import dotenv from "dotenv";
import path from "path";
import app from "./app";
import connectDB from "./config/db";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config();

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB();
    app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  } catch (err: any) {
    console.error("❌ Startup failed:", err.message);
    process.exit(1);
  }
})();
