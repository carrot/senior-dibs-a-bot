var path = require('path')
var Botkit = require('botkit')
var Store = require('jfs')
var NoLimit = require('nolimit')
var nolimit = new NoLimit({ filename: 'sirdibsabot'})
var token = process.env.SLACK_TOKEN
var postChannel = 'C0AAFTJNS'
var controller = Botkit.slackbot({
  retry: Infinity,
  debug: false
})

// Assume single team mode if we have a SLACK_TOKEN
if (token) {
  console.log('Starting in single-team mode')
  controller.spawn({
    token: token
  }).startRTM(function (err, bot, payload) {
    if (err) {
      throw new Error(err)
    }
    console.log('Connected to Slack RTM')
  })
// Otherwise assume multi-team mode - setup beep boop resourcer connection
} else {
  console.log('Starting in Beep Boop multi-team mode')
  beep.start(controller, { debug: true })
}

// connect the bot to a stream of messages
controller.on('file_comment_added', checkStatus)

// reply to a direct message
controller.on('direct_message', function (bot, message) {
  if (message.user == 'U09NPAG11' || message.user == 'U024H9QHP') {
    if (message.text.toUpperCase().indexOf('RESET') > -1) {
      nolimit = new NoLimit({ filename: 'sirdibsabot'})
      sendMessage(bot, 'All Disabilities have been reset.')
    }
  }
  if (validateUserDibsabilityDM(message)) {
    sendMessage(bot, '<@' + message.user + '>, You sure can dibs-a-bot. Dont forget you only get one. Once thats gone you must wait for the boss to give you the green light.')
  } else {
    sendMessage(bot, 'Sorry <@' + message.user + '> you cant dibs-a-bot until the boss says so, and right now he says no.')
  }
})

function checkStatus (bot, message, whatElse, more) {
  if (validateItemDibsability(message)) {
    if (message.comment.comment.toUpperCase().indexOf('DIBS') > -1) {
      if (validateUserDibsability(message)) {
        nolimit.stash({ key: message.file_id, value: 1 })
        nolimit.stash({ key: message.comment.user, value: 1 })
        sendMessage(bot, 'Break out the BLUE LABEL!!! <@' + message.comment.user + '> just won something of great value. You may need to hire private security to guard your treasure. I wish you the best.')
      } else {
        sendMessage(bot, 'Sorry <@' + message.comment.user + '>, you cant dibs-a-bot until the boss says so, and right now he says no.')
      }
    }
  } else {
    sendMessage(bot, 'Sorry <@' + message.comment.user + '>, this item is claimed.')
  }
}

function sendMessage (bot, text) {
  bot.say({
    text: message
    channel: postChannel
  })
}

function validateUserDibsability (message) {
  return (!nolimit.fetch({ key: message.comment.user }) || nolimit.fetch({ key: message.comment.user }) === 0)
}

function validateUserDibsabilityDM (message) {
  return (!nolimit.fetch({ key: message.user }) || nolimit.fetch({ key: message.user }) === 0)
}

function validateItemDibsability (message) {
  return (!nolimit.fetch({ key: message.file_id }) || nolimit.fetch({ key: message.file_id }) === 0)
}
