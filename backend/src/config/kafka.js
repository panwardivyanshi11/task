const kafka = require('kafka-node');
const client = new kafka.KafkaClient({ kafkaHost: 'kafka:9092' });
const producer = new kafka.Producer(client);
const consumer = new kafka.Consumer(
  client,
  [{ topic: 'polls', partition: 0 }],
  { autoCommit: true }
);

module.exports = { producer, consumer };