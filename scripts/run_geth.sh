#!/bin/bash

rm -fR ./devNet/datadir/geth/
geth --networkid=1337 --datadir=./devNet/datadir --password=./config/development/password --port=30303 --rpc --rpcport=9545 --rpcaddr=localhost  --rpccorsdomain="*" --nodiscover --maxpeers=0 --ws --wsport=9546 --wsaddr=localhost --wsorigins="*" --mine --shh --rpcapi=eth,web3,net,debug,shh --wsapi=eth,web3,net,shh,debug --dev --dev.period 1 --targetgaslimit=8000000
