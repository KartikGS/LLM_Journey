export default {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'scope-enum': [
            2,
            'always',
            ['agent', 'api', 'docs', 'config', 'deps'],
        ],
        'scope-empty': [0],
    },
};
