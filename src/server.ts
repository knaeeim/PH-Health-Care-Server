import app from "./app";
import { envVars } from "./app/config/env";

// Start the server
const bootstrap = () => {
    try {
        app.listen(envVars.PORT, () => {
            console.log(`Server is running on http://localhost:${envVars.PORT}`);
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error starting the server:", error.message);
        }
        console.log("An Unknown Error Occurred");
    }
};

bootstrap();
