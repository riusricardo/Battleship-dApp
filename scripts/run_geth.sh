#!/bin/bash

rm -fR ./devNet/datadir/geth/chaindata/
geth --networkid=1337 --datadir=./devNet/datadir --password=./config/development/password --port=30303 --rpc --rpcport=8545 --rpcaddr=localhost  --rpccorsdomain="*" --nodiscover --maxpeers=0 --mine --shh --rpcapi=eth,web3,net,debug,shh  --dev --dev.period 1 --targetgaslimit=8000000
