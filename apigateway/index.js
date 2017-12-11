'use strict';

console.log('Loading function');
const AWS = require('aws-sdk');
const encrypted = process.env['tier'];
let decrypted;


function processEvent(event, context, callback) {
   const done = (err, res) => callback(null, {
        statusCode: err ? '400' : '200',
        body: err ? err.message : JSON.stringify(res),
        headers: {
            'Content-Type': 'application/json',
        },
    });
     switch (event.httpMethod) {
        case 'GET':
            done(null, {  'decrypted': decrypted});
            break;
        default:
            done(new Error(`Unsupported method "${event.httpMethod}"`));
    }
}


exports.handler = (event, context, callback) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));
    

   if (decrypted) {
        processEvent(event, context, callback);
    } else {
        // Decrypt code should run once and variables stored outside of the function
        // handler so that these are decrypted once per container
        const kms = new AWS.KMS();
        kms.decrypt({ CiphertextBlob: new Buffer(encrypted, 'base64') }, (err, data) => {
            if (err) {
                console.log('Decrypt error:', err);
                return callback(err);
            }
            decrypted = data.Plaintext.toString('ascii');
            processEvent(event, context, callback);
        });
    }


  
};
