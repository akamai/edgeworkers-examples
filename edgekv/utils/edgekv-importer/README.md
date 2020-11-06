# EdgeKV Importer
An utility to assist with importing data into EdgeKV

Currently supports:
* Importing data from a CSV file
* Initializing EdgeKV if not previously initialized
* Automatically creating EdgeKV namespace if it does not exist
* Generating an access token for the EdgeKV namespace

## Installation Instruction

### Pre-requisite
Please ensure you have satisfied the following pre-requisites:
* `npm` installed on your system.

### Install/Update the EdgeKV Utilities
The following command will install the edgekv-importer command to your system.

```shell
npm install -g
```

### Uninstall package
The following command will uninstall the edgekv-importer command from your system.

```shell
npm uninstall -g
```



## Command Syntax & Help
Make sure you have set up your virtual environment and execute the following from within the corresponding directory.
```shell
edgekv-importer help
```

## Usage examples

Common usage examples:

1. Import data from a CSV file into EdgeKV.  The csv file contains a header row, followed by one row for each item to store in EdgeKV.  The value in EdgeKV will be stored as a JSON object.  The key is defined in the `code` column, as specified by the `--key` option.  The `--namespace` and `--group` options specify that the data should be stored in the `ecom` namespace and the `promocodes` group.
    ```shell
    edgekv-importer --csv promo-codes.csv --key code  --namespace ecom --group promocodes --generateKey
    ```


    The [promo-codes.csv](promo-codes.csv) file contains the following data:

    code         | valid_from | valid_to   | minimum_purchase | discount_amount | discount_percent | description
    -------------|------------|------------|------------------|-----------------|------------------|-----------
    SAVE10PCT    | 1577836800 | 1893456000 | 0                | 0               | 10               | Save 10% on any purchase
    BUY100SAVE10 | 1577836800 | 1893456000 | 100              | 10              | 0                | Save $10 off a $100 purchase
    EXPIRED      | 1546300800 | 1577836800 | 100              | 10              | 0                | Example of an expired promo code
    NOTYETACTIVE | 1893456000 | 2208988800 | 100              | 10              | 0                | Example of a promo code which is not yet active

    As an example, the value stored in the key `SAVE10PERCENT` would be

    ```json
    {
      "code": "SAVE10PCT",
      "valid_from": 1577836800,
      "valid_to": 1893456000,
      "minimum_purchase": 0,
      "discount_amount": 0,
      "discount_percent": 10,
      "description": "Save 10% on any purchase"
    }
    ```

2. You can also generate an access token for use in an EdgeWorkers function by adding the `--generateToken` option

  ```shell
  edgekv-importer --csv promo-codes.csv --key code  --namespace ecom --group promocodes --generateToken
  ```
