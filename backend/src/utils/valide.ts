import {port, str, cleanEnv} from "envalid"

export default cleanEnv(process.env, {
    PORT: port(),
    MONGODB_URI: str(),
    JWT_SECRET: str(),
    NODE_ENV: str(),
    CLOUDARY_CLOUD_NAME: str(),
    CLOUDARY_API_KEY: str(),
    CLOUDARY_API_SECRET: str(),
})