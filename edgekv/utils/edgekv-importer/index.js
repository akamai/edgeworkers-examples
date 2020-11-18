#!/usr/bin/env node

const os = require('os');
const path = require('path');
const fs = require('fs')

const Bottleneck = require('bottleneck')
const csv = require('csv-parser')
const yargs = require('yargs/yargs');

const EdgeGrid = require('edgegrid');

//minimum deleay in milliseconds between upsert calls.
//this delay avoids exceeding the API quota
const MIN_UPSERT_DELAY = 75;

//console.log( "Hello!" );

function sendEdgeGrid (edgeGrid, method, endpoint, qs, bodyData) {
  return new Promise((resolve, reject) => {
    edgeGrid.auth({
      path: endpoint,
      method: method,
      headers: {"Content-Type": "application/json"},
      qs: qs,
      body: bodyData
    }).send(function(error, response, body) {
      if (error) {
        reject({
          error:error,
          response: response,
          body: body
        })
      } else {
        resolve (response)
      }
    })
  });
}

async function initEdgeKv(edgeGrid, parameters) {
  console.log('Checking EdgeKV initialization status.');
  let response = await sendEdgeGrid(edgeGrid, 'GET', '/edgekv/v1/initialize', parameters)
  //console.log(response);
  if (response.statusCode == 200){
    console.log('EdgeKV previously initialized on account.');
  } else if (response.statusCode == 404) {
    console.log('EdgeKV not initialized on account.  Initializing.');
    initResponse = await sendEdgeGrid(edgeGrid, 'PUT', '/edgekv/v1/initialize', parameters)
    //console.log(initResponse);
  } else {
    throw new Error (`Unexpected status code: ${response.statusCode}: ${response.body}`, response);
  }

}

async function createKvNamespaceInEnvironment(environment, edgeGrid, namespace, parameters) {
  console.log(`Checking status of EdgeKV namespace ${namespace} on ${environment} environment.`);
  let response = await sendEdgeGrid(edgeGrid, 'GET', `/edgekv/v1/networks/${environment}/namespaces/${namespace}`, parameters)
  //console.log(response);
  if (response.statusCode == 200){
    console.log(`Namespace ${namespace} previously created on ${environment} environment.`);
  }else if (response.statusCode == 404) {
    console.log(`EdgeKV namespace not previously created on ${environment} environment.  Creating.`);
    createResponse = await sendEdgeGrid(edgeGrid, 'POST', `/edgekv/v1/networks/${environment}/namespaces`, parameters, {name:namespace})
    //console.log(createResponse);
  } else {
    throw new Error (`Unexpected status code: ${response.statusCode}: ${response.body}`, response);
  }
}

async function createKvNamespace(edgeGrid, namespace, parameters) {
  staging = createKvNamespaceInEnvironment("staging", edgeGrid, namespace, parameters)
  production = createKvNamespaceInEnvironment("production", edgeGrid, namespace, parameters)
  await Promise.all([staging, production]);
}

async function generateKvAccessToken(edgeGrid, namespace, parameters) {
  let randomToken = Math.floor(Math.random() * 2**32).toString(16);
  let tokenName = `kvtoken-${namespace}-${randomToken}`;
  let tokenExpiry = new Date(Date.now()+ 24*30*6*60*60*1000).toISOString();

  tokenRequestBody = {
    name: tokenName,
    "allow_on_production": true,
    "allow_on_staging": true,
    expiry: `${tokenExpiry}`,
    "namespace_permissions": {}
  };
  tokenRequestBody["namespace_permissions"][namespace] = ["r", "w", "d"];

  let response = await sendEdgeGrid(
    edgeGrid, 'POST', `/edgekv/v1/tokens`,
    parameters,
    tokenRequestBody
  )
  //console.log(response);
  let token = JSON.parse(response.body);
  console.log("Generated EdgeKV access token.");
  console.log(token);
  return token;
}

async function upsertDataInEnvironment(upsertLimiter, csvFile, keyField, edgeGrid, network, namespace, group, parameters) {
  let upsertList = [];

  var csvPromise = new Promise(function(resolve, reject) {
    fs.createReadStream(csvFile)
      .pipe(csv())
      .on('data', (data) => {
      //console.log(data);
      uploader = async () => {
        let key = data[keyField];
        console.log(`Upserting data to ${network} with key: ${key}`);
        let response = await sendEdgeGrid(
          edgeGrid, 'PUT', `/edgekv/v1/networks/${network}/namespaces/${namespace}/groups/${group}/items/${key}`,
          parameters,
          data
        );
        //console.log(response);
        if (response.statusCode == 200){
          console.log(`Successfully upserted data to ${network} with key: ${key}`);
        } else {
          throw new Error (`Failed to upsert data to ${network} with key: ${key}.  Unexpected status code: ${response.statusCode}: ${response.body}`, response);
        }
      };
      upsertList.push(upsertLimiter.schedule(uploader));
    })
    .on('end', () => {
      resolve();
    })
    .on('error', (error) => {
      reject(error);
    });
  });
  await csvPromise

  await Promise.all(upsertList);
  console.log(`Userted ${upsertList.length} records`);
}

async function upsertData(csvFile, keyField, edgeGrid, namespace, group, parameters) {
  const upsertLimiter = new Bottleneck({minTime: MIN_UPSERT_DELAY});
  await upsertDataInEnvironment(upsertLimiter, csvFile, keyField, edgeGrid, "staging", namespace, group, parameters);
  await upsertDataInEnvironment(upsertLimiter, csvFile, keyField, edgeGrid, "production", namespace, group, parameters)
}

async function main() {
  const argv = yargs(process.argv.slice(2))
    .usage('Usage: $0 --csv <csvfile> --key <keycolumn>  --namespace <kvnamespace> --group <kvgroup>')
    .option('namespace', {
        description: 'EdgeKV namespace where data should be stored. This namespace will be created if it does not exist',
    })
    .option('group', {
        description: 'EdgeKV group where data should be stored.',
    })
    .option('csv', {
        description: 'CSV file with data.  The first row must be a header column',
    })
    .option('key', {
        description: 'Name of field to use for KV keys.  The name should match a value in the header row of the CSV file.'
    })
    .option('generateToken', {
        description: 'If this option is specified, a KV access token will be generated',
        type: 'boolean'
    })
    .option('account-key', {
        description: 'Account Switch Key'
    })
    .option('edgerc', {
        description: 'Path to edgerc file',
        default: path.join(os.homedir(), '.edgerc')
    })
    .option('section', {
          description: 'Section of edgerc file',
          default: 'default'
    })
    .demandOption(['namespace', 'group', 'csv', 'key'])
    .help()
    .alias('help', 'h')
    .argv;

  apiParameters = {}
  if (argv['account-key']) {
    apiParameters.accountSwitchKey = argv['account-key']
  }

  var eg = new EdgeGrid({
    path: argv.edgerc,
    section: argv.section
  });

  await initEdgeKv(eg, apiParameters);
  await createKvNamespace(eg, argv.namespace, apiParameters)

  await upsertData(argv.csv, argv.key, eg, argv.namespace, argv.group, apiParameters);

  if (argv.generateToken) {
    kvAccessToken = await generateKvAccessToken(eg, argv.namespace, apiParameters);
  }

}


main();
