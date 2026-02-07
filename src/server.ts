import app from "./app";

// Start the server
const bootstrap = () => {
    try {
        app.listen(4000, () => {
            console.log(`Server is running on http://localhost:4000`);
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error starting the server:", error.message);
        }
        console.log("An Unknown Error Occurred");
    }
};

bootstrap();
