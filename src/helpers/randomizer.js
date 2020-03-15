module.exports = (choice) => {
  if (!Array.isArray(choice))
    throw new Error('Invalid type');

  /* Create random integer to indicate index */
  let i = Math.floor(
    Math.random() * (choice.length - 1)
  )

  return choice[i]
}
