/** @type {import('lint-staged').Configuration} */
export default {
    '*.{js,ts,md,json,yml,yaml}': [
        'prettier --write \"src/**/*\" --log-level warn',
    ],
    '*.ts': ['eslint \"{src,apps,libs}/**/*.ts\" --fix'],
};
