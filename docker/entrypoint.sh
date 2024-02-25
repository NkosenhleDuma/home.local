#! /bin/bash

pwd
ls -la .

ts-node src/proxy.ts &

serve -s build &