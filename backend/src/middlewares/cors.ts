import cors from "cors";

const corsMiddleware = cors({
	origin: true,
	credentials: true,
});

export default corsMiddleware;
