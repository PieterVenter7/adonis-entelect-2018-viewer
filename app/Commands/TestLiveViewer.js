'use strict'

const { Command } = require('@adonisjs/ace')
const {promisify} = use("Helpers")
const fs = promisify('fs')

class TestLiveViewer extends Command {
  static get signature () {
    return 'test:live:viewer'
  }

  static get description () {
    return 'Tell something helpful about this command'
  }

  async handle (args, options) {
    
    this.info('Dummy implementation for test:live:viewer command')
  }
}

module.exports = TestLiveViewer
