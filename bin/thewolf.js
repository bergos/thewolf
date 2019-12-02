#!/usr/bin/env node

const { basename } = require('path')
const program = require('commander')
const wolf = require('..')

program.parse(process.argv)

async function main () {
  const errors = await wolf.analyze(program)

  for (const error of errors) {
    console.log(`${basename(error.path)}: ${error.message}`)
  }
}

main()
