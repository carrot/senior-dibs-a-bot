var path = require('path')
var Botkit = require('botkit')
var Store = require('jfs')
var NoLimit = require('nolimit')
var nolimit = new NoLimit({ filename: 'sirdibsabot'})

var controller = Botkit.slackbot({
  debug: false,
  json_file_store: new Store(require('path').resolve(__dirname,"./lib/data.json"))
})

// connect the bot to a stream of messages
controller.spawn({
  token: process.env.SLACK_TOKEN
}).startRTM()

controller.on('file_comment_added', checkStatus)

// reply to a direct message
controller.on('direct_message',function(bot,message) {
  if (message.user == 'Chris P OR Brian B') { // Chris P has the power
    if (message.text.toUpperCase().indexOf('RESET') > -1) {
      for (var key in nolimit) {
        nolimit.stash( {key: key, value: 0})
      }
    }
  } else {
    if (validateDibsability(message)) {
      bot.reply(message, 'You sure can dibs-a-bot. Dont forget you only get one. Once thats gone you must wait for the boss to give you the green light.')
    } else {
      bot.reply(message, 'Sorry you cant dibs-a-bot until the boss says so, and right now he says no.')
    }
  }
})

function validateDibsability (message) {
  return (!nolimit.fetch(message.user) || nolimit.fetch(message.user) === 0)
}

function checkStatus (bot, message) {
  if (message.comment.text.toUpperCase().indexOf('DIBS') > -1) {
    if (validateDibsability(message)) {
      nolimit.stash( {key: message.comment.user, value: 1})
      bot.reply(message, 'Break out the BLUE LABEL!!! @<'message.comment.user'> just won something of great value. You may need to hire private security to guard your treasure. I wish you the best.')
    } else {
      bot.reply(message, 'Sorry @<'message.comment.user'> you cant dibs-a-bot until the boss says so, and right now he says no.')
    }
  }
}
