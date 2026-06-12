// src/utils/guiltMessages.js
export const getGuiltMessage = (item, score) => {
  const messages = [
    `Really? You waited only ${score}% of your cool-down for "${item}"? 👀`,
    `Your future self is disappointed in you for buying "${item}" this fast.`,
    `"${item}" — you said you'd wait. Here we are. 💸`,
    `You broke the slow burn for "${item}". Was it worth it?`,
    `${score}% impulse score on "${item}". Your wallet is crying.`,
  ]

  return messages[Math.floor(Math.random() * messages.length)]
}