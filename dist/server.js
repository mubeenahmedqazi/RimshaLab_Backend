"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const app_1 = __importDefault(require("./app"));
const db_1 = __importDefault(require("./config/db"));
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), ".env.local") });
dotenv_1.default.config();
const PORT = process.env.PORT || 5000;
(async () => {
    try {
        await (0, db_1.default)();
        app_1.default.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    }
    catch (err) {
        console.error("❌ Startup failed:", err.message);
        process.exit(1);
    }
})();
