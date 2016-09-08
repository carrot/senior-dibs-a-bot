require('dotenv').config({silent: true})
var path = require('path')
var Botkit = require('botkit')
var Store = require('jfs')
var NoLimit = require('nolimit')
var nolimit = new NoLimit({ filename: 'sirdibsabot'})
var token = process.env.SLACK_TOKEN
var postChannel = process.env.MAIN_CHANNEL
var admin1 = process.env.ADMIN1
var admin2 = process.env.ADMIN2
var filename = process.env.FILENAME
var banned = process.env.BANNED_FOR_LIFE_1
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
  var beep = require('beepboop-botkit')
  console.log('Starting in Beep Boop multi-team mode')
  beep.start(controller, { debug: true })
}

// connect the bot to a stream of messages
controller.on('file_comment_added', checkStatus)

controller.on('direct_mention', function (bot, message) {
  handleDirectAction(bot, message)
})

// reply to a direct message
controller.on('direct_message', function (bot, message) {
  handleDirectAction(bot, message)
})

function checkStatus (bot, message, whatElse, more) {
  if (validateItemDibsability(message)) {
    if (message.comment.comment.toUpperCase().indexOf('DIBS') > -1) {
      if (validateUserDibsability(message)) {
        nolimit.stash({ key: message.file_id, value: 1 })
        nolimit.stash({ key: message.comment.user, value: 1 })
        sendMessage(bot, randomWinningPhrase(message))
      } else {
        sendMessage(bot, 'Sorry <@' + message.comment.user + '>, you cant dibs-a-bot until the boss says so, and right now he says no.')
      }
    }
  } else {
    sendMessage(bot, 'Sorry <@' + message.comment.user + '>, this item is claimed.')
  }
}

function randomWinningPhrase (message) {
  var phrases = [
    'Break out the BLUE LABEL!!! <@' + message.comment.user + '> is the winner.',
    'Congrats <@' + message.comment.user + '>, <@' + admin1 + '> doesn’t want something anymore and you\'re closer than a trash can.',
    'Hey Hey Hey <@' + message.comment.user + '>! Enjoy the trash that someone else didn\'t want.',
    'Well aren\'t you lucky <@' + message.comment.user + '>! You\'ve won a thing of semi-value.',
    'Whoa <@' + message.comment.user + '>! Thank you for slightly reducing the Fire Hazard around <@' + admin1 + '>'
  ]
  var index = Math.floor((Math.random() * 4) + 0)
  return phrases[index]
}

function sendMessage (bot, text) {
  bot.say({
    text: text,
    channel: postChannel
  })
}

function handleDirectAction (bot, message) {
  if (message.user == admin1 || message.user == admin2) {
    if (message.text.toUpperCase().indexOf('RESET') > -1) {
      nolimit = new NoLimit({ filename: filename})
      sendMessage(bot, 'All Dibsabilities have been reset.')
    }
  }
  if (validateUserDibsabilityDM (message)) {
    sendMessage(bot, '<@' + message.user + '>, you sure can dibs-a-bot. Dont forget you only get one. Once thats gone you must wait for the boss to give you the green light.')
  } else {
    sendMessage(bot, 'Sorry <@' + message.user + '>, you cant dibs-a-bot until the boss says so, and right now he says no.')
  }
}

function validateUserDibsability (message) {
  if (message.comment.user == banned) {
    codeNameHairyMother(message.comment.user)
  }
  return (!nolimit.fetch({ key: message.comment.user }) || nolimit.fetch({ key: message.comment.user }) === 0)
}

function codeNameHairyMother(user) {
  sendMessage(bot, 'LOL <@' + user + '>, aren\'t you leaving?? Why you wanna leave with our stuff too?? Not happening broham. You\'re finished in this town. No more dibsing for you ever ever ever ever ever again. Everytime you ask you will get the same response because i don\'t even have time to make other slick repsonses and reubbutles to your clever statements, you handsome little devil. Run along now, chop chop...')

}

function validateUserDibsabilityDM (message) {
  if (message.user == banned) {
    codeNameHairyMother(message.user)
  }
  return (!nolimit.fetch({ key: message.user }) || nolimit.fetch({ key: message.user }) === 0)
}

function validateItemDibsability (message) {
  return (!nolimit.fetch({ key: message.file_id }) || nolimit.fetch({ key: message.file_id }) === 0)
}
