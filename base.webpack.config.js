const path = require("path");
const os = require("os");
const MiniCssExtract = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const DIR_PAGES = path.join(__dirname, "./src/pages/");
process.env.NODE_ENV = "development";
module.exports = {
    devtool: process.env.NODE_ENV === "development" ? "source-map" : undefined,
    entry: {
        "src/index": path.join(DIR_PAGES, "index.ts"),
        // "src/akaba": path.join(__dirname, "./src/akaba/index.ts"),
    },
    output: {
        path: path.join(__dirname, "./dist"),
        filename: "[name].js",
    },
    optimization: {
        minimize: process.env.NODE_ENV !== "development",
        minimizer: [
            new CssMinimizerPlugin(),
            new TerserPlugin({
                extractComments: false
            }),
        ],
    },
    module: {
        rules: [
            {
                test: /\.m?tsx?/,
                use: [
                    {
                        loader: "ts-loader",
                    }
                ],
            },
            {
                test: /\.scss$/,
                use: [
                    "style-loader",
                    {
                        loader: MiniCssExtract.loader,
                        options: {
                            esModule: false
                        }
                    },
                    "css-loader",
                    "postcss-loader",
                    "sass-loader",
                ],
            },
            {
                test: /\.html$/,
                use: [
                    "raw-loader",
                ],
            }
        ],
    },
    plugins: [
        new MiniCssExtract({
            filename: "[name].css",
        }),
        new CopyPlugin({
            patterns: [
                {
                    from: "static",
                    to: "."
                }
            ],
        }),
    ],
    target: "web",
    resolve: {
        extensions: [".ts", ".scss", ".less", ".es6", ".css", ".js"],
        alias: {
            "@": path.join(__dirname, "./src"),
        },
    },
    // watch: process.env.NODE_ENV === "development",
    devServer: {
        host: "0.0.0.0",
        port: "8083",
        hot: true,
        contentBase: path.join(__dirname, 'dist'),
        onListening: function(server) {
            const addressInfo = server.listeningApp.address();
            const port = addressInfo.port;
            const host = addressInfo.address;
            const protocol = "http";
            if (host === "0.0.0.0") {
                const networkInterfaces = os.networkInterfaces();
                const array2d = Array.from(Object.keys(networkInterfaces)).map((interfaceId) => {
                    const list = networkInterfaces[interfaceId];
                    return list.map((item) => {
                        return {
                            ...item,
                            interfaceId,
                        };
                    });
                });
                // console.log();
                let localIp;
                let netIp;
                array2d.flat().forEach((item) => {
                    if (
                        (item.family.toLowerCase() === "ipv4") &&
                        (item.netmask != "255.255.255.255")
                    ) {
                        if (item.internal) {
                            localIp = item.address;
                        } else {
                            netIp = item.address;
                        }
                    }
                });
                const CRLF = "\r\n";
                const text = `website run on:${CRLF}[local]: ${protocol}://${localIp}:${port}${CRLF}[network]: ${protocol}://${netIp}:${port}`;
                console.log(text);
                return ;
            }
            console.log(`website run ${protocol}://${host}:${port}`);
        }
    }
};
