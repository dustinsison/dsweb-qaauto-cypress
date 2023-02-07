const { defineConfig } = require("cypress")

module.exports = defineConfig({
  projectId: "p47c77",
  e2e: {
      viewportHeight:720,
      viewportWidth:1280
  }
})
