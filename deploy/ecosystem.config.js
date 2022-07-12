module.exports = {
    apps: [
        {
            name: "canvas-editor-proxy",
            script: "index.js",
            // exec_mode: "cluster",
            // instances: 2,
            ignore_watch: ["node_modules","error.log","info.log","log.log",".gitignore","package.json"],
            error_file: "error.log",
            log_file: "log.log",
            out_file: "info.log",
            time: true,
            watch: true,
            env: {
                "NODE_ENV": "production",
            }
        }
    ]
}