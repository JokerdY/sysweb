module.exports = {
    // 打包配置
    publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
    lintOnSave: false,
    productionSourceMap: false,
    css: {
        sourceMap: true
    },
    devServer: {
        port: 9994,
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:8081',
                // 允许跨域
                changeOrigin: true,
                ws: true,
                pathRewrite: {
                    '^/api': ''
                }
            }
        }
    }
}