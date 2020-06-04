const _ = require('lodash');

module.exports = {
    buildJsonConsumerConfiguration,
    buildJsonProducerConfiguration,
    sanitizeProperties
};

// This is a default topic naming convention which can be updated (see also application-kafka.yml.ejs)
const topicNamingFormat = (context, entity) => `queuing.${context.snakeCaseBaseName}.${_.snakeCase(entity)}`;

function buildJsonConsumerConfiguration(context, entity, enabled) {
    return {
        name: topicNamingFormat(context, entity),
        enabled,
        '[key.deserializer]': 'org.apache.kafka.common.serialization.StringDeserializer',
        '[value.deserializer]': `${context.packageName}.service.kafka.deserializer.${entity}Deserializer`,
        '[group.id]': `${context.dasherizedBaseName}`,
        '[auto.offset.reset]': `${context.autoOffsetResetPolicy}`
    };
}

function buildJsonProducerConfiguration(context, entity, enabled) {
    return {
        name: topicNamingFormat(context, entity),
        enabled,
        '[key.serializer]': 'org.apache.kafka.common.serialization.StringSerializer',
        '[value.serializer]': `${context.packageName}.service.kafka.serializer.${entity}Serializer`
    };
}
function sanitizeProperties(jsyamlGeneratedProperties) {
    // related to https://github.com/nodeca/js-yaml/issues/470
    const patternContainingSingleQuote = /^(\s.+)(:[ ]+)('((.+:)+.*)')$/gm;
    // related to https://github.com/nodeca/js-yaml/issues/478
    const patternNullGeneratedValue = /^(\s.+)(:)([ ]+null.*)$/gm;
    return jsyamlGeneratedProperties.replace(patternContainingSingleQuote, '$1$2$4').replace(patternNullGeneratedValue, '$1$2');
}
