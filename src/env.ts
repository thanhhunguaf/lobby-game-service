export default {
    PORT: process.env.PORT || 3007,
    DEBUG_PREFIX: 'lobby:',
    SERVICE_NAME: process.env.NAME || 'lobby.development',

    // Localhost configs ===================================
    RBMQ_PLATFORM_HOST: process.env.RBMQ_PLATFORM_HOST,
    RBMQ_PLATFORM_EXCHANGE: process.env.RBMQ_PLATFORM_EXCHANGE || 'service_exchange',
    RBMQ_PLATFORM_QUEUE: process.env.RBMQ_PLATFORM_QUEUE || 'service_queue',
    RBMQ_PLATFORM_ROUTER: process.env.RBMQ_PLATFORM_ROUTER || 'service',
    CAS_API_HOST: process.env.CAS_API_HOST,
    REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379/",
    MONGO_URI: '',
    MYSQL_HOST: process.env.MYSQL_HOST || 'localhost',
    MYSQL_PORT: process.env.MYSQL_PORT || '3306',
    MYSQL_USERNAME: process.env.MYSQL_USERNAME || 'root',
    MYSQL_PASSWORD: process.env.MYSQL_PASSWORD || '0123123',
    MYSQL_DBNAME: process.env.MYSQL_DBNAME,
    // ============================================================
};