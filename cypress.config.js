const { defineConfig } = require("cypress")

module.exports = defineConfig({
  e2e: {
      viewportHeight:720,
      viewportWidth:1280
  },
})
