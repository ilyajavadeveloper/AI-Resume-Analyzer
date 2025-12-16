import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
    route(
        "/.well-known/appspecific/com.chrome.devtools.json",
        "routes/devtools.ts"
    ),

    index("routes/home.tsx"),
    route("/auth", "routes/auth.tsx"),
    route("/upload", "routes/upload.tsx"),
    route("/resume/:id", "routes/resume.tsx"),
    route("/wipe", "routes/wipe.tsx"),
] satisfies RouteConfig;
